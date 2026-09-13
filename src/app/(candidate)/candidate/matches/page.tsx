"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Sparkles
} from "lucide-react";


type CurrentUser = {
  id: string;
  name?: string;
  email?: string;
  role?: string;
};

type CandidateResponse = {
  id?: string;
  name?: string;
  email?: string;
  skills?: string[] | string | null;
  error?: string;
  message?: string;
};

type Job = {
  id: string;
  title: string;
  description?: string | null;
  company: string;
  skills: string[];
  workType: string;
  employmentType: string;
};

type JobsResponse = {
  jobs?: Job[];
  message?: string;
  error?: string;
};

type JobMatch = Job & {
  score: number;
  matchedSkills: string[];
  missingSkills: string[];
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

function normalizeSkillName(skill: string) {
  return skill.trim().toLowerCase();
}

function calculateMatch(
  candidateSkills: string[],
  jobSkills: string[]
) {
  if (jobSkills.length === 0) {
    return {
      score: 0,
      matchedSkills: [] as string[],
      missingSkills: [] as string[],
    };
  }

  const candidateSkillSet = new Set(
    candidateSkills.map(normalizeSkillName)
  );

  const matchedSkills = jobSkills.filter((skill) =>
    candidateSkillSet.has(normalizeSkillName(skill))
  );

  const missingSkills = jobSkills.filter(
    (skill) =>
      !candidateSkillSet.has(
        normalizeSkillName(skill)
      )
  );

  const score = Math.round(
    (matchedSkills.length / jobSkills.length) *
      100
  );

  return {
    score,
    matchedSkills,
    missingSkills,
  };
}

function getCompatibilityText(score: number) {
  if (score >= 80) {
    return "Excellent compatibility";
  }

  if (score >= 60) {
    return "Strong compatibility";
  }

  if (score >= 40) {
    return "Moderate compatibility";
  }

  if (score > 0) {
    return "Some skill overlap";
  }

  return "Skills need improvement";
}

export default function CandidateMatchesPage() {
  const [candidateSkills, setCandidateSkills] =
    useState<string[]>([]);

  const [jobs, setJobs] = useState<Job[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function loadMatches() {
      try {
        setLoading(true);
        setError("");

        const storedUser =
          localStorage.getItem("currentUser");

        if (!storedUser) {
          setError(
            "Please log in to view your matches."
          );
          return;
        }

        const currentUser = JSON.parse(
          storedUser
        ) as CurrentUser;

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

        const [
          candidateResponse,
          jobsResponse,
        ] = await Promise.all([
          fetch(
            `/api/candidates/${encodeURIComponent(
              currentUser.id
            )}`,
            {
              method: "GET",
              cache: "no-store",
            }
          ),

          fetch("/api/jobs", {
            method: "GET",
            cache: "no-store",
          }),
        ]);

        const candidateData =
          (await candidateResponse.json()) as CandidateResponse;

        const jobsData =
          (await jobsResponse.json()) as JobsResponse;

        if (!candidateResponse.ok) {
          throw new Error(
            candidateData.error ||
              candidateData.message ||
              "Unable to load candidate profile."
          );
        }

        if (!jobsResponse.ok) {
          throw new Error(
            jobsData.error ||
              jobsData.message ||
              "Unable to load jobs."
          );
        }

        setCandidateSkills(
          normalizeSkills(
            candidateData.skills
          )
        );

        setJobs(
          Array.isArray(jobsData.jobs)
            ? jobsData.jobs
            : []
        );
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Unable to load job matches."
        );
      } finally {
        setLoading(false);
      }
    }

    loadMatches();
  }, []);

  const matches = useMemo<JobMatch[]>(
    () =>
      jobs
        .map((job) => {
          const jobSkills = normalizeSkills(
            job.skills
          );

          const match = calculateMatch(
            candidateSkills,
            jobSkills
          );

          return {
            ...job,
            skills: jobSkills,
            score: match.score,
            matchedSkills:
              match.matchedSkills,
            missingSkills:
              match.missingSkills,
          };
        })
        .sort(
          (a, b) => b.score - a.score
        ),
    [candidateSkills, jobs]
  );

  const bestMatch =
    matches.length > 0
      ? matches[0].score
      : 0;

  const strongMatches =
    matches.filter(
      (match) => match.score >= 70
    ).length;

  const averageMatch =
    matches.length > 0
      ? Math.round(
          matches.reduce(
            (total, match) =>
              total + match.score,
            0
          ) / matches.length
        )
      : 0;

  if (loading) {
    return (
      <div className="space-y-8">
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
            Calculating your job
            matches...
          </p>
        </div>
      </div>
    );
  }

return (
    <div className="mx-auto max-w-[1380px] space-y-10">
      <section className="grid gap-7 border-b border-black/15 pb-9 lg:grid-cols-[1fr_360px] lg:items-end">
        <div>
          <p className="tn-index text-[#6d5dfc]">Match intelligence / 02</p>
          <h1 className="mt-4 text-5xl font-black tracking-[-.065em] text-[#101114] sm:text-6xl">
            Your fit, made visible.
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-6 text-[#66656a]">
            TALNIVO compares your skill profile with every available role and
            surfaces where the overlap is strongest — and where it breaks.
          </p>
        </div>
        <div className="grid grid-cols-3 border border-black/15">
          <div className="p-4">
            <p className="tn-index text-[#8a898d]">Best</p>
            <p className="mt-2 text-3xl font-black tracking-[-.05em]">{bestMatch}%</p>
          </div>
          <div className="border-x border-black/15 p-4">
            <p className="tn-index text-[#8a898d]">70%+</p>
            <p className="mt-2 text-3xl font-black tracking-[-.05em]">{strongMatches}</p>
          </div>
          <div className="p-4">
            <p className="tn-index text-[#8a898d]">Average</p>
            <p className="mt-2 text-3xl font-black tracking-[-.05em]">{averageMatch}%</p>
          </div>
        </div>
      </section>

      {error && (
        <div className="border border-destructive/25 bg-destructive/5 p-5 text-sm text-destructive">
          {error}
        </div>
      )}

      {!error && candidateSkills.length === 0 && (
        <div className="grid gap-5 border border-[#6d5dfc]/30 bg-[#6d5dfc]/5 p-6 sm:grid-cols-[1fr_auto] sm:items-center">
          <div>
            <p className="tn-index text-[#6d5dfc]">Signal incomplete</p>
            <h2 className="mt-2 text-xl font-black">Add skills before judging your fit.</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#66656a]">
              Your profile has no skills yet, so the match score cannot tell you much.
            </p>
          </div>
          <Link
            href="/candidate/skills"
            className="inline-flex h-11 items-center justify-center gap-2 border border-black bg-[#101114] px-5 text-xs font-black uppercase tracking-[.12em] text-white"
          >
            Build skill profile <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      {!error && (
        <section>
          <div className="mb-4">
            <p className="tn-index text-[#8a898d]">Compatibility ranking</p>
            <h2 className="mt-2 text-2xl font-black tracking-[-.04em]">
              {matches.length} opportunity{matches.length === 1 ? "" : "ies"}
            </h2>
          </div>

          {matches.length === 0 ? (
            <div className="border-y border-black/15 py-14 text-sm text-[#77767a]">
              No jobs are currently available to compare.
            </div>
          ) : (
            <div className="border-t border-black">
              {matches.map((match, index) => (
                <article
                  key={match.id}
                  className="grid gap-6 border-b border-black/15 py-7 lg:grid-cols-[60px_110px_1.2fr_.9fr_150px] lg:items-center"
                >
                  <span className="font-mono text-xs text-[#9b9a9e]">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <div>
                    <p className="text-4xl font-black tracking-[-.06em]">{match.score}</p>
                    <p className="text-[10px] font-black uppercase tracking-[.16em] text-[#77767a]">
                      match score
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-black tracking-[-.035em]">{match.title}</h3>
                    <p className="mt-1 text-sm text-[#77767a]">
                      {match.company} · {match.workType} · {match.employmentType}
                    </p>
                    <p className="mt-3 text-xs font-bold text-[#6d5dfc]">
                      {getCompatibilityText(match.score)}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="tn-index text-[#8a898d]">Covered</p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {match.matchedSkills.length > 0 ? (
                          match.matchedSkills.slice(0, 5).map((skill) => (
                            <span key={skill} className="border border-black/15 bg-white px-2 py-1 text-[10px] font-bold">
                              {skill}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-[#8a898d]">No exact overlap yet</span>
                        )}
                      </div>
                    </div>
                    {match.missingSkills.length > 0 && (
                      <p className="text-[11px] text-[#8a898d]">
                        Missing: {match.missingSkills.slice(0, 3).join(", ")}
                        {match.missingSkills.length > 3 ? " +" : ""}
                      </p>
                    )}
                  </div>

                  <Link
                    href={`/candidate/jobs/${encodeURIComponent(match.id)}`}
                    className="inline-flex h-10 items-center justify-center gap-2 border border-black/20 px-4 text-xs font-black uppercase tracking-[.1em] transition hover:border-black hover:bg-black hover:text-white"
                  >
                    View role <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </article>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
