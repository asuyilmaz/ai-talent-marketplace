import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  ArrowRight,
  Lightbulb,
  Sparkles,
  TrendingUp,
} from "lucide-react";

const skillGaps = [
  {
    id: "skill-1",
    name: "TypeScript",
    currentScore: 75,
    targetScore: 90,
    priority: "High",
    description:
      "Improving TypeScript can increase your compatibility with modern frontend roles.",
  },
  {
    id: "skill-2",
    name: "Testing",
    currentScore: 55,
    targetScore: 80,
    priority: "Medium",
    description:
      "Testing knowledge can make your frontend applications more reliable.",
  },
  {
    id: "skill-3",
    name: "Docker",
    currentScore: 30,
    targetScore: 70,
    priority: "Medium",
    description:
      "Docker knowledge can help you understand deployment and development environments.",
  },
];

export default function CandidateSkillGapPage() {
  const averageScore = Math.round(
    skillGaps.reduce(
      (total, skill) => total + skill.currentScore,
      0
    ) / skillGaps.length
  );

  const averageTarget = Math.round(
    skillGaps.reduce(
      (total, skill) => total + skill.targetScore,
      0
    ) / skillGaps.length
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />

          <span className="text-sm font-medium">
            AI Career Insights
          </span>
        </div>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Skill Gap
        </h1>

        <p className="mt-2 text-muted-foreground">
          Identify the skills that could improve your job matches
          and career opportunities.
        </p>
      </div>

      {/* Overview */}
      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">
              Current Level
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-4xl font-semibold">
              {averageScore}%
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              Average score across recommended skills.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">
              Target Level
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-4xl font-semibold">
              {averageTarget}%
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              Recommended level for stronger matches.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">
              Skills to Improve
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-4xl font-semibold">
              {skillGaps.length}
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              Skills currently below your target level.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Progress</CardTitle>

          <p className="text-sm text-muted-foreground">
            Your current skill level compared with your target.
          </p>
        </CardHeader>

        <CardContent>
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm font-medium">
              Current skills
            </span>

            <span className="text-sm text-muted-foreground">
              {averageScore}%
            </span>
          </div>

          <Progress value={averageScore} className="mt-3" />

          <p className="mt-3 text-sm text-muted-foreground">
            Continue improving these skills to increase your AI
            match score.
          </p>
        </CardContent>
      </Card>

      {/* Skill Gaps */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">
            Skills to Improve
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Focus on these areas to improve your future opportunities.
          </p>
        </div>

        <div className="space-y-4">
          {skillGaps.map((skill) => (
            <Card key={skill.id}>
              <CardContent className="p-6">
                <div className="space-y-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">
                          {skill.name}
                        </h3>

                        <Badge
                          variant={
                            skill.priority === "High"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {skill.priority} Priority
                        </Badge>
                      </div>

                      <p className="mt-1 text-sm text-muted-foreground">
                        {skill.description}
                      </p>
                    </div>

                    <div className="text-left sm:text-right">
                      <p className="text-2xl font-semibold">
                        {skill.currentScore}%
                      </p>

                      <p className="text-xs text-muted-foreground">
                        Target: {skill.targetScore}%
                      </p>
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Current progress
                      </span>

                      <span className="font-medium">
                        {skill.currentScore} / {skill.targetScore}
                      </span>
                    </div>

                    <Progress value={skill.currentScore} />
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <TrendingUp className="h-4 w-4" />

                      <span>
                        Improve by{" "}
                        {skill.targetScore - skill.currentScore}%
                        to reach your target.
                      </span>
                    </div>

                    <Button variant="outline" size="sm">
                      Learn More
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* AI Recommendation */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />

            <CardTitle>AI Recommendation</CardTitle>
          </div>

          <p className="text-sm text-muted-foreground">
            A suggested learning priority based on your current profile.
          </p>
        </CardHeader>

        <CardContent>
          <div className="rounded-lg border p-4">
            <h3 className="font-medium">
              Focus on TypeScript first
            </h3>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              TypeScript has the highest priority because improving
              this skill could have the biggest impact on your
              compatibility with frontend developer positions.
            </p>

            <Button className="mt-4">
              Explore TypeScript
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}