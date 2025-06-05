"use client";
import React from "react";

interface ChatBubbleProps {
  message: {
    sender: "user" | "ai";
    text?: string | null;
    image_url?: string | null;
  };
  userId?: string;
}

function base64ToUrl(base64: string) {
  if (base64.startsWith("data:")) {
    return base64;
  }
  return `data:image/png;base64,${base64}`;
}

export default function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.sender === "user";
  return (
    <div
      className={`w-100 d-flex ${isUser ? 'justify-content-end' : 'justify-content-start'} mb-3 px-2`}
    >
      {!isUser && (
        <div className="flex-shrink-0 me-2">
          <div className="rounded-circle d-flex align-items-center justify-content-center shadow" style={{ width: 36, height: 36, background: 'linear-gradient(135deg, #565869 0%, #343541 100%)', color: '#fff', fontWeight: 700, fontSize: 18 }}>
            <span role="img" aria-label="AI">🤖</span>
          </div>
        </div>
      )}
      <div
        className={`px-4 py-3 shadow-sm ${isUser ? 'bg-gradient-user text-dark' : 'bg-gradient-ai text-white'} rounded-4`}
        style={{
          maxWidth: '80vw',
          minWidth: 0,
          borderTopRightRadius: isUser ? 8 : 24,
          borderTopLeftRadius: !isUser ? 8 : 24,
          background: isUser
            ? 'linear-gradient(90deg, #ececf1 0%, #d9dbe3 100%)'
            : 'linear-gradient(90deg, #40414f 0%, #343541 100%)',
          color: isUser ? '#23272f' : '#fff',
          boxShadow: '0 2px 8px rgba(44,54,80,0.08)',
        }}
      >
        {message.image_url && (
          <img
            src={base64ToUrl(message.image_url)}
            alt="User prompt"
            className="mb-2 rounded-3 w-100"
            style={{ maxHeight: 200, objectFit: 'cover' }}
          />
        )}
        <span className="white-space-pre-line fs-6 lh-base">
          {message.text}
        </span>
      </div>
      {isUser && (
        <div className="flex-shrink-0 ms-2">
          <div className="rounded-circle d-flex align-items-center justify-content-center shadow" style={{ width: 36, height: 36, background: 'linear-gradient(135deg, #7c3aed 0%, #4f8cff 100%)', color: '#fff', fontWeight: 700, fontSize: 18 }}>
            <span role="img" aria-label="User">🧑</span>
          </div>
        </div>
      )}
    </div>
  );
}