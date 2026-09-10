"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Briefcase,
  Building2,
  MapPin,
  Pencil,
  Trash2,
  Users,
  Wrench,
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
  role?: string;
};

type EmployerJob = {
  id: string;
  title: string;
  description: string;
  company: string;
  companyId: string;
  skills: string[];
  applications: number;
  status: "Published" | "Draft";
  workType: "Remote" | "Hybrid" | "On-site";
  employmentType: "Full-time" | "Part-time" | "Contract";
};

type JobResponse = {
  job?: EmployerJob;
  message?: string;
};

export default function EmployerJobDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const [job, setJob] = useState<EmployerJob | null>(null);
  const [employerId, setEmployerId] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const jobId = Array.isArray(params.jobId)
    ? params.jobId[0]
    : params.jobId;

  useEffect(() => {
    if (!jobId) {
      setError("Job not found.");
      setLoading(false);
      return;
    }

    const currentJobId = jobId;

    async function loadJob() {
      try {
        const storedUser = localStorage.getItem("currentUser");

        if (!storedUser) {
          router.push("/login");
          return;
        }

        const currentUser = JSON.parse(storedUser) as CurrentUser;

        if (
          !currentUser.id ||
          currentUser.role?.toLowerCase() !== "employer"
        ) {
          router.push("/login");
          return;
        }

        setEmployerId(currentUser.id);

        const response = await fetch(
          `/api/jobs/${encodeURIComponent(currentJobId)}?employerId=${encodeURIComponent(currentUser.id)}`,
          { cache: "no-store" }
        );

        const data = (await response.json()) as JobResponse;

        if (!response.ok || !data.job) {
          throw new Error(data.message || "Failed to load job.");
        }

        setJob(data.job);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Failed to load job."
        );
      } finally {
        setLoading(false);
      }
    }

    void loadJob();
  }, [jobId, router]);

  async function handleDelete() {
    if (!job || !employerId || deleting) {
      return;
    }

    const confirmed = window.confirm(`Delete "${job.title}"?`);

    if (!confirmed) {
      return;
    }

    setDeleting(true);
    setError("");

    try {
      const response = await fetch(
        `/api/jobs/${encodeURIComponent(job.id)}?employerId=${encodeURIComponent(employerId)}`,
        {
          method: "DELETE",
        }
      );

      const data = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete job.");
      }

      router.push("/employer/jobs");
      router.refresh();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Failed to delete job."
      );
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading job...</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="space-y-6">
        <Link
          href="/employer/jobs"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Jobs
        </Link>

        <Card>
          <CardContent className="flex min-h-48 items-center justify-center p-6">
            <div className="text-center">
              <h2 className="text-lg font-semibold">Job not found</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {error || "The job posting could not be found."}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Link
        href="/employer/jobs"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Jobs
      </Link>

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Briefcase className="h-4 w-4" />
                Recruitment
              </div>

              <div>
                <h1 className="text-3xl font-semibold tracking-tight">
                  {job.title}
                </h1>

                <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    {job.company}
                  </span>

                  <span className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {job.workType}
                  </span>

                  <span>{job.employmentType}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href={`/employer/jobs/${encodeURIComponent(job.id)}/edit`}
                className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit Job
              </Link>

              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleting}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {deleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={job.status === "Published" ? "default" : "secondary"}>
              {job.status}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="flex items-center gap-2 text-3xl font-semibold">
              <Users className="h-6 w-6" />
              {job.applications}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Required Skills</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="flex items-center gap-2 text-3xl font-semibold">
              <Wrench className="h-6 w-6" />
              {job.skills.length}
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Job Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-line text-sm leading-7 text-muted-foreground">
              {job.description || "No job description has been added yet."}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Required Skills</CardTitle>
          </CardHeader>
          <CardContent>
            {job.skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill) => (
                  <Badge key={skill} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No required skills have been added yet.
              </p>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
