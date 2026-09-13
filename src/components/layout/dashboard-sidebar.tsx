import type { ReactNode } from "react";

interface DashboardSidebarProps {
  children: ReactNode;
}

export function DashboardSidebar({ children }: DashboardSidebarProps) {
  return (
    <aside className="sticky top-16 z-30 hidden border-b border-black/10 bg-[#f3f1ec]/95 backdrop-blur md:block">
      <div className="mx-auto max-w-[1540px] px-6 lg:px-8">
        <div className="flex h-14 items-center">
          <div className="mr-6 hidden shrink-0 lg:block">
            <span className="tn-index">Navigate /</span>
          </div>
          <div className="min-w-0 flex-1">{children}</div>
        </div>
      </div>
    </aside>
  );
}
