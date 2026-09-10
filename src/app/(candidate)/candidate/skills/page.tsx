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

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Skills
          </h1>

          <p className="mt-2 text-muted-foreground">
            Add the technologies and professional
            skills you want employers to see.
          </p>
        </div>

        <Link
          href="/candidate/profile"
          className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Profile
        </Link>
      </div>

      {saved && (
        <div className="flex items-center gap-2 rounded-md border px-4 py-3 text-sm">
          <CheckCircle2 className="h-4 w-4" />
          Skills updated successfully.
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
            Add Skill
          </CardTitle>

          <p className="text-sm text-muted-foreground">
            Enter one skill at a time.
          </p>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              value={newSkill}
              onChange={(event) => {
                setNewSkill(
                  event.target.value
                );
                setError("");
              }}
              onKeyDown={handleKeyDown}
              placeholder="e.g. React"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground"
            />

            <Button
              type="button"
              onClick={addSkill}
              disabled={
                !newSkill.trim() ||
                saving ||
                deletingSkill !== null
              }
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Skill
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle>
                Your Skills
              </CardTitle>

              <p className="mt-1 text-sm text-muted-foreground">
                {skills.length} skill
                {skills.length === 1 ? "" : "s"}{" "}
                in your profile.
              </p>
            </div>

            <Badge variant="secondary">
              {skills.length} total
            </Badge>
          </div>
        </CardHeader>

        <CardContent>
          {sortedSkills.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {sortedSkills.map(
                (skill) => (
                  <div
                    key={skill}
                    className="flex items-center justify-between gap-3 rounded-lg border p-3"
                  >
                    <span className="text-sm font-medium">
                      {skill}
                    </span>

                    <Button
                      type="button"
                      variant="ghost"
                      className="h-9 w-9 p-0"
                      disabled={
                        deletingSkill !== null ||
                        saving
                      }
                      onClick={() =>
                        removeSkill(skill)
                      }
                      aria-label={`Remove ${skill}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )
              )}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <p className="font-medium">
                No skills added yet
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                Add your first skill above
                and save your changes.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          type="button"
          onClick={saveSkills}
          disabled={
            saving ||
            deletingSkill !== null
          }
        >
          <Save className="mr-2 h-4 w-4" />

          {saving
            ? "Saving..."
            : "Save Skills"}
        </Button>
      </div>
    </div>
  );
}