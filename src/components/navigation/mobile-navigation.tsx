"use client";

import Link from "next/link";
import { Menu } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const navItems = [
  {
    label: "Dashboard",
    href: "/candidate/dashboard",
  },
  {
    label: "Profile",
    href: "/candidate/profile",
  },
  {
    label: "CV",
    href: "/candidate/cv",
  },
  {
    label: "Skills",
    href: "/candidate/skills",
  },
  {
    label: "Jobs",
    href: "/candidate/jobs",
  },
  {
    label: "Matches",
    href: "/candidate/matches",
  },
  {
    label: "Skill Gap",
    href: "/candidate/skill-gap",
  },
  {
    label: "Applications",
    href: "/candidate/applications",
  },
  {
    label: "Settings",
    href: "/candidate/settings",
  },
];

export function MobileNavigation() {
  return (
    <Sheet>
      <SheetTrigger
        id="mobile-navigation-trigger"
        className="md:hidden"
        aria-label="Open navigation menu"
      >
        <Menu className="h-5 w-5" />
      </SheetTrigger>

      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>
            AI Talent Marketplace
          </SheetTitle>
        </SheetHeader>

        <nav className="mt-6 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-md px-3 py-2 text-sm hover:bg-muted"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}