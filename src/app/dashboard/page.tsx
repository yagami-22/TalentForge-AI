import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import {
  Activity,
  ArrowRight,
  Bell,
  BriefcaseBusiness,
  ClipboardCheck,
  Compass,
  FileText,
  GitBranch,
  Home,
  Menu,
  MessageSquareText,
  PenLine,
  Search,
  Settings,
  Sparkles,
  Target,
  Upload,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { PremiumBackground } from "@/components/premium-background";
import { Button } from "@/components/ui/button";
import { getCurrentDbUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { withRetry } from "@/lib/retry";

type Tone = "cyan" | "purple" | "emerald" | "amber" | "blue";

type KpiCardData = {
  label: string;
  value: string;
  suffix?: string;
  subtitle: string;
  status: string;
  delta: string;
  progress: number | null;
  tone: Tone;
  icon: LucideIcon;
  trend?: number[];
  href?: string;
};

type QuickActionData = {
  title: string;
  subtitle: string;
  href: string;
  icon: LucideIcon;
  cta: string;
  accent: Tone;
};

type ActivityData = {
  label: string;
  detail: string;
  time: string;
  status: "Completed" | "View" | "Ready";
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

type NavGroup = {
  label: string;
  items: {
    label: string;
    href: string;
    icon: LucideIcon;
    active?: boolean;
  }[];
};

const dashboardNav: NavGroup[] = [
  {
    label: "Main",
    items: [{ label: "Dashboard", href: "/dashboard", icon: Home, active: true }],
  },
  {
    label: "Career Intelligence",
    items: [
      { label: "Resume Intelligence", href: "/dashboard/resume", icon: FileText },
      { label: "ATS Optimizer", href: "/dashboard/resume/ats", icon: ClipboardCheck },
      { label: "JD Match", href: "/dashboard/resume/match", icon: Target },
      { label: "Resume Rewriter", href: "/dashboard/resume/rewrite", icon: PenLine },
      { label: "Resume History", href: "/dashboard/resume/history", icon: Activity },
      { label: "GitHub Analyzer", href: "/dashboard/github", icon: GitBranch },
    ],
  },
  {
    label: "Interview & Growth",
    items: [
      { label: "AI Mock Interviews", href: "/dashboard/interview", icon: MessageSquareText },
      { label: "AI Recruiter Mode", href: "/dashboard/recruiter", icon: BriefcaseBusiness },
      { label: "Career Coach", href: "/dashboard/coach", icon: Compass },
    ],
  },
  {
    label: "Settings",
    items: [{ label: "Settings", href: "/dashboard/settings", icon: Settings }],
  },
];

const quickActions: QuickActionData[] = [
  {
    title: "Improve ATS Score",
    subtitle: "Optimize keywords and sections",
    href: "/dashboard/resume/ats",
    icon: ClipboardCheck,
    cta: "Start",
    accent: "purple",
  },
  {
    title: "Add Project Metrics",
    subtitle: "Increase recruiter impact score",
    href: "/dashboard/resume/rewrite",
    icon: FileText,
    cta: "Open",
    accent: "blue",
  },
  {
    title: "Practice Interviews",
    subtitle: "Build confidence with one round",
    href: "/dashboard/interview",
    icon: MessageSquareText,
    cta: "Practice",
    accent: "cyan",
  },
  {
    title: "Update GitHub",
    subtitle: "Keep portfolio evidence fresh",
    href: "/dashboard/github",
    icon: GitBranch,
    cta: "Analyze",
    accent: "emerald",
  },
];

const recentActivity: ActivityData[] = [
  {
    label: "Resume analyzed",
    detail: "Latest resume intelligence is available.",
    time: "Now",
    status: "Completed",
  },
  {
    label: "ATS optimization ready",
    detail: "Keyword and formatting guidance is queued.",
    time: "Today",
    status: "Completed",
  },
  {
    label: "JD match workspace active",
    detail: "Compare against the next role from JD Match.",
    time: "1d",
    status: "View",
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
    <PremiumBackground contentClassName="mx-auto flex min-h-screen w-full max-w-[1800px] flex-col px-0 py-0 xl:flex-row">
      <div className="xl:hidden">
        <MobileExecutiveNav profile={profile} />
      </div>

      <div className="hidden xl:block xl:w-[292px] xl:shrink-0">
        <ExecutiveSidebar profile={profile} />
      </div>

      <main className="min-w-0 flex-1 px-4 py-4 sm:px-5 lg:px-7">
        <TopBar profile={profile} />

        <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
          <WelcomeHero profile={profile} snapshot={snapshot} readiness={readiness} />
          <ReadinessPanel snapshot={snapshot} readiness={readiness} />
        </div>

        <KpiGrid cards={kpis} />

        <div className="mt-4 grid gap-4 2xl:grid-cols-[minmax(0,1.1fr)_minmax(380px,0.9fr)]">
          <CareerOverview snapshot={snapshot} readiness={readiness} />
          <TodaysFocus snapshot={snapshot} />
        </div>

        <div className="mt-4 grid gap-4 2xl:grid-cols-[minmax(0,0.86fr)_minmax(0,1.14fr)]">
          <ActivityTimeline />
          <RecommendationPath snapshot={snapshot} />
        </div>
      </main>
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
  const atsScore = snapshot.atsScore;
  const resumeProgress = snapshot.resumeTitle ? snapshot.atsScore ?? 52 : null;
  const interviewProgress =
    readiness === null ? null : Math.min(100, Math.round(readiness * 0.72));
  const recruiterConfidence =
    readiness === null
      ? null
      : Math.min(
          100,
          Math.round(readiness * 0.82 + (snapshot.matchScore ?? readiness) * 0.18)
        );

  return [
    {
      label: "ATS Score",
      value: atsScore === null ? "--" : String(atsScore),
      suffix: atsScore === null ? undefined : "/100",
      subtitle: "Recruiter systems fit",
      status: getStatusLabel(atsScore),
      delta: atsScore === null ? "Upload resume" : "Evidence based",
      progress: atsScore,
      tone: "blue",
      icon: ClipboardCheck,
      trend: atsScore === null ? undefined : makeTrend(atsScore, 18),
      href: "/dashboard/resume/ats",
    },
    {
      label: "Resume Score",
      value: snapshot.resumeTitle ? snapshot.health : "--",
      suffix: resumeProgress === null ? undefined : `${resumeProgress}/100`,
      subtitle: "Latest resume quality",
      status: snapshot.resumeTitle ? "Tracked" : "Missing",
      delta: snapshot.lastAnalysis,
      progress: resumeProgress,
      tone: "purple",
      icon: FileText,
      trend: resumeProgress === null ? undefined : makeTrend(resumeProgress, 16),
      href: "/dashboard/resume",
    },
    {
      label: "GitHub Score",
      value: "--",
      subtitle: "Repository proof",
      status: "Connect GitHub",
      delta: "Analyzer ready",
      progress: null,
      tone: "emerald",
      icon: GitBranch,
      href: "/dashboard/github",
    },
    {
      label: "Interview Readiness",
      value: interviewProgress === null ? "--" : `${interviewProgress}%`,
      subtitle: "Practice coverage",
      status: interviewProgress === null ? "Not started" : "Recommended",
      delta: interviewProgress === null ? "Start session" : "Next round",
      progress: interviewProgress,
      tone: "amber",
      icon: MessageSquareText,
      trend: interviewProgress === null ? undefined : makeTrend(interviewProgress, 22),
      href: "/dashboard/interview",
    },
    {
      label: "Recruiter Confidence",
      value: recruiterConfidence === null ? "--" : `${recruiterConfidence}%`,
      subtitle: "Evidence quality",
      status:
        recruiterConfidence === null
          ? "Pending"
          : recruiterConfidence >= 70
            ? "Promising"
            : "Developing",
      delta: snapshot.resumeTitle ? "Evidence based" : "Needs resume",
      progress: recruiterConfidence,
      tone: "purple",
      icon: BriefcaseBusiness,
      trend: recruiterConfidence === null ? undefined : makeTrend(recruiterConfidence, 20),
      href: "/dashboard/recruiter",
    },
  ];
}

function makeTrend(score: number, spread: number) {
  const base = Math.max(8, score - spread);
  return [base, base + 5, base + 9, base + 13, Math.max(base + 14, score - 4), score].map(
    (value) => Math.max(0, Math.min(100, value))
  );
}

function getStatusLabel(score: number | null) {
  if (score === null) return "Needs signal";
  if (score >= 80) return "Strong";
  if (score >= 65) return "Improving";
  return "Needs focus";
}

function ExecutiveSidebar({ profile }: { profile: UserProfile }) {
  return (
    <aside className="sticky top-0 flex h-screen flex-col border-r border-white/[0.08] bg-[#050914]/70 px-4 py-5 shadow-[18px_0_70px_rgba(0,0,0,0.24)] backdrop-blur-2xl">
      <Link
        href="/dashboard"
        className="flex items-center gap-3 rounded-2xl px-2 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/40"
      >
        <span className="relative grid h-8 w-8 place-items-center">
          <span className="absolute h-7 w-7 rotate-45 rounded-[0.55rem] bg-gradient-to-br from-[#00E5FF] via-[#6A5CFF] to-[#FF3DFE]" />
          <Sparkles className="relative h-4 w-4 text-white" />
        </span>
        <span className="text-lg font-semibold tracking-tight text-white">TalentForge AI</span>
      </Link>

      <nav className="mt-7 min-h-0 flex-1 space-y-6 overflow-y-auto pr-1" aria-label="Dashboard navigation">
        {dashboardNav.map((group) => (
          <div key={group.label}>
            <p className="px-3 text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-slate-500">
              {group.label}
            </p>
            <div className="mt-2 space-y-1">
              {group.items.map((item) => (
                <SidebarLink key={item.href} item={item} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="mt-5 rounded-[1.35rem] border border-white/[0.08] bg-white/[0.035] p-3">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-[#00E5FF] to-[#6A5CFF] text-sm font-bold text-white">
            {profile.initial}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{getDisplayName(profile.email)}</p>
            <p className="truncate text-xs text-slate-500">{profile.role}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

function MobileExecutiveNav({ profile }: { profile: UserProfile }) {
  return (
    <details className="group border-b border-white/[0.08] bg-[#050914]/80 px-4 py-3 backdrop-blur-2xl">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
        <Link href="/dashboard" className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-2xl bg-gradient-to-br from-[#00E5FF] to-[#6A5CFF] text-sm font-bold text-white">
            {profile.initial}
          </span>
          <span className="text-base font-semibold text-white">TalentForge AI</span>
        </Link>
        <span className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-white/[0.04] text-slate-300">
          <Menu className="h-4 w-4" />
        </span>
      </summary>
      <nav className="mt-4 max-h-[70vh] space-y-5 overflow-y-auto pb-3" aria-label="Mobile dashboard navigation">
        {dashboardNav.map((group) => (
          <div key={group.label}>
            <p className="px-2 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-slate-500">
              {group.label}
            </p>
            <div className="mt-2 grid gap-1">
              {group.items.map((item) => (
                <SidebarLink key={item.href} item={item} />
              ))}
            </div>
          </div>
        ))}
      </nav>
    </details>
  );
}

function SidebarLink({
  item,
}: {
  item: NavGroup["items"][number];
}) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      aria-current={item.active ? "page" : undefined}
      className={`group flex items-center gap-3 rounded-2xl border px-3 py-3 text-sm transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/35 ${
        item.active
          ? "border-cyan-300/24 bg-[linear-gradient(135deg,rgba(0,229,255,0.16),rgba(106,92,255,0.2))] text-white shadow-[0_0_26px_rgba(0,229,255,0.12)]"
          : "border-transparent text-slate-400 hover:border-white/[0.08] hover:bg-white/[0.04] hover:text-slate-100"
      }`}
    >
      <Icon className={`h-4 w-4 ${item.active ? "text-cyan-100" : "text-slate-500 group-hover:text-cyan-100"}`} />
      <span>{item.label}</span>
    </Link>
  );
}

function TopBar({ profile }: { profile: UserProfile }) {
  return (
    <header className="grid gap-3 lg:grid-cols-[minmax(220px,1fr)_minmax(320px,0.72fr)_auto] lg:items-center">
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Open dashboard menu"
          className="hidden h-10 w-10 place-items-center rounded-2xl border border-white/[0.08] bg-white/[0.04] text-slate-300 xl:grid"
        >
          <Menu className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-white">Executive Dashboard</h1>
          <p className="mt-1 text-xs text-slate-400">Your AI-powered career command center</p>
        </div>
      </div>

      <label className="relative block">
        <span className="sr-only">Search dashboard modules</span>
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input
          type="search"
          placeholder="Search anything..."
          className="h-11 w-full rounded-2xl border border-white/[0.08] bg-[#080D1D]/80 pl-11 pr-14 text-sm text-slate-200 outline-none transition placeholder:text-slate-500 focus:border-cyan-300/35 focus:ring-2 focus:ring-cyan-300/15"
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded-lg border border-white/10 bg-white/[0.05] px-2 py-1 text-[0.65rem] font-semibold text-slate-500">
          /K
        </span>
      </label>

      <div className="flex items-center justify-between gap-3 lg:justify-end">
        <button
          type="button"
          aria-label="Notifications"
          className="grid h-11 w-11 place-items-center rounded-2xl border border-white/[0.08] bg-[#080D1D]/80 text-slate-300 transition hover:border-cyan-300/25 hover:text-cyan-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/35"
        >
          <Bell className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-[#080D1D]/80 px-3 py-2">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-[#00E5FF] to-[#6A5CFF] text-sm font-bold text-white">
            {profile.initial}
          </span>
          <div className="hidden min-w-0 sm:block">
            <p className="max-w-[150px] truncate text-sm font-semibold text-white">
              {getDisplayName(profile.email)}
            </p>
            <p className="truncate text-xs text-slate-500">{profile.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
}

function WelcomeHero({
  profile,
  snapshot,
  readiness,
}: {
  profile: UserProfile;
  snapshot: ResumeSnapshotData;
  readiness: number | null;
}) {
  const name = getDisplayName(profile.email);
  const insight = getAiInsight(snapshot, readiness);

  return (
    <section className="relative min-h-[252px] overflow-hidden rounded-[1.55rem] border border-white/[0.08] bg-[radial-gradient(circle_at_78%_25%,rgba(106,92,255,0.22),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.05),rgba(0,229,255,0.035)_46%,rgba(139,92,246,0.055))] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.22)] backdrop-blur-2xl sm:p-7">
      <div className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-[#00E5FF]/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-12 h-44 w-44 rounded-full bg-[#8B5CF6]/12 blur-3xl" />
      <div className="relative grid h-full gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-center">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Good evening, {name}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
            Track your progress, improve your profile, and get hired faster.
          </p>
          <div className="mt-7 max-w-2xl rounded-2xl border border-cyan-300/16 bg-[#00E5FF]/8 px-4 py-3">
            <p className="flex flex-wrap items-center gap-3 text-sm text-slate-300">
              <span className="inline-flex items-center gap-2 font-semibold text-cyan-100">
                <Sparkles className="h-4 w-4" />
                AI Insight
              </span>
              <span>{insight}</span>
            </p>
          </div>
        </div>

        <HeroIllustration />
      </div>
    </section>
  );
}

function HeroIllustration() {
  return (
    <div className="relative mx-auto hidden h-52 w-72 place-items-center lg:grid" aria-hidden="true">
      <div className="absolute bottom-4 h-20 w-56 rounded-[50%] bg-[#00E5FF]/10 blur-2xl" />
      <div className="absolute bottom-8 h-16 w-52 rotate-[-10deg] rounded-[1.4rem] border border-cyan-300/20 bg-[#08142B]/80 shadow-[0_0_38px_rgba(0,229,255,0.18)]" />
      <div className="absolute bottom-12 h-16 w-44 rotate-[8deg] rounded-[1.25rem] border border-purple-300/20 bg-[#111236]/80 shadow-[0_0_38px_rgba(139,92,246,0.22)]" />
      <div className="relative grid h-36 w-28 place-items-center rounded-[1.4rem] border border-cyan-200/25 bg-[linear-gradient(160deg,rgba(0,229,255,0.16),rgba(106,92,255,0.24))] shadow-[0_0_34px_rgba(0,229,255,0.18),0_0_48px_rgba(139,92,246,0.2)]">
        <div className="h-24 w-16 rounded-xl border border-white/15 bg-[#050914]/70 p-3">
          <div className="h-2 w-10 rounded-full bg-cyan-200/50" />
          <div className="mt-4 h-12 rounded-lg border border-white/10 bg-gradient-to-tr from-cyan-400/20 to-purple-500/20" />
          <div className="mt-3 h-2 w-12 rounded-full bg-purple-200/40" />
        </div>
      </div>
    </div>
  );
}

function ReadinessPanel({
  snapshot,
  readiness,
}: {
  snapshot: ResumeSnapshotData;
  readiness: number | null;
}) {
  const readinessProgress = readiness ?? 0;
  const label = readiness === null ? "N/A" : String(readiness);

  return (
    <section className="rounded-[1.55rem] border border-white/[0.08] bg-white/[0.035] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.18)] backdrop-blur-2xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-white">Career Readiness</h2>
          <p className="mt-1 text-xs text-slate-500">
            {snapshot.resumeTitle ? "Improving" : "Awaiting resume"}
          </p>
        </div>
        <span className="rounded-xl border border-emerald-300/16 bg-emerald-300/10 px-3 py-1 text-xs font-semibold text-emerald-200">
          {readiness === null ? "Baseline needed" : "Improving"}
        </span>
      </div>
      <div className="mt-5 flex justify-center">
        <ReadinessDonut value={readinessProgress} label={label} />
      </div>
      <p className="mx-auto mt-4 max-w-[240px] text-center text-sm leading-6 text-slate-400">
        {readiness === null
          ? "Upload a resume to activate readiness scoring."
          : "You are on the right track. Keep optimizing to reach the next level."}
      </p>
    </section>
  );
}

function getAiInsight(snapshot: ResumeSnapshotData, readiness: number | null) {
  if (!snapshot.resumeTitle) {
    return "Upload a resume to activate ATS, JD match, interview, recruiter, and coach signals.";
  }

  if ((snapshot.atsScore ?? 0) < 75) {
    return "Your ATS score can improve with clearer project metrics and stronger keyword coverage.";
  }

  if ((snapshot.matchScore ?? 0) < 75) {
    return "Your resume signal is improving. Match it against a live job description before applying.";
  }

  return readiness === null || readiness < 80
    ? "Turn your document strength into interview readiness with one focused mock session."
    : "Your profile is application-ready. Keep GitHub and recruiter evidence current.";
}

function KpiGrid({ cards }: { cards: KpiCardData[] }) {
  return (
    <section
      className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5"
      aria-label="Key metrics"
    >
      {cards.map((card) => (
        <KpiCard key={card.label} card={card} />
      ))}
    </section>
  );
}

function KpiCard({ card }: { card: KpiCardData }) {
  const Icon = card.icon;
  const tone = getTone(card.tone);

  const content = (
    <article className="group h-full rounded-[1.35rem] border border-white/[0.08] bg-[linear-gradient(145deg,rgba(255,255,255,0.05),rgba(255,255,255,0.025))] p-4 shadow-[0_20px_55px_rgba(0,0,0,0.18)] backdrop-blur-2xl transition duration-300 hover:-translate-y-0.5 hover:border-cyan-300/20 hover:shadow-[0_0_26px_rgba(0,229,255,0.08)]">
      <div className="flex items-start justify-between gap-3">
        <span className={`grid h-10 w-10 place-items-center rounded-2xl border ${tone.icon}`}>
          <Icon className="h-4 w-4" />
        </span>
        <span className={`rounded-full border px-2.5 py-1 text-[0.68rem] font-semibold ${tone.badge}`}>
          {card.status}
        </span>
      </div>

      <div className="mt-4">
        <p className="text-sm font-medium text-slate-300">{card.label}</p>
        <div className="mt-2 flex items-baseline gap-2">
          <p className="text-2xl font-semibold tracking-tight text-white">{card.value}</p>
          {card.suffix ? <span className="text-xs font-semibold text-slate-400">{card.suffix}</span> : null}
        </div>
        <p className="mt-1 text-xs text-slate-500">{card.subtitle}</p>
      </div>

      <div className="mt-4 flex items-end justify-between gap-3">
        <span className="text-xs font-semibold text-emerald-200">{card.delta}</span>
        {card.trend ? <MiniSparkline values={card.trend} tone={card.tone} /> : <EmptySparkline />}
      </div>
    </article>
  );

  if (!card.href) return content;

  return (
    <Link
      href={card.href}
      className="block h-full rounded-[1.35rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/35"
    >
      {content}
    </Link>
  );
}

function ReadinessDonut({ value, label }: { value: number; label: string }) {
  const clampedValue = Math.max(0, Math.min(100, value));

  return (
    <div
      className="grid h-40 w-40 place-items-center rounded-full p-3 shadow-[0_0_36px_rgba(106,92,255,0.18)]"
      style={{
        background: `conic-gradient(#8B5CF6 0 ${clampedValue * 0.58}%, #3BA8FF ${clampedValue * 0.58}% ${clampedValue}%, rgba(255,255,255,0.08) 0)`,
      }}
      role="img"
      aria-label={`Career readiness ${label}${label === "N/A" ? "" : " out of 100"}`}
    >
      <div className="grid h-full w-full place-items-center rounded-full bg-[#050914] text-center shadow-inner">
        <div>
          <p className="text-3xl font-semibold tracking-tight text-white">{label}</p>
          <p className="mt-1 text-xs text-slate-500">{label === "N/A" ? "Pending" : "/100"}</p>
        </div>
      </div>
    </div>
  );
}

function MiniSparkline({ values, tone }: { values: number[]; tone: Tone }) {
  const points = values
    .map((value, index) => {
      const x = (index / Math.max(1, values.length - 1)) * 92;
      const y = 30 - (Math.max(0, Math.min(100, value)) / 100) * 24;
      return `${x},${y}`;
    })
    .join(" ");
  const stroke = getTone(tone).stroke;

  return (
    <svg
      className="h-9 w-24 overflow-visible"
      viewBox="0 0 92 34"
      role="img"
      aria-label={`Trend sparkline values: ${values.join(", ")}.`}
    >
      <polyline
        points={points}
        fill="none"
        stroke={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.5"
      />
      <path d={`M0 34 L${points} L92 34 Z`} fill={stroke} opacity="0.08" />
    </svg>
  );
}

function EmptySparkline() {
  return (
    <div className="flex h-9 w-24 items-end gap-1" aria-hidden="true">
      {[18, 26, 14, 30, 22].map((height, index) => (
        <span
          key={`${height}-${index}`}
          className="w-3 rounded-full bg-white/[0.08]"
          style={{ height }}
        />
      ))}
    </div>
  );
}

function CareerOverview({
  snapshot,
  readiness,
}: {
  snapshot: ResumeSnapshotData;
  readiness: number | null;
}) {
  const skills = getOverviewMetrics(snapshot, readiness);

  return (
    <DashboardPanel title="Career Overview" description="A compact read on your strongest signals and open gaps.">
      <div className="grid gap-5 lg:grid-cols-[300px_minmax(0,1fr)] lg:items-center">
        <RadarChart metrics={skills} />
        <div className="space-y-3">
          {skills.map((skill) => (
            <MetricBar key={skill.label} metric={skill} />
          ))}
        </div>
      </div>
    </DashboardPanel>
  );
}

function getOverviewMetrics(snapshot: ResumeSnapshotData, readiness: number | null) {
  const interview = readiness === null ? null : Math.min(100, Math.round(readiness * 0.72));
  const recruiter =
    readiness === null
      ? null
      : Math.min(
          100,
          Math.round(readiness * 0.82 + (snapshot.matchScore ?? readiness) * 0.18)
        );

  return [
    { label: "ATS", value: snapshot.atsScore, tone: "blue" as const },
    { label: "JD Match", value: snapshot.matchScore, tone: "purple" as const },
    { label: "Resume", value: snapshot.resumeTitle ? snapshot.atsScore ?? 52 : null, tone: "cyan" as const },
    { label: "Interview", value: interview, tone: "amber" as const },
    { label: "Recruiter", value: recruiter, tone: "emerald" as const },
    { label: "GitHub", value: null, tone: "cyan" as const },
  ];
}

function RadarChart({
  metrics,
}: {
  metrics: { label: string; value: number | null; tone: Tone }[];
}) {
  const center = 120;
  const radius = 82;
  const points = metrics.map((metric, index) => {
    const angle = (Math.PI * 2 * index) / metrics.length - Math.PI / 2;
    const valueRadius = radius * ((metric.value ?? 0) / 100);
    return {
      label: metric.label,
      x: center + Math.cos(angle) * valueRadius,
      y: center + Math.sin(angle) * valueRadius,
      labelX: center + Math.cos(angle) * (radius + 24),
      labelY: center + Math.sin(angle) * (radius + 24),
      axisX: center + Math.cos(angle) * radius,
      axisY: center + Math.sin(angle) * radius,
    };
  });
  const polygonPoints = points.map((point) => `${point.x},${point.y}`).join(" ");

  return (
    <div className="rounded-[1.25rem] border border-white/[0.08] bg-[#071024]/72 p-4">
      <svg
        className="mx-auto h-64 w-full max-w-[280px]"
        viewBox="0 0 240 240"
        role="img"
        aria-label={`Career overview radar: ${metrics
          .map((metric) => `${metric.label} ${metric.value ?? "pending"}`)
          .join(", ")}.`}
      >
        {[0.25, 0.5, 0.75, 1].map((scale) => {
          const ring = metrics
            .map((_, index) => {
              const angle = (Math.PI * 2 * index) / metrics.length - Math.PI / 2;
              return `${center + Math.cos(angle) * radius * scale},${center + Math.sin(angle) * radius * scale}`;
            })
            .join(" ");
          return (
            <polygon
              key={scale}
              points={ring}
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="1"
            />
          );
        })}
        {points.map((point) => (
          <line
            key={point.label}
            x1={center}
            y1={center}
            x2={point.axisX}
            y2={point.axisY}
            stroke="rgba(255,255,255,0.08)"
          />
        ))}
        <polygon
          points={polygonPoints}
          fill="rgba(0,229,255,0.17)"
          stroke="#00E5FF"
          strokeWidth="2"
        />
        <polygon
          points={polygonPoints}
          fill="rgba(139,92,246,0.12)"
          stroke="#8B5CF6"
          strokeWidth="1.5"
          opacity="0.7"
        />
        {points.map((point) => (
          <text
            key={point.label}
            x={point.labelX}
            y={point.labelY}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="rgba(226,232,240,0.72)"
            fontSize="10"
          >
            {point.label}
          </text>
        ))}
      </svg>
    </div>
  );
}

function MetricBar({
  metric,
}: {
  metric: { label: string; value: number | null; tone: Tone };
}) {
  const value = metric.value;
  const width = value ?? 0;
  const tone = getTone(metric.tone);

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-medium text-slate-300">{metric.label}</p>
        <p className="text-sm font-semibold text-white">{value === null ? "--" : `${value}/100`}</p>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/[0.08]">
        <div
          className="h-full rounded-full"
          style={{
            width: `${Math.max(0, Math.min(100, width))}%`,
            background: tone.gradient,
          }}
        />
      </div>
    </div>
  );
}

function TodaysFocus({ snapshot }: { snapshot: ResumeSnapshotData }) {
  const primaryAction = getRecommendedAction(snapshot);

  return (
    <DashboardPanel
      title="Today's Focus"
      description="Recommended for you"
      action={
        <Button asChild variant="outline" size="sm">
          <Link href="/dashboard/coach">View All</Link>
        </Button>
      }
    >
      <div className="space-y-3">
        <Link
          href={primaryAction.href}
          className="group flex items-center gap-3 rounded-[1.15rem] border border-purple-300/18 bg-purple-300/10 p-3 transition duration-300 hover:border-purple-200/35 hover:bg-purple-300/14 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300/35"
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-purple-300/18 bg-purple-300/14 text-purple-100">
            <Sparkles className="h-4 w-4" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-white">{primaryAction.title}</span>
            <span className="mt-0.5 block text-xs text-slate-400">{primaryAction.description}</span>
          </span>
          <span className="rounded-xl border border-purple-300/20 bg-purple-300/16 px-4 py-2 text-xs font-semibold text-purple-100">
            Start
          </span>
        </Link>

        {quickActions.slice(1).map((action) => {
          const Icon = action.icon;

          return (
            <Link
              key={action.title}
              href={action.href}
              className="group flex items-center gap-3 rounded-[1.15rem] border border-white/[0.08] bg-[#071024]/70 p-3 transition duration-300 hover:border-cyan-300/18 hover:bg-white/[0.045] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/35"
            >
              <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl border ${getTone(action.accent).icon}`}>
                <Icon className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-white">{action.title}</span>
                <span className="mt-0.5 block text-xs text-slate-500">{action.subtitle}</span>
              </span>
              <ArrowRight className="h-4 w-4 text-slate-500 transition group-hover:translate-x-0.5 group-hover:text-cyan-100" />
            </Link>
          );
        })}
      </div>
    </DashboardPanel>
  );
}

function getRecommendedAction(snapshot: ResumeSnapshotData) {
  if (!snapshot.resumeTitle) {
    return {
      title: "Upload your resume",
      description: "Create the baseline that powers every TalentForge module.",
      href: "/dashboard/resume",
    };
  }

  if ((snapshot.atsScore ?? 0) < 75) {
    return {
      title: "Improve ATS score",
      description: "Optimize keywords, formatting, and recruiter-readable evidence.",
      href: "/dashboard/resume/ats",
    };
  }

  if ((snapshot.matchScore ?? 0) < 75) {
    return {
      title: "Match the next role",
      description: "Compare your resume with a target job before applying.",
      href: "/dashboard/resume/match",
    };
  }

  return {
    title: "Practice interviews",
    description: "Turn strong document signals into confident interview performance.",
    href: "/dashboard/interview",
  };
}

function ActivityTimeline() {
  return (
    <DashboardPanel title="Recent Activity">
      <div className="space-y-2">
        {recentActivity.map((activity, index) => (
          <ActivityItem key={activity.label} activity={activity} index={index} />
        ))}
      </div>
      <div className="mt-4 flex justify-center">
        <Button asChild variant="outline" size="sm">
          <Link href="/dashboard/analytics">View All Activity</Link>
        </Button>
      </div>
    </DashboardPanel>
  );
}

function ActivityItem({ activity, index }: { activity: ActivityData; index: number }) {
  const icons = [FileText, ClipboardCheck, Target];
  const Icon = icons[index] ?? Activity;

  return (
    <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-[1.05rem] border border-white/[0.07] bg-[#071024]/68 px-3 py-3">
      <span className={`grid h-9 w-9 place-items-center rounded-xl border ${getTone(index === 0 ? "purple" : index === 1 ? "amber" : "blue").icon}`}>
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-white">{activity.label}</p>
        <p className="truncate text-xs text-slate-500">{activity.detail}</p>
      </div>
      <div className="text-right">
        <p className="text-xs text-slate-500">{activity.time}</p>
        <span
          className={`mt-1 inline-flex rounded-full border px-2 py-0.5 text-[0.65rem] font-semibold ${
            activity.status === "Completed"
              ? "border-emerald-300/18 bg-emerald-300/10 text-emerald-200"
              : "border-blue-300/18 bg-blue-300/10 text-blue-200"
          }`}
        >
          {activity.status}
        </span>
      </div>
    </div>
  );
}

function RecommendationPath({ snapshot }: { snapshot: ResumeSnapshotData }) {
  const recommendations = getRecommendations(snapshot);

  return (
    <DashboardPanel title="AI Recommended Path" description="Personalized steps to boost your career">
      <div className="grid gap-4 md:grid-cols-4">
        {recommendations.map((item, index) => {
          const Icon = item.icon;

          return (
            <div key={item.title} className="relative text-center">
              {index < recommendations.length - 1 ? (
                <span className="pointer-events-none absolute left-1/2 top-7 hidden h-px w-full bg-gradient-to-r from-cyan-300/30 to-purple-300/20 md:block" />
              ) : null}
              <span className={`relative mx-auto grid h-14 w-14 place-items-center rounded-full border ${getTone(item.tone).icon}`}>
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-sm font-semibold text-white">{item.title}</h3>
              <p className="mx-auto mt-1 max-w-[170px] text-xs leading-5 text-slate-500">{item.detail}</p>
              <span className={`mt-3 inline-flex rounded-full border px-2.5 py-1 text-[0.65rem] font-semibold ${getTone(item.tone).badge}`}>
                {item.impact}
              </span>
            </div>
          );
        })}
      </div>
      <div className="mt-5 flex justify-center">
        <Button asChild variant="outline" size="sm">
          <Link href="/dashboard/coach">View Full Roadmap</Link>
        </Button>
      </div>
    </DashboardPanel>
  );
}

function getRecommendations(snapshot: ResumeSnapshotData) {
  if (!snapshot.resumeTitle) {
    return [
      {
        title: "Upload Resume",
        detail: "Create the evidence baseline",
        icon: Upload,
        tone: "blue" as const,
        impact: "High Impact",
      },
      {
        title: "Run ATS",
        detail: "Find parser and keyword gaps",
        icon: ClipboardCheck,
        tone: "emerald" as const,
        impact: "High Impact",
      },
      {
        title: "Match JD",
        detail: "Compare against target roles",
        icon: Target,
        tone: "amber" as const,
        impact: "Medium Impact",
      },
      {
        title: "Practice",
        detail: "Start interview momentum",
        icon: MessageSquareText,
        tone: "purple" as const,
        impact: "High Impact",
      },
    ];
  }

  return [
    {
      title: "Optimize Resume",
      detail: "Improve ATS score",
      icon: ClipboardCheck,
      tone: "blue" as const,
      impact: "High Impact",
    },
    {
      title: "Build Projects",
      detail: "Add 1-2 strong projects",
      icon: GitBranch,
      tone: "emerald" as const,
      impact: "High Impact",
    },
    {
      title: "Practice DSA",
      detail: "Improve problem solving",
      icon: Target,
      tone: "amber" as const,
      impact: "Medium Impact",
    },
    {
      title: "Apply Smart",
      detail: "Target right companies",
      icon: BriefcaseBusiness,
      tone: "purple" as const,
      impact: "High Impact",
    },
  ];
}

function DashboardPanel({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[1.45rem] border border-white/[0.08] bg-white/[0.035] p-5 shadow-[0_20px_65px_rgba(0,0,0,0.18)] backdrop-blur-2xl">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-white">{title}</h2>
          {description ? <p className="mt-1 text-xs text-slate-500">{description}</p> : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {children}
    </section>
  );
}

function getDisplayName(email: string) {
  const localPart = email.split("@")[0] || "User";
  return localPart
    .split(/[._-]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getTone(tone: Tone) {
  if (tone === "purple") {
    return {
      icon: "border-purple-300/20 bg-purple-300/10 text-purple-100",
      badge: "border-purple-300/20 bg-purple-300/10 text-purple-100",
      stroke: "#8B5CF6",
      gradient: "linear-gradient(90deg,#8B5CF6,#C084FC)",
    };
  }

  if (tone === "emerald") {
    return {
      icon: "border-emerald-300/20 bg-emerald-300/10 text-emerald-100",
      badge: "border-emerald-300/20 bg-emerald-300/10 text-emerald-100",
      stroke: "#34D399",
      gradient: "linear-gradient(90deg,#34D399,#2DD4BF)",
    };
  }

  if (tone === "amber") {
    return {
      icon: "border-amber-300/20 bg-amber-300/10 text-amber-100",
      badge: "border-amber-300/20 bg-amber-300/10 text-amber-100",
      stroke: "#FBBF24",
      gradient: "linear-gradient(90deg,#FBBF24,#F59E0B)",
    };
  }

  if (tone === "blue") {
    return {
      icon: "border-blue-300/20 bg-blue-300/10 text-blue-100",
      badge: "border-blue-300/20 bg-blue-300/10 text-blue-100",
      stroke: "#3BA8FF",
      gradient: "linear-gradient(90deg,#3BA8FF,#00E5FF)",
    };
  }

  return {
    icon: "border-cyan-300/20 bg-cyan-300/10 text-cyan-100",
    badge: "border-cyan-300/20 bg-cyan-300/10 text-cyan-100",
    stroke: "#00E5FF",
    gradient: "linear-gradient(90deg,#00E5FF,#8B5CF6)",
  };
}
