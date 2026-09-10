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
  Building2,
  FileText,
  Sparkles,
  Users,
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
  id?: string;
  name?: string;
  email?: string;
  role?: string;
};

type Job = {
  id: string;
  title: string;
  published: boolean;
  createdAt: string;
  applicationCount: number;
  workType?: string;
  employmentType?: string;
};

type JobsResponse = {
  jobs?: Job[];
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

type CandidatesResponse = {
  candidates?: Candidate[];
  error?: string;
  message?: string;
};

type Company = {
  name: string;
  openPositions: number;
};

type CompanyResponse = {
  name?: string;
  openPositions?: number;
  error?: string;
  message?: string;
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function isCreatedThisWeek(
  dateString: string
) {
  const createdAt =
    new Date(dateString);

  if (
    Number.isNaN(
      createdAt.getTime()
    )
  ) {
    return false;
  }

  const now = new Date();

  const sevenDaysAgo =
    new Date(
      now.getTime() -
        7 *
          24 *
          60 *
          60 *
          1000
    );

  return (
    createdAt >= sevenDaysAgo
  );
}

function getStatusVariant(
  published: boolean
): "default" | "secondary" {
  return published
    ? "default"
    : "secondary";
}

export default function EmployerDashboard() {
  const [jobs, setJobs] =
    useState<Job[]>([]);

  const [
    applications,
    setApplications,
  ] = useState<Application[]>([]);

  const [
    candidates,
    setCandidates,
  ] = useState<Candidate[]>([]);

  const [company, setCompany] =
    useState<Company | null>(null);

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
            "employer"
        ) {
          setError(
            "This page is only available for employers."
          );
          return;
        }

        const employerId =
          currentUser.id;

        const [
          jobsResponse,
          applicationsResponse,
          candidatesResponse,
          companyResponse,
        ] = await Promise.all([
          fetch(
            `/api/jobs?userId=${encodeURIComponent(
              employerId
            )}`,
            {
              cache: "no-store",
            }
          ),
          fetch(
            `/api/applications?employerId=${encodeURIComponent(
              employerId
            )}`,
            {
              cache: "no-store",
            }
          ),
          fetch(
            "/api/candidates",
            {
              cache: "no-store",
            }
          ),
          fetch(
            `/api/company?employerId=${encodeURIComponent(
              employerId
            )}`,
            {
              cache: "no-store",
            }
          ),
        ]);

        const jobsData =
          (await jobsResponse.json()) as JobsResponse;

        const applicationsData =
          (await applicationsResponse.json()) as ApplicationsResponse;

        const candidatesData =
          (await candidatesResponse.json()) as CandidatesResponse;

        const companyData =
          (await companyResponse.json()) as CompanyResponse;

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

        if (!candidatesResponse.ok) {
          throw new Error(
            candidatesData.error ||
              candidatesData.message ||
              "Failed to load candidates."
          );
        }

        if (!companyResponse.ok) {
          throw new Error(
            companyData.error ||
              companyData.message ||
              "Failed to load company."
          );
        }

        setJobs(
          Array.isArray(
            jobsData.jobs
          )
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

        setCandidates(
          Array.isArray(
            candidatesData.candidates
          )
            ? candidatesData.candidates
            : []
        );

        setCompany({
          name:
            companyData.name ??
            "Company",
          openPositions:
            typeof companyData.openPositions ===
            "number"
              ? companyData.openPositions
              : 0,
        });
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

  const activeJobs =
    useMemo(
      () =>
        jobs.filter(
          (job) =>
            job.published
        ),
      [jobs]
    );

  const newCandidates =
    useMemo(
      () =>
        candidates.filter(
          (candidate) =>
            isCreatedThisWeek(
              candidate.createdAt
            )
        ),
      [candidates]
    );

  const recentJobs =
    useMemo(
      () =>
        [...jobs]
          .sort(
            (a, b) =>
              new Date(
                b.createdAt
              ).getTime() -
              new Date(
                a.createdAt
              ).getTime()
          )
          .slice(0, 3),
      [jobs]
    );

  const recentCandidates =
    useMemo(
      () =>
        [...candidates]
          .sort(
            (a, b) =>
              new Date(
                b.createdAt
              ).getTime() -
              new Date(
                a.createdAt
              ).getTime()
          )
          .slice(0, 3),
      [candidates]
    );

  const applicationsByJob =
    useMemo(() => {
      const counts =
        new Map<
          string,
          number
        >();

      for (const application of applications) {
        counts.set(
          application.jobId,
          (counts.get(
            application.jobId
          ) ?? 0) + 1
        );
      }

      return counts;
    }, [applications]);

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

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Employer Dashboard
          </h1>

          <p className="mt-2 text-muted-foreground">
            Manage your hiring
            activity.
          </p>
        </div>

        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-destructive">
              {error}
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
            Employer Overview
          </span>
        </div>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Employer Dashboard
        </h1>

        <p className="mt-2 text-muted-foreground">
          Track your jobs,
          applications and candidate
          activity.
        </p>
      </div>

      {/* Overview */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-base font-medium">
                Active Jobs
              </CardTitle>

              <BriefcaseBusiness className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>

          <CardContent>
            <p className="text-4xl font-semibold">
              {company?.openPositions ??
                activeJobs.length}
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              Published positions
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
              Total applications
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-base font-medium">
                Candidates
              </CardTitle>

              <Users className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>

          <CardContent>
            <p className="text-4xl font-semibold">
              {candidates.length}
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              Available candidate
              profiles
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-base font-medium">
                New This Week
              </CardTitle>

              <Users className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>

          <CardContent>
            <p className="text-4xl font-semibold">
              {newCandidates.length}
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              Recently joined
              candidates
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Recent Jobs */}
      <section className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold">
              Recent Job Postings
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Your latest job
              postings and applicant
              activity.
            </p>
          </div>

          <Link href="/employer/jobs/create">
            <Button>
              Create Job
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {recentJobs.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">
                No job postings yet.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {recentJobs.map(
              (job) => {
                const applicationCount =
                  applicationsByJob.get(
                    job.id
                  ) ??
                  job.applicationCount ??
                  0;

                return (
                  <Card key={job.id}>
                    <CardContent className="p-6">
                      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                          <h3 className="text-lg font-semibold">
                            {
                              job.title
                            }
                          </h3>

                          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              {
                                applicationCount
                              }{" "}
                              application
                              {applicationCount ===
                              1
                                ? ""
                                : "s"}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-4 sm:justify-end">
                          <Badge
                            variant={getStatusVariant(
                              job.published
                            )}
                          >
                            {job.published
                              ? "Published"
                              : "Draft"}
                          </Badge>

                          <Link
                            href={`/employer/jobs/${encodeURIComponent(
                              job.id
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
                );
              }
            )}
          </div>
        )}
      </section>

      {/* Recent Candidates */}
      <section className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold">
              Recent Candidates
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Recently created
              candidate profiles.
            </p>
          </div>

          <Link href="/employer/candidates">
            <Button variant="outline">
              View All Candidates
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {recentCandidates.length ===
        0 ? (
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">
                No candidates are
                available yet.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {recentCandidates.map(
              (candidate) => (
                <Card
                  key={candidate.id}
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-muted font-semibold">
                          {getInitials(
                            candidate.name
                          )}
                        </div>

                        <div>
                          <h3 className="font-semibold">
                            {
                              candidate.name
                            }
                          </h3>

                          <p className="text-sm text-muted-foreground">
                            {candidate.experienceTitle ||
                              "Candidate"}
                          </p>

                          {candidate
                            .skills
                            .length >
                            0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {candidate.skills
                                .slice(
                                  0,
                                  4
                                )
                                .map(
                                  (
                                    skill
                                  ) => (
                                    <Badge
                                      key={
                                        skill
                                      }
                                      variant="secondary"
                                    >
                                      {
                                        skill
                                      }
                                    </Badge>
                                  )
                                )}
                            </div>
                          )}
                        </div>
                      </div>

                      <Link
                        href={`/employer/candidates/${encodeURIComponent(
                          candidate.id
                        )}`}
                      >
                        <Button variant="outline">
                          View Candidate
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )
            )}
          </div>
        )}
      </section>

      {/* Company Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />

            <CardTitle>
              Company Summary
            </CardTitle>
          </div>
        </CardHeader>

        <CardContent>
          <div className="rounded-lg border p-4">
            <p className="text-sm leading-6 text-muted-foreground">
              {company?.name ??
                "Your company"}{" "}
              currently has{" "}
              {activeJobs.length}{" "}
              published job
              {activeJobs.length === 1
                ? ""
                : "s"}{" "}
              and has received{" "}
              {applications.length}{" "}
              application
              {applications.length ===
              1
                ? ""
                : "s"}.
            </p>

            <div className="mt-4 flex flex-wrap gap-3">
              <Link href="/employer/jobs">
                <Button variant="outline">
                  View Jobs
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>

              <Link href="/employer/applications">
                <Button variant="outline">
                  View Applications
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}