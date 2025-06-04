'use client';
import { useUser } from '@auth0/nextjs-auth0';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { trpc } from '../../../lib/trpc';
import NewChatButton from '../../../components/NewChatButton';

export default function ConversationsPage() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const userId = user?.sub ?? '';
  const { data, isLoading: isConvosLoading } = trpc.getConversations.useQuery({ userId }, { enabled: !!userId });
  const createConversation = trpc.createConversation.useMutation();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/api/auth/login');
    }
  }, [user, isLoading, router]);

  const handleNewChat = async () => {
    if (!userId) return;
    const convo = await createConversation.mutateAsync({ userId });
    if (convo?.id) {
      router.push(`/chat/${convo.id}`);
    }
  };

  if (isLoading || isConvosLoading) return <div className="vh-100 d-flex align-items-center justify-content-center"><div className="spinner-border" role="status" /></div>;

  return (
    <div className="container-fluid py-3">
      <h2 className="mb-3">Conversations</h2>
      <ul className="list-group mb-5">
        {data?.map((c: any) => (
          <li key={c.id} className="list-group-item list-group-item-action" onClick={() => router.push(`/chat/${c.id}`)} style={{ cursor: 'pointer' }}>
            {c.title || 'New Chat'}
          </li>
        ))}
      </ul>
      <NewChatButton onClick={handleNewChat} />
    </div>
  );
}