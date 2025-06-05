const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_TEXT_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
const GEMINI_IMAGE_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent';
const GEMINI_IMAGE_GENERATION_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent';

// --- Gemini 2.0 image generation: robust response parsing and unified interface ---

// Unified Gemini response part type (handles both inlineData and inline_data)
export interface GeminiResponsePart {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string;
  };
  inline_data?: {
    mimeType: string;
    data: string;
  };
}

export interface GeminiApiResponse {
  candidates: Array<{
    content: {
      parts: GeminiResponsePart[];
    };
  }>;
}

// Process Gemini API response: extract text and images (handles both inlineData and inline_data)
export function processGeminiResponse(response: GeminiApiResponse): { type: 'text' | 'image'; content: string }[] {
  const chatMessages: { type: 'text' | 'image'; content: string }[] = [];
  if (response.candidates && response.candidates.length > 0) {
    const candidate = response.candidates[0];
    if (candidate.content && candidate.content.parts) {
      for (const part of candidate.content.parts) {
        if (part.text) {
          chatMessages.push({ type: 'text', content: part.text });
        } else if (part.inlineData) {
          const mimeType = part.inlineData.mimeType || 'image/png';
          const base64Data = part.inlineData.data;
          const imageDataUrl = `data:${mimeType};base64,${base64Data}`;
          chatMessages.push({ type: 'image', content: imageDataUrl });
        } else if (part.inline_data) {
          const mimeType = part.inline_data.mimeType || 'image/png';
          const base64Data = part.inline_data.data;
          const imageDataUrl = `data:${mimeType};base64,${base64Data}`;
          chatMessages.push({ type: 'image', content: imageDataUrl });
        }
      }
    }
  }
  return chatMessages;
}

// --- Gemini API calls ---

export async function geminiText(prompt: string): Promise<GeminiApiResponse> {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured');
  }
  const res = await fetch(`${GEMINI_TEXT_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(`Gemini text API error: ${error.error?.message || res.statusText}`);
  }
  return res.json();
}

export async function geminiImage(prompt: string): Promise<GeminiApiResponse> {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured');
  }
  const res = await fetch(`${GEMINI_IMAGE_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(`Gemini image API error: ${error.error?.message || res.statusText}`);
  }
  return res.json();
}

// Gemini 2.0 image generation (flash-preview-image-generation model)
export async function generateImage(prompt: string): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured');
  }
  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      response_modalities: ["TEXT", "IMAGE"]
    }
  };
  const res = await fetch(`${GEMINI_IMAGE_GENERATION_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const responseData = await res.json();
  if (!res.ok) {
    throw new Error(`Gemini image generation error: ${responseData.error?.message || res.statusText}`);
  }
  // Find the first image in the response (handle both inlineData and inline_data)
  const parts = responseData.candidates?.[0]?.content?.parts || [];
  for (const part of parts) {
    if (part.inlineData && part.inlineData.data) {
      return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
    }
    if (part.inline_data && part.inline_data.data) {
      return `data:${part.inline_data.mimeType || 'image/png'};base64,${part.inline_data.data}`;
    }
  }
  throw new Error('No image data in Gemini response');
}