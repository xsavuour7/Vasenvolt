"use client";

import { useEffect, useState } from 'react';
import { useEmailAuth } from '@/lib/firebase/auth/hooks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Mail, AlertCircle } from 'lucide-react';

export function EmailVerification() {
  const { user, sendEmailVerification, loading, error } = useEmailAuth();
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    if (user) {
      setIsVerified(user.emailVerified);
    }
  }, [user]);

  const handleResendVerification = async () => {
    await sendEmailVerification();
  };

  if (!user || isVerified) {
    return null;
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Verify Your Email</CardTitle>
        <CardDescription>
          Please verify your email address to access all features
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Mail className="h-4 w-4" />
          <AlertTitle>Verification Required</AlertTitle>
          <AlertDescription>
            We've sent a verification email to {user.email}. Please check your inbox and click the verification link.
          </AlertDescription>
        </Alert>
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        )}
        <Button
          onClick={handleResendVerification}
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Sending...' : 'Resend Verification Email'}
        </Button>
      </CardContent>
    </Card>
  );
} 