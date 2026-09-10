"use client";

import { useEffect, useState } from "react";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Globe,
  Mail,
  MapPin,
  Save,
  X,
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

type Company = {
  id: string;
  ownerId: string;
  name: string;
  description: string | null;
  website: string | null;
  location: string | null;
  logoUrl: string | null;
  email: string;
  openPositions: number;
  createdAt: string;
  updatedAt: string;
};

type CompanyResponse = {
  id?: string;
  ownerId?: string;
  name?: string;
  description?: string | null;
  website?: string | null;
  location?: string | null;
  logoUrl?: string | null;
  email?: string;
  openPositions?: number;
  createdAt?: string;
  updatedAt?: string;
  error?: string;
  message?: string;
};

type CompanyForm = {
  name: string;
  description: string;
  website: string;
  location: string;
  logoUrl: string;
};

function createForm(
  company: Company
): CompanyForm {
  return {
    name: company.name,
    description:
      company.description ?? "",
    website: company.website ?? "",
    location: company.location ?? "",
    logoUrl: company.logoUrl ?? "",
  };
}

function normalizeCompany(
  data: CompanyResponse
): Company {
  if (
    !data.id ||
    !data.ownerId ||
    !data.name ||
    !data.email
  ) {
    throw new Error(
      "Company profile data is incomplete."
    );
  }

  return {
    id: data.id,
    ownerId: data.ownerId,
    name: data.name,
    description:
      data.description ?? null,
    website: data.website ?? null,
    location: data.location ?? null,
    logoUrl: data.logoUrl ?? null,
    email: data.email,
    openPositions:
      typeof data.openPositions ===
      "number"
        ? data.openPositions
        : 0,
    createdAt: data.createdAt ?? "",
    updatedAt: data.updatedAt ?? "",
  };
}

function getWebsiteLabel(
  website: string | null
) {
  if (!website) {
    return "Website not specified";
  }

  return website
    .replace(/^https?:\/\//i, "")
    .replace(/\/$/, "");
}

export default function EmployerCompanyPage() {
  const [company, setCompany] =
    useState<Company | null>(null);

  const [form, setForm] =
    useState<CompanyForm>({
      name: "",
      description: "",
      website: "",
      location: "",
      logoUrl: "",
    });

  const [employerId, setEmployerId] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [editing, setEditing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [saved, setSaved] =
    useState(false);

  useEffect(() => {
    async function loadCompany() {
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
              "Failed to load company."
          );
        }

        const normalizedCompany =
          normalizeCompany(data);

        setCompany(
          normalizedCompany
        );

        setForm(
          createForm(
            normalizedCompany
          )
        );
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load company."
        );
      } finally {
        setLoading(false);
      }
    }

    loadCompany();
  }, []);

  function updateField(
    field: keyof CompanyForm,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setSaved(false);
  }

  function cancelEditing() {
    if (company) {
      setForm(
        createForm(company)
      );
    }

    setEditing(false);
    setError("");
    setSaved(false);
  }

  async function saveCompany() {
    if (!employerId) {
      setError(
        "Employer information is missing."
      );
      return;
    }

    const companyName =
      form.name.trim();

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
            name: companyName,
            description:
              form.description,
            website: form.website,
            location: form.location,
            logoUrl: form.logoUrl,
          }),
        }
      );

      const data =
        (await response.json()) as CompanyResponse;

      if (!response.ok) {
        throw new Error(
          data.error ||
            data.message ||
            "Failed to update company."
        );
      }

      const updatedCompany =
        normalizeCompany(data);

      setCompany(updatedCompany);

      setForm(
        createForm(
          updatedCompany
        )
      );

      setEditing(false);
      setSaved(true);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to update company."
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
            Loading company...
          </p>
        </CardContent>
      </Card>
    );
  }

  if (error && !company) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Company
          </h1>

          <p className="mt-2 text-muted-foreground">
            Manage your company profile
            and employer information.
          </p>
        </div>

        <Card>
          <CardContent className="flex min-h-64 items-center justify-center p-6">
            <p className="text-sm text-destructive">
              {error}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!company) {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Company
          </h1>

          <p className="mt-2 text-muted-foreground">
            Manage your company profile
            and employer information.
          </p>
        </div>

        {!editing && (
          <Button
            type="button"
            onClick={() => {
              setEditing(true);
              setSaved(false);
              setError("");
            }}
          >
            Edit Company
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>

      {saved && (
        <Card>
          <CardContent className="flex items-center gap-2 p-4">
            <CheckCircle2 className="h-5 w-5" />

            <p className="text-sm font-medium">
              Company profile saved
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

      {editing ? (
        <Card>
          <CardHeader>
            <CardTitle>
              Edit Company
            </CardTitle>

            <p className="text-sm text-muted-foreground">
              Update the information
              shown on your company
              profile.
            </p>
          </CardHeader>

          <CardContent className="space-y-5">
            <div className="space-y-2">
              <label
                htmlFor="company-name"
                className="text-sm font-medium"
              >
                Company Name
              </label>

              <input
                id="company-name"
                type="text"
                value={form.name}
                onChange={(event) =>
                  updateField(
                    "name",
                    event.target.value
                  )
                }
                className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                placeholder="Company name"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="company-description"
                className="text-sm font-medium"
              >
                Description
              </label>

              <textarea
                id="company-description"
                value={
                  form.description
                }
                onChange={(event) =>
                  updateField(
                    "description",
                    event.target.value
                  )
                }
                className="min-h-32 w-full resize-y rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                placeholder="Tell candidates about your company..."
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <label
                  htmlFor="company-website"
                  className="text-sm font-medium"
                >
                  Website
                </label>

                <input
                  id="company-website"
                  type="text"
                  value={form.website}
                  onChange={(event) =>
                    updateField(
                      "website",
                      event.target.value
                    )
                  }
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  placeholder="https://example.com"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="company-location"
                  className="text-sm font-medium"
                >
                  Location
                </label>

                <input
                  id="company-location"
                  type="text"
                  value={form.location}
                  onChange={(event) =>
                    updateField(
                      "location",
                      event.target.value
                    )
                  }
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Istanbul, Türkiye"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="company-logo"
                className="text-sm font-medium"
              >
                Logo URL
              </label>

              <input
                id="company-logo"
                type="text"
                value={form.logoUrl}
                onChange={(event) =>
                  updateField(
                    "logoUrl",
                    event.target.value
                  )
                }
                className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                placeholder="https://example.com/logo.png"
              />

              <p className="text-xs text-muted-foreground">
                Optional. Leave this
                empty to use the default
                company icon.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                onClick={saveCompany}
                disabled={saving}
              >
                <Save className="mr-2 h-4 w-4" />
                {saving
                  ? "Saving..."
                  : "Save Company"}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={
                  cancelEditing
                }
                disabled={saving}
              >
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Company Overview */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col gap-6 md:flex-row md:items-center">
                <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-muted">
                  {company.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={
                        company.logoUrl
                      }
                      alt={`${company.name} logo`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Building2 className="h-10 w-10" />
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <h2 className="text-2xl font-semibold">
                      {company.name}
                    </h2>

                    <p className="text-muted-foreground">
                      Employer company
                      profile
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:flex-wrap sm:gap-4">
                    <span className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {company.location ||
                        "Location not specified"}
                    </span>

                    <span className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      {getWebsiteLabel(
                        company.website
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* About + Contact */}
          <section className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>
                  About the Company
                </CardTitle>
              </CardHeader>

              <CardContent>
                <p className="text-sm leading-6 text-muted-foreground">
                  {company.description ||
                    "No company description has been added yet."}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  Contact Information
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />

                  <div>
                    <p className="text-sm font-medium">
                      Email
                    </p>

                    <p className="text-sm text-muted-foreground">
                      {company.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Globe className="h-4 w-4 text-muted-foreground" />

                  <div>
                    <p className="text-sm font-medium">
                      Website
                    </p>

                    <p className="text-sm text-muted-foreground">
                      {getWebsiteLabel(
                        company.website
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />

                  <div>
                    <p className="text-sm font-medium">
                      Location
                    </p>

                    <p className="text-sm text-muted-foreground">
                      {company.location ||
                        "Location not specified"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Real company statistics */}
          <Card>
            <CardHeader>
              <CardTitle>
                Open Positions
              </CardTitle>

              <p className="text-sm text-muted-foreground">
                Published job
                postings from your
                company.
              </p>
            </CardHeader>

            <CardContent>
              <p className="text-4xl font-semibold">
                {
                  company.openPositions
                }
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                Active job posting
                {company.openPositions ===
                1
                  ? ""
                  : "s"}
              </p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}