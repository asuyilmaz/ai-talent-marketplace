"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  MapPin,
  Briefcase,
} from "lucide-react";
import {
  calculateSkillMatch,
  getMatchLabel,
} from "@/lib/skill-match";

type CandidateJob = {
  id: string;
  title: string;
  description: string;
  company: string;
  skills: string[];
  workType: string;
  employmentType: string;
  applications: number;
  status: string;
  matchScore: number;
};

type JobsResponse = {
  message?: string;
  jobs?: Omit<CandidateJob, "matchScore">[];
};

type CandidateResponse = {
  id: string;
  name: string;
  email: string;
  skills?: string[] | string | null;
};

type CurrentUser = {
  id: string;
  role?: string;
};

function normalizeCandidateSkills(
  skills: CandidateResponse["skills"]
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

export default function CandidateJobsPage() {
  const [jobs, setJobs] = useState<CandidateJob[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadJobs() {
      try {
        const storedUser = localStorage.getItem("currentUser");

        if (!storedUser) {
          window.location.href = "/login";
          return;
        }

        let currentUser: CurrentUser;

        try {
          currentUser = JSON.parse(storedUser) as CurrentUser;
        } catch {
          localStorage.removeItem("currentUser");
          window.location.href = "/login";
          return;
        }

        if (
          !currentUser.role ||
          currentUser.role.toLowerCase() !== "candidate"
        ) {
          window.location.href = "/employer/dashboard";
          return;
        }

        const [candidateResponse, jobsResponse] =
          await Promise.all([
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
          (await candidateResponse.json()) as CandidateResponse & {
            message?: string;
          };

        const jobsData =
          (await jobsResponse.json()) as JobsResponse;

        if (!candidateResponse.ok) {
          setError(
            candidateData.message ||
              "Unable to load your candidate profile."
          );
          return;
        }

        if (!jobsResponse.ok) {
          setError(
            jobsData.message || "Unable to load jobs."
          );
          return;
        }

        const candidateSkills = normalizeCandidateSkills(
          candidateData.skills
        );

        const scoredJobs = (jobsData.jobs ?? [])
          .map((job) => ({
            ...job,
            matchScore: calculateSkillMatch(
              candidateSkills,
              job.skills
            ),
          }))
          .sort((a, b) => b.matchScore - a.matchScore);

        setJobs(scoredJobs);
      } catch {
        setError("Unable to connect to the server.");
      } finally {
        setLoading(false);
      }
    }

    loadJobs();
  }, []);

  const filteredJobs = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return jobs.filter((job) => {
      const title = job.title.toLowerCase();
      const company = job.company.toLowerCase();
      const workType = job.workType.toLowerCase();

      const skills = job.skills.map((skill) =>
        skill.toLowerCase()
      );

      const matchesSearch =
        searchText === "" ||
        title.includes(searchText) ||
        company.includes(searchText) ||
        workType.includes(searchText) ||
        skills.some((skill) =>
          skill.includes(searchText)
        );

      const matchesFilter =
        filter === "All" ||
        (filter === "Remote" &&
          job.workType === "Remote") ||
        (filter === "Hybrid" &&
          job.workType === "Hybrid");

      return matchesSearch && matchesFilter;
    });
  }, [jobs, search, filter]);

return (
    <div className="mx-auto max-w-[1380px] space-y-10">
      <section className="grid gap-8 border-b border-black/15 pb-9 lg:grid-cols-[1.2fr_.8fr] lg:items-end">
        <div>
          <p className="tn-index text-[#6d5dfc]">Opportunity desk / 01</p>
          <h1 className="mt-4 max-w-4xl text-5xl font-black tracking-[-.065em] text-[#101114] sm:text-6xl">
            Find work that fits the skills you already have.
          </h1>
        </div>
        <div className="lg:pb-2">
          <p className="max-w-xl text-sm leading-6 text-[#66656a]">
            Every role is ranked against your current skill profile. Search the market,
            narrow the work model, then inspect the signal before you apply.
          </p>
          <div className="mt-5 flex items-baseline gap-3">
            <span className="text-3xl font-black tracking-[-.05em]">{jobs.length}</span>
            <span className="text-xs uppercase tracking-[.18em] text-[#8a898d]">
              live roles
            </span>
          </div>
        </div>
      </section>

      <section className="grid gap-5 border-b border-black/15 pb-8 lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="relative">
          <label htmlFor="job-search" className="tn-index text-[#8a898d]">
            Search market
          </label>
          <input
            id="job-search"
            name="jobSearch"
            type="search"
            placeholder="Role, company, skill or work type"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="mt-3 h-14 w-full border-0 border-b border-black bg-transparent px-0 text-lg font-semibold outline-none placeholder:text-[#aaa9ad]"
          />
        </div>

        <div className="flex flex-wrap gap-2 lg:justify-end">
          {["All", "Remote", "Hybrid"].map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setFilter(item)}
              className={`h-10 border px-4 text-xs font-black uppercase tracking-[.12em] transition ${
                filter === item
                  ? "border-[#101114] bg-[#101114] text-white"
                  : "border-black/15 bg-transparent text-[#101114] hover:border-black"
              }`}
            >
              {item === "All" ? "All jobs" : item}
            </button>
          ))}
        </div>
      </section>

      {loading && (
        <div className="border-y border-black/10 py-16 text-sm text-[#77767a]">
          Loading market signal...
        </div>
      )}

      {!loading && error && (
        <div className="border border-destructive/25 bg-destructive/5 p-5 text-sm text-destructive">
          {error}
        </div>
      )}

      {!loading && !error && filteredJobs.length > 0 && (
        <section>
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="tn-index text-[#8a898d]">Ranked opportunities</p>
              <h2 className="mt-2 text-2xl font-black tracking-[-.04em]">
                {filteredJobs.length} role{filteredJobs.length === 1 ? "" : "s"} in view
              </h2>
            </div>
            <p className="hidden text-xs text-[#8a898d] sm:block">
              Highest skill match first
            </p>
          </div>

          <div className="border-t border-black">
            {filteredJobs.map((job, index) => (
              <article
                key={job.id}
                className="group grid gap-5 border-b border-black/15 py-7 transition lg:grid-cols-[64px_1.35fr_.8fr_170px] lg:items-center"
              >
                <span className="font-mono text-xs text-[#9b9a9e]">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <h3 className="text-xl font-black tracking-[-.035em]">
                      {job.title}
                    </h3>
                    <span className="text-sm text-[#77767a]">{job.company}</span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-[#66656a]">
                    <span className="inline-flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5" />
                      {job.workType}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <Briefcase className="h-3.5 w-3.5" />
                      {job.employmentType}
                    </span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {job.skills.slice(0, 6).map((skill) => (
                      <span
                        key={`${job.id}-${skill}`}
                        className="border border-black/15 px-2.5 py-1 text-[11px] font-semibold"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-black tracking-[-.06em]">
                      {job.matchScore}
                    </span>
                    <span className="pb-1 text-xs font-bold text-[#8a898d]">/100</span>
                  </div>
                  <p className="mt-1 text-xs text-[#77767a]">
                    {getMatchLabel(job.matchScore)}
                  </p>
                  <div className="mt-3 h-[3px] w-full max-w-[180px] bg-black/10">
                    <div
                      className="h-full bg-[#6d5dfc]"
                      style={{ width: `${job.matchScore}%` }}
                    />
                  </div>
                </div>

                <Link
                  href={`/candidate/jobs/${encodeURIComponent(job.id)}`}
                  className="inline-flex h-11 items-center justify-center gap-2 border border-black bg-[#101114] px-4 text-xs font-black uppercase tracking-[.12em] text-white transition hover:bg-[#6d5dfc]"
                >
                  Inspect role
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </article>
            ))}
          </div>
        </section>
      )}

      {!loading && !error && filteredJobs.length === 0 && (
        <div className="border-y border-black/15 py-16">
          <p className="tn-index text-[#8a898d]">No result</p>
          <h3 className="mt-3 text-2xl font-black tracking-[-.04em]">
            Nothing matches that search.
          </h3>
          <p className="mt-2 text-sm text-[#77767a]">
            Try another role, company, skill, or work model.
          </p>
        </div>
      )}
    </div>
  );
}
