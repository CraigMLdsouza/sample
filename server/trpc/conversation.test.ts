import { appRouter } from './router';

describe('createConversation tRPC procedure', () => {
  it('creates and returns a new conversation', async () => {
    const mockSupabase = {
      supabaseUrl: 'test',
      supabaseKey: 'test',
      from: jest.fn(() => ({
        insert: jest.fn().mockReturnValue({
          data: { id: '123', user_id: 'u1', title: 'Test Chat' },
          error: null,
          select: () => ({
            single: () => ({
              data: { id: '123', user_id: 'u1', title: 'Test Chat' },
              error: null
            })
          })
        })
      })),
      auth: {},
      rest: {},
      realtime: {},
      storage: {},
      functions: {}
    };

    const caller = appRouter.createCaller({ 
      supabase: mockSupabase,
      userUuid: 'u1',
      session: { user: { sub: 'u1', email: 'test@test.com' } }
    });

    const result = await caller.conversations.create({ title: 'Test Chat' });
    expect(result).toEqual({ id: '123', user_id: 'u1', title: 'Test Chat' });
  });
});