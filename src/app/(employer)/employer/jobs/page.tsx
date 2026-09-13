"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Briefcase,
  Plus,
  Users,
} from "lucide-react";

type EmployerJob = {
  id: string;
  title: string;
  description?: string;
  skills?: string[];
  applications: number;
  matchRate: number;
  status: string;
  workType: string;
  employmentType?: string;
  company?: string;
};

type JobsResponse = {
  message?: string;
  jobs?: EmployerJob[];
};

export default function EmployerJobsPage() {
  const [jobs, setJobs] = useState<EmployerJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadJobs() {
      try {
        const storedUser =
          localStorage.getItem("currentUser");

        if (!storedUser) {
          window.location.href = "/login";
          return;
        }

        const currentUser = JSON.parse(
          storedUser
        ) as {
          id: string;
          role: "candidate" | "employer";
        };

        if (currentUser.role !== "employer") {
          window.location.href =
            "/candidate/dashboard";
          return;
        }

        const response = await fetch(
          `/api/jobs?userId=${encodeURIComponent(
            currentUser.id
          )}`
        );

        const data =
          (await response.json()) as JobsResponse;

        if (!response.ok) {
          setError(
            data.message ||
              "Unable to load your jobs."
          );
          return;
        }

        setJobs(data.jobs ?? []);
      } catch {
        setError(
          "Unable to connect to the server."
        );
      } finally {
        setLoading(false);
      }
    }

    loadJobs();
  }, []);

  const publishedCount = jobs.filter(
    (job) => job.status === "Published"
  ).length;

  const draftCount = jobs.filter(
    (job) => job.status === "Draft"
  ).length;

  return (
    <div className="mx-auto max-w-[1380px] space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />

            <span className="text-sm font-medium">
              Recruitment
            </span>
          </div>

          <p className="mb-3 text-[10px] font-black uppercase tracking-[.22em] text-[#6d5dfc]">Hiring inventory / 01</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Job Postings
          </h1>

          <p className="mt-2 text-muted-foreground">
            Create, manage and monitor your company&apos;s
            job postings.
          </p>
        </div>

        <Link
          href="/employer/jobs/create"
          className="inline-flex h-10 items-center justify-center  bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Job
        </Link>
      </div>

      {/* Overview */}
      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">
              Total Jobs
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-4xl font-semibold">
              {jobs.length}
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              All job postings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">
              Published
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-4xl font-semibold">
              {publishedCount}
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              Currently accepting applications
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">
              Drafts
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-4xl font-semibold">
              {draftCount}
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              Not yet published
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Loading */}
      {loading && (
        <Card>
          <CardContent className="flex min-h-40 items-center justify-center">
            <p className="text-sm text-muted-foreground">
              Loading jobs...
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

      {/* Empty State */}
      {!loading &&
        !error &&
        jobs.length === 0 && (
          <Card>
            <CardContent className="flex min-h-48 flex-col items-center justify-center p-6 text-center">
              <Briefcase className="h-8 w-8 text-muted-foreground" />

              <h3 className="mt-4 font-medium">
                No job postings yet
              </h3>

              <p className="mt-1 text-sm text-muted-foreground">
                Create your first job posting to start
                attracting candidates.
              </p>

              <Link href="/employer/jobs/create">
                <Button className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Job
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

      {/* Job List */}
      {!loading &&
        !error &&
        jobs.length > 0 && (
          <section className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold">
                Your Job Postings
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Manage your active and draft positions.
              </p>
            </div>

            <div className="space-y-4">
              {jobs.map((job) => (
                <Card key={job.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                      <div className="space-y-3">
                        <div>
                          <h3 className="text-lg font-semibold">
                            {job.title}
                          </h3>

                          <p className="text-sm text-muted-foreground">
                            {job.workType} ·{" "}
                            {job.company ??
                              "Company"}
                          </p>
                        </div>

                        {job.skills &&
                          job.skills.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {job.skills.map(
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
                          )}

                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            {job.applications}{" "}
                            applications
                          </span>

                          <span>
                            {job.matchRate}% average
                            match
                          </span>

                          {job.employmentType && (
                            <span>
                              {job.employmentType}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-4 sm:justify-end">
                        <Badge
                          variant={
                            job.status ===
                            "Published"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {job.status}
                        </Badge>

                        <Link
                          href={`/employer/jobs/${job.id}`}
                        >
                          <Button variant="outline">
                            Manage
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}
    </div>
  );
}