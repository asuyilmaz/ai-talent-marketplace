"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Lightbulb,
  TrendingUp,
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
  company: string;
  description?: string | null;
  skills: string[];
  workType: string;
  employmentType: string;
};

type JobsResponse = {
  jobs?: Job[];
  message?: string;
  error?: string;
};

type MissingSkill = {
  name: string;
  jobCount: number;
  percentage: number;
  priority: "High" | "Medium" | "Low";
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

function getPriority(
  jobCount: number,
  totalJobs: number
): "High" | "Medium" | "Low" {
  if (totalJobs === 0) {
    return "Low";
  }

  const ratio = jobCount / totalJobs;

  if (ratio >= 0.5) {
    return "High";
  }

  if (ratio >= 0.25) {
    return "Medium";
  }

  return "Low";
}

export default function CandidateSkillGapPage() {
  const [candidateSkills, setCandidateSkills] =
    useState<string[]>([]);

  const [jobs, setJobs] =
    useState<Job[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function loadSkillGap() {
      try {
        setLoading(true);
        setError("");

        const storedUser =
          localStorage.getItem("currentUser");

        if (!storedUser) {
          setError(
            "Please log in to view your skill gap."
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
            : "Unable to calculate skill gap."
        );
      } finally {
        setLoading(false);
      }
    }

    loadSkillGap();
  }, []);

  const analysis = useMemo(() => {
    const candidateSkillSet = new Set(
      candidateSkills.map(
        normalizeSkillName
      )
    );

    const missingSkillMap = new Map<
      string,
      {
        name: string;
        jobIds: Set<string>;
      }
    >();

    let totalRequiredSkills = 0;
    let totalMatchedSkills = 0;

    jobs.forEach((job) => {
      const uniqueJobSkills = Array.from(
        new Map(
          normalizeSkills(job.skills).map(
            (skill) => [
              normalizeSkillName(skill),
              skill,
            ]
          )
        ).entries()
      );

      uniqueJobSkills.forEach(
        ([normalizedSkill, displayName]) => {
          totalRequiredSkills += 1;

          if (
            candidateSkillSet.has(
              normalizedSkill
            )
          ) {
            totalMatchedSkills += 1;
            return;
          }

          const existing =
            missingSkillMap.get(
              normalizedSkill
            );

          if (existing) {
            existing.jobIds.add(job.id);
          } else {
            missingSkillMap.set(
              normalizedSkill,
              {
                name: displayName,
                jobIds: new Set([
                  job.id,
                ]),
              }
            );
          }
        }
      );
    });

    const missingSkills: MissingSkill[] =
      Array.from(
        missingSkillMap.values()
      )
        .map((skill) => {
          const jobCount =
            skill.jobIds.size;

          const percentage =
            jobs.length > 0
              ? Math.round(
                  (jobCount /
                    jobs.length) *
                    100
                )
              : 0;

          return {
            name: skill.name,
            jobCount,
            percentage,
            priority: getPriority(
              jobCount,
              jobs.length
            ),
          };
        })
        .sort((a, b) => {
          if (
            b.jobCount !== a.jobCount
          ) {
            return (
              b.jobCount -
              a.jobCount
            );
          }

          return a.name.localeCompare(
            b.name
          );
        });

    const coverage =
      totalRequiredSkills > 0
        ? Math.round(
            (totalMatchedSkills /
              totalRequiredSkills) *
              100
          )
        : 0;

    return {
      missingSkills,
      coverage,
      totalRequiredSkills,
      totalMatchedSkills,
    };
  }, [candidateSkills, jobs]);

  const topSkill =
    analysis.missingSkills[0];

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />

            <span className="text-sm font-medium">
              Career Insights
            </span>
          </div>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Skill Gap
          </h1>

          <p className="mt-2 text-muted-foreground">
            Analyzing your skills
            against available jobs...
          </p>
        </div>
      </div>
    );
  }

return (
    <div className="mx-auto max-w-[1380px] space-y-10">
      <section className="grid gap-8 border-b border-black/15 pb-9 lg:grid-cols-[1.15fr_.85fr] lg:items-end">
        <div>
          <p className="tn-index text-[#6d5dfc]">Capability gap / 04</p>
          <h1 className="mt-4 max-w-4xl text-5xl font-black tracking-[-.065em] text-[#101114] sm:text-6xl">
            See what the market keeps asking for.
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-6 text-[#66656a]">
            Instead of a generic learning list, this view measures your current
            profile against the skills repeated across live roles.
          </p>
        </div>

        <div className="border border-black/15 p-5">
          <div className="flex items-end justify-between gap-5">
            <div>
              <p className="tn-index text-[#8a898d]">Skill coverage</p>
              <p className="mt-2 text-5xl font-black tracking-[-.06em]">
                {analysis.coverage}<span className="text-lg text-[#8a898d]">%</span>
              </p>
            </div>
            <p className="max-w-[170px] text-right text-xs leading-5 text-[#77767a]">
              {analysis.totalMatchedSkills} of {analysis.totalRequiredSkills} required skill signals covered.
            </p>
          </div>
          <div className="mt-5 h-1.5 bg-black/10">
            <div
              className="h-full bg-[#6d5dfc]"
              style={{ width: `${analysis.coverage}%` }}
            />
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
            <p className="tn-index text-[#6d5dfc]">Baseline missing</p>
            <h2 className="mt-2 text-xl font-black">Add your current skills first.</h2>
            <p className="mt-2 text-sm text-[#66656a]">
              We need your existing capability set before we can identify useful gaps.
            </p>
          </div>
          <Link
            href="/candidate/skills"
            className="inline-flex h-11 items-center justify-center gap-2 border border-black bg-black px-5 text-xs font-black uppercase tracking-[.12em] text-white"
          >
            Add skills <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      {!error && analysis.missingSkills.length > 0 && (
        <>
          <section className="grid gap-6 lg:grid-cols-[.7fr_1.3fr]">
            <div className="border border-black bg-[#101114] p-7 text-white">
              <p className="tn-index text-[#9c90ff]">Highest-leverage gap</p>
              <h2 className="mt-5 text-4xl font-black tracking-[-.055em]">
                {topSkill?.name}
              </h2>
              <p className="mt-4 text-sm leading-6 text-white/60">
                Requested by {topSkill?.jobCount} current role{topSkill?.jobCount === 1 ? "" : "s"}.
                This is the most repeated missing signal in your market view.
              </p>
              <div className="mt-8 flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-[#9c90ff]" />
                <span className="text-3xl font-black">{topSkill?.percentage}%</span>
                <span className="text-xs text-white/45">of live roles</span>
              </div>
            </div>

            <div className="border-y border-black/15">
              <div className="grid gap-3 border-b border-black/15 py-4 sm:grid-cols-[1fr_auto] sm:items-center">
                <div>
                  <p className="tn-index text-[#8a898d]">Current skill set</p>
                  <h2 className="mt-2 text-xl font-black">What you already bring</h2>
                </div>
                <span className="text-xs text-[#8a898d]">{candidateSkills.length} skills</span>
              </div>
              <div className="flex flex-wrap gap-2 py-5">
                {candidateSkills.map((skill) => (
                  <span key={skill} className="border border-black/15 bg-white px-3 py-1.5 text-xs font-bold">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </section>

          <section>
            <div className="mb-4">
              <p className="tn-index text-[#8a898d]">Market demand ranking</p>
              <h2 className="mt-2 text-2xl font-black tracking-[-.04em]">
                Missing skills worth investigating
              </h2>
            </div>

            <div className="border-t border-black">
              {analysis.missingSkills.map((skill, index) => (
                <div
                  key={skill.name}
                  className="grid gap-4 border-b border-black/15 py-5 sm:grid-cols-[56px_1fr_130px_120px] sm:items-center"
                >
                  <span className="font-mono text-xs text-[#9b9a9e]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <p className="text-lg font-black tracking-[-.03em]">{skill.name}</p>
                    <div className="mt-2 h-[3px] max-w-lg bg-black/10">
                      <div
                        className="h-full bg-[#6d5dfc]"
                        style={{ width: `${skill.percentage}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl font-black tracking-[-.04em]">{skill.jobCount}</p>
                    <p className="text-[10px] uppercase tracking-[.14em] text-[#8a898d]">roles request it</p>
                  </div>
                  <span className={`justify-self-start border px-2.5 py-1 text-[10px] font-black uppercase tracking-[.12em] ${
                    skill.priority === "High"
                      ? "border-black bg-black text-white"
                      : skill.priority === "Medium"
                      ? "border-[#6d5dfc] text-[#6d5dfc]"
                      : "border-black/20 text-[#77767a]"
                  }`}>
                    {skill.priority}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="grid gap-5 border border-black/15 p-6 sm:grid-cols-[auto_1fr_auto] sm:items-center">
            <div className="flex h-11 w-11 items-center justify-center border border-black/15 bg-white">
              <Lightbulb className="h-5 w-5 text-[#6d5dfc]" />
            </div>
            <div>
              <p className="font-black">Use the gap as a direction, not a checklist.</p>
              <p className="mt-1 text-sm leading-6 text-[#77767a]">
                Prioritize repeated skills that also fit the kind of work you actually want.
              </p>
            </div>
            <Link
              href="/candidate/jobs"
              className="inline-flex h-10 items-center justify-center gap-2 border border-black/20 px-4 text-xs font-black uppercase tracking-[.1em] hover:bg-black hover:text-white"
            >
              Revisit roles <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </section>
        </>
      )}

      {!error && analysis.missingSkills.length === 0 && (
        <div className="border-y border-black/15 py-14">
          <p className="tn-index text-[#6d5dfc]">No major gap detected</p>
          <h2 className="mt-3 text-3xl font-black tracking-[-.045em]">
            Your current skills cover the available market well.
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#77767a]">
            Keep your profile current as new roles and requirements enter TALNIVO.
          </p>
        </div>
      )}
    </div>
  );
}
