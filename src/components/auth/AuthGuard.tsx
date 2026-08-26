"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

type User = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: "candidate" | "employer";
};

type AuthGuardProps = {
  children: React.ReactNode;
  role: "candidate" | "employer";
};

export function AuthGuard({
  children,
  role,
}: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const storedUser =
      localStorage.getItem("currentUser");

    if (!storedUser) {
      router.replace("/login");
      return;
    }

    try {
      const user: User = JSON.parse(storedUser);

      if (user.role !== role) {
        if (user.role === "candidate") {
          router.replace("/candidate/dashboard");
        } else {
          router.replace("/employer/dashboard");
        }

        return;
      }

      setChecking(false);
    } catch {
      localStorage.removeItem("currentUser");
      router.replace("/login");
    }
  }, [router, role, pathname]);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Checking authentication...
        </p>
      </div>
    );
  }

  return <>{children}</>;
}