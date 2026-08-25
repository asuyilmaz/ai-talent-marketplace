"use client";

import { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Briefcase } from "lucide-react";
import { recentApplications } from "@/data/applications";

export default function CandidateApplicationsPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const filteredApplications = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return recentApplications.filter((application) => {
      const matchesSearch =
        searchText === "" ||
        application.jobTitle.toLowerCase().includes(searchText) ||
        application.company.toLowerCase().includes(searchText);

      const matchesFilter =
        filter === "All" || application.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [search, filter]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Briefcase className="h-5 w-5" />

          <span className="text-sm font-medium">
            Career Activity
          </span>
        </div>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          My Applications
        </h1>

        <p className="mt-2 text-muted-foreground">
          Track your recent job applications and their current status.
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="flex flex-col gap-4 p-5 sm:flex-row">
          <input
            type="text"
            placeholder="Search by job title or company..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="h-10 flex-1 rounded-md border bg-background px-3 text-sm outline-none transition focus:ring-2 focus:ring-ring"
          />

          <Button
            type="button"
            variant={filter === "All" ? "default" : "outline"}
            onClick={() => setFilter("All")}
          >
            All
          </Button>

          <Button
            type="button"
            variant={filter === "Applied" ? "default" : "outline"}
            onClick={() => setFilter("Applied")}
          >
            Applied
          </Button>

          <Button
            type="button"
            variant={filter === "Interview" ? "default" : "outline"}
            onClick={() => setFilter("Interview")}
          >
            Interview
          </Button>

          <Button
            type="button"
            variant={filter === "Reviewing" ? "default" : "outline"}
            onClick={() => setFilter("Reviewing")}
          >
            Reviewing
          </Button>
        </CardContent>
      </Card>

      {/* Applications */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">
            Recent Applications
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            {filteredApplications.length} applications found.
          </p>
        </div>

        {filteredApplications.length > 0 ? (
          <div className="space-y-4">
            {filteredApplications.map((application) => (
              <Card key={application.id}>
                <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="font-semibold">
                      {application.jobTitle}
                    </h3>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {application.company}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-4 sm:justify-end">
                    <Badge
                      variant={
                        application.status === "Interview"
                          ? "default"
                          : application.status === "Applied"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {application.status}
                    </Badge>

                    <Button variant="outline" size="sm">
                      View
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>No applications found</CardTitle>
            </CardHeader>

            <CardContent>
              <p className="text-sm text-muted-foreground">
                Try a different search or filter.
              </p>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}