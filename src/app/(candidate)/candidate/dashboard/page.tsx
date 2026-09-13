"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ArrowRight,
  BriefcaseBusiness,
  FileText,
  Sparkles,
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

type CandidateResponse = {
  id?: string;
  name?: string;
  email?: string;
  bio?: string | null;
  phone?: string | null;
  location?: string | null;
  experienceTitle?: string | null;
  experienceYears?: number | null;
  skills?: string[] | string | null;
  createdAt?: string;
  error?: string;
  message?: string;
};

type DashboardJob = {
  id: string;
  title: string;
  description?: string | null;
  company: string;
  skills: string[];
  workType: string;
  employmentType: string;
  published?: boolean;
  createdAt?: string;
};

type JobsResponse = {
  jobs?: DashboardJob[];
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

type RankedJob = DashboardJob & {
  matchScore: number;
  matchedSkills: string[];
};

type SkillGapItem = {
  name: string;
  demandCount: number;
  demandPercent: number;
};

function normalizeSkills(
  skills: string[] | string | null | undefined
): string[] {
  if (Array.isArray(skills)) {
    return skills
      .map((skill) => skill.trim())
      .filter(Boolean);
  }

  if (typeof skills === "string") {
    return skills
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);
  }

  return [];
}

function calculateMatch(
  candidateSkills: string[],
  jobSkills: string[]
) {
  if (jobSkills.length === 0) {
    return {
      score: 0,
      matchedSkills: [] as string[],
    };
  }

  const normalizedCandidateSkills =
    new Set(
      candidateSkills.map((skill) =>
        skill.trim().toLowerCase()
      )
    );

  const matchedSkills =
    jobSkills.filter((skill) =>
      normalizedCandidateSkills.has(
        skill.trim().toLowerCase()
      )
    );

  return {
    score: Math.round(
      (matchedSkills.length /
        jobSkills.length) *
        100
    ),
    matchedSkills,
  };
}

function calculateProfileCompletion(
  candidate: Candidate
) {
  const fields = [
    candidate.name,
    candidate.email,
    candidate.bio,
    candidate.phone,
    candidate.location,
    candidate.experienceTitle,
    candidate.experienceYears !== null
      ? String(candidate.experienceYears)
      : "",
    candidate.skills.length > 0
      ? candidate.skills.join(",")
      : "",
  ];

  const completedFields =
    fields.filter((field) => {
      if (typeof field !== "string") {
        return false;
      }

      return field.trim().length > 0;
    }).length;

  return Math.round(
    (completedFields /
      fields.length) *
      100
  );
}

export default function CandidateDashboard() {
  const [candidate, setCandidate] =
    useState<Candidate | null>(null);

  const [jobs, setJobs] =
    useState<DashboardJob[]>([]);

  const [
    applications,
    setApplications,
  ] = useState<Application[]>([]);

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
            "candidate"
        ) {
          setError(
            "This page is only available for candidates."
          );
          return;
        }

        const candidateId =
          currentUser.id;

        const [
          candidateResponse,
          jobsResponse,
          applicationsResponse,
        ] = await Promise.all([
          fetch(
            `/api/candidates/${encodeURIComponent(
              candidateId
            )}`,
            {
              cache: "no-store",
            }
          ),
          fetch("/api/jobs", {
            cache: "no-store",
          }),
          fetch(
            `/api/applications?candidateId=${encodeURIComponent(
              candidateId
            )}`,
            {
              cache: "no-store",
            }
          ),
        ]);

        const candidateData =
          (await candidateResponse.json()) as CandidateResponse;

        const jobsData =
          (await jobsResponse.json()) as JobsResponse;

        const applicationsData =
          (await applicationsResponse.json()) as ApplicationsResponse;

        if (!candidateResponse.ok) {
          throw new Error(
            candidateData.error ||
              candidateData.message ||
              "Failed to load candidate profile."
          );
        }

        if (
          !candidateData.id ||
          !candidateData.name ||
          !candidateData.email
        ) {
          throw new Error(
            "Candidate profile data is incomplete."
          );
        }

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

        setCandidate({
          id: candidateData.id,
          name: candidateData.name,
          email: candidateData.email,
          bio:
            candidateData.bio ?? null,
          phone:
            candidateData.phone ?? null,
          location:
            candidateData.location ??
            null,
          experienceTitle:
            candidateData.experienceTitle ??
            null,
          experienceYears:
            typeof candidateData.experienceYears ===
            "number"
              ? candidateData.experienceYears
              : null,
          skills: normalizeSkills(
            candidateData.skills
          ),
          createdAt:
            candidateData.createdAt ??
            "",
        });

        setJobs(
          Array.isArray(jobsData.jobs)
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

  const profileCompletion =
    useMemo(() => {
      if (!candidate) {
        return 0;
      }

      return calculateProfileCompletion(
        candidate
      );
    }, [candidate]);

  const rankedJobs =
    useMemo<RankedJob[]>(() => {
      if (!candidate) {
        return [];
      }

      return jobs
        .map((job) => {
          const match =
            calculateMatch(
              candidate.skills,
              job.skills
            );

          return {
            ...job,
            matchScore: match.score,
            matchedSkills:
              match.matchedSkills,
          };
        })
        .sort(
          (a, b) =>
            b.matchScore -
            a.matchScore
        );
    }, [candidate, jobs]);

  const recommendedJobs =
    useMemo(
      () => rankedJobs.slice(0, 3),
      [rankedJobs]
    );

  const bestMatch =
    rankedJobs.length > 0
      ? rankedJobs[0].matchScore
      : 0;

  const matchingJobs =
    useMemo(
      () =>
        rankedJobs.filter(
          (job) =>
            job.matchScore > 0
        ).length,
      [rankedJobs]
    );

  const skillGaps =
    useMemo<SkillGapItem[]>(() => {
      if (!candidate) {
        return [];
      }

      const candidateSkills =
        new Set(
          candidate.skills.map(
            (skill) =>
              skill
                .trim()
                .toLowerCase()
          )
        );

      const demand =
        new Map<
          string,
          {
            name: string;
            count: number;
          }
        >();

      for (const job of jobs) {
        const uniqueJobSkills =
          new Set(
            job.skills.map(
              (skill) =>
                skill.trim()
            )
          );

        for (const skill of uniqueJobSkills) {
          const normalized =
            skill.toLowerCase();

          if (
            candidateSkills.has(
              normalized
            )
          ) {
            continue;
          }

          const current =
            demand.get(normalized);

          demand.set(normalized, {
            name:
              current?.name ??
              skill,
            count:
              (current?.count ??
                0) + 1,
          });
        }
      }

      return Array.from(
        demand.values()
      )
        .map((skill) => ({
          name: skill.name,
          demandCount:
            skill.count,
          demandPercent:
            jobs.length > 0
              ? Math.round(
                  (skill.count /
                    jobs.length) *
                    100
                )
              : 0,
        }))
        .sort(
          (a, b) =>
            b.demandCount -
            a.demandCount
        )
        .slice(0, 3);
    }, [candidate, jobs]);

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

  if (error || !candidate) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Candidate Dashboard
          </h1>

          <p className="mt-2 text-muted-foreground">
            Track your profile,
            matches and applications.
          </p>
        </div>

        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-destructive">
              {error ||
                "Candidate profile could not be loaded."}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <section className="grid border-b border-black/10 pb-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-14">
        <div>
          <div className="flex items-center gap-3">
            <span className="tn-index">01 / Overview</span>
            <span className="h-px w-12 bg-[#5b3df5]" />
          </div>
          <h1 className="mt-6 max-w-4xl text-[clamp(3.1rem,6vw,6.5rem)] font-black leading-[.88] tracking-[-.07em] text-[#101114]">
            {candidate.name.split(" ")[0]},<br />
            <span className="text-[#5b3df5]">move with signal.</span>
          </h1>
          <div className="mt-8 grid max-w-3xl gap-6 border-t border-black/10 pt-5 sm:grid-cols-3">
            <div>
              <p className="tn-index">Best role fit</p>
              <p className="mt-2 text-3xl font-black tracking-[-.04em]">{bestMatch}<span className="text-sm text-[#8a898d]">/100</span></p>
            </div>
            <div>
              <p className="tn-index">Profile depth</p>
              <p className="mt-2 text-3xl font-black tracking-[-.04em]">{profileCompletion}%</p>
            </div>
            <div>
              <p className="tn-index">Open matches</p>
              <p className="mt-2 text-3xl font-black tracking-[-.04em]">{matchingJobs}</p>
            </div>
          </div>
        </div>

        <div className="mt-10 border-l-0 border-black/10 lg:mt-0 lg:border-l lg:pl-8">
          <p className="tn-index">Current profile signal</p>
          <p className="mt-4 text-sm leading-6 text-[#5f6065]">
            Your dashboard is not a collection of widgets. It is a live view of where your profile is strongest and what deserves attention next.
          </p>
          <div className="mt-7 flex flex-wrap gap-x-4 gap-y-3">
            {candidate.skills.slice(0, 8).map((skill, index) => (
              <span key={skill} className="flex items-center gap-2 text-xs font-bold">
                <span className="font-mono text-[9px] text-[#9a989d]">{String(index + 1).padStart(2, "0")}</span>
                {skill}
              </span>
            ))}
          </div>
          <Link href="/candidate/profile" className="mt-8 inline-flex items-center gap-2 border-b border-[#101114] pb-1 text-xs font-black">
            Refine profile <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>

      <section className="grid border-b border-black/10 lg:grid-cols-[220px_minmax(0,1fr)]">
        <div className="border-b border-black/10 py-8 lg:border-b-0 lg:border-r lg:pr-8">
          <p className="tn-index">02 / Opportunity desk</p>
          <h2 className="mt-4 text-2xl font-black tracking-[-.035em]">What is worth opening now.</h2>
          <Link href="/candidate/jobs" className="mt-7 inline-flex items-center gap-2 text-xs font-black text-[#5b3df5]">
            All opportunities <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="lg:pl-8">
          {recommendedJobs.length === 0 ? (
            <p className="py-10 text-sm text-[#77767b]">No published opportunities yet.</p>
          ) : (
            recommendedJobs.map((job, index) => (
              <Link
                key={job.id}
                href={`/candidate/jobs/${encodeURIComponent(job.id)}`}
                className="group grid gap-4 border-b border-black/10 py-7 last:border-b-0 sm:grid-cols-[64px_minmax(0,1fr)_120px] sm:items-center"
              >
                <span className="font-mono text-xs text-[#9a989d]">{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <h3 className="text-xl font-black tracking-[-.025em] transition group-hover:text-[#5b3df5]">{job.title}</h3>
                  <p className="mt-1 text-xs text-[#77767b]">{job.company} · {job.workType} · {job.employmentType}</p>
                  <p className="mt-3 text-xs text-[#5f6065]">{job.skills.slice(0, 4).join(" / ")}</p>
                </div>
                <div className="sm:text-right">
                  <p className="text-3xl font-black tracking-[-.05em]">{job.matchScore}%</p>
                  <p className="tn-index mt-1">match</p>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>

      <section className="grid border-b border-black/10 lg:grid-cols-[1fr_1fr]">
        <div className="border-b border-black/10 py-9 lg:border-b-0 lg:border-r lg:pr-10">
          <div className="flex items-center justify-between">
            <p className="tn-index">03 / Market gap</p>
            <Sparkles className="h-4 w-4 text-[#5b3df5]" />
          </div>
          <h2 className="mt-4 text-2xl font-black tracking-[-.035em]">Skills with rising demand.</h2>
          <div className="mt-8">
            {skillGaps.length === 0 ? (
              <p className="text-sm text-[#77767b]">No missing skills found in current postings.</p>
            ) : skillGaps.map((skill, index) => (
              <div key={skill.name} className="grid grid-cols-[32px_1fr_auto] items-center gap-4 border-t border-black/10 py-4">
                <span className="font-mono text-[10px] text-[#9a989d]">0{index + 1}</span>
                <span className="text-sm font-black">{skill.name}</span>
                <span className="text-xs font-bold text-[#5b3df5]">{skill.demandPercent}% demand</span>
              </div>
            ))}
          </div>
          <Link href="/candidate/skill-gap" className="mt-4 inline-flex text-xs font-black">Open skill intelligence →</Link>
        </div>

        <div className="py-9 lg:pl-10">
          <p className="tn-index">04 / Interview studio</p>
          <div className="mt-5 border border-[#101114] bg-[#101114] p-7 text-white">
            <div className="grid gap-8 sm:grid-cols-[1fr_auto] sm:items-end">
              <div>
                <p className="text-3xl font-black tracking-[-.045em]">Practice against a real role.</p>
                <p className="mt-3 max-w-md text-sm leading-6 text-white/55">
                  Five role-aware questions, scoring, feedback and a persistent session — without pretending to predict hiring.
                </p>
              </div>
              <BriefcaseBusiness className="h-9 w-9 text-[#8b7cff]" />
            </div>
            <Link href="/candidate/interview-practice">
              <Button className="mt-8 bg-[#f3f1ec] text-[#101114] hover:bg-white">
                Enter studio <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-0 py-8 sm:grid-cols-2">
        <div className="border-b border-black/10 pb-8 sm:border-b-0 sm:border-r sm:pb-0 sm:pr-10">
          <FileText className="h-4 w-4 text-[#5b3df5]" />
          <p className="mt-5 text-5xl font-black tracking-[-.06em]">{applications.length}</p>
          <p className="mt-2 text-xs font-bold text-[#5f6065]">applications currently in your pipeline</p>
          <Link href="/candidate/applications" className="mt-5 inline-flex text-xs font-black">Track applications →</Link>
        </div>
        <div className="pt-8 sm:pl-10 sm:pt-0">
          <p className="tn-index">Next move</p>
          <p className="mt-4 max-w-xl text-xl font-black tracking-[-.03em]">
            Keep the profile specific, follow the strongest matches, and use the interview studio before applying to high-fit roles.
          </p>
        </div>
      </section>
    </div>
  );
}
