"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";



type CurrentUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type CandidateResponse = {
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
  error?: string;
};

export default function CandidateSkillsPage() {
  const [candidateId, setCandidateId] = useState("");

  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingSkill, setDeletingSkill] = useState<string | null>(null);

  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadSkills() {
      try {
        setLoading(true);
        setError("");

        const storedUser = localStorage.getItem("currentUser");

        if (!storedUser) {
          setError(
            "You need to log in to manage your skills."
          );
          return;
        }

        const currentUser = JSON.parse(
          storedUser
        ) as CurrentUser;

        if (
          !currentUser.role ||
          currentUser.role.toLowerCase() !== "candidate"
        ) {
          setError(
            "This page is only available for candidates."
          );
          return;
        }

        setCandidateId(currentUser.id);

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
            data.error || "Failed to load skills."
          );
        }

        setSkills(
          Array.isArray(data.skills)
            ? data.skills
            : []
        );
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load skills."
        );
      } finally {
        setLoading(false);
      }
    }

    loadSkills();
  }, []);

  const sortedSkills = useMemo(() => {
    return [...skills].sort((a, b) =>
      a.localeCompare(b)
    );
  }, [skills]);

  function addSkill() {
    const skill = newSkill.trim();

    if (!skill) {
      return;
    }

    const exists = skills.some(
      (existingSkill) =>
        existingSkill.toLowerCase() ===
        skill.toLowerCase()
    );

    if (exists) {
      setError(
        "This skill is already in your profile."
      );
      return;
    }

    setSkills((currentSkills) => [
      ...currentSkills,
      skill,
    ]);

    setNewSkill("");
    setSaved(false);
    setError("");
  }

  async function removeSkill(
    skillToRemove: string
  ) {
    if (!candidateId) {
      setError(
        "Candidate ID could not be found."
      );
      return;
    }

    const updatedSkills = skills.filter(
      (skill) => skill !== skillToRemove
    );

    try {
      setDeletingSkill(skillToRemove);
      setSaved(false);
      setError("");

      const response = await fetch(
        `/api/candidates/${encodeURIComponent(
          candidateId
        )}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            skills: updatedSkills,
          }),
        }
      );

      const data =
        (await response.json()) as CandidateResponse;

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to delete skill."
        );
      }

      setSkills(
        Array.isArray(data.skills)
          ? data.skills
          : updatedSkills
      );

      setSaved(true);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to delete skill."
      );
    } finally {
      setDeletingSkill(null);
    }
  }

  function handleKeyDown(
    event: React.KeyboardEvent<HTMLInputElement>
  ) {
    if (event.key === "Enter") {
      event.preventDefault();
      addSkill();
    }
  }

  async function saveSkills() {
    if (!candidateId) {
      setError(
        "Candidate ID could not be found."
      );
      return;
    }

    try {
      setSaving(true);
      setSaved(false);
      setError("");

      const response = await fetch(
        `/api/candidates/${encodeURIComponent(
          candidateId
        )}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            skills,
          }),
        }
      );

      const data =
        (await response.json()) as CandidateResponse;

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to save skills."
        );
      }

      setSkills(
        Array.isArray(data.skills)
          ? data.skills
          : skills
      );

      setSaved(true);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to save skills."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Skills
          </h1>

          <p className="mt-2 text-muted-foreground">
            Loading your skills...
          </p>
        </div>
      </div>
    );
  }

  if (error && !candidateId) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Skills
          </h1>

          <p className="mt-2 text-muted-foreground">
            Manage the skills included in your
            professional profile.
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
    <div className="mx-auto max-w-[1380px] space-y-10">
      <section className="grid gap-7 border-b border-black/15 pb-9 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="tn-index text-[#6d5dfc]">Capability editor / 06</p>
          <h1 className="mt-4 text-5xl font-black tracking-[-.065em] sm:text-6xl">Build the skill signal behind your matches.</h1>
          <p className="mt-5 max-w-2xl text-sm leading-6 text-[#66656a]">Keep this list specific and current. TALNIVO uses these exact signals when comparing your profile with live roles.</p>
        </div>
        <Link href="/candidate/profile" className="inline-flex h-11 items-center gap-2 border border-black/20 px-5 text-xs font-black uppercase tracking-[.12em] hover:bg-black hover:text-white"><ArrowLeft className="h-4 w-4"/> Profile</Link>
      </section>

      {saved && <div className="flex items-center gap-2 border border-black bg-black px-4 py-3 text-sm text-white"><CheckCircle2 className="h-4 w-4"/> Skill profile saved.</div>}
      {error && <div className="border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</div>}

      <section className="grid gap-8 lg:grid-cols-[.65fr_1.35fr]">
        <div className="border-t border-black pt-5">
          <p className="tn-index text-[#8a898d]">Add capability</p>
          <h2 className="mt-3 text-2xl font-black tracking-[-.04em]">One clear skill at a time.</h2>
          <div className="mt-6">
            <label htmlFor="new-skill" className="text-xs font-black uppercase tracking-[.12em]">Skill name</label>
            <input id="new-skill" name="newSkill" type="text" value={newSkill} onChange={(event)=>{setNewSkill(event.target.value);setError("");}} onKeyDown={handleKeyDown} placeholder="e.g. React" className="mt-3 h-14 w-full border-0 border-b border-black bg-transparent px-0 text-lg font-semibold outline-none placeholder:text-[#aaa9ad]" />
            <button type="button" onClick={addSkill} disabled={!newSkill.trim()||saving||deletingSkill!==null} className="mt-5 inline-flex h-11 items-center gap-2 border border-black bg-black px-5 text-xs font-black uppercase tracking-[.12em] text-white disabled:opacity-40"><Plus className="h-4 w-4"/> Add skill</button>
          </div>
        </div>

        <div className="border-t border-black pt-5">
          <div className="flex items-end justify-between">
            <div><p className="tn-index text-[#8a898d]">Current capability set</p><h2 className="mt-2 text-2xl font-black tracking-[-.04em]">{skills.length} skill{skills.length===1?"":"s"} on profile</h2></div>
            <span className="font-mono text-xs text-[#8a898d]">{String(skills.length).padStart(2,"0")}</span>
          </div>
          {sortedSkills.length>0 ? <div className="mt-5 border-t border-black/15">{sortedSkills.map((skill,index)=><div key={skill} className="grid grid-cols-[44px_1fr_auto] items-center border-b border-black/15 py-4"><span className="font-mono text-[10px] text-[#9b9a9e]">{String(index+1).padStart(2,"0")}</span><span className="font-black">{skill}</span><button type="button" onClick={()=>removeSkill(skill)} disabled={saving||deletingSkill!==null} aria-label={`Remove ${skill}`} className="flex h-9 w-9 items-center justify-center border border-black/15 hover:border-destructive hover:text-destructive disabled:opacity-40"><Trash2 className="h-4 w-4"/></button></div>)}</div> : <div className="mt-6 border-y border-black/15 py-10 text-sm text-[#77767a]">No skills added yet.</div>}
        </div>
      </section>

      <div className="flex justify-end border-t border-black/15 pt-6">
        <button type="button" onClick={saveSkills} disabled={saving||deletingSkill!==null} className="inline-flex h-12 items-center gap-2 border border-[#6d5dfc] bg-[#6d5dfc] px-6 text-xs font-black uppercase tracking-[.12em] text-white disabled:opacity-40"><Save className="h-4 w-4"/>{saving?"Saving...":"Save skill profile"}</button>
      </div>
    </div>
  );
}
