import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/session";
import {
  calculateSkillMatch,
  parseStoredSkills,
} from "@/lib/skill-match";

export const runtime = "nodejs";

type CreateJobRequest = {
  userId?: string;
  title?: string;
  description?: string;
  skills?: string[];
  workType?: "Remote" | "Hybrid" | "On-site";
  employmentType?: "Full-time" | "Part-time" | "Contract";
};

function mapWorkType(workType: CreateJobRequest["workType"]) {
  switch (workType) {
    case "Hybrid":
      return "HYBRID" as const;
    case "On-site":
      return "ONSITE" as const;
    case "Remote":
    default:
      return "REMOTE" as const;
  }
}

function mapEmploymentType(
  employmentType: CreateJobRequest["employmentType"]
) {
  switch (employmentType) {
    case "Part-time":
      return "PART_TIME" as const;
    case "Contract":
      return "CONTRACT" as const;
    case "Full-time":
    default:
      return "FULL_TIME" as const;
  }
}

function formatWorkType(
  workType: "REMOTE" | "HYBRID" | "ONSITE"
) {
  switch (workType) {
    case "HYBRID":
      return "Hybrid";
    case "ONSITE":
      return "On-site";
    case "REMOTE":
    default:
      return "Remote";
  }
}

function formatEmploymentType(
  employmentType: "FULL_TIME" | "PART_TIME" | "CONTRACT"
) {
  switch (employmentType) {
    case "PART_TIME":
      return "Part-time";
    case "CONTRACT":
      return "Contract";
    case "FULL_TIME":
    default:
      return "Full-time";
  }
}

type JobForFormatting = {
  id: string;
  title: string;
  description: string | null;
  published: boolean;
  workType: "REMOTE" | "HYBRID" | "ONSITE";
  employmentType: "FULL_TIME" | "PART_TIME" | "CONTRACT";
  company: { name: string };
  skills: { skill: { name: string } }[];
  _count: { applications: number };
};

function formatJob(job: JobForFormatting, matchRate = 0) {
  return {
    id: job.id,
    title: job.title,
    description: job.description ?? "",
    company: job.company.name,
    skills: job.skills.map((item) => item.skill.name),
    workType: formatWorkType(job.workType),
    employmentType: formatEmploymentType(job.employmentType),
    applications: job._count.applications,
    matchRate,
    status: job.published ? "Published" : "Draft",
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (userId) {
      const session = getSessionFromRequest(request);
      if (!session) return NextResponse.json({ message: "Not authenticated." }, { status: 401 });
      if (session.role !== "employer" || session.userId !== userId) return NextResponse.json({ message: "You do not have access to these jobs." }, { status: 403 });
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { company: true },
      });

      if (!user) {
        return NextResponse.json(
          { message: "User not found." },
          { status: 404 }
        );
      }

      if (user.role !== "EMPLOYER") {
        return NextResponse.json(
          { message: "Only employers can view employer jobs." },
          { status: 403 }
        );
      }

      if (!user.company) {
        return NextResponse.json(
          {
            message: "Employer company profile was not found.",
          },
          { status: 400 }
        );
      }

      const jobs = await prisma.job.findMany({
        where: { companyId: user.company.id },
        include: {
          company: true,
          skills: {
            include: { skill: true },
          },
          applications: {
            include: {
              candidate: {
                include: { candidateProfile: true },
              },
            },
          },
          _count: {
            select: { applications: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      const formattedJobs = jobs.map((job) => {
        const jobSkills = job.skills.map(
          (item) => item.skill.name
        );

        const scores = job.applications.map((application) =>
          calculateSkillMatch(
            parseStoredSkills(
              application.candidate.candidateProfile?.skills
            ),
            jobSkills
          )
        );

        const matchRate =
          scores.length > 0
            ? Math.round(
                scores.reduce((sum, score) => sum + score, 0) /
                  scores.length
              )
            : 0;

        return formatJob(job, matchRate);
      });

      return NextResponse.json(
        { jobs: formattedJobs },
        { status: 200 }
      );
    }

    const jobs = await prisma.job.findMany({
      where: { published: true },
      include: {
        company: true,
        skills: {
          include: { skill: true },
        },
        _count: {
          select: { applications: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      { jobs: jobs.map((job) => formatJob(job)) },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get jobs error:", error);

    return NextResponse.json(
      {
        message: "Something went wrong while loading jobs.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = getSessionFromRequest(request);
    if (!session) return NextResponse.json({ message: "Not authenticated." }, { status: 401 });
    if (session.role !== "employer") return NextResponse.json({ message: "Only employers can create job postings." }, { status: 403 });
    const body = (await request.json()) as CreateJobRequest;

    const requestedUserId = body.userId?.trim();
    if (requestedUserId && requestedUserId !== session.userId) return NextResponse.json({ message: "You do not have permission to create jobs for another employer." }, { status: 403 });
    const userId = session.userId;
    const title = body.title?.trim();
    const description = body.description?.trim();

    const skills = Array.isArray(body.skills)
      ? body.skills
          .map((skill) => skill.trim())
          .filter(Boolean)
      : [];

    if (!userId || !title || !description || skills.length === 0) {
      return NextResponse.json(
        {
          message:
            "User, title, description and skills are required.",
        },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { company: true },
    });

    if (!user) {
      return NextResponse.json(
        { message: "User not found." },
        { status: 404 }
      );
    }

    if (user.role !== "EMPLOYER") {
      return NextResponse.json(
        { message: "Only employers can create job postings." },
        { status: 403 }
      );
    }

    if (!user.company) {
      return NextResponse.json(
        {
          message: "Employer company profile was not found.",
        },
        { status: 400 }
      );
    }

    const uniqueSkillNames = [
      ...new Set(skills.map((skill) => skill.toLowerCase())),
    ];

    const job = await prisma.job.create({
      data: {
        companyId: user.company.id,
        title,
        description,
        workType: mapWorkType(body.workType),
        employmentType: mapEmploymentType(body.employmentType),
        published: true,
        skills: {
          create: uniqueSkillNames.map((skillName) => ({
            skill: {
              connectOrCreate: {
                where: { name: skillName },
                create: { name: skillName },
              },
            },
          })),
        },
      },
      include: {
        company: true,
        skills: {
          include: { skill: true },
        },
        _count: {
          select: { applications: true },
        },
      },
    });

    return NextResponse.json(
      {
        message: "Job created successfully.",
        job: formatJob(job),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create job error:", error);

    return NextResponse.json(
      {
        message: "Something went wrong while creating the job.",
      },
      { status: 500 }
    );
  }
}
