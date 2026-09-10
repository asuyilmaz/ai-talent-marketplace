"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Briefcase,
  CheckCircle2,
  MapPin,
  Sparkles,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  calculateSkillMatch,
  getMatchLabel,
} from "@/lib/skill-match";

type Job = {
  id: string;
  title: string;
  description: string;
  company: string;
  companyId: string;
  skills: string[];
  workType: string;
  employmentType: string;
  applications: number;
};

type JobResponse = {
  message?: string;
  job?: Job;
};

type CandidateResponse = {
  id: string;
  skills?: string[] | string | null;
  message?: string;
};

type CandidateApplication = {
  id: string;
  jobId: string;
};

type ApplicationsResponse = {
  message?: string;
  applications?: CandidateApplication[];
};

type ApplicationResponse = {
  message?: string;
  application?: {
    id: string;
    jobId: string;
    role: string;
    company: string;
    status: string;
    matchScore: number;
    appliedAt: string;
  };
};

type CurrentUser = {
  id: string;
  name?: string;
  email?: string;
  role?: string;
};

function normalizeCandidateSkills(
  skills: CandidateResponse["skills"]
): string[] {
  if (Array.isArray(skills)) {
    return skills
      .map((skill) => skill.trim())
      .filter(Boolean);
  }

  if (typeof skills === "string") {
    return skills
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);
  }

  return [];
}

export default function JobDetailsPage() {
  const params = useParams();
  const rawJobId = params.jobId;

  const jobId =
    typeof rawJobId === "string"
      ? rawJobId
      : Array.isArray(rawJobId)
        ? rawJobId[0]
        : undefined;

  const [job, setJob] = useState<Job | null>(null);
  const [matchScore, setMatchScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (typeof jobId !== "string" || jobId.length === 0) {
      setLoading(false);
      setError("Job ID is missing.");
      return;
    }

    const currentJobId = jobId;

    async function loadJob() {
      try {
        const storedUser = localStorage.getItem("currentUser");

        if (!storedUser) {
          window.location.href = "/login";
          return;
        }

        let currentUser: CurrentUser;

        try {
          currentUser = JSON.parse(storedUser) as CurrentUser;
        } catch {
          localStorage.removeItem("currentUser");
          window.location.href = "/login";
          return;
        }

        if (
          !currentUser.role ||
          currentUser.role.toLowerCase() !== "candidate"
        ) {
          window.location.href = "/employer/dashboard";
          return;
        }

        const [jobResponse, candidateResponse, applicationsResponse] =
          await Promise.all([
            fetch(
              `/api/jobs/${encodeURIComponent(currentJobId)}`,
              {
                method: "GET",
                cache: "no-store",
              }
            ),
            fetch(
              `/api/candidates/${encodeURIComponent(
                currentUser.id
              )}`,
              {
                method: "GET",
                cache: "no-store",
              }
            ),
            fetch(
              `/api/applications?candidateId=${encodeURIComponent(
                currentUser.id
              )}`,
              {
                method: "GET",
                cache: "no-store",
              }
            ),
          ]);

        const jobData = (await jobResponse.json()) as JobResponse;
        const candidateData =
          (await candidateResponse.json()) as CandidateResponse;
        const applicationsData =
          (await applicationsResponse.json()) as ApplicationsResponse;

        if (!jobResponse.ok || !jobData.job) {
          setError(jobData.message || "Job not found.");
          return;
        }

        if (!candidateResponse.ok) {
          setError(
            candidateData.message ||
              "Unable to load your candidate profile."
          );
          return;
        }

        if (!applicationsResponse.ok) {
          setError(
            applicationsData.message ||
              "Unable to check your applications."
          );
          return;
        }

        const candidateSkills = normalizeCandidateSkills(
          candidateData.skills
        );

        setJob(jobData.job);
        setMatchScore(
          calculateSkillMatch(candidateSkills, jobData.job.skills)
        );
        setApplied(
          (applicationsData.applications ?? []).some(
            (application) => application.jobId === currentJobId
          )
        );
      } catch {
        setError("Unable to connect to the server.");
      } finally {
        setLoading(false);
      }
    }

    loadJob();
  }, [jobId]);

  async function handleApply() {
    if (!job || applying || applied) {
      return;
    }

    setError("");
    setApplying(true);

    try {
      const storedUser = localStorage.getItem("currentUser");

      if (!storedUser) {
        window.location.href = "/login";
        return;
      }

      let currentUser: CurrentUser;

      try {
        currentUser = JSON.parse(storedUser) as CurrentUser;
      } catch {
        localStorage.removeItem("currentUser");
        window.location.href = "/login";
        return;
      }

      if (
        !currentUser.role ||
        currentUser.role.toLowerCase() !== "candidate"
      ) {
        setError("Only candidate accounts can apply for jobs.");
        return;
      }

      const response = await fetch("/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          candidateId: currentUser.id,
          jobId: job.id,
        }),
      });

      const data =
        (await response.json()) as ApplicationResponse;

      if (!response.ok) {
        if (response.status === 409) {
          setApplied(true);
          return;
        }

        setError(
          data.message || "Unable to submit your application."
        );
        return;
      }

      if (data.application) {
        setApplied(true);
        setSaved(true);

        setTimeout(() => {
          setSaved(false);
        }, 2500);
      }
    } catch {
      setError("Unable to connect to the server.");
    } finally {
      setApplying(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Link
          href="/candidate/jobs"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Jobs
        </Link>

        <Card>
          <CardContent className="flex min-h-48 items-center justify-center">
            <p className="text-sm text-muted-foreground">
              Loading job...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!job || error) {
    return (
      <div className="space-y-6">
        <Link
          href="/candidate/jobs"
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
                {error ||
                  "The job you are looking for could not be found."}
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
        href="/candidate/jobs"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Jobs
      </Link>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <Sparkles className="h-5 w-5" />

                <span className="text-sm font-medium">
                  Skill Match
                </span>
              </div>

              <h1 className="text-3xl font-semibold tracking-tight">
                {job.title}
              </h1>

              <p className="mt-2 text-lg text-muted-foreground">
                {job.company}
              </p>

              <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {job.workType}
                </span>

                <span className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  {job.employmentType}
                </span>
              </div>
            </div>

            <div className="rounded-lg border p-5 text-center">
              <p className="text-sm text-muted-foreground">
                Skill Match
              </p>

              <p className="mt-1 text-4xl font-semibold">
                {matchScore}%
              </p>

              <Badge className="mt-2">
                {getMatchLabel(matchScore)}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>About the Position</CardTitle>
          </CardHeader>

          <CardContent>
            <p className="whitespace-pre-line text-sm leading-7 text-muted-foreground">
              {job.description ||
                "No job description was provided."}
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
                  <Badge
                    key={`${job.id}-${skill}`}
                    variant="secondary"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No required skills were listed.
              </p>
            )}
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>
            {applied ? "Application Submitted" : "Ready to Apply?"}
          </CardTitle>

          <p className="text-sm text-muted-foreground">
            {applied
              ? "You have already applied for this position."
              : `Your profile has a ${matchScore}% skill match for this position.`}
          </p>
        </CardHeader>

        <CardContent>
          {applied ? (
            <Button variant="outline" disabled>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              {saved ? "Application Saved" : "Already Applied"}
            </Button>
          ) : (
            <>
              {error && (
                <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 p-3">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <Button
                size="lg"
                onClick={handleApply}
                disabled={applying}
              >
                {applying ? "Applying..." : "Apply Now"}
                <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
