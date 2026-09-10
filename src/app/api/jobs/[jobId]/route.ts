import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/session";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ jobId: string }>;
};

type UpdateJobRequest = {
  employerId?: string;
  title?: string;
  description?: string;
  skills?: string[];
  workType?: "Remote" | "Hybrid" | "On-site";
  employmentType?: "Full-time" | "Part-time" | "Contract";
  status?: "Published" | "Draft";
};

function mapWorkType(
  workType: UpdateJobRequest["workType"]
) {
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
  employmentType: UpdateJobRequest["employmentType"]
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

function formatJob(job: {
  id: string;
  title: string;
  description: string | null;
  published: boolean;
  workType: "REMOTE" | "HYBRID" | "ONSITE";
  employmentType: "FULL_TIME" | "PART_TIME" | "CONTRACT";
  company: {
    id: string;
    name: string;
  };
  skills: {
    skill: {
      name: string;
    };
  }[];
  _count: {
    applications: number;
  };
}) {
  return {
    id: job.id,
    title: job.title,
    description: job.description ?? "",
    company: job.company.name,
    companyId: job.company.id,
    skills: job.skills.map((item) => item.skill.name),
    workType: formatWorkType(job.workType),
    employmentType: formatEmploymentType(job.employmentType),
    applications: job._count.applications,
    status: job.published ? "Published" : "Draft",
  };
}

const jobInclude = {
  company: true,
  skills: {
    include: {
      skill: true,
    },
  },
  _count: {
    select: {
      applications: true,
    },
  },
} as const;

async function getEmployerCompany(employerId: string) {
  const employer = await prisma.user.findUnique({
    where: {
      id: employerId,
    },
    include: {
      company: true,
    },
  });

  if (!employer || employer.role !== "EMPLOYER" || !employer.company) {
    return null;
  }

  return employer.company;
}

export async function GET(
  request: Request,
  context: RouteContext
) {
  try {
    const { jobId } = await context.params;
    const { searchParams } = new URL(request.url);
    const employerId = searchParams.get("employerId")?.trim();

    if (!jobId) {
      return NextResponse.json(
        { message: "Job ID is required." },
        { status: 400 }
      );
    }

    const job = await prisma.job.findUnique({
      where: {
        id: jobId,
      },
      include: jobInclude,
    });

    if (!job) {
      return NextResponse.json(
        { message: "Job not found." },
        { status: 404 }
      );
    }

    if (employerId) {
      const session = getSessionFromRequest(request);
      if (!session) return NextResponse.json({ message: "Not authenticated." }, { status: 401 });
      if (session.role !== "employer" || session.userId !== employerId) return NextResponse.json({ message: "You do not have access to this job." }, { status: 403 });
      const company = await getEmployerCompany(employerId);

      if (!company || company.id !== job.companyId) {
        return NextResponse.json(
          { message: "You do not have access to this job." },
          { status: 403 }
        );
      }
    } else if (!job.published) {
      return NextResponse.json(
        { message: "Job not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { job: formatJob(job) },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get job details error:", error);

    return NextResponse.json(
      { message: "Something went wrong while loading the job." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  context: RouteContext
) {
  try {
    const { jobId } = await context.params;
    const body = (await request.json()) as UpdateJobRequest;

    const employerId = body.employerId?.trim();
    const session = getSessionFromRequest(request);
    if (!session) return NextResponse.json({ message: "Not authenticated." }, { status: 401 });
    if (session.role !== "employer" || (employerId && session.userId !== employerId)) return NextResponse.json({ message: "You do not have permission to edit this job." }, { status: 403 });
    const title = body.title?.trim();
    const description = body.description?.trim();
    const skills = Array.isArray(body.skills)
      ? body.skills.map((skill) => skill.trim()).filter(Boolean)
      : [];

    if (
      !jobId ||
      !employerId ||
      !title ||
      !description ||
      skills.length === 0
    ) {
      return NextResponse.json(
        {
          message:
            "Employer, title, description and at least one skill are required.",
        },
        { status: 400 }
      );
    }

    const company = await getEmployerCompany(employerId);

    if (!company) {
      return NextResponse.json(
        { message: "Employer company profile was not found." },
        { status: 403 }
      );
    }

    const existingJob = await prisma.job.findUnique({
      where: {
        id: jobId,
      },
      select: {
        companyId: true,
      },
    });

    if (!existingJob) {
      return NextResponse.json(
        { message: "Job not found." },
        { status: 404 }
      );
    }

    if (existingJob.companyId !== company.id) {
      return NextResponse.json(
        { message: "You do not have permission to edit this job." },
        { status: 403 }
      );
    }

    const uniqueSkills = Array.from(
      new Map(
        skills.map((skill) => [skill.toLowerCase(), skill])
      ).values()
    );

    const job = await prisma.job.update({
      where: {
        id: jobId,
      },
      data: {
        title,
        description,
        workType: mapWorkType(body.workType),
        employmentType: mapEmploymentType(body.employmentType),
        published: body.status !== "Draft",
        skills: {
          deleteMany: {},
          create: uniqueSkills.map((skillName) => ({
            skill: {
              connectOrCreate: {
                where: {
                  name: skillName.toLowerCase(),
                },
                create: {
                  name: skillName.toLowerCase(),
                },
              },
            },
          })),
        },
      },
      include: jobInclude,
    });

    return NextResponse.json(
      {
        message: "Job updated successfully.",
        job: formatJob(job),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update job error:", error);

    return NextResponse.json(
      { message: "Something went wrong while updating the job." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: RouteContext
) {
  try {
    const { jobId } = await context.params;
    const { searchParams } = new URL(request.url);
    const employerId = searchParams.get("employerId")?.trim();
    const session = getSessionFromRequest(request);
    if (!session) return NextResponse.json({ message: "Not authenticated." }, { status: 401 });
    if (session.role !== "employer" || (employerId && session.userId !== employerId)) return NextResponse.json({ message: "You do not have permission to delete this job." }, { status: 403 });

    if (!jobId || !employerId) {
      return NextResponse.json(
        { message: "Job ID and employer ID are required." },
        { status: 400 }
      );
    }

    const company = await getEmployerCompany(employerId);

    if (!company) {
      return NextResponse.json(
        { message: "Employer company profile was not found." },
        { status: 403 }
      );
    }

    const existingJob = await prisma.job.findUnique({
      where: {
        id: jobId,
      },
      select: {
        companyId: true,
      },
    });

    if (!existingJob) {
      return NextResponse.json(
        { message: "Job not found." },
        { status: 404 }
      );
    }

    if (existingJob.companyId !== company.id) {
      return NextResponse.json(
        { message: "You do not have permission to delete this job." },
        { status: 403 }
      );
    }

    await prisma.job.delete({
      where: {
        id: jobId,
      },
    });

    return NextResponse.json(
      { message: "Job deleted successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete job error:", error);

    return NextResponse.json(
      { message: "Something went wrong while deleting the job." },
      { status: 500 }
    );
  }
}
