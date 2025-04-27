"use client";

import { useState } from 'react';
import { useEmailAuth } from '@/lib/firebase/auth/hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Shield, AlertCircle } from 'lucide-react';

export function TwoFactorSetup() {
  const { user } = useEmailAuth();
  const [step, setStep] = useState<'setup' | 'verify'>('setup');
  const [secret, setSecret] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSetup = async () => {
    setLoading(true);
    try {
      // TODO: Implement 2FA setup with Firebase
      // This would typically involve:
      // 1. Generating a secret key
      // 2. Creating a QR code
      // 3. Storing the secret in Firestore
      setSecret('2FA_SECRET_KEY'); // Placeholder
      setStep('verify');
    } catch (error) {
      setError('Failed to setup 2FA. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setLoading(true);
    try {
      // TODO: Implement 2FA verification
      // This would typically involve:
      // 1. Verifying the TOTP code
      // 2. Enabling 2FA in Firestore
      setError(null);
      // Show success message
    } catch (error) {
      setError('Invalid verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Two-Factor Authentication</CardTitle>
        <CardDescription>
          Add an extra layer of security to your account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {step === 'setup' ? (
          <>
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertTitle>Setup Required</AlertTitle>
              <AlertDescription>
                To enable two-factor authentication, you'll need to:
                1. Scan the QR code with your authenticator app
                2. Enter the verification code
              </AlertDescription>
            </Alert>
            <Button
              onClick={handleSetup}
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Setting up...' : 'Begin Setup'}
            </Button>
          </>
        ) : (
          <>
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertTitle>Verify Setup</AlertTitle>
              <AlertDescription>
                Enter the 6-digit code from your authenticator app
              </AlertDescription>
            </Alert>
            <div className="space-y-2">
              <Label htmlFor="code">Verification Code</Label>
              <Input
                id="code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter 6-digit code"
                maxLength={6}
              />
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button
              onClick={handleVerify}
              disabled={loading || code.length !== 6}
              className="w-full"
            >
              {loading ? 'Verifying...' : 'Verify and Enable'}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
} 