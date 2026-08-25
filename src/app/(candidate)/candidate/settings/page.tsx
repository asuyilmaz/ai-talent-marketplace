"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Check,
  Save,
} from "lucide-react";
import { candidateProfile } from "@/data/profile";

export default function CandidateSettingsPage() {
  const [name, setName] = useState(candidateProfile.name);
  const [role, setRole] = useState(candidateProfile.role);
  const [email, setEmail] = useState(candidateProfile.email);
  const [location, setLocation] = useState(candidateProfile.location);
  const [about, setAbout] = useState(candidateProfile.about);
  const [careerGoal, setCareerGoal] = useState(
    candidateProfile.careerGoal
  );
  const [experience, setExperience] = useState(
    candidateProfile.experience.title
  );
  const [education, setEducation] = useState(
    candidateProfile.education.program
  );
  const [skills, setSkills] = useState(
    candidateProfile.skills.join(", ")
  );

  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2500);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Edit Profile
        </h1>

        <p className="mt-2 text-muted-foreground">
          Update your professional information and career preferences.
        </p>
      </div>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
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
                  setName(event.target.value)
                }
                className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none transition focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="role"
                className="text-sm font-medium"
              >
                Professional Role
              </label>

              <input
                id="role"
                type="text"
                value={role}
                onChange={(event) =>
                  setRole(event.target.value)
                }
                className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none transition focus:ring-2 focus:ring-ring"
              />
            </div>
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
                setEmail(event.target.value)
              }
              className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none transition focus:ring-2 focus:ring-ring"
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
                setLocation(event.target.value)
              }
              className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none transition focus:ring-2 focus:ring-ring"
            />
          </div>
        </CardContent>
      </Card>

      {/* Professional Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Professional Summary</CardTitle>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="space-y-2">
            <label
              htmlFor="about"
              className="text-sm font-medium"
            >
              About Me
            </label>

            <textarea
              id="about"
              value={about}
              onChange={(event) =>
                setAbout(event.target.value)
              }
              rows={5}
              className="w-full resize-none rounded-md border bg-background px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="careerGoal"
              className="text-sm font-medium"
            >
              Career Goal
            </label>

            <textarea
              id="careerGoal"
              value={careerGoal}
              onChange={(event) =>
                setCareerGoal(event.target.value)
              }
              rows={5}
              className="w-full resize-none rounded-md border bg-background px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-ring"
            />
          </div>
        </CardContent>
      </Card>

      {/* Career Information */}
      <Card>
        <CardHeader>
          <CardTitle>Career Information</CardTitle>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="space-y-2">
            <label
              htmlFor="experience"
              className="text-sm font-medium"
            >
              Experience
            </label>

            <input
              id="experience"
              type="text"
              value={experience}
              onChange={(event) =>
                setExperience(event.target.value)
              }
              className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none transition focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="education"
              className="text-sm font-medium"
            >
              Education
            </label>

            <input
              id="education"
              type="text"
              value={education}
              onChange={(event) =>
                setEducation(event.target.value)
              }
              className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none transition focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="skills"
              className="text-sm font-medium"
            >
              Skills
            </label>

            <input
              id="skills"
              type="text"
              value={skills}
              onChange={(event) =>
                setSkills(event.target.value)
              }
              className="h-10 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-ring"
            />

            <p className="text-xs text-muted-foreground">
              Separate your skills with commas.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <Button variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Cancel
        </Button>

        <Button onClick={handleSave}>
          {saved ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Changes Saved
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  );
}