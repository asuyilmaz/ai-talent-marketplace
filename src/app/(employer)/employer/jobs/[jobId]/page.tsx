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
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
    employmentType: "Full-time",
    description:
      "We are looking for a frontend developer to build modern and responsive web applications.",
    skills: ["React", "Next.js", "TypeScript"],
  },
  {
    id: "employer-job-2",
    title: "React Developer",
    applications: 18,
    matchRate: 88,
    status: "Published",
    workType: "Hybrid",
    employmentType: "Full-time",
    description:
      "Join our frontend team and help us create scalable React applications.",
    skills: ["React", "JavaScript", "CSS"],
  },
  {
    id: "employer-job-3",
    title: "UI Engineer",
    applications: 12,
    matchRate: 84,
    status: "Draft",
    workType: "Remote",
    employmentType: "Contract",
    description:
      "Work on user interfaces and improve the experience of our digital products.",
    skills: ["React", "Tailwind", "UI/UX"],
  },
];

export default function EmployerJobDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const [job, setJob] = useState<EmployerJob | null>(null);
  const [loading, setLoading] = useState(true);

  const jobId = Array.isArray(params.jobId)
    ? params.jobId[0]
    : params.jobId;

  useEffect(() => {
    const savedJobs = localStorage.getItem("employerJobs");

    let allJobs = defaultJobs;

    if (savedJobs) {
      try {
        const parsedJobs = JSON.parse(savedJobs);

        if (Array.isArray(parsedJobs)) {
          allJobs = [...parsedJobs, ...defaultJobs];
        }
      } catch {
        allJobs = defaultJobs;
      }
    }

    const foundJob = allJobs.find(
      (item) => item.id === jobId
    );

    setJob(foundJob ?? null);
    setLoading(false);
  }, [jobId]);

  function handleDelete() {
    if (!job) {
      return;
    }

    const confirmed = window.confirm(
      `Delete "${job.title}"?`
    );

    if (!confirmed) {
      return;
    }

    const savedJobs = localStorage.getItem("employerJobs");

    if (savedJobs) {
      try {
        const parsedJobs = JSON.parse(savedJobs);

        if (Array.isArray(parsedJobs)) {
          const updatedJobs = parsedJobs.filter(
            (item: EmployerJob) => item.id !== job.id
          );

          localStorage.setItem(
            "employerJobs",
            JSON.stringify(updatedJobs)
          );
        }
      } catch {
        localStorage.removeItem("employerJobs");
      }
    }

    router.push("/employer/jobs");
  }

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Loading job...
        </p>
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
              <h2 className="text-lg font-semibold">
                Job not found
              </h2>

              <p className="mt-2 text-sm text-muted-foreground">
                The job posting could not be found.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Back */}
      <Link
        href="/employer/jobs"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Jobs
      </Link>

      {/* Header */}
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
                    Tech Company
                  </span>

                  <span className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {job.workType}
                  </span>

                  {job.employmentType && (
                    <span>
                      {job.employmentType}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href={`/employer/jobs/${job.id}/edit`}
                className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit Job
              </Link>

              <Button
                variant="destructive"
                onClick={handleDelete}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overview */}
      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Status
            </CardTitle>
          </CardHeader>

          <CardContent>
            <Badge
              variant={
                job.status === "Published"
                  ? "default"
                  : "secondary"
              }
            >
              {job.status}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Applications
            </CardTitle>
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
            <CardTitle className="text-base">
              AI Match
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-3xl font-semibold">
              {job.matchRate}%
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Description + Skills */}
      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Job Description</CardTitle>
          </CardHeader>

          <CardContent>
            <p className="whitespace-pre-line text-sm leading-7 text-muted-foreground">
              {job.description ||
                "No job description has been added yet."}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Required Skills</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="flex flex-wrap gap-2">
              {(job.skills ?? []).map((skill) => (
                <Badge
                  key={skill}
                  variant="secondary"
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}