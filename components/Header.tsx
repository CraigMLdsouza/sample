"use client";
import Image from 'next/image';

export default function Header() {
  return (
    <header
      className="w-100 position-fixed top-0 start-0 d-flex justify-content-between align-items-center px-3 border-bottom"
      style={{
        height: 56,
        zIndex: 1050,
        width: '100vw',
        background: 'linear-gradient(90deg, #23272f 0%, #343541 100%)',
        borderBottom: '1px solid #444654',
        boxShadow: '0 1px 8px 0 rgba(44,54,80,0.10)'
      }}
    >
      <div className="d-flex align-items-center gap-2">
        <Image src="/globe.svg" alt="AI Chat" width={32} height={32} className="me-2" />
        <span className="fw-bold fs-5" style={{ letterSpacing: 0.5, color: '#fff' }}>AI Chat</span>
      </div>
      <a
        href="/api/auth/logout"
        className="rounded-pill px-3 py-1"
        style={{
          background: 'rgba(255,255,255,0.08)',
          color: '#fff',
          border: '1px solid #7c3aed',
          fontWeight: 500,
          fontSize: 15,
          textDecoration: 'none',
          transition: 'background 0.2s',
        }}
      >
        Logout
      </a>
    </header>
  );
}