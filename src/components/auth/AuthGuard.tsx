"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    async function checkSession() {
      try {
        const response = await fetch("/api/auth/me", {
          method: "GET",
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) {
          localStorage.removeItem("currentUser");

          if (active) {
            router.replace("/login");
          }

          return;
        }

        const data = (await response.json()) as { user?: User };
        const user = data.user;

        if (!user) {
          localStorage.removeItem("currentUser");

          if (active) {
            router.replace("/login");
          }

          return;
        }

        // Temporary compatibility cache for pages that still read currentUser.
        // Real authentication and authorization come from the server session.
        localStorage.setItem("currentUser", JSON.stringify(user));

        if (user.role !== role) {
          if (active) {
            router.replace(
              user.role === "candidate"
                ? "/candidate/dashboard"
                : "/employer/dashboard"
            );
          }

          return;
        }

        if (active) {
          setChecking(false);
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        localStorage.removeItem("currentUser");

        if (active) {
          router.replace("/login");
        }
      }
    }

    void checkSession();

    return () => {
      active = false;
      controller.abort();
    };
  }, [router, role]);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f3f1ec]">
        <p className="text-sm text-muted-foreground">
          Checking authentication...
        </p>
      </div>
    );
  }

  return <>{children}</>;
}