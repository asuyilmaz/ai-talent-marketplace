import { DashboardHeader } from "@/components/layout/dashboard-header";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { EmployerNav } from "@/components/navigation/employer-nav";

export default function EmployerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <DashboardHeader />

      <div className="flex">
        <DashboardSidebar>
          <EmployerNav />
        </DashboardSidebar>

        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}