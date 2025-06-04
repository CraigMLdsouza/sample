import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { supabase } from '../../lib/supabase';
import { geminiText, geminiImage } from '../../lib/gemini';
import { isImagePrompt } from '../../lib/utils';

const t = initTRPC.create();

export const appRouter = t.router({
  getConversations: t.procedure.input(z.object({ userId: z.string() })).query(async ({ input }) => {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', input.userId)
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data;
  }),
  getMessages: t.procedure.input(z.object({ conversationId: z.string() })).query(async ({ input }) => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', input.conversationId)
      .order('created_at', { ascending: true });
    if (error) throw new Error(error.message);
    return data;
  }),
  sendMessage: t.procedure.input(z.object({
    conversationId: z.string(),
    sender: z.enum(['user', 'ai']),
    text: z.string().nullable(),
    imageUrl: z.string().nullable(),
  })).mutation(async ({ input }) => {
    const { data, error } = await supabase
      .from('messages')
      .insert([{
        conversation_id: input.conversationId,
        sender: input.sender,
        text: input.text,
        image_url: input.imageUrl,
      }])
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }),
  sendToGeminiText: t.procedure.input(z.object({ prompt: z.string() })).mutation(async ({ input }) => {
    const data = await geminiText(input.prompt);
    return data;
  }),
  sendToGeminiImage: t.procedure.input(z.object({ prompt: z.string() })).mutation(async ({ input }) => {
    const data = await geminiImage(input.prompt);
    return data;
  }),
  createConversation: t.procedure.input(z.object({ userId: z.string(), title: z.string().optional() })).mutation(async ({ input }) => {
    const { data, error } = await supabase
      .from('conversations')
      .insert([{ user_id: input.userId, title: input.title || 'New Chat' }])
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }),
});

export type AppRouter = typeof appRouter; 