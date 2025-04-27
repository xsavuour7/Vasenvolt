"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useEmailAuth } from '@/lib/firebase/auth/hooks';
import { AuthLoading } from '@/components/auth/loading';

export default function GoogleAuthPage() {
  const router = useRouter();
  const { signInWithGoogle } = useEmailAuth();

  useEffect(() => {
    const handleGoogleAuth = async () => {
      try {
        await signInWithGoogle();
        router.push('/dashboard');
      } catch (error) {
        console.error('Google authentication error:', error);
        router.push('/login');
      }
    };

    handleGoogleAuth();
  }, [router, signInWithGoogle]);

  return <AuthLoading />;
} 