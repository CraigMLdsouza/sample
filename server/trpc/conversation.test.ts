import { appRouter } from './router';

describe('createConversation tRPC procedure', () => {
  it('creates and returns a new conversation', async () => {
    const mockInsert = jest.fn().mockReturnValue({ data: { id: '123', user_id: 'u1', title: 'Test Chat' }, error: null });
    const mockSupabase = { from: jest.fn(() => ({ insert: mockInsert, select: () => ({ single: () => ({ data: { id: '123', user_id: 'u1', title: 'Test Chat' }, error: null }) }) })) };
    const caller = appRouter.createCaller({ supabase: mockSupabase, session: { user: { sub: 'u1', email: 'test@test.com' } } });
    const result = await caller.createConversation({ userId: 'u1', title: 'Test Chat' });
    expect(result).toEqual({ id: '123', user_id: 'u1', title: 'Test Chat' });
    expect(mockSupabase.from).toHaveBeenCalledWith('conversations');
  });
}); 