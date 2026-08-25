"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  {
    label: "Dashboard",
    href: "/employer/dashboard",
  },
  {
    label: "Company",
    href: "/employer/company",
  },
  {
    label: "Jobs",
    href: "/employer/jobs",
  },
  {
    label: "Applications",
    href: "/employer/applications",
  },
  {
    label: "Candidates",
    href: "/employer/candidates",
  },
  {
    label: "Settings",
    href: "/employer/settings",
  },
];

export function EmployerNav() {
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