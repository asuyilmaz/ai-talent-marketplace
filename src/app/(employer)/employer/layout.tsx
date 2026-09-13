import { AuthGuard } from "@/components/auth/AuthGuard";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { EmployerNav } from "@/components/navigation/employer-nav";

export default function EmployerLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard role="employer">
      <div className="tn-shell min-h-screen">
        <DashboardHeader />
        <DashboardSidebar><EmployerNav /></DashboardSidebar>
        <main className="mx-auto min-h-[calc(100vh-120px)] max-w-[1540px] px-4 py-7 sm:px-6 lg:px-8 lg:py-10">
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}
