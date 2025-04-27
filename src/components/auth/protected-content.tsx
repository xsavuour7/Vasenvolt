"use client";

import { useAuth } from "@/lib/firebase/auth/context";
import { AuthLoading } from "./loading";
import { AuthError } from "./error";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface ProtectedContentProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export function ProtectedContent({ children, requireAuth = true }: ProtectedContentProps) {
  const { user, loading, error } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user && requireAuth) {
      router.push("/login");
    }
  }, [user, loading, requireAuth, router]);

  if (loading) {
    return <AuthLoading />;
  }

  if (error) {
    return <AuthError error={error} />;
  }

  if (requireAuth && !user) {
    return null;
  }

  return <>{children}</>;
} 