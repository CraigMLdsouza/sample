'use client';
import { useUser } from '@auth0/nextjs-auth0';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from "next/image";
import styles from "./page.module.css";

export default function Page() {
  const { user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.replace('/api/auth/login');
      } else {
        router.replace('/conversations');
      }
    }
  }, [user, isLoading, router]);

  return <div className="vh-100 d-flex align-items-center justify-content-center"><div className="spinner-border" role="status" /></div>;
}
