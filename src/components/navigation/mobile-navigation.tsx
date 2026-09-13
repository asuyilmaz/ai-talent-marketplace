"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BrainCircuit,
  Briefcase,
  Building2,
  ClipboardList,
  FileText,
  LayoutDashboard,
  Menu,
  Settings,
  Sparkles,
  Target,
  User,
  Users,
  Wrench,
} from "lucide-react";

import { BrandMark } from "@/components/brand/brand-mark";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const candidateItems = [
  { label: "Dashboard", href: "/candidate/dashboard", icon: LayoutDashboard },
  { label: "Profile", href: "/candidate/profile", icon: User },
  { label: "CV", href: "/candidate/cv", icon: FileText },
  { label: "Skills", href: "/candidate/skills", icon: Wrench },
  { label: "Jobs", href: "/candidate/jobs", icon: Briefcase },
  { label: "Matches", href: "/candidate/matches", icon: Sparkles },
  { label: "Skill Gap", href: "/candidate/skill-gap", icon: Target },
  { label: "Applications", href: "/candidate/applications", icon: ClipboardList },
  { label: "Interview Practice", href: "/candidate/interview-practice", icon: BrainCircuit },
  { label: "Settings", href: "/candidate/settings", icon: Settings },
];

const employerItems = [
  { label: "Dashboard", href: "/employer/dashboard", icon: LayoutDashboard },
  { label: "Company", href: "/employer/company", icon: Building2 },
  { label: "Jobs", href: "/employer/jobs", icon: Briefcase },
  { label: "Applications", href: "/employer/applications", icon: ClipboardList },
  { label: "Candidates", href: "/employer/candidates", icon: Users },
  { label: "Settings", href: "/employer/settings", icon: Settings },
];

export function MobileNavigation() {
  const pathname = usePathname();
  const isEmployer = pathname.startsWith("/employer");
  const navItems = isEmployer ? employerItems : candidateItems;

  return (
    <Sheet>
      <SheetTrigger
        id="mobile-navigation-trigger"
        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 md:hidden"
        aria-label="Open navigation menu"
      >
        <Menu className="h-5 w-5" />
      </SheetTrigger>

      <SheetContent side="left" className="w-[86%] max-w-sm border-r-0 bg-[#0B1020] p-0 text-white">
        <SheetHeader className="border-b border-white/8 px-5 py-5 text-left">
          <SheetTitle className="sr-only">TALNIVO navigation</SheetTitle>
          <BrandMark href={isEmployer ? "/employer/dashboard" : "/candidate/dashboard"} tone="dark" />
        </SheetHeader>

        <nav className="space-y-1.5 overflow-y-auto px-4 py-5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-violet-600 text-white"
                    : "text-slate-400 hover:bg-white/[0.06] hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
