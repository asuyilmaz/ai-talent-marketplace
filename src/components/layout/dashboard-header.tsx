"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { MobileNavigation } from "@/components/navigation/mobile-navigation";
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type User = {
  id: string;
  name: string;
  email: string;
  role: "candidate" | "employer";
};

export function DashboardHeader() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");

    if (!storedUser) {
      return;
    }

    try {
      const parsed: User = JSON.parse(storedUser);
      setUser(parsed);
    } catch {
      localStorage.removeItem("currentUser");
    }
  }, []);

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      localStorage.removeItem("currentUser");
      setUser(null);
      router.replace("/login");
      router.refresh();
    }
  }

  function goToProfile() {
    if (user?.role === "employer") {
      router.push("/employer/company");
      return;
    }

    router.push("/candidate/profile");
  }

  function goToSettings() {
    if (user?.role === "employer") {
      router.push("/employer/settings");
      return;
    }

    router.push("/candidate/settings");
  }

  const displayName = user?.name || "User";

  const roleLabel =
    user?.role === "employer"
      ? "Employer"
      : "Candidate";

  const initials =
    displayName
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";

  return (
    <header className="border-b bg-background">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3">
          <MobileNavigation />

          <div>
            <p className="text-sm font-semibold">
              TALNIVO
            </p>

            <p className="hidden text-xs text-muted-foreground sm:block">
              Your talent. Your next level.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger
              className="flex items-center gap-2 rounded-md p-1.5 hover:bg-muted"
              aria-label="Open user menu"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  {initials}
                </AvatarFallback>
              </Avatar>

              <div className="hidden text-left sm:block">
                <p className="text-sm font-medium">
                  {displayName}
                </p>

                <p className="text-xs text-muted-foreground">
                  {roleLabel}
                </p>
              </div>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-52"
            >
              <DropdownMenuItem onClick={goToProfile}>
                Profile
              </DropdownMenuItem>

              <DropdownMenuItem onClick={goToSettings}>
                Settings
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={handleLogout}>
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}