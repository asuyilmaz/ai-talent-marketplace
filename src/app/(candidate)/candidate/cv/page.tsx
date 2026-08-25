import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Download,
  Mail,
  MapPin,
  Phone,
  Briefcase,
  GraduationCap,
} from "lucide-react";

export default function CandidateCVPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            My CV
          </h1>

          <p className="mt-2 text-muted-foreground">
            View and manage your professional CV.
          </p>
        </div>

        <Button>
          <Download className="mr-2 h-4 w-4" />
          Download CV
        </Button>
      </div>

      {/* Personal Information */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-muted text-3xl font-semibold">
              AY
            </div>

            <div className="space-y-3">
              <div>
                <h2 className="text-2xl font-semibold">
                  Fatma Asu Yılmaz
                </h2>

                <p className="text-muted-foreground">
                  Frontend Developer
                </p>
              </div>

              <div className="flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:flex-wrap sm:gap-4">
                <span className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  asu@example.com
                </span>

                <span className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Türkiye
                </span>

                <span className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  +90 5XX XXX XX XX
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* About */}
      <Card>
        <CardHeader>
          <CardTitle>Professional Summary</CardTitle>
        </CardHeader>

        <CardContent>
          <p className="text-sm leading-6 text-muted-foreground">
            Frontend development focused candidate with experience
            in modern web technologies. Interested in building
            responsive, user-friendly and accessible web applications.
          </p>
        </CardContent>
      </Card>

      {/* Skills */}
      <Card>
        <CardHeader>
          <CardTitle>Skills</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Badge>HTML</Badge>
            <Badge>CSS</Badge>
            <Badge>JavaScript</Badge>
            <Badge>React</Badge>
            <Badge>Next.js</Badge>
            <Badge>TypeScript</Badge>
            <Badge>Tailwind CSS</Badge>
            <Badge>GitHub</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Experience */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Experience
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="space-y-2">
            <h3 className="font-semibold">
              Frontend Development Projects
            </h3>

            <p className="text-sm text-muted-foreground">
              Personal and academic projects
            </p>

            <p className="text-sm leading-6 text-muted-foreground">
              Developed responsive web interfaces using HTML, CSS,
              JavaScript, React and modern frontend technologies.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Education */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Education
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="space-y-2">
            <h3 className="font-semibold">
              Ön Yüz Yazılım Geliştirme
            </h3>

            <p className="text-sm text-muted-foreground">
              Adana Alparslan Türkeş Bilim ve Teknoloji Üniversitesi
            </p>

            <p className="text-sm text-muted-foreground">
              2024 - 2026
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Languages */}
      <Card>
        <CardHeader>
          <CardTitle>Languages</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">Turkish — Native</Badge>
            <Badge variant="secondary">English — B1</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}