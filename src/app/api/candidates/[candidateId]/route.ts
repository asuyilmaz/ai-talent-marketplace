import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/session";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    candidateId: string;
  }>;
};

type UpdateCandidateRequest = {
  name?: string;
  email?: string;
  bio?: string | null;
  phone?: string | null;
  location?: string | null;
  experienceTitle?: string | null;
  experienceYears?: number | null;
  skills?: string[] | string | null;
};

function parseSkills(skills: string | null | undefined) {
  if (!skills) {
    return [];
  }

  return skills
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);
}

function normalizeSkillsForDatabase(
  skills: string[] | string | null | undefined
) {
  if (Array.isArray(skills)) {
    const normalized = skills
      .map((skill) => skill.trim())
      .filter(Boolean)
      .join(", ");

    return normalized || null;
  }

  if (typeof skills === "string") {
    const normalized = skills
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean)
      .join(", ");

    return normalized || null;
  }

  return null;
}

function formatCandidate(candidate: {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  candidateProfile: {
    bio: string | null;
    phone: string | null;
    location: string | null;
    experienceTitle: string | null;
    experienceYears: number | null;
    skills: string | null;
  } | null;
}) {
  return {
    id: candidate.id,
    name: candidate.name,
    email: candidate.email,

    bio: candidate.candidateProfile?.bio ?? null,
    phone: candidate.candidateProfile?.phone ?? null,
    location: candidate.candidateProfile?.location ?? null,

    experienceTitle:
      candidate.candidateProfile?.experienceTitle ?? null,

    experienceYears:
      candidate.candidateProfile?.experienceYears ?? null,

    skills: parseSkills(
      candidate.candidateProfile?.skills
    ),

    createdAt: candidate.createdAt.toISOString(),
  };
}

export async function GET(
  request: Request,
  context: RouteContext
) {
  try {
    const { candidateId } = await context.params;
    const session = getSessionFromRequest(request);
    if (!session) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    if (session.role === "candidate" && session.userId !== candidateId) return NextResponse.json({ error: "You do not have access to this candidate." }, { status: 403 });

    const candidate = await prisma.user.findUnique({
      where: {
        id: candidateId,
      },
      include: {
        candidateProfile: true,
      },
    });

    if (!candidate) {
      return NextResponse.json(
        {
          error: "Candidate not found.",
        },
        {
          status: 404,
        }
      );
    }

    if (candidate.role !== "CANDIDATE") {
      return NextResponse.json(
        {
          error: "User is not a candidate.",
        },
        {
          status: 403,
        }
      );
    }

    return NextResponse.json(
      formatCandidate(candidate)
    );
  } catch (error) {
    console.error("GET candidate error:", error);

    return NextResponse.json(
      {
        error: "Failed to load candidate.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function PATCH(
  request: Request,
  context: RouteContext
) {
  try {
    const { candidateId } = await context.params;
    const session = getSessionFromRequest(request);
    if (!session) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    if (session.role !== "candidate" || session.userId !== candidateId) return NextResponse.json({ error: "You do not have permission to update this candidate." }, { status: 403 });

    const body =
      (await request.json()) as UpdateCandidateRequest;

    const existingCandidate =
      await prisma.user.findUnique({
        where: {
          id: candidateId,
        },
        include: {
          candidateProfile: true,
        },
      });

    if (!existingCandidate) {
      return NextResponse.json(
        {
          error: "Candidate not found.",
        },
        {
          status: 404,
        }
      );
    }

    if (existingCandidate.role !== "CANDIDATE") {
      return NextResponse.json(
        {
          error: "User is not a candidate.",
        },
        {
          status: 403,
        }
      );
    }

    /*
     * USER FIELDS
     *
     * PATCH is now really partial.
     * Skills page can send ONLY skills without
     * accidentally clearing name/email/profile data.
     */

    const userData: {
      name?: string;
      email?: string;
    } = {};

    if (body.name !== undefined) {
      const name = body.name.trim();

      if (!name) {
        return NextResponse.json(
          {
            error: "Name is required.",
          },
          {
            status: 400,
          }
        );
      }

      userData.name = name;
    }

    if (body.email !== undefined) {
      const email = body.email
        .trim()
        .toLowerCase();

      if (!email) {
        return NextResponse.json(
          {
            error: "Email is required.",
          },
          {
            status: 400,
          }
        );
      }

      const duplicateEmail =
        await prisma.user.findFirst({
          where: {
            email,
            NOT: {
              id: candidateId,
            },
          },
        });

      if (duplicateEmail) {
        return NextResponse.json(
          {
            error: "This email is already in use.",
          },
          {
            status: 409,
          }
        );
      }

      userData.email = email;
    }

    /*
     * CANDIDATE PROFILE FIELDS
     */

    const profileData: {
      bio?: string | null;
      phone?: string | null;
      location?: string | null;
      experienceTitle?: string | null;
      experienceYears?: number | null;
      skills?: string | null;
    } = {};

    if (body.bio !== undefined) {
      profileData.bio =
        body.bio?.trim() || null;
    }

    if (body.phone !== undefined) {
      profileData.phone =
        body.phone?.trim() || null;
    }

    if (body.location !== undefined) {
      profileData.location =
        body.location?.trim() || null;
    }

    if (body.experienceTitle !== undefined) {
      profileData.experienceTitle =
        body.experienceTitle?.trim() || null;
    }

    if (body.experienceYears !== undefined) {
      if (body.experienceYears === null) {
        profileData.experienceYears = null;
      } else {
        if (
          !Number.isInteger(body.experienceYears) ||
          body.experienceYears < 0
        ) {
          return NextResponse.json(
            {
              error:
                "Experience years must be a non-negative whole number.",
            },
            {
              status: 400,
            }
          );
        }

        profileData.experienceYears =
          body.experienceYears;
      }
    }

    if (body.skills !== undefined) {
      profileData.skills =
        normalizeSkillsForDatabase(body.skills);
    }

    /*
     * Update User only when needed.
     */

    if (Object.keys(userData).length > 0) {
      await prisma.user.update({
        where: {
          id: candidateId,
        },
        data: userData,
      });
    }

    /*
     * Update CandidateProfile only when needed.
     *
     * CandidateProfile.skills is a String? field in our
     * current Prisma schema, so it is stored like:
     *
     * "React, TypeScript, Python"
     */

    if (Object.keys(profileData).length > 0) {
      await prisma.candidateProfile.upsert({
        where: {
          userId: candidateId,
        },

        create: {
          userId: candidateId,
          ...profileData,
        },

        update: profileData,
      });
    }

    /*
     * Read it back from PostgreSQL.
     * This guarantees the frontend receives what was
     * actually persisted.
     */

    const updatedCandidate =
      await prisma.user.findUnique({
        where: {
          id: candidateId,
        },
        include: {
          candidateProfile: true,
        },
      });

    if (!updatedCandidate) {
      return NextResponse.json(
        {
          error:
            "Candidate could not be loaded after update.",
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json(
      formatCandidate(updatedCandidate)
    );
  } catch (error) {
    console.error("PATCH candidate error:", error);

    return NextResponse.json(
      {
        error: "Failed to update candidate.",
      },
      {
        status: 500,
      }
    );
  }
}