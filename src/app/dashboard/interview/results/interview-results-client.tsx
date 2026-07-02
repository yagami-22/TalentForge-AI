"use client";

import Link from "next/link";
import { useState } from "react";
import {
  BrainCircuit,
  Gauge,
  MessageSquareText,
  Sparkles,
  Target,
} from "lucide-react";

import {
  INTERVIEW_ANSWERS_STORAGE_KEY,
  INTERVIEW_EVALUATION_STORAGE_KEY,
  INTERVIEW_SESSION_STORAGE_KEY,
  INTERVIEW_SIMULATOR_CONFIG_STORAGE_KEY,
  type StoredInterviewSimulatorConfig,
} from "@/app/dashboard/interview/interview-storage";
import {
  FeedbackCard,
  InterviewReportCard,
} from "@/app/dashboard/interview/interview-simulator-ui";
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

function readSimulatorConfig() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const rawConfig = window.localStorage.getItem(
      INTERVIEW_SIMULATOR_CONFIG_STORAGE_KEY
    );
    const parsedConfig = rawConfig ? JSON.parse(rawConfig) : null;

    return parsedConfig &&
      typeof parsedConfig === "object" &&
      "mode" in parsedConfig &&
      "company" in parsedConfig
      ? (parsedConfig as StoredInterviewSimulatorConfig)
      : null;
  } catch {
    window.localStorage.removeItem(INTERVIEW_SIMULATOR_CONFIG_STORAGE_KEY);
    return null;
  }
}

function average(values: number[]) {
  if (!values.length) return 0;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function scoreByQuestionText(
  evaluation: InterviewEvaluation,
  session: InterviewSession,
  pattern: RegExp,
  fallbackMultiplier: number
) {
  const scores = evaluation.answerEvaluations
    .filter((answer) => {
      const question = session.questions.find((item) => item.id === answer.questionId);
      return pattern.test(`${question?.prompt ?? ""} ${question?.focus ?? ""}`);
    })
    .map((answer) => answer.score);

  return scores.length
    ? average(scores)
    : Math.max(0, Math.min(100, Math.round(evaluation.overallScore * fallbackMultiplier)));
}

function collectMissedConcepts(evaluation: InterviewEvaluation) {
  return Array.from(
    new Set(evaluation.answerEvaluations.flatMap((answer) => answer.missedSignals))
  ).slice(0, 10);
}

function nextPracticePlan(
  evaluation: InterviewEvaluation,
  session: InterviewSession,
  config: StoredInterviewSimulatorConfig | null
) {
  const missed = collectMissedConcepts(evaluation);
  const mode = config?.mode ?? getInterviewModeTitle(session.mode);

  return [
    `Repeat one ${mode} round at ${config?.difficulty ?? "adaptive"} difficulty.`,
    missed[0] ? `Review ${missed[0]} before the next attempt.` : "Review expected signals for missed questions.",
    "Practice one answer out loud using a 90-second structure.",
    "Redo skipped or low-scoring questions without hints.",
  ];
}

export function InterviewResultsClient() {
  const [evaluation, setEvaluation] = useState<InterviewEvaluation | null>(() =>
    readStoredEvaluation()
  );
  const [session, setSession] = useState<InterviewSession | null>(() =>
    readStoredSession()
  );
  const [config] = useState<StoredInterviewSimulatorConfig | null>(() =>
    readSimulatorConfig()
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
      <div className={`${forge.card} p-8 text-center`}>
        <h1 className="text-2xl font-semibold">No interview report yet</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-zinc-400">
          Complete an interview simulator session to generate score breakdowns, missed concepts, and a next practice plan.
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

  const technicalScore = scoreByQuestionText(
    evaluation,
    session,
    /technical|api|database|architecture|system|frontend|backend|dsa|complexity|code/i,
    0.96
  );
  const communicationScore = scoreByQuestionText(
    evaluation,
    session,
    /communicat|explain|behavior|team|conflict|leadership|star/i,
    0.92
  );
  const problemSolvingScore = scoreByQuestionText(
    evaluation,
    session,
    /solve|approach|tradeoff|debug|bug|edge|scal/i,
    0.94
  );
  const confidenceScore = Math.round(
    (evaluation.overallScore + communicationScore + problemSolvingScore) / 3
  );
  const missedConcepts = collectMissedConcepts(evaluation);
  const plan = nextPracticePlan(evaluation, session, config);

  return (
    <div className="space-y-6">
      <section className={forge.cardStrong}>
        <div className="border-b border-white/10 bg-[#101827]/60 px-5 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase text-cyan-100">
                Advanced Interview Report
              </p>
              <h1 className="mt-2 text-2xl font-semibold">
                {session.targetRole}
              </h1>
              <p className="mt-2 text-sm leading-6 text-zinc-400">
                {config?.mode ?? getInterviewModeTitle(session.mode)} · {config?.company ?? session.detectedDomain} · {config?.difficulty ?? "Adaptive"} · Resume: {session.resumeTitle}
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
        <div className="space-y-5 p-5">
          <p className="text-sm leading-7 text-zinc-300">{evaluation.summary}</p>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <InterviewReportCard
              title="Overall"
              value={String(evaluation.overallScore)}
              helper="Weighted session score"
              icon={Sparkles}
            />
            <InterviewReportCard
              title="Technical"
              value={String(technicalScore)}
              helper="Technical signal quality"
              icon={BrainCircuit}
            />
            <InterviewReportCard
              title="Communication"
              value={String(communicationScore)}
              helper="Clarity and structure"
              icon={MessageSquareText}
            />
            <InterviewReportCard
              title="Problem Solving"
              value={String(problemSolvingScore)}
              helper="Approach and tradeoffs"
              icon={Target}
            />
            <InterviewReportCard
              title="Confidence"
              value={String(confidenceScore)}
              helper="Readiness under pressure"
              icon={Gauge}
            />
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            <FeedbackCard title="Strengths" items={evaluation.topStrengths} tone="good" />
            <FeedbackCard
              title="Weaknesses"
              items={evaluation.priorityImprovements}
              tone="warn"
            />
            <FeedbackCard
              title="Missed Concepts"
              items={missedConcepts}
              tone="warn"
            />
          </div>
          <FeedbackCard
            title="Next Practice Plan"
            items={plan}
          />
        </div>
      </section>

      <section className="space-y-4">
        <div className={`${forge.panel} flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between`}>
          <div>
            <p className="text-sm font-semibold uppercase text-cyan-100">
              Answer-by-answer feedback
            </p>
            <p className="mt-1 text-sm text-zinc-500">
              Each answer is evaluated against expected signals, resume evidence, and role fit.
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
              <div className="border-b border-white/10 bg-[#101827]/60 px-5 py-4">
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
              <div className="grid gap-4 p-5 lg:grid-cols-4">
                <FeedbackCard
                  title="Feedback"
                  items={[answerEvaluation.feedback]}
                />
                <FeedbackCard
                  title="Strengths"
                  items={answerEvaluation.strengths}
                  tone="good"
                />
                <FeedbackCard
                  title="Improve"
                  items={answerEvaluation.improvements}
                  tone="warn"
                />
                <FeedbackCard
                  title="Missed Signals"
                  items={answerEvaluation.missedSignals}
                  tone="warn"
                />
              </div>
            </article>
          );
        })}
      </section>

      <div className="flex flex-wrap gap-3">
        <Button asChild className={forge.primaryButton}>
          <Link href="/dashboard/interview">Start another simulation</Link>
        </Button>
        <Button asChild variant="outline" className={forge.secondaryButton}>
          <Link href="/dashboard/interview/history">View history</Link>
        </Button>
      </div>
    </div>
  );
}
