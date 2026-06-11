"use client";

import Link from "next/link";
import { useState } from "react";

import {
  OA_ANSWERS_STORAGE_KEY,
  OA_REPORT_STORAGE_KEY,
  OA_SESSION_STORAGE_KEY,
} from "@/app/dashboard/interview/interview-storage";
import { Button } from "@/components/ui/button";
import type { OAReport } from "@/lib/oa-evaluation";
import type { OASession } from "@/lib/oa-session";
import { forge } from "@/lib/talentforge-design";

function isOAReport(value: unknown): value is OAReport {
  return (
    typeof value === "object" &&
    value !== null &&
    "readinessScore" in value &&
    "answerEvaluations" in value &&
    Array.isArray((value as { answerEvaluations?: unknown }).answerEvaluations)
  );
}

function isOASession(value: unknown): value is OASession {
  return (
    typeof value === "object" &&
    value !== null &&
    "questions" in value &&
    Array.isArray((value as { questions?: unknown }).questions)
  );
}

function readReport() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const rawReport = window.localStorage.getItem(OA_REPORT_STORAGE_KEY);
    const parsedReport = rawReport ? JSON.parse(rawReport) : null;

    return isOAReport(parsedReport) ? parsedReport : null;
  } catch {
    window.localStorage.removeItem(OA_REPORT_STORAGE_KEY);
    return null;
  }
}

function readSession() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const rawSession = window.localStorage.getItem(OA_SESSION_STORAGE_KEY);
    const parsedSession = rawSession ? JSON.parse(rawSession) : null;

    return isOASession(parsedSession) ? parsedSession : null;
  } catch {
    window.localStorage.removeItem(OA_SESSION_STORAGE_KEY);
    return null;
  }
}

export function OAResultsClient() {
  const [report, setReport] = useState<OAReport | null>(() => readReport());
  const [session, setSession] = useState<OASession | null>(() => readSession());

  function clearReport() {
    window.localStorage.removeItem(OA_SESSION_STORAGE_KEY);
    window.localStorage.removeItem(OA_ANSWERS_STORAGE_KEY);
    window.localStorage.removeItem(OA_REPORT_STORAGE_KEY);
    setReport(null);
    setSession(null);
  }

  if (!report || !session) {
    return (
      <div className={`${forge.card} rounded-3xl p-8 text-center`}>
        <h1 className="text-2xl font-semibold">No OA report yet</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-zinc-400">
          Complete an OA Assessment session to generate a readiness score and answer feedback.
        </p>
        <Button asChild className={`mt-5 ${forge.primaryButton}`}>
          <Link href="/dashboard/interview">Create OA Assessment</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className={forge.cardStrong}>
        <div className="border-b border-white/10 bg-[#070B1F]/60 px-5 py-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase text-cyan-100">
                OA Assessment Report
              </p>
              <h1 className="mt-2 text-2xl font-semibold">{session.targetRole}</h1>
              <p className="mt-2 text-sm leading-6 text-zinc-400">
                Resume: {session.resumeTitle} · {session.questions.length} selected questions
              </p>
            </div>
            <div className="rounded-3xl border border-[#00E5FF]/20 bg-[#00E5FF]/10 px-6 py-5 text-center shadow-[0_0_32px_rgba(0,229,255,0.14)]">
              <p className="text-5xl font-semibold text-cyan-100">
                {report.readinessScore}
              </p>
              <p className="mt-2 text-xs uppercase text-zinc-400">
                {report.readiness}
              </p>
            </div>
          </div>
        </div>
        <div className="space-y-5 p-5">
          <p className="text-sm leading-7 text-zinc-300">{report.summary}</p>
            <div className="grid gap-4 lg:grid-cols-3">
            <ListCard title="Strengths" items={report.strongestAreas} tone="good" />
            <ListCard title="Weaknesses" items={report.weakestAreas} tone="warn" />
            <ListCard
              title="Recommendations"
              items={report.recommendedPractice}
              tone="default"
            />
          </div>
        </div>
      </section>

      <section className={forge.card}>
        <div className="border-b border-white/10 bg-[#070B1F]/60 px-5 py-4">
          <p className="text-sm font-semibold uppercase text-cyan-100">
            Category Breakdown
          </p>
          <p className="mt-1 text-sm text-zinc-500">
            Scores are generated from expected answer points, expected topics, and answer completeness.
          </p>
        </div>
        <div className="grid gap-4 p-5 lg:grid-cols-4">
          {report.categoryBreakdown.map((category) => (
            <div key={category.name} className={forge.metric}>
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-zinc-100">
                  {category.name}
                </p>
                <span className="text-sm font-semibold text-cyan-100">
                  {category.percentage}%
                </span>
              </div>
              <div className={`mt-3 h-2 ${forge.progressTrack}`}>
                <div
                  className={forge.progressFill}
                  style={{ width: `${category.percentage}%` }}
                />
              </div>
              <p className="mt-3 text-xs leading-5 text-zinc-500">
                {category.summary}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className={`${forge.panel} flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between`}>
          <div>
            <p className="text-sm font-semibold uppercase text-cyan-100">
              Question Feedback
            </p>
            <p className="mt-1 text-sm text-zinc-500">
              Local deterministic scoring only. No AI evaluation is used.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={clearReport}
            className={forge.secondaryButton}
          >
            Clear OA report
          </Button>
        </div>

        {report.answerEvaluations.map((evaluation, index) => {
          const question = session.questions.find(
            (item) => item.id === evaluation.questionId
          );

          return (
            <article key={evaluation.questionId} className={forge.card}>
              <div className="border-b border-white/10 bg-[#070B1F]/60 px-5 py-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase text-cyan-100">
                      Question {index + 1}
                    </p>
                    <h2 className="mt-2 text-lg font-semibold leading-7">
                      {question?.title ?? evaluation.questionTitle}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-zinc-500">
                      {question?.prompt}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="w-fit rounded-full border border-[#00E5FF]/20 bg-[#00E5FF]/10 px-3 py-1 text-sm font-semibold text-cyan-100">
                      {evaluation.score}/100
                    </span>
                    <span className="w-fit rounded-full border border-[#8B5CF6]/25 bg-[#8B5CF6]/10 px-3 py-1 text-sm font-semibold text-purple-100">
                      {evaluation.verdict}
                    </span>
                  </div>
                </div>
              </div>
              <div className="grid gap-4 p-5 lg:grid-cols-5">
                <ScoreCard title="Accuracy" score={evaluation.accuracyScore} />
                <ScoreCard
                  title="Technical Depth"
                  score={evaluation.technicalDepthScore}
                />
                <ScoreCard title="Relevance" score={evaluation.relevanceScore} />
                <ScoreCard
                  title="Communication"
                  score={evaluation.communicationScore}
                />
                <ScoreCard
                  title="Completeness"
                  score={evaluation.completenessScore}
                />
              </div>
              <div className="grid gap-4 px-5 pb-5 lg:grid-cols-3">
                <ListCard title="Feedback" items={[evaluation.feedback]} />
                <ListCard title="Strengths" items={evaluation.strengths} tone="good" />
                <ListCard
                  title="Weaknesses"
                  items={evaluation.weaknesses}
                  tone="warn"
                />
              </div>
              <div className="grid gap-4 px-5 pb-5 lg:grid-cols-3">
                <ListCard
                  title="Missing Points"
                  items={evaluation.missingPoints}
                  tone="warn"
                />
                <ListCard
                  title="Suggested Better Answer"
                  items={[evaluation.idealAnswerSummary]}
                  tone="good"
                />
                <ListCard
                  title="Next Practice"
                  items={evaluation.improvementSuggestions}
                />
              </div>
              <div className="grid gap-4 px-5 pb-5 lg:grid-cols-3">
                <ListCard
                  title="Matched Concepts"
                  items={evaluation.matchedConcepts}
                  tone="good"
                />
                <ListCard
                  title="Missing Concepts"
                  items={evaluation.missingConcepts}
                  tone="warn"
                />
                <ListCard
                  title="Score Reasoning"
                  items={evaluation.scoreReasoning}
                />
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}

function ScoreCard({ title, score }: { title: string; score: number }) {
  return (
    <div className={forge.metric}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase text-cyan-100">{title}</p>
        <span className="text-sm font-semibold text-white">{score}%</span>
      </div>
      <div className={`mt-3 h-2 ${forge.progressTrack}`}>
        <div className={forge.progressFill} style={{ width: `${score}%` }} />
      </div>
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
