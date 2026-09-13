"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";


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
  createdAt?: string;
};

type CurrentUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type CandidateApiResponse = {
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
};

function normalizeSkills(skills: CandidateApiResponse["skills"]): string[] {
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

export default function CandidateProfilePage() {
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        setError("");

        const storedUser = localStorage.getItem("currentUser");

        if (!storedUser) {
          setError("You need to log in to view your profile.");
          return;
        }

        const currentUser = JSON.parse(storedUser) as CurrentUser;

        if (
          !currentUser.role ||
          currentUser.role.toLowerCase() !== "candidate"
        ) {
          setError("This page is only available for candidates.");
          return;
        }

        const response = await fetch(
          `/api/candidates/${encodeURIComponent(currentUser.id)}`
        );

        const data = (await response.json()) as CandidateApiResponse & {
          error?: string;
        };

        if (!response.ok) {
          throw new Error(data.error || "Failed to load profile.");
        }

        const normalizedCandidate: Candidate = {
          id: data.id || currentUser.id,
          name: data.name || currentUser.name || "Candidate",
          email: data.email || currentUser.email || "",
          bio: data.bio ?? null,
          phone: data.phone ?? null,
          location: data.location ?? null,
          experienceTitle: data.experienceTitle ?? null,
          experienceYears:
            typeof data.experienceYears === "number"
              ? data.experienceYears
              : null,
          skills: normalizeSkills(data.skills),
          createdAt: data.createdAt,
        };

        setCandidate(normalizedCandidate);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load profile."
        );
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  const completion = useMemo(() => {
    if (!candidate) {
      return 0;
    }

    const profileFields = [
      candidate.name,
      candidate.email,
      candidate.phone,
      candidate.location,
      candidate.bio,
      candidate.experienceTitle,
      candidate.experienceYears,
      candidate.skills.length > 0 ? candidate.skills : null,
    ];

    const completedFields = profileFields.filter((field) => {
      if (Array.isArray(field)) {
        return field.length > 0;
      }

      if (typeof field === "string") {
        return field.trim().length > 0;
      }

      return field !== null && field !== undefined;
    }).length;

    return Math.round(
      (completedFields / profileFields.length) * 100
    );
  }, [candidate]);

  const initials = useMemo(() => {
    if (!candidate?.name) {
      return "?";
    }

    return candidate.name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("");
  }, [candidate]);

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            My Profile
          </h1>

          <p className="mt-2 text-muted-foreground">
            Loading your profile...
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
            My Profile
          </h1>

          <p className="mt-2 text-muted-foreground">
            Manage your professional profile and career information.
          </p>
        </div>

        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-destructive">
              {error || "Profile could not be loaded."}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

return (
    <div className="mx-auto max-w-[1380px] space-y-10">
      <section className="grid gap-8 border-b border-black/15 pb-9 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="tn-index text-[#6d5dfc]">Identity signal / 05</p>
          <h1 className="mt-4 text-5xl font-black tracking-[-.065em] text-[#101114] sm:text-6xl">
            Your professional signal, in one place.
          </h1>
        </div>
        <Link href="/candidate/settings" className="inline-flex h-11 items-center justify-center gap-2 border border-black bg-black px-5 text-xs font-black uppercase tracking-[.12em] text-white hover:bg-[#6d5dfc]">
          Edit profile <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      <section className="grid gap-0 border border-black lg:grid-cols-[260px_1fr_220px]">
        <div className="flex min-h-[240px] items-end bg-[#101114] p-6 text-white">
          <div>
            <div className="flex h-20 w-20 items-center justify-center border border-white/25 text-3xl font-black tracking-[-.05em]">{initials}</div>
            <p className="tn-index mt-6 text-white/40">Candidate identity</p>
          </div>
        </div>
        <div className="border-black p-7 lg:border-l">
          <h2 className="text-4xl font-black tracking-[-.055em]">{candidate.name}</h2>
          <p className="mt-2 text-lg text-[#66656a]">{candidate.experienceTitle || "Candidate"}</p>
          <div className="mt-7 grid gap-3 text-sm sm:grid-cols-2">
            <span className="flex items-center gap-2"><Mail className="h-4 w-4" />{candidate.email}</span>
            <span className="flex items-center gap-2"><MapPin className="h-4 w-4" />{candidate.location || "Location not specified"}</span>
            {candidate.phone && <span className="flex items-center gap-2"><Phone className="h-4 w-4" />{candidate.phone}</span>}
            <span className="flex items-center gap-2"><Briefcase className="h-4 w-4" />{candidate.experienceYears !== null ? `${candidate.experienceYears} year${candidate.experienceYears === 1 ? "" : "s"} experience` : "Experience not specified"}</span>
          </div>
        </div>
        <div className="border-t border-black p-6 lg:border-l lg:border-t-0">
          <p className="tn-index text-[#8a898d]">Profile completion</p>
          <p className="mt-3 text-5xl font-black tracking-[-.06em]">{completion}<span className="text-lg text-[#8a898d]">%</span></p>
          <div className="mt-5 h-1.5 bg-black/10"><div className="h-full bg-[#6d5dfc]" style={{width:`${completion}%`}} /></div>
          <p className="mt-4 text-xs leading-5 text-[#77767a]">{completion === 100 ? "Your profile is complete." : "Complete missing fields to strengthen your signal."}</p>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[.8fr_1.2fr]">
        <div className="border-t border-black pt-5">
          <p className="tn-index text-[#8a898d]">About</p>
          <p className="mt-4 text-lg leading-8 text-[#333238]">{candidate.bio || "No professional summary added yet."}</p>
        </div>
        <div className="border-t border-black pt-5">
          <div className="flex items-end justify-between gap-4">
            <div><p className="tn-index text-[#8a898d]">Capability set</p><h2 className="mt-2 text-2xl font-black tracking-[-.04em]">Skills employers can match</h2></div>
            <Link href="/candidate/skills" className="text-xs font-black uppercase tracking-[.12em] underline underline-offset-4">Manage</Link>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {candidate.skills.length > 0 ? candidate.skills.map((skill)=><span key={skill} className="border border-black/15 bg-white px-3 py-1.5 text-xs font-bold">{skill}</span>) : <span className="text-sm text-[#8a898d]">No skills added yet.</span>}
          </div>
        </div>
      </section>

      <section className="grid border-y border-black/15 sm:grid-cols-3">
        {[
          ["Role", candidate.experienceTitle || "Not specified"],
          ["Experience", candidate.experienceYears !== null ? `${candidate.experienceYears} year${candidate.experienceYears === 1 ? "" : "s"}` : "Not specified"],
          ["Location", candidate.location || "Not specified"],
        ].map(([label,value],index)=><div key={label} className={`${index>0?"border-t sm:border-l sm:border-t-0 border-black/15":""} py-5 sm:px-5`}><p className="tn-index text-[#8a898d]">{label}</p><p className="mt-2 font-black">{value}</p></div>)}
      </section>
    </div>
  );
}
