import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/session";

export const runtime = "nodejs";

const MODEL = "gpt-5.6-luna";
const MAX_QUESTIONS = 5;
const MAX_ANSWER_LENGTH = 4000;
const RATE_LIMIT_MAX_REQUESTS = 10;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;

type StoredTurn = {
  question: string;
  answer: string;
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
};

type InterviewRequest = {
  action?: "start" | "answer" | "reset";
  jobId?: string;
  answer?: string;
};

type OpenAIResponse = {
  output?: Array<{
    type?: string;
    content?: Array<{
      type?: string;
      text?: string;
      refusal?: string;
    }>;
  }>;
  error?: { message?: string };
};

function getOutputText(response: OpenAIResponse) {
  for (const item of response.output ?? []) {
    if (item.type !== "message") continue;
    for (const content of item.content ?? []) {
      if (content.type === "output_text" && content.text) return content.text;
      if (content.type === "refusal" && content.refusal) {
        throw new Error(content.refusal);
      }
    }
  }
  throw new Error("The AI response did not contain usable text.");
}

async function createStructuredResponse({
  instructions,
  input,
  schemaName,
  schema,
}: {
  instructions: string;
  input: string;
  schemaName: string;
  schema: Record<string, unknown>;
}) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured.");

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      instructions,
      input,
      store: false,
      text: {
        format: {
          type: "json_schema",
          name: schemaName,
          strict: true,
          schema,
        },
      },
    }),
  });

  const data = (await response.json()) as OpenAIResponse;
  if (!response.ok) {
    console.error("OpenAI interview API error:", data.error?.message);
    throw new Error(data.error?.message || "The AI service returned an error.");
  }

  return JSON.parse(getOutputText(data)) as Record<string, unknown>;
}

function parseTurns(value: unknown): StoredTurn[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const turn = item as Partial<StoredTurn>;
    if (typeof turn.question !== "string" || typeof turn.answer !== "string") {
      return [];
    }

    return [{
      question: turn.question,
      answer: turn.answer,
      score: typeof turn.score === "number" ? turn.score : 0,
      feedback: typeof turn.feedback === "string" ? turn.feedback : "",
      strengths: Array.isArray(turn.strengths)
        ? turn.strengths.filter((item): item is string => typeof item === "string")
        : [],
      improvements: Array.isArray(turn.improvements)
        ? turn.improvements.filter((item): item is string => typeof item === "string")
        : [],
    }];
  }).slice(0, MAX_QUESTIONS);
}

function formatHistory(turns: StoredTurn[]) {
  if (turns.length === 0) return "No previous interview turns.";
  return turns
    .map((turn, index) =>
      `Question ${index + 1}: ${turn.question.slice(0, 1200)}\nCandidate answer: ${turn.answer.slice(0, MAX_ANSWER_LENGTH)}`
    )
    .join("\n\n");
}

function serializeSession(session: {
  id: string;
  jobId: string;
  turns: unknown;
  currentQuestion: string | null;
  finalSummary: string | null;
  completed: boolean;
  job: { title: string; company: { name: string } };
}) {
  return {
    session: {
      id: session.id,
      jobId: session.jobId,
      turns: parseTurns(session.turns),
      currentQuestion: session.currentQuestion,
      finalSummary: session.finalSummary,
      completed: session.completed,
      totalQuestions: MAX_QUESTIONS,
      job: {
        title: session.job.title,
        company: session.job.company.name,
      },
    },
  };
}


async function consumeAiRateLimit(candidateId: string) {
  const now = new Date();
  const windowStart = new Date(now.getTime() - RATE_LIMIT_WINDOW_MS);

  const rows = await prisma.$queryRaw<Array<{
    requestCount: number;
    windowStart: Date;
  }>>`
    INSERT INTO "AiInterviewRateLimit" ("candidateId", "windowStart", "requestCount", "updatedAt")
    VALUES (${candidateId}, ${now}, 1, ${now})
    ON CONFLICT ("candidateId") DO UPDATE SET
      "windowStart" = CASE
        WHEN "AiInterviewRateLimit"."windowStart" <= ${windowStart}
          THEN ${now}
        ELSE "AiInterviewRateLimit"."windowStart"
      END,
      "requestCount" = CASE
        WHEN "AiInterviewRateLimit"."windowStart" <= ${windowStart}
          THEN 1
        ELSE "AiInterviewRateLimit"."requestCount" + 1
      END,
      "updatedAt" = ${now}
    RETURNING "requestCount", "windowStart"
  `;

  const row = rows[0];
  if (!row || row.requestCount <= RATE_LIMIT_MAX_REQUESTS) {
    return null;
  }

  const retryAfterSeconds = Math.max(
    1,
    Math.ceil((row.windowStart.getTime() + RATE_LIMIT_WINDOW_MS - now.getTime()) / 1000)
  );

  return NextResponse.json(
    { message: "Too many Interview Practice requests. Please wait a few minutes and try again." },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfterSeconds),
        "Cache-Control": "no-store",
      },
    }
  );
}

function requireCandidate(request: Request) {
  const session = getSessionFromRequest(request);
  if (!session) return { error: NextResponse.json({ message: "Not authenticated." }, { status: 401 }) };
  if (session.role !== "candidate") {
    return { error: NextResponse.json({ message: "Interview Practice is available to candidates only." }, { status: 403 }) };
  }
  return { session };
}

export async function GET(request: Request) {
  try {
    const auth = requireCandidate(request);
    if ("error" in auth) return auth.error;

    const activeSession = await prisma.interviewSession.findFirst({
      where: { candidateId: auth.session.userId, active: true },
      orderBy: { updatedAt: "desc" },
      include: { job: { include: { company: true } } },
    });

    if (!activeSession) return NextResponse.json({ session: null });
    return NextResponse.json(serializeSession(activeSession));
  } catch (error) {
    console.error("Interview Practice restore error:", error);
    return NextResponse.json(
      { message: "Unable to restore Interview Practice." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const auth = requireCandidate(request);
    if ("error" in auth) return auth.error;

    const body = (await request.json()) as InterviewRequest;
    const action = body.action;

    if (action === "reset") {
      await prisma.interviewSession.updateMany({
        where: { candidateId: auth.session.userId, active: true },
        data: { active: false },
      });
      return NextResponse.json({ success: true });
    }

    const jobId = body.jobId?.trim();
    if ((action !== "start" && action !== "answer") || !jobId) {
      return NextResponse.json(
        { message: "A valid action and job are required." },
        { status: 400 }
      );
    }

    const answer = body.answer?.trim() ?? "";
    if (action === "answer" && !answer) {
      return NextResponse.json({ message: "Please enter an answer before continuing." }, { status: 400 });
    }
    if (action === "answer" && answer.length > MAX_ANSWER_LENGTH) {
      return NextResponse.json({ message: `Answers must be ${MAX_ANSWER_LENGTH} characters or fewer.` }, { status: 400 });
    }

    const rateLimitResponse = await consumeAiRateLimit(auth.session.userId);
    if (rateLimitResponse) return rateLimitResponse;

    const job = await prisma.job.findFirst({
      where: { id: jobId, published: true },
      include: {
        company: true,
        skills: { include: { skill: true } },
      },
    });

    if (!job) return NextResponse.json({ message: "Job not found." }, { status: 404 });

    const jobContext = [
      `Role: ${job.title}`,
      `Company: ${job.company.name}`,
      `Employment type: ${job.employmentType}`,
      `Work type: ${job.workType}`,
      `Required skills: ${job.skills.map((item) => item.skill.name).join(", ") || "Not specified"}`,
      `Job description: ${(job.description ?? "Not provided").slice(0, 5000)}`,
    ].join("\n");

    const baseInstructions = `You are TALNIVO Interview Practice, a professional and supportive interview coach. Conduct a realistic interview for the supplied job. Keep questions concise, job-relevant, and appropriate for a general professional interview. Do not claim that the score predicts hiring outcomes.

When evaluating an answer, score only the candidate's latest answer to the current question. Judge substance rather than writing style, grammar, answer length, or the candidate's language.

Use this 0-100 coaching rubric consistently:
- 0-10: Empty, nonsensical, refusal-only, or completely unrelated answer.
- 11-30: Mostly irrelevant, seriously incorrect, or provides almost no useful answer to the question.
- 31-50: Partially relevant but weak, vague, substantially incomplete, or contains important misunderstandings.
- 51-69: Adequate and generally relevant, but missing important depth, reasoning, examples, or technical detail.
- 70-84: Good answer that directly addresses the question and is mostly correct, with some gaps or room for stronger detail.
- 85-94: Strong answer that is accurate, relevant, well reasoned, and sufficiently specific, with only minor omissions.
- 95-100: Exceptional answer that is precise, complete, technically strong, nuanced, and clearly explains tradeoffs or examples when appropriate.

Scoring criteria:
- Technical correctness: 30 points
- Relevance to the exact question: 25 points
- Completeness: 20 points
- Specificity, reasoning, examples, or tradeoffs: 15 points
- Clarity and organization: 10 points

Do not give a score of 20 or below when the answer directly addresses the core question and contains materially correct information. Do not require unnecessary length for a high score. A concise but correct and complete answer can score highly. Give specific, constructive feedback that matches the score. The interview contains exactly ${MAX_QUESTIONS} questions.`;

    if (action === "start") {
      const result = await createStructuredResponse({
        instructions: baseInstructions,
        input: `${jobContext}\n\nCreate question 1 of ${MAX_QUESTIONS}. Start with a useful role-relevant question.`,
        schemaName: "talnivo_interview_start",
        schema: {
          type: "object",
          properties: { question: { type: "string" } },
          required: ["question"],
          additionalProperties: false,
        },
      });

      const question = typeof result.question === "string" ? result.question.trim() : "";
      if (!question) throw new Error("The AI did not create an interview question.");

      const created = await prisma.$transaction(async (tx) => {
        await tx.interviewSession.updateMany({
          where: { candidateId: auth.session.userId, active: true },
          data: { active: false },
        });
        return tx.interviewSession.create({
          data: {
            candidateId: auth.session.userId,
            jobId: job.id,
            turns: [],
            currentQuestion: question,
          },
          include: { job: { include: { company: true } } },
        });
      });

      return NextResponse.json(serializeSession(created));
    }

    const activeSession = await prisma.interviewSession.findFirst({
      where: {
        candidateId: auth.session.userId,
        jobId,
        active: true,
        completed: false,
      },
    });

    if (!activeSession || !activeSession.currentQuestion) {
      return NextResponse.json({ message: "No active interview was found for this job." }, { status: 409 });
    }

    const previousTurns = parseTurns(activeSession.turns);
    if (previousTurns.length >= MAX_QUESTIONS) {
      return NextResponse.json({ message: "This interview is already complete." }, { status: 409 });
    }

    const currentQuestionNumber = previousTurns.length + 1;
    const completed = currentQuestionNumber >= MAX_QUESTIONS;
    const result = await createStructuredResponse({
      instructions: baseInstructions,
      input: `${jobContext}\n\nPrevious interview context:\n${formatHistory(previousTurns)}\n\nCURRENT QUESTION ${currentQuestionNumber}:\n${activeSession.currentQuestion}\n\nCURRENT CANDIDATE ANSWER:\n${answer}\n\nEvaluate only the CURRENT CANDIDATE ANSWER against the CURRENT QUESTION using the scoring rubric in the instructions. ${completed ? "This was the final question. Do not create another question; provide a concise final interview summary." : `Create question ${currentQuestionNumber + 1} of ${MAX_QUESTIONS}. Avoid repeating earlier questions.`}`,
      schemaName: "talnivo_interview_feedback",
      schema: {
        type: "object",
        properties: {
          score: { type: "integer", minimum: 0, maximum: 100 },
          feedback: { type: "string" },
          strengths: { type: "array", items: { type: "string" }, maxItems: 3 },
          improvements: { type: "array", items: { type: "string" }, maxItems: 3 },
          completed: { type: "boolean" },
          nextQuestion: { type: ["string", "null"] },
          finalSummary: { type: ["string", "null"] },
        },
        required: ["score", "feedback", "strengths", "improvements", "completed", "nextQuestion", "finalSummary"],
        additionalProperties: false,
      },
    });

    const evaluatedTurn: StoredTurn = {
      question: activeSession.currentQuestion,
      answer,
      score: typeof result.score === "number" ? Math.max(0, Math.min(100, Math.round(result.score))) : 0,
      feedback: typeof result.feedback === "string" ? result.feedback : "",
      strengths: Array.isArray(result.strengths) ? result.strengths.filter((item): item is string => typeof item === "string").slice(0, 3) : [],
      improvements: Array.isArray(result.improvements) ? result.improvements.filter((item): item is string => typeof item === "string").slice(0, 3) : [],
    };

    const nextQuestion = !completed && typeof result.nextQuestion === "string"
      ? result.nextQuestion.trim()
      : null;
    const finalSummary = completed && typeof result.finalSummary === "string"
      ? result.finalSummary.trim()
      : null;

    if (!completed && !nextQuestion) throw new Error("The AI did not create the next question.");

    const updated = await prisma.interviewSession.update({
      where: { id: activeSession.id },
      data: {
        turns: [...previousTurns, evaluatedTurn],
        currentQuestion: completed ? null : nextQuestion,
        completed,
        finalSummary: completed
          ? finalSummary || "Interview complete. Review your feedback below."
          : null,
      },
      include: { job: { include: { company: true } } },
    });

    return NextResponse.json(serializeSession(updated));
  } catch (error) {
    console.error("Interview Practice error:", error);
    const message =
      error instanceof Error && error.message.includes("OPENAI_API_KEY")
        ? "Interview Practice is not configured yet."
        : "Interview Practice is temporarily unavailable. Please try again.";
    return NextResponse.json({ message }, { status: 500 });
  }
}
