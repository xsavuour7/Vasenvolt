"use client";

import { useState } from 'react';
import { useEmailAuth, useSignOut } from '@/lib/firebase/auth/hooks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { deleteUser } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { cleanupUserData } from '@/lib/firebase/firestore/user-data-cleanup';

export function AccountDeletion() {
  const { user } = useEmailAuth();
  const { signOut } = useSignOut();
  const router = useRouter();
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleDeleteAccount = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Clean up user data from Firestore
      await cleanupUserData(user.uid);

      // Delete user from Firebase Auth
      await deleteUser(user);

      // Sign out and redirect
      await signOut();
      router.push('/login?deleted=true');
    } catch (error) {
      setError('Failed to delete account. Please try again.');
      console.error('Account deletion error:', error);
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
        <CardTitle>Delete Account</CardTitle>
        <CardDescription>
          Permanently delete your account and all associated data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isConfirming ? (
          <>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Warning</AlertTitle>
              <AlertDescription>
                This action cannot be undone. All your data will be permanently deleted.
              </AlertDescription>
            </Alert>
            <Button
              variant="destructive"
              onClick={() => setIsConfirming(true)}
              className="w-full"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Account
            </Button>
          </>
        ) : (
          <>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Are you sure?</AlertTitle>
              <AlertDescription>
                Please confirm that you want to delete your account. This action is irreversible.
              </AlertDescription>
            </Alert>
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsConfirming(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteAccount}
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Deleting...' : 'Confirm Deletion'}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
} 