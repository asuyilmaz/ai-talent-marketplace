"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ArrowRight,
} from "lucide-react";

import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type CurrentUser = {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
};

type Job = {
  id: string;
  title: string;
  published: boolean;
  createdAt: string;
  applicationCount: number;
  workType?: string;
  employmentType?: string;
};

type JobsResponse = {
  jobs?: Job[];
  error?: string;
  message?: string;
};

type Application = {
  id: string;
  candidateId: string;
  jobId: string;
  status: string;
  appliedAt: string;
};

type ApplicationsResponse = {
  applications?: Application[];
  error?: string;
  message?: string;
};

type Candidate = {
  id: string;
  name: string;
  email: string;
  bio: string | null;
  phone: string | null;
  location: string | null;
  experienceTitle: string | null;
  experienceYears: number | null;
  skills: string[];
  createdAt: string;
};

type CandidatesResponse = {
  candidates?: Candidate[];
  error?: string;
  message?: string;
};

type Company = {
  name: string;
  openPositions: number;
};

type CompanyResponse = {
  name?: string;
  openPositions?: number;
  error?: string;
  message?: string;
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function isCreatedThisWeek(
  dateString: string
) {
  const createdAt =
    new Date(dateString);

  if (
    Number.isNaN(
      createdAt.getTime()
    )
  ) {
    return false;
  }

  const now = new Date();

  const sevenDaysAgo =
    new Date(
      now.getTime() -
        7 *
          24 *
          60 *
          60 *
          1000
    );

  return (
    createdAt >= sevenDaysAgo
  );
}

export default function EmployerDashboard() {
  const [jobs, setJobs] =
    useState<Job[]>([]);

  const [
    applications,
    setApplications,
  ] = useState<Application[]>([]);

  const [
    candidates,
    setCandidates,
  ] = useState<Candidate[]>([]);

  const [company, setCompany] =
    useState<Company | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        setError("");

        const storedUser =
          localStorage.getItem(
            "currentUser"
          );

        if (!storedUser) {
          window.location.href =
            "/login";
          return;
        }

        let currentUser: CurrentUser;

        try {
          currentUser =
            JSON.parse(storedUser);
        } catch {
          localStorage.removeItem(
            "currentUser"
          );

          window.location.href =
            "/login";
          return;
        }

        if (
          !currentUser.id ||
          !currentUser.role ||
          currentUser.role.toLowerCase() !==
            "employer"
        ) {
          setError(
            "This page is only available for employers."
          );
          return;
        }

        const employerId =
          currentUser.id;

        const [
          jobsResponse,
          applicationsResponse,
          candidatesResponse,
          companyResponse,
        ] = await Promise.all([
          fetch(
            `/api/jobs?userId=${encodeURIComponent(
              employerId
            )}`,
            {
              cache: "no-store",
            }
          ),
          fetch(
            `/api/applications?employerId=${encodeURIComponent(
              employerId
            )}`,
            {
              cache: "no-store",
            }
          ),
          fetch(
            "/api/candidates",
            {
              cache: "no-store",
            }
          ),
          fetch(
            `/api/company?employerId=${encodeURIComponent(
              employerId
            )}`,
            {
              cache: "no-store",
            }
          ),
        ]);

        const jobsData =
          (await jobsResponse.json()) as JobsResponse;

        const applicationsData =
          (await applicationsResponse.json()) as ApplicationsResponse;

        const candidatesData =
          (await candidatesResponse.json()) as CandidatesResponse;

        const companyData =
          (await companyResponse.json()) as CompanyResponse;

        if (!jobsResponse.ok) {
          throw new Error(
            jobsData.error ||
              jobsData.message ||
              "Failed to load jobs."
          );
        }

        if (
          !applicationsResponse.ok
        ) {
          throw new Error(
            applicationsData.error ||
              applicationsData.message ||
              "Failed to load applications."
          );
        }

        if (!candidatesResponse.ok) {
          throw new Error(
            candidatesData.error ||
              candidatesData.message ||
              "Failed to load candidates."
          );
        }

        if (!companyResponse.ok) {
          throw new Error(
            companyData.error ||
              companyData.message ||
              "Failed to load company."
          );
        }

        setJobs(
          Array.isArray(
            jobsData.jobs
          )
            ? jobsData.jobs
            : []
        );

        setApplications(
          Array.isArray(
            applicationsData.applications
          )
            ? applicationsData.applications
            : []
        );

        setCandidates(
          Array.isArray(
            candidatesData.candidates
          )
            ? candidatesData.candidates
            : []
        );

        setCompany({
          name:
            companyData.name ??
            "Company",
          openPositions:
            typeof companyData.openPositions ===
            "number"
              ? companyData.openPositions
              : 0,
        });
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load dashboard."
        );
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const activeJobs =
    useMemo(
      () =>
        jobs.filter(
          (job) =>
            job.published
        ),
      [jobs]
    );

  const newCandidates =
    useMemo(
      () =>
        candidates.filter(
          (candidate) =>
            isCreatedThisWeek(
              candidate.createdAt
            )
        ),
      [candidates]
    );

  const recentJobs =
    useMemo(
      () =>
        [...jobs]
          .sort(
            (a, b) =>
              new Date(
                b.createdAt
              ).getTime() -
              new Date(
                a.createdAt
              ).getTime()
          )
          .slice(0, 3),
      [jobs]
    );

  const recentCandidates =
    useMemo(
      () =>
        [...candidates]
          .sort(
            (a, b) =>
              new Date(
                b.createdAt
              ).getTime() -
              new Date(
                a.createdAt
              ).getTime()
          )
          .slice(0, 3),
      [candidates]
    );

  const applicationsByJob =
    useMemo(() => {
      const counts =
        new Map<
          string,
          number
        >();

      for (const application of applications) {
        counts.set(
          application.jobId,
          (counts.get(
            application.jobId
          ) ?? 0) + 1
        );
      }

      return counts;
    }, [applications]);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex min-h-64 items-center justify-center p-6">
          <p className="text-sm text-muted-foreground">
            Loading dashboard...
          </p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Employer Dashboard
          </h1>

          <p className="mt-2 text-muted-foreground">
            Manage your hiring
            activity.
          </p>
        </div>

        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-destructive">
              {error}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <section className="grid border-b border-black/10 pb-10 lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-14">
        <div>
          <div className="flex items-center gap-3">
            <span className="tn-index">01 / Hiring desk</span>
            <span className="h-px w-12 bg-[#5b3df5]" />
          </div>
          <h1 className="mt-6 max-w-4xl text-[clamp(3rem,5.6vw,6rem)] font-black leading-[.9] tracking-[-.07em]">
            {company?.name || "Your company"}<br />
            <span className="text-[#5b3df5]">is hiring.</span>
          </h1>
          <p className="mt-7 max-w-2xl text-sm leading-6 text-[#626166]">
            One operational view of roles, applicants and the talent pool — arranged around decisions, not dashboard decoration.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-2 border-t border-l border-black/10 lg:mt-0">
          {[
            [company?.openPositions ?? activeJobs.length, "Active roles"],
            [applications.length, "Applications"],
            [candidates.length, "Talent pool"],
            [newCandidates.length, "New this week"],
          ].map(([value, label]) => (
            <div key={String(label)} className="border-b border-r border-black/10 p-5">
              <p className="text-4xl font-black tracking-[-.055em]">{value}</p>
              <p className="tn-index mt-2">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid border-b border-black/10 lg:grid-cols-[220px_minmax(0,1fr)]">
        <div className="border-b border-black/10 py-8 lg:border-b-0 lg:border-r lg:pr-8">
          <p className="tn-index">02 / Open channels</p>
          <h2 className="mt-4 text-2xl font-black tracking-[-.035em]">Roles currently shaping the pipeline.</h2>
          <Link href="/employer/jobs/create">
            <Button className="mt-7">Create role <ArrowRight className="ml-2 h-4 w-4" /></Button>
          </Link>
        </div>

        <div className="lg:pl-8">
          {recentJobs.length === 0 ? (
            <p className="py-10 text-sm text-[#77767b]">No job postings yet.</p>
          ) : recentJobs.map((job, index) => {
            const count = applicationsByJob.get(job.id) ?? job.applicationCount ?? 0;
            return (
              <Link
                key={job.id}
                href={`/employer/jobs/${encodeURIComponent(job.id)}`}
                className="group grid gap-4 border-b border-black/10 py-7 last:border-b-0 sm:grid-cols-[64px_minmax(0,1fr)_150px] sm:items-center"
              >
                <span className="font-mono text-xs text-[#9a989d]">{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-xl font-black tracking-[-.025em] transition group-hover:text-[#5b3df5]">{job.title}</h3>
                    <span className={`text-[9px] font-black uppercase tracking-[.15em] ${job.published ? "text-emerald-700" : "text-[#8a898d]"}`}>
                      {job.published ? "● live" : "○ draft"}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[#77767b]">{job.workType || "Flexible"} · {job.employmentType || "Role"}</p>
                </div>
                <div className="sm:text-right">
                  <p className="text-3xl font-black tracking-[-.05em]">{count}</p>
                  <p className="tn-index mt-1">applications</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="grid border-b border-black/10 lg:grid-cols-[.85fr_1.15fr]">
        <div className="border-b border-black/10 py-9 lg:border-b-0 lg:border-r lg:pr-10">
          <p className="tn-index">03 / Pipeline pressure</p>
          <p className="mt-5 text-7xl font-black tracking-[-.075em]">{applications.length}</p>
          <p className="mt-2 max-w-xs text-sm leading-6 text-[#626166]">candidate applications have entered your active hiring system.</p>
          <div className="mt-8 flex h-20 items-end gap-1.5 border-b border-black/20 pb-0">
            {[34,56,42,76,60,88,70,95,78].map((h, i) => (
              <span key={i} className="w-full bg-[#101114]" style={{ height: `${h * .62}px` }} />
            ))}
          </div>
          <Link href="/employer/applications" className="mt-6 inline-flex text-xs font-black text-[#5b3df5]">Open pipeline →</Link>
        </div>

        <div className="py-9 lg:pl-10">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="tn-index">04 / Fresh talent</p>
              <h2 className="mt-3 text-2xl font-black tracking-[-.035em]">Recently added profiles.</h2>
            </div>
            <Link href="/employer/candidates" className="hidden text-xs font-black sm:block">Explore all →</Link>
          </div>

          <div className="mt-6">
            {recentCandidates.length === 0 ? (
              <p className="text-sm text-[#77767b]">No candidate profiles available yet.</p>
            ) : recentCandidates.map((candidate) => (
              <Link
                key={candidate.id}
                href={`/employer/candidates/${encodeURIComponent(candidate.id)}`}
                className="group grid gap-3 border-t border-black/10 py-5 sm:grid-cols-[40px_minmax(0,1fr)_auto] sm:items-center"
              >
                <span className="flex h-9 w-9 items-center justify-center bg-[#101114] text-[10px] font-black text-white">
                  {getInitials(candidate.name)}
                </span>
                <div>
                  <h3 className="font-black transition group-hover:text-[#5b3df5]">{candidate.name}</h3>
                  <p className="mt-1 text-xs text-[#77767b]">{candidate.experienceTitle || "Candidate"}{candidate.location ? ` · ${candidate.location}` : ""}</p>
                </div>
                <div className="flex flex-wrap gap-2 sm:justify-end">
                  {candidate.skills.slice(0, 3).map((skill) => (
                    <span key={skill} className="text-[10px] font-bold text-[#66656a]">{skill}</span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-8 py-9 lg:grid-cols-[220px_1fr]">
        <p className="tn-index">05 / Operating note</p>
        <p className="max-w-3xl text-2xl font-black tracking-[-.035em]">
          The useful question is not “how many widgets can we show?” It is “what decision should the hiring team make next?”
        </p>
      </section>
    </div>
  );
}
