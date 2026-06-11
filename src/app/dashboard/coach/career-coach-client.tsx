"use client";

import Link from "next/link";
import { useEffect, useMemo, useSyncExternalStore } from "react";
import {
  ArrowRight,
  BarChart3,
  BrainCircuit,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Compass,
  Layers3,
  RefreshCw,
  Sparkles,
  Target,
  TrendingUp,
  TriangleAlert,
  Users,
} from "lucide-react";

import {
  INTERVIEW_EVALUATION_STORAGE_KEY,
  OA_REPORT_STORAGE_KEY,
} from "@/app/dashboard/interview/interview-storage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  buildCareerCoachReport,
  type CareerCoachReport,
  type CareerCoachResumeSnapshot,
  type CareerCoachGap,
  type CareerCoachRoadmapItem,
  type CareerCoachScoreCard,
  type CareerCoachSkillMaturity,
  type CareerCoachStrategicRecommendation,
  type CareerCoachTargetRoleMetric,
  type CareerCoachTimelineItem,
} from "@/lib/career-coach";
import type { ATSOptimizationAnalysis } from "@/lib/ats-optimizer";
import type { InterviewEvaluation } from "@/lib/interview-prep";
import type { JobDescriptionMatchAnalysis } from "@/lib/jd-match-analyzer";
import type { OAReport } from "@/lib/oa-evaluation";
import { forge } from "@/lib/talentforge-design";

const ATS_STORAGE_KEY = "talentforge.atsOptimizer.latest";
const JD_MATCH_STORAGE_KEY = "talentforge.jdMatch.latest";
const COACH_STORAGE_KEY = "talentforge.careerCoach.latest";
const COACH_SNAPSHOTS_KEY = "talentforge.careerCoach.snapshots";
const COACH_STORAGE_EVENT = "talentforge.careerCoach.storage";

type CareerCoachSnapshot = {
  generatedAt: string;
  readiness: number;
  resume: number | null;
  ats: number | null;
  jdMatch: number | null;
  interview: number | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readStoredAnalysis<T>(key: string): T | null {
  const parsed = readJSON<unknown>(key);

  if (!isRecord(parsed) || !("analysis" in parsed) || !isRecord(parsed.analysis)) {
    return null;
  }

  return parsed.analysis as T;
}

function isCareerCoachReport(value: unknown): value is CareerCoachReport {
  return (
    isRecord(value) &&
    typeof value.generatedAt === "string" &&
    typeof value.careerReadinessScore === "number" &&
    typeof value.targetRole === "string" &&
    isRecord(value.scores) &&
    Array.isArray(value.missingData) &&
    Array.isArray(value.strongestAreas) &&
    Array.isArray(value.weakestAreas) &&
    Array.isArray(value.sevenDayActionPlan) &&
    Array.isArray(value.thirtyDayRoadmap) &&
    isRecord(value.strategicRecommendations) &&
    isRecord(value.careerGapAnalysis) &&
    isRecord(value.impactRanking) &&
    isRecord(value.recruiterSimulation) &&
    Array.isArray(value.skillMaturity) &&
    Array.isArray(value.targetRoleComparison) &&
    isRecord(value.readinessFormula)
  );
}

function readJSON<T>(key: string): T | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    window.localStorage.removeItem(key);
    return null;
  }
}

function readLatestATSReport() {
  return readStoredAnalysis<ATSOptimizationAnalysis>(ATS_STORAGE_KEY);
}

function readLatestJDMatchReport() {
  return readStoredAnalysis<JobDescriptionMatchAnalysis>(JD_MATCH_STORAGE_KEY);
}

function readLatestOAReport() {
  return readJSON<OAReport>(OA_REPORT_STORAGE_KEY);
}

function readLatestInterviewReport() {
  return readJSON<InterviewEvaluation>(INTERVIEW_EVALUATION_STORAGE_KEY);
}

function readSavedCoachReport() {
  const saved = readJSON<unknown>(COACH_STORAGE_KEY);

  if (!saved) {
    return null;
  }

  if (!isCareerCoachReport(saved)) {
    window.localStorage.removeItem(COACH_STORAGE_KEY);
    return null;
  }

  return saved;
}

function readCoachSnapshots() {
  const saved = readJSON<unknown>(COACH_SNAPSHOTS_KEY);

  if (!Array.isArray(saved)) {
    return [];
  }

  return saved.filter((item): item is CareerCoachSnapshot => {
    return (
      isRecord(item) &&
      typeof item.generatedAt === "string" &&
      typeof item.readiness === "number"
    );
  });
}

function scoreValue(score: number | null | undefined) {
  return typeof score === "number" ? score : null;
}

function delta(current: number | null, previous: number | null) {
  if (current === null || previous === null) return null;
  return current - previous;
}

function withProgressTracking(report: CareerCoachReport) {
  const snapshots = readCoachSnapshots();
  const previous = snapshots.at(-1) ?? null;

  return {
    ...report,
    progressTracking: {
      previousReadiness: previous?.readiness ?? null,
      currentReadiness: report.careerReadinessScore,
      readinessDelta: previous
        ? report.careerReadinessScore - previous.readiness
        : null,
      atsDelta: delta(report.scores.atsReadiness.score, previous?.ats ?? null),
      interviewDelta: delta(
        report.scores.interviewReadiness.score,
        previous?.interview ?? null
      ),
      jdMatchDelta: delta(
        report.scores.jobMatchReadiness.score,
        previous?.jdMatch ?? null
      ),
      resumeDelta: delta(
        report.scores.resumeReadiness.score,
        previous?.resume ?? null
      ),
    },
  };
}

function storeCoachReport(report: CareerCoachReport) {
  const reportWithProgress = withProgressTracking(report);
  const snapshots = readCoachSnapshots();
  const nextSnapshot: CareerCoachSnapshot = {
    generatedAt: reportWithProgress.generatedAt,
    readiness: reportWithProgress.careerReadinessScore,
    resume: scoreValue(reportWithProgress.scores.resumeReadiness.score),
    ats: scoreValue(reportWithProgress.scores.atsReadiness.score),
    jdMatch: scoreValue(reportWithProgress.scores.jobMatchReadiness.score),
    interview: scoreValue(reportWithProgress.scores.interviewReadiness.score),
  };
  const nextSnapshots = [...snapshots, nextSnapshot].slice(-12);

  window.localStorage.setItem(COACH_STORAGE_KEY, JSON.stringify(reportWithProgress));
  window.localStorage.setItem(COACH_SNAPSHOTS_KEY, JSON.stringify(nextSnapshots));
  window.dispatchEvent(new Event(COACH_STORAGE_EVENT));
}

function subscribeToCoachSources(callback: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  window.addEventListener("storage", callback);
  window.addEventListener(COACH_STORAGE_EVENT, callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(COACH_STORAGE_EVENT, callback);
  };
}

function getCoachSnapshot() {
  if (typeof window === "undefined") {
    return "server";
  }

  return JSON.stringify({
    ats: window.localStorage.getItem(ATS_STORAGE_KEY),
    jdMatch: window.localStorage.getItem(JD_MATCH_STORAGE_KEY),
    oa: window.localStorage.getItem(OA_REPORT_STORAGE_KEY),
    interview: window.localStorage.getItem(INTERVIEW_EVALUATION_STORAGE_KEY),
    coach: window.localStorage.getItem(COACH_STORAGE_KEY),
    snapshots: window.localStorage.getItem(COACH_SNAPSHOTS_KEY),
  });
}

function getServerCoachSnapshot() {
  return "server";
}

function scoreWidth(score: number | null) {
  return `${Math.max(0, Math.min(100, score ?? 0))}%`;
}

function scoreTone(score: number | null) {
  if (score === null) return "text-zinc-500";
  if (score >= 80) return "text-emerald-200";
  if (score >= 60) return "text-cyan-100";
  return "text-amber-200";
}

function priorityTone(priority: CareerCoachRoadmapItem["priority"]) {
  if (priority === "High") {
    return "border-red-300/25 bg-red-300/10 text-red-100";
  }

  if (priority === "Medium") {
    return "border-amber-300/25 bg-amber-300/10 text-amber-100";
  }

  return "border-cyan-300/25 bg-cyan-300/10 text-cyan-100";
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Just now";
  }

  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function SourceStatus({
  label,
  available,
}: {
  label: string;
  available: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${
        available
          ? "border-emerald-300/25 bg-emerald-300/10 text-emerald-100"
          : "border-amber-300/25 bg-amber-300/10 text-amber-100"
      }`}
    >
      {available ? (
        <CheckCircle2 className="h-3.5 w-3.5" />
      ) : (
        <TriangleAlert className="h-3.5 w-3.5" />
      )}
      {label}
    </span>
  );
}

function ScoreCard({ item }: { item: CareerCoachScoreCard }) {
  return (
    <Card className={`${forge.card} ${forge.hoverCard}`}>
      <CardHeader className="border-b border-white/10 bg-[#070B1F]/60 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base">{item.name}</CardTitle>
            <p className="mt-1 text-xs text-zinc-500">{item.status}</p>
          </div>
          <span className={`text-2xl font-semibold ${scoreTone(item.score)}`}>
            {item.score === null ? "--" : item.score}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className={`h-2 ${forge.progressTrack}`}>
          <div className={forge.progressFill} style={{ width: scoreWidth(item.score) }} />
        </div>
        <p className="text-sm leading-6 text-zinc-400">{item.reason}</p>
      </CardContent>
    </Card>
  );
}

function ListPanel({
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
    <Card className={`${forge.card} ${forge.hoverCard}`}>
      <CardHeader className="border-b border-white/10 bg-[#070B1F]/60 pb-3">
        <CardTitle className={`text-base ${titleTone}`}>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 text-sm leading-6 text-zinc-400">
          {(items.length ? items : ["No items available yet."]).slice(0, 8).map((item) => (
            <li key={item} className="flex gap-2">
              <span
                className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${
                  tone === "good"
                    ? "bg-emerald-300"
                    : tone === "warn"
                      ? "bg-amber-300"
                      : "bg-cyan-300"
                }`}
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function Timeline({
  title,
  items,
}: {
  title: string;
  items: CareerCoachTimelineItem[];
}) {
  return (
    <Card className={forge.card}>
      <CardHeader className="border-b border-white/10 bg-[#070B1F]/60 pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <CalendarDays className="h-4 w-4 text-cyan-100" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.label} className="relative pl-8">
              <span className="absolute left-2 top-1.5 h-full w-px bg-white/10" />
              <span className="absolute left-0 top-1 grid h-4 w-4 place-items-center rounded-full border border-[#00E5FF]/30 bg-[#00E5FF]/20 shadow-[0_0_18px_rgba(0,229,255,0.22)]" />
              <p className="text-xs font-semibold uppercase text-cyan-100">
                {item.label}
              </p>
              <h3 className="mt-1 text-sm font-semibold text-zinc-100">
                {item.title}
              </h3>
              <ul className="mt-2 space-y-1 text-sm leading-6 text-zinc-400">
                {item.tasks.map((task) => (
                  <li key={task}>{task}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function GapAnalysisCard({
  gaps,
}: {
  gaps: CareerCoachGap[];
}) {
  return (
    <div className="space-y-3">
      <p className="flex items-center gap-2 text-sm font-semibold text-cyan-100">
        <Layers3 className="h-4 w-4" />
        Gap matrix
      </p>
      <div className="grid gap-3 md:grid-cols-2">
        {gaps.map((gapItem) => (
          <div
            key={gapItem.gapName}
            className="rounded-2xl border border-white/10 bg-[#070B1F]/60 p-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-zinc-100">
                  {gapItem.gapName}
                </p>
                <p className="mt-1 text-xs text-zinc-500">
                  {gapItem.currentState} → {gapItem.expectedState}
                </p>
              </div>
              <span className={`rounded-full border px-2 py-0.5 text-xs ${priorityTone(gapItem.impact)}`}>
                {gapItem.impact}
              </span>
            </div>
            <p className="mt-3 text-xs leading-5 text-zinc-400">
              Estimated close time: {gapItem.estimatedTimeToClose}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function StrategicRecommendationCard({
  item,
}: {
  item: CareerCoachStrategicRecommendation;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-[#070B1F]/60 p-4 shadow-[0_0_28px_rgba(0,229,255,0.08)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full border px-2.5 py-1 text-xs ${priorityTone(item.priority)}`}>
              {item.priority}
            </span>
            <span className="rounded-full border border-[#00E5FF]/20 bg-[#00E5FF]/10 px-2.5 py-1 text-xs text-cyan-100">
              +{item.expectedReadinessGain} readiness
            </span>
          </div>
          <h3 className="mt-3 text-lg font-semibold text-zinc-100">
            {item.title}
          </h3>
          <p className="mt-2 text-sm leading-6 text-zinc-400">{item.reason}</p>
        </div>
        <div className="flex flex-wrap gap-2 sm:justify-end">
          {item.sourceModules.map((module) => (
            <span
              key={module}
              className="rounded-full border border-[#8B5CF6]/25 bg-[#8B5CF6]/10 px-2.5 py-1 text-xs text-purple-100"
            >
              {module}
            </span>
          ))}
        </div>
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div>
          <p className="text-xs font-semibold uppercase text-cyan-100">
            Evidence
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {(item.evidence.length ? item.evidence : ["No raw evidence yet."])
              .slice(0, 8)
              .map((evidence) => (
                <span
                  key={evidence}
                  className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs text-zinc-300"
                >
                  {evidence}
                </span>
              ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase text-cyan-100">
            Action checklist
          </p>
          <ul className="mt-2 space-y-2 text-sm leading-6 text-zinc-400">
            {item.actions.map((action) => (
              <li key={action} className="flex gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-cyan-100" />
                <span>{action}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function PrioritizedRecommendationsSection({
  recommendations,
}: {
  recommendations: CareerCoachStrategicRecommendation[];
}) {
  return (
    <Card className={forge.cardStrong}>
      <CardHeader className="border-b border-white/10 bg-[#070B1F]/60 pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingUp className="h-5 w-5 text-cyan-100" />
          Prioritized Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {recommendations.map((item) => (
          <StrategicRecommendationCard key={item.id} item={item} />
        ))}
      </CardContent>
    </Card>
  );
}

function RecruiterPerspectiveCard({
  report,
}: {
  report: CareerCoachReport["recruiterSimulation"];
}) {
  return (
    <Card className={forge.cardStrong}>
      <CardHeader className="border-b border-white/10 bg-[#070B1F]/60 pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Users className="h-4 w-4 text-purple-100" />
          Recruiter Perspective
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className={forge.metric}>
            <p className="text-xs font-medium uppercase text-zinc-500">
              Impression Score
            </p>
            <p className="mt-2 text-3xl font-semibold text-cyan-100">
              {report.impressionScore.toFixed(1)} / 10
            </p>
          </div>
          <div className={forge.metric}>
            <p className="text-xs font-medium uppercase text-zinc-500">
              Likely Outcome
            </p>
            <p className="mt-2 text-xl font-semibold text-zinc-100">
              {report.likelyOutcome}
            </p>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <RecruiterList
            title="Strengths recruiters notice"
            items={report.strengthsRecruitersNotice}
            tone="good"
          />
          <RecruiterList
            title="Risks recruiters notice"
            items={report.risksRecruitersNotice}
            tone="warn"
          />
        </div>
      </CardContent>
    </Card>
  );
}

function RecruiterList({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: "good" | "warn";
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#070B1F]/60 p-3">
      <p className={tone === "good" ? "text-sm font-semibold text-emerald-200" : "text-sm font-semibold text-amber-200"}>
        {title}
      </p>
      <ul className="mt-3 space-y-2 text-sm leading-6 text-zinc-400">
        {(items.length ? items : ["No items available yet."]).slice(0, 5).map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function SkillMaturityCard({
  items,
}: {
  items: CareerCoachSkillMaturity[];
}) {
  return (
    <Card className={forge.card}>
      <CardHeader className="border-b border-white/10 bg-[#070B1F]/60 pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <BrainCircuit className="h-4 w-4 text-cyan-100" />
          Skill Maturity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div key={item.skill} className={forge.metric}>
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-zinc-100">{item.skill}</p>
                <span className="rounded-full border border-[#8B5CF6]/25 bg-[#8B5CF6]/10 px-2 py-0.5 text-xs text-purple-100">
                  {item.maturity}
                </span>
              </div>
              <p className="mt-2 text-xs leading-5 text-zinc-500">{item.evidence}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function TargetRoleComparisonCard({
  items,
}: {
  items: CareerCoachTargetRoleMetric[];
}) {
  return (
    <Card className={forge.card}>
      <CardHeader className="border-b border-white/10 bg-[#070B1F]/60 pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <BarChart3 className="h-4 w-4 text-cyan-100" />
          You vs Target Role
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.name} className="rounded-2xl border border-white/10 bg-[#070B1F]/60 p-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-zinc-100">{item.name}</p>
                  <p className="mt-1 text-xs text-zinc-500">{item.reason}</p>
                </div>
                <span className="text-sm font-semibold text-cyan-100">
                  {item.currentMatch}%
                </span>
              </div>
              <div className={`mt-3 h-2 ${forge.progressTrack}`}>
                <div className={forge.progressFill} style={{ width: scoreWidth(item.currentMatch) }} />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function FormulaCard({ report }: { report: CareerCoachReport }) {
  const rows = [
    ["Resume 25%", report.readinessFormula.resumeContribution],
    ["ATS 20%", report.readinessFormula.atsContribution],
    ["JD Match 20%", report.readinessFormula.jdContribution],
    ["Interview 25%", report.readinessFormula.interviewContribution],
    ["Skill Gaps 10%", report.readinessFormula.skillGapContribution],
  ] as const;
  const progress = report.progressTracking;
  const deltaText =
    progress.readinessDelta === null
      ? "No previous snapshot yet"
      : `${progress.previousReadiness} → ${progress.currentReadiness} (${progress.readinessDelta >= 0 ? "+" : ""}${progress.readinessDelta})`;

  return (
    <Card className={forge.card}>
      <CardHeader className="border-b border-white/10 bg-[#070B1F]/60 pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <ClipboardCheck className="h-4 w-4 text-purple-100" />
          Readiness Formula & Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          {rows.map(([label, value]) => (
            <div key={label} className={forge.metric}>
              <p className="text-xs font-medium uppercase text-zinc-500">{label}</p>
              <p className="mt-2 text-2xl font-semibold text-cyan-100">
                {value}
              </p>
            </div>
          ))}
        </div>
        <div className="rounded-2xl border border-[#00E5FF]/15 bg-[#00E5FF]/10 p-3">
          <p className="text-xs font-medium uppercase text-cyan-100">
            Previous → Current
          </p>
          <p className="mt-2 text-sm leading-6 text-zinc-300">{deltaText}</p>
          <p className="mt-1 text-xs text-zinc-500">
            Component deltas: Resume {progress.resumeDelta ?? "--"}, ATS {progress.atsDelta ?? "--"}, JD {progress.jdMatchDelta ?? "--"}, Interview {progress.interviewDelta ?? "--"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export function CareerCoachClient({
  resume,
}: {
  resume: CareerCoachResumeSnapshot | null;
}) {
  const coachSnapshot = useSyncExternalStore(
    subscribeToCoachSources,
    getCoachSnapshot,
    getServerCoachSnapshot
  );
  const isHydrated = coachSnapshot !== "server";
  const sourceState = useMemo(() => {
    if (!isHydrated || coachSnapshot === "server") {
      return {
        ats: false,
        jdMatch: false,
        oa: false,
        interview: false,
      };
    }

    return {
      ats: Boolean(readLatestATSReport()),
      jdMatch: Boolean(readLatestJDMatchReport()),
      oa: Boolean(readLatestOAReport()),
      interview: Boolean(readLatestInterviewReport()),
    };
  }, [isHydrated, coachSnapshot]);
  const report = useMemo(() => {
    if (!isHydrated || coachSnapshot === "server") {
      return null;
    }

    return (
      readSavedCoachReport() ??
      buildCareerCoachReport({
        resume,
        atsAnalysis: readLatestATSReport(),
        jdMatchAnalysis: readLatestJDMatchReport(),
        oaReport: readLatestOAReport(),
        interviewEvaluation: readLatestInterviewReport(),
      })
    );
  }, [isHydrated, coachSnapshot, resume]);

  function generateReport() {
    const atsAnalysis = readLatestATSReport();
    const jdMatchAnalysis = readLatestJDMatchReport();
    const oaReport = readLatestOAReport();
    const interviewEvaluation = readLatestInterviewReport();
    const nextReport = buildCareerCoachReport({
      resume,
      atsAnalysis,
      jdMatchAnalysis,
      oaReport,
      interviewEvaluation,
    });

    storeCoachReport(nextReport);
  }

  useEffect(() => {
    if (isHydrated && report && !readSavedCoachReport()) {
      storeCoachReport(report);
    }
  }, [isHydrated, report]);

  if (!report) {
    return (
      <div className="mx-auto w-full max-w-7xl py-10 lg:py-12">
        <Card className={forge.cardStrong}>
          <CardContent className="py-10 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-[#00E5FF]/20 bg-[#00E5FF]/10 text-cyan-100 shadow-[0_0_28px_rgba(0,229,255,0.16)]">
              <Compass className="h-7 w-7" />
            </div>
            <p className="mt-5 text-sm font-semibold uppercase text-cyan-100">
              AI Career Coach
            </p>
            <h1 className="mt-2 text-2xl font-semibold">
              Preparing your roadmap...
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
              Reading your latest TalentForge reports from this browser.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const activeReport = report;
  const scores = activeReport.scores;
  const strategicNextBestAction =
    activeReport.strategicRecommendations.nextBestAction;
  const hasAnyLocalReport =
    sourceState.ats || sourceState.jdMatch || sourceState.oa || sourceState.interview;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 py-10 lg:py-12">
      <section className={forge.hero}>
        <div className={forge.heroGlowCyan} />
        <div className={forge.heroGlowPurple} />
        <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_380px] lg:items-center">
          <div>
            <p className={forge.badge}>AI Career Coach</p>
            <h1 className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight sm:text-5xl">
              Your career roadmap, connected.
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-zinc-300">
              Combines your latest resume diagnostics, ATS optimizer, JD match,
              and interview performance into one focused action plan.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <SourceStatus label="Resume" available={Boolean(resume)} />
              <SourceStatus label="ATS" available={sourceState.ats} />
              <SourceStatus label="JD Match" available={sourceState.jdMatch} />
              <SourceStatus
                label="Interview/OA"
                available={sourceState.oa || sourceState.interview}
              />
            </div>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button type="button" onClick={generateReport} className={forge.primaryButton}>
                <RefreshCw className="h-4 w-4" />
                Refresh Roadmap
              </Button>
              <Button asChild variant="outline" className={forge.secondaryButton}>
                <Link href={activeReport.nextBestAction.href}>
                  {activeReport.nextBestAction.label}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="rounded-3xl border border-[#00E5FF]/20 bg-[#070B1F]/70 p-5 shadow-[0_0_42px_rgba(0,229,255,0.16)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase text-cyan-100">
                  Career Readiness
                </p>
                <p className="mt-1 text-xs text-zinc-500">
                  Updated {formatDate(activeReport.generatedAt)}
                </p>
              </div>
              <Compass className="h-6 w-6 text-cyan-100" />
            </div>
            <div
              className="mx-auto mt-6 grid h-44 w-44 place-items-center rounded-full p-2"
              style={{
                background: `conic-gradient(#00E5FF ${activeReport.careerReadinessScore}%, rgba(255,255,255,0.1) 0)`,
              }}
            >
              <div className="grid h-full w-full place-items-center rounded-full bg-[#050816] text-center">
                <div>
                  <p className="text-5xl font-semibold text-white">
                    {activeReport.careerReadinessScore}
                  </p>
                  <p className="mt-1 text-xs uppercase text-zinc-400">
                    {activeReport.readinessLabel}
                  </p>
                </div>
              </div>
            </div>
            <p className="mt-5 text-center text-sm leading-6 text-zinc-400">
              {activeReport.nextBestAction.reason}
            </p>
          </div>
        </div>
      </section>

      {!hasAnyLocalReport || activeReport.missingData.length ? (
        <Card className={forge.card}>
          <CardContent className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-amber-100">
                Some signals are missing
              </p>
              <p className="mt-1 text-sm leading-6 text-zinc-400">
                {activeReport.missingData.length
                  ? activeReport.missingData.join(" · ")
                  : "Run more TalentForge tools to sharpen this roadmap."}
              </p>
            </div>
            <Button asChild variant="outline" className={forge.secondaryButton}>
              <Link href="/dashboard/resume">Open Resume Intelligence</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <ScoreCard item={scores.resumeReadiness} />
        <ScoreCard item={scores.atsReadiness} />
        <ScoreCard item={scores.jobMatchReadiness} />
        <ScoreCard item={scores.interviewReadiness} />
      </section>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
        <Card className={forge.cardStrong}>
          <CardHeader className="border-b border-white/10 bg-[#070B1F]/60 pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="h-5 w-5 text-cyan-100" />
              Target Role Fit
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-4 md:grid-cols-3">
              <div className={forge.metric}>
                <p className="text-xs font-medium uppercase text-zinc-500">
                  Target Role
                </p>
                <p className="mt-2 text-lg font-semibold text-zinc-100">
                  {activeReport.targetRole}
                </p>
              </div>
              <div className={forge.metric}>
                <p className="text-xs font-medium uppercase text-zinc-500">
                  Seniority
                </p>
                <p className="mt-2 text-lg font-semibold text-zinc-100">
                  {activeReport.detectedSeniority}
                </p>
              </div>
              <div className={forge.metric}>
                <p className="text-xs font-medium uppercase text-zinc-500">
                  Data Completeness
                </p>
                <p className="mt-2 text-lg font-semibold text-cyan-100">
                  {activeReport.dataCompleteness}%
                </p>
              </div>
            </div>
            <p className="text-sm leading-7 text-zinc-300">
              {activeReport.targetRoleFit}
            </p>
          </CardContent>
        </Card>

        <Card className={forge.cardStrong}>
          <CardHeader className="border-b border-white/10 bg-[#070B1F]/60 pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="h-5 w-5 text-purple-100" />
              Next Best Action
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold text-zinc-100">
              {strategicNextBestAction.title}
            </p>
            <p className="mt-2 text-sm leading-6 text-zinc-400">
              {strategicNextBestAction.reason}
            </p>
            <p className="mt-3 w-fit rounded-full border border-[#00E5FF]/20 bg-[#00E5FF]/10 px-3 py-1 text-xs font-semibold text-cyan-100">
              Expected gain: +{strategicNextBestAction.expectedReadinessGain} readiness
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {strategicNextBestAction.sourceModules.map((module) => (
                <span
                  key={module}
                  className="rounded-full border border-[#8B5CF6]/25 bg-[#8B5CF6]/10 px-2.5 py-1 text-xs text-purple-100"
                >
                  {module}
                </span>
              ))}
            </div>
            <ol className="mt-4 space-y-2 text-sm leading-6 text-zinc-400">
              {strategicNextBestAction.actions.slice(0, 3).map((action, index) => (
                <li key={action} className="flex gap-2">
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full border border-[#00E5FF]/20 bg-[#00E5FF]/10 text-xs text-cyan-100">
                    {index + 1}
                  </span>
                  <span>{action}</span>
                </li>
              ))}
            </ol>
            <Button asChild className={`mt-5 ${forge.primaryButton}`}>
              <Link href={activeReport.nextBestAction.href}>
                Continue
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      {!hasAnyLocalReport && !resume ? (
        <Card className={forge.cardStrong}>
          <CardContent className="py-6">
            <p className="text-lg font-semibold text-zinc-100">
              Run Resume Intelligence, ATS, JD Match, and OA Assessment to unlock a personalized strategy.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button asChild className={forge.primaryButton}>
                <Link href="/dashboard/resume">Upload a resume</Link>
              </Button>
              <Button asChild variant="outline" className={forge.secondaryButton}>
                <Link href="/dashboard/resume/ats">Run ATS analysis</Link>
              </Button>
              <Button asChild variant="outline" className={forge.secondaryButton}>
                <Link href="/dashboard/interview">Complete one OA session</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
        <Card className={forge.cardStrong}>
          <CardHeader className="border-b border-white/10 bg-[#070B1F]/60 pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Compass className="h-5 w-5 text-cyan-100" />
              Career Gap Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-4">
              <div className={forge.metric}>
                <p className="text-xs font-medium uppercase text-zinc-500">
                  Current Role Level
                </p>
                <p className="mt-2 text-sm font-semibold text-zinc-100">
                  {activeReport.careerGapAnalysis.currentRoleLevel}
                </p>
              </div>
              <div className={forge.metric}>
                <p className="text-xs font-medium uppercase text-zinc-500">
                  Target Role Level
                </p>
                <p className="mt-2 text-sm font-semibold text-zinc-100">
                  {activeReport.careerGapAnalysis.targetRoleLevel}
                </p>
              </div>
              <div className={forge.metric}>
                <p className="text-xs font-medium uppercase text-zinc-500">
                  Target Company Tier
                </p>
                <p className="mt-2 text-sm font-semibold text-zinc-100">
                  {activeReport.careerGapAnalysis.targetCompanyTier}
                </p>
              </div>
              <div className={forge.metric}>
                <p className="text-xs font-medium uppercase text-zinc-500">
                  Readiness
                </p>
                <p className="mt-2 text-sm font-semibold text-cyan-100">
                  {activeReport.careerGapAnalysis.readiness}%
                </p>
              </div>
            </div>
            <GapAnalysisCard gaps={activeReport.careerGapAnalysis.gaps} />
          </CardContent>
        </Card>
        <Card className={forge.cardStrong}>
          <CardHeader className="border-b border-white/10 bg-[#070B1F]/60 pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="h-5 w-5 text-purple-100" />
              Top 3 High-Impact Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeReport.strategicRecommendations.recommendations
              .slice(0, 3)
              .map((item) => (
                <div key={item.id} className={forge.metric}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-zinc-100">
                      {item.title}
                    </p>
                    <span className="text-sm font-semibold text-cyan-100">
                      +{item.expectedReadinessGain}
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-zinc-500">
                    {item.reason}
                  </p>
                </div>
              ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(360px,1.05fr)]">
        <RecruiterPerspectiveCard report={activeReport.recruiterSimulation} />
        <FormulaCard report={activeReport} />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <SkillMaturityCard items={activeReport.skillMaturity} />
        <TargetRoleComparisonCard items={activeReport.targetRoleComparison} />
      </section>

      <Card className={forge.card}>
        <CardHeader className="border-b border-white/10 bg-[#070B1F]/60 pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <BrainCircuit className="h-4 w-4 text-cyan-100" />
            Interview Root Cause Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {(activeReport.interviewRootCauseAnalysis.length
              ? activeReport.interviewRootCauseAnalysis
              : [
                  {
                    category: "Interview/OA",
                    rootCause: "No weak interview categories detected yet.",
                    evidence: "Complete an OA or interview report for deeper root-cause analysis.",
                    fix: "Run an OA Assessment or interview session.",
                  },
                ]
            ).map((item) => (
              <div key={`${item.category}-${item.rootCause}`} className={forge.metric}>
                <p className="text-sm font-semibold text-zinc-100">
                  {item.category}
                </p>
                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  {item.rootCause}
                </p>
                <p className="mt-2 text-xs text-amber-100">{item.evidence}</p>
                <p className="mt-2 text-xs leading-5 text-cyan-100">{item.fix}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <section className="grid gap-4 lg:grid-cols-2">
        <ListPanel
          title="Strongest Areas"
          items={activeReport.strongestAreas}
          tone="good"
        />
        <ListPanel
          title="Weakest Areas"
          items={activeReport.weakestAreas}
          tone="warn"
        />
      </section>

      <PrioritizedRecommendationsSection
        recommendations={activeReport.strategicRecommendations.recommendations}
      />

      <section className="grid gap-4 lg:grid-cols-2">
        <Timeline title="7-Day Action Plan" items={activeReport.sevenDayActionPlan} />
        <Timeline title="30-Day Roadmap" items={activeReport.thirtyDayRoadmap} />
      </section>

    </div>
  );
}
