"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ArrowRight,
  BriefcaseBusiness,
  FileText,
  Sparkles,
  UserRound,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type CurrentUser = {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
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
  createdAt: string;
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
  message?: string;
};

type DashboardJob = {
  id: string;
  title: string;
  description?: string | null;
  company: string;
  skills: string[];
  workType: string;
  employmentType: string;
  published?: boolean;
  createdAt?: string;
};

type JobsResponse = {
  jobs?: DashboardJob[];
  error?: string;
  message?: string;
};

type Application = {
  id: string;
  candidateId: string;
  jobId: string;
  status: string;
  appliedAt: string;
};

type ApplicationsResponse = {
  applications?: Application[];
  error?: string;
  message?: string;
};

type RankedJob = DashboardJob & {
  matchScore: number;
  matchedSkills: string[];
};

type SkillGapItem = {
  name: string;
  demandCount: number;
  demandPercent: number;
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

function calculateMatch(
  candidateSkills: string[],
  jobSkills: string[]
) {
  if (jobSkills.length === 0) {
    return {
      score: 0,
      matchedSkills: [] as string[],
    };
  }

  const normalizedCandidateSkills =
    new Set(
      candidateSkills.map((skill) =>
        skill.trim().toLowerCase()
      )
    );

  const matchedSkills =
    jobSkills.filter((skill) =>
      normalizedCandidateSkills.has(
        skill.trim().toLowerCase()
      )
    );

  return {
    score: Math.round(
      (matchedSkills.length /
        jobSkills.length) *
        100
    ),
    matchedSkills,
  };
}

function calculateProfileCompletion(
  candidate: Candidate
) {
  const fields = [
    candidate.name,
    candidate.email,
    candidate.bio,
    candidate.phone,
    candidate.location,
    candidate.experienceTitle,
    candidate.experienceYears !== null
      ? String(candidate.experienceYears)
      : "",
    candidate.skills.length > 0
      ? candidate.skills.join(",")
      : "",
  ];

  const completedFields =
    fields.filter((field) => {
      if (typeof field !== "string") {
        return false;
      }

      return field.trim().length > 0;
    }).length;

  return Math.round(
    (completedFields /
      fields.length) *
      100
  );
}

function getMatchLabel(score: number) {
  if (score >= 80) {
    return "Strong match";
  }

  if (score >= 50) {
    return "Good match";
  }

  if (score > 0) {
    return "Partial match";
  }

  return "No skill match";
}

export default function CandidateDashboard() {
  const [candidate, setCandidate] =
    useState<Candidate | null>(null);

  const [jobs, setJobs] =
    useState<DashboardJob[]>([]);

  const [
    applications,
    setApplications,
  ] = useState<Application[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function loadDashboard() {
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
            "candidate"
        ) {
          setError(
            "This page is only available for candidates."
          );
          return;
        }

        const candidateId =
          currentUser.id;

        const [
          candidateResponse,
          jobsResponse,
          applicationsResponse,
        ] = await Promise.all([
          fetch(
            `/api/candidates/${encodeURIComponent(
              candidateId
            )}`,
            {
              cache: "no-store",
            }
          ),
          fetch("/api/jobs", {
            cache: "no-store",
          }),
          fetch(
            `/api/applications?candidateId=${encodeURIComponent(
              candidateId
            )}`,
            {
              cache: "no-store",
            }
          ),
        ]);

        const candidateData =
          (await candidateResponse.json()) as CandidateResponse;

        const jobsData =
          (await jobsResponse.json()) as JobsResponse;

        const applicationsData =
          (await applicationsResponse.json()) as ApplicationsResponse;

        if (!candidateResponse.ok) {
          throw new Error(
            candidateData.error ||
              candidateData.message ||
              "Failed to load candidate profile."
          );
        }

        if (
          !candidateData.id ||
          !candidateData.name ||
          !candidateData.email
        ) {
          throw new Error(
            "Candidate profile data is incomplete."
          );
        }

        if (!jobsResponse.ok) {
          throw new Error(
            jobsData.error ||
              jobsData.message ||
              "Failed to load jobs."
          );
        }

        if (
          !applicationsResponse.ok
        ) {
          throw new Error(
            applicationsData.error ||
              applicationsData.message ||
              "Failed to load applications."
          );
        }

        setCandidate({
          id: candidateData.id,
          name: candidateData.name,
          email: candidateData.email,
          bio:
            candidateData.bio ?? null,
          phone:
            candidateData.phone ?? null,
          location:
            candidateData.location ??
            null,
          experienceTitle:
            candidateData.experienceTitle ??
            null,
          experienceYears:
            typeof candidateData.experienceYears ===
            "number"
              ? candidateData.experienceYears
              : null,
          skills: normalizeSkills(
            candidateData.skills
          ),
          createdAt:
            candidateData.createdAt ??
            "",
        });

        setJobs(
          Array.isArray(jobsData.jobs)
            ? jobsData.jobs
            : []
        );

        setApplications(
          Array.isArray(
            applicationsData.applications
          )
            ? applicationsData.applications
            : []
        );
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load dashboard."
        );
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const profileCompletion =
    useMemo(() => {
      if (!candidate) {
        return 0;
      }

      return calculateProfileCompletion(
        candidate
      );
    }, [candidate]);

  const rankedJobs =
    useMemo<RankedJob[]>(() => {
      if (!candidate) {
        return [];
      }

      return jobs
        .map((job) => {
          const match =
            calculateMatch(
              candidate.skills,
              job.skills
            );

          return {
            ...job,
            matchScore: match.score,
            matchedSkills:
              match.matchedSkills,
          };
        })
        .sort(
          (a, b) =>
            b.matchScore -
            a.matchScore
        );
    }, [candidate, jobs]);

  const recommendedJobs =
    useMemo(
      () => rankedJobs.slice(0, 3),
      [rankedJobs]
    );

  const bestMatch =
    rankedJobs.length > 0
      ? rankedJobs[0].matchScore
      : 0;

  const matchingJobs =
    useMemo(
      () =>
        rankedJobs.filter(
          (job) =>
            job.matchScore > 0
        ).length,
      [rankedJobs]
    );

  const skillGaps =
    useMemo<SkillGapItem[]>(() => {
      if (!candidate) {
        return [];
      }

      const candidateSkills =
        new Set(
          candidate.skills.map(
            (skill) =>
              skill
                .trim()
                .toLowerCase()
          )
        );

      const demand =
        new Map<
          string,
          {
            name: string;
            count: number;
          }
        >();

      for (const job of jobs) {
        const uniqueJobSkills =
          new Set(
            job.skills.map(
              (skill) =>
                skill.trim()
            )
          );

        for (const skill of uniqueJobSkills) {
          const normalized =
            skill.toLowerCase();

          if (
            candidateSkills.has(
              normalized
            )
          ) {
            continue;
          }

          const current =
            demand.get(normalized);

          demand.set(normalized, {
            name:
              current?.name ??
              skill,
            count:
              (current?.count ??
                0) + 1,
          });
        }
      }

      return Array.from(
        demand.values()
      )
        .map((skill) => ({
          name: skill.name,
          demandCount:
            skill.count,
          demandPercent:
            jobs.length > 0
              ? Math.round(
                  (skill.count /
                    jobs.length) *
                    100
                )
              : 0,
        }))
        .sort(
          (a, b) =>
            b.demandCount -
            a.demandCount
        )
        .slice(0, 3);
    }, [candidate, jobs]);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex min-h-64 items-center justify-center p-6">
          <p className="text-sm text-muted-foreground">
            Loading dashboard...
          </p>
        </CardContent>
      </Card>
    );
  }

  if (error || !candidate) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Candidate Dashboard
          </h1>

          <p className="mt-2 text-muted-foreground">
            Track your profile,
            matches and applications.
          </p>
        </div>

        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-destructive">
              {error ||
                "Candidate profile could not be loaded."}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />

          <span className="text-sm font-medium">
            Candidate Overview
          </span>
        </div>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Welcome, {candidate.name}
        </h1>

        <p className="mt-2 text-muted-foreground">
          Track your profile,
          opportunities and
          applications.
        </p>
      </div>

      {/* Overview */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-base font-medium">
                Profile Completion
              </CardTitle>

              <UserRound className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>

          <CardContent>
            <p className="text-4xl font-semibold">
              {profileCompletion}%
            </p>

            <Progress
              value={
                profileCompletion
              }
              className="mt-4"
            />

            <p className="mt-3 text-sm text-muted-foreground">
              Based on your saved
              profile information.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-base font-medium">
                Best Job Match
              </CardTitle>

              <Sparkles className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>

          <CardContent>
            <p className="text-4xl font-semibold">
              {bestMatch}%
            </p>

            <Progress
              value={bestMatch}
              className="mt-4"
            />

            <p className="mt-3 text-sm text-muted-foreground">
              Best skill overlap
              across published jobs.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-base font-medium">
                Matching Jobs
              </CardTitle>

              <BriefcaseBusiness className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>

          <CardContent>
            <p className="text-4xl font-semibold">
              {matchingJobs}
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              Jobs sharing at least
              one of your skills
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-base font-medium">
                Applications
              </CardTitle>

              <FileText className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>

          <CardContent>
            <p className="text-4xl font-semibold">
              {applications.length}
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              Submitted job
              applications
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Recommended Jobs */}
      <section className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold">
              Recommended Jobs
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Published jobs ranked
              by overlap with your
              saved skills.
            </p>
          </div>

          <Link href="/candidate/jobs">
            <Button variant="outline">
              View All Jobs
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {recommendedJobs.length ===
        0 ? (
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">
                No job postings are
                available yet.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {recommendedJobs.map(
              (job) => (
                <Card key={job.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                      <div className="space-y-3">
                        <div>
                          <h3 className="font-semibold">
                            {job.title}
                          </h3>

                          <p className="text-sm text-muted-foreground">
                            {job.company}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {job.skills
                            .slice(0, 5)
                            .map(
                              (skill) => (
                                <Badge
                                  key={`${job.id}-${skill}`}
                                  variant="secondary"
                                >
                                  {skill}
                                </Badge>
                              )
                            )}
                        </div>

                        <p className="text-sm text-muted-foreground">
                          {job.workType} ·{" "}
                          {
                            job.employmentType
                          }
                        </p>
                      </div>

                      <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                        <div className="text-right">
                          <Badge>
                            {
                              job.matchScore
                            }
                            % Match
                          </Badge>

                          <p className="mt-2 text-xs text-muted-foreground">
                            {getMatchLabel(
                              job.matchScore
                            )}
                          </p>
                        </div>

                        <Link
                          href={`/candidate/jobs/${encodeURIComponent(
                            job.id
                          )}`}
                        >
                          <Button
                            variant="outline"
                            size="sm"
                          >
                            View Job
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            )}
          </div>
        )}
      </section>

      {/* Applications + Skill Gap */}
      <section className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>
              Applications
            </CardTitle>

            <p className="text-sm text-muted-foreground">
              Your submitted job
              applications.
            </p>
          </CardHeader>

          <CardContent className="space-y-4">
            <p className="text-3xl font-semibold">
              {applications.length}
            </p>

            <Link href="/candidate/applications">
              <Button
                variant="outline"
                className="w-full"
              >
                View Applications
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              Skill Gap
            </CardTitle>

            <p className="text-sm text-muted-foreground">
              Most requested job
              skills you have not
              added yet.
            </p>
          </CardHeader>

          <CardContent className="space-y-4">
            {skillGaps.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No missing skills
                were found from the
                current job postings.
              </p>
            ) : (
              skillGaps.map(
                (skill) => (
                  <div
                    key={
                      skill.name
                    }
                  >
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <span className="text-sm font-medium">
                        {
                          skill.name
                        }
                      </span>

                      <span className="text-xs text-muted-foreground">
                        {
                          skill.demandPercent
                        }
                        % of jobs
                      </span>
                    </div>

                    <Progress
                      value={
                        skill.demandPercent
                      }
                    />
                  </div>
                )
              )
            )}

            <Link href="/candidate/skill-gap">
              <Button
                variant="outline"
                className="w-full"
              >
                View Skill Gap
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}