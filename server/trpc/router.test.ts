import { appRouter } from './router';

jest.mock('../../src/lib/gemini', () => ({
  geminiText: jest.fn(async (prompt) => ({ candidates: [{ content: { parts: [{ text: `Echo: ${prompt}` }] } }] })),
}));

const mockSupabase = {
  supabaseUrl: 'test',
  supabaseKey: 'test',
  from: jest.fn(),
  auth: {},
  // Add minimal required props
  rest: {},
  realtime: {},
  storage: {},
  functions: {},
  // Add missing required properties
  realtimeUrl: 'test',
  authUrl: 'test',
  storageUrl: 'test',
  functionsUrl: 'test'
};

describe('sendToGeminiText tRPC procedure', () => {
  it('returns Gemini text response', async () => {
    const caller = appRouter.createCaller({
      supabase: mockSupabase,
      userUuid: 'test',
      session: { user: { sub: 'test', email: 'test@test.com' } }
    });
    const result = await caller.sendToGeminiText({ prompt: 'hello world' });
    expect(result.candidates[0].content.parts[0].text).toBe('Echo: hello world');
  });

  it('handles Gemini API errors', async () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { geminiText } = require('../../src/lib/gemini');
    geminiText.mockImplementationOnce(() => { throw new Error('Gemini error'); });
    const caller = appRouter.createCaller({ 
      supabase: mockSupabase,
      userUuid: 'test',
      session: { user: { sub: 'test', email: 'test@test.com' } }
    });
    await expect(caller.sendToGeminiText({ prompt: 'fail' })).rejects.toThrow('Gemini error');
  });
});