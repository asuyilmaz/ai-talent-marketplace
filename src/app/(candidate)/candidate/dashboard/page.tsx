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
            <p className="text-3xl font-semibold">92%</p>

            <p className="mt-1 text-sm text-muted-foreground">
              12 matching jobs
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
            <p className="text-3xl font-semibold">76%</p>

            <p className="mt-1 text-sm text-muted-foreground">
              8 potential opportunities
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Recommended Jobs */}
      <section>
        <div className="mb-4">
          <h2 className="text-xl font-semibold">
            Recommended Jobs
          </h2>

          <p className="text-sm text-muted-foreground">
            Jobs that match your skills and experience.
          </p>
        </div>

        <div className="space-y-3">
          <Card>
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <h3 className="font-medium">
                  Frontend Developer
                </h3>

                <p className="text-sm text-muted-foreground">
                  Tech Company
                </p>
              </div>

              <Badge>94% Match</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <h3 className="font-medium">
                  React Developer
                </h3>

                <p className="text-sm text-muted-foreground">
                  Software Company
                </p>
              </div>

              <Badge>91% Match</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <h3 className="font-medium">
                  UI Engineer
                </h3>

                <p className="text-sm text-muted-foreground">
                  Digital Company
                </p>
              </div>

              <Badge>87% Match</Badge>
            </CardContent>
          </Card>
        </div>

        <Button variant="outline" className="mt-4">
  View all jobs
  <ArrowRight className="ml-2 h-4 w-4" />
</Button>
      </section>

      {/* Applications + Skill Gap */}
      <section className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Applications</CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-3xl font-semibold">5</p>

            <p className="text-sm text-muted-foreground">
              Active applications
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Skill Gap</CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-3xl font-semibold">3</p>

            <p className="text-sm text-muted-foreground">
              Skills you could improve
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}