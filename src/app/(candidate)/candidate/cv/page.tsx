"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Briefcase,
  Download,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type CurrentUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type CandidateResponse = {
  id?: string;
  name?: string;
  email?: string;
  bio?: string | null;
  phone?: string | null;
  location?: string | null;
  experienceTitle?: string | null;
  experienceYears?: number | null;
  skills?: string[] | string | null;
  createdAt?: string;
  error?: string;
};

type Candidate = {
  id: string;
  name: string;
  email: string;
  bio: string | null;
  phone: string | null;
  location: string | null;
  experienceTitle: string | null;
  experienceYears: number | null;
  skills: string[];
};

function normalizeSkills(
  skills: CandidateResponse["skills"]
): string[] {
  if (Array.isArray(skills)) {
    return skills
      .map((skill) => skill.trim())
      .filter(Boolean);
  }

  if (typeof skills === "string") {
    return skills
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);
  }

  return [];
}

function getInitials(name: string) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return "CV";
  }

  if (parts.length === 1) {
    return parts[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return `${parts[0][0]}${
    parts[parts.length - 1][0]
  }`.toUpperCase();
}

export default function CandidateCVPage() {
  const [candidate, setCandidate] =
    useState<Candidate | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function loadCandidate() {
      try {
        setLoading(true);
        setError("");

        const storedUser =
          localStorage.getItem("currentUser");

        if (!storedUser) {
          setError(
            "You need to log in to view your CV."
          );
          return;
        }

        const currentUser = JSON.parse(
          storedUser
        ) as CurrentUser;

        if (
          !currentUser.role ||
          currentUser.role.toLowerCase() !==
            "candidate"
        ) {
          setError(
            "This page is only available for candidates."
          );
          return;
        }

        const response = await fetch(
          `/api/candidates/${encodeURIComponent(
            currentUser.id
          )}`,
          {
            cache: "no-store",
          }
        );

        const data =
          (await response.json()) as CandidateResponse;

        if (!response.ok) {
          throw new Error(
            data.error ||
              "Failed to load CV."
          );
        }

        setCandidate({
          id:
            data.id ||
            currentUser.id,

          name:
            data.name ||
            currentUser.name ||
            "Candidate",

          email:
            data.email ||
            currentUser.email ||
            "",

          bio:
            data.bio ?? null,

          phone:
            data.phone ?? null,

          location:
            data.location ?? null,

          experienceTitle:
            data.experienceTitle ?? null,

          experienceYears:
            typeof data.experienceYears ===
            "number"
              ? data.experienceYears
              : null,

          skills: normalizeSkills(
            data.skills
          ),
        });
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load CV."
        );
      } finally {
        setLoading(false);
      }
    }

    loadCandidate();
  }, []);

  const initials = useMemo(() => {
    if (!candidate) {
      return "CV";
    }

    return getInitials(
      candidate.name
    );
  }, [candidate]);

  function downloadCV() {
    window.print();
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            My CV
          </h1>

          <p className="mt-2 text-muted-foreground">
            Loading your CV...
          </p>
        </div>
      </div>
    );
  }

  if (error || !candidate) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            My CV
          </h1>

          <p className="mt-2 text-muted-foreground">
            View your professional CV.
          </p>
        </div>

        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-destructive">
              {error ||
                "Candidate information could not be loaded."}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="print:hidden">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              My CV
            </h1>

            <p className="mt-2 text-muted-foreground">
              Your CV is generated from your
              current profile information.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Link
              href="/candidate/profile"
              className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Profile
            </Link>

            <Button
              type="button"
              onClick={downloadCV}
            >
              <Download className="mr-2 h-4 w-4" />
              Download CV
            </Button>
          </div>
        </div>
      </div>

      <div
        id="candidate-cv"
        className="space-y-6 print:space-y-4"
      >
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-muted text-3xl font-semibold">
                {initials}
              </div>

              <div className="space-y-3">
                <div>
                  <h2 className="text-2xl font-semibold">
                    {candidate.name}
                  </h2>

                  <p className="text-muted-foreground">
                    {candidate.experienceTitle ||
                      "Candidate"}
                  </p>
                </div>

                <div className="flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:flex-wrap sm:gap-4">
                  <span className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {candidate.email}
                  </span>

                  {candidate.location && (
                    <span className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {candidate.location}
                    </span>
                  )}

                  {candidate.phone && (
                    <span className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {candidate.phone}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              Professional Summary
            </CardTitle>
          </CardHeader>

          <CardContent>
            {candidate.bio ? (
              <p className="text-sm leading-6 text-muted-foreground">
                {candidate.bio}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                No professional summary has been
                added yet.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              Skills
            </CardTitle>
          </CardHeader>

          <CardContent>
            {candidate.skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {candidate.skills.map(
                  (skill) => (
                    <Badge key={skill}>
                      {skill}
                    </Badge>
                  )
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No skills have been added yet.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Experience
            </CardTitle>
          </CardHeader>

          <CardContent>
            {candidate.experienceTitle ||
            candidate.experienceYears !==
              null ? (
              <div className="space-y-2">
                <h3 className="font-semibold">
                  {candidate.experienceTitle ||
                    "Professional Experience"}
                </h3>

                {candidate.experienceYears !==
                  null && (
                  <p className="text-sm text-muted-foreground">
                    {candidate.experienceYears}{" "}
                    year
                    {candidate.experienceYears ===
                    1
                      ? ""
                      : "s"}{" "}
                    of experience
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No experience information has
                been added yet.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="print:hidden">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">
              To add or update information in
              your CV, edit your candidate
              profile.
            </p>

            <Link
              href="/candidate/settings"
              className="mt-4 inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              Edit Profile
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}