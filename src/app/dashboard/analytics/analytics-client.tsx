"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  BrainCircuit,
  CheckCircle2,
  FileText,
  Lightbulb,
  Target,
  TriangleAlert,
} from "lucide-react";

import { DashboardEmptyState } from "@/app/dashboard/dashboard-production";
import { INTERVIEW_HISTORY_STORAGE_KEY } from "@/app/dashboard/interview/interview-storage";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { InterviewHistoryAttempt } from "@/lib/interview-history";
import { forge } from "@/lib/talentforge-design";

type AnalyticsResumeVersion = {
  id: string;
  versionNumber: number;
  sourceType: string;
  atsScore: number | null;
  jobMatchScore: number | null;
  addedKeywords: string[];
  removedKeywords: string[];
  createdAt: string;
};

type AnalyticsResume = {
  id: string;
  title: string;
  atsScore: number | null;
  matchScore: number | null;
  createdAt: string;
  updatedAt: string;
  versions: AnalyticsResumeVersion[];
};

type AnalyticsServerData = {
  latestResume: Omit<AnalyticsResume, "versions"> | null;
  resumes: AnalyticsResume[];
  detectedSkills: string[];
};

type CoachSnapshot = {
  generatedAt: string;
  readiness: number;
  resume?: number | null;
  ats?: number | null;
  jdMatch?: number | null;
  interview?: number | null;
};

type LocalReports = {
  atsScore: number | null;
  jdMatchScore: number | null;
  coachSnapshots: CoachSnapshot[];
  interviewHistory: InterviewHistoryAttempt[];
  atsMatchedKeywords: string[];
  atsMissingKeywords: string[];
  jdMatchedSkills: string[];
  jdMissingSkills: string[];
};

type ChartPoint = {
  label: string;
  date: string;
  score: number;
};

const ATS_STORAGE_KEY = "talentforge.atsOptimizer.latest";
const JD_MATCH_STORAGE_KEY = "talentforge.jdMatch.latest";
const COACH_SNAPSHOTS_KEY = "talentforge.careerCoach.snapshots";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function safeStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    : [];
}

function readJson(key: string) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as unknown) : null;
  } catch {
    window.localStorage.removeItem(key);
    return null;
  }
}

function readLocalReports(): LocalReports {
  const atsSaved = readJson(ATS_STORAGE_KEY);
  const jdSaved = readJson(JD_MATCH_STORAGE_KEY);
  const coachSnapshotsRaw = readJson(COACH_SNAPSHOTS_KEY);
  const interviewHistoryRaw = readJson(INTERVIEW_HISTORY_STORAGE_KEY);
  const atsAnalysis =
    isRecord(atsSaved) && isRecord(atsSaved.analysis) ? atsSaved.analysis : null;
  const jdAnalysis =
    isRecord(jdSaved) && isRecord(jdSaved.analysis) ? jdSaved.analysis : null;

  return {
    atsScore:
      atsAnalysis && typeof atsAnalysis.atsScore === "number"
        ? atsAnalysis.atsScore
        : null,
    jdMatchScore:
      jdAnalysis && typeof jdAnalysis.matchScore === "number"
        ? jdAnalysis.matchScore
        : null,
    coachSnapshots: Array.isArray(coachSnapshotsRaw)
      ? coachSnapshotsRaw.filter(
          (item): item is CoachSnapshot =>
            isRecord(item) &&
            typeof item.generatedAt === "string" &&
            typeof item.readiness === "number"
        )
      : [],
    interviewHistory: Array.isArray(interviewHistoryRaw)
      ? interviewHistoryRaw.filter(
          (item): item is InterviewHistoryAttempt =>
            isRecord(item) &&
            typeof item.id === "string" &&
            typeof item.overallScore === "number"
        )
      : [],
    atsMatchedKeywords: atsAnalysis
      ? safeStringArray(atsAnalysis.matchedATSKeywords)
      : [],
    atsMissingKeywords: atsAnalysis
      ? safeStringArray(atsAnalysis.missingATSKeywords)
      : [],
    jdMatchedSkills: jdAnalysis ? safeStringArray(jdAnalysis.matchedSkills) : [],
    jdMissingSkills: jdAnalysis ? safeStringArray(jdAnalysis.missingSkills) : [],
  };
}

function scoreTone(score: number | null) {
  if (score === null) return "text-zinc-500";
  if (score >= 80) return "text-emerald-300";
  if (score >= 60) return "text-cyan-200";
  if (score >= 45) return "text-amber-200";
  return "text-red-200";
}

function latestScore(points: ChartPoint[]) {
  return points.at(-1)?.score ?? null;
}

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function byDate<T extends { date: string }>(items: T[]) {
  return [...items].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
}

function delta(points: ChartPoint[]) {
  if (points.length < 2) return null;
  return points.at(-1)!.score - points[0].score;
}

function weeksBetween(points: ChartPoint[]) {
  if (points.length < 2) return null;
  const first = new Date(points[0].date).getTime();
  const latest = new Date(points.at(-1)!.date).getTime();

  if (!Number.isFinite(first) || !Number.isFinite(latest)) return null;

  return Math.max(1, Math.round((latest - first) / (7 * 24 * 60 * 60 * 1000)));
}

function trendFromVersions(
  versions: AnalyticsResumeVersion[],
  key: "atsScore" | "jobMatchScore"
) {
  return byDate(
    versions
      .filter((version) => typeof version[key] === "number")
      .map((version) => ({
        label: `V${version.versionNumber}`,
        date: version.createdAt,
        score: clampScore(version[key] ?? 0),
      }))
  );
}

function trendFromCoachSnapshots(
  snapshots: CoachSnapshot[],
  key: "readiness" | "ats" | "jdMatch" | "interview"
) {
  return [...snapshots]
    .sort(
      (a, b) =>
        new Date(a.generatedAt).getTime() - new Date(b.generatedAt).getTime()
    )
    .filter((snapshot) => typeof snapshot[key] === "number")
    .map((snapshot, index) => ({
      label: `S${index + 1}`,
      date: snapshot.generatedAt,
      score: clampScore(snapshot[key] ?? 0),
    }));
}

function rankedStrings(items: string[]) {
  const counts = new Map<string, number>();

  for (const item of items) {
    const normalized = item.trim();
    if (!normalized) continue;
    const key = normalized.toLowerCase();
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([item]) => item);
}

function buildWeeklyProgress({
  versions,
  interviewHistory,
  coachSnapshots,
}: {
  versions: AnalyticsResumeVersion[];
  interviewHistory: InterviewHistoryAttempt[];
  coachSnapshots: CoachSnapshot[];
}) {
  const now = Date.now();
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  const inLastWeek = (date: string) => now - new Date(date).getTime() <= weekMs;

  return [
    {
      name: "Resume versions",
      value: versions.filter((version) => inLastWeek(version.createdAt)).length,
    },
    {
      name: "Interview attempts",
      value: interviewHistory.filter((attempt) => inLastWeek(attempt.attemptDate)).length,
    },
    {
      name: "Coach snapshots",
      value: coachSnapshots.filter((snapshot) => inLastWeek(snapshot.generatedAt)).length,
    },
  ];
}

function buildInsights({
  atsTrend,
  jdTrend,
  interviewTrend,
  readinessTrend,
  strongestSkills,
  gaps,
}: {
  atsTrend: ChartPoint[];
  jdTrend: ChartPoint[];
  interviewTrend: ChartPoint[];
  readinessTrend: ChartPoint[];
  strongestSkills: string[];
  gaps: string[];
}) {
  const insights: string[] = [];
  const atsDelta = delta(atsTrend);
  const jdDelta = delta(jdTrend);
  const interviewDelta = delta(interviewTrend);
  const readinessDelta = delta(readinessTrend);

  if (atsDelta !== null) {
    const weeks = weeksBetween(atsTrend);
    insights.push(
      `ATS ${atsDelta >= 0 ? "improved" : "changed"} ${Math.abs(atsDelta)} points${weeks ? ` in ${weeks} week${weeks === 1 ? "" : "s"}` : " across saved versions"}.`
    );
  }

  if (jdDelta !== null) {
    insights.push(`JD Match ${jdDelta >= 0 ? "increased" : "changed"} ${Math.abs(jdDelta)} points from first to latest signal.`);
  }

  if (interviewDelta !== null) {
    insights.push(`Interview performance ${interviewDelta >= 0 ? "grew" : "changed"} ${Math.abs(interviewDelta)} points across attempts.`);
  }

  if (readinessDelta !== null) {
    insights.push(`Career readiness ${readinessDelta >= 0 ? "improved" : "changed"} ${Math.abs(readinessDelta)} points in saved coach snapshots.`);
  }

  if (strongestSkills.length) {
    insights.push(`${strongestSkills[0]} is currently the strongest repeated readiness signal.`);
  }

  if (gaps.length) {
    insights.push(`${gaps[0]} remains the most visible recurring skill gap.`);
  }

  return insights.length
    ? insights.slice(0, 5)
    : [
        "Run Resume Intelligence, JD Match, OA Assessment, and Career Coach to unlock deeper trend insights.",
      ];
}

function ChartShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Card className={`${forge.card} overflow-hidden`}>
      <CardHeader className="border-b border-white/10 bg-[#070B1F]/60 pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription className="text-xs text-zinc-500">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="h-72 pt-5">{children}</CardContent>
    </Card>
  );
}

function AnalyticsTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value?: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border border-white/10 bg-[#070B1F] px-3 py-2 text-xs text-zinc-200 shadow-xl">
      <p className="font-semibold text-white">{label}</p>
      <p className="mt-1 text-cyan-100">{payload[0]?.value ?? 0}/100</p>
    </div>
  );
}

function EmptyChart({ label }: { label: string }) {
  return (
    <div className="grid h-full place-items-center rounded-2xl border border-white/10 bg-black/20 text-center text-sm text-zinc-500">
      {label}
    </div>
  );
}

function LineTrend({ data }: { data: ChartPoint[] }) {
  if (!data.length) return <EmptyChart label="No trend data yet." />;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
        <XAxis
          dataKey="label"
          stroke="rgba(255,255,255,0.38)"
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          domain={[0, 100]}
          stroke="rgba(255,255,255,0.38)"
          tickLine={false}
          axisLine={false}
        />
        <Tooltip content={<AnalyticsTooltip />} />
        <Line
          type="monotone"
          dataKey="score"
          stroke="#00E5FF"
          strokeWidth={3}
          dot={{ r: 4, fill: "#6A5CFF", stroke: "#00E5FF" }}
          activeDot={{ r: 6, fill: "#00E5FF" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

function AreaTrend({ data }: { data: ChartPoint[] }) {
  if (!data.length) return <EmptyChart label="No readiness snapshots yet." />;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <defs>
          <linearGradient id="readinessFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#00E5FF" stopOpacity={0.4} />
            <stop offset="100%" stopColor="#6A5CFF" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
        <XAxis
          dataKey="label"
          stroke="rgba(255,255,255,0.38)"
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          domain={[0, 100]}
          stroke="rgba(255,255,255,0.38)"
          tickLine={false}
          axisLine={false}
        />
        <Tooltip content={<AnalyticsTooltip />} />
        <Area
          type="monotone"
          dataKey="score"
          stroke="#00E5FF"
          strokeWidth={3}
          fill="url(#readinessFill)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function AnalyticsHero({
  currentReadiness,
  totalSignals,
}: {
  currentReadiness: number | null;
  totalSignals: number;
}) {
  return (
    <section className={forge.hero}>
      <div className={forge.heroGlowCyan} />
      <div className={forge.heroGlowPurple} />
      <div className="relative grid gap-6 lg:grid-cols-[1fr_320px] lg:items-center">
        <div>
          <span className={forge.badge}>TalentForge Analytics</span>
          <h1 className="mt-4 max-w-4xl text-3xl font-semibold tracking-tight sm:text-5xl">
            Your career growth command center.
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-zinc-300">
            A centralized executive dashboard combining resume health, ATS
            progress, JD fit, interview performance, and Career Coach readiness.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild className={forge.primaryButton}>
              <Link href="/dashboard/coach">Open Career Coach</Link>
            </Button>
            <Button asChild variant="outline" className={forge.secondaryButton}>
              <Link href="/dashboard/interview/history">Interview History</Link>
            </Button>
          </div>
        </div>
        <div className="rounded-3xl border border-[#00E5FF]/20 bg-[#00E5FF]/10 p-6 text-center shadow-[0_0_40px_rgba(0,229,255,0.14)]">
          <p className="text-xs font-semibold uppercase text-cyan-100">
            Current Readiness
          </p>
          <p className={`mt-3 text-6xl font-semibold ${scoreTone(currentReadiness)}`}>
            {currentReadiness ?? "--"}
          </p>
          <p className="mt-3 text-sm text-zinc-400">
            {totalSignals} growth signals connected
          </p>
        </div>
      </div>
    </section>
  );
}

export function CareerReadinessChart({ data }: { data: ChartPoint[] }) {
  return (
    <ChartShell
      title="Career Readiness Trend"
      description="Historical readiness scores from Career Coach snapshots."
    >
      <AreaTrend data={data} />
    </ChartShell>
  );
}

export function ATSTrendChart({ data }: { data: ChartPoint[] }) {
  return (
    <ChartShell title="ATS Trend" description="ATS score movement over resume versions.">
      <LineTrend data={data} />
    </ChartShell>
  );
}

export function JDMatchChart({ data }: { data: ChartPoint[] }) {
  return (
    <ChartShell title="JD Match Trend" description="Job match improvement signals.">
      <LineTrend data={data} />
    </ChartShell>
  );
}

export function InterviewTrendChart({ data }: { data: ChartPoint[] }) {
  return (
    <ChartShell
      title="Interview Performance Trend"
      description="OA and mock interview growth from saved attempts."
    >
      <LineTrend data={data} />
    </ChartShell>
  );
}

export function SkillGapCard({
  strongestSkills,
  skillGaps,
}: {
  strongestSkills: string[];
  skillGaps: string[];
}) {
  return (
    <Card className={`${forge.card} overflow-hidden`}>
      <CardHeader className="border-b border-white/10 bg-[#070B1F]/60">
        <CardTitle className="text-lg">Skills Intelligence</CardTitle>
        <CardDescription className="text-zinc-400">
          Strongest detected skills and recurring gaps.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-emerald-300/15 bg-emerald-300/[0.06] p-4">
          <p className="text-sm font-semibold text-emerald-200">Strongest Skills</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {(strongestSkills.length ? strongestSkills : ["Run resume analysis"]).slice(0, 14).map((skill) => (
              <span
                key={skill}
                className="rounded-full border border-[#00E5FF]/15 bg-[#00E5FF]/10 px-3 py-1 text-xs text-cyan-50"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-amber-300/15 bg-amber-300/[0.06] p-4">
          <p className="text-sm font-semibold text-amber-200">Biggest Skill Gaps</p>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-zinc-300">
            {(skillGaps.length ? skillGaps : ["Run JD Match or Career Coach to identify gaps."])
              .slice(0, 8)
              .map((gap) => (
                <li key={gap}>{gap}</li>
              ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

export function InsightsPanel({ insights }: { insights: string[] }) {
  return (
    <Card className={`${forge.cardStrong} overflow-hidden`}>
      <CardHeader className="border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <span className="rounded-2xl border border-[#00E5FF]/20 bg-[#00E5FF]/10 p-2 text-cyan-100">
            <Lightbulb className="h-5 w-5" />
          </span>
          <div>
            <CardTitle>Insights Engine</CardTitle>
            <CardDescription className="text-zinc-400">
              Automated growth insights from connected TalentForge modules.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3 text-sm leading-6 text-zinc-300">
          {insights.map((insight) => (
            <li key={insight} className="flex gap-3">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-cyan-200" />
              <span>{insight}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function SuccessMetrics({
  ats,
  jdMatch,
  readiness,
  interview,
}: {
  ats: number | null;
  jdMatch: number | null;
  readiness: number | null;
  interview: number | null;
}) {
  const cards = [
    { label: "Current ATS", value: ats, icon: FileText },
    { label: "Current Job Match", value: jdMatch, icon: Target },
    { label: "Current Readiness", value: readiness, icon: BrainCircuit },
    { label: "Current Interview Score", value: interview, icon: Activity },
  ];

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.label} className={`${forge.card} ${forge.hoverCard}`}>
          <CardContent className="p-5">
            <card.icon className="h-5 w-5 text-cyan-200" />
            <p className="mt-4 text-xs font-semibold uppercase text-zinc-500">
              {card.label}
            </p>
            <p className={`mt-2 text-4xl font-semibold ${scoreTone(card.value)}`}>
              {card.value ?? "--"}
            </p>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}

function ResumeEvolution({
  versions,
}: {
  versions: AnalyticsResumeVersion[];
}) {
  const versionData = versions.map((version) => ({
    name: `V${version.versionNumber}`,
    added: version.addedKeywords.length,
    removed: version.removedKeywords.length,
  }));

  return (
    <ChartShell
      title="Resume Evolution"
      description="Keyword movement across saved resume versions."
    >
      {versionData.length ? (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={versionData}>
            <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
            <XAxis dataKey="name" stroke="rgba(255,255,255,0.38)" tickLine={false} axisLine={false} />
            <YAxis stroke="rgba(255,255,255,0.38)" tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                background: "#070B1F",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "12px",
                color: "#fff",
              }}
            />
            <Bar dataKey="added" fill="#00E5FF" radius={[8, 8, 0, 0]} />
            <Bar dataKey="removed" fill="#8B5CF6" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <EmptyChart label="No resume versions yet." />
      )}
    </ChartShell>
  );
}

function WeeklyProgress({
  data,
}: {
  data: Array<{ name: string; value: number }>;
}) {
  return (
    <Card className={`${forge.card} overflow-hidden`}>
      <CardHeader className="border-b border-white/10 bg-[#070B1F]/60">
        <CardTitle className="text-lg">Weekly Progress</CardTitle>
        <CardDescription className="text-zinc-400">
          Activity summary from the last 7 days.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-3">
        {data.map((item) => (
          <div key={item.name} className={forge.metric}>
            <p className="text-xs font-medium uppercase text-zinc-500">{item.name}</p>
            <p className="mt-2 text-3xl font-semibold text-white">{item.value}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function AnalyticsDashboardClient({
  serverData,
}: {
  serverData: AnalyticsServerData;
}) {
  const [localReports, setLocalReports] = useState<LocalReports | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setLocalReports(readLocalReports());
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const allVersions = useMemo(
    () =>
      [...serverData.resumes.flatMap((resume) => resume.versions)].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      ),
    [serverData.resumes]
  );
  const latestResumeVersions = useMemo(
    () =>
      [...(serverData.resumes[0]?.versions ?? [])].sort(
        (a, b) => a.versionNumber - b.versionNumber
      ),
    [serverData.resumes]
  );
  const atsTrend = useMemo(() => {
    const points = [
      ...trendFromVersions(allVersions, "atsScore"),
      ...trendFromCoachSnapshots(localReports?.coachSnapshots ?? [], "ats"),
    ];
    if (serverData.latestResume?.atsScore !== null && serverData.latestResume?.atsScore !== undefined) {
      points.push({
        label: "Current Resume",
        date: serverData.latestResume.updatedAt,
        score: clampScore(serverData.latestResume.atsScore),
      });
    }
    if (localReports?.atsScore !== null && localReports?.atsScore !== undefined) {
      points.push({
        label: "Latest ATS",
        date: new Date().toISOString(),
        score: clampScore(localReports.atsScore),
      });
    }
    return byDate(points);
  }, [allVersions, localReports, serverData.latestResume]);
  const jdTrend = useMemo(() => {
    const points = [
      ...trendFromVersions(allVersions, "jobMatchScore"),
      ...trendFromCoachSnapshots(localReports?.coachSnapshots ?? [], "jdMatch"),
    ];
    if (serverData.latestResume?.matchScore !== null && serverData.latestResume?.matchScore !== undefined) {
      points.push({
        label: "Current Resume",
        date: serverData.latestResume.updatedAt,
        score: clampScore(serverData.latestResume.matchScore),
      });
    }
    if (localReports?.jdMatchScore !== null && localReports?.jdMatchScore !== undefined) {
      points.push({
        label: "Latest JD",
        date: new Date().toISOString(),
        score: clampScore(localReports.jdMatchScore),
      });
    }
    return byDate(points);
  }, [allVersions, localReports, serverData.latestResume]);
  const interviewTrend = useMemo(
    () =>
      byDate([
        ...(localReports?.interviewHistory.map((attempt, index) => ({
          label: `A${index + 1}`,
          date: attempt.attemptDate,
          score: clampScore(attempt.overallScore),
        })) ?? []),
        ...trendFromCoachSnapshots(localReports?.coachSnapshots ?? [], "interview"),
      ]),
    [localReports]
  );
  const readinessTrend = useMemo(
    () =>
      trendFromCoachSnapshots(localReports?.coachSnapshots ?? [], "readiness"),
    [localReports]
  );
  const currentATS = localReports?.atsScore ?? serverData.latestResume?.atsScore ?? null;
  const currentJD = localReports?.jdMatchScore ?? serverData.latestResume?.matchScore ?? null;
  const currentInterview = latestScore(interviewTrend);
  const currentReadiness =
    latestScore(readinessTrend) ??
    (currentATS !== null || currentJD !== null || currentInterview !== null
      ? Math.round(
          [currentATS, currentJD, currentInterview]
            .filter((score): score is number => typeof score === "number")
            .reduce((sum, score, _, arr) => sum + score / arr.length, 0)
        )
      : null);
  const strongestSkills = useMemo(
    () =>
      rankedStrings([
        ...serverData.detectedSkills,
        ...(localReports?.atsMatchedKeywords ?? []),
        ...(localReports?.jdMatchedSkills ?? []),
      ]).slice(0, 18),
    [localReports, serverData.detectedSkills]
  );
  const skillGaps = useMemo(
    () =>
      rankedStrings([
        ...(localReports?.atsMissingKeywords ?? []),
        ...(localReports?.jdMissingSkills ?? []),
        ...(localReports?.interviewHistory.flatMap((attempt) => attempt.weaknesses) ?? []),
      ]).slice(0, 12),
    [localReports]
  );
  const weeklyProgress = useMemo(
    () =>
      buildWeeklyProgress({
        versions: allVersions,
        interviewHistory: localReports?.interviewHistory ?? [],
        coachSnapshots: localReports?.coachSnapshots ?? [],
      }),
    [allVersions, localReports]
  );
  const insights = useMemo(
    () =>
      buildInsights({
        atsTrend,
        jdTrend,
        interviewTrend,
        readinessTrend,
        strongestSkills,
        gaps: skillGaps,
      }),
    [atsTrend, interviewTrend, jdTrend, readinessTrend, skillGaps, strongestSkills]
  );
  const totalSignals =
    allVersions.length +
    serverData.resumes.length +
    (localReports?.interviewHistory.length ?? 0) +
    (localReports?.coachSnapshots.length ?? 0) +
    (currentATS === null ? 0 : 1) +
    (currentJD === null ? 0 : 1);
  const hasAnalyticsData = totalSignals > 0 || strongestSkills.length > 0 || skillGaps.length > 0;

  if (!hasAnalyticsData) {
    return (
      <div className="space-y-6">
        <AnalyticsHero currentReadiness={currentReadiness} totalSignals={0} />
        <DashboardEmptyState
          title="No analytics data yet"
          description="Run Resume Intelligence, ATS Optimizer, JD Match, OA Assessment, or Career Coach to start building this executive dashboard."
          actionHref="/dashboard/resume"
          actionLabel="Start with Resume"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AnalyticsHero currentReadiness={currentReadiness} totalSignals={totalSignals} />

      <SuccessMetrics
        ats={currentATS}
        jdMatch={currentJD}
        readiness={currentReadiness}
        interview={currentInterview}
      />

      <div className="grid gap-5 xl:grid-cols-2">
        <CareerReadinessChart data={readinessTrend} />
        <InterviewTrendChart data={interviewTrend} />
        <ATSTrendChart data={atsTrend} />
        <JDMatchChart data={jdTrend} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <SkillGapCard strongestSkills={strongestSkills} skillGaps={skillGaps} />
        <InsightsPanel insights={insights} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_0.85fr]">
        <ResumeEvolution versions={latestResumeVersions} />
        <WeeklyProgress data={weeklyProgress} />
      </div>

      <Card className={forge.card}>
        <CardHeader className="border-b border-white/10 bg-[#070B1F]/60">
          <CardTitle className="text-lg">Connected Data Sources</CardTitle>
          <CardDescription className="text-zinc-400">
            Resume Intelligence, ATS Optimizer, JD Match, OA Assessment, and Career Coach.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {[
            ["Resume Intelligence", serverData.resumes.length > 0],
            ["ATS Optimizer", currentATS !== null],
            ["JD Match", currentJD !== null],
            ["OA / Interview", Boolean(localReports?.interviewHistory.length)],
            ["Career Coach", Boolean(localReports?.coachSnapshots.length)],
          ].map(([label, connected]) => (
            <div key={String(label)} className={forge.metric}>
              {connected ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-300" />
              ) : (
                <TriangleAlert className="h-4 w-4 text-amber-300" />
              )}
              <p className="mt-2 text-sm font-semibold text-zinc-100">{label}</p>
              <p className="mt-1 text-xs text-zinc-500">
                {connected ? "Connected" : "No data yet"}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
