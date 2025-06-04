import { useEffect, useState } from 'react';

interface ChatBubbleProps {
  message: {
    sender: 'user' | 'ai';
    text?: string | null;
    image_url?: string | null;
  };
  userId?: string;
}

function base64ToUrl(base64: string) {
  try {
    const byteString = atob(base64);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([ab], { type: 'image/png' });
    return URL.createObjectURL(blob);
  } catch {
    return '';
  }
}

export default function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.sender === 'user';
  const [imgUrl, setImgUrl] = useState<string | null>(null);

  useEffect(() => {
    if (message.image_url) {
      if (message.image_url.startsWith('data:') || message.image_url.startsWith('http')) {
        setImgUrl(message.image_url);
      } else {
        setImgUrl(base64ToUrl(message.image_url));
      }
    }
  }, [message.image_url]);

  return (
    <div className={`d-flex mb-2 ${isUser ? 'justify-content-end' : 'justify-content-start'}`}>
      <div
        className={`p-2 rounded shadow-sm ${isUser ? 'bg-primary text-white' : 'bg-white border'} max-w-75`}
        style={{ minWidth: 60, maxWidth: '75%', wordBreak: 'break-word' }}
      >
        {imgUrl ? (
          <img src={imgUrl} alt="AI generated" className="img-fluid rounded" style={{ maxWidth: 220 }} loading="lazy" />
        ) : (
          <span>{message.text}</span>
        )}
      </div>
    </div>
  );
} 