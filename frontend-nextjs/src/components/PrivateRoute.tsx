"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [isAuth, setIsAuth] = useState<boolean | null>(null); // null = loading

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const expiry = localStorage.getItem("tokenExpiry");
    const valid = !!token && (!expiry || Date.now() < Number(expiry));
    setIsAuth(valid);

    if (!valid) {
      router.replace("/login");
    }
  }, [router]);

  if (isAuth === null) return <div>Loading...</div>; // wait for useEffect
  if (!isAuth) return null; // redirecting

  return <>{children}</>;
};
