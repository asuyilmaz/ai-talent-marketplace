import { Bell } from "lucide-react";

import { MobileNavigation } from "@/components/navigation/mobile-navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function DashboardHeader() {
  return (
    <header className="border-b bg-background">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3">
          <MobileNavigation />

          <div>
            <p className="text-sm font-semibold">
              AI Talent Marketplace
            </p>

            <p className="hidden text-xs text-muted-foreground sm:block">
              Career intelligence platform
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Notifications */}
          <button
            type="button"
            aria-label="Notifications"
            className="relative inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-muted"
          >
            <Bell className="h-4 w-4" />

            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-primary" />
          </button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger
              className="flex items-center gap-2 rounded-md p-1.5 hover:bg-muted"
              aria-label="Open user menu"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback>AY</AvatarFallback>
              </Avatar>

              <div className="hidden text-left sm:block">
                <p className="text-sm font-medium">
                  Asu Yılmaz
                </p>

                <p className="text-xs text-muted-foreground">
                  Candidate
                </p>
              </div>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel>
                My Account
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              <DropdownMenuItem>
                Profile
              </DropdownMenuItem>

              <DropdownMenuItem>
                Settings
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem>
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}