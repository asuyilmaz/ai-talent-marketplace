"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Sparkles,
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
  name?: string;
  email?: string;
  role?: string;
};

type CandidateResponse = {
  id?: string;
  name?: string;
  email?: string;
  skills?: string[] | string | null;
  error?: string;
  message?: string;
};

type Job = {
  id: string;
  title: string;
  description?: string | null;
  company: string;
  skills: string[];
  workType: string;
  employmentType: string;
};

type JobsResponse = {
  jobs?: Job[];
  message?: string;
  error?: string;
};

type JobMatch = Job & {
  score: number;
  matchedSkills: string[];
  missingSkills: string[];
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

function normalizeSkillName(skill: string) {
  return skill.trim().toLowerCase();
}

function calculateMatch(
  candidateSkills: string[],
  jobSkills: string[]
) {
  if (jobSkills.length === 0) {
    return {
      score: 0,
      matchedSkills: [] as string[],
      missingSkills: [] as string[],
    };
  }

  const candidateSkillSet = new Set(
    candidateSkills.map(normalizeSkillName)
  );

  const matchedSkills = jobSkills.filter((skill) =>
    candidateSkillSet.has(normalizeSkillName(skill))
  );

  const missingSkills = jobSkills.filter(
    (skill) =>
      !candidateSkillSet.has(
        normalizeSkillName(skill)
      )
  );

  const score = Math.round(
    (matchedSkills.length / jobSkills.length) *
      100
  );

  return {
    score,
    matchedSkills,
    missingSkills,
  };
}

function getCompatibilityText(score: number) {
  if (score >= 80) {
    return "Excellent compatibility";
  }

  if (score >= 60) {
    return "Strong compatibility";
  }

  if (score >= 40) {
    return "Moderate compatibility";
  }

  if (score > 0) {
    return "Some skill overlap";
  }

  return "Skills need improvement";
}

export default function CandidateMatchesPage() {
  const [candidateSkills, setCandidateSkills] =
    useState<string[]>([]);

  const [jobs, setJobs] = useState<Job[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function loadMatches() {
      try {
        setLoading(true);
        setError("");

        const storedUser =
          localStorage.getItem("currentUser");

        if (!storedUser) {
          setError(
            "Please log in to view your matches."
          );
          return;
        }

        const currentUser = JSON.parse(
          storedUser
        ) as CurrentUser;

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

        const [
          candidateResponse,
          jobsResponse,
        ] = await Promise.all([
          fetch(
            `/api/candidates/${encodeURIComponent(
              currentUser.id
            )}`,
            {
              method: "GET",
              cache: "no-store",
            }
          ),

          fetch("/api/jobs", {
            method: "GET",
            cache: "no-store",
          }),
        ]);

        const candidateData =
          (await candidateResponse.json()) as CandidateResponse;

        const jobsData =
          (await jobsResponse.json()) as JobsResponse;

        if (!candidateResponse.ok) {
          throw new Error(
            candidateData.error ||
              candidateData.message ||
              "Unable to load candidate profile."
          );
        }

        if (!jobsResponse.ok) {
          throw new Error(
            jobsData.error ||
              jobsData.message ||
              "Unable to load jobs."
          );
        }

        setCandidateSkills(
          normalizeSkills(
            candidateData.skills
          )
        );

        setJobs(
          Array.isArray(jobsData.jobs)
            ? jobsData.jobs
            : []
        );
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Unable to load job matches."
        );
      } finally {
        setLoading(false);
      }
    }

    loadMatches();
  }, []);

  const matches = useMemo<JobMatch[]>(
    () =>
      jobs
        .map((job) => {
          const jobSkills = normalizeSkills(
            job.skills
          );

          const match = calculateMatch(
            candidateSkills,
            jobSkills
          );

          return {
            ...job,
            skills: jobSkills,
            score: match.score,
            matchedSkills:
              match.matchedSkills,
            missingSkills:
              match.missingSkills,
          };
        })
        .sort(
          (a, b) => b.score - a.score
        ),
    [candidateSkills, jobs]
  );

  const bestMatch =
    matches.length > 0
      ? matches[0].score
      : 0;

  const strongMatches =
    matches.filter(
      (match) => match.score >= 70
    ).length;

  const averageMatch =
    matches.length > 0
      ? Math.round(
          matches.reduce(
            (total, match) =>
              total + match.score,
            0
          ) / matches.length
        )
      : 0;

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />

            <span className="text-sm font-medium">
              AI Matching
            </span>
          </div>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            My Matches
          </h1>

          <p className="mt-2 text-muted-foreground">
            Calculating your job
            matches...
          </p>
        </div>
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
            Skill Matching
          </span>
        </div>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          My Matches
        </h1>

        <p className="mt-2 text-muted-foreground">
          Discover opportunities ranked
          by how closely their required
          skills match your profile.
        </p>
      </div>

      {error && (
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-destructive">
              {error}
            </p>
          </CardContent>
        </Card>
      )}

      {!error &&
        candidateSkills.length === 0 && (
          <Card>
            <CardContent className="p-6">
              <p className="font-medium">
                Add skills to improve your
                matches
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                Your profile does not have
                any skills yet. Add your
                skills and we can calculate
                more meaningful job matches.
              </p>

              <Link href="/candidate/skills">
                <Button
                  variant="outline"
                  className="mt-4"
                >
                  Manage Skills
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

      {/* Match Overview */}
      {!error && (
        <section className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium">
                Best Match
              </CardTitle>
            </CardHeader>

            <CardContent>
              <p className="text-4xl font-semibold">
                {bestMatch}%
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                Your strongest available
                job match.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium">
                Strong Matches
              </CardTitle>
            </CardHeader>

            <CardContent>
              <p className="text-4xl font-semibold">
                {strongMatches}
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                Jobs with at least 70%
                skill compatibility.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium">
                Average Match
              </CardTitle>
            </CardHeader>

            <CardContent>
              <p className="text-4xl font-semibold">
                {averageMatch}%
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                Average compatibility
                across available jobs.
              </p>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Matches */}
      {!error && (
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">
              Recommended Matches
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Jobs are ranked using your
              current skills and each
              position&apos;s required
              skills.
            </p>
          </div>

          {matches.length === 0 ? (
            <Card>
              <CardContent className="p-6">
                <p className="font-medium">
                  No jobs available
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  There are currently no
                  published jobs to compare
                  with your profile.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {matches.map((match) => (
                <Card key={match.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-lg font-semibold">
                            {match.title}
                          </h3>

                          <p className="text-sm text-muted-foreground">
                            {match.company}
                          </p>
                        </div>

                        {match.description && (
                          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                            {
                              match.description
                            }
                          </p>
                        )}

                        <div>
                          <p className="mb-2 text-xs font-medium text-muted-foreground">
                            Required Skills
                          </p>

                          {match.skills.length >
                          0 ? (
                            <div className="flex flex-wrap gap-2">
                              {match.skills.map(
                                (skill) => {
                                  const matched =
                                    match.matchedSkills.some(
                                      (
                                        matchedSkill
                                      ) =>
                                        normalizeSkillName(
                                          matchedSkill
                                        ) ===
                                        normalizeSkillName(
                                          skill
                                        )
                                    );

                                  return (
                                    <Badge
                                      key={`${match.id}-${skill}`}
                                      variant={
                                        matched
                                          ? "default"
                                          : "secondary"
                                      }
                                    >
                                      {skill}
                                    </Badge>
                                  );
                                }
                              )}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              No required
                              skills were
                              specified for
                              this job.
                            </p>
                          )}
                        </div>

                        <p className="text-xs text-muted-foreground">
                          {
                            match
                              .matchedSkills
                              .length
                          }{" "}
                          of{" "}
                          {
                            match.skills
                              .length
                          }{" "}
                          required skills
                          matched
                        </p>
                      </div>

                      <div className="flex items-center justify-between gap-4 lg:flex-col lg:items-end">
                        <div className="text-right">
                          <Badge className="text-sm">
                            {match.score}% Match
                          </Badge>

                          <p className="mt-2 text-xs text-muted-foreground">
                            {getCompatibilityText(
                              match.score
                            )}
                          </p>
                        </div>

                        <Link
                          href={`/candidate/jobs/${encodeURIComponent(
                            match.id
                          )}`}
                        >
                          <Button variant="outline">
                            View Job
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}