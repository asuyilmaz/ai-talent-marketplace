"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
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

type CurrentUser = {
  id: string;
  name: string;
  email: string;
  role: "candidate" | "employer";
};

type CreateJobResponse = {
  message?: string;
  job?: {
    id: string;
    title: string;
    description: string;
    company: string;
    skills: string[];
    workType: string;
    employmentType: string;
    applications: number;
    matchRate: number;
    status: string;
  };
};

export default function CreateJobPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [skills, setSkills] = useState("");
  const [workType, setWorkType] =
    useState("Remote");
  const [employmentType, setEmploymentType] =
    useState("Full-time");

  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const storedUser =
        localStorage.getItem("currentUser");

      if (!storedUser) {
        router.push("/login");
        return;
      }

      let currentUser: CurrentUser;

      try {
        currentUser = JSON.parse(storedUser);
      } catch {
        localStorage.removeItem("currentUser");
        router.push("/login");
        return;
      }

      if (currentUser.role !== "employer") {
        setError(
          "Only employer accounts can create jobs."
        );
        return;
      }

      const skillList = skills
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean);

      if (skillList.length === 0) {
        setError(
          "Please enter at least one required skill."
        );
        return;
      }

      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: currentUser.id,
          title,
          description,
          skills: skillList,
          workType,
          employmentType,
        }),
      });

      const data =
        (await response.json()) as CreateJobResponse;

      if (!response.ok || !data.job) {
        setError(
          data.message ||
            "Unable to create the job."
        );
        return;
      }

      setSaved(true);

      setTimeout(() => {
        router.push("/employer/jobs");
      }, 800);
    } catch {
      setError(
        "Unable to connect to the server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-[1380px] space-y-8">
      {/* Header */}
      <div>
        <Link
          href="/employer/jobs"
          className="mb-4 inline-flex items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Jobs
        </Link>

        <p className="text-[10px] font-black uppercase tracking-[.22em] text-[#6d5dfc]">Role composer / 04</p>

        <h1 className="mt-4 text-5xl font-black tracking-[-.06em] sm:text-6xl">
          Create Job
        </h1>

        <p className="mt-2 text-muted-foreground">
          Create a new job posting and attract qualified candidates.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid gap-0 border-y border-black lg:grid-cols-[1.2fr_.8fr]"
      >
        {/* Basic Information */}
        <Card className="rounded-none border-0 bg-transparent shadow-none lg:border-r lg:border-black">
          <CardHeader>
            <CardTitle>
              Basic Information
            </CardTitle>
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
                className="h-12 w-full border-0 border-b border-black bg-transparent px-0 text-sm outline-none transition focus:border-[#6d5dfc]"
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
                className="w-full resize-none border border-black/20 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#6d5dfc]"
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
                className="h-12 w-full border-0 border-b border-black bg-transparent px-0 text-sm outline-none transition focus:border-[#6d5dfc]"
              />

              <p className="text-xs text-muted-foreground">
                Separate skills with commas.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Job Details */}
        <Card className="rounded-none border-0 bg-transparent shadow-none">
          <CardHeader>
            <CardTitle>
              Job Details
            </CardTitle>
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
                  setWorkType(
                    event.target.value
                  )
                }
                className="h-12 w-full border-0 border-b border-black bg-transparent px-0 text-sm outline-none transition focus:border-[#6d5dfc]"
              >
                <option value="Remote">
                  Remote
                </option>

                <option value="Hybrid">
                  Hybrid
                </option>

                <option value="On-site">
                  On-site
                </option>
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
                  setEmploymentType(
                    event.target.value
                  )
                }
                className="h-12 w-full border-0 border-b border-black bg-transparent px-0 text-sm outline-none transition focus:border-[#6d5dfc]"
              >
                <option value="Full-time">
                  Full-time
                </option>

                <option value="Part-time">
                  Part-time
                </option>

                <option value="Contract">
                  Contract
                </option>
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

        {error && (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3">
            <p className="text-sm text-destructive">
              {error}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Link
            href="/employer/jobs"
            className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            Cancel
          </Link>

          <Button
            type="submit"
            disabled={loading}
          >
            <Save className="mr-2 h-4 w-4" />

            {loading
              ? "Creating..."
              : saved
                ? "Job Created"
                : "Create Job"}
          </Button>
        </div>
      </form>
    </div>
  );
}