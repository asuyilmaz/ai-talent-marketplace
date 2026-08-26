import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type RegisterRequest = {
  name?: string;
  email?: string;
  password?: string;
  role?: "candidate" | "employer";
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RegisterRequest;

    const name = body.name?.trim();
    const email = body.email?.trim().toLowerCase();
    const password = body.password;
    const role = body.role;

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        {
          message:
            "Name, email, password and role are required.",
        },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        {
          message:
            "Password must be at least 6 characters long.",
        },
        { status: 400 }
      );
    }

    if (
      role !== "candidate" &&
      role !== "employer"
    ) {
      return NextResponse.json(
        {
          message: "Invalid account type.",
        },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          message:
            "An account with this email already exists.",
        },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(
      password,
      12
    );

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role:
          role === "candidate"
            ? "CANDIDATE"
            : "EMPLOYER",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    if (role === "candidate") {
      await prisma.candidateProfile.create({
        data: {
          userId: user.id,
        },
      });
    }

    if (role === "employer") {
      await prisma.company.create({
        data: {
          ownerId: user.id,
          name: name,
        },
      });
    }

    return NextResponse.json(
      {
        message: "Account created successfully.",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role:
            user.role === "CANDIDATE"
              ? "candidate"
              : "employer",
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register error:", error);

    return NextResponse.json(
      {
        message:
          "Something went wrong while creating the account.",
      },
      { status: 500 }
    );
  }
}