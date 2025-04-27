"use client";

import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface AuthErrorProps {
  error: Error;
  retry?: () => void;
}

export function AuthError({ error, retry }: AuthErrorProps) {
  const router = useRouter();

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="w-full max-w-md space-y-4 p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Authentication Error</AlertTitle>
          <AlertDescription>
            {error.message}
          </AlertDescription>
        </Alert>
        <div className="flex gap-2">
          {retry && (
            <Button onClick={retry} variant="outline">
              Try Again
            </Button>
          )}
          <Button onClick={() => router.push("/")} variant="default">
            Return Home
          </Button>
        </div>
      </div>
    </div>
  );
} 