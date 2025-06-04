'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  useEffect(() => {
    router.push('/api/auth/login');
  }, [router]);
  return <div className="vh-100 d-flex align-items-center justify-content-center"><div className="spinner-border" role="status" /></div>;
}