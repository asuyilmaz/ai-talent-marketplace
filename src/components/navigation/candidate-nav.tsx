"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BrainCircuit, Briefcase, ClipboardList, FileText, LayoutDashboard,
  Settings, Sparkles, Target, User, Wrench,
} from "lucide-react";

const navItems = [
  { label: "Overview", href: "/candidate/dashboard", icon: LayoutDashboard },
  { label: "Profile", href: "/candidate/profile", icon: User },
  { label: "CV", href: "/candidate/cv", icon: FileText },
  { label: "Skills", href: "/candidate/skills", icon: Wrench },
  { label: "Jobs", href: "/candidate/jobs", icon: Briefcase },
  { label: "Matches", href: "/candidate/matches", icon: Sparkles },
  { label: "Skill Gap", href: "/candidate/skill-gap", icon: Target },
  { label: "Applications", href: "/candidate/applications", icon: ClipboardList },
  { label: "Interview", href: "/candidate/interview-practice", icon: BrainCircuit },
  { label: "Settings", href: "/candidate/settings", icon: Settings },
];

export function CandidateNav() {
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
