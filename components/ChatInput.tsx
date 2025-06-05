"use client";
// This file is used to set up the tRPC client and provider for React Query in a Next.js application.
import { useState, useRef, useEffect } from 'react';
import { trpc } from '@/lib/trpc';

interface ChatInputProps {
  conversationId: string;
}

export default function ChatInput({ conversationId }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const utils = trpc.useUtils();
  const createMessage = trpc.messages.create.useMutation();
  const generateResponse = trpc.messages.generateResponse.useMutation();

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [message]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isGenerating) return;

    setIsGenerating(true);
    try {
      // Save user message
      await createMessage.mutateAsync({
        conversationId,
        sender: 'user',
        text: message,
        imageUrl: null,
      });

      // Generate AI response
      await generateResponse.mutateAsync({
        conversationId,
        messageText: message,
      });

      // Invalidate queries to refresh the chat
      await utils.messages.list.invalidate({ conversationId });
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  return (
    <form
      onSubmit={handleSend}
      className="chat-input-bar w-100 position-fixed bottom-0 start-0 px-2 py-3"
      style={{
        zIndex: 1030,
        maxWidth: '100vw',
        background: 'linear-gradient(0deg, #23272f 0%, #343541 100%)',
        borderTop: '1px solid #444654',
        boxShadow: '0 -2px 16px 0 rgba(44,54,80,0.10)',
        backdropFilter: 'blur(2px)'
      }}
    >
      <div className="d-flex align-items-end gap-2 mx-auto" style={{ maxWidth: 700 }}>
        <div className="flex-grow-1 position-relative">
          <textarea
            ref={textareaRef}
            className="form-control border-0 shadow-sm rounded-pill px-4 py-3 pe-5 bg-dark text-white"
            style={{
              minHeight: 44,
              maxHeight: 120,
              fontSize: 16,
              lineHeight: 1.5,
              resize: 'none',
              background: 'linear-gradient(90deg, #40414f 0%, #343541 100%)',
              color: '#fff',
              boxShadow: '0 2px 8px rgba(44,54,80,0.10)',
              outline: 'none',
              border: '1.5px solid #565869',
              transition: 'box-shadow 0.2s, border 0.2s',
            }}
            placeholder="Send a message..."
            value={message}
            onChange={e => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isGenerating}
            rows={1}
            onFocus={e => e.currentTarget.style.border = '1.5px solid #7c3aed'}
            onBlur={e => e.currentTarget.style.border = '1.5px solid #565869'}
          />
        </div>
        <button
          type="submit"
          className="btn btn-primary rounded-circle d-flex align-items-center justify-content-center shadow-lg border-0"
          style={{
            width: 48,
            height: 48,
            background: 'linear-gradient(135deg, #7c3aed 0%, #4f8cff 100%)',
            boxShadow: '0 2px 12px rgba(79,140,255,0.18)',
            marginLeft: 4,
            transition: 'box-shadow 0.2s, background 0.2s',
            outline: 'none',
          }}
          disabled={isGenerating || !message.trim()}
          aria-label="Send"
          onMouseDown={e => e.currentTarget.style.boxShadow = '0 4px 24px rgba(79,140,255,0.28)'}
          onMouseUp={e => e.currentTarget.style.boxShadow = '0 2px 12px rgba(79,140,255,0.18)'}
        >
          <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path d="M3 20l18-8-18-8v7l13 1-13 1v7z" fill="#fff"/></svg>
        </button>
      </div>
    </form>
  );
}