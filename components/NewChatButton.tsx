"use client";
// This component is used to display individual chat bubbles in a conversation.
interface NewChatButtonProps {
  onClick: () => void;
}

export default function NewChatButton({ onClick }: NewChatButtonProps) {
  return (
    <button
      className="btn btn-primary rounded-circle position-fixed shadow-lg d-flex align-items-center justify-content-center"
      style={{
        bottom: 24,
        right: 24,
        zIndex: 1040,
        width: 56,
        height: 56,
        background: 'linear-gradient(135deg, #7c3aed 0%, #4f8cff 100%)',
        border: 'none',
        boxShadow: '0 4px 24px rgba(79,140,255,0.18)',
        transition: 'box-shadow 0.2s, background 0.2s',
      }}
      onClick={onClick}
      aria-label="New Chat"
    >
      <span className="fs-2 fw-bold" style={{ color: '#fff', marginTop: -2 }}>+</span>
    </button>
  );
}