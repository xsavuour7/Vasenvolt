"use client";

import { useEffect, useState } from 'react';
import { useEmailAuth } from '@/lib/firebase/auth/hooks';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function VerifyEmailPage() {
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  const { user, sendEmailVerification, loading } = useEmailAuth();

  useEffect(() => {
    if (user?.emailVerified) {
      setIsVerified(true);
    }
  }, [user]);

  const handleResendVerification = async () => {
    try {
      await sendEmailVerification();
      setError(null);
    } catch (err) {
      setError('Failed to send verification email. Please try again.');
    }
  };

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Verify Your Email</CardTitle>
          <CardDescription>
            Please verify your email address to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isVerified ? (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>Email Verified</AlertTitle>
              <AlertDescription>
                Your email has been successfully verified. You can now access all features.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Verification Required</AlertTitle>
                <AlertDescription>
                  We've sent a verification email to {user.email}. Please check your inbox and click the verification link.
                </AlertDescription>
              </Alert>
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Button
                onClick={handleResendVerification}
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Sending...' : 'Resend Verification Email'}
              </Button>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard')}
            className="w-full"
          >
            Return to Dashboard
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 