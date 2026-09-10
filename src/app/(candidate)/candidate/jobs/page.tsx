"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  MapPin,
  Briefcase,
  Sparkles,
} from "lucide-react";
import {
  calculateSkillMatch,
  getMatchLabel,
} from "@/lib/skill-match";

type CandidateJob = {
  id: string;
  title: string;
  description: string;
  company: string;
  skills: string[];
  workType: string;
  employmentType: string;
  applications: number;
  status: string;
  matchScore: number;
};

type JobsResponse = {
  message?: string;
  jobs?: Omit<CandidateJob, "matchScore">[];
};

type CandidateResponse = {
  id: string;
  name: string;
  email: string;
  skills?: string[] | string | null;
};

type CurrentUser = {
  id: string;
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

export default function CandidateJobsPage() {
  const [jobs, setJobs] = useState<CandidateJob[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadJobs() {
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

        const [candidateResponse, jobsResponse] =
          await Promise.all([
            fetch(
              `/api/candidates/${encodeURIComponent(
                currentUser.id
              )}`,
              {
                method: "GET",
                cache: "no-store",
              }
            ),
            fetch("/api/jobs", {
              method: "GET",
              cache: "no-store",
            }),
          ]);

        const candidateData =
          (await candidateResponse.json()) as CandidateResponse & {
            message?: string;
          };

        const jobsData =
          (await jobsResponse.json()) as JobsResponse;

        if (!candidateResponse.ok) {
          setError(
            candidateData.message ||
              "Unable to load your candidate profile."
          );
          return;
        }

        if (!jobsResponse.ok) {
          setError(
            jobsData.message || "Unable to load jobs."
          );
          return;
        }

        const candidateSkills = normalizeCandidateSkills(
          candidateData.skills
        );

        const scoredJobs = (jobsData.jobs ?? [])
          .map((job) => ({
            ...job,
            matchScore: calculateSkillMatch(
              candidateSkills,
              job.skills
            ),
          }))
          .sort((a, b) => b.matchScore - a.matchScore);

        setJobs(scoredJobs);
      } catch {
        setError("Unable to connect to the server.");
      } finally {
        setLoading(false);
      }
    }

    loadJobs();
  }, []);

  const filteredJobs = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return jobs.filter((job) => {
      const title = job.title.toLowerCase();
      const company = job.company.toLowerCase();
      const workType = job.workType.toLowerCase();

      const skills = job.skills.map((skill) =>
        skill.toLowerCase()
      );

      const matchesSearch =
        searchText === "" ||
        title.includes(searchText) ||
        company.includes(searchText) ||
        workType.includes(searchText) ||
        skills.some((skill) =>
          skill.includes(searchText)
        );

      const matchesFilter =
        filter === "All" ||
        (filter === "Remote" &&
          job.workType === "Remote") ||
        (filter === "Hybrid" &&
          job.workType === "Hybrid");

      return matchesSearch && matchesFilter;
    });
  }, [jobs, search, filter]);

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />

          <span className="text-sm font-medium">
            Skill-Based Recommendations
          </span>
        </div>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Recommended Jobs
        </h1>

        <p className="mt-2 text-muted-foreground">
          Discover jobs ranked by how closely their required
          skills match your profile.
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-4 p-5 sm:flex-row">
          <input
            type="text"
            placeholder="Search by job title, company or skill..."
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
            }}
            className="h-10 flex-1 rounded-md border bg-background px-3 text-sm outline-none transition focus:ring-2 focus:ring-ring"
          />

          <Button
            type="button"
            variant={filter === "All" ? "default" : "outline"}
            onClick={() => setFilter("All")}
          >
            All Jobs
          </Button>

          <Button
            type="button"
            variant={
              filter === "Remote" ? "default" : "outline"
            }
            onClick={() => setFilter("Remote")}
          >
            Remote
          </Button>

          <Button
            type="button"
            variant={
              filter === "Hybrid" ? "default" : "outline"
            }
            onClick={() => setFilter("Hybrid")}
          >
            Hybrid
          </Button>
        </CardContent>
      </Card>

      {loading && (
        <Card>
          <CardContent className="flex min-h-40 items-center justify-center p-6">
            <p className="text-sm text-muted-foreground">
              Loading jobs...
            </p>
          </CardContent>
        </Card>
      )}

      {!loading && error && (
        <Card>
          <CardContent className="flex min-h-40 items-center justify-center p-6">
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {!loading && !error && filteredJobs.length > 0 && (
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">Best Matches</h2>

            <p className="mt-1 text-sm text-muted-foreground">
              {filteredJobs.length} jobs match your search.
            </p>
          </div>

          <div className="space-y-4">
            {filteredJobs.map((job) => (
              <Card key={job.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold">
                          {job.title}
                        </h3>

                        <p className="text-sm text-muted-foreground">
                          {job.company}
                        </p>
                      </div>

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

                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
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

                    <div className="flex items-center justify-between gap-4 lg:flex-col lg:items-end">
                      <div className="text-right">
                        <Badge className="text-sm">
                          {job.matchScore}% Match
                        </Badge>

                        <p className="mt-2 text-xs text-muted-foreground">
                          {getMatchLabel(job.matchScore)}
                        </p>
                      </div>

                      <Link
                        href={`/candidate/jobs/${encodeURIComponent(
                          job.id
                        )}`}
                      >
                        <Button variant="outline">
                          View Job
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

      {!loading && !error && filteredJobs.length === 0 && (
        <Card>
          <CardContent className="flex min-h-40 items-center justify-center p-6">
            <div className="text-center">
              <h3 className="font-medium">No jobs found</h3>

              <p className="mt-1 text-sm text-muted-foreground">
                Try a different search or filter.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
