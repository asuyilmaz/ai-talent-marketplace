import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Lock, Building2, Save } from "lucide-react";

export default function EmployerSettingsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Settings
        </h1>

        <p className="mt-2 text-muted-foreground">
          Manage your company account and hiring preferences.
        </p>
      </div>

      {/* Company Account */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            <CardTitle>Company Account</CardTitle>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="space-y-2">
            <label
              htmlFor="companyName"
              className="text-sm font-medium"
            >
              Company Name
            </label>

            <input
              id="companyName"
              type="text"
              defaultValue="Tech Company"
              className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none transition focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="companyEmail"
              className="text-sm font-medium"
            >
              Company Email
            </label>

            <input
              id="companyEmail"
              type="email"
              defaultValue="hr@techcompany.com"
              className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none transition focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="website"
              className="text-sm font-medium"
            >
              Website
            </label>

            <input
              id="website"
              type="text"
              defaultValue="techcompany.com"
              className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none transition focus:ring-2 focus:ring-ring"
            />
          </div>
        </CardContent>
      </Card>

      {/* Hiring Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Hiring Preferences</CardTitle>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="space-y-2">
            <label
              htmlFor="focus"
              className="text-sm font-medium"
            >
              Hiring Focus
            </label>

            <input
              id="focus"
              type="text"
              defaultValue="Frontend Development, React, UI Engineering"
              className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none transition focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="minimumMatch"
              className="text-sm font-medium"
            >
              Minimum AI Match Score
            </label>

            <input
              id="minimumMatch"
              type="number"
              min="0"
              max="100"
              defaultValue="80"
              className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none transition focus:ring-2 focus:ring-ring"
            />

            <p className="text-xs text-muted-foreground">
              Candidates below this score can be excluded from your recommended matches.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <CardTitle>Notifications</CardTitle>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <label className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              defaultChecked
              className="h-4 w-4"
            />
            New candidate applications
          </label>

          <label className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              defaultChecked
              className="h-4 w-4"
            />
            New high-match candidates
          </label>

          <label className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              defaultChecked
              className="h-4 w-4"
            />
            Hiring activity summaries
          </label>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            <CardTitle>Security</CardTitle>
          </div>
        </CardHeader>

        <CardContent>
          <Button variant="outline">
            Change Password
          </Button>
        </CardContent>
      </Card>

      {/* Save */}
      <div className="flex justify-end">
        <Button>
          <Save className="mr-2 h-4 w-4" />
          Save Settings
        </Button>
      </div>
    </div>
  );
}