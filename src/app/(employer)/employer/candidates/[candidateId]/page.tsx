"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Briefcase,
  Mail,
  MapPin,
  User,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
  createdAt: string;
};

type CandidateApiResponse = {
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
  message?: string;
};

type CandidatePageProps = {
  params: Promise<{
    candidateId: string;
  }>;
};

function normalizeSkills(
  skills: string[] | string | null | undefined
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
  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return initials || "?";
}

export default function EmployerCandidatePage({
  params,
}: CandidatePageProps) {
  const [candidateId, setCandidateId] =
    useState<string | null>(null);

  const [candidate, setCandidate] =
    useState<Candidate | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function resolveParams() {
      try {
        const resolvedParams =
          await params;

        setCandidateId(
          resolvedParams.candidateId
        );
      } catch {
        setError(
          "Unable to resolve candidate."
        );
        setLoading(false);
      }
    }

    resolveParams();
  }, [params]);

  useEffect(() => {
    if (!candidateId) {
      return;
    }

    const currentCandidateId =
      candidateId;

    async function loadCandidate() {
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

        let currentUser: {
          id?: string;
          role?: string;
        };

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
          !currentUser.role ||
          currentUser.role.toLowerCase() !==
            "employer"
        ) {
          window.location.href =
            "/candidate/dashboard";
          return;
        }

        const response = await fetch(
          `/api/candidates/${encodeURIComponent(
            currentCandidateId
          )}`,
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const data =
          (await response.json()) as CandidateApiResponse;

        if (!response.ok) {
          throw new Error(
            data.error ||
              data.message ||
              "Unable to load candidate."
          );
        }

        if (
          !data.id ||
          !data.name ||
          !data.email
        ) {
          throw new Error(
            "Candidate profile data is incomplete."
          );
        }

        setCandidate({
          id: data.id,
          name: data.name,
          email: data.email,
          bio: data.bio ?? null,
          phone: data.phone ?? null,
          location:
            data.location ?? null,
          experienceTitle:
            data.experienceTitle ??
            null,
          experienceYears:
            typeof data.experienceYears ===
            "number"
              ? data.experienceYears
              : null,
          skills: normalizeSkills(
            data.skills
          ),
          createdAt:
            data.createdAt ?? "",
        });
      } catch (error) {
        setCandidate(null);

        setError(
          error instanceof Error
            ? error.message
            : "Unable to connect to the server."
        );
      } finally {
        setLoading(false);
      }
    }

    loadCandidate();
  }, [candidateId]);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex min-h-64 items-center justify-center p-6">
          <p className="text-sm text-muted-foreground">
            Loading candidate...
          </p>
        </CardContent>
      </Card>
    );
  }

  if (error || !candidate) {
    return (
      <div className="space-y-6">
        <Link
          href="/employer/candidates"
          className="inline-flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Candidates
        </Link>

        <Card>
          <CardContent className="flex min-h-64 items-center justify-center p-6">
            <p className="text-sm text-destructive">
              {error ||
                "Candidate not found."}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const initials =
    getInitials(candidate.name);

  return (
    <div className="space-y-8">
      <Link
        href="/employer/candidates"
        className="inline-flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Candidates
      </Link>

      <div>
        <p className="text-sm font-medium text-muted-foreground">
          Candidate Profile
        </p>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          {candidate.name}
        </h1>

        <p className="mt-2 text-muted-foreground">
          Review the candidate&apos;s
          professional information.
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-center">
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

              <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {candidate.email}
                </span>

                <span className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />

                  {candidate.location ||
                    "Location not specified"}
                </span>

                <span className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />

                  {candidate.experienceYears !==
                  null
                    ? `${candidate.experienceYears} year${
                        candidate.experienceYears ===
                        1
                          ? ""
                          : "s"
                      } experience`
                    : "Experience not specified"}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <section className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>
              About Candidate
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-sm leading-6 text-muted-foreground">
              {candidate.bio ||
                "The candidate has not added a biography yet."}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              Experience
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />

                <span className="font-medium">
                  {candidate.experienceTitle ||
                    "Not specified"}
                </span>
              </div>

              <p className="text-sm text-muted-foreground">
                {candidate.experienceYears !==
                null
                  ? `${candidate.experienceYears} year${
                      candidate.experienceYears ===
                      1
                        ? ""
                        : "s"
                    } of experience`
                  : "Experience duration not specified"}
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>
            Skills
          </CardTitle>

          <p className="text-sm text-muted-foreground">
            Skills listed on the
            candidate&apos;s profile.
          </p>
        </CardHeader>

        <CardContent>
          {candidate.skills.length >
          0 ? (
            <div className="flex flex-wrap gap-2">
              {candidate.skills.map(
                (skill) => (
                  <Badge
                    key={skill}
                    variant="secondary"
                  >
                    {skill}
                  </Badge>
                )
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No skills have been
              added yet.
            </p>
          )}
        </CardContent>
      </Card>

      {candidate.phone && (
        <Card>
          <CardHeader>
            <CardTitle>
              Contact
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-sm text-muted-foreground">
              Phone:{" "}
              <span className="text-foreground">
                {candidate.phone}
              </span>
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}