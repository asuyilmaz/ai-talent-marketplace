"use client";

import { useEffect, useState } from "react";
import {
  Building2,
  CheckCircle2,
  Save,
  UserRound,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type CurrentUser = {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
};

type CompanyResponse = {
  id?: string;
  ownerId?: string;
  name?: string;
  description?: string | null;
  website?: string | null;
  location?: string | null;
  logoUrl?: string | null;
  employerName?: string;
  email?: string;
  openPositions?: number;
  createdAt?: string;
  updatedAt?: string;
  error?: string;
  message?: string;
};

type SettingsForm = {
  employerName: string;
  employerEmail: string;
  companyName: string;
  website: string;
};

export default function EmployerSettingsPage() {
  const [employerId, setEmployerId] =
    useState("");

  const [form, setForm] =
    useState<SettingsForm>({
      employerName: "",
      employerEmail: "",
      companyName: "",
      website: "",
    });

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [saved, setSaved] =
    useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        setLoading(true);
        setError("");

        const storedUser =
          localStorage.getItem(
            "currentUser"
          );

        if (!storedUser) {
          window.location.href =
            "/login";
          return;
        }

        let currentUser: CurrentUser;

        try {
          currentUser =
            JSON.parse(storedUser);
        } catch {
          localStorage.removeItem(
            "currentUser"
          );

          window.location.href =
            "/login";
          return;
        }

        if (
          !currentUser.id ||
          !currentUser.role ||
          currentUser.role.toLowerCase() !==
            "employer"
        ) {
          setError(
            "This page is only available for employers."
          );
          return;
        }

        setEmployerId(currentUser.id);

        const response = await fetch(
          `/api/company?employerId=${encodeURIComponent(
            currentUser.id
          )}`,
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const data =
          (await response.json()) as CompanyResponse;

        if (!response.ok) {
          throw new Error(
            data.error ||
              data.message ||
              "Failed to load settings."
          );
        }

        if (
          !data.employerName ||
          !data.email ||
          !data.name
        ) {
          throw new Error(
            "Account data is incomplete."
          );
        }

        setForm({
          employerName:
            data.employerName,
          employerEmail:
            data.email,
          companyName: data.name,
          website:
            data.website ?? "",
        });
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load settings."
        );
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, []);

  function updateField(
    field: keyof SettingsForm,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setSaved(false);
    setError("");
  }

  async function saveSettings() {
    if (!employerId) {
      setError(
        "Employer information is missing."
      );
      return;
    }

    const employerName =
      form.employerName.trim();

    const employerEmail =
      form.employerEmail
        .trim()
        .toLowerCase();

    const companyName =
      form.companyName.trim();

    if (!employerName) {
      setError(
        "Account name is required."
      );
      return;
    }

    if (!employerEmail) {
      setError(
        "Account email is required."
      );
      return;
    }

    if (!companyName) {
      setError(
        "Company name is required."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSaved(false);

      const response = await fetch(
        "/api/company",
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            employerId,
            employerName,
            employerEmail,
            name: companyName,
            website: form.website,
          }),
        }
      );

      const data =
        (await response.json()) as CompanyResponse;

      if (!response.ok) {
        throw new Error(
          data.error ||
            data.message ||
            "Failed to save settings."
        );
      }

      if (
        !data.employerName ||
        !data.email ||
        !data.name
      ) {
        throw new Error(
          "Updated account data is incomplete."
        );
      }

      setForm({
        employerName:
          data.employerName,
        employerEmail:
          data.email,
        companyName: data.name,
        website:
          data.website ?? "",
      });

      const storedUser =
        localStorage.getItem(
          "currentUser"
        );

      if (storedUser) {
        try {
          const currentUser =
            JSON.parse(
              storedUser
            ) as CurrentUser;

          localStorage.setItem(
            "currentUser",
            JSON.stringify({
              ...currentUser,
              name:
                data.employerName,
              email: data.email,
            })
          );
        } catch {
          // Database update succeeded.
          // Ignore malformed local cache here.
        }
      }

      setSaved(true);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to save settings."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex min-h-64 items-center justify-center p-6">
          <p className="text-sm text-muted-foreground">
            Loading settings...
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-[1380px] space-y-8">
      {/* Header */}
      <div className="border-y border-black py-7">
        <p className="text-[10px] font-black uppercase tracking-[.22em] text-[#6d5dfc]">
          Workspace controls / 08
        </p>

        <h1 className="mt-3 text-5xl font-black tracking-[-.06em] sm:text-6xl">
          Settings
        </h1>

        <p className="mt-3 max-w-2xl text-muted-foreground">
          Keep employer identity and company account details aligned across the hiring workspace.
        </p>
      </div>

      {saved && (
        <Card>
          <CardContent className="flex items-center gap-2 p-4">
            <CheckCircle2 className="h-5 w-5" />

            <p className="text-sm font-medium">
              Settings saved
              successfully.
            </p>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-destructive">
              {error}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Employer Account */}
      <div className="grid gap-0 border-y border-black lg:grid-cols-2">
      <Card className="rounded-none border-0 bg-transparent shadow-none lg:border-r lg:border-black">
        <CardHeader>
          <div className="flex items-center gap-2">
            <UserRound className="h-5 w-5" />
            <CardTitle>
              Employer Account
            </CardTitle>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="space-y-2">
            <label
              htmlFor="employerName"
              className="text-sm font-medium"
            >
              Account Name
            </label>

            <input
              id="employerName"
              type="text"
              value={
                form.employerName
              }
              onChange={(event) =>
                updateField(
                  "employerName",
                  event.target.value
                )
              }
              className="h-12 w-full border-0 border-b border-black bg-transparent px-0 text-sm outline-none transition focus:border-[#6d5dfc]"
              placeholder="Your name"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="employerEmail"
              className="text-sm font-medium"
            >
              Account Email
            </label>

            <input
              id="employerEmail"
              type="email"
              value={
                form.employerEmail
              }
              onChange={(event) =>
                updateField(
                  "employerEmail",
                  event.target.value
                )
              }
              className="h-12 w-full border-0 border-b border-black bg-transparent px-0 text-sm outline-none transition focus:border-[#6d5dfc]"
              placeholder="you@example.com"
            />
          </div>
        </CardContent>
      </Card>

      {/* Company Account */}
      <Card className="rounded-none border-0 bg-transparent shadow-none">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            <CardTitle>
              Company Account
            </CardTitle>
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
              value={
                form.companyName
              }
              onChange={(event) =>
                updateField(
                  "companyName",
                  event.target.value
                )
              }
              className="h-12 w-full border-0 border-b border-black bg-transparent px-0 text-sm outline-none transition focus:border-[#6d5dfc]"
              placeholder="Company name"
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
              value={form.website}
              onChange={(event) =>
                updateField(
                  "website",
                  event.target.value
                )
              }
              className="h-12 w-full border-0 border-b border-black bg-transparent px-0 text-sm outline-none transition focus:border-[#6d5dfc]"
              placeholder="https://example.com"
            />
          </div>

          <p className="text-xs text-muted-foreground">
            Company description,
            location and logo can be
            managed from the Company
            page.
          </p>
        </CardContent>
      </Card>

      </div>

      {/* Unsupported settings explanation */}
      <Card className="rounded-none border-black bg-black text-white shadow-none">
        <CardHeader>
          <CardTitle>
            Hiring Preferences
          </CardTitle>
        </CardHeader>

        <CardContent>
          <p className="text-sm leading-6 text-muted-foreground">
            Hiring preference and
            notification settings are
            not enabled yet because
            they are not currently
            stored in the application
            database.
          </p>
        </CardContent>
      </Card>

      {/* Save */}
      <div className="flex justify-end border-t border-black pt-6">
        <Button
          type="button"
          onClick={saveSettings}
          disabled={saving}
        >
          <Save className="mr-2 h-4 w-4" />

          {saving
            ? "Saving..."
            : "Save Settings"}
        </Button>
      </div>
    </div>
  );
}