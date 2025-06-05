'use client';

import { useUser } from '@auth0/nextjs-auth0';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const { user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return <div className="d-flex justify-content-center align-items-center min-vh-100"><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div></div>;
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-vh-100 d-flex flex-column justify-content-center align-items-center bg-body-tertiary" style={{ background: 'linear-gradient(120deg, #343541 0%, #444654 100%)', minHeight: '100vh' }}>
      <div className="w-100" style={{ maxWidth: 420 }}>
        <div className="bg-white bg-opacity-10 rounded-4 shadow-lg p-4 p-md-5 text-center border border-0" style={{ backdropFilter: 'blur(2px)', boxShadow: '0 4px 32px 0 rgba(44,54,80,0.10)' }}>
          <h1 className="fw-bold mb-3 text-white text-truncate mx-auto" style={{ fontSize: '2.2rem', letterSpacing: 0.5, maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            Hello, {user.name || user.email}!
          </h1>
          <div className="d-flex flex-column flex-md-row gap-3 justify-content-center mt-4">
            <button
              onClick={() => router.push('/chat')}
              className="btn btn-primary btn-lg px-5 shadow-sm rounded-pill"
              style={{ background: 'linear-gradient(90deg, #7c3aed 0%, #4f8cff 100%)', border: 'none', fontWeight: 600 }}
            >
              Go to Chat
            </button>
            <a
              href="/auth/logout"
              className="btn btn-outline-light btn-lg px-5 shadow-sm rounded-pill border-0"
              style={{ color: '#fff', background: 'rgba(255,255,255,0.08)', fontWeight: 600 }}
            >
              Logout
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}