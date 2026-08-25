"use client";
import Link from "next/link";



import { useMemo, useState } from "react";
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
import { recommendedJobs } from "@/data/jobs";

export default function CandidateJobsPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const filteredJobs = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return recommendedJobs.filter((job) => {
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
  }, [search, filter]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />

          <span className="text-sm font-medium">
            AI Recommendations
          </span>
        </div>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Recommended Jobs
        </h1>

        <p className="mt-2 text-muted-foreground">
          Discover jobs that match your skills, experience and career goals.
        </p>
      </div>

      {/* Filters */}
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
            variant={filter === "Remote" ? "default" : "outline"}
            onClick={() => setFilter("Remote")}
          >
            Remote
          </Button>

          <Button
            type="button"
            variant={filter === "Hybrid" ? "default" : "outline"}
            onClick={() => setFilter("Hybrid")}
          >
            Hybrid
          </Button>
        </CardContent>
      </Card>

      {/* Job List */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">
            Best Matches
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            {filteredJobs.length} jobs match your search.
          </p>
        </div>

        {filteredJobs.length > 0 ? (
          <div className="space-y-4">
            {filteredJobs.map((job) => (
              <Card key={job.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                    {/* Job Information */}
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold">
                          {job.title}
                        </h3>

                        <p className="text-sm text-muted-foreground">
                          {job.company}
                        </p>
                      </div>

                      {/* Skills */}
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

                      {/* Job Details */}
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

                    {/* Match */}
                    <div className="flex items-center justify-between gap-4 lg:flex-col lg:items-end">
                      <div className="text-right">
                        <Badge className="text-sm">
                          {job.matchScore}% Match
                        </Badge>

                        <p className="mt-2 text-xs text-muted-foreground">
                          Strong match
                        </p>
                      </div>

                      <Link href={`/candidate/jobs/${job.id}`}>
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
        ) : (
          <Card>
            <CardContent className="flex min-h-40 items-center justify-center p-6">
              <div className="text-center">
                <h3 className="font-medium">
                  No jobs found
                </h3>

                <p className="mt-1 text-sm text-muted-foreground">
                  Try a different search or filter.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}