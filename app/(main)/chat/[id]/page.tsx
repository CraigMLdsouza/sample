import { useUser } from '@auth0/nextjs-auth0/client';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { trpc } from '../../../../lib/trpc';
import Header from '../../../../components/Header';
import ChatBubble from '../../../../components/ChatBubble';
import ChatInput from '../../../../components/ChatInput';

export default function ChatPage() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const { id } = useParams();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { data: messages, isLoading: isMessagesLoading, error } = trpc.getMessages.useQuery({ conversationId: id as string }, { enabled: !!id });

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/api/auth/login');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (isLoading || isMessagesLoading) return <div className="vh-100 d-flex align-items-center justify-content-center"><div className="spinner-border" role="status" /></div>;
  if (error) return <div className="alert alert-danger">Failed to load messages.</div>;

  return (
    <div className="d-flex flex-column vh-100 bg-light">
      <Header />
      <div className="flex-grow-1 overflow-auto px-2 py-3" style={{ marginBottom: 80 }}>
        {messages?.map((msg: any) => (
          <ChatBubble key={msg.id} message={msg} userId={user?.sub} />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="fixed-bottom bg-white p-2 shadow-lg" style={{ zIndex: 100 }}>
        <ChatInput conversationId={id as string} />
      </div>
    </div>
  );
} 