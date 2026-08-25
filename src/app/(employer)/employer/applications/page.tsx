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
  Briefcase,
  Search,
  Users,
} from "lucide-react";

const applications = [
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

export default function EmployerApplicationsPage() {
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
      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">
              Total Applications
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-4xl font-semibold">
              54
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              Across all active jobs
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
              18
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
              7
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              Candidates in interview stage
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
            placeholder="Search candidates or positions..."
            className="h-10 flex-1 bg-transparent text-sm outline-none"
          />
        </CardContent>
      </Card>

      {/* Application List */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">
            Candidate Applications
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Review the latest candidates applying to your positions.
          </p>
        </div>

        <div className="space-y-4">
          {applications.map((application) => (
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
                            key={skill}
                            variant="secondary"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        Experience: {application.experience}
                      </div>
                    </div>
                  </div>

                  {/* Match + Status */}
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center lg:flex-col lg:items-end">
                    <div className="flex items-center gap-2">
                      <Badge>
                        {application.matchScore}% Match
                      </Badge>

                      <Badge
                        variant={
                          application.status === "Interview"
                            ? "default"
                            : application.status === "Reviewing"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {application.status}
                      </Badge>
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
      </section>
    </div>
  );
}