"use client";

import Link from "next/link";
import { useState } from "react";

import {
  INTERVIEW_ANSWERS_STORAGE_KEY,
  INTERVIEW_EVALUATION_STORAGE_KEY,
  INTERVIEW_SESSION_STORAGE_KEY,
} from "@/app/dashboard/interview/interview-storage";
import { Button } from "@/components/ui/button";
import type {
  InterviewEvaluation,
  InterviewSession,
} from "@/lib/interview-prep";
import { getInterviewModeTitle } from "@/lib/interview-prep";
import { forge } from "@/lib/talentforge-design";

function isEvaluation(value: unknown): value is InterviewEvaluation {
  return (
    typeof value === "object" &&
    value !== null &&
    "overallScore" in value &&
    "answerEvaluations" in value &&
    Array.isArray((value as { answerEvaluations?: unknown }).answerEvaluations)
  );
}

function isSession(value: unknown): value is InterviewSession {
  return (
    typeof value === "object" &&
    value !== null &&
    "questions" in value &&
    Array.isArray((value as { questions?: unknown }).questions)
  );
}

function readStoredEvaluation() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const rawEvaluation = window.localStorage.getItem(
      INTERVIEW_EVALUATION_STORAGE_KEY
    );
    const parsedEvaluation = rawEvaluation ? JSON.parse(rawEvaluation) : null;

    return isEvaluation(parsedEvaluation) ? parsedEvaluation : null;
  } catch {
    window.localStorage.removeItem(INTERVIEW_EVALUATION_STORAGE_KEY);
    return null;
  }
}

function readStoredSession() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const rawSession = window.localStorage.getItem(INTERVIEW_SESSION_STORAGE_KEY);
    const parsedSession = rawSession ? JSON.parse(rawSession) : null;

    return isSession(parsedSession) ? parsedSession : null;
  } catch {
    window.localStorage.removeItem(INTERVIEW_SESSION_STORAGE_KEY);
    return null;
  }
}

export function InterviewResultsClient() {
  const [evaluation, setEvaluation] = useState<InterviewEvaluation | null>(() =>
    readStoredEvaluation()
  );
  const [session, setSession] = useState<InterviewSession | null>(() =>
    readStoredSession()
  );

  function clearSession() {
    window.localStorage.removeItem(INTERVIEW_SESSION_STORAGE_KEY);
    window.localStorage.removeItem(INTERVIEW_ANSWERS_STORAGE_KEY);
    window.localStorage.removeItem(INTERVIEW_EVALUATION_STORAGE_KEY);
    setEvaluation(null);
    setSession(null);
  }

  if (!evaluation || !session) {
    return (
      <div className={`${forge.card} rounded-3xl p-8 text-center`}>
        <h1 className="text-2xl font-semibold">No interview results yet</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-zinc-400">
          Complete a mock interview session to generate answer-by-answer feedback.
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

  return (
    <div className="space-y-6">
      <section className={forge.cardStrong}>
        <div className="border-b border-white/10 bg-[#070B1F]/60 px-5 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase text-cyan-100">
                Interview Results
              </p>
              <h1 className="mt-2 text-2xl font-semibold">
                {session.targetRole}
              </h1>
              <p className="mt-2 text-sm leading-6 text-zinc-400">
                {getInterviewModeTitle(session.mode)} · Resume: {session.resumeTitle}
              </p>
            </div>
            <div className="rounded-2xl border border-[#00E5FF]/20 bg-[#00E5FF]/10 px-5 py-4 text-center shadow-[0_0_28px_rgba(0,229,255,0.12)]">
              <p className="text-4xl font-semibold text-cyan-100">
                {evaluation.overallScore}
              </p>
              <p className="mt-1 text-xs uppercase text-zinc-400">
                {evaluation.readiness}
              </p>
            </div>
          </div>
        </div>
        <div className="space-y-4 p-5">
          <p className="text-sm leading-7 text-zinc-300">{evaluation.summary}</p>
          <div className="grid gap-4 lg:grid-cols-2">
            <ListCard title="Top Strengths" items={evaluation.topStrengths} tone="good" />
            <ListCard
              title="Priority Improvements"
              items={evaluation.priorityImprovements}
              tone="warn"
            />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className={`${forge.panel} flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between`}>
          <div>
            <p className="text-sm font-semibold uppercase text-cyan-100">
              Answer Feedback
            </p>
            <p className="mt-1 text-sm text-zinc-500">
              Each answer is scored against expected signals and resume-backed evidence.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={clearSession}
            className={forge.secondaryButton}
          >
            Clear saved interview
          </Button>
        </div>

        {evaluation.answerEvaluations.map((answerEvaluation, index) => {
          const question = session.questions.find(
            (item) => item.id === answerEvaluation.questionId
          );

          return (
            <article
              key={answerEvaluation.questionId}
              className={forge.card}
            >
              <div className="border-b border-white/10 bg-[#070B1F]/60 px-5 py-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase text-cyan-100">
                      Question {index + 1}
                    </p>
                    <h2 className="mt-2 text-lg font-semibold leading-7">
                      {question?.prompt ?? "Interview question"}
                    </h2>
                  </div>
                  <span className="w-fit rounded-full border border-[#00E5FF]/20 bg-[#00E5FF]/10 px-3 py-1 text-sm font-semibold text-cyan-100">
                    {answerEvaluation.score}/100
                  </span>
                </div>
              </div>
              <div className="grid gap-4 p-5 lg:grid-cols-3">
                <ListCard
                  title="Feedback"
                  items={[answerEvaluation.feedback]}
                />
                <ListCard
                  title="Strengths"
                  items={answerEvaluation.strengths}
                  tone="good"
                />
                <ListCard
                  title="Improve"
                  items={answerEvaluation.improvements}
                  tone="warn"
                />
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}

function ListCard({
  title,
  items,
  tone = "default",
}: {
  title: string;
  items: string[];
  tone?: "default" | "good" | "warn";
}) {
  const titleTone =
    tone === "good"
      ? "text-emerald-200"
      : tone === "warn"
        ? "text-amber-200"
        : "text-zinc-100";

  return (
    <div className={forge.metric}>
      <p className={`text-sm font-semibold ${titleTone}`}>{title}</p>
      <ul className="mt-3 space-y-2 text-sm leading-6 text-zinc-400">
        {(items.length ? items : ["No items available."]).map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
