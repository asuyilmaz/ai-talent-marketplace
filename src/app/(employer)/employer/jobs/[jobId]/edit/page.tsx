"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
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

export default function EditJobPage() {
  const params = useParams();
  const router = useRouter();

  const [job, setJob] = useState<EmployerJob | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [skills, setSkills] = useState("");
  const [workType, setWorkType] = useState("Remote");
  const [employmentType, setEmploymentType] =
    useState("Full-time");
  const [status, setStatus] = useState("Published");

  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

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

    if (foundJob) {
      setJob(foundJob);
      setTitle(foundJob.title);
      setDescription(foundJob.description ?? "");
      setSkills((foundJob.skills ?? []).join(", "));
      setWorkType(foundJob.workType);
      setEmploymentType(
        foundJob.employmentType ?? "Full-time"
      );
      setStatus(foundJob.status);
    }

    setLoading(false);
  }, [jobId]);

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!job) {
      return;
    }

    const updatedJob: EmployerJob = {
      ...job,
      title: title.trim(),
      description: description.trim(),
      skills: skills
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean),
      workType,
      employmentType,
      status,
    };

    const savedJobs = localStorage.getItem("employerJobs");

    let customJobs: EmployerJob[] = [];

    if (savedJobs) {
      try {
        const parsedJobs = JSON.parse(savedJobs);

        if (Array.isArray(parsedJobs)) {
          customJobs = parsedJobs;
        }
      } catch {
        customJobs = [];
      }
    }

    const customJobExists = customJobs.some(
      (item) => item.id === job.id
    );

    const updatedCustomJobs = customJobExists
      ? customJobs.map((item) =>
          item.id === job.id ? updatedJob : item
        )
      : [...customJobs, updatedJob];

    localStorage.setItem(
      "employerJobs",
      JSON.stringify(updatedCustomJobs)
    );

    setSaved(true);

    setTimeout(() => {
      router.push(`/employer/jobs/${job.id}`);
    }, 800);
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
          <CardContent className="flex min-h-48 items-center justify-center">
            <div className="text-center">
              <h2 className="text-lg font-semibold">
                Job not found
              </h2>

              <p className="mt-2 text-sm text-muted-foreground">
                The job you are trying to edit could not be found.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* Header */}
      <div>
        <Link
          href={`/employer/jobs/${job.id}`}
          className="mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Job
        </Link>

        <h1 className="text-3xl font-semibold tracking-tight">
          Edit Job
        </h1>

        <p className="mt-2 text-muted-foreground">
          Update your job posting and hiring requirements.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >
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
                required
                className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
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
                rows={7}
                required
                className="w-full resize-none rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
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
                required
                className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
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
                className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
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
                className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
              </select>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="status"
                className="text-sm font-medium"
              >
                Status
              </label>

              <select
                id="status"
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value)
                }
                className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="Published">
                  Published
                </option>
                <option value="Draft">
                  Draft
                </option>
              </select>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">
                {workType}
              </Badge>

              <Badge variant="secondary">
                {employmentType}
              </Badge>

              <Badge variant="secondary">
                {status}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Link
            href={`/employer/jobs/${job.id}`}
            className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
          >
            Cancel
          </Link>

          <Button type="submit">
            <Save className="mr-2 h-4 w-4" />
            {saved ? "Changes Saved" : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}