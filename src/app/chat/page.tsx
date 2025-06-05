"use client";

import { useUser } from '@auth0/nextjs-auth0';
import { useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc';
import { PlusIcon } from '@heroicons/react/24/solid';

export default function ChatListPage() {
  const { user, isLoading: isUserLoading } = useUser();
  const router = useRouter();
  
  const { data: conversations, isLoading } = trpc.conversations.list.useQuery(
    undefined,
    { enabled: !!user }
  );

  const createConversation = trpc.conversations.create.useMutation({
    onSuccess: (newConversation) => {
      router.push(`/chat/${newConversation.id}`);
    },
  });

  if (isUserLoading || isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    return <div className="flex items-center justify-center min-h-screen">Please log in to access chats.</div>;
  }

  return (
    <div className="min-vh-100 d-flex flex-column align-items-center bg-body-tertiary" style={{ background: 'linear-gradient(120deg, #343541 0%, #444654 100%)', minHeight: '100vh' }}>
      <div className="w-100" style={{ maxWidth: 480, marginTop: 80 }}>
        <div className="d-flex justify-content-between align-items-center mb-4 px-2 px-md-0">
          <h1 className="h4 fw-bold mb-0 text-white">Your Conversations</h1>
          <button
            onClick={() => createConversation.mutate({ title: 'New Chat' })}
            className="btn btn-primary d-flex align-items-center gap-2 shadow-sm rounded-pill"
            style={{ background: 'linear-gradient(90deg, #7c3aed 0%, #4f8cff 100%)', border: 'none', fontWeight: 600 }}
          >
            <PlusIcon className="" style={{ width: 20, height: 20 }} />
            New Chat
          </button>
        </div>
        <div className="bg-white bg-opacity-10 rounded-4 shadow-lg p-0 border-0" style={{ backdropFilter: 'blur(2px)' }}>
          <div className="list-group list-group-flush rounded-4 overflow-hidden">
            {conversations?.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => router.push(`/chat/${conversation.id}`)}
                className="list-group-item list-group-item-action d-flex flex-column align-items-start gap-1 py-3 px-4 border-0 border-bottom bg-transparent text-white"
                style={{ borderRadius: 0, fontWeight: 500 }}
              >
                <span className="fw-semibold">{conversation.title}</span>
                <span className="text-muted small">Last updated: {new Date(conversation.created_at).toLocaleString()}</span>
              </button>
            ))}
            {conversations?.length === 0 && (
              <div className="text-center text-muted py-5">No conversations yet. Start a new chat!</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}