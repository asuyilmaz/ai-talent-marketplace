"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Save } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Profile Settings
        </h1>

        <p className="mt-2 text-muted-foreground">
          Update the information shown
          in your candidate profile and CV.
        </p>
      </div>

      {saved && (
        <div className="flex items-center gap-2 rounded-md border px-4 py-3 text-sm">
          <CheckCircle2 className="h-4 w-4" />
          Changes saved successfully.
        </div>
      )}

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>
            Personal Information
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="text-sm font-medium"
              >
                Full Name
              </label>

              <input
                id="name"
                type="text"
                value={name}
                onChange={(event) =>
                  setName(
                    event.target.value
                  )
                }
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(
                    event.target.value
                  )
                }
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="phone"
                className="text-sm font-medium"
              >
                Phone
              </label>

              <input
                id="phone"
                type="text"
                value={phone}
                onChange={(event) =>
                  setPhone(
                    event.target.value
                  )
                }
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="location"
                className="text-sm font-medium"
              >
                Location
              </label>

              <input
                id="location"
                type="text"
                value={location}
                onChange={(event) =>
                  setLocation(
                    event.target.value
                  )
                }
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="bio"
              className="text-sm font-medium"
            >
              Professional Summary
            </label>

            <textarea
              id="bio"
              value={bio}
              onChange={(event) =>
                setBio(
                  event.target.value
                )
              }
              rows={5}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Professional Information
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <label
                htmlFor="experienceTitle"
                className="text-sm font-medium"
              >
                Experience Title
              </label>

              <input
                id="experienceTitle"
                type="text"
                value={
                  experienceTitle
                }
                onChange={(event) =>
                  setExperienceTitle(
                    event.target.value
                  )
                }
                placeholder="e.g. Frontend Developer"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="experienceYears"
                className="text-sm font-medium"
              >
                Years of Experience
              </label>

              <input
                id="experienceYears"
                type="number"
                min="0"
                step="1"
                value={
                  experienceYears
                }
                onChange={(event) =>
                  setExperienceYears(
                    event.target.value
                  )
                }
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="skills"
              className="text-sm font-medium"
            >
              Skills
            </label>

            <textarea
              id="skills"
              value={skills}
              onChange={(event) =>
                setSkills(
                  event.target.value
                )
              }
              rows={3}
              placeholder="React, TypeScript, Next.js"
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none"
            />

            <p className="text-xs text-muted-foreground">
              Separate skills with commas.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            router.push(
              "/candidate/profile"
            )
          }
          disabled={saving}
        >
          Cancel
        </Button>

        <Button
          type="button"
          onClick={saveProfile}
          disabled={saving}
        >
          <Save className="mr-2 h-4 w-4" />

          {saving
            ? "Saving..."
            : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}