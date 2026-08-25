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
};

const defaultJobs: EmployerJob[] = [
  {
    id: "employer-job-1",
    title: "Frontend Developer",
    applications: 24,
    matchRate: 92,
    status: "Published",
    workType: "Remote",
  },
  {
    id: "employer-job-2",
    title: "React Developer",
    applications: 18,
    matchRate: 88,
    status: "Published",
    workType: "Hybrid",
  },
  {
    id: "employer-job-3",
    title: "UI Engineer",
    applications: 12,
    matchRate: 84,
    status: "Draft",
    workType: "Remote",
  },
];

export default function EmployerJobsPage() {
  const [jobs, setJobs] = useState<EmployerJob[]>(defaultJobs);

  useEffect(() => {
    const savedJobs = localStorage.getItem("employerJobs");

    if (!savedJobs) {
      return;
    }

    try {
      const parsedJobs = JSON.parse(savedJobs);

      if (Array.isArray(parsedJobs)) {
        setJobs([...parsedJobs, ...defaultJobs]);
      }
    } catch {
      setJobs(defaultJobs);
    }
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />

            <span className="text-sm font-medium">
              Recruitment
            </span>
          </div>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Job Postings
          </h1>

          <p className="mt-2 text-muted-foreground">
            Create, manage and monitor your company&apos;s job postings.
          </p>
        </div>

        <Link
          href="/employer/jobs/create"
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
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
              {
                jobs.filter(
                  (job) => job.status === "Published"
                ).length
              }
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
              {
                jobs.filter(
                  (job) => job.status === "Draft"
                ).length
              }
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              Not yet published
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Job List */}
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
                        {job.workType} · Tech Company
                      </p>
                    </div>

                    {job.skills && job.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {job.skills.map((skill) => (
                          <Badge
                            key={skill}
                            variant="secondary"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        {job.applications} applications
                      </span>

                      <span>
                        {job.matchRate}% average match
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
                        job.status === "Published"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {job.status}
                    </Badge>

                    <Button variant="outline">
                      Manage
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}