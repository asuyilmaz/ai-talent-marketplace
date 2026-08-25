import type { ReactNode } from "react";

interface DashboardSidebarProps {
  children: ReactNode;
}

export function DashboardSidebar({
  children,
}: DashboardSidebarProps) {
  return (
    <aside className="hidden w-64 border-r md:block">
      <nav className="p-4">{children}</nav>
    </aside>
  );
}