"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Lightbulb,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

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
  company: string;
  description?: string | null;
  skills: string[];
  workType: string;
  employmentType: string;
};

type JobsResponse = {
  jobs?: Job[];
  message?: string;
  error?: string;
};

type MissingSkill = {
  name: string;
  jobCount: number;
  percentage: number;
  priority: "High" | "Medium" | "Low";
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

function getPriority(
  jobCount: number,
  totalJobs: number
): "High" | "Medium" | "Low" {
  if (totalJobs === 0) {
    return "Low";
  }

  const ratio = jobCount / totalJobs;

  if (ratio >= 0.5) {
    return "High";
  }

  if (ratio >= 0.25) {
    return "Medium";
  }

  return "Low";
}

export default function CandidateSkillGapPage() {
  const [candidateSkills, setCandidateSkills] =
    useState<string[]>([]);

  const [jobs, setJobs] =
    useState<Job[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function loadSkillGap() {
      try {
        setLoading(true);
        setError("");

        const storedUser =
          localStorage.getItem("currentUser");

        if (!storedUser) {
          setError(
            "Please log in to view your skill gap."
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
            : "Unable to calculate skill gap."
        );
      } finally {
        setLoading(false);
      }
    }

    loadSkillGap();
  }, []);

  const analysis = useMemo(() => {
    const candidateSkillSet = new Set(
      candidateSkills.map(
        normalizeSkillName
      )
    );

    const missingSkillMap = new Map<
      string,
      {
        name: string;
        jobIds: Set<string>;
      }
    >();

    let totalRequiredSkills = 0;
    let totalMatchedSkills = 0;

    jobs.forEach((job) => {
      const uniqueJobSkills = Array.from(
        new Map(
          normalizeSkills(job.skills).map(
            (skill) => [
              normalizeSkillName(skill),
              skill,
            ]
          )
        ).entries()
      );

      uniqueJobSkills.forEach(
        ([normalizedSkill, displayName]) => {
          totalRequiredSkills += 1;

          if (
            candidateSkillSet.has(
              normalizedSkill
            )
          ) {
            totalMatchedSkills += 1;
            return;
          }

          const existing =
            missingSkillMap.get(
              normalizedSkill
            );

          if (existing) {
            existing.jobIds.add(job.id);
          } else {
            missingSkillMap.set(
              normalizedSkill,
              {
                name: displayName,
                jobIds: new Set([
                  job.id,
                ]),
              }
            );
          }
        }
      );
    });

    const missingSkills: MissingSkill[] =
      Array.from(
        missingSkillMap.values()
      )
        .map((skill) => {
          const jobCount =
            skill.jobIds.size;

          const percentage =
            jobs.length > 0
              ? Math.round(
                  (jobCount /
                    jobs.length) *
                    100
                )
              : 0;

          return {
            name: skill.name,
            jobCount,
            percentage,
            priority: getPriority(
              jobCount,
              jobs.length
            ),
          };
        })
        .sort((a, b) => {
          if (
            b.jobCount !== a.jobCount
          ) {
            return (
              b.jobCount -
              a.jobCount
            );
          }

          return a.name.localeCompare(
            b.name
          );
        });

    const coverage =
      totalRequiredSkills > 0
        ? Math.round(
            (totalMatchedSkills /
              totalRequiredSkills) *
              100
          )
        : 0;

    return {
      missingSkills,
      coverage,
      totalRequiredSkills,
      totalMatchedSkills,
    };
  }, [candidateSkills, jobs]);

  const topSkill =
    analysis.missingSkills[0];

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />

            <span className="text-sm font-medium">
              Career Insights
            </span>
          </div>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Skill Gap
          </h1>

          <p className="mt-2 text-muted-foreground">
            Analyzing your skills
            against available jobs...
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
            Career Insights
          </span>
        </div>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Skill Gap
        </h1>

        <p className="mt-2 text-muted-foreground">
          See which skills appear in
          available jobs but are currently
          missing from your profile.
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
                Add your skills first
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                Your profile currently has
                no skills. Add them so the
                system can calculate your
                real skill gaps.
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

      {!error && (
        <>
          {/* Overview */}
          <section className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-medium">
                  Skill Coverage
                </CardTitle>
              </CardHeader>

              <CardContent>
                <p className="text-4xl font-semibold">
                  {
                    analysis.coverage
                  }
                  %
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  Coverage across all
                  required job skills.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base font-medium">
                  Matched Requirements
                </CardTitle>
              </CardHeader>

              <CardContent>
                <p className="text-4xl font-semibold">
                  {
                    analysis.totalMatchedSkills
                  }
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  Out of{" "}
                  {
                    analysis.totalRequiredSkills
                  }{" "}
                  total skill requirements.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base font-medium">
                  Skills to Improve
                </CardTitle>
              </CardHeader>

              <CardContent>
                <p className="text-4xl font-semibold">
                  {
                    analysis
                      .missingSkills
                      .length
                  }
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  Missing skills found
                  across available jobs.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* Progress */}
          <Card>
            <CardHeader>
              <CardTitle>
                Overall Skill Coverage
              </CardTitle>

              <p className="text-sm text-muted-foreground">
                How many job skill
                requirements your current
                profile already covers.
              </p>
            </CardHeader>

            <CardContent>
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm font-medium">
                  Current coverage
                </span>

                <span className="text-sm text-muted-foreground">
                  {
                    analysis.coverage
                  }
                  %
                </span>
              </div>

              <Progress
                value={
                  analysis.coverage
                }
                className="mt-3"
              />

              <p className="mt-3 text-sm text-muted-foreground">
                Adding relevant missing
                skills can improve your
                compatibility with current
                job postings.
              </p>
            </CardContent>
          </Card>

          {/* Skill Gaps */}
          <section className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold">
                Skills to Improve
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Skills are ranked by how
                often they appear in
                available jobs.
              </p>
            </div>

            {analysis.missingSkills
              .length === 0 ? (
              <Card>
                <CardContent className="p-6">
                  <p className="font-medium">
                    No skill gaps found
                  </p>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Your current skills
                    cover all skill
                    requirements in the
                    available job postings.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {analysis.missingSkills.map(
                  (skill) => (
                    <Card
                      key={skill.name}
                    >
                      <CardContent className="p-6">
                        <div className="space-y-5">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="font-semibold">
                                  {
                                    skill.name
                                  }
                                </h3>

                                <Badge
                                  variant={
                                    skill.priority ===
                                    "High"
                                      ? "default"
                                      : "secondary"
                                  }
                                >
                                  {
                                    skill.priority
                                  }{" "}
                                  Priority
                                </Badge>
                              </div>

                              <p className="mt-2 text-sm text-muted-foreground">
                                Required
                                by{" "}
                                {
                                  skill.jobCount
                                }{" "}
                                of{" "}
                                {
                                  jobs.length
                                }{" "}
                                available
                                job
                                {jobs.length ===
                                1
                                  ? ""
                                  : "s"}
                                .
                              </p>
                            </div>

                            <div className="text-left sm:text-right">
                              <p className="text-2xl font-semibold">
                                {
                                  skill.percentage
                                }
                                %
                              </p>

                              <p className="text-xs text-muted-foreground">
                                Job demand
                              </p>
                            </div>
                          </div>

                          <div>
                            <div className="mb-2 flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">
                                Demand
                                across
                                jobs
                              </span>

                              <span className="font-medium">
                                {
                                  skill.jobCount
                                }{" "}
                                /{" "}
                                {
                                  jobs.length
                                }
                              </span>
                            </div>

                            <Progress
                              value={
                                skill.percentage
                              }
                            />
                          </div>

                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <TrendingUp className="h-4 w-4" />

                              <span>
                                Adding
                                this
                                skill may
                                improve
                                your match
                                with{" "}
                                {
                                  skill.jobCount
                                }{" "}
                                job
                                {skill.jobCount ===
                                1
                                  ? ""
                                  : "s"}
                                .
                              </span>
                            </div>

                            <Link href="/candidate/skills">
                              <Button
                                variant="outline"
                                size="sm"
                              >
                                Add Skill
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

          {/* Recommendation */}
          {topSkill && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />

                  <CardTitle>
                    Recommended Focus
                  </CardTitle>
                </div>

                <p className="text-sm text-muted-foreground">
                  Suggested priority
                  based on current job
                  demand.
                </p>
              </CardHeader>

              <CardContent>
                <div className="rounded-lg border p-4">
                  <h3 className="font-medium">
                    Focus on{" "}
                    {topSkill.name} first
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {
                      topSkill.name
                    }{" "}
                    appears in{" "}
                    {
                      topSkill.jobCount
                    }{" "}
                    of the currently
                    available jobs and is
                    not yet included in
                    your candidate
                    skills.
                  </p>

                  <Link href="/candidate/skills">
                    <Button className="mt-4">
                      Add{" "}
                      {topSkill.name}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}