"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

type User = {
  id: string;
  name: string;
  email: string;
  role: "candidate" | "employer";
};

type AuthGuardProps = {
  children: React.ReactNode;
  role: "candidate" | "employer";
};

export function AuthGuard({ children, role }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let active = true;

    async function checkSession() {
      setChecking(true);

      try {
        const response = await fetch("/api/auth/me", {
          method: "GET",
          cache: "no-store",
        });

        if (!response.ok) {
          localStorage.removeItem("currentUser");
          router.replace("/login");
          return;
        }

        const data = (await response.json()) as { user?: User };
        const user = data.user;

        if (!user) {
          localStorage.removeItem("currentUser");
          router.replace("/login");
          return;
        }

        // Temporary compatibility cache for pages that still read currentUser.
        // Authorization itself now comes from the server session.
        localStorage.setItem("currentUser", JSON.stringify(user));

        if (user.role !== role) {
          router.replace(
            user.role === "candidate"
              ? "/candidate/dashboard"
              : "/employer/dashboard"
          );
          return;
        }

        if (active) setChecking(false);
      } catch {
        localStorage.removeItem("currentUser");
        router.replace("/login");
      }
    }

    void checkSession();

    return () => {
      active = false;
    };
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
