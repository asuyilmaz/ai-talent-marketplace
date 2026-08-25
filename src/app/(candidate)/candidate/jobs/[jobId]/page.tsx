import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Briefcase,
  MapPin,
  Sparkles,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { recommendedJobs } from "@/data/jobs";

type JobDetailsPageProps = {
  params: Promise<{
    jobId: string;
  }>;
};

export default async function JobDetailsPage({
  params,
}: JobDetailsPageProps) {
  const { jobId } = await params;

  const job = recommendedJobs.find(
    (item) => item.id === jobId
  );

  if (!job) {
    notFound();
  }

  return (
    <div className="space-y-8">
      {/* Back */}
      <Link href="/candidate/jobs">
  <Button variant="ghost">
    <ArrowLeft className="mr-2 h-4 w-4" />
    Back to Jobs
  </Button>
</Link>

      {/* Job Header */}
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

            {/* Match Score */}
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
        {/* Main */}
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

        {/* Skills */}
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
          <CardTitle>Ready to Apply?</CardTitle>

          <p className="text-sm text-muted-foreground">
            Your profile is a {job.matchScore}% match for this
            position.
          </p>
        </CardHeader>

        <CardContent>
          <Button size="lg">
            Apply Now
            <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}