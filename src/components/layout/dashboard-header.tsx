import { MobileNavigation } from "@/components/navigation/mobile-navigation";

export function DashboardHeader() {
  return (
    <header className="border-b">
      <div className="flex h-16 items-center gap-4 px-6">
        <MobileNavigation />

        <span className="font-semibold">
          AI Talent Marketplace
        </span>
      </div>
    </header>
  );
}