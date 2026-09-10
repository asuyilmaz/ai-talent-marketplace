"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Search,
  Sparkles,
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

type Candidate = {
  id: string;
  name: string;
  email: string;
  bio: string | null;
  phone: string | null;
  location: string | null;
  experienceTitle: string | null;
  experienceYears: number | null;
  skills: string[];
  createdAt: string;
};

type CandidatesResponse = {
  candidates?: Candidate[];
  error?: string;
};

function getInitials(name: string) {
  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return initials || "?";
}

function formatExperience(
  years: number | null
) {
  if (
    years === null ||
    years === undefined
  ) {
    return "Experience not specified";
  }

  if (years === 0) {
    return "Entry level";
  }

  if (years === 1) {
    return "1 year experience";
  }

  return `${years} years experience`;
}

function isNewThisWeek(
  createdAt: string
) {
  const createdDate = new Date(createdAt);

  if (
    Number.isNaN(
      createdDate.getTime()
    )
  ) {
    return false;
  }

  const sevenDaysAgo =
    Date.now() -
    7 * 24 * 60 * 60 * 1000;

  return (
    createdDate.getTime() >=
    sevenDaysAgo
  );
}

export default function EmployerCandidatesPage() {
  const [candidates, setCandidates] =
    useState<Candidate[]>([]);

  const [search, setSearch] =
    useState("");

  const [filter, setFilter] =
    useState<
      "All" | "Experienced" | "New"
    >("All");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function loadCandidates() {
      try {
        setLoading(true);
        setError("");

        const storedUser =
          localStorage.getItem(
            "currentUser"
          );

        if (!storedUser) {
          setError(
            "Please log in to view candidates."
          );
          return;
        }

        const currentUser =
          JSON.parse(storedUser) as {
            id?: string;
            role?: string;
          };

        if (
          !currentUser.role ||
          currentUser.role.toLowerCase() !==
            "employer"
        ) {
          setError(
            "This page is only available for employers."
          );
          return;
        }

        const response = await fetch(
          "/api/candidates",
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const data =
          (await response.json()) as CandidatesResponse;

        if (!response.ok) {
          throw new Error(
            data.error ||
              "Failed to load candidates."
          );
        }

        setCandidates(
          Array.isArray(
            data.candidates
          )
            ? data.candidates
            : []
        );
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load candidates."
        );
      } finally {
        setLoading(false);
      }
    }

    loadCandidates();
  }, []);

  const filteredCandidates =
    useMemo(() => {
      const searchText = search
        .trim()
        .toLowerCase();

      return candidates.filter(
        (candidate) => {
          const matchesSearch =
            searchText === "" ||
            candidate.name
              .toLowerCase()
              .includes(
                searchText
              ) ||
            candidate.email
              .toLowerCase()
              .includes(
                searchText
              ) ||
            (
              candidate.experienceTitle ??
              ""
            )
              .toLowerCase()
              .includes(
                searchText
              ) ||
            (
              candidate.location ??
              ""
            )
              .toLowerCase()
              .includes(
                searchText
              ) ||
            candidate.skills.some(
              (skill) =>
                skill
                  .toLowerCase()
                  .includes(
                    searchText
                  )
            );

          const matchesFilter =
            filter === "All" ||
            (filter ===
              "Experienced" &&
              typeof candidate.experienceYears ===
                "number" &&
              candidate.experienceYears >
                0) ||
            (filter === "New" &&
              isNewThisWeek(
                candidate.createdAt
              ));

          return (
            matchesSearch &&
            matchesFilter
          );
        }
      );
    }, [
      candidates,
      search,
      filter,
    ]);

  const experiencedCandidates =
    candidates.filter(
      (candidate) =>
        typeof candidate.experienceYears ===
          "number" &&
        candidate.experienceYears > 0
    ).length;

  const newThisWeek =
    candidates.filter(
      (candidate) =>
        isNewThisWeek(
          candidate.createdAt
        )
    ).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />

          <span className="text-sm font-medium">
            Talent Discovery
          </span>
        </div>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Candidates
        </h1>

        <p className="mt-2 text-muted-foreground">
          Discover candidate profiles
          registered on the platform.
        </p>
      </div>

      {error && (
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-destructive">
              {error}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Overview */}
      {!error && (
        <section className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium">
                Total Candidates
              </CardTitle>
            </CardHeader>

            <CardContent>
              <p className="text-4xl font-semibold">
                {candidates.length}
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                Registered candidate
                profiles
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium">
                Experienced
              </CardTitle>
            </CardHeader>

            <CardContent>
              <p className="text-4xl font-semibold">
                {
                  experiencedCandidates
                }
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                Candidates with
                experience information
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
                {newThisWeek}
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                Registered in the last
                7 days
              </p>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Search and Filters */}
      {!error && (
        <Card>
          <CardContent className="flex flex-col gap-4 p-5 sm:flex-row">
            <div className="flex flex-1 items-center gap-3 rounded-md border px-3">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" />

              <input
                type="text"
                placeholder="Search candidates, roles, locations or skills..."
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                className="h-10 w-full bg-transparent text-sm outline-none"
              />
            </div>

            <Button
              type="button"
              variant={
                filter === "All"
                  ? "default"
                  : "outline"
              }
              onClick={() =>
                setFilter("All")
              }
            >
              All
            </Button>

            <Button
              type="button"
              variant={
                filter ===
                "Experienced"
                  ? "default"
                  : "outline"
              }
              onClick={() =>
                setFilter(
                  "Experienced"
                )
              }
            >
              Experienced
            </Button>

            <Button
              type="button"
              variant={
                filter === "New"
                  ? "default"
                  : "outline"
              }
              onClick={() =>
                setFilter("New")
              }
            >
              New
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Candidate List */}
      {!error && (
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">
              Candidate Profiles
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              {loading
                ? "Loading candidates..."
                : `${filteredCandidates.length} candidate${
                    filteredCandidates.length ===
                    1
                      ? ""
                      : "s"
                  } found.`}
            </p>
          </div>

          {loading ? (
            <Card>
              <CardContent className="flex min-h-40 items-center justify-center p-6">
                <p className="text-sm text-muted-foreground">
                  Loading candidate
                  profiles...
                </p>
              </CardContent>
            </Card>
          ) : filteredCandidates.length >
            0 ? (
            <div className="space-y-4">
              {filteredCandidates.map(
                (candidate) => (
                  <Card
                    key={candidate.id}
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                        {/* Candidate Information */}
                        <div className="flex items-start gap-4">
                          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-muted font-semibold">
                            {getInitials(
                              candidate.name
                            )}
                          </div>

                          <div className="space-y-3">
                            <div>
                              <h3 className="font-semibold">
                                {
                                  candidate.name
                                }
                              </h3>

                              <p className="text-sm text-muted-foreground">
                                {candidate.experienceTitle ||
                                  "Candidate"}
                              </p>
                            </div>

                            {candidate
                              .skills
                              .length >
                            0 ? (
                              <div className="flex flex-wrap gap-2">
                                {candidate.skills.map(
                                  (
                                    skill
                                  ) => (
                                    <Badge
                                      key={`${candidate.id}-${skill}`}
                                      variant="secondary"
                                    >
                                      {
                                        skill
                                      }
                                    </Badge>
                                  )
                                )}
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground">
                                No skills
                                added yet.
                              </p>
                            )}

                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-2">
                                <Users className="h-4 w-4" />

                                {formatExperience(
                                  candidate.experienceYears
                                )}
                              </span>

                              {candidate.location && (
                                <span>
                                  {
                                    candidate.location
                                  }
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end">
                          <Link
                            href={`/employer/candidates/${encodeURIComponent(
                              candidate.id
                            )}`}
                          >
                            <Button variant="outline">
                              View Candidate
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="flex min-h-40 items-center justify-center p-6">
                <div className="text-center">
                  <h3 className="font-medium">
                    No candidates found
                  </h3>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {candidates.length ===
                    0
                      ? "There are no registered candidates yet."
                      : "Try a different search or filter."}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </section>
      )}
    </div>
  );
}