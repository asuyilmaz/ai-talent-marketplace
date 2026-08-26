import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { recommendedJobs } from "@/data/jobs";
import { recentApplications } from "@/data/applications";
import { skillGaps } from "@/data/skill-gaps";

export default function CandidateDashboard() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Good morning 👋
        </h1>

        <p className="mt-2 text-muted-foreground">
          Here&apos;s what&apos;s happening with your career.
        </p>
      </div>

      {/* Profile Completion */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Profile Completion</CardTitle>

            <p className="mt-1 text-sm text-muted-foreground">
              Complete your profile to improve your matches.
            </p>
          </div>

          <span className="text-2xl font-semibold">80%</span>
        </CardHeader>

        <CardContent>
          <Progress value={80} />
        </CardContent>
      </Card>

      {/* Match Statistics */}
      <section className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">
              Current Match
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="flex items-end justify-between">
              <p className="text-4xl font-semibold tracking-tight">
                92%
              </p>

              <Badge variant="secondary">
                Excellent match
              </Badge>
            </div>

            <Progress value={92} className="mt-4" />

            <p className="mt-3 text-sm text-muted-foreground">
              12 jobs strongly aligned with your current profile.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">
              Potential Match
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="flex items-end justify-between">
              <p className="text-4xl font-semibold tracking-tight">
                76%
              </p>

              <Badge variant="outline">
                Room to improve
              </Badge>
            </div>

            <Progress value={76} className="mt-4" />

            <p className="mt-3 text-sm text-muted-foreground">
              Your match could increase by up to 15% by improving 3 skills.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Recommended Jobs */}
      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">
              Recommended Jobs
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Jobs that match your skills and career goals.
            </p>
          </div>

          <Link href="/candidate/jobs">
            <Button variant="ghost" className="hidden sm:flex">
              View all
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="space-y-3">
          {recommendedJobs.map((job) => (
            <Card key={job.id}>
              <CardContent className="p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold">
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

                    <p className="text-sm text-muted-foreground">
                      {job.workType} · {job.employmentType}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                    <Badge>
                      {job.matchScore}% Match
                    </Badge>

                    <Link href={`/candidate/jobs/${job.id}`}>
                      <Button variant="outline" size="sm">
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

        <Link href="/candidate/jobs">
          <Button
            variant="outline"
            className="mt-4 w-full sm:hidden"
          >
            View all jobs
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </section>

      {/* Applications + Skill Gap */}
      <section className="grid gap-4 md:grid-cols-2">
        {/* Applications */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Applications</CardTitle>

              <p className="mt-1 text-sm text-muted-foreground">
                Your recent job applications.
              </p>
            </div>

            <span className="text-2xl font-semibold">
              5
            </span>
          </CardHeader>

          <CardContent className="space-y-4">
            {recentApplications.map((application) => (
              <div
                key={application.id}
                className="flex items-center justify-between gap-4"
              >
                <div>
                  <p className="text-sm font-medium">
                    {application.jobTitle}
                  </p>

                  <p className="text-xs text-muted-foreground">
                    {application.company}
                  </p>
                </div>

                <Badge
                  variant={
                    application.status === "Interview"
                      ? "secondary"
                      : "outline"
                  }
                >
                  {application.status}
                </Badge>
              </div>
            ))}

            <Link href="/candidate/applications">
              <Button variant="outline" className="w-full">
                View applications
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Skill Gap */}
        <Card>
          <CardHeader>
            <CardTitle>Skill Gap</CardTitle>

            <p className="text-sm text-muted-foreground">
              Skills that could improve your job matches.
            </p>
          </CardHeader>

          <CardContent className="space-y-4">
            {skillGaps.map((skill) => (
              <div key={skill.id}>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {skill.name}
                  </span>

                  <span className="text-xs text-muted-foreground">
                    {skill.score}%
                  </span>
                </div>

                <Progress value={skill.score} />
              </div>
            ))}

            <Link href="/candidate/skill-gap">
              <Button variant="outline" className="w-full">
                View Skill Gap
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}