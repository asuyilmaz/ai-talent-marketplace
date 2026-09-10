import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/session";

export const runtime = "nodejs";

function parseSkills(
  skills: string | null | undefined
): string[] {
  if (!skills) {
    return [];
  }

  return skills
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);
}

export async function GET(request: Request) {
  try {
    const session = getSessionFromRequest(request);
    if (!session) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    if (session.role !== "employer") return NextResponse.json({ error: "Only employers can view candidates." }, { status: 403 });
    const candidates =
      await prisma.user.findMany({
        where: {
          role: "CANDIDATE",
        },
        include: {
          candidateProfile: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

    return NextResponse.json({
      candidates: candidates.map(
        (candidate) => ({
          id: candidate.id,
          name: candidate.name,
          email: candidate.email,

          bio:
            candidate.candidateProfile
              ?.bio ?? null,

          phone:
            candidate.candidateProfile
              ?.phone ?? null,

          location:
            candidate.candidateProfile
              ?.location ?? null,

          experienceTitle:
            candidate.candidateProfile
              ?.experienceTitle ?? null,

          experienceYears:
            candidate.candidateProfile
              ?.experienceYears ?? null,

          skills: parseSkills(
            candidate.candidateProfile
              ?.skills
          ),

          createdAt:
            candidate.createdAt.toISOString(),
        })
      ),
    });
  } catch (error) {
    console.error(
      "GET candidates error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to load candidates.",
      },
      {
        status: 500,
      }
    );
  }
}