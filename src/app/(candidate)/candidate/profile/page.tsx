"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
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
import { Progress } from "@/components/ui/progress";
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
  createdAt?: string;
};

type CurrentUser = {
  id: string;
  name: string;
  email: string;
  role: string;
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
};

function normalizeSkills(skills: CandidateApiResponse["skills"]): string[] {
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

export default function CandidateProfilePage() {
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        setError("");

        const storedUser = localStorage.getItem("currentUser");

        if (!storedUser) {
          setError("You need to log in to view your profile.");
          return;
        }

        const currentUser = JSON.parse(storedUser) as CurrentUser;

        if (
          !currentUser.role ||
          currentUser.role.toLowerCase() !== "candidate"
        ) {
          setError("This page is only available for candidates.");
          return;
        }

        const response = await fetch(
          `/api/candidates/${encodeURIComponent(currentUser.id)}`
        );

        const data = (await response.json()) as CandidateApiResponse & {
          error?: string;
        };

        if (!response.ok) {
          throw new Error(data.error || "Failed to load profile.");
        }

        const normalizedCandidate: Candidate = {
          id: data.id || currentUser.id,
          name: data.name || currentUser.name || "Candidate",
          email: data.email || currentUser.email || "",
          bio: data.bio ?? null,
          phone: data.phone ?? null,
          location: data.location ?? null,
          experienceTitle: data.experienceTitle ?? null,
          experienceYears:
            typeof data.experienceYears === "number"
              ? data.experienceYears
              : null,
          skills: normalizeSkills(data.skills),
          createdAt: data.createdAt,
        };

        setCandidate(normalizedCandidate);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load profile."
        );
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  const completion = useMemo(() => {
    if (!candidate) {
      return 0;
    }

    const profileFields = [
      candidate.name,
      candidate.email,
      candidate.phone,
      candidate.location,
      candidate.bio,
      candidate.experienceTitle,
      candidate.experienceYears,
      candidate.skills.length > 0 ? candidate.skills : null,
    ];

    const completedFields = profileFields.filter((field) => {
      if (Array.isArray(field)) {
        return field.length > 0;
      }

      if (typeof field === "string") {
        return field.trim().length > 0;
      }

      return field !== null && field !== undefined;
    }).length;

    return Math.round(
      (completedFields / profileFields.length) * 100
    );
  }, [candidate]);

  const initials = useMemo(() => {
    if (!candidate?.name) {
      return "?";
    }

    return candidate.name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("");
  }, [candidate]);

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            My Profile
          </h1>

          <p className="mt-2 text-muted-foreground">
            Loading your profile...
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
            My Profile
          </h1>

          <p className="mt-2 text-muted-foreground">
            Manage your professional profile and career information.
          </p>
        </div>

        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-destructive">
              {error || "Profile could not be loaded."}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            My Profile
          </h1>

          <p className="mt-2 text-muted-foreground">
            Manage your professional profile and career information.
          </p>
        </div>

        <Link
          href="/candidate/settings"
          className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          Edit Profile
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
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
                  {candidate.experienceTitle || "Candidate"}
                </p>
              </div>

              <div className="flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:flex-wrap sm:gap-4">
                <span className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {candidate.email}
                </span>

                <span className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {candidate.location || "Location not specified"}
                </span>

                {candidate.phone && (
                  <span className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {candidate.phone}
                  </span>
                )}

                <span className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />

                  {candidate.experienceYears !== null
                    ? `${candidate.experienceYears} year${
                        candidate.experienceYears === 1 ? "" : "s"
                      } experience`
                    : "Experience not specified"}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle>Profile Completion</CardTitle>

              <p className="mt-1 text-sm text-muted-foreground">
                Complete your profile to improve your job matches.
              </p>
            </div>

            <span className="text-2xl font-semibold">
              {completion}%
            </span>
          </div>
        </CardHeader>

        <CardContent>
          <Progress value={completion} />

          <p className="mt-3 text-sm text-muted-foreground">
            {completion === 100
              ? "Your profile is complete."
              : "Add missing profile information to reach 100%."}
          </p>
        </CardContent>
      </Card>

      <section className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>About Me</CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-sm leading-6 text-muted-foreground">
              {candidate.bio || "No professional summary added yet."}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Experience</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="space-y-2">
              <h3 className="font-medium">
                {candidate.experienceTitle ||
                  "Experience title not specified"}
              </h3>

              <p className="text-sm text-muted-foreground">
                {candidate.experienceYears !== null
                  ? `${candidate.experienceYears} year${
                      candidate.experienceYears === 1 ? "" : "s"
                    } of experience`
                  : "Experience duration not specified"}
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Skills</CardTitle>

          <p className="text-sm text-muted-foreground">
            Technologies and skills included in your profile.
          </p>
        </CardHeader>

        <CardContent>
          {candidate.skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {candidate.skills.map((skill) => (
                <Badge key={skill}>
                  {skill}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No skills added yet.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <p className="font-medium">
                Email
              </p>

              <p className="mt-1 text-muted-foreground">
                {candidate.email}
              </p>
            </div>

            <div>
              <p className="font-medium">
                Phone
              </p>

              <p className="mt-1 text-muted-foreground">
                {candidate.phone || "Not specified"}
              </p>
            </div>

            <div>
              <p className="font-medium">
                Location
              </p>

              <p className="mt-1 text-muted-foreground">
                {candidate.location || "Not specified"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}