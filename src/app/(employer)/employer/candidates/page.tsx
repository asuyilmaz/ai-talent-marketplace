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
import {
  ArrowRight,
  Search,
  Sparkles,
  Users,
} from "lucide-react";

const candidates = [
  {
    id: "candidate-1",
    name: "Asu Yılmaz",
    role: "Frontend Developer",
    matchScore: 94,
    experience: "Frontend Development",
    availability: "Open to opportunities",
    skills: ["React", "Next.js", "TypeScript"],
  },
  {
    id: "candidate-2",
    name: "Elif Kaya",
    role: "React Developer",
    matchScore: 91,
    experience: "2 years",
    availability: "Available",
    skills: ["React", "JavaScript", "CSS"],
  },
  {
    id: "candidate-3",
    name: "Mert Demir",
    role: "UI Engineer",
    matchScore: 87,
    experience: "1 year",
    availability: "Open to opportunities",
    skills: ["React", "Tailwind", "UI/UX"],
  },
  {
    id: "candidate-4",
    name: "Zeynep Aydın",
    role: "Frontend Developer",
    matchScore: 82,
    experience: "2 years",
    availability: "Available",
    skills: ["JavaScript", "CSS", "React"],
  },
];

export default function EmployerCandidatesPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const filteredCandidates = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return candidates.filter((candidate) => {
      const matchesSearch =
        searchText === "" ||
        candidate.name.toLowerCase().includes(searchText) ||
        candidate.role.toLowerCase().includes(searchText) ||
        candidate.skills.some((skill) =>
          skill.toLowerCase().includes(searchText)
        );

      const matchesFilter =
        filter === "All" ||
        (filter === "90+" && candidate.matchScore >= 90) ||
        (filter === "80+" && candidate.matchScore >= 80);

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
            AI Talent Discovery
          </span>
        </div>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Candidates
        </h1>

        <p className="mt-2 text-muted-foreground">
          Discover and review candidates ranked by AI compatibility.
        </p>
      </div>

      {/* Overview */}
      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">
              Total Candidates
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-4xl font-semibold">
              128
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              Candidates in your talent pool
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">
              Strong Matches
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-4xl font-semibold">
              42
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              Candidates with 90%+ match
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">
              New This Week
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-4xl font-semibold">
              18
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              Recently added candidates
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Search and Filters */}
      <Card>
        <CardContent className="flex flex-col gap-4 p-5 sm:flex-row">
          <div className="flex flex-1 items-center gap-3 rounded-md border px-3">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />

            <input
              type="text"
              placeholder="Search candidates, roles or skills..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              className="h-10 w-full bg-transparent text-sm outline-none"
            />
          </div>

          <Button
            type="button"
            variant={filter === "All" ? "default" : "outline"}
            onClick={() => setFilter("All")}
          >
            All
          </Button>

          <Button
            type="button"
            variant={filter === "90+" ? "default" : "outline"}
            onClick={() => setFilter("90+")}
          >
            90%+
          </Button>

          <Button
            type="button"
            variant={filter === "80+" ? "default" : "outline"}
            onClick={() => setFilter("80+")}
          >
            80%+
          </Button>
        </CardContent>
      </Card>

      {/* Candidate List */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">
            Recommended Candidates
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            {filteredCandidates.length} candidates match your criteria.
          </p>
        </div>

        {filteredCandidates.length > 0 ? (
          <div className="space-y-4">
            {filteredCandidates.map((candidate) => (
              <Card key={candidate.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                    {/* Candidate Information */}
                    <div className="flex items-start gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-muted font-semibold">
                        {candidate.name
                          .split(" ")
                          .map((name) => name[0])
                          .join("")}
                      </div>

                      <div className="space-y-3">
                        <div>
                          <h3 className="font-semibold">
                            {candidate.name}
                          </h3>

                          <p className="text-sm text-muted-foreground">
                            {candidate.role}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {candidate.skills.map((skill) => (
                            <Badge
                              key={skill}
                              variant="secondary"
                            >
                              {skill}
                            </Badge>
                          ))}
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            {candidate.experience}
                          </span>

                          <span>
                            {candidate.availability}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Match */}
                    <div className="flex items-center justify-between gap-4 lg:flex-col lg:items-end">
                      <div className="text-right">
                        <Badge className="text-sm">
                          {candidate.matchScore}% Match
                        </Badge>

                        <p className="mt-2 text-xs text-muted-foreground">
                          Strong compatibility
                        </p>
                      </div>

                      <Button variant="outline">
                        View Candidate
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
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
                  No candidates found
                </h3>

                <p className="mt-1 text-sm text-muted-foreground">
                  Try a different search or match filter.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}