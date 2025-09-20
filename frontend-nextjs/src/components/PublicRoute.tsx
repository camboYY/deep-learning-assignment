"use client";
import { useRouter } from "next/router";
import { useEffect } from "react";

interface PublicRouteProps {
  isAuthenticated: boolean;
  children: React.ReactNode;
  redirectTo?: string;
}

export const PublicRoute = ({
  isAuthenticated,
  children,
  redirectTo = "/dashboard",
}: PublicRouteProps) => {
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, router, redirectTo]);

  return <>{children}</>;
};
