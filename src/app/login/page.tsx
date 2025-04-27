"use client";

import { useState, useEffect } from 'react';
import { useEmailAuth, useAnonymousAuth } from '@/lib/firebase/auth/hooks';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { FcGoogle } from 'react-icons/fc';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const { signIn: signInWithEmail, loading: emailLoading, error: emailError } = useEmailAuth();
  const { signIn: signInAnonymously, loading: anonymousLoading, error: anonymousError } = useAnonymousAuth();

  useEffect(() => {
    // Check for saved credentials
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmail(email, password);
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }
      router.push('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const handleAnonymousSignIn = async () => {
    try {
      await signInAnonymously();
      router.push('/dashboard');
    } catch (error) {
      console.error('Anonymous login error:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Welcome Back</CardTitle>
          <CardDescription>Sign in to your VasenVolt account</CardDescription>
        </CardHeader>
        <CardContent>
          {searchParams.get('timeout') && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Your session has expired. Please sign in again.
              </AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleEmailSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="/reset-password" className="text-sm text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              />
              <Label htmlFor="remember" className="text-sm">
                Remember me
              </Label>
            </div>
            {emailError && (
              <p className="text-sm text-red-500">{emailError.message}</p>
            )}
            <Button type="submit" className="w-full" disabled={emailLoading}>
              {emailLoading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          <div className="my-4 flex items-center">
            <Separator className="flex-1" />
            <span className="px-2 text-sm text-muted-foreground">or</span>
            <Separator className="flex-1" />
          </div>

          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push('/signup')}
            >
              Create an account
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={handleAnonymousSignIn}
              disabled={anonymousLoading}
            >
              {anonymousLoading ? 'Signing in...' : 'Continue as Guest'}
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push('/auth/google')}
            >
              <FcGoogle className="mr-2 h-4 w-4" />
              Sign in with Google
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 