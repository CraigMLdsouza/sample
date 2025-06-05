import { initTRPC, TRPCError } from '@trpc/server';
import { z } from 'zod';
import type { Context } from './context';
import { createConversation, updateConversation, upsertMessage, getConversations, getMessages, deleteConversation } from '../../src/lib/supabase';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { isImagePrompt } from '../../src/lib/utils'; // Assuming this utility correctly identifies image prompts

// Custom replacer function to handle circular references for logging/serialization
function safeStringify(obj: unknown) {
  const cache = new Set();
  return JSON.stringify(obj, (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (cache.has(value)) {
        // Circular reference found, return a placeholder
        return '[Circular]';
      }
      cache.add(value);
    }
    return value;
  });
}

const t = initTRPC.context<Context>().create({
  transformer: {
    serialize: (data) => safeStringify(data),
    deserialize: (data) => JSON.parse(data),
  },
});

const isAuthed = t.middleware(async ({ ctx, next }) => {
  console.log('TRPC middleware ctx:', safeStringify(ctx));
  if (!ctx || !ctx.userUuid) {
    console.warn('TRPC Unauthorized: ctx or ctx.userUuid missing', ctx);
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource',
    });
  }

  return next({
    ctx: {
      ...ctx,
      userUuid: ctx.userUuid,
    },
  });
});

const protectedProcedure = t.procedure.use(isAuthed);

// Centralized error handling for Supabase
export function handleSupabaseError(error: unknown): never {
  console.error('Handling Supabase Error:', error);
  let trpcCode: TRPCError['code'] = 'INTERNAL_SERVER_ERROR';
  let message = 'A database error occurred.';

  if (typeof error === 'object' && error !== null && 'code' in error) {
    const err = error as { code: string; message?: string };
    switch (err.code) {
      case '23505': // Unique violation
        trpcCode = 'CONFLICT';
        message = err.message || 'Duplicate entry.';
        break;
      case '23503': // Foreign key violation
        trpcCode = 'BAD_REQUEST';
        message = err.message || 'Related record not found.';
        break;
      default:
        message = err.message || message;
    }
  } else if (error instanceof Error) {
    message = error.message;
  }

  throw new TRPCError({
    code: trpcCode,
    message,
  });
}

// Initialize Gemini client
const geminiApiKey = process.env.GEMINI_API_KEY;
const GEMINI_IMAGE_GENERATION_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent';

if (!geminiApiKey) {
  throw new Error('Missing GEMINI_API_KEY environment variable.');
}
const genAI = new GoogleGenerativeAI(geminiApiKey);

// Choose models for text and image generation
const textModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
// We will use fetch for image generation to ensure correct response_modalities
// const imageModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash-preview-image-generation" });

const conversationRouter = t.router({
  list: protectedProcedure.query(async ({ ctx }) => {
    try {
      const result = await getConversations(ctx.userUuid);
      console.log('conversationRouter.list result:', result);
      return result;
    } catch (error: unknown) {
      console.error('conversationRouter.list error:', error);
      handleSupabaseError(error);
    }
  }),

  get: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      try {
        const { data, error } = await ctx.supabase
          .from('conversations')
          .select('*')
          .eq('id', input.id)
          .single();

        if (error) throw error;
        if (!data) throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Conversation not found'
        });

        if (data.user_id !== ctx.userUuid) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You do not have access to this conversation'
          });
        }

        return data;
      } catch (error: unknown) {
        console.error('conversationRouter.get error:', error);
        handleSupabaseError(error);
      }
    }),

  create: protectedProcedure
    .input(z.object({
      title: z.string().min(1).max(100).optional()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const result = await createConversation(ctx.userUuid, input.title);
        console.log('conversationRouter.create result:', result);
        return result;
      } catch (error: unknown) {
        console.error('Error during conversation creation mutation.');
        console.error(error instanceof Error ? error.message : 'An unknown error occurred.');
        handleSupabaseError(error);
      }
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      title: z.string().min(1).max(100)
    }))
    .mutation(async ({ input }) => {
      try {
        const result = await updateConversation(input.id, { title: input.title });
        return result;
      } catch (error: unknown) {
        handleSupabaseError(error);
      }
    }),

  delete: protectedProcedure
    .input(z.object({
      id: z.string().uuid()
    }))
    .mutation(async ({ input }) => {
      try {
        await deleteConversation(input.id);
        return { success: true };
      } catch (error: unknown) {
        handleSupabaseError(error);
      }
    }),
});

const messagesRouter = t.router({
  list: protectedProcedure
    .input(z.object({
      conversationId: z.string().refine(
        (val) => val === 'default' || /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val),
        { message: 'Invalid conversation ID format' }
      )
    }))
    .query(async ({ ctx, input }) => {
      console.log('TRPC messages.list called with input:', input);
      try {
        let targetConversationId = input.conversationId;

        // If it's the default conversation, try to find the most recent conversation for the user
        if (input.conversationId === 'default') {
          const conversations = await getConversations(ctx.userUuid);
          if (conversations && conversations.length > 0) {
            // Assuming getConversations returns them ordered by last updated or creation
            targetConversationId = conversations[0].id;
          } else {
            return [];
          }
        }

        const result = await getMessages(targetConversationId);
        console.log('messagesRouter.list result:', result);
        return result;
      } catch (error: unknown) {
        console.error('TRPC messages.list error:', error);
        handleSupabaseError(error);
      }
    }),

  // This `create` mutation is for saving messages to the DB, not generating them
  create: protectedProcedure
    .input(z.object({
      conversationId: z.string().refine(
        (val) => val === 'default' || /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val),
        { message: 'Invalid conversation ID format' }
      ),
      sender: z.enum(['user', 'ai']),
      text: z.string().nullable(),
      imageUrl: z.string().url().nullable(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // If it's the default conversation, create a new one first
        let conversationId = input.conversationId;
        if (conversationId === 'default') {
          const conversation = await createConversation(ctx.userUuid, 'New Chat');
          conversationId = conversation.id;
        }

        const result = await upsertMessage({
          conversation_id: conversationId,
          sender: input.sender,
          text: input.text,
          image_url: input.imageUrl,
        });
        console.log('messagesRouter.create result:', result);
        return result;
      } catch (error: unknown) {
        console.error('messagesRouter.create error:', error);
        handleSupabaseError(error);
      }
    }),

  listAllForUser: protectedProcedure
    .query(async ({ ctx }) => {
      console.log('TRPC messages.listAllForUser called');
      try {
        const conversations = await getConversations(ctx.userUuid);
        if (!conversations || conversations.length === 0) {
          return [];
        }

        const messagesPromises = conversations.map(conv => getMessages(conv.id));
        const allMessagesArrays = await Promise.all(messagesPromises);

        const allMessages = allMessagesArrays.flat();
        allMessages.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

        console.log('messagesRouter.listAllForUser result:', allMessages.length, 'messages');
        return allMessages;
      } catch (error: unknown) {
        console.error('TRPC messages.listAllForUser error:', error);
        handleSupabaseError(error);
      }
    }),

  generateResponse: protectedProcedure
    .input(z.object({
      conversationId: z.string().refine(
        (val) => val === 'default' || /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val),
        { message: 'Invalid conversation ID format' }
      ),
      messageText: z.string(),
    }))
    .mutation(async ({ input }) => {
      console.log('TRPC messages.generateResponse called with input:', input);
      try {
        const messages = await getMessages(input.conversationId);
        const prompt = input.messageText;

        let responseText: string = '';
        let imageUrl: string | null = null;

        if (isImagePrompt(prompt)) {
          try {
            console.log('Attempting to generate image for prompt:', prompt);

            // Use fetch for image generation to explicitly set response_modalities
            const payload = {
              contents: [{ role: "user", parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 0.9,
                topK: 32,
                topP: 1,
                maxOutputTokens: 1024,
                response_modalities: ["IMAGE", "TEXT"],
              }
            };

            const res = await fetch(`${GEMINI_IMAGE_GENERATION_URL}?key=${geminiApiKey}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            });

            const responseData = await res.json();
            console.log('Raw Gemini image API response:', JSON.stringify(responseData, null, 2));

            if (!res.ok) {
              throw new Error(`Gemini image generation error: ${responseData.error?.message || res.statusText}`);
            }

            // Process the response to extract text and image URL
            const parts = responseData.candidates?.[0]?.content?.parts || [];
            for (const part of parts) {
              if (part.inlineData && part.inlineData.data) {
                imageUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
                console.log('Found image data in part.inlineData');
              }
              // Prioritize text if present, but still get the image
              if (part.text && !responseText) {
                responseText = part.text;
              }
            }

            if (!imageUrl) {
              responseText = responseText || 'I attempted to generate an image, but no image data was returned. Please try again with a different prompt.';
            } else {
               // If there's an image, prepend a default message if no text was returned
               responseText = responseText || 'Here is your generated image:';
            }

          } catch (error) {
            console.error('Detailed image generation error:', error);
            let errorMessage = 'An unknown error occurred during image generation.';
            if (error instanceof Error) {
              errorMessage = error.message;
              console.error('Error message:', error.message);
              console.error('Error stack:', error.stack);
            }

            if (errorMessage.includes('Insufficient tokens') || errorMessage.includes('paid API key')) {
              responseText = 'I apologize, but image generation is currently not available due to API quota limits or it requires a paid API key. You can still chat with me about other topics!';
            } else if (errorMessage.includes('safety')) {
              responseText = `I couldn't generate an image for that request due to safety concerns. Please try a different prompt.`;
            } else {
              responseText = `Sorry, I encountered an error while generating the image: ${errorMessage}`;
            }
            imageUrl = null;
          }
        } else {
          // Generate text response from Gemini
          const result = await textModel.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 1024,
            }
          });
          const response = result.response;
          responseText = response.text();
        }

        // Save AI response to database
        const aiMessage = await upsertMessage({
          conversation_id: input.conversationId,
          sender: 'ai',
          text: responseText,
          image_url: imageUrl,
        });

        // If this is the first message in the conversation, update the title
        if (messages.length === 0) {
          const title = prompt.length > 30 ? prompt.substring(0, 30) + '...' : prompt;
          await updateConversation(input.conversationId, { title });
        }

        return aiMessage;
      } catch (error: unknown) {
        console.error('TRPC messages.generateResponse error:', error);
        handleSupabaseError(error);
      }
    }),
});

export const appRouter = t.router({
  conversations: conversationRouter,
  messages: messagesRouter,
});

export type AppRouter = typeof appRouter;