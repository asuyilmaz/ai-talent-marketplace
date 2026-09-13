"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Search,
} from "lucide-react";


type ApplicationStatus =
  | "Applied"
  | "Reviewing"
  | "Interview"
  | "Offer"
  | "Hired"
  | "Rejected";

type Application = {
  id: string;
  candidateId: string;
  candidate: string;
  jobId: string;
  role: string;
  company: string;
  matchScore: number;
  status: ApplicationStatus;
  experience: string;
  skills: string[];
  appliedAt: string;
};

type ApplicationsResponse = {
  message?: string;
  applications?: Application[];
};

export default function CandidateApplicationsPage() {
  const [applications, setApplications] =
    useState<Application[]>([]);

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadApplications() {
      try {
        const storedUser =
          localStorage.getItem("currentUser");

        if (!storedUser) {
          window.location.href = "/login";
          return;
        }

        let currentUser: {
          id: string;
          name: string;
          email: string;
          role: "candidate" | "employer";
        };

        try {
          currentUser = JSON.parse(
            storedUser
          );
        } catch {
          localStorage.removeItem("currentUser");
          window.location.href = "/login";
          return;
        }

        if (currentUser.role !== "candidate") {
          window.location.href =
            "/employer/dashboard";
          return;
        }

        const response = await fetch(
          `/api/applications?candidateId=${encodeURIComponent(
            currentUser.id
          )}`,
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const data =
          (await response.json()) as ApplicationsResponse;

        if (!response.ok) {
          setError(
            data.message ||
              "Unable to load applications."
          );
          return;
        }

        setApplications(
          data.applications ?? []
        );
      } catch {
        setError(
          "Unable to connect to the server."
        );
      } finally {
        setLoading(false);
      }
    }

    loadApplications();
  }, []);

  const filteredApplications = useMemo(() => {
    const searchText =
      search.trim().toLowerCase();

    if (!searchText) {
      return applications;
    }

    return applications.filter(
      (application) =>
        application.role
          .toLowerCase()
          .includes(searchText) ||
        application.company
          .toLowerCase()
          .includes(searchText) ||
        application.skills.some((skill) =>
          skill
            .toLowerCase()
            .includes(searchText)
        )
    );
  }, [applications, search]);

  const totalApplications =
    applications.length;

  const reviewingCount =
    applications.filter(
      (application) =>
        application.status === "Reviewing"
    ).length;

  const interviewCount =
    applications.filter(
      (application) =>
        application.status === "Interview"
    ).length;

  const hiredCount =
    applications.filter(
      (application) =>
        application.status === "Hired"
    ).length;

  function formatAppliedAt(
    appliedAt: string
  ) {
    const date = new Date(appliedAt);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return new Intl.DateTimeFormat(
      "en-US",
      {
        dateStyle: "medium",
      }
    ).format(date);
  }

return (
    <div className="mx-auto max-w-[1380px] space-y-10">
      <section className="grid gap-8 border-b border-black/15 pb-9 lg:grid-cols-[1fr_460px] lg:items-end">
        <div>
          <p className="tn-index text-[#6d5dfc]">Application ledger / 03</p>
          <h1 className="mt-4 text-5xl font-black tracking-[-.065em] text-[#101114] sm:text-6xl">
            Know exactly where every application stands.
          </h1>
        </div>

        <div className="grid grid-cols-4 border border-black/15">
          {[
            ["Total", totalApplications],
            ["Review", reviewingCount],
            ["Interview", interviewCount],
            ["Hired", hiredCount],
          ].map(([label, value], index) => (
            <div key={String(label)} className={`${index > 0 ? "border-l border-black/15" : ""} p-3 sm:p-4`}>
              <p className="tn-index text-[#8a898d]">{label}</p>
              <p className="mt-2 text-2xl font-black tracking-[-.05em]">{value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-b border-black/15 pb-7">
        <label htmlFor="application-search" className="tn-index text-[#8a898d]">
          Filter your pipeline
        </label>
        <div className="mt-3 flex items-center gap-3 border-b border-black pb-3">
          <Search className="h-4 w-4 text-[#8a898d]" />
          <input
            id="application-search"
            name="applicationSearch"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Role, company or skill"
            className="w-full bg-transparent text-base font-semibold outline-none placeholder:text-[#aaa9ad]"
          />
        </div>
      </section>

      {loading && (
        <div className="border-y border-black/10 py-16 text-sm text-[#77767a]">
          Loading application ledger...
        </div>
      )}

      {!loading && error && (
        <div className="border border-destructive/25 bg-destructive/5 p-5 text-sm text-destructive">
          {error}
        </div>
      )}

      {!loading && !error && filteredApplications.length > 0 && (
        <section>
          <div className="border-t border-black">
            {filteredApplications.map((application, index) => (
              <article
                key={application.id}
                className="grid gap-5 border-b border-black/15 py-7 lg:grid-cols-[60px_1.2fr_180px_140px_150px] lg:items-center"
              >
                <span className="font-mono text-xs text-[#9b9a9e]">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <div>
                  <h2 className="text-xl font-black tracking-[-.035em]">{application.role}</h2>
                  <p className="mt-1 text-sm text-[#77767a]">{application.company}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {application.skills.slice(0, 5).map((skill) => (
                      <span
                        key={`${application.id}-${skill}`}
                        className="border border-black/15 px-2 py-1 text-[10px] font-bold"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                  <p className="mt-3 text-[11px] text-[#9b9a9e]">
                    Applied {formatAppliedAt(application.appliedAt)}
                  </p>
                </div>

                <div>
                  <p className="tn-index text-[#8a898d]">Match signal</p>
                  <p className="mt-1 text-3xl font-black tracking-[-.05em]">
                    {application.matchScore}<span className="text-sm text-[#8a898d]">%</span>
                  </p>
                </div>

                <div>
                  <p className="tn-index text-[#8a898d]">Status</p>
                  <span
                    className={`mt-2 inline-flex border px-2.5 py-1 text-[10px] font-black uppercase tracking-[.12em] ${
                      application.status === "Rejected"
                        ? "border-destructive/35 text-destructive"
                        : application.status === "Hired" || application.status === "Offer"
                        ? "border-black bg-black text-white"
                        : application.status === "Interview"
                        ? "border-[#6d5dfc] bg-[#6d5dfc] text-white"
                        : "border-black/20 text-[#55545a]"
                    }`}
                  >
                    {application.status}
                  </span>
                </div>

                {application.jobId ? (
                  <Link
                    href={`/candidate/jobs/${application.jobId}`}
                    className="inline-flex h-10 items-center justify-center gap-2 border border-black/20 px-4 text-xs font-black uppercase tracking-[.1em] transition hover:border-black hover:bg-black hover:text-white"
                  >
                    View role <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                ) : (
                  <span className="text-xs text-[#aaa9ad]">Role unavailable</span>
                )}
              </article>
            ))}
          </div>
        </section>
      )}

      {!loading && !error && filteredApplications.length === 0 && (
        <div className="grid gap-5 border-y border-black/15 py-14 sm:grid-cols-[1fr_auto] sm:items-center">
          <div>
            <p className="tn-index text-[#8a898d]">No entries</p>
            <h2 className="mt-2 text-2xl font-black tracking-[-.04em]">
              {applications.length === 0 ? "Your application ledger is empty." : "No application matches that search."}
            </h2>
            <p className="mt-2 text-sm text-[#77767a]">
              {applications.length === 0
                ? "Explore the market and apply to a role to start tracking progress here."
                : "Try another role, company, or skill."}
            </p>
          </div>
          {applications.length === 0 && (
            <Link
              href="/candidate/jobs"
              className="inline-flex h-11 items-center justify-center gap-2 border border-black bg-black px-5 text-xs font-black uppercase tracking-[.12em] text-white"
            >
              Explore roles <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
