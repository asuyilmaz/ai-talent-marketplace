import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Mail,
  MapPin,
  Briefcase,
} from "lucide-react";
import { candidateProfile } from "@/data/profile";

export default function CandidateProfilePage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            My Profile
          </h1>

          <p className="mt-2 text-muted-foreground">
            Manage your professional profile and career information.
          </p>
        </div>

        <Link
          href="/candidate/settings"
          className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          Edit Profile
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </div>

      {/* Profile Overview */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-center">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-muted text-3xl font-semibold">
              AY
            </div>

            <div className="space-y-3">
              <div>
                <h2 className="text-2xl font-semibold">
                  {candidateProfile.name}
                </h2>

                <p className="text-muted-foreground">
                  {candidateProfile.role}
                </p>
              </div>

              <div className="flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:flex-wrap sm:gap-4">
                <span className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {candidateProfile.email}
                </span>

                <span className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {candidateProfile.location}
                </span>

                <span className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  {candidateProfile.availability}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Completion */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle>Profile Completion</CardTitle>

              <p className="mt-1 text-sm text-muted-foreground">
                Complete your profile to improve your AI job matches.
              </p>
            </div>

            <span className="text-2xl font-semibold">
              {candidateProfile.completion}%
            </span>
          </div>
        </CardHeader>

        <CardContent>
          <Progress value={candidateProfile.completion} />

          <p className="mt-3 text-sm text-muted-foreground">
            Add your experience and education information to reach 100%.
          </p>
        </CardContent>
      </Card>

      {/* About + Career Goal */}
      <section className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>About Me</CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-sm leading-6 text-muted-foreground">
              {candidateProfile.about}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Career Goal</CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-sm leading-6 text-muted-foreground">
              {candidateProfile.careerGoal}
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Skills */}
      <Card>
        <CardHeader>
          <CardTitle>Skills</CardTitle>

          <p className="text-sm text-muted-foreground">
            Technologies and skills included in your profile.
          </p>
        </CardHeader>

        <CardContent>
          <div className="flex flex-wrap gap-2">
            {candidateProfile.skills.map((skill) => (
              <Badge key={skill}>{skill}</Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Experience + Education */}
      <section className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Experience</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="space-y-2">
              <h3 className="font-medium">
                {candidateProfile.experience.title}
              </h3>

              <p className="text-sm text-muted-foreground">
                {candidateProfile.experience.company}
              </p>

              <p className="text-sm text-muted-foreground">
                {candidateProfile.experience.skills}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Education</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="space-y-2">
              <h3 className="font-medium">
                {candidateProfile.education.program}
              </h3>

              <p className="text-sm text-muted-foreground">
                {candidateProfile.education.university}
              </p>

              <p className="text-sm text-muted-foreground">
                {candidateProfile.education.period}
              </p>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}