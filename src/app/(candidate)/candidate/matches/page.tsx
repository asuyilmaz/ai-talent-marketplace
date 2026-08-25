import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

const matches = [
  {
    id: "match-1",
    title: "Frontend Developer",
    company: "Tech Company",
    score: 94,
    skills: ["React", "Next.js", "TypeScript"],
    description:
      "Your experience and technical skills strongly match this position.",
  },
  {
    id: "match-2",
    title: "React Developer",
    company: "Software Company",
    score: 91,
    skills: ["React", "JavaScript", "CSS"],
    description:
      "This role is a strong match for your frontend development skills.",
  },
  {
    id: "match-3",
    title: "UI Engineer",
    company: "Digital Company",
    score: 87,
    skills: ["React", "UI/UX", "Tailwind"],
    description:
      "Your frontend and UI skills align well with this opportunity.",
  },
];

export default function CandidateMatchesPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />

          <span className="text-sm font-medium">
            AI Matching
          </span>
        </div>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          My Matches
        </h1>

        <p className="mt-2 text-muted-foreground">
          Discover opportunities that best match your skills,
          experience and career goals.
        </p>
      </div>

      {/* Match Overview */}
      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">
              Best Match
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-4xl font-semibold">
              94%
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              Your strongest job match.
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
              3
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              Jobs with high compatibility.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">
              Average Match
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-4xl font-semibold">
              91%
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              Average compatibility score.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Matches */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">
            Recommended Matches
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Opportunities ranked by AI compatibility.
          </p>
        </div>

        <div className="space-y-4">
          {matches.map((match) => (
            <Card key={match.id}>
              <CardContent className="p-6">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold">
                        {match.title}
                      </h3>

                      <p className="text-sm text-muted-foreground">
                        {match.company}
                      </p>
                    </div>

                    <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                      {match.description}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {match.skills.map((skill) => (
                        <Badge
                          key={skill}
                          variant="secondary"
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4 lg:flex-col lg:items-end">
                    <div className="text-right">
                      <Badge className="text-sm">
                        {match.score}% Match
                      </Badge>

                      <p className="mt-2 text-xs text-muted-foreground">
                        Excellent compatibility
                      </p>
                    </div>

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
    </div>
  );
}