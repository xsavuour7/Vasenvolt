"use client";

import { useState } from 'react';
import { 
  signInAnonymously, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  signInWithPopup,
  GoogleAuthProvider,
  UserCredential,
  User
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface AuthHookState {
  loading: boolean;
  error: Error | null;
}

export function useAnonymousAuth() {
  const [state, setState] = useState<AuthHookState>({
    loading: false,
    error: null,
  });

  const signIn = async () => {
    if (!auth) {
      setState({ loading: false, error: new Error('Firebase Auth not initialized') });
      return;
    }

    setState({ loading: true, error: null });
    try {
      await signInAnonymously(auth);
      setState({ loading: false, error: null });
    } catch (error) {
      setState({ loading: false, error: error as Error });
    }
  };

  return { signIn, ...state };
}

export function useEmailAuth() {
  const [state, setState] = useState<AuthHookState>({
    loading: false,
    error: null,
  });

  const [user, setUser] = useState<User | null>(null);

  const signIn = async (email: string, password: string) => {
    if (!auth) {
      setState({ loading: false, error: new Error('Firebase Auth not initialized') });
      return;
    }

    setState({ loading: true, error: null });
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
      setState({ loading: false, error: null });
    } catch (error) {
      setState({ loading: false, error: error as Error });
    }
  };

  const signUp = async (email: string, password: string) => {
    if (!auth) {
      setState({ loading: false, error: new Error('Firebase Auth not initialized') });
      return;
    }

    setState({ loading: true, error: null });
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
      // Send email verification
      await sendEmailVerification(userCredential.user);
      setState({ loading: false, error: null });
    } catch (error) {
      setState({ loading: false, error: error as Error });
    }
  };

  const resetPassword = async (email: string) => {
    if (!auth) {
      setState({ loading: false, error: new Error('Firebase Auth not initialized') });
      return;
    }

    setState({ loading: true, error: null });
    try {
      await sendPasswordResetEmail(auth, email);
      setState({ loading: false, error: null });
    } catch (error) {
      setState({ loading: false, error: error as Error });
    }
  };

  const sendVerificationEmail = async () => {
    if (!auth || !user) {
      setState({ loading: false, error: new Error('Firebase Auth not initialized or no user') });
      return;
    }

    setState({ loading: true, error: null });
    try {
      await sendEmailVerification(user);
      setState({ loading: false, error: null });
    } catch (error) {
      setState({ loading: false, error: error as Error });
    }
  };

  const signInWithGoogle = async () => {
    if (!auth) {
      setState({ loading: false, error: new Error('Firebase Auth not initialized') });
      return;
    }

    setState({ loading: true, error: null });
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      setUser(userCredential.user);
      setState({ loading: false, error: null });
    } catch (error) {
      setState({ loading: false, error: error as Error });
    }
  };

  return { 
    user, 
    signIn, 
    signUp, 
    resetPassword, 
    sendEmailVerification: sendVerificationEmail,
    signInWithGoogle,
    ...state 
  };
}

export function useSignOut() {
  const [state, setState] = useState<AuthHookState>({
    loading: false,
    error: null,
  });

  const signOutUser = async () => {
    if (!auth) {
      setState({ loading: false, error: new Error('Firebase Auth not initialized') });
      return;
    }

    setState({ loading: true, error: null });
    try {
      await signOut(auth);
      setState({ loading: false, error: null });
    } catch (error) {
      setState({ loading: false, error: error as Error });
    }
  };

  return { signOut: signOutUser, ...state };
} 