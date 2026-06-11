"use client";

import Link from "next/link";
import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { evaluateMockInterview } from "@/app/dashboard/interview/actions";
import {
  INTERVIEW_ANSWERS_STORAGE_KEY,
  INTERVIEW_EVALUATION_STORAGE_KEY,
  INTERVIEW_HISTORY_STORAGE_KEY,
  INTERVIEW_SESSION_STORAGE_KEY,
} from "@/app/dashboard/interview/interview-storage";
import { initialInterviewEvaluationState } from "@/app/dashboard/interview/state";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  createMockInterviewHistoryAttempt,
  mergeHistoryAttempts,
  type InterviewHistoryAttempt,
} from "@/lib/interview-history";
import type {
  InterviewAnswer,
  InterviewSession,
} from "@/lib/interview-prep";
import { getInterviewModeTitle } from "@/lib/interview-prep";
import { forge } from "@/lib/talentforge-design";

function isStoredSession(value: unknown): value is InterviewSession {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    "questions" in value &&
    Array.isArray((value as { questions?: unknown }).questions)
  );
}

function isStoredAnswers(value: unknown): value is InterviewAnswer[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        typeof item === "object" &&
        item !== null &&
        "questionId" in item &&
        "answer" in item
    )
  );
}

function readStoredSession() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const rawSession = window.localStorage.getItem(INTERVIEW_SESSION_STORAGE_KEY);
    const parsedSession = rawSession ? JSON.parse(rawSession) : null;

    return isStoredSession(parsedSession) ? parsedSession : null;
  } catch {
    window.localStorage.removeItem(INTERVIEW_SESSION_STORAGE_KEY);
    return null;
  }
}

function readStoredAnswers() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const rawAnswers = window.localStorage.getItem(INTERVIEW_ANSWERS_STORAGE_KEY);
    const parsedAnswers = rawAnswers ? JSON.parse(rawAnswers) : [];

    return isStoredAnswers(parsedAnswers) ? parsedAnswers : [];
  } catch {
    window.localStorage.removeItem(INTERVIEW_ANSWERS_STORAGE_KEY);
    return [];
  }
}

function readHistoryAttempts() {
  try {
    const rawHistory = window.localStorage.getItem(INTERVIEW_HISTORY_STORAGE_KEY);
    const parsedHistory = rawHistory ? JSON.parse(rawHistory) : [];

    return Array.isArray(parsedHistory)
      ? parsedHistory.filter(
          (attempt): attempt is InterviewHistoryAttempt =>
            typeof attempt === "object" &&
            attempt !== null &&
            "id" in attempt &&
            "overallScore" in attempt
        )
      : [];
  } catch {
    window.localStorage.removeItem(INTERVIEW_HISTORY_STORAGE_KEY);
    return [];
  }
}

export function InterviewSessionClient() {
  const router = useRouter();
  const [session] = useState<InterviewSession | null>(() => readStoredSession());
  const [answers, setAnswers] = useState<InterviewAnswer[]>(() =>
    readStoredAnswers()
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [state, formAction, pending] = useActionState(
    evaluateMockInterview,
    initialInterviewEvaluationState
  );
  const savedEvaluationRef = useRef("");

  useEffect(() => {
    if (!answers.length) {
      return;
    }

    window.localStorage.setItem(INTERVIEW_ANSWERS_STORAGE_KEY, JSON.stringify(answers));
  }, [answers]);

  useEffect(() => {
    if (state.status !== "success" || !state.evaluation || !session) {
      return;
    }

    if (savedEvaluationRef.current === state.evaluation.sessionId) {
      return;
    }

    savedEvaluationRef.current = state.evaluation.sessionId;

    const completedSession = {
      ...session,
      answers,
      status: "completed" as const,
    };

    window.localStorage.setItem(
      INTERVIEW_SESSION_STORAGE_KEY,
      JSON.stringify(completedSession)
    );
    window.localStorage.setItem(
      INTERVIEW_EVALUATION_STORAGE_KEY,
      JSON.stringify(state.evaluation)
    );
    window.localStorage.setItem(
      INTERVIEW_HISTORY_STORAGE_KEY,
      JSON.stringify(
        mergeHistoryAttempts(
          readHistoryAttempts(),
          createMockInterviewHistoryAttempt({
            evaluation: state.evaluation,
            session: completedSession,
            answers,
          })
        )
      )
    );
    router.push("/dashboard/interview/results");
  }, [answers, router, session, state.evaluation, state.status]);

  const currentQuestion = session?.questions[currentIndex] ?? null;
  const currentAnswer = currentQuestion
    ? answers.find((item) => item.questionId === currentQuestion.id)?.answer ?? ""
    : "";
  const answeredCount = useMemo(
    () => answers.filter((answer) => answer.answer.trim().length > 0).length,
    [answers]
  );
  const allAnswered = Boolean(
    session && answeredCount === session.questions.length && session.questions.length > 0
  );

  function updateAnswer(value: string) {
    if (!currentQuestion) {
      return;
    }

    setAnswers((previous) => {
      const existing = previous.find((item) => item.questionId === currentQuestion.id);

      if (existing) {
        return previous.map((item) =>
          item.questionId === currentQuestion.id
            ? { ...item, answer: value, answeredAt: new Date().toISOString() }
            : item
        );
      }

      return [
        ...previous,
        {
          questionId: currentQuestion.id,
          answer: value,
          answeredAt: new Date().toISOString(),
        },
      ];
    });
  }

  function goNext() {
    if (!session) {
      return;
    }

    setCurrentIndex((index) => Math.min(session.questions.length - 1, index + 1));
  }

  function goPrevious() {
    setCurrentIndex((index) => Math.max(0, index - 1));
  }

  if (!session || !currentQuestion) {
    return (
      <EmptyState
        title="No active interview session"
        description="Generate a mock interview first, then return here to answer questions."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className={`p-5 ${forge.cardStrong}`}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase text-cyan-100">
              {getInterviewModeTitle(session.mode)} Session
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight">
              {session.targetRole}
            </h1>
            <p className="mt-2 text-sm leading-6 text-zinc-400">
              Resume: {session.resumeTitle} · Domain: {session.detectedDomain}
            </p>
          </div>
          <div className="rounded-2xl border border-[#00E5FF]/15 bg-[#00E5FF]/10 px-4 py-3 text-sm text-cyan-50 shadow-[0_0_24px_rgba(0,229,255,0.1)]">
            {answeredCount}/{session.questions.length} answers saved
          </div>
        </div>
        <div className={`mt-5 h-2 ${forge.progressTrack}`}>
          <div
            className={forge.progressFill}
            style={{
              width: `${Math.round(((currentIndex + 1) / session.questions.length) * 100)}%`,
            }}
          />
        </div>
      </div>

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="session" value={JSON.stringify(session)} />
        <input type="hidden" name="answers" value={JSON.stringify(answers)} />

        <section className={forge.cardStrong}>
          <div className="border-b border-white/10 bg-[#070B1F]/60 px-5 py-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-medium uppercase text-cyan-100">
                  Question {currentIndex + 1} of {session.questions.length}
                </p>
                <h2 className="mt-2 text-xl font-semibold leading-7">
                  {currentQuestion.prompt}
                </h2>
              </div>
              <span className="w-fit rounded-full border border-[#8B5CF6]/25 bg-[#8B5CF6]/12 px-3 py-1 text-xs text-purple-100">
                {currentQuestion.difficulty}
              </span>
            </div>
          </div>

          <div className="space-y-4 p-5">
            <div className="grid gap-3 lg:grid-cols-3">
              <InfoBlock title="Focus" items={[currentQuestion.focus]} />
              <InfoBlock
                title="Expected signals"
                items={currentQuestion.expectedSignals}
              />
              <InfoBlock
                title="Resume evidence"
                items={
                  currentQuestion.resumeEvidence.length
                    ? currentQuestion.resumeEvidence
                    : ["No direct resume evidence detected for this prompt."]
                }
              />
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-4 shadow-inner">
              <label htmlFor="answer" className="text-sm font-medium text-zinc-200">
                Your answer
              </label>
              <p className="mt-1 text-xs leading-5 text-zinc-500">
                Use a concise situation, action, and result. Mention resume-backed evidence where possible.
              </p>
              <Textarea
                id="answer"
                value={currentAnswer}
                onChange={(event) => updateAnswer(event.target.value)}
                rows={9}
                placeholder="Type your answer here..."
                className={`mt-3 max-h-[48vh] min-h-52 resize-y overflow-y-auto p-4 ${forge.input}`}
              />
            </div>
          </div>
        </section>

        {state.message ? (
          <p
            aria-live="polite"
            className={
              state.status === "error"
                ? "rounded-md border border-red-300/20 bg-red-400/10 px-3 py-2 text-sm text-red-200"
                : "rounded-md border border-emerald-300/20 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-200"
            }
          >
            {state.message}
          </p>
        ) : null}

        <div className={`${forge.panel} flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between`}>
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={goPrevious}
              disabled={currentIndex === 0}
              className={forge.secondaryButton}
            >
              Previous
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={goNext}
              disabled={currentIndex === session.questions.length - 1}
              className={forge.secondaryButton}
            >
              Next Question
            </Button>
          </div>
          <Button
            type="submit"
            disabled={pending || !allAnswered}
            className={`h-12 px-6 ${forge.primaryButton}`}
          >
            {pending ? "Evaluating..." : "Submit for Evaluation"}
          </Button>
        </div>
      </form>
    </div>
  );
}

function InfoBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div className={forge.metric}>
      <p className="text-xs font-medium uppercase text-cyan-100">{title}</p>
      <ul className="mt-2 space-y-1 text-xs leading-5 text-zinc-400">
        {items.slice(0, 4).map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className={`${forge.card} rounded-3xl p-8 text-center`}>
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-zinc-400">
        {description}
      </p>
      <Button
        asChild
        className={`mt-5 ${forge.primaryButton}`}
      >
        <Link href="/dashboard/interview">Create Interview</Link>
      </Button>
    </div>
  );
}
