import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/session";
import {
  calculateSkillMatch,
  parseStoredSkills,
} from "@/lib/skill-match";

export const runtime = "nodejs";

type ApplicationStatus =
  | "APPLIED"
  | "REVIEWING"
  | "INTERVIEW"
  | "OFFER"
  | "HIRED"
  | "REJECTED";

type CreateApplicationRequest = {
  candidateId?: string;
  jobId?: string;
};

type UpdateApplicationRequest = {
  applicationId?: string;
  employerId?: string;
  status?: string;
};

function formatApplicationStatus(status: ApplicationStatus) {
  switch (status) {
    case "REVIEWING":
      return "Reviewing";
    case "INTERVIEW":
      return "Interview";
    case "OFFER":
      return "Offer";
    case "HIRED":
      return "Hired";
    case "REJECTED":
      return "Rejected";
    case "APPLIED":
    default:
      return "Applied";
  }
}

function parseApplicationStatus(
  status: string
): ApplicationStatus | null {
  switch (status) {
    case "Applied":
    case "APPLIED":
      return "APPLIED";
    case "Reviewing":
    case "REVIEWING":
      return "REVIEWING";
    case "Interview":
    case "INTERVIEW":
      return "INTERVIEW";
    case "Offer":
    case "OFFER":
      return "OFFER";
    case "Hired":
    case "HIRED":
      return "HIRED";
    case "Rejected":
    case "REJECTED":
      return "REJECTED";
    default:
      return null;
  }
}

function getJobSkills(
  skills: { skill: { name: string } }[]
) {
  return skills.map((item) => item.skill.name);
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const candidateId = searchParams.get("candidateId");
    const employerId = searchParams.get("employerId");
    const session = getSessionFromRequest(request);
    if (!session) return NextResponse.json({ message: "Not authenticated." }, { status: 401 });

    if (candidateId) {
      if (session.role !== "candidate" || session.userId !== candidateId) return NextResponse.json({ message: "You do not have access to these applications." }, { status: 403 });
      const candidate = await prisma.user.findUnique({
        where: { id: candidateId },
        include: { candidateProfile: true },
      });

      if (!candidate) {
        return NextResponse.json(
          { message: "Candidate not found." },
          { status: 404 }
        );
      }

      if (candidate.role !== "CANDIDATE") {
        return NextResponse.json(
          {
            message:
              "Only candidate accounts can view candidate applications.",
          },
          { status: 403 }
        );
      }

      const candidateSkills = parseStoredSkills(
        candidate.candidateProfile?.skills
      );

      const applications = await prisma.application.findMany({
        where: { candidateId },
        include: {
          job: {
            include: {
              company: true,
              skills: {
                include: { skill: true },
              },
            },
          },
        },
        orderBy: { appliedAt: "desc" },
      });

      return NextResponse.json(
        {
          applications: applications.map((application) => {
            const jobSkills = getJobSkills(application.job.skills);
            const matchScore = calculateSkillMatch(
              candidateSkills,
              jobSkills
            );

            return {
              id: application.id,
              candidateId: application.candidateId,
              candidate: candidate.name,
              jobId: application.jobId,
              role: application.job.title,
              company: application.job.company.name,
              matchScore,
              status: formatApplicationStatus(application.status),
              experience:
                candidate.candidateProfile?.experienceTitle ??
                "Not specified",
              skills: jobSkills,
              appliedAt: application.appliedAt.toISOString(),
            };
          }),
        },
        { status: 200 }
      );
    }

    if (employerId) {
      if (session.role !== "employer" || session.userId !== employerId) return NextResponse.json({ message: "You do not have access to these applications." }, { status: 403 });
      const employer = await prisma.user.findUnique({
        where: { id: employerId },
        include: { company: true },
      });

      if (!employer) {
        return NextResponse.json(
          { message: "Employer not found." },
          { status: 404 }
        );
      }

      if (employer.role !== "EMPLOYER") {
        return NextResponse.json(
          {
            message:
              "Only employer accounts can view employer applications.",
          },
          { status: 403 }
        );
      }

      if (!employer.company) {
        return NextResponse.json(
          { message: "Employer company not found." },
          { status: 404 }
        );
      }

      const applications = await prisma.application.findMany({
        where: {
          job: { companyId: employer.company.id },
        },
        include: {
          candidate: {
            include: { candidateProfile: true },
          },
          job: {
            include: {
              company: true,
              skills: {
                include: { skill: true },
              },
            },
          },
        },
        orderBy: { appliedAt: "desc" },
      });

      return NextResponse.json(
        {
          applications: applications.map((application) => {
            const candidateSkills = parseStoredSkills(
              application.candidate.candidateProfile?.skills
            );
            const jobSkills = getJobSkills(application.job.skills);
            const matchScore = calculateSkillMatch(
              candidateSkills,
              jobSkills
            );

            return {
              id: application.id,
              candidateId: application.candidateId,
              candidate: application.candidate.name,
              jobId: application.jobId,
              role: application.job.title,
              company: application.job.company.name,
              matchScore,
              status: formatApplicationStatus(application.status),
              experience:
                application.candidate.candidateProfile
                  ?.experienceTitle ?? "Not specified",
              skills: candidateSkills,
              appliedAt: application.appliedAt.toISOString(),
            };
          }),
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { message: "Candidate ID or employer ID is required." },
      { status: 400 }
    );
  } catch (error) {
    console.error("Get applications error:", error);

    return NextResponse.json(
      {
        message:
          "Something went wrong while loading applications.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = getSessionFromRequest(request);
    if (!session) return NextResponse.json({ message: "Not authenticated." }, { status: 401 });
    if (session.role !== "candidate") return NextResponse.json({ message: "Only candidates can apply for jobs." }, { status: 403 });
    const body =
      (await request.json()) as CreateApplicationRequest;

    const requestedCandidateId = body.candidateId?.trim();
    if (requestedCandidateId && requestedCandidateId !== session.userId) return NextResponse.json({ message: "You cannot apply as another candidate." }, { status: 403 });
    const candidateId = session.userId;
    const jobId = body.jobId?.trim();

    if (!candidateId || !jobId) {
      return NextResponse.json(
        { message: "Candidate ID and job ID are required." },
        { status: 400 }
      );
    }

    const candidate = await prisma.user.findUnique({
      where: { id: candidateId },
      include: { candidateProfile: true },
    });

    if (!candidate) {
      return NextResponse.json(
        { message: "Candidate not found." },
        { status: 404 }
      );
    }

    if (candidate.role !== "CANDIDATE") {
      return NextResponse.json(
        { message: "Only candidate accounts can apply for jobs." },
        { status: 403 }
      );
    }

    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        company: true,
        skills: {
          include: { skill: true },
        },
      },
    });

    if (!job || !job.published) {
      return NextResponse.json(
        { message: "Job not found." },
        { status: 404 }
      );
    }

    const existingApplication =
      await prisma.application.findUnique({
        where: {
          candidateId_jobId: { candidateId, jobId },
        },
      });

    if (existingApplication) {
      return NextResponse.json(
        {
          message: "You have already applied to this job.",
          application: existingApplication,
        },
        { status: 409 }
      );
    }

    const candidateSkills = parseStoredSkills(
      candidate.candidateProfile?.skills
    );
    const jobSkills = getJobSkills(job.skills);
    const matchScore = calculateSkillMatch(
      candidateSkills,
      jobSkills
    );

    const application = await prisma.application.create({
      data: {
        candidateId,
        jobId,
        status: "APPLIED",
        matchScore,
      },
    });

    return NextResponse.json(
      {
        message: "Application submitted successfully.",
        application: {
          id: application.id,
          jobId: application.jobId,
          role: job.title,
          company: job.company.name,
          status: "Applied",
          matchScore,
          appliedAt: application.appliedAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create application error:", error);

    return NextResponse.json(
      {
        message:
          "Something went wrong while submitting the application.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = getSessionFromRequest(request);
    if (!session) return NextResponse.json({ message: "Not authenticated." }, { status: 401 });
    if (session.role !== "employer") return NextResponse.json({ message: "Only employers can update applications." }, { status: 403 });
    const body =
      (await request.json()) as UpdateApplicationRequest;

    const applicationId = body.applicationId?.trim();
    const requestedEmployerId = body.employerId?.trim();
    if (requestedEmployerId && requestedEmployerId !== session.userId) return NextResponse.json({ message: "You cannot update applications as another employer." }, { status: 403 });
    const employerId = session.userId;
    const requestedStatus = body.status?.trim();

    if (!applicationId || !employerId || !requestedStatus) {
      return NextResponse.json(
        {
          message:
            "Application ID, employer ID and status are required.",
        },
        { status: 400 }
      );
    }

    const status = parseApplicationStatus(requestedStatus);

    if (!status) {
      return NextResponse.json(
        { message: "Invalid application status." },
        { status: 400 }
      );
    }

    const employer = await prisma.user.findUnique({
      where: { id: employerId },
      include: { company: true },
    });

    if (!employer) {
      return NextResponse.json(
        { message: "Employer not found." },
        { status: 404 }
      );
    }

    if (employer.role !== "EMPLOYER") {
      return NextResponse.json(
        {
          message:
            "Only employer accounts can update applications.",
        },
        { status: 403 }
      );
    }

    if (!employer.company) {
      return NextResponse.json(
        { message: "Employer company not found." },
        { status: 404 }
      );
    }

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { job: true },
    });

    if (!application) {
      return NextResponse.json(
        { message: "Application not found." },
        { status: 404 }
      );
    }

    if (application.job.companyId !== employer.company.id) {
      return NextResponse.json(
        {
          message:
            "You do not have permission to update this application.",
        },
        { status: 403 }
      );
    }

    const updatedApplication = await prisma.application.update({
      where: { id: applicationId },
      data: { status },
    });

    return NextResponse.json(
      {
        message: "Application status updated successfully.",
        application: {
          id: updatedApplication.id,
          status: formatApplicationStatus(
            updatedApplication.status
          ),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update application status error:", error);

    return NextResponse.json(
      {
        message:
          "Something went wrong while updating the application.",
      },
      { status: 500 }
    );
  }
}
