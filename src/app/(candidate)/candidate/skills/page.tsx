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
  Code2,
  Sparkles,
} from "lucide-react";

const skills = [
  {
    name: "React",
    category: "Frontend",
    level: 90,
  },
  {
    name: "JavaScript",
    category: "Frontend",
    level: 85,
  },
  {
    name: "TypeScript",
    category: "Frontend",
    level: 75,
  },
  {
    name: "Next.js",
    category: "Frontend",
    level: 80,
  },
  {
    name: "HTML",
    category: "Frontend",
    level: 95,
  },
  {
    name: "CSS",
    category: "Frontend",
    level: 90,
  },
  {
    name: "Tailwind CSS",
    category: "Frontend",
    level: 85,
  },
  {
    name: "SQL",
    category: "Database",
    level: 70,
  },
  {
    name: "Git & GitHub",
    category: "Tools",
    level: 80,
  },
];

const recommendedSkills = [
  {
    name: "Testing",
    reason: "Improve your application quality and reliability.",
  },
  {
    name: "Docker",
    reason: "Useful for modern development and deployment workflows.",
  },
  {
    name: "Node.js",
    reason: "Expand your frontend skills into full-stack development.",
  },
];

export default function CandidateSkillsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Code2 className="h-5 w-5" />

          <span className="text-sm font-medium">
            Professional Skills
          </span>
        </div>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          My Skills
        </h1>

        <p className="mt-2 text-muted-foreground">
          Manage your technical skills and track areas for improvement.
        </p>
      </div>

      {/* Skill Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle>Skill Overview</CardTitle>

              <p className="mt-1 text-sm text-muted-foreground">
                Your current technical skill levels.
              </p>
            </div>

            <span className="text-2xl font-semibold">
              {skills.length}
            </span>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          {skills.map((skill) => (
            <div key={skill.name}>
              <div className="mb-2 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {skill.name}
                  </span>

                  <Badge variant="secondary">
                    {skill.category}
                  </Badge>
                </div>

                <span className="text-sm text-muted-foreground">
                  {skill.level}%
                </span>
              </div>

              <Progress value={skill.level} />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Skill Categories */}
      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Frontend
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="flex flex-wrap gap-2">
              {skills
                .filter((skill) => skill.category === "Frontend")
                .map((skill) => (
                  <Badge key={skill.name}>
                    {skill.name}
                  </Badge>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Database
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="flex flex-wrap gap-2">
              {skills
                .filter((skill) => skill.category === "Database")
                .map((skill) => (
                  <Badge key={skill.name}>
                    {skill.name}
                  </Badge>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Tools
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="flex flex-wrap gap-2">
              {skills
                .filter((skill) => skill.category === "Tools")
                .map((skill) => (
                  <Badge key={skill.name}>
                    {skill.name}
                  </Badge>
                ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Recommended Skills */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />

            <CardTitle>Recommended Skills</CardTitle>
          </div>

          <p className="text-sm text-muted-foreground">
            Skills that could improve your future job matches.
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          {recommendedSkills.map((skill) => (
            <div
              key={skill.name}
              className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <h3 className="font-medium">
                  {skill.name}
                </h3>

                <p className="mt-1 text-sm text-muted-foreground">
                  {skill.reason}
                </p>
              </div>

              <Button variant="outline" size="sm">
                Learn More
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}