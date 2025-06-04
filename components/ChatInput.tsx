import { useState } from 'react';
import { trpc } from '../lib/trpc';
import { isImagePrompt } from '../lib/utils';

interface ChatInputProps {
  conversationId: string;
}

export default function ChatInput({ conversationId }: ChatInputProps) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const utils = trpc.useContext();
  const sendMessage = trpc.sendMessage.useMutation();
  const sendToGeminiText = trpc.sendToGeminiText.useMutation();
  const sendToGeminiImage = trpc.sendToGeminiImage.useMutation();

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!input.trim()) {
      setError('Please enter a message.');
      return;
    }
    setLoading(true);
    // Save user message
    await sendMessage.mutateAsync({
      conversationId,
      sender: 'user',
      text: input,
      imageUrl: null,
    });
    // Route to Gemini
    let aiResponse;
    try {
      if (isImagePrompt(input)) {
        aiResponse = await sendToGeminiImage.mutateAsync({ prompt: input });
        let base64 = aiResponse?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
        if (base64 && !base64.startsWith('data:')) {
          base64 = `data:image/png;base64,${base64}`;
        }
        await sendMessage.mutateAsync({
          conversationId,
          sender: 'ai',
          text: null,
          imageUrl: base64,
        });
      } else {
        aiResponse = await sendToGeminiText.mutateAsync({ prompt: input });
        await sendMessage.mutateAsync({
          conversationId,
          sender: 'ai',
          text: aiResponse?.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not generate a response.',
          imageUrl: null,
        });
      }
    } catch (err) {
      await sendMessage.mutateAsync({
        conversationId,
        sender: 'ai',
        text: 'Sorry, there was an error with the AI service.',
        imageUrl: null,
      });
    }
    setInput('');
    setLoading(false);
    utils.getMessages.invalidate({ conversationId });
  };

  return (
    <form className="d-flex gap-2" onSubmit={handleSend} autoComplete="off">
      <input
        className="form-control rounded-pill"
        type="text"
        placeholder="Type a message..."
        value={input}
        onChange={e => setInput(e.target.value)}
        disabled={loading}
        style={{ minHeight: 44 }}
        aria-label="Type a message"
      />
      <button className="btn btn-primary rounded-pill px-4" type="submit" disabled={loading || !input.trim()} aria-label="Send message">
        {loading ? <span className="spinner-border spinner-border-sm" /> : 'Send'}
      </button>
      {error && <div className="text-danger small ms-2 align-self-center">{error}</div>}
    </form>
  );
} 