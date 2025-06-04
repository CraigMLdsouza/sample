interface NewChatButtonProps {
  onClick: () => void;
}

export default function NewChatButton({ onClick }: NewChatButtonProps) {
  return (
    <button
      className="btn btn-primary rounded-pill position-fixed shadow-lg"
      style={{ bottom: 24, right: 24, zIndex: 1040, width: 56, height: 56, borderRadius: '50%' }}
      onClick={onClick}
      aria-label="New Chat"
    >
      <span className="fs-3">+</span>
    </button>
  );
} 