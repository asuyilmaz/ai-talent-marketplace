"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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

export function CandidateNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {navItems.map((item) => {
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`block rounded-md px-3 py-2 text-sm transition-colors ${
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}