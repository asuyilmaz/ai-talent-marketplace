"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Save } from "lucide-react";


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
  error?: string;
};

function normalizeSkills(
  skills: CandidateResponse["skills"]
): string {
  if (Array.isArray(skills)) {
    return skills
      .map((skill) => skill.trim())
      .filter(Boolean)
      .join(", ");
  }

  if (typeof skills === "string") {
    return skills;
  }

  return "";
}

export default function CandidateSettingsPage() {
  const router = useRouter();

  const [candidateId, setCandidateId] =
    useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  const [experienceTitle, setExperienceTitle] =
    useState("");
  const [experienceYears, setExperienceYears] =
    useState("");
  const [skills, setSkills] = useState("");

  const [loading, setLoading] =
    useState(true);
  const [saving, setSaving] =
    useState(false);
  const [saved, setSaved] =
    useState(false);
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
          router.replace("/login");
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
            data.error ||
              "Failed to load candidate profile."
          );
        }

        /*
         * API artık candidateProfile diye nested
         * bir obje döndürmüyor.
         *
         * Alanlar direkt response üzerinde:
         * data.name
         * data.bio
         * data.skills
         * vs.
         */

        setName(
          data.name ||
            currentUser.name ||
            ""
        );

        setEmail(
          data.email ||
            currentUser.email ||
            ""
        );

        setPhone(data.phone ?? "");
        setLocation(data.location ?? "");
        setBio(data.bio ?? "");

        setExperienceTitle(
          data.experienceTitle ?? ""
        );

        setExperienceYears(
          typeof data.experienceYears ===
            "number"
            ? String(
                data.experienceYears
              )
            : ""
        );

        setSkills(
          normalizeSkills(data.skills)
        );
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load candidate profile."
        );
      } finally {
        setLoading(false);
      }
    }

    loadCandidate();
  }, [router]);

  async function saveProfile() {
    if (!candidateId) {
      setError(
        "Candidate ID could not be found."
      );
      return;
    }

    const trimmedName = name.trim();
    const trimmedEmail = email
      .trim()
      .toLowerCase();

    if (!trimmedName) {
      setError("Name is required.");
      return;
    }

    if (!trimmedEmail) {
      setError("Email is required.");
      return;
    }

    let parsedExperienceYears:
      | number
      | null = null;

    if (experienceYears.trim()) {
      const numericValue = Number(
        experienceYears
      );

      if (
        !Number.isInteger(numericValue) ||
        numericValue < 0
      ) {
        setError(
          "Experience years must be a non-negative whole number."
        );
        return;
      }

      parsedExperienceYears =
        numericValue;
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
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            name: trimmedName,
            email: trimmedEmail,
            phone: phone.trim(),
            location:
              location.trim(),
            bio: bio.trim(),
            experienceTitle:
              experienceTitle.trim(),
            experienceYears:
              parsedExperienceYears,
            skills,
          }),
        }
      );

      const data =
        (await response.json()) as CandidateResponse;

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to save profile."
        );
      }

      const updatedName =
        data.name || trimmedName;

      const updatedEmail =
        data.email || trimmedEmail;

      setName(updatedName);
      setEmail(updatedEmail);
      setPhone(data.phone ?? "");
      setLocation(
        data.location ?? ""
      );
      setBio(data.bio ?? "");
      setExperienceTitle(
        data.experienceTitle ?? ""
      );

      setExperienceYears(
        typeof data.experienceYears ===
          "number"
          ? String(
              data.experienceYears
            )
          : ""
      );

      setSkills(
        normalizeSkills(
          data.skills
        )
      );

      /*
       * Header ve diğer client sayfaları da
       * güncel isim/email görsün.
       */
      const storedUser =
        localStorage.getItem(
          "currentUser"
        );

      if (storedUser) {
        const currentUser =
          JSON.parse(
            storedUser
          ) as CurrentUser;

        localStorage.setItem(
          "currentUser",
          JSON.stringify({
            ...currentUser,
            name: updatedName,
            email: updatedEmail,
          })
        );
      }

      setSaved(true);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to save profile."
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
            Settings
          </h1>

          <p className="mt-2 text-muted-foreground">
            Loading your profile...
          </p>
        </div>
      </div>
    );
  }

return (
    <div className="mx-auto max-w-[1380px] space-y-10">
      <section className="grid gap-8 border-b border-black/15 pb-9 lg:grid-cols-[1fr_360px] lg:items-end">
        <div><p className="tn-index text-[#6d5dfc]">Profile controls / 08</p><h1 className="mt-4 text-5xl font-black tracking-[-.065em] sm:text-6xl">Edit the data behind your professional signal.</h1></div>
        <p className="text-sm leading-6 text-[#66656a]">Changes here update your profile, CV, and the information TALNIVO uses across your candidate workspace.</p>
      </section>

      {saved&&<div className="flex items-center gap-2 border border-black bg-black px-4 py-3 text-sm text-white"><CheckCircle2 className="h-4 w-4"/> Changes saved successfully.</div>}
      {error&&<div className="border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</div>}

      <section className="grid gap-10 lg:grid-cols-[240px_1fr]">
        <div><p className="tn-index text-[#8a898d]">01 / Identity</p><h2 className="mt-3 text-xl font-black tracking-[-.035em]">Personal information</h2><p className="mt-2 text-xs leading-5 text-[#77767a]">Core details visible across your candidate profile.</p></div>
        <div className="grid gap-x-6 gap-y-7 md:grid-cols-2">
          {[
            ["name","Full name",name,setName,"text"],
            ["email","Email",email,setEmail,"email"],
            ["phone","Phone",phone,setPhone,"text"],
            ["location","Location",location,setLocation,"text"],
          ].map(([id,label,value,setter,type])=><div key={id as string}><label htmlFor={id as string} className="text-[10px] font-black uppercase tracking-[.16em] text-[#77767a]">{label as string}</label><input id={id as string} name={id as string} type={type as string} value={value as string} onChange={(event)=>(setter as React.Dispatch<React.SetStateAction<string>>)(event.target.value)} className="mt-2 h-12 w-full border-0 border-b border-black bg-transparent px-0 text-base font-semibold outline-none"/></div>)}
          <div className="md:col-span-2"><label htmlFor="bio" className="text-[10px] font-black uppercase tracking-[.16em] text-[#77767a]">Professional summary</label><textarea id="bio" name="bio" value={bio} onChange={(event)=>setBio(event.target.value)} rows={5} className="mt-2 w-full border border-black/20 bg-white p-4 text-sm leading-6 outline-none"/></div>
        </div>
      </section>

      <section className="grid gap-10 border-t border-black/15 pt-9 lg:grid-cols-[240px_1fr]">
        <div><p className="tn-index text-[#8a898d]">02 / Career</p><h2 className="mt-3 text-xl font-black tracking-[-.035em]">Professional information</h2><p className="mt-2 text-xs leading-5 text-[#77767a]">These fields shape your CV and matching context.</p></div>
        <div className="grid gap-x-6 gap-y-7 md:grid-cols-2">
          <div><label htmlFor="experienceTitle" className="text-[10px] font-black uppercase tracking-[.16em] text-[#77767a]">Experience title</label><input id="experienceTitle" name="experienceTitle" type="text" value={experienceTitle} onChange={(event)=>setExperienceTitle(event.target.value)} placeholder="e.g. Frontend Developer" className="mt-2 h-12 w-full border-0 border-b border-black bg-transparent px-0 text-base font-semibold outline-none"/></div>
          <div><label htmlFor="experienceYears" className="text-[10px] font-black uppercase tracking-[.16em] text-[#77767a]">Years of experience</label><input id="experienceYears" name="experienceYears" type="number" min="0" step="1" value={experienceYears} onChange={(event)=>setExperienceYears(event.target.value)} className="mt-2 h-12 w-full border-0 border-b border-black bg-transparent px-0 text-base font-semibold outline-none"/></div>
          <div className="md:col-span-2"><label htmlFor="skills" className="text-[10px] font-black uppercase tracking-[.16em] text-[#77767a]">Skills</label><textarea id="skills" name="skills" value={skills} onChange={(event)=>setSkills(event.target.value)} rows={3} placeholder="React, TypeScript, Next.js" className="mt-2 w-full border border-black/20 bg-white p-4 text-sm outline-none"/><p className="mt-2 text-[11px] text-[#8a898d]">Separate skills with commas. For easier skill-by-skill editing, use the Skills page.</p></div>
        </div>
      </section>

      <div className="flex flex-col-reverse gap-3 border-t border-black/15 pt-7 sm:flex-row sm:justify-end">
        <button type="button" onClick={()=>router.push("/candidate/profile")} disabled={saving} className="h-11 border border-black/20 px-5 text-xs font-black uppercase tracking-[.12em] disabled:opacity-40">Cancel</button>
        <button type="button" onClick={saveProfile} disabled={saving} className="inline-flex h-11 items-center justify-center gap-2 border border-[#6d5dfc] bg-[#6d5dfc] px-6 text-xs font-black uppercase tracking-[.12em] text-white disabled:opacity-40"><Save className="h-4 w-4"/>{saving?"Saving...":"Save changes"}</button>
      </div>
    </div>
  );
}
