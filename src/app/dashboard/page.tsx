import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import {
  ArrowRight,
  Bell,
  BriefcaseBusiness,
  ClipboardCheck,
  Compass,
  FileText,
  MessageSquareText,
  Sparkles,
  Target,
  Upload,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { MobileSidebar, Sidebar } from "@/app/dashboard/dashboard-sidebar";
import { PremiumBackground } from "@/components/premium-background";
import { Button } from "@/components/ui/button";
import { getCurrentDbUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { withRetry } from "@/lib/retry";

type KpiCardData = {
  label: string;
  value: string;
  subtitle: string;
  status: string;
  delta: string;
  progress: number;
  tone: "cyan" | "purple" | "emerald" | "amber";
  icon: LucideIcon;
  trend: number[];
};

type QuickActionData = {
  title: string;
  subtitle: string;
  href: string;
  icon: LucideIcon;
};

type ActivityData = {
  label: string;
  detail: string;
  time: string;
};

type ResumeSnapshotData = {
  atsScore: number | null;
  matchScore: number | null;
  health: string;
  detectedRole: string;
  lastAnalysis: string;
  resumeTitle: string | null;
};

type UserProfile = {
  email: string;
  role: string;
  initial: string;
};

const quickActions: QuickActionData[] = [
  {
    title: "Upload Resume",
    subtitle: "Start with a fresh baseline",
    href: "/dashboard/resume",
    icon: Upload,
  },
  {
    title: "Match a Job",
    subtitle: "Compare against a target JD",
    href: "/dashboard/resume/match",
    icon: Target,
  },
  {
    title: "Practice Interview",
    subtitle: "Run a focused mock round",
    href: "/dashboard/interview",
    icon: MessageSquareText,
  },
  {
    title: "Open Coach",
    subtitle: "Turn signals into a roadmap",
    href: "/dashboard/coach",
    icon: Compass,
  },
  {
    title: "AI Recruiter Mode",
    subtitle: "Rank candidates and generate reports",
    href: "/dashboard/recruiter",
    icon: BriefcaseBusiness,
  },
];

const recentActivity: ActivityData[] = [
  {
    label: "Resume intelligence ready",
    detail: "Latest resume signal is available.",
    time: "Now",
  },
  {
    label: "ATS checklist refreshed",
    detail: "Optimization guidance is queued.",
    time: "Today",
  },
  {
    label: "Job match workspace active",
    detail: "Compare the next role from JD Match.",
    time: "1d",
  },
  {
    label: "Interview practice available",
    detail: "Mock interview feedback is ready when you are.",
    time: "2d",
  },
];

function buildResumeSnapshot(
  latestResume: {
    title: string;
    atsScore: number | null;
    matchScore: number | null;
    updatedAt: Date;
    atsAnalysis: unknown;
  } | null
): ResumeSnapshotData {
  if (!latestResume) {
    return {
      atsScore: null,
      matchScore: null,
      health: "Not analyzed",
      detectedRole: "Upload resume",
      lastAnalysis: "No analysis yet",
      resumeTitle: null,
    };
  }

  const analysis = latestResume.atsAnalysis;
  const grade = getAnalysisText(analysis, "grade");
  const detectedRole =
    getAnalysisText(analysis, "detectedProfileType") ??
    getAnalysisText(analysis, "targetRole") ??
    getAnalysisText(analysis, "detectedDomain") ??
    "General profile";

  return {
    atsScore: latestResume.atsScore,
    matchScore: latestResume.matchScore,
    health: grade ?? getHealthFromScore(latestResume.atsScore),
    detectedRole,
    lastAnalysis: formatRelativeTime(latestResume.updatedAt),
    resumeTitle: latestResume.title,
  };
}

function getAnalysisText(value: unknown, key: string) {
  if (!value || typeof value !== "object" || !(key in value)) {
    return null;
  }

  const field = (value as Record<string, unknown>)[key];
  return typeof field === "string" && field.trim() ? field : null;
}

function getHealthFromScore(score: number | null) {
  if (score === null) return "Not analyzed";
  if (score >= 80) return "Strong";
  if (score >= 65) return "Good";
  if (score >= 50) return "Needs polish";
  return "Needs work";
}

function formatRelativeTime(date: Date) {
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.max(0, Math.round(diffMs / 60000));

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes === 1 ? "" : "s"} ago`;

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;

  const diffDays = Math.round(diffHours / 24);
  return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
}

export default async function DashboardPage() {
  const user = await getCurrentDbUser();

  if (!user.role) {
    redirect("/onboarding");
  }

  const profile: UserProfile = {
    email: user.email,
    role: user.role,
    initial: user.email?.[0]?.toUpperCase() ?? "U",
  };
  const latestResume = await withRetry(() =>
    prisma.resume.findFirst({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
      select: {
        title: true,
        atsScore: true,
        matchScore: true,
        updatedAt: true,
        atsAnalysis: true,
      },
    })
  );
  const snapshot = buildResumeSnapshot(latestResume);
  const readiness = getCareerReadiness(snapshot);
  const kpis = buildKpis(snapshot, readiness);

  return (
    <PremiumBackground contentClassName="mx-auto flex w-full max-w-[1500px] flex-col gap-6 px-4 py-5 sm:px-6 xl:flex-row xl:px-7">
      <div className="xl:hidden">
        <MobileSidebar profile={profile} />
      </div>

      <div className="hidden xl:block xl:w-72 xl:shrink-0">
        <Sidebar profile={profile} />
      </div>

      <section className="min-w-0 flex-1 space-y-6">
        <TopHeader profile={profile} />
        <ExecutiveHero profile={profile} snapshot={snapshot} readiness={readiness} />
        <KpiGrid cards={kpis} />

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.48fr)_390px]">
          <div className="space-y-6">
            <CareerInsights snapshot={snapshot} />
            <AnalyticsSection snapshot={snapshot} readiness={readiness} />
          </div>

          <aside className="space-y-6">
            <QuickActions />
            <ActivityTimeline />
          </aside>
        </div>
      </section>
    </PremiumBackground>
  );
}

function getCareerReadiness(snapshot: ResumeSnapshotData) {
  const signals = [snapshot.atsScore, snapshot.matchScore].filter(
    (score): score is number => typeof score === "number"
  );

  if (!signals.length) {
    return null;
  }

  return Math.round(signals.reduce((total, score) => total + score, 0) / signals.length);
}

function buildKpis(
  snapshot: ResumeSnapshotData,
  readiness: number | null
): KpiCardData[] {
  const atsScore = snapshot.atsScore ?? 0;
  const matchScore = snapshot.matchScore ?? 0;
  const interviewProgress = readiness === null ? 18 : Math.min(100, Math.round(readiness * 0.72));
  const healthProgress = snapshot.atsScore ?? (snapshot.resumeTitle ? 52 : 18);

  return [
    {
      label: "ATS Score",
      value: snapshot.atsScore === null ? "--" : String(snapshot.atsScore),
      subtitle: "Recruiter systems fit",
      status: getStatusLabel(snapshot.atsScore),
      delta: snapshot.atsScore === null ? "Upload resume" : "+8 potential",
      progress: atsScore,
      tone: "emerald",
      icon: ClipboardCheck,
      trend: [42, 48, 53, 57, 64, Math.max(atsScore, 68)],
    },
    {
      label: "Job Match",
      value: snapshot.matchScore === null ? "--" : `${snapshot.matchScore}%`,
      subtitle: "Target role alignment",
      status: getStatusLabel(snapshot.matchScore),
      delta: snapshot.matchScore === null ? "Run JD Match" : "+12 keywords",
      progress: matchScore,
      tone: "purple",
      icon: Target,
      trend: [36, 44, 49, 58, 61, Math.max(matchScore, 64)],
    },
    {
      label: "Interview Readiness",
      value: readiness === null ? "--" : `${interviewProgress}%`,
      subtitle: "Practice coverage",
      status: readiness === null ? "Not started" : "Recommended",
      delta: "1 round next",
      progress: interviewProgress,
      tone: "cyan",
      icon: MessageSquareText,
      trend: [22, 26, 30, 38, 42, interviewProgress],
    },
    {
      label: "Resume Health",
      value: snapshot.health,
      subtitle: snapshot.resumeTitle ? "Latest resume" : "No resume yet",
      status: snapshot.resumeTitle ? "Active" : "Setup needed",
      delta: snapshot.lastAnalysis,
      progress: healthProgress,
      tone: "amber",
      icon: FileText,
      trend: [28, 36, 42, 50, 58, healthProgress],
    },
  ];
}

function getStatusLabel(score: number | null) {
  if (score === null) return "Needs signal";
  if (score >= 80) return "Strong";
  if (score >= 65) return "Improving";
  return "Needs focus";
}

function TopHeader({ profile }: { profile: UserProfile }) {
  return (
    <header className="flex items-center justify-between gap-4 rounded-[1.35rem] border border-white/[0.08] bg-white/[0.035] px-4 py-3 shadow-[0_0_28px_rgba(0,229,255,0.07)] backdrop-blur-2xl">
      <div>
        <p className="text-xs uppercase tracking-wide text-slate-600">Overview</p>
        <p className="mt-1 text-sm text-slate-300">Executive dashboard</p>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Notifications"
          className="grid h-10 w-10 place-items-center rounded-2xl border border-white/[0.08] bg-[#070b1f]/70 text-slate-400 transition duration-300 hover:border-cyan-300/25 hover:bg-[#00E5FF]/10 hover:text-cyan-50"
        >
          <Bell className="h-4 w-4" />
        </button>
        <div className="hidden items-center gap-3 rounded-2xl border border-white/[0.08] bg-[#070b1f]/70 px-3 py-2 sm:flex">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-[#00E5FF] to-[#6A5CFF] text-xs font-bold text-white">
            {profile.initial}
          </span>
          <span className="max-w-[220px] truncate text-sm text-slate-300">
            {profile.email}
          </span>
        </div>
      </div>
    </header>
  );
}

function ExecutiveHero({
  profile,
  snapshot,
  readiness,
}: {
  profile: UserProfile;
  snapshot: ResumeSnapshotData;
  readiness: number | null;
}) {
  const name = profile.email.split("@")[0] || "there";
  const readinessLabel = readiness === null ? "Start" : String(readiness);
  const readinessProgress = readiness ?? 18;

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-white/[0.08] bg-[linear-gradient(135deg,rgba(0,229,255,0.11),rgba(106,92,255,0.08)_46%,rgba(139,92,246,0.1))] p-5 shadow-[0_0_32px_rgba(0,229,255,0.09),0_0_42px_rgba(106,92,255,0.09)] backdrop-blur-2xl sm:p-7">
      <div className="pointer-events-none absolute -right-20 -top-28 h-64 w-64 rounded-full bg-[#00E5FF]/12 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 left-1/2 h-56 w-56 rounded-full bg-[#8B5CF6]/12 blur-3xl" />
      <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1fr)_330px] lg:items-center">
        <div className="max-w-3xl">
          <p className="inline-flex rounded-full border border-[#00E5FF]/18 bg-[#00E5FF]/8 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cyan-100">
            Welcome back, {name}
          </p>
          <h1 className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-[2.75rem]">
            Your hiring command center.
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
            Focus on the next move: improve your resume signal, match the right role,
            and practice with intent.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild className="rounded-2xl bg-gradient-to-r from-[#00E5FF] via-[#6A5CFF] to-[#8B5CF6] text-white shadow-[0_0_26px_rgba(0,229,255,0.2)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_34px_rgba(0,229,255,0.28)]">
              <Link href="/dashboard/resume">
                <Upload className="h-4 w-4" />
                Improve Resume
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-2xl border-white/15 bg-white/[0.04] text-white shadow-[0_0_20px_rgba(0,229,255,0.06)] transition duration-300 hover:-translate-y-0.5 hover:border-[#00E5FF]/25 hover:bg-[#00E5FF]/10">
              <Link href="/dashboard/analytics">
                View Analytics
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[1.6rem] border border-cyan-300/14 bg-[#070B1F]/62 p-5 shadow-[0_0_28px_rgba(0,229,255,0.1)]">
          <div className="absolute right-5 top-5">
            <HeroIllustration />
          </div>
          <p className="text-xs font-semibold uppercase tracking-wide text-cyan-100">
            Career Readiness
          </p>
          <div className="mt-5 flex items-end gap-4">
            <ProgressRing value={readinessProgress} label={readinessLabel} size="lg" />
            <div className="pb-2">
              <p className="text-sm font-medium text-white">
                {readiness === null ? "No resume analyzed" : getStatusLabel(readiness)}
              </p>
              <p className="mt-1 max-w-40 text-xs leading-5 text-slate-500">
                {snapshot.resumeTitle
                  ? `Updated ${snapshot.lastAnalysis}`
                  : "Upload a resume to unlock scoring."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroIllustration() {
  return (
    <div className="relative h-20 w-20 opacity-80" aria-hidden="true">
      <div className="absolute inset-2 rounded-full border border-cyan-300/18" />
      <div className="absolute inset-6 rounded-2xl border border-purple-300/20 bg-white/[0.04]" />
      <Sparkles className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 text-cyan-100" />
      {[0, 1, 2].map((item) => (
        <span
          key={item}
          className="absolute h-1.5 w-1.5 rounded-full bg-[#00E5FF] shadow-[0_0_12px_rgba(0,229,255,0.65)]"
          style={{
            left: `${50 + Math.cos((item / 3) * Math.PI * 2) * 38}%`,
            top: `${50 + Math.sin((item / 3) * Math.PI * 2) * 38}%`,
          }}
        />
      ))}
    </div>
  );
}

function KpiGrid({ cards }: { cards: KpiCardData[] }) {
  return (
    <section className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4" aria-label="Key metrics">
      {cards.map((card) => (
        <KpiCard key={card.label} card={card} />
      ))}
    </section>
  );
}

function KpiCard({ card }: { card: KpiCardData }) {
  const Icon = card.icon;
  const tone = getTone(card.tone);

  return (
    <article className="group rounded-[1.6rem] border border-white/[0.08] bg-white/[0.04] p-5 shadow-[0_0_28px_rgba(0,229,255,0.07)] backdrop-blur-2xl transition duration-300 hover:-translate-y-0.5 hover:border-cyan-300/20 hover:shadow-[0_0_34px_rgba(0,229,255,0.12)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {card.label}
          </p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-white">
            {card.value}
          </p>
        </div>
        <span className={`grid h-10 w-10 place-items-center rounded-2xl border ${tone.icon}`}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <div className="mt-4 flex items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm text-slate-400">{card.subtitle}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className={`rounded-full border px-2.5 py-1 text-[0.7rem] font-semibold ${tone.badge}`}>
              {card.status}
            </span>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[0.7rem] font-semibold text-slate-400">
              {card.delta}
            </span>
          </div>
        </div>
        <ProgressRing value={card.progress} label={`${card.progress}`} />
      </div>
      <MiniSparkline values={card.trend} tone={card.tone} />
    </article>
  );
}

function ProgressRing({
  value,
  label,
  size = "sm",
}: {
  value: number;
  label: string;
  size?: "sm" | "lg";
}) {
  const clampedValue = Math.max(0, Math.min(100, value));

  return (
    <div
      className={`grid shrink-0 place-items-center rounded-full p-1 ${
        size === "lg" ? "h-28 w-28" : "h-16 w-16"
      }`}
      style={{
        background: `conic-gradient(#00E5FF ${clampedValue}%, rgba(255,255,255,0.1) 0)`,
      }}
      aria-label={`${clampedValue}%`}
    >
      <div className="grid h-full w-full place-items-center rounded-full bg-[#050816] text-center shadow-inner">
        <span className={size === "lg" ? "text-3xl font-semibold" : "text-sm font-semibold"}>
          {label}
        </span>
      </div>
    </div>
  );
}

function MiniSparkline({
  values,
  tone,
}: {
  values: number[];
  tone: KpiCardData["tone"];
}) {
  const points = values
    .map((value, index) => {
      const x = (index / Math.max(1, values.length - 1)) * 120;
      const y = 34 - (Math.max(0, Math.min(100, value)) / 100) * 28;
      return `${x},${y}`;
    })
    .join(" ");
  const stroke =
    tone === "purple"
      ? "#8B5CF6"
      : tone === "emerald"
        ? "#34D399"
        : tone === "amber"
          ? "#FBBF24"
          : "#00E5FF";

  return (
    <svg className="mt-5 h-10 w-full overflow-visible" viewBox="0 0 120 40" aria-hidden="true">
      <polyline
        points={points}
        fill="none"
        stroke={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="3"
      />
      <path d={`M0 38 L${points} L120 38 Z`} fill={stroke} opacity="0.08" />
    </svg>
  );
}

function CareerInsights({ snapshot }: { snapshot: ResumeSnapshotData }) {
  const recommendedAction = getRecommendedAction(snapshot);

  return (
    <DashboardPanel
      eyebrow="Career Insights"
      title="The next signal that matters"
      description="A single read on strengths, gaps, and the highest-leverage action."
    >
      <div className="grid gap-5 lg:grid-cols-[1fr_1fr_1.2fr]">
        <InsightColumn
          title="Top Skills"
          items={["Resume structure", "Role targeting", snapshot.detectedRole]}
          tone="cyan"
        />
        <InsightColumn
          title="Skill Gaps"
          items={getSkillGaps(snapshot)}
          tone="purple"
        />
        <div className="rounded-[1.35rem] border border-white/[0.08] bg-[#070B1F]/64 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Recommended Action
          </p>
          <h3 className="mt-3 text-lg font-semibold text-white">
            {recommendedAction.title}
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            {recommendedAction.description}
          </p>
          <Button asChild className="mt-5 rounded-2xl bg-[#00E5FF]/12 text-cyan-50 ring-1 ring-cyan-300/20 transition duration-300 hover:bg-[#00E5FF]/18">
            <Link href={recommendedAction.href}>
              Continue
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </DashboardPanel>
  );
}

function getRecommendedAction(snapshot: ResumeSnapshotData) {
  if (!snapshot.resumeTitle) {
    return {
      title: "Upload your resume",
      description: "Create the baseline that powers ATS, JD match, and coach insights.",
      href: "/dashboard/resume",
    };
  }

  if ((snapshot.atsScore ?? 0) < 75) {
    return {
      title: "Improve ATS signal",
      description: "Tighten formatting, keywords, and recruiter-friendly evidence.",
      href: "/dashboard/resume/ats",
    };
  }

  if ((snapshot.matchScore ?? 0) < 75) {
    return {
      title: "Match the next role",
      description: "Compare your resume against a target job description before applying.",
      href: "/dashboard/resume/match",
    };
  }

  return {
    title: "Practice the interview",
    description: "Convert strong document signals into confident interview performance.",
    href: "/dashboard/interview",
  };
}

function getSkillGaps(snapshot: ResumeSnapshotData) {
  const gaps = [];

  if ((snapshot.atsScore ?? 0) < 80) gaps.push("ATS keyword coverage");
  if ((snapshot.matchScore ?? 0) < 80) gaps.push("JD alignment");
  gaps.push("Interview evidence");

  return gaps;
}

function InsightColumn({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: "cyan" | "purple";
}) {
  return (
    <div className="rounded-[1.35rem] border border-white/[0.08] bg-[#070B1F]/54 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {title}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
              tone === "cyan"
                ? "border-cyan-300/18 bg-cyan-300/8 text-cyan-100"
                : "border-purple-300/18 bg-purple-300/8 text-purple-100"
            }`}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function AnalyticsSection({
  snapshot,
  readiness,
}: {
  snapshot: ResumeSnapshotData;
  readiness: number | null;
}) {
  const ats = snapshot.atsScore ?? 0;
  const match = snapshot.matchScore ?? 0;
  const interview = readiness === null ? 18 : Math.min(100, Math.round(readiness * 0.72));

  return (
    <DashboardPanel
      eyebrow="Analytics"
      title="Performance trends"
      description="One consolidated analytics workspace for the core dashboard signals."
      action={
        <Button asChild variant="outline" className="rounded-2xl border-white/15 bg-white/[0.04] text-white hover:border-[#00E5FF]/25 hover:bg-[#00E5FF]/10">
          <Link href="/dashboard/analytics">Open full analytics</Link>
        </Button>
      }
    >
      <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
        {["ATS trend", "Interview trend", "JD trend", "Resume versions"].map((tab, index) => (
          <span
            key={tab}
            className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold ${
              index === 0
                ? "border-cyan-300/24 bg-[#00E5FF]/12 text-cyan-100"
                : "border-white/10 bg-white/[0.035] text-slate-500"
            }`}
          >
            {tab}
          </span>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
        <div className="rounded-[1.5rem] border border-white/[0.08] bg-[#070B1F]/60 p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-white">ATS trend</p>
              <p className="mt-1 text-xs text-slate-500">Latest resume signal</p>
            </div>
            <span className="text-2xl font-semibold text-cyan-100">
              {snapshot.atsScore === null ? "--" : snapshot.atsScore}
            </span>
          </div>
          <LargeTrendChart
            series={[
              [28, 36, 44, 52, 60, Math.max(ats, 64)],
              [20, 30, 38, 48, 54, Math.max(match, 58)],
              [18, 24, 31, 38, 44, interview],
            ]}
          />
        </div>
        <div className="grid gap-3">
          <AnalyticsMini label="JD trend" value={snapshot.matchScore === null ? "--" : `${snapshot.matchScore}%`} progress={match} />
          <AnalyticsMini label="Interview trend" value={readiness === null ? "--" : `${interview}%`} progress={interview} />
          <AnalyticsMini label="Resume versions" value={snapshot.resumeTitle ? "Active" : "0"} progress={snapshot.resumeTitle ? 72 : 8} />
        </div>
      </div>
    </DashboardPanel>
  );
}

function LargeTrendChart({ series }: { series: number[][] }) {
  const colors = ["#00E5FF", "#8B5CF6", "#34D399"];

  return (
    <svg className="mt-6 h-56 w-full" viewBox="0 0 420 210" aria-hidden="true">
      {[0, 1, 2, 3].map((line) => (
        <line
          key={line}
          x1="0"
          x2="420"
          y1={36 + line * 44}
          y2={36 + line * 44}
          stroke="rgba(255,255,255,0.06)"
        />
      ))}
      {series.map((values, index) => {
        const points = values
          .map((value, valueIndex) => {
            const x = (valueIndex / Math.max(1, values.length - 1)) * 400 + 10;
            const y = 188 - (Math.max(0, Math.min(100, value)) / 100) * 150;
            return `${x},${y}`;
          })
          .join(" ");

        return (
          <polyline
            key={colors[index]}
            points={points}
            fill="none"
            stroke={colors[index]}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="4"
            opacity={index === 0 ? 1 : 0.55}
          />
        );
      })}
    </svg>
  );
}

function AnalyticsMini({
  label,
  value,
  progress,
}: {
  label: string;
  value: string;
  progress: number;
}) {
  return (
    <div className="rounded-[1.25rem] border border-white/[0.08] bg-white/[0.035] p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-slate-300">{label}</p>
        <p className="text-sm font-semibold text-white">{value}</p>
      </div>
      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#00E5FF] to-[#8B5CF6]"
          style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
        />
      </div>
    </div>
  );
}

function QuickActions() {
  return (
    <DashboardPanel eyebrow="Actions" title="Next moves">
      <div className="grid gap-3">
        {quickActions.map((action) => (
          <QuickActionItem key={action.title} action={action} />
        ))}
      </div>
      <Button asChild variant="outline" className="mt-4 w-full rounded-2xl border-white/15 bg-white/[0.035] text-white hover:border-[#00E5FF]/25 hover:bg-[#00E5FF]/10">
        <Link href="/dashboard/resume">
          View All Tools
          <ArrowRight className="h-4 w-4" />
        </Link>
      </Button>
    </DashboardPanel>
  );
}

function QuickActionItem({ action }: { action: QuickActionData }) {
  const Icon = action.icon;

  return (
    <Link
      href={action.href}
      className="group flex items-center gap-4 rounded-[1.35rem] border border-white/[0.08] bg-[#070B1F]/64 p-4 transition duration-300 hover:-translate-y-0.5 hover:border-cyan-300/20 hover:bg-[#00E5FF]/8 hover:shadow-[0_0_26px_rgba(0,229,255,0.1)]"
    >
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-cyan-300/16 bg-[#00E5FF]/8 text-cyan-100">
        <Icon className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-white">{action.title}</span>
        <span className="mt-1 block text-xs leading-5 text-slate-500">
          {action.subtitle}
        </span>
      </span>
      <ArrowRight className="h-4 w-4 text-slate-600 transition group-hover:translate-x-0.5 group-hover:text-cyan-100" />
    </Link>
  );
}

function ActivityTimeline() {
  return (
    <DashboardPanel eyebrow="Activity" title="Latest events">
      <div className="space-y-3">
        {recentActivity.slice(0, 4).map((activity) => (
          <ActivityItem key={activity.label} activity={activity} />
        ))}
      </div>
    </DashboardPanel>
  );
}

function ActivityItem({ activity }: { activity: ActivityData }) {
  return (
    <div className="flex gap-3 rounded-[1.2rem] border border-white/[0.07] bg-[#070B1F]/48 px-3 py-3">
      <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#00E5FF] shadow-[0_0_12px_rgba(0,229,255,0.65)]" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <p className="truncate text-sm font-medium text-slate-100">{activity.label}</p>
          <span className="shrink-0 text-xs text-slate-600">{activity.time}</span>
        </div>
        <p className="mt-1 text-xs leading-5 text-slate-500">{activity.detail}</p>
      </div>
    </div>
  );
}

function DashboardPanel({
  eyebrow,
  title,
  description,
  action,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[1.75rem] border border-white/[0.08] bg-white/[0.04] p-5 shadow-[0_0_30px_rgba(0,229,255,0.07)] backdrop-blur-2xl sm:p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          {eyebrow ? (
            <p className="text-xs font-semibold uppercase tracking-wide text-cyan-100">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-white">{title}</h2>
          {description ? (
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              {description}
            </p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {children}
    </section>
  );
}

function getTone(tone: KpiCardData["tone"]) {
  if (tone === "purple") {
    return {
      icon: "border-purple-300/20 bg-purple-300/10 text-purple-100",
      badge: "border-purple-300/20 bg-purple-300/10 text-purple-100",
    };
  }

  if (tone === "emerald") {
    return {
      icon: "border-emerald-300/20 bg-emerald-300/10 text-emerald-100",
      badge: "border-emerald-300/20 bg-emerald-300/10 text-emerald-100",
    };
  }

  if (tone === "amber") {
    return {
      icon: "border-amber-300/20 bg-amber-300/10 text-amber-100",
      badge: "border-amber-300/20 bg-amber-300/10 text-amber-100",
    };
  }

  return {
    icon: "border-cyan-300/20 bg-cyan-300/10 text-cyan-100",
    badge: "border-cyan-300/20 bg-cyan-300/10 text-cyan-100",
  };
}
