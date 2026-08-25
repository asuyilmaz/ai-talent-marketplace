import { DashboardHeader } from "@/components/layout/dashboard-header";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { CandidateNav } from "@/components/navigation/candidate-nav";

export default function CandidateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <DashboardHeader />

      <div className="flex">
        <DashboardSidebar>
          <CandidateNav />
        </DashboardSidebar>

        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}