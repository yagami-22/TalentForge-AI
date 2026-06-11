"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Clock,
  Medal,
  Target,
  TrendingUp,
} from "lucide-react";

import {
  INTERVIEW_ANSWERS_STORAGE_KEY,
  INTERVIEW_EVALUATION_STORAGE_KEY,
  INTERVIEW_HISTORY_STORAGE_KEY,
  INTERVIEW_SESSION_STORAGE_KEY,
  OA_ANSWERS_STORAGE_KEY,
  OA_REPORT_STORAGE_KEY,
  OA_SESSION_STORAGE_KEY,
} from "@/app/dashboard/interview/interview-storage";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  createMockInterviewHistoryAttempt,
  createOAHistoryAttempt,
  mergeHistoryAttempts,
  type InterviewHistoryAttempt,
} from "@/lib/interview-history";
import type { InterviewAnswer, InterviewEvaluation, InterviewSession } from "@/lib/interview-prep";
import type { OAReport } from "@/lib/oa-evaluation";
import type { OAAnswer, OASession } from "@/lib/oa-session";
import { forge } from "@/lib/talentforge-design";

type TrendMetric =
  | "overallScore"
  | "accuracy"
  | "technicalDepth"
  | "communication"
  | "completeness";

function isHistoryAttempt(value: unknown): value is InterviewHistoryAttempt {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    "attemptDate" in value &&
    "assessmentType" in value &&
    "overallScore" in value &&
    typeof (value as { id?: unknown }).id === "string" &&
    typeof (value as { overallScore?: unknown }).overallScore === "number"
  );
}

function isOAReport(value: unknown): value is OAReport {
  return (
    typeof value === "object" &&
    value !== null &&
    "overallScore" in value &&
    "answerEvaluations" in value &&
    Array.isArray((value as { answerEvaluations?: unknown }).answerEvaluations)
  );
}

function isOASession(value: unknown): value is OASession {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    "questions" in value &&
    Array.isArray((value as { questions?: unknown }).questions)
  );
}

function isOAAnswers(value: unknown): value is OAAnswer[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        typeof item === "object" &&
        item !== null &&
        "questionId" in item &&
        "answer" in item &&
        "elapsedSeconds" in item
    )
  );
}

function isInterviewEvaluation(value: unknown): value is InterviewEvaluation {
  return (
    typeof value === "object" &&
    value !== null &&
    "overallScore" in value &&
    "answerEvaluations" in value &&
    Array.isArray((value as { answerEvaluations?: unknown }).answerEvaluations)
  );
}

function isInterviewSession(value: unknown): value is InterviewSession {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    "questions" in value &&
    Array.isArray((value as { questions?: unknown }).questions)
  );
}

function isInterviewAnswers(value: unknown): value is InterviewAnswer[] {
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

function readJson<T>(
  key: string,
  guard: (value: unknown) => value is T,
  fallback: T
) {
  try {
    const rawValue = window.localStorage.getItem(key);
    const parsedValue = rawValue ? JSON.parse(rawValue) : fallback;

    return guard(parsedValue) ? parsedValue : fallback;
  } catch {
    window.localStorage.removeItem(key);
    return fallback;
  }
}

function readHistory() {
  return readJson<InterviewHistoryAttempt[]>(
    INTERVIEW_HISTORY_STORAGE_KEY,
    (value): value is InterviewHistoryAttempt[] =>
      Array.isArray(value) && value.every(isHistoryAttempt),
    []
  );
}

function loadInterviewHistory() {
  let attempts = readHistory();
  const oaReport = readJson<OAReport | null>(
    OA_REPORT_STORAGE_KEY,
    (value): value is OAReport | null => value === null || isOAReport(value),
    null
  );
  const oaSession = readJson<OASession | null>(
    OA_SESSION_STORAGE_KEY,
    (value): value is OASession | null => value === null || isOASession(value),
    null
  );
  const oaAnswers = readJson<OAAnswer[]>(
    OA_ANSWERS_STORAGE_KEY,
    isOAAnswers,
    []
  );
  const interviewEvaluation = readJson<InterviewEvaluation | null>(
    INTERVIEW_EVALUATION_STORAGE_KEY,
    (value): value is InterviewEvaluation | null =>
      value === null || isInterviewEvaluation(value),
    null
  );
  const interviewSession = readJson<InterviewSession | null>(
    INTERVIEW_SESSION_STORAGE_KEY,
    (value): value is InterviewSession | null =>
      value === null || isInterviewSession(value),
    null
  );
  const interviewAnswers = readJson<InterviewAnswer[]>(
    INTERVIEW_ANSWERS_STORAGE_KEY,
    isInterviewAnswers,
    []
  );

  if (oaReport && oaSession) {
    attempts = mergeHistoryAttempts(
      attempts,
      createOAHistoryAttempt({
        report: oaReport,
        session: oaSession,
        answers: oaAnswers,
      })
    );
  }

  if (interviewEvaluation && interviewSession) {
    attempts = mergeHistoryAttempts(
      attempts,
      createMockInterviewHistoryAttempt({
        evaluation: interviewEvaluation,
        session: interviewSession,
        answers: interviewAnswers,
      })
    );
  }

  window.localStorage.setItem(INTERVIEW_HISTORY_STORAGE_KEY, JSON.stringify(attempts));

  return attempts;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatDuration(totalSeconds: number) {
  if (!totalSeconds) return "Not tracked";

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return minutes ? `${minutes}m ${seconds}s` : `${seconds}s`;
}

function scoreTone(score: number) {
  if (score >= 80) return "text-emerald-300";
  if (score >= 60) return "text-cyan-200";
  if (score >= 45) return "text-amber-200";
  return "text-red-200";
}

function metricLabel(metric: TrendMetric) {
  const labels: Record<TrendMetric, string> = {
    overallScore: "Overall Trend",
    accuracy: "Accuracy Trend",
    technicalDepth: "Technical Trend",
    communication: "Communication Trend",
    completeness: "Completeness Trend",
  };

  return labels[metric];
}

function metricShortLabel(metric: TrendMetric) {
  const labels: Record<TrendMetric, string> = {
    overallScore: "Overall",
    accuracy: "Accuracy",
    technicalDepth: "Technical",
    communication: "Communication",
    completeness: "Completeness",
  };

  return labels[metric];
}

function compactTrend(attempts: InterviewHistoryAttempt[], metric: TrendMetric) {
  return attempts.map((attempt) => attempt[metric]).join(" → ");
}

function getBestAttempt(attempts: InterviewHistoryAttempt[]) {
  return attempts.reduce<InterviewHistoryAttempt | null>((best, attempt) => {
    if (!best || attempt.overallScore > best.overallScore) return attempt;
    return best;
  }, null);
}

function recurringWeaknesses(attempts: InterviewHistoryAttempt[]) {
  const counts = new Map<string, number>();

  attempts.forEach((attempt) => {
    attempt.weaknesses.forEach((weakness) => {
      const cleaned = weakness.replace(/\s+/g, " ").trim();
      if (!cleaned) return;
      counts.set(cleaned, (counts.get(cleaned) ?? 0) + 1);
    });

    const scoreRows: Array<[string, number]> = [
      ["Accuracy", attempt.accuracy],
      ["Technical Depth", attempt.technicalDepth],
      ["Relevance", attempt.relevance],
      ["Completeness", attempt.completeness],
      ["Communication", attempt.communication],
    ];

    scoreRows.forEach(([name, score]) => {
      if (typeof score === "number" && score < 65) {
        counts.set(name, (counts.get(name) ?? 0) + 1);
      }
    });
  });

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, count]) => ({ name, count }));
}

function practiceRecommendations(attempts: InterviewHistoryAttempt[]) {
  if (!attempts.length) {
    return [
      "Complete an OA Assessment to create your first performance baseline.",
      "Run a Technical Interview after OA to compare implementation depth with communication quality.",
    ];
  }

  const latest = attempts.at(-1)!;
  const weaknessNames = recurringWeaknesses(attempts).map((item) => item.name);
  const recommendations = [
    latest.accuracy < 70
      ? "Redo low-accuracy questions and compare your answer against the ideal answer points."
      : "",
    latest.technicalDepth < 70
      ? "Practice explaining implementation details, edge cases, tradeoffs, and tests."
      : "",
    latest.communication < 70
      ? "Use a clearer answer structure: approach, reasoning, implementation, validation."
      : "",
    latest.completeness < 70
      ? "Before submitting, add missing constraints, failure cases, and a validation plan."
      : "",
    ...weaknessNames
      .filter((name) => !/^\d+$/.test(name))
      .slice(0, 3)
      .map((name) => `Schedule targeted practice for ${name}.`),
  ].filter(Boolean);

  return recommendations.length
    ? recommendations.slice(0, 6)
    : ["Maintain momentum with harder mixed OA and project deep-dive rounds."];
}

export function InterviewHistoryTable({
  attempts,
}: {
  attempts: InterviewHistoryAttempt[];
}) {
  return (
    <Card className={`${forge.card} overflow-hidden`}>
      <CardHeader className="border-b border-white/10 bg-[#070B1F]/60">
        <CardTitle className="text-lg">Attempt History</CardTitle>
        <CardDescription className="text-zinc-400">
          Every saved OA Assessment and mock interview attempt.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-white/10 bg-black/20 text-xs uppercase text-zinc-500">
              <tr>
                <th className="px-4 py-3">Attempt</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Score</th>
                <th className="px-4 py-3">Answered</th>
                <th className="px-4 py-3">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {attempts.map((attempt, index) => (
                <tr key={attempt.id} className="text-zinc-300">
                  <td className="px-4 py-4 font-semibold text-white">
                    Attempt #{index + 1}
                  </td>
                  <td className="px-4 py-4">{attempt.assessmentType}</td>
                  <td className="px-4 py-4 text-zinc-400">
                    {formatDate(attempt.attemptDate)}
                  </td>
                  <td className={`px-4 py-4 font-semibold ${scoreTone(attempt.overallScore)}`}>
                    {attempt.overallScore}/100
                  </td>
                  <td className="px-4 py-4">{attempt.questionsAnswered}</td>
                  <td className="px-4 py-4 text-zinc-400">
                    {formatDuration(attempt.timeSpent)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

export function InterviewTrendChart({
  attempts,
  metric,
}: {
  attempts: InterviewHistoryAttempt[];
  metric: TrendMetric;
}) {
  return (
    <Card className={`${forge.card} overflow-hidden`}>
      <CardHeader className="border-b border-white/10 bg-[#070B1F]/60 pb-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base">{metricLabel(metric)}</CardTitle>
            <CardDescription className="mt-1 text-xs text-zinc-500">
              {compactTrend(attempts, metric) || "No data yet"}
            </CardDescription>
          </div>
          <BarChart3 className="h-4 w-4 text-cyan-200" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {attempts.map((attempt, index) => (
          <div key={`${attempt.id}-${metric}`} className="space-y-1">
            <div className="flex items-center justify-between text-xs text-zinc-500">
              <span>Attempt #{index + 1}</span>
              <span>{attempt[metric]}%</span>
            </div>
            <div className={`h-2 ${forge.progressTrack}`}>
              <div
                className={forge.progressFill}
                style={{ width: `${attempt[metric]}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function BestAttemptCard({
  attempt,
  attemptNumber,
}: {
  attempt: InterviewHistoryAttempt | null;
  attemptNumber: number;
}) {
  return (
    <Card className={`${forge.cardStrong} overflow-hidden`}>
      <CardHeader className="border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <span className="rounded-2xl border border-[#00E5FF]/20 bg-[#00E5FF]/10 p-2 text-cyan-100">
            <Medal className="h-5 w-5" />
          </span>
          <div>
            <CardTitle>Best Attempt</CardTitle>
            <CardDescription className="text-zinc-400">
              Your highest scoring saved attempt.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {attempt ? (
          <div className="space-y-4">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-sm text-zinc-400">Attempt #{attemptNumber}</p>
                <p className="mt-1 text-xl font-semibold text-white">
                  {attempt.assessmentType}
                </p>
              </div>
              <p className={`text-5xl font-semibold ${scoreTone(attempt.overallScore)}`}>
                {attempt.overallScore}
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {(["accuracy", "technicalDepth", "communication", "completeness"] as const).map(
                (metric) => (
                  <div key={metric} className={forge.metric}>
                    <p className="text-xs uppercase text-zinc-500">
                      {metricShortLabel(metric)}
                    </p>
                    <p className="mt-1 text-lg font-semibold text-zinc-100">
                      {attempt[metric]}%
                    </p>
                  </div>
                )
              )}
            </div>
          </div>
        ) : (
          <p className="text-sm leading-6 text-zinc-400">
            Complete an OA or interview attempt to unlock your best-attempt card.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export function WeaknessAnalysisCard({
  attempts,
}: {
  attempts: InterviewHistoryAttempt[];
}) {
  const weaknesses = recurringWeaknesses(attempts);
  const recommendations = practiceRecommendations(attempts);

  return (
    <Card className={`${forge.card} overflow-hidden`}>
      <CardHeader className="border-b border-white/10 bg-[#070B1F]/60">
        <div className="flex items-center gap-3">
          <span className="rounded-2xl border border-amber-300/20 bg-amber-300/10 p-2 text-amber-100">
            <Target className="h-4 w-4" />
          </span>
          <div>
            <CardTitle className="text-lg">Weakest Categories</CardTitle>
            <CardDescription className="text-zinc-400">
              Recurring gaps and practice recommendations.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-amber-300/15 bg-amber-300/[0.06] p-4">
          <p className="text-sm font-semibold text-amber-200">
            Recurring Weaknesses
          </p>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-zinc-300">
            {(weaknesses.length
              ? weaknesses.map((weakness) => `${weakness.name} (${weakness.count}x)`)
              : ["No recurring weakness detected yet."]
            ).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-[#00E5FF]/15 bg-[#00E5FF]/[0.06] p-4">
          <p className="text-sm font-semibold text-cyan-100">
            Practice Recommendations
          </p>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-zinc-300">
            {recommendations.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

export function InterviewHistoryClient() {
  const [attempts, setAttempts] = useState<InterviewHistoryAttempt[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setAttempts(loadInterviewHistory());
      setLoaded(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const bestAttempt = useMemo(() => getBestAttempt(attempts), [attempts]);
  const bestAttemptNumber = bestAttempt
    ? attempts.findIndex((attempt) => attempt.id === bestAttempt.id) + 1
    : 0;
  const latestAttempt = attempts.at(-1) ?? null;

  if (!loaded) {
    return (
      <Card className={forge.card}>
        <CardContent className="p-8 text-center text-zinc-400">
          Loading interview history...
        </CardContent>
      </Card>
    );
  }

  if (!attempts.length) {
    return (
      <Card className={forge.cardStrong}>
        <CardHeader>
          <CardTitle>No interview history yet</CardTitle>
          <CardDescription className="text-zinc-400">
            Complete an OA Assessment or mock interview to start tracking trends.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className={forge.primaryButton}>
            <Link href="/dashboard/interview">Start Practice</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <section className={forge.cardStrong}>
        <div className="grid gap-4 p-5 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <p className={forge.badge}>Interview History</p>
            <h1 className="mt-3 text-2xl font-semibold text-white">
              {attempts.length} saved {attempts.length === 1 ? "attempt" : "attempts"}
            </h1>
            <p className="mt-2 text-sm leading-6 text-zinc-400">
              Latest attempt: {latestAttempt?.assessmentType} on{" "}
              {latestAttempt ? formatDate(latestAttempt.attemptDate) : "not available"}.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <Metric icon={Activity} label="Latest Score" value={`${latestAttempt?.overallScore ?? 0}`} />
            <Metric icon={Clock} label="Answered" value={`${latestAttempt?.questionsAnswered ?? 0}`} />
            <Metric icon={TrendingUp} label="Best Score" value={`${bestAttempt?.overallScore ?? 0}`} />
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <BestAttemptCard attempt={bestAttempt} attemptNumber={bestAttemptNumber} />
        <WeaknessAnalysisCard attempts={attempts} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <InterviewTrendChart attempts={attempts} metric="overallScore" />
        <InterviewTrendChart attempts={attempts} metric="accuracy" />
        <InterviewTrendChart attempts={attempts} metric="technicalDepth" />
        <InterviewTrendChart attempts={attempts} metric="communication" />
      </div>

      <Card className={`${forge.card} overflow-hidden`}>
        <CardHeader className="border-b border-white/10 bg-[#070B1F]/60">
          <CardTitle className="text-lg">Trend Analytics</CardTitle>
          <CardDescription className="text-zinc-400">
            Score movement across attempts.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {(["accuracy", "technicalDepth", "communication", "overallScore"] as const).map(
            (metric) => (
              <div key={metric} className={forge.metric}>
                <p className="text-xs font-medium uppercase text-zinc-500">
                  {metricShortLabel(metric)}
                </p>
                <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-zinc-100">
                  {compactTrend(attempts, metric).split(" → ").map((score, index, array) => (
                    <span key={`${metric}-${index}`} className="inline-flex items-center gap-2">
                      <span>{score}</span>
                      {index < array.length - 1 ? (
                        <ArrowRight className="h-3 w-3 text-zinc-500" />
                      ) : null}
                    </span>
                  ))}
                </p>
              </div>
            )
          )}
        </CardContent>
      </Card>

      <InterviewHistoryTable attempts={attempts} />
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Activity;
  label: string;
  value: string;
}) {
  return (
    <div className={forge.metric}>
      <Icon className="h-4 w-4 text-cyan-200" />
      <p className="mt-2 text-xs font-medium uppercase text-zinc-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}
