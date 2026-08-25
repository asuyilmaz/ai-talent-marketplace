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

import { candidateProfile } from "@/data/profile";
import { recommendedJobs } from "@/data/jobs";

type Application = {
  id: string;
  candidateId: string;
  candidate: string;
  jobId: string;
  role: string;
  company: string;
  matchScore: number;
  status: "Applied";
  experience: string;
  skills: string[];
  appliedAt: string;
};

export default function JobDetailsPage() {
  const params = useParams();

  const jobId = Array.isArray(params.jobId)
    ? params.jobId[0]
    : params.jobId;

  const job = recommendedJobs.find(
    (item) => item.id === jobId
  );

  const [applied, setApplied] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!jobId) {
      return;
    }

    const storedApplications =
      localStorage.getItem("candidateApplications");

    if (!storedApplications) {
      return;
    }

    try {
      const applications: Application[] =
        JSON.parse(storedApplications);

      const alreadyApplied = applications.some(
        (application) =>
          application.jobId === jobId &&
          application.candidate === candidateProfile.name
      );

      setApplied(alreadyApplied);
    } catch {
      setApplied(false);
    }
  }, [jobId]);

  function handleApply() {
    if (!job || applied) {
      return;
    }

    const newApplication: Application = {
      id: `application-${Date.now()}`,
      candidateId: "candidate-1",
      candidate: candidateProfile.name,
      jobId: job.id,
      role: job.title,
      company: job.company,
      matchScore: job.matchScore,
      status: "Applied",
      experience: candidateProfile.experience.title,
      skills: job.skills,
      appliedAt: new Date().toISOString(),
    };

    const storedApplications =
      localStorage.getItem("candidateApplications");

    let applications: Application[] = [];

    if (storedApplications) {
      try {
        const parsed = JSON.parse(storedApplications);

        if (Array.isArray(parsed)) {
          applications = parsed;
        }
      } catch {
        applications = [];
      }
    }

    const alreadyExists = applications.some(
      (application) =>
        application.jobId === job.id &&
        application.candidate === candidateProfile.name
    );

    if (alreadyExists) {
      setApplied(true);
      return;
    }

    localStorage.setItem(
      "candidateApplications",
      JSON.stringify([
        newApplication,
        ...applications,
      ])
    );

    setApplied(true);
    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2500);
  }

  if (!job) {
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
            <div className="text-center">
              <h2 className="text-lg font-semibold">
                Job not found
              </h2>

              <p className="mt-2 text-sm text-muted-foreground">
                The job you are looking for could not be found.
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
        href="/candidate/jobs"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Jobs
      </Link>

      {/* Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <Sparkles className="h-5 w-5" />

                <span className="text-sm font-medium">
                  AI Recommended
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
                AI Match
              </p>

              <p className="mt-1 text-4xl font-semibold">
                {job.matchScore}%
              </p>

              <Badge className="mt-2">
                Strong Match
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>About the Position</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <p className="text-sm leading-7 text-muted-foreground">
              This position is a strong match for your current
              skills and career goals. You will have the
              opportunity to work with modern technologies and
              contribute to meaningful software projects.
            </p>

            <p className="text-sm leading-7 text-muted-foreground">
              The role offers an environment where you can
              continue developing your technical skills while
              working with an experienced team.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Required Skills</CardTitle>
          </CardHeader>

          <CardContent>
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
          </CardContent>
        </Card>
      </section>

      {/* Application */}
      <Card>
        <CardHeader>
          <CardTitle>
            {applied
              ? "Application Submitted"
              : "Ready to Apply?"}
          </CardTitle>

          <p className="text-sm text-muted-foreground">
            {applied
              ? "Your application has been recorded for this position."
              : `Your profile is a ${job.matchScore}% match for this position.`}
          </p>
        </CardHeader>

        <CardContent>
          {applied ? (
            <Button
              variant="outline"
              disabled
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              {saved ? "Application Saved" : "Already Applied"}
            </Button>
          ) : (
            <Button
              size="lg"
              onClick={handleApply}
            >
              Apply Now
              <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}