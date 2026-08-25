"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Briefcase,
  Save,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function CreateJobPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [skills, setSkills] = useState("");
  const [workType, setWorkType] = useState("Remote");
  const [employmentType, setEmploymentType] = useState("Full-time");
  const [saved, setSaved] = useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const newJob = {
      id: `employer-job-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      skills: skills
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean),
      workType,
      employmentType,
      applications: 0,
      matchRate: 0,
      status: "Published",
    };

    const existingJobs = JSON.parse(
      localStorage.getItem("employerJobs") || "[]"
    );

    localStorage.setItem(
      "employerJobs",
      JSON.stringify([newJob, ...existingJobs])
    );

    setSaved(true);

    setTimeout(() => {
      router.push("/employer/jobs");
    }, 800);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* Header */}
      <div>
        <Link
          href="/employer/jobs"
          className="mb-4 inline-flex items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Jobs
        </Link>

        <div className="flex items-center gap-2">
          <Briefcase className="h-5 w-5" />

          <span className="text-sm font-medium">
            Recruitment
          </span>
        </div>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Create Job
        </h1>

        <p className="mt-2 text-muted-foreground">
          Create a new job posting and attract qualified candidates.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>

          <CardContent className="space-y-5">
            <div className="space-y-2">
              <label
                htmlFor="title"
                className="text-sm font-medium"
              >
                Job Title
              </label>

              <input
                id="title"
                type="text"
                value={title}
                onChange={(event) =>
                  setTitle(event.target.value)
                }
                placeholder="e.g. Frontend Developer"
                required
                className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none transition focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="description"
                className="text-sm font-medium"
              >
                Job Description
              </label>

              <textarea
                id="description"
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                placeholder="Describe the role, responsibilities and expectations..."
                rows={7}
                required
                className="w-full resize-none rounded-md border bg-background px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="skills"
                className="text-sm font-medium"
              >
                Required Skills
              </label>

              <input
                id="skills"
                type="text"
                value={skills}
                onChange={(event) =>
                  setSkills(event.target.value)
                }
                placeholder="React, TypeScript, Next.js"
                required
                className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none transition focus:ring-2 focus:ring-ring"
              />

              <p className="text-xs text-muted-foreground">
                Separate skills with commas.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Job Details */}
        <Card>
          <CardHeader>
            <CardTitle>Job Details</CardTitle>
          </CardHeader>

          <CardContent className="space-y-5">
            <div className="space-y-2">
              <label
                htmlFor="workType"
                className="text-sm font-medium"
              >
                Work Type
              </label>

              <select
                id="workType"
                value={workType}
                onChange={(event) =>
                  setWorkType(event.target.value)
                }
                className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none transition focus:ring-2 focus:ring-ring"
              >
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
                <option value="On-site">On-site</option>
              </select>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="employmentType"
                className="text-sm font-medium"
              >
                Employment Type
              </label>

              <select
                id="employmentType"
                value={employmentType}
                onChange={(event) =>
                  setEmploymentType(event.target.value)
                }
                className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none transition focus:ring-2 focus:ring-ring"
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
              </select>
            </div>

            <div>
              <div className="mb-2 text-sm font-medium">
                Selected Details
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">
                  {workType}
                </Badge>

                <Badge variant="secondary">
                  {employmentType}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Link
            href="/employer/jobs"
            className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            Cancel
          </Link>

          <Button type="submit">
            <Save className="mr-2 h-4 w-4" />
            {saved ? "Job Created" : "Create Job"}
          </Button>
        </div>
      </form>
    </div>
  );
}