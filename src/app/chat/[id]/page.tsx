'use client';

import { useUser } from '@auth0/nextjs-auth0';
import { useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc';
import ChatBubble from '../../../../components/ChatBubble';
import ChatInput from '../../../../components/ChatInput';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';
import { use } from 'react';

export default function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user, isLoading: isUserLoading } = useUser();
  const router = useRouter();
  
  const { data: messages, isLoading } = trpc.messages.list.useQuery(
    { conversationId: id },
    { enabled: !!user }
  );

  const { data: conversation } = trpc.conversations.get.useQuery(
    { id },
    { enabled: !!user }
  );

  if (isUserLoading || isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="alert alert-info" role="alert">
          Please log in to access chats.
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 d-flex flex-column position-relative bg-body-tertiary" style={{ background: 'linear-gradient(120deg, #343541 0%, #444654 100%)', minHeight: '100vh' }}>
      <nav className="navbar navbar-light bg-white border-bottom shadow-sm" style={{ position: 'sticky', top: 0, zIndex: 1030 }}>
        <div className="container">
          <div className="d-flex justify-content-between align-items-center w-100">
            <button
              onClick={() => router.push('/chat')}
              className="btn btn-link text-decoration-none text-dark p-0"
            >
              <ArrowLeftIcon style={{ width: '1.25rem', height: '1.25rem' }} className="me-2" />
              Back
            </button>
            <h1 className="h5 mb-0 fw-bold">{conversation?.title || 'Chat'}</h1>
            <div style={{ width: '5rem' }} />
          </div>
        </div>
      </nav>
      <div className="flex-grow-1 overflow-auto w-100" style={{ paddingTop: 72, paddingBottom: 96 }}>
        <div className="d-flex flex-column gap-2 align-items-center px-2" style={{ maxWidth: 700, margin: '0 auto' }}>
          {messages?.map((message) => (
            <ChatBubble key={message.id} message={message} />
          ))}
        </div>
      </div>
      <ChatInput conversationId={id} />
    </div>
  );
}