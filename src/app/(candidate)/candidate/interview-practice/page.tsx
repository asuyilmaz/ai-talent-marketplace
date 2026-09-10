"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BrainCircuit,
  BriefcaseBusiness,
  CheckCircle2,
  RotateCcw,
  Send,
  Sparkles,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

type Job = {
  id: string;
  title: string;
  company: string;
  skills: string[];
  workType: string;
  employmentType: string;
};

type Turn = {
  question: string;
  answer: string;
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
};

type InterviewSession = {
  id: string;
  jobId: string;
  turns: Turn[];
  currentQuestion: string | null;
  finalSummary: string | null;
  completed: boolean;
  totalQuestions: number;
  job: { title: string; company: string };
};

type SessionResponse = {
  session?: InterviewSession | null;
  message?: string;
};

export default function InterviewPracticePage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadPage() {
      try {
        const [jobsResponse, sessionResponse] = await Promise.all([
          fetch("/api/jobs", { method: "GET", cache: "no-store" }),
          fetch("/api/ai/interview", { method: "GET", cache: "no-store" }),
        ]);

        const jobsData = (await jobsResponse.json()) as {
          jobs?: Job[];
          message?: string;
        };
        const sessionData = (await sessionResponse.json()) as SessionResponse;

        if (!jobsResponse.ok) {
          setError(jobsData.message || "Unable to load jobs.");
          return;
        }
        if (!sessionResponse.ok) {
          setError(sessionData.message || "Unable to restore Interview Practice.");
          return;
        }

        setJobs(jobsData.jobs ?? []);
        if (sessionData.session) {
          setSession(sessionData.session);
          setSelectedJobId(sessionData.session.jobId);
        }
      } catch {
        setError("Unable to connect to the server.");
      } finally {
        setLoading(false);
      }
    }

    void loadPage();
  }, []);

  const selectedJob = useMemo(
    () => jobs.find((job) => job.id === selectedJobId) ?? null,
    [jobs, selectedJobId]
  );

  const turns = useMemo(() => session?.turns ?? [], [session?.turns]);
  const currentQuestion = session?.currentQuestion ?? "";
  const completed = session?.completed ?? false;
  const totalQuestions = session?.totalQuestions ?? 5;
  const answeredCount = turns.length;
  const progress = completed
    ? 100
    : currentQuestion
      ? Math.min(100, ((answeredCount + 1) / totalQuestions) * 100)
      : 0;

  const averageScore = useMemo(() => {
    if (turns.length === 0) return 0;
    return Math.round(
      turns.reduce((sum, turn) => sum + turn.score, 0) / turns.length
    );
  }, [turns]);

  async function startInterview() {
    if (!selectedJobId) {
      setError("Choose a job before starting the interview.");
      return;
    }

    setWorking(true);
    setError("");
    setAnswer("");

    try {
      const response = await fetch("/api/ai/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start", jobId: selectedJobId }),
      });
      const data = (await response.json()) as SessionResponse;

      if (!response.ok || !data.session) {
        setError(data.message || "Unable to start Interview Practice.");
        return;
      }
      setSession(data.session);
    } catch {
      setError("Unable to connect to Interview Practice.");
    } finally {
      setWorking(false);
    }
  }

  async function submitAnswer() {
    const trimmedAnswer = answer.trim();
    if (!currentQuestion || !trimmedAnswer || !session) {
      setError("Write an answer before continuing.");
      return;
    }

    setWorking(true);
    setError("");

    try {
      const response = await fetch("/api/ai/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "answer",
          jobId: session.jobId,
          answer: trimmedAnswer,
        }),
      });
      const data = (await response.json()) as SessionResponse;

      if (!response.ok || !data.session) {
        setError(data.message || "Unable to evaluate your answer.");
        return;
      }

      setSession(data.session);
      setAnswer("");
    } catch {
      setError("Unable to connect to Interview Practice.");
    } finally {
      setWorking(false);
    }
  }

  async function resetInterview() {
    setWorking(true);
    setError("");

    try {
      const response = await fetch("/api/ai/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset" }),
      });
      const data = (await response.json()) as { success?: boolean; message?: string };

      if (!response.ok) {
        setError(data.message || "Unable to reset Interview Practice.");
        return;
      }

      setSession(null);
      setSelectedJobId("");
      setAnswer("");
    } catch {
      setError("Unable to connect to Interview Practice.");
    } finally {
      setWorking(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <div className="flex items-center gap-2 text-sm font-medium">
          <Sparkles className="h-4 w-4" />
          TALNIVO AI
        </div>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Interview Practice
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Practice a five-question interview tailored to a real job posting and
          get coaching feedback after every answer. Your active session is saved
          automatically, so refreshing the page will not erase your progress.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BriefcaseBusiness className="h-5 w-5" />
            Choose your target role
          </CardTitle>
          <CardDescription>
            TALNIVO uses the job title, description, and required skills to
            tailor the interview.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <select
            value={selectedJobId}
            onChange={(event) => setSelectedJobId(event.target.value)}
            disabled={loading || working || Boolean(session)}
            className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none transition focus:ring-2 focus:ring-ring disabled:opacity-60"
          >
            <option value="">{loading ? "Loading jobs..." : "Select a job"}</option>
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.title} — {job.company}
              </option>
            ))}
          </select>

          {selectedJob && (
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{selectedJob.workType}</Badge>
              <Badge variant="secondary">{selectedJob.employmentType}</Badge>
              {selectedJob.skills.slice(0, 5).map((skill) => (
                <Badge key={skill} variant="outline">{skill}</Badge>
              ))}
            </div>
          )}

          {!session && (
            <Button
              type="button"
              onClick={startInterview}
              disabled={!selectedJobId || working || loading}
              size="lg"
            >
              <BrainCircuit className="h-4 w-4" />
              {working ? "Preparing interview..." : "Start AI Interview"}
            </Button>
          )}
        </CardContent>
      </Card>

      {session && (
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle>Interview session</CardTitle>
                <CardDescription>
                  {completed
                    ? "Session complete"
                    : `Question ${answeredCount + 1} of ${totalQuestions}`}
                </CardDescription>
              </div>
              {turns.length > 0 && (
                <Badge variant="secondary">Average score: {averageScore}%</Badge>
              )}
            </div>
            <Progress value={progress} className="mt-3" />
          </CardHeader>

          <CardContent className="space-y-6">
            {turns.map((turn, index) => (
              <div key={`${index}-${turn.question}`} className="rounded-xl border p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-medium">Q{index + 1}. {turn.question}</p>
                  <Badge>{turn.score}%</Badge>
                </div>

                <div className="mt-3 rounded-lg bg-muted/50 p-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Your answer
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-sm">{turn.answer}</p>
                </div>

                {turn.feedback && (
                  <div className="mt-4 space-y-3">
                    <p className="text-sm">{turn.feedback}</p>
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="rounded-lg border p-3">
                        <p className="text-sm font-medium">Strengths</p>
                        <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                          {turn.strengths.map((item) => <li key={item}>• {item}</li>)}
                        </ul>
                      </div>
                      <div className="rounded-lg border p-3">
                        <p className="text-sm font-medium">Improve next</p>
                        <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                          {turn.improvements.map((item) => <li key={item}>• {item}</li>)}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {currentQuestion && !completed && (
              <div className="rounded-xl border p-5">
                <div className="flex items-center gap-2">
                  <BrainCircuit className="h-5 w-5" />
                  <Badge variant="outline">Question {answeredCount + 1}</Badge>
                </div>
                <h2 className="mt-3 text-lg font-medium">{currentQuestion}</h2>

                <textarea
                  value={answer}
                  onChange={(event) => setAnswer(event.target.value)}
                  maxLength={4000}
                  rows={7}
                  placeholder="Write your interview answer here..."
                  disabled={working}
                  className="mt-4 w-full resize-y rounded-md border bg-background p-3 text-sm outline-none transition focus:ring-2 focus:ring-ring disabled:opacity-60"
                />

                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <span className="text-xs text-muted-foreground">{answer.length}/4000 characters</span>
                  <Button
                    type="button"
                    onClick={submitAnswer}
                    disabled={working || !answer.trim()}
                    size="lg"
                  >
                    <Send className="h-4 w-4" />
                    {working ? "Evaluating..." : "Submit answer"}
                  </Button>
                </div>
              </div>
            )}

            {completed && (
              <div className="rounded-xl border p-5">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  <h2 className="text-lg font-medium">Interview complete</h2>
                </div>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {session.finalSummary || "Interview complete. Review your feedback above."}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <Badge>Final average: {averageScore}%</Badge>
                  <Button type="button" variant="outline" onClick={resetInterview} disabled={working}>
                    <RotateCcw className="h-4 w-4" />
                    {working ? "Resetting..." : "Practice again"}
                  </Button>
                </div>
                <p className="mt-4 text-xs text-muted-foreground">
                  Scores are coaching feedback for practice and do not predict hiring decisions.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </div>
      )}
    </div>
  );
}
