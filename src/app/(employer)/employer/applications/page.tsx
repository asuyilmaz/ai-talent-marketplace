"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  Search,
  Users,
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

type UpdateApplicationResponse = {
  message?: string;
  application?: {
    id: string;
    status: ApplicationStatus;
  };
};

const statusOptions: ApplicationStatus[] = [
  "Applied",
  "Reviewing",
  "Interview",
  "Offer",
  "Hired",
  "Rejected",
];

export default function EmployerApplicationsPage() {
  const [applications, setApplications] =
    useState<Application[]>([]);

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [updatingId, setUpdatingId] =
    useState<string | null>(null);

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
          currentUser = JSON.parse(storedUser);
        } catch {
          localStorage.removeItem("currentUser");
          window.location.href = "/login";
          return;
        }

        if (currentUser.role !== "employer") {
          window.location.href =
            "/candidate/dashboard";
          return;
        }

        const response = await fetch(
          `/api/applications?employerId=${encodeURIComponent(
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

  async function updateApplicationStatus(
    applicationId: string,
    newStatus: ApplicationStatus
  ) {
    try {
      const storedUser =
        localStorage.getItem("currentUser");

      if (!storedUser) {
        window.location.href = "/login";
        return;
      }

      let currentUser: {
        id: string;
        role: "candidate" | "employer";
      };

      try {
        currentUser = JSON.parse(storedUser);
      } catch {
        localStorage.removeItem("currentUser");
        window.location.href = "/login";
        return;
      }

      if (currentUser.role !== "employer") {
        return;
      }

      setUpdatingId(applicationId);
      setError("");

      const response = await fetch(
        "/api/applications",
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            applicationId,
            employerId: currentUser.id,
            status: newStatus,
          }),
        }
      );

      const data =
        (await response.json()) as UpdateApplicationResponse;

      if (!response.ok) {
        setError(
          data.message ||
            "Unable to update application status."
        );
        return;
      }

      setApplications((current) =>
        current.map((application) =>
          application.id === applicationId
            ? {
                ...application,
                status:
                  data.application?.status ??
                  newStatus,
              }
            : application
        )
      );
    } catch {
      setError(
        "Unable to update application status."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  const filteredApplications = useMemo(() => {
    const searchText =
      search.trim().toLowerCase();

    if (!searchText) {
      return applications;
    }

    return applications.filter(
      (application) =>
        application.candidate
          .toLowerCase()
          .includes(searchText) ||
        application.role
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Briefcase className="h-5 w-5" />

          <span className="text-sm font-medium">
            Recruitment
          </span>
        </div>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Applications
        </h1>

        <p className="mt-2 text-muted-foreground">
          Review candidates and manage your
          recruitment pipeline.
        </p>
      </div>

      {/* Statistics */}
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
              Across your job postings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">
              In Review
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-4xl font-semibold">
              {reviewingCount}
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              Candidates being reviewed
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
              Candidates in interview stage
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
            placeholder="Search candidates, positions or skills..."
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
          <CardContent className="flex min-h-40 items-center justify-center">
            <p className="text-sm text-muted-foreground">
              Loading applications...
            </p>
          </CardContent>
        </Card>
      )}

      {/* Error */}
      {!loading && error && (
        <Card>
          <CardContent className="flex min-h-40 items-center justify-center p-6">
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
            <CardContent className="flex min-h-40 items-center justify-center p-6">
              <div className="text-center">
                <h3 className="font-medium">
                  No applications found
                </h3>

                <p className="mt-1 text-sm text-muted-foreground">
                  No candidates have applied to your
                  jobs yet.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

      {/* Applications */}
      {!loading &&
        !error &&
        filteredApplications.length > 0 && (
          <section className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold">
                Candidate Applications
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                {filteredApplications.length}{" "}
                applications found.
              </p>
            </div>

            <div className="space-y-4">
              {filteredApplications.map(
                (application) => (
                  <Card key={application.id}>
                    <CardContent className="p-6">
                      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                        {/* Candidate */}
                        <div className="flex items-start gap-4">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-muted font-semibold">
                            {application.candidate
                              .split(" ")
                              .map(
                                (name) =>
                                  name[0]
                              )
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()}
                          </div>

                          <div className="space-y-2">
                            <div>
                              <h3 className="font-semibold">
                                {
                                  application.candidate
                                }
                              </h3>

                              <p className="text-sm text-muted-foreground">
                                {application.role}
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

                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Users className="h-4 w-4" />

                              <span>
                                Experience:{" "}
                                {
                                  application.experience
                                }
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center lg:flex-col lg:items-end">
                          <div className="flex items-center gap-2">
                            <Badge>
                              {
                                application.matchScore
                              }
                              % Match
                            </Badge>

                            <Badge
                              variant={getStatusVariant(
                                application.status
                              )}
                            >
                              {
                                application.status
                              }
                            </Badge>
                          </div>

                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                            <select
                              value={
                                application.status
                              }
                              disabled={
                                updatingId ===
                                application.id
                              }
                              onChange={(event) =>
                                updateApplicationStatus(
                                  application.id,
                                  event.target
                                    .value as ApplicationStatus
                                )
                              }
                              className="h-9 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {statusOptions.map(
                                (status) => (
                                  <option
                                    key={status}
                                    value={status}
                                  >
                                    {status}
                                  </option>
                                )
                              )}
                            </select>

                            <Link
                              href={`/employer/candidates/${encodeURIComponent(
                                application.candidateId
                              )}`}
                              className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                            >
                              View Candidate
                            </Link>
                          </div>
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