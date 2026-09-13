"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Briefcase, Building2, ClipboardList, LayoutDashboard, Settings, Users } from "lucide-react";

const navItems = [
  { label: "Overview", href: "/employer/dashboard", icon: LayoutDashboard },
  { label: "Company", href: "/employer/company", icon: Building2 },
  { label: "Jobs", href: "/employer/jobs", icon: Briefcase },
  { label: "Applications", href: "/employer/applications", icon: ClipboardList },
  { label: "Candidates", href: "/employer/candidates", icon: Users },
  { label: "Settings", href: "/employer/settings", icon: Settings },
];

export function EmployerNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1 overflow-x-auto">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`relative flex h-14 shrink-0 items-center gap-2 px-3 text-xs font-bold transition ${
              isActive ? "text-[#101114]" : "text-[#77767b] hover:text-[#101114]"
            }`}
          >
            <Icon className={`h-3.5 w-3.5 ${isActive ? "text-[#5b3df5]" : ""}`} />
            <span>{item.label}</span>
            {isActive && <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-[#5b3df5]" />}
          </Link>
        );
      })}
    </nav>
  );
}
