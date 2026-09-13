"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Briefcase,
  Download,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";


type CurrentUser = {
  id: string;
  name: string;
  email: string;
  role: string;
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
};

function normalizeSkills(
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

function getInitials(name: string) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return "CV";
  }

  if (parts.length === 1) {
    return parts[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return `${parts[0][0]}${
    parts[parts.length - 1][0]
  }`.toUpperCase();
}

export default function CandidateCVPage() {
  const [candidate, setCandidate] =
    useState<Candidate | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function loadCandidate() {
      try {
        setLoading(true);
        setError("");

        const storedUser =
          localStorage.getItem("currentUser");

        if (!storedUser) {
          setError(
            "You need to log in to view your CV."
          );
          return;
        }

        const currentUser = JSON.parse(
          storedUser
        ) as CurrentUser;

        if (
          !currentUser.role ||
          currentUser.role.toLowerCase() !==
            "candidate"
        ) {
          setError(
            "This page is only available for candidates."
          );
          return;
        }

        const response = await fetch(
          `/api/candidates/${encodeURIComponent(
            currentUser.id
          )}`,
          {
            cache: "no-store",
          }
        );

        const data =
          (await response.json()) as CandidateResponse;

        if (!response.ok) {
          throw new Error(
            data.error ||
              "Failed to load CV."
          );
        }

        setCandidate({
          id:
            data.id ||
            currentUser.id,

          name:
            data.name ||
            currentUser.name ||
            "Candidate",

          email:
            data.email ||
            currentUser.email ||
            "",

          bio:
            data.bio ?? null,

          phone:
            data.phone ?? null,

          location:
            data.location ?? null,

          experienceTitle:
            data.experienceTitle ?? null,

          experienceYears:
            typeof data.experienceYears ===
            "number"
              ? data.experienceYears
              : null,

          skills: normalizeSkills(
            data.skills
          ),
        });
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load CV."
        );
      } finally {
        setLoading(false);
      }
    }

    loadCandidate();
  }, []);

  const initials = useMemo(() => {
    if (!candidate) {
      return "CV";
    }

    return getInitials(
      candidate.name
    );
  }, [candidate]);

  function downloadCV() {
    window.print();
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            My CV
          </h1>

          <p className="mt-2 text-muted-foreground">
            Loading your CV...
          </p>
        </div>
      </div>
    );
  }

  if (error || !candidate) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            My CV
          </h1>

          <p className="mt-2 text-muted-foreground">
            View your professional CV.
          </p>
        </div>

        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-destructive">
              {error ||
                "Candidate information could not be loaded."}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

return (
    <div className="mx-auto max-w-[1380px] space-y-8">
      <section className="print:hidden grid gap-7 border-b border-black/15 pb-8 lg:grid-cols-[1fr_auto] lg:items-end">
        <div><p className="tn-index text-[#6d5dfc]">Career document / 07</p><h1 className="mt-4 text-5xl font-black tracking-[-.065em] sm:text-6xl">A CV generated from your live profile.</h1></div>
        <div className="flex flex-wrap gap-2">
          <Link href="/candidate/profile" className="inline-flex h-11 items-center gap-2 border border-black/20 px-4 text-xs font-black uppercase tracking-[.1em]"><ArrowLeft className="h-4 w-4"/> Profile</Link>
          <button type="button" onClick={downloadCV} className="inline-flex h-11 items-center gap-2 border border-black bg-black px-5 text-xs font-black uppercase tracking-[.1em] text-white"><Download className="h-4 w-4"/> Print / Save PDF</button>
        </div>
      </section>

      <article className="mx-auto max-w-[980px] border border-black bg-white p-7 text-[#101114] sm:p-12 print:max-w-none print:border-0 print:p-0">
        <header className="grid gap-8 border-b-2 border-black pb-8 sm:grid-cols-[110px_1fr] sm:items-end">
          <div className="flex h-24 w-24 items-center justify-center bg-[#101114] text-3xl font-black text-white">{initials}</div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[.22em] text-[#6d5dfc]">TALNIVO candidate profile</p>
            <h1 className="mt-3 text-5xl font-black tracking-[-.06em]">{candidate.name}</h1>
            <p className="mt-2 text-lg text-[#66656a]">{candidate.experienceTitle || "Candidate"}</p>
          </div>
        </header>

        <div className="grid gap-10 pt-9 md:grid-cols-[230px_1fr]">
          <aside className="space-y-8">
            <section><p className="text-[10px] font-black uppercase tracking-[.18em] text-[#8a898d]">Contact</p><div className="mt-4 space-y-3 text-xs leading-5"><p className="flex gap-2"><Mail className="mt-0.5 h-3.5 w-3.5 shrink-0"/>{candidate.email}</p><p className="flex gap-2"><MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0"/>{candidate.location||"Not specified"}</p>{candidate.phone&&<p className="flex gap-2"><Phone className="mt-0.5 h-3.5 w-3.5 shrink-0"/>{candidate.phone}</p>}</div></section>
            <section><p className="text-[10px] font-black uppercase tracking-[.18em] text-[#8a898d]">Skills</p><div className="mt-4 flex flex-wrap gap-1.5">{candidate.skills.length>0?candidate.skills.map(skill=><span key={skill} className="border border-black/20 px-2 py-1 text-[10px] font-bold">{skill}</span>):<span className="text-xs text-[#8a898d]">No skills listed</span>}</div></section>
          </aside>
          <main className="space-y-10">
            <section><p className="text-[10px] font-black uppercase tracking-[.18em] text-[#8a898d]">Profile</p><p className="mt-4 text-sm leading-7">{candidate.bio||"No professional summary added yet."}</p></section>
            <section className="border-t border-black/15 pt-7"><p className="text-[10px] font-black uppercase tracking-[.18em] text-[#8a898d]">Experience</p><div className="mt-4 flex items-start gap-4"><Briefcase className="mt-1 h-4 w-4"/><div><h2 className="text-lg font-black">{candidate.experienceTitle||"Professional Experience"}</h2><p className="mt-1 text-sm text-[#66656a]">{candidate.experienceYears!==null?`${candidate.experienceYears} year${candidate.experienceYears===1?"":"s"} of experience`:"Experience duration not specified"}</p></div></div></section>
          </main>
        </div>
      </article>

      <div className="print:hidden grid gap-4 border-y border-black/15 py-5 sm:grid-cols-[1fr_auto] sm:items-center">
        <p className="text-sm text-[#77767a]">Your CV reflects the information stored in your candidate profile.</p>
        <Link href="/candidate/settings" className="text-xs font-black uppercase tracking-[.12em] underline underline-offset-4">Edit source profile</Link>
      </div>
    </div>
  );
}
