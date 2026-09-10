"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type CurrentUser = {
  id: string;
  role?: string;
};

type EmployerJob = {
  id: string;
  title: string;
  description: string;
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

export default function EditJobPage() {
  const params = useParams();
  const router = useRouter();

  const [job, setJob] = useState<EmployerJob | null>(null);
  const [employerId, setEmployerId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [skills, setSkills] = useState("");
  const [workType, setWorkType] = useState<EmployerJob["workType"]>("Remote");
  const [employmentType, setEmploymentType] =
    useState<EmployerJob["employmentType"]>("Full-time");
  const [status, setStatus] = useState<EmployerJob["status"]>("Published");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
        setTitle(data.job.title);
        setDescription(data.job.description);
        setSkills(data.job.skills.join(", "));
        setWorkType(data.job.workType);
        setEmploymentType(data.job.employmentType);
        setStatus(data.job.status);
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

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!job || !employerId || saving) {
      return;
    }

    const normalizedSkills = skills
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);

    if (!title.trim() || !description.trim() || normalizedSkills.length === 0) {
      setError("Title, description and at least one skill are required.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const response = await fetch(
        `/api/jobs/${encodeURIComponent(job.id)}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            employerId,
            title: title.trim(),
            description: description.trim(),
            skills: normalizedSkills,
            workType,
            employmentType,
            status,
          }),
        }
      );

      const data = (await response.json()) as JobResponse;

      if (!response.ok || !data.job) {
        throw new Error(data.message || "Failed to update job.");
      }

      router.push(`/employer/jobs/${encodeURIComponent(data.job.id)}`);
      router.refresh();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Failed to update job."
      );
      setSaving(false);
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
                {error || "The job you are trying to edit could not be found."}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <Link
          href={`/employer/jobs/${encodeURIComponent(job.id)}`}
          className="mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Job
        </Link>

        <h1 className="text-3xl font-semibold tracking-tight">Edit Job</h1>
        <p className="mt-2 text-muted-foreground">
          Update your job posting and hiring requirements.
        </p>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>

          <CardContent className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                Job Title
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
                className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Job Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={7}
                required
                className="w-full resize-none rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="skills" className="text-sm font-medium">
                Required Skills
              </label>
              <input
                id="skills"
                type="text"
                value={skills}
                onChange={(event) => setSkills(event.target.value)}
                required
                className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
              <p className="text-xs text-muted-foreground">
                Separate skills with commas.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Job Details</CardTitle>
          </CardHeader>

          <CardContent className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="workType" className="text-sm font-medium">
                Work Type
              </label>
              <select
                id="workType"
                value={workType}
                onChange={(event) =>
                  setWorkType(event.target.value as EmployerJob["workType"])
                }
                className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
                <option value="On-site">On-site</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="employmentType" className="text-sm font-medium">
                Employment Type
              </label>
              <select
                id="employmentType"
                value={employmentType}
                onChange={(event) =>
                  setEmploymentType(
                    event.target.value as EmployerJob["employmentType"]
                  )
                }
                className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="status" className="text-sm font-medium">
                Status
              </label>
              <select
                id="status"
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value as EmployerJob["status"])
                }
                className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="Published">Published</option>
                <option value="Draft">Draft</option>
              </select>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{workType}</Badge>
              <Badge variant="secondary">{employmentType}</Badge>
              <Badge variant="secondary">{status}</Badge>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Link
            href={`/employer/jobs/${encodeURIComponent(job.id)}`}
            className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
          >
            Cancel
          </Link>

          <Button type="submit" disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
