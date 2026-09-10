"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  Search,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type ApplicationStatus =
  | "Applied"
  | "Reviewing"
  | "Interview"
  | "Offer"
  | "Hired"
  | "Rejected";

type Application = {
  id: string;
  candidateId: string;
  candidate: string;
  jobId: string;
  role: string;
  company: string;
  matchScore: number;
  status: ApplicationStatus;
  experience: string;
  skills: string[];
  appliedAt: string;
};

type ApplicationsResponse = {
  message?: string;
  applications?: Application[];
};

export default function CandidateApplicationsPage() {
  const [applications, setApplications] =
    useState<Application[]>([]);

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadApplications() {
      try {
        const storedUser =
          localStorage.getItem("currentUser");

        if (!storedUser) {
          window.location.href = "/login";
          return;
        }

        let currentUser: {
          id: string;
          name: string;
          email: string;
          role: "candidate" | "employer";
        };

        try {
          currentUser = JSON.parse(
            storedUser
          );
        } catch {
          localStorage.removeItem("currentUser");
          window.location.href = "/login";
          return;
        }

        if (currentUser.role !== "candidate") {
          window.location.href =
            "/employer/dashboard";
          return;
        }

        const response = await fetch(
          `/api/applications?candidateId=${encodeURIComponent(
            currentUser.id
          )}`,
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const data =
          (await response.json()) as ApplicationsResponse;

        if (!response.ok) {
          setError(
            data.message ||
              "Unable to load applications."
          );
          return;
        }

        setApplications(
          data.applications ?? []
        );
      } catch {
        setError(
          "Unable to connect to the server."
        );
      } finally {
        setLoading(false);
      }
    }

    loadApplications();
  }, []);

  const filteredApplications = useMemo(() => {
    const searchText =
      search.trim().toLowerCase();

    if (!searchText) {
      return applications;
    }

    return applications.filter(
      (application) =>
        application.role
          .toLowerCase()
          .includes(searchText) ||
        application.company
          .toLowerCase()
          .includes(searchText) ||
        application.skills.some((skill) =>
          skill
            .toLowerCase()
            .includes(searchText)
        )
    );
  }, [applications, search]);

  const totalApplications =
    applications.length;

  const reviewingCount =
    applications.filter(
      (application) =>
        application.status === "Reviewing"
    ).length;

  const interviewCount =
    applications.filter(
      (application) =>
        application.status === "Interview"
    ).length;

  const hiredCount =
    applications.filter(
      (application) =>
        application.status === "Hired"
    ).length;

  function getStatusVariant(
    status: ApplicationStatus
  ) {
    if (status === "Rejected") {
      return "destructive" as const;
    }

    if (
      status === "Interview" ||
      status === "Offer" ||
      status === "Hired"
    ) {
      return "default" as const;
    }

    if (status === "Reviewing") {
      return "secondary" as const;
    }

    return "outline" as const;
  }

  function formatAppliedAt(
    appliedAt: string
  ) {
    const date = new Date(appliedAt);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return new Intl.DateTimeFormat(
      "en-US",
      {
        dateStyle: "medium",
      }
    ).format(date);
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Briefcase className="h-5 w-5" />

          <span className="text-sm font-medium">
            Career Activity
          </span>
        </div>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          My Applications
        </h1>

        <p className="mt-2 text-muted-foreground">
          Track your applications and follow your recruitment progress.
        </p>
      </div>

      {/* Overview */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">
              Total Applications
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-4xl font-semibold">
              {totalApplications}
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              Jobs you have applied to
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">
              Reviewing
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-4xl font-semibold">
              {reviewingCount}
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              Applications under review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">
              Interviews
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-4xl font-semibold">
              {interviewCount}
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              Interview-stage applications
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">
              Hired
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-4xl font-semibold">
              {hiredCount}
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              Successful applications
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Search */}
      <Card>
        <CardContent className="flex items-center gap-3 p-5">
          <Search className="h-4 w-4 text-muted-foreground" />

          <input
            type="text"
            placeholder="Search jobs, companies or skills..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            className="h-10 flex-1 bg-transparent text-sm outline-none"
          />
        </CardContent>
      </Card>

      {/* Loading */}
      {loading && (
        <Card>
          <CardContent className="flex min-h-48 items-center justify-center">
            <p className="text-sm text-muted-foreground">
              Loading applications...
            </p>
          </CardContent>
        </Card>
      )}

      {/* Error */}
      {!loading && error && (
        <Card>
          <CardContent className="flex min-h-48 items-center justify-center p-6">
            <p className="text-sm text-destructive">
              {error}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Empty */}
      {!loading &&
        !error &&
        filteredApplications.length === 0 && (
          <Card>
            <CardContent className="flex min-h-48 items-center justify-center p-6">
              <div className="text-center">
                <h3 className="font-medium">
                  No applications found
                </h3>

                <p className="mt-1 text-sm text-muted-foreground">
                  You have not applied to a matching job yet.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

      {/* Application List */}
      {!loading &&
        !error &&
        filteredApplications.length > 0 && (
          <section className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold">
                Application History
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Your latest job applications and their current status.
              </p>
            </div>

            <div className="space-y-4">
              {filteredApplications.map(
                (application) => (
                  <Card key={application.id}>
                    <CardContent className="p-6">
                      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-3">
                          <div>
                            <h3 className="text-lg font-semibold">
                              {application.role}
                            </h3>

                            <p className="text-sm text-muted-foreground">
                              {application.company}
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {application.skills.map(
                              (skill) => (
                                <Badge
                                  key={`${application.id}-${skill}`}
                                  variant="secondary"
                                >
                                  {skill}
                                </Badge>
                              )
                            )}
                          </div>

                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <span>
                              AI Match:{" "}
                              <span className="font-medium text-foreground">
                                {
                                  application.matchScore
                                }
                                %
                              </span>
                            </span>

                            {application.appliedAt && (
                              <span>
                                Applied{" "}
                                {formatAppliedAt(
                                  application.appliedAt
                                )}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                          <Badge
                            variant={getStatusVariant(
                              application.status
                            )}
                          >
                            {application.status}
                          </Badge>

                          <Link
                            href={`/candidate/jobs/${encodeURIComponent(
                              application.jobId
                            )}`}
                            className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                          >
                            View Job
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              )}
            </div>
          </section>
        )}
    </div>
  );
}