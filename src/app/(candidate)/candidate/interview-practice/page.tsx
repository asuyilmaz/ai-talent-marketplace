"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BrainCircuit,
  RotateCcw,
  Send,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
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
  score?: number;
  feedback?: string;
  strengths?: string[];
  improvements?: string[];
};

type FeedbackResponse = {
  message?: string;
  score?: number;
  feedback?: string;
  strengths?: string[];
  improvements?: string[];
  completed?: boolean;
  nextQuestion?: string | null;
  finalSummary?: string | null;
};

type InterviewSessionPayload = {
  jobId?: string;
  turns?: Turn[];
  currentQuestion?: string | null;
  finalSummary?: string | null;
  completed?: boolean;
};

type StartResponse = {
  message?: string;
  question?: string;
  session?: InterviewSessionPayload;
};

type AnswerResponse = FeedbackResponse & {
  session?: InterviewSessionPayload;
};

export default function InterviewPracticePage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [finalSummary, setFinalSummary] = useState("");
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [restoringSession, setRestoringSession] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadJobs() {
      try {
        const response = await fetch("/api/jobs", {
          method: "GET",
          cache: "no-store",
        });
        const data = (await response.json()) as {
          jobs?: Job[];
          message?: string;
        };

        if (!response.ok) {
          setError(data.message || "Unable to load jobs.");
          return;
        }

        setJobs(data.jobs ?? []);
      } catch {
        setError("Unable to connect to the server.");
      } finally {
        setLoadingJobs(false);
      }
    }

    void loadJobs();
  }, []);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    async function restoreInterview() {
      try {
        const response = await fetch("/api/ai/interview", {
          method: "GET",
          cache: "no-store",
          signal: controller.signal,
        });

        const data = (await response.json()) as {
          session?: InterviewSessionPayload | null;
          message?: string;
        };

        if (!active) return;

        if (!response.ok) {
          setError(data.message || "Unable to restore Interview Practice.");
          return;
        }

        const session = data.session;
        if (!session) return;

        if (session.jobId) {
          setSelectedJobId(session.jobId);
        }

        setTurns(session.turns ?? []);
        setCurrentQuestion(session.currentQuestion ?? "");
        setFinalSummary(session.finalSummary ?? "");
        setAnswer("");
      } catch (error) {
        if (error instanceof DOMException && error.name == "AbortError") return;
        if (active) {
          setError("Unable to restore Interview Practice.");
        }
      } finally {
        if (active) {
          setRestoringSession(false);
        }
      }
    }

    void restoreInterview();

    return () => {
      active = false;
      controller.abort();
    };
  }, []);

  const selectedJob = useMemo(
    () => jobs.find((job) => job.id === selectedJobId) ?? null,
    [jobs, selectedJobId]
  );

  const completed = Boolean(finalSummary);
  const answeredCount = turns.filter((turn) => turn.answer).length;
  const progress = completed
    ? 100
    : currentQuestion
      ? Math.min(100, ((answeredCount + 1) / 5) * 100)
      : 0;

  const averageScore = useMemo(() => {
    const scores = turns
      .map((turn) => turn.score)
      .filter((score): score is number => typeof score === "number");

    if (scores.length === 0) return 0;
    return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
  }, [turns]);

  async function startInterview() {
    if (!selectedJobId) {
      setError("Choose a job before starting the interview.");
      return;
    }

    setWorking(true);
    setError("");
    setTurns([]);
    setAnswer("");
    setFinalSummary("");

    try {
      const response = await fetch("/api/ai/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "start",
          jobId: selectedJobId,
        }),
      });

      const data = (await response.json()) as StartResponse;

      if (!response.ok) {
        setError(data.message || "Unable to start Interview Practice.");
        return;
      }

      const session = data.session;
      const question = session?.currentQuestion ?? data.question ?? "";

      if (session?.turns) {
        setTurns(session.turns);
      }

      if (session?.finalSummary) {
        setFinalSummary(session.finalSummary);
      }

      if (!question && !session?.completed) {
        setError("The interview started, but no question was returned.");
        return;
      }

      setCurrentQuestion(question);
    } catch {
      setError("Unable to connect to Interview Practice.");
    } finally {
      setWorking(false);
    }
  }

  async function submitAnswer() {
    const trimmedAnswer = answer.trim();

    if (!currentQuestion || !trimmedAnswer || !selectedJobId) {
      setError("Write an answer before continuing.");
      return;
    }

    setWorking(true);
    setError("");

    const pendingTurns: Turn[] = [
      ...turns,
      {
        question: currentQuestion,
        answer: trimmedAnswer,
      },
    ];

    try {
      const response = await fetch("/api/ai/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "answer",
          jobId: selectedJobId,
          answer: trimmedAnswer,
          history: pendingTurns.map((turn) => ({
            question: turn.question,
            answer: turn.answer,
          })),
        }),
      });

      const data = (await response.json()) as AnswerResponse;

      if (!response.ok) {
        setError(data.message || "Unable to evaluate your answer.");
        return;
      }

      if (data.session) {
        const sessionTurns = data.session.turns ?? [];
        setTurns(sessionTurns);
        setAnswer("");
        setCurrentQuestion(data.session.currentQuestion ?? "");

        if (data.session.completed) {
          setFinalSummary(
            data.session.finalSummary ||
              "Interview complete. Review your feedback below."
          );
        } else {
          setFinalSummary("");
        }

        if (
          !data.session.completed &&
          !data.session.currentQuestion
        ) {
          setError("The next interview question could not be generated.");
        }

        return;
      }

      const evaluatedTurns = pendingTurns.map((turn, index) =>
        index === pendingTurns.length - 1
          ? {
              ...turn,
              score: data.score ?? 0,
              feedback: data.feedback ?? "",
              strengths: data.strengths ?? [],
              improvements: data.improvements ?? [],
            }
          : turn
      );

      setTurns(evaluatedTurns);
      setAnswer("");

      if (data.completed) {
        setCurrentQuestion("");
        setFinalSummary(
          data.finalSummary || "Interview complete. Review your feedback below."
        );
      } else if (data.nextQuestion) {
        setCurrentQuestion(data.nextQuestion);
      } else {
        setError("The next interview question could not be generated.");
      }
    } catch {
      setError("Unable to connect to Interview Practice.");
    } finally {
      setWorking(false);
    }
  }

  function clearInterviewState() {
    setTurns([]);
    setCurrentQuestion("");
    setAnswer("");
    setFinalSummary("");
    setError("");
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

      const data = (await response.json()) as { message?: string };

      if (!response.ok) {
        setError(data.message || "Unable to reset Interview Practice.");
        return;
      }

      clearInterviewState();
    } catch {
      setError("Unable to reset Interview Practice.");
    } finally {
      setWorking(false);
    }
  }

  if (restoringSession) {
    return (
      <div className="mx-auto max-w-[1380px]">
        <section className="border-b border-black/10 pb-9">
          <p className="tn-index">Interview studio / TALNIVO AI</p>
          <h1 className="mt-5 text-[clamp(3.2rem,6vw,6.2rem)] font-black leading-[.88] tracking-[-.07em]">
            Practice.<br /><span className="text-[#5b3df5]">Then sharpen.</span>
          </h1>
        </section>

        <section className="flex min-h-[620px] items-center justify-center border-b border-black/10">
          <div className="text-center">
            <BrainCircuit className="mx-auto h-7 w-7 animate-pulse text-[#5b3df5]" />
            <p className="tn-index mt-5">Restoring session</p>
            <p className="mt-3 text-sm text-[#77767b]">
              Loading your latest Interview Practice progress...
            </p>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1380px]">
      <section className="grid border-b border-black/10 pb-9 lg:grid-cols-[1fr_360px] lg:gap-14">
        <div>
          <p className="tn-index">Interview studio / TALNIVO AI</p>
          <h1 className="mt-5 text-[clamp(3.2rem,6vw,6.2rem)] font-black leading-[.88] tracking-[-.07em]">
            Practice.<br /><span className="text-[#5b3df5]">Then sharpen.</span>
          </h1>
        </div>
        <div className="mt-8 border-l-0 border-black/10 lg:mt-0 lg:border-l lg:pl-8">
          <BrainCircuit className="h-6 w-6 text-[#5b3df5]" />
          <p className="mt-5 text-sm leading-6 text-[#626166]">
            This is a working session, not a chat screen. Pick a real role, answer five questions, and review exactly where the response became stronger or weaker.
          </p>
          <p className="tn-index mt-6">{answeredCount}/5 answered · {Math.round(progress)}% complete</p>
        </div>
      </section>

      <section className="grid min-h-[620px] border-b border-black/10 lg:grid-cols-[310px_minmax(0,1fr)]">
        <aside className="border-b border-black/10 py-7 lg:border-b-0 lg:border-r lg:pr-8">
          <p className="tn-index">Session setup</p>
          <label htmlFor="interview-job" className="mt-6 block text-xs font-black">Target role</label>
          <select
            id="interview-job"
            name="interviewJob"
            value={selectedJobId}
            onChange={(event) => { setSelectedJobId(event.target.value); clearInterviewState(); }}
            disabled={loadingJobs || working || Boolean(currentQuestion)}
            className="mt-2 h-11 w-full border-0 border-b border-black/20 bg-transparent px-0 text-sm font-bold outline-none disabled:opacity-60"
          >
            <option value="">{loadingJobs ? "Loading jobs..." : "Select a job"}</option>
            {jobs.map((job) => <option key={job.id} value={job.id}>{job.title} — {job.company}</option>)}
          </select>

          {selectedJob && (
            <div className="mt-6">
              <p className="tn-index">Role context</p>
              <p className="mt-3 text-sm font-black">{selectedJob.title}</p>
              <p className="mt-1 text-xs text-[#77767b]">{selectedJob.company} · {selectedJob.workType} · {selectedJob.employmentType}</p>
              <div className="mt-4 flex flex-wrap gap-x-3 gap-y-2">
                {selectedJob.skills.slice(0, 5).map((skill) => (
                  <span key={skill} className="text-[10px] font-bold text-[#5b3df5]">{skill}</span>
                ))}
              </div>
            </div>
          )}

          {!currentQuestion && !completed && (
            <Button
              type="button"
              onClick={startInterview}
              disabled={!selectedJobId || working || loadingJobs}
              className="mt-7 w-full"
            >
              <Sparkles className="h-4 w-4" />
              {working ? "Preparing session..." : "Start session"}
            </Button>
          )}

          <div className="mt-8 border-t border-black/10 pt-6">
            <div className="flex items-center justify-between">
              <span className="tn-index">Progress</span>
              <span className="font-mono text-[10px]">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="mt-3" />
            {turns.length > 0 && (
              <div className="mt-7 border-t border-black/10 pt-5">
                <p className="tn-index">Average score</p>
                <p className="mt-2 text-5xl font-black tracking-[-.06em]">{averageScore}<span className="text-sm text-[#8a898d]">/100</span></p>
              </div>
            )}
          </div>
        </aside>

        <div className="py-7 lg:pl-10">
          {turns.length === 0 && !currentQuestion && !completed && (
            <div className="flex min-h-[430px] items-center justify-center border border-dashed border-black/15 px-6 text-center">
              <div className="max-w-md">
                <p className="tn-index">Session canvas</p>
                <p className="mt-4 text-2xl font-black tracking-[-.035em]">Choose a role on the left. The interview will happen here.</p>
                <p className="mt-3 text-sm leading-6 text-[#77767b]">No floating AI bubbles, no fake assistant persona — just the question, your answer, and structured coaching.</p>
              </div>
            </div>
          )}

          <div>
            {turns.map((turn, index) => (
              <article key={`${index}-${turn.question}`} className="grid gap-5 border-t border-black/10 py-7 first:border-t-0 sm:grid-cols-[72px_minmax(0,1fr)]">
                <div>
                  <p className="font-mono text-xs text-[#9a989d]">Q{String(index + 1).padStart(2, "0")}</p>
                  {typeof turn.score === "number" && <p className="mt-3 text-2xl font-black">{turn.score}</p>}
                </div>
                <div>
                  <h3 className="max-w-3xl text-lg font-black leading-7">{turn.question}</h3>
                  <div className="mt-5 border-l border-black/15 pl-5">
                    <p className="tn-index">Your answer</p>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#626166]">{turn.answer}</p>
                  </div>
                  {turn.feedback && (
                    <div className="mt-6 grid gap-5 border-t border-black/10 pt-5 md:grid-cols-[1fr_1fr]">
                      <div>
                        <p className="tn-index text-emerald-700">What worked</p>
                        <p className="mt-3 text-sm leading-6 text-[#4f5055]">{turn.feedback}</p>
                        <ul className="mt-3 space-y-1 text-xs leading-5 text-[#66656a]">
                          {(turn.strengths ?? []).map((item) => <li key={item}>+ {item}</li>)}
                        </ul>
                      </div>
                      <div>
                        <p className="tn-index text-[#5b3df5]">What to sharpen</p>
                        <ul className="mt-3 space-y-1 text-xs leading-5 text-[#66656a]">
                          {(turn.improvements ?? []).map((item) => <li key={item}>→ {item}</li>)}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>

          {currentQuestion && !completed && (
            <div className="border-t-2 border-[#101114] pt-7">
              <div className="grid gap-5 sm:grid-cols-[72px_minmax(0,1fr)]">
                <p className="font-mono text-xs text-[#5b3df5]">Q{String(answeredCount + 1).padStart(2, "0")}</p>
                <div>
                  <p className="tn-index text-[#5b3df5]">Current question</p>
                  <h2 className="mt-3 max-w-3xl text-2xl font-black leading-8 tracking-[-.025em]">{currentQuestion}</h2>
                  <textarea
                    id="interview-answer"
                    name="interviewAnswer"
                    aria-label="Interview answer"
                    value={answer}
                    onChange={(event) => setAnswer(event.target.value)}
                    maxLength={4000}
                    rows={9}
                    placeholder="Write your answer..."
                    disabled={working}
                    className="mt-6 w-full resize-y border border-black/15 bg-white p-5 text-sm leading-6 outline-none disabled:opacity-60"
                  />
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <span className="font-mono text-[10px] text-[#8a898d]">{answer.length.toString().padStart(4, "0")} / 4000</span>
                    <Button type="button" onClick={submitAnswer} disabled={working || !answer.trim()} size="lg">
                      {working ? "Reviewing..." : "Submit answer"} <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {completed && (
            <div className="border border-[#101114] bg-[#101114] p-7 text-white sm:p-9">
              <div className="grid gap-8 sm:grid-cols-[1fr_auto] sm:items-end">
                <div>
                  <p className="tn-index text-[#9c90ff]">Session complete</p>
                  <p className="mt-4 text-5xl font-black tracking-[-.06em]">{averageScore}<span className="text-base text-white/35">/100</span></p>
                  <p className="mt-4 max-w-2xl text-sm leading-6 text-white/60">{finalSummary}</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetInterview}
                  disabled={working}
                  className="border-white/20 bg-transparent text-white hover:bg-white hover:text-black"
                >
                  <RotateCcw className="h-4 w-4" />
                  {working ? "Resetting..." : "Practice again"}
                </Button>
              </div>
              <p className="mt-7 text-[10px] text-white/35">Coaching feedback only — not a prediction of hiring decisions.</p>
            </div>
          )}

          {error && <div className="mt-5 border border-destructive/25 bg-destructive/5 p-4 text-sm text-destructive">{error}</div>}
        </div>
      </section>
    </div>
  );
}
