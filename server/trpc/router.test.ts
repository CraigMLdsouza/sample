import { appRouter } from './router';

jest.mock('../../lib/gemini', () => ({
  geminiText: jest.fn(async (prompt) => ({ candidates: [{ content: { parts: [{ text: `Echo: ${prompt}` }] } }] })),
}));

describe('sendToGeminiText tRPC procedure', () => {
  it('returns Gemini text response', async () => {
    const caller = appRouter.createCaller({ supabase: {}, session: { user: { sub: 'test', email: 'test@test.com' } } });
    const result = await caller.sendToGeminiText({ prompt: 'hello world' });
    expect(result.candidates[0].content.parts[0].text).toBe('Echo: hello world');
  });

  it('handles Gemini API errors', async () => {
    const { geminiText } = require('../../lib/gemini');
    geminiText.mockImplementationOnce(() => { throw new Error('Gemini error'); });
    const caller = appRouter.createCaller({ supabase: {}, session: { user: { sub: 'test', email: 'test@test.com' } } });
    await expect(caller.sendToGeminiText({ prompt: 'fail' })).rejects.toThrow('Gemini error');
  });
}); 