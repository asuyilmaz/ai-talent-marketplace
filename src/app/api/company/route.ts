import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/session";

export const runtime = "nodejs";

type UpdateCompanyRequest = {
  employerId?: string;
  employerName?: string;
  employerEmail?: string;
  name?: string;
  description?: string | null;
  website?: string | null;
  location?: string | null;
  logoUrl?: string | null;
};

function formatCompany(
  company: {
    id: string;
    ownerId: string;
    name: string;
    description: string | null;
    website: string | null;
    location: string | null;
    logoUrl: string | null;
    createdAt: Date;
    updatedAt: Date;
  },
  owner: {
    name: string;
    email: string;
  },
  openPositions: number
) {
  return {
    id: company.id,
    ownerId: company.ownerId,
    name: company.name,
    description: company.description,
    website: company.website,
    location: company.location,
    logoUrl: company.logoUrl,
    employerName: owner.name,
    email: owner.email,
    openPositions,
    createdAt: company.createdAt.toISOString(),
    updatedAt: company.updatedAt.toISOString(),
  };
}

export async function GET(request: NextRequest) {
  try {
    const session = getSessionFromRequest(request);
    if (!session) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    if (session.role !== "employer") return NextResponse.json({ error: "Only employers can access company settings." }, { status: 403 });
    const requestedEmployerId =
      request.nextUrl.searchParams.get("employerId")?.trim();

    if (
      requestedEmployerId &&
      requestedEmployerId !== session.userId
    ) {
      return NextResponse.json(
        { error: "You do not have access to this company." },
        { status: 403 }
      );
    }

    const employerId = session.userId;

    const employer = await prisma.user.findUnique({
      where: {
        id: employerId,
      },
      include: {
        company: {
          include: {
            _count: {
              select: {
                jobs: {
                  where: {
                    published: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!employer) {
      return NextResponse.json(
        { error: "Employer not found." },
        { status: 404 }
      );
    }

    if (employer.role !== "EMPLOYER") {
      return NextResponse.json(
        { error: "User is not an employer." },
        { status: 403 }
      );
    }

    if (!employer.company) {
      return NextResponse.json(
        { error: "Company profile not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      formatCompany(
        employer.company,
        {
          name: employer.name,
          email: employer.email,
        },
        employer.company._count.jobs
      )
    );
  } catch (error) {
    console.error("GET company error:", error);

    return NextResponse.json(
      { error: "Failed to load company." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body =
      (await request.json()) as UpdateCompanyRequest;

    const requestedEmployerId = body.employerId?.trim();
    const session = getSessionFromRequest(request);

    if (!session) {
      return NextResponse.json(
        { error: "Not authenticated." },
        { status: 401 }
      );
    }

    if (session.role !== "employer") {
      return NextResponse.json(
        { error: "You do not have permission to update this company." },
        { status: 403 }
      );
    }

    if (
      requestedEmployerId &&
      requestedEmployerId !== session.userId
    ) {
      return NextResponse.json(
        { error: "You do not have permission to update this company." },
        { status: 403 }
      );
    }

    const employerId = session.userId;

    const employer = await prisma.user.findUnique({
      where: {
        id: employerId,
      },
      include: {
        company: true,
      },
    });

    if (!employer) {
      return NextResponse.json(
        { error: "Employer not found." },
        { status: 404 }
      );
    }

    if (employer.role !== "EMPLOYER") {
      return NextResponse.json(
        { error: "User is not an employer." },
        { status: 403 }
      );
    }

    if (!employer.company) {
      return NextResponse.json(
        { error: "Company profile not found." },
        { status: 404 }
      );
    }

    const userData: {
      name?: string;
      email?: string;
    } = {};

    if (body.employerName !== undefined) {
      const employerName =
        body.employerName.trim();

      if (!employerName) {
        return NextResponse.json(
          { error: "Employer name is required." },
          { status: 400 }
        );
      }

      userData.name = employerName;
    }

    if (body.employerEmail !== undefined) {
      const employerEmail =
        body.employerEmail.trim().toLowerCase();

      if (!employerEmail) {
        return NextResponse.json(
          { error: "Employer email is required." },
          { status: 400 }
        );
      }

      const emailOwner = await prisma.user.findUnique({
        where: {
          email: employerEmail,
        },
        select: {
          id: true,
        },
      });

      if (
        emailOwner &&
        emailOwner.id !== employerId
      ) {
        return NextResponse.json(
          { error: "This email is already in use." },
          { status: 409 }
        );
      }

      userData.email = employerEmail;
    }

    const companyData: {
      name?: string;
      description?: string | null;
      website?: string | null;
      location?: string | null;
      logoUrl?: string | null;
    } = {};

    if (body.name !== undefined) {
      const companyName = body.name.trim();

      if (!companyName) {
        return NextResponse.json(
          { error: "Company name is required." },
          { status: 400 }
        );
      }

      companyData.name = companyName;
    }

    if (body.description !== undefined) {
      companyData.description =
        body.description?.trim() || null;
    }

    if (body.website !== undefined) {
      companyData.website =
        body.website?.trim() || null;
    }

    if (body.location !== undefined) {
      companyData.location =
        body.location?.trim() || null;
    }

    if (body.logoUrl !== undefined) {
      companyData.logoUrl =
        body.logoUrl?.trim() || null;
    }

    if (Object.keys(userData).length > 0) {
      await prisma.user.update({
        where: {
          id: employerId,
        },
        data: userData,
      });
    }

    if (Object.keys(companyData).length > 0) {
      await prisma.company.update({
        where: {
          id: employer.company.id,
        },
        data: companyData,
      });
    }

    const updatedEmployer =
      await prisma.user.findUnique({
        where: {
          id: employerId,
        },
        include: {
          company: {
            include: {
              _count: {
                select: {
                  jobs: {
                    where: {
                      published: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

    if (!updatedEmployer?.company) {
      return NextResponse.json(
        { error: "Company profile not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      formatCompany(
        updatedEmployer.company,
        {
          name: updatedEmployer.name,
          email: updatedEmployer.email,
        },
        updatedEmployer.company._count.jobs
      )
    );
  } catch (error) {
    console.error("PATCH company error:", error);

    return NextResponse.json(
      { error: "Failed to update company." },
      { status: 500 }
    );
  }
}