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
    <div className="mx-auto max-w-[1380px] space-y-8">
      <Link
        href="/employer/candidates"
        className="inline-flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Candidates
      </Link>

      <div className="border-y border-black py-7">
        <p className="text-[10px] font-black uppercase tracking-[.22em] text-[#6d5dfc]">
          Talent record / 06
        </p>

        <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <h1 className="text-5xl font-black tracking-[-.06em] sm:text-6xl">
              {candidate.name}
            </h1>

            <p className="mt-3 max-w-2xl text-muted-foreground">
              Review identity, experience and capability signals before moving a candidate through the hiring pipeline.
            </p>
          </div>

          <div className="text-left lg:text-right">
            <p className="text-[10px] font-black uppercase tracking-[.18em] text-muted-foreground">
              Profile signal
            </p>
            <p className="mt-2 text-2xl font-black">
              {candidate.skills.length.toString().padStart(2, "0")} skills
            </p>
          </div>
        </div>
      </div>

      <Card className="rounded-none border-black bg-white shadow-none">
        <CardContent className="p-0">
          <div className="grid gap-0 md:grid-cols-[180px_1fr]">
            <div className="flex min-h-44 items-center justify-center border-b border-black bg-black text-5xl font-black text-white md:border-b-0 md:border-r">
              {initials}
            </div>

            <div className="space-y-5 p-7">
              <div>
                <h2 className="text-2xl font-semibold">
                  {candidate.name}
                </h2>

                <p className="text-muted-foreground">
                  {candidate.experienceTitle ||
                    "Candidate"}
                </p>
              </div>

              <div className="grid gap-3 border-t border-black/15 pt-5 text-sm text-muted-foreground sm:grid-cols-3">
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

      <section className="grid gap-0 border-y border-black md:grid-cols-2">
        <Card className="rounded-none border-0 bg-transparent shadow-none md:border-r md:border-black">
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

        <Card className="rounded-none border-0 bg-transparent shadow-none">
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

      <Card className="rounded-none border-black bg-white shadow-none">
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
            <div className="flex flex-wrap gap-2 border-t border-black/10 pt-5">
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
        <Card className="rounded-none border-black bg-black text-white shadow-none">
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