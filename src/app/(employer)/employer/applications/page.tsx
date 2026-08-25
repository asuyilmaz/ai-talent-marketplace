"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Briefcase,
  Search,
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

type ApplicationStatus =
  | "Applied"
  | "Reviewing"
  | "Interview"
  | "Hired"
  | "Rejected";

type Application = {
  id: string;
  candidateId?: string;
  candidate: string;
  jobId?: string;
  role: string;
  company?: string;
  matchScore: number;
  status: ApplicationStatus;
  experience: string;
  skills: string[];
  appliedAt?: string;
};

const defaultApplications: Application[] = [
  {
    id: "application-1",
    candidate: "Asu Yılmaz",
    role: "Frontend Developer",
    matchScore: 94,
    status: "Interview",
    experience: "Frontend Development",
    skills: ["React", "Next.js", "TypeScript"],
  },
  {
    id: "application-2",
    candidate: "Elif Kaya",
    role: "React Developer",
    matchScore: 91,
    status: "Reviewing",
    experience: "2 years",
    skills: ["React", "JavaScript", "CSS"],
  },
  {
    id: "application-3",
    candidate: "Mert Demir",
    role: "UI Engineer",
    matchScore: 87,
    status: "Applied",
    experience: "1 year",
    skills: ["React", "Tailwind", "UI/UX"],
  },
  {
    id: "application-4",
    candidate: "Zeynep Aydın",
    role: "Frontend Developer",
    matchScore: 82,
    status: "Reviewing",
    experience: "2 years",
    skills: ["JavaScript", "CSS", "React"],
  },
];

const statusOptions: ApplicationStatus[] = [
  "Applied",
  "Reviewing",
  "Interview",
  "Hired",
  "Rejected",
];

export default function EmployerApplicationsPage() {
  const [applications, setApplications] =
    useState<Application[]>(defaultApplications);

  const [search, setSearch] = useState("");

  useEffect(() => {
    const storedApplications =
      localStorage.getItem("candidateApplications");

    if (!storedApplications) {
      setApplications(defaultApplications);
      return;
    }

    try {
      const parsed: unknown = JSON.parse(storedApplications);

      if (!Array.isArray(parsed)) {
        setApplications(defaultApplications);
        return;
      }

      const stored = parsed as Application[];

      const storedById = new Map(
        stored.map((application) => [
          application.id,
          application,
        ])
      );

      const mergedDefaultApplications =
        defaultApplications.map((application) => {
          const storedApplication =
            storedById.get(application.id);

          if (!storedApplication) {
            return application;
          }

          return {
            ...application,
            ...storedApplication,
            status: storedApplication.status,
          };
        });

      const defaultIds = new Set(
        defaultApplications.map(
          (application) => application.id
        )
      );

      const customApplications = stored.filter(
        (application) => !defaultIds.has(application.id)
      );

      setApplications([
        ...customApplications,
        ...mergedDefaultApplications,
      ]);
    } catch {
      setApplications(defaultApplications);
    }
  }, []);

  function updateApplicationStatus(
    applicationId: string,
    newStatus: ApplicationStatus
  ) {
    const updatedApplications = applications.map(
      (application) =>
        application.id === applicationId
          ? {
              ...application,
              status: newStatus,
            }
          : application
    );

    setApplications(updatedApplications);

    /*
     * Bütün başvuruları kaydediyoruz.
     * Böylece default/demo başvurularının da
     * değiştirilmiş status bilgisi korunuyor.
     */
    localStorage.setItem(
      "candidateApplications",
      JSON.stringify(updatedApplications)
    );
  }

  const filteredApplications = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    if (!searchText) {
      return applications;
    }

    return applications.filter((application) => {
      return (
        application.candidate
          .toLowerCase()
          .includes(searchText) ||
        application.role
          .toLowerCase()
          .includes(searchText) ||
        application.skills.some((skill) =>
          skill.toLowerCase().includes(searchText)
        )
      );
    });
  }, [applications, search]);

  const totalApplications = applications.length;

  const reviewingCount = applications.filter(
    (application) => application.status === "Reviewing"
  ).length;

  const interviewCount = applications.filter(
    (application) => application.status === "Interview"
  ).length;

  const hiredCount = applications.filter(
    (application) => application.status === "Hired"
  ).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Briefcase className="h-5 w-5" />

          <span className="text-sm font-medium">
            Recruitment
          </span>
        </div>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Applications
        </h1>

        <p className="mt-2 text-muted-foreground">
          Review candidates and manage your recruitment pipeline.
        </p>
      </div>

      {/* Overview */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">
              Total Applications
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-4xl font-semibold">
              {totalApplications}
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              Across your job postings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">
              In Review
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-4xl font-semibold">
              {reviewingCount}
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              Candidates being reviewed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">
              Interviews
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-4xl font-semibold">
              {interviewCount}
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              Candidates in interview stage
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">
              Hired
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-4xl font-semibold">
              {hiredCount}
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              Successful applications
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Search */}
      <Card>
        <CardContent className="flex items-center gap-3 p-5">
          <Search className="h-4 w-4 text-muted-foreground" />

          <input
            type="text"
            placeholder="Search candidates, positions or skills..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            className="h-10 flex-1 bg-transparent text-sm outline-none"
          />
        </CardContent>
      </Card>

      {/* Applications */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">
            Candidate Applications
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            {filteredApplications.length} applications found.
          </p>
        </div>

        {filteredApplications.length > 0 ? (
          <div className="space-y-4">
            {filteredApplications.map((application) => (
              <Card key={application.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                    {/* Candidate */}
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-muted font-semibold">
                        {application.candidate
                          .split(" ")
                          .map((name) => name[0])
                          .join("")}
                      </div>

                      <div className="space-y-2">
                        <div>
                          <h3 className="font-semibold">
                            {application.candidate}
                          </h3>

                          <p className="text-sm text-muted-foreground">
                            {application.role}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {application.skills.map((skill) => (
                            <Badge
                              key={`${application.id}-${skill}`}
                              variant="secondary"
                            >
                              {skill}
                            </Badge>
                          ))}
                        </div>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Users className="h-4 w-4" />
                          Experience:{" "}
                          {application.experience}
                        </div>
                      </div>
                    </div>

                    {/* Status + Match */}
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center lg:flex-col lg:items-end">
                      <div className="flex items-center gap-2">
                        <Badge>
                          {application.matchScore}% Match
                        </Badge>

                        <Badge
                          variant={
                            application.status === "Hired"
                              ? "default"
                              : application.status === "Rejected"
                                ? "destructive"
                                : application.status ===
                                    "Interview"
                                  ? "default"
                                  : application.status ===
                                      "Reviewing"
                                    ? "secondary"
                                    : "outline"
                          }
                        >
                          {application.status}
                        </Badge>
                      </div>

                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <select
                          value={application.status}
                          onChange={(event) =>
                            updateApplicationStatus(
                              application.id,
                              event.target
                                .value as ApplicationStatus
                            )
                          }
                          className="h-9 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                        >
                          {statusOptions.map((status) => (
                            <option
                              key={status}
                              value={status}
                            >
                              {status}
                            </option>
                          ))}
                        </select>

                        <Button variant="outline">
                          View Candidate
                        </Button>
                      </div>
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
                  No applications found
                </h3>

                <p className="mt-1 text-sm text-muted-foreground">
                  Try another search.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}