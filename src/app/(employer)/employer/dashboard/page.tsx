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
 
  Users,
  TrendingUp,
  Sparkles,
} from "lucide-react";

const activeJobs = [
  {
    id: "job-1",
    title: "Frontend Developer",
    applications: 24,
    matchRate: 92,
    status: "Published",
  },
  {
    id: "job-2",
    title: "React Developer",
    applications: 18,
    matchRate: 88,
    status: "Published",
  },
  {
    id: "job-3",
    title: "UI Engineer",
    applications: 12,
    matchRate: 84,
    status: "Draft",
  },
];

const topCandidates = [
  {
    id: "candidate-1",
    name: "Asu Yılmaz",
    role: "Frontend Developer",
    matchScore: 94,
    skills: ["React", "Next.js", "TypeScript"],
  },
  {
    id: "candidate-2",
    name: "Elif Kaya",
    role: "React Developer",
    matchScore: 91,
    skills: ["React", "JavaScript", "CSS"],
  },
  {
    id: "candidate-3",
    name: "Mert Demir",
    role: "UI Engineer",
    matchScore: 87,
    skills: ["React", "Tailwind", "UI/UX"],
  },
];

export default function EmployerDashboard() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />

          <span className="text-sm font-medium">
            Employer Intelligence
          </span>
        </div>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Employer Dashboard
        </h1>

        <p className="mt-2 text-muted-foreground">
          Manage your job postings and discover high-quality candidates.
        </p>
      </div>

      {/* Overview */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">
              Active Jobs
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-4xl font-semibold">
              12
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              Currently published positions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">
              Applications
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-4xl font-semibold">
              54
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              Applications across active jobs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">
              New Candidates
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-4xl font-semibold">
              18
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              Candidates added this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">
              Avg. Match
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-4xl font-semibold">
              88%
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              Average AI compatibility score
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Active Jobs */}
      <section className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold">
              Active Job Postings
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Monitor your current job postings and applicant activity.
            </p>
          </div>

          <Button>
            Create Job
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4">
          {activeJobs.map((job) => (
            <Card key={job.id}>
              <CardContent className="p-6">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">
                      {job.title}
                    </h3>

                    <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        {job.applications} applications
                      </span>

                      <span className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        {job.matchRate}% avg. match
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4 sm:justify-end">
                    <Badge
                      variant={
                        job.status === "Published"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {job.status}
                    </Badge>

                    <Button variant="outline">
                      View Job
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Top Candidates */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">
            Top Candidates
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Candidates with the strongest AI match scores.
          </p>
        </div>

        <div className="space-y-4">
          {topCandidates.map((candidate) => (
            <Card key={candidate.id}>
              <CardContent className="p-6">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-muted font-semibold">
                      {candidate.name
                        .split(" ")
                        .map((name) => name[0])
                        .join("")}
                    </div>

                    <div>
                      <h3 className="font-semibold">
                        {candidate.name}
                      </h3>

                      <p className="text-sm text-muted-foreground">
                        {candidate.role}
                      </p>

                      <div className="mt-2 flex flex-wrap gap-2">
                        {candidate.skills.map((skill) => (
                          <Badge
                            key={skill}
                            variant="secondary"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                    <Badge>
                      {candidate.matchScore}% Match
                    </Badge>

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

      {/* Hiring Insight */}
      <Card>
        <CardHeader>
          <CardTitle>AI Hiring Insight</CardTitle>

          <p className="text-sm text-muted-foreground">
            A quick summary of your current hiring activity.
          </p>
        </CardHeader>

        <CardContent>
          <div className="rounded-lg border p-4">
            <p className="text-sm leading-6 text-muted-foreground">
              Your Frontend Developer posting currently has the strongest
              applicant pool, with a 92% average match score. Consider
              reviewing the top candidates first to speed up the hiring
              process.
            </p>

            <Button variant="outline" className="mt-4">
              View Insights
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}