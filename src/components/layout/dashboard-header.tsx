"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, LogOut, Settings, UserRound } from "lucide-react";

import { BrandMark } from "@/components/brand/brand-mark";
import { MobileNavigation } from "@/components/navigation/mobile-navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
    if (!storedUser) return;
    try {
      setUser(JSON.parse(storedUser) as User);
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
    router.push(user?.role === "employer" ? "/employer/company" : "/candidate/profile");
  }

  function goToSettings() {
    router.push(user?.role === "employer" ? "/employer/settings" : "/candidate/settings");
  }

  const displayName = user?.name || "TALNIVO User";
  const initials =
    displayName.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "TU";
  const roleLabel = user?.role === "employer" ? "Employer" : "Candidate";

  return (
    <header className="sticky top-0 z-40 border-b border-black/10 bg-[#f3f1ec]/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1540px] items-center px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <MobileNavigation />
          <BrandMark compact />
          <div className="hidden h-5 w-px bg-black/15 sm:block" />
          <div className="hidden sm:block">
            <p className="tn-index text-[#5b3df5]">{roleLabel} workspace</p>
          </div>
        </div>

        <div className="hidden items-center gap-2 lg:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <span className="tn-index">Workspace online</span>
        </div>

        <div className="flex flex-1 justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger
              className="flex items-center gap-2 border-l border-black/10 pl-4 text-left"
              aria-label="Open user menu"
            >
              <Avatar className="h-8 w-8 border border-black/10">
                <AvatarFallback className="bg-[#101114] text-[10px] font-bold text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden max-w-36 sm:block">
                <p className="truncate text-xs font-bold text-[#101114]">{displayName}</p>
                <p className="truncate text-[10px] text-[#7a797e]">{user?.email || roleLabel}</p>
              </div>
              <ChevronDown className="hidden h-3.5 w-3.5 text-[#8a898d] sm:block" />
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={goToProfile}>
                <UserRound className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={goToSettings}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
