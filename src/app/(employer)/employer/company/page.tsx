import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Globe,
  Mail,
  MapPin,
  Users,
  ArrowRight,
} from "lucide-react";

export default function EmployerCompanyPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Company
          </h1>

          <p className="mt-2 text-muted-foreground">
            Manage your company profile and employer information.
          </p>
        </div>

        <Button>
          Edit Company
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {/* Company Overview */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-center">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-xl bg-muted">
              <Building2 className="h-10 w-10" />
            </div>

            <div className="space-y-3">
              <div>
                <h2 className="text-2xl font-semibold">
                  Tech Company
                </h2>

                <p className="text-muted-foreground">
                  Software & Technology
                </p>
              </div>

              <div className="flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:flex-wrap sm:gap-4">
                <span className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Istanbul, Türkiye
                </span>

                <span className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  techcompany.com
                </span>

                <span className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  50–100 employees
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* About + Contact */}
      <section className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>About the Company</CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-sm leading-6 text-muted-foreground">
              Tech Company builds modern software products and
              digital solutions with a focus on scalable,
              user-friendly and reliable technologies.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />

              <div>
                <p className="text-sm font-medium">
                  Email
                </p>

                <p className="text-sm text-muted-foreground">
                  hr@techcompany.com
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Globe className="h-4 w-4 text-muted-foreground" />

              <div>
                <p className="text-sm font-medium">
                  Website
                </p>

                <p className="text-sm text-muted-foreground">
                  techcompany.com
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-muted-foreground" />

              <div>
                <p className="text-sm font-medium">
                  Location
                </p>

                <p className="text-sm text-muted-foreground">
                  Istanbul, Türkiye
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Company Details */}
      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Industry
            </CardTitle>
          </CardHeader>

          <CardContent>
            <Badge variant="secondary">
              Software & Technology
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Company Size
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="font-medium">
              50–100 employees
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Open Positions
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-3xl font-semibold">
              12
            </p>

            <p className="text-sm text-muted-foreground">
              Active job postings
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Hiring Focus */}
      <Card>
        <CardHeader>
          <CardTitle>Current Hiring Focus</CardTitle>

          <p className="text-sm text-muted-foreground">
            Roles your company is currently hiring for.
          </p>
        </CardHeader>

        <CardContent className="flex flex-wrap gap-2">
          <Badge>Frontend Development</Badge>
          <Badge>React</Badge>
          <Badge>UI Engineering</Badge>
          <Badge>Software Engineering</Badge>
        </CardContent>
      </Card>
    </div>
  );
}