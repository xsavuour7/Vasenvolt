"use client";

import { EmailVerification } from '@/components/auth/email-verification';
import { TwoFactorSetup } from '@/components/auth/two-factor-setup';
import { AccountDeletion } from '@/components/auth/account-deletion';
import { ProfileManagement } from '@/components/auth/profile-management';
import { useEmailAuth } from '@/lib/firebase/auth/hooks';
import { useEffect } from 'react';
import { startSessionTimeout, stopSessionTimeout } from '@/lib/firebase/auth/session-timeout';

export default function SettingsPage() {
  const { user } = useEmailAuth();

  useEffect(() => {
    // Start session timeout tracking
    startSessionTimeout();

    // Cleanup on unmount
    return () => {
      stopSessionTimeout();
    };
  }, []);

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <h1 className="text-3xl font-bold">Account Settings</h1>
      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-8">
          <ProfileManagement />
          <EmailVerification />
        </div>
        <div className="space-y-8">
          <TwoFactorSetup />
          <AccountDeletion />
        </div>
      </div>
    </div>
  );
} 