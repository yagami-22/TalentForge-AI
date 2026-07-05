import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import {
  Activity,
  ArrowRight,
  Bell,
  Brain,
  BriefcaseBusiness,
  BarChart3,
  ClipboardCheck,
  Compass,
  FileText,
  GitBranch,
  Home,
  Link2,
  Menu,
  MessageSquareText,
  PenLine,
  Settings,
  Sparkles,
  UserRound,
  Target,
  Upload,
  WandSparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import {
  DashboardMotionGrid,
  DashboardMotionItem,
  DashboardMotionSection,
} from "@/components/dashboard/dashboard-motion";
import { AccountDropdown } from "@/app/dashboard/account-dropdown";
import type { AccountDropdownProfile } from "@/app/dashboard/account-dropdown";
import { DashboardErrorFallback } from "@/app/dashboard/dashboard-production";
import { PremiumBackground } from "@/components/premium-background";
import { Button } from "@/components/ui/button";
import { getCurrentDbUser } from "@/lib/current-user";
import { isPrismaConfigurationError, prisma } from "@/lib/prisma";
import { withRetry } from "@/lib/retry";

type Tone = "cyan" | "purple" | "emerald" | "amber" | "blue";

type QuickActionData = {
  title: string;
  subtitle: string;
  href: string;
  icon: LucideIcon;
  cta: string;
  accent: Tone;
};

type CommandCenterCardData = {
  title: string;
  subtitle: string;
  href: string;
  icon: LucideIcon;
  tone: Tone;
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

type DashboardRuntimeIssue = {
  title: string;
  description: string;
};

type DashboardUser = Awaited<ReturnType<typeof getCurrentDbUser>>;

type LatestResume = {
  title: string;
  atsScore: number | null;
  matchScore: number | null;
  updatedAt: Date;
  atsAnalysis: unknown;
} | null;

type UserProfile = {
  email: string;
  imageUrl: string | null;
  role: string;
  initial: string;
  name: string | null;
  plan: string;
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
      { label: "Resume Hub", href: "/dashboard/resume", icon: FileText },
      { label: "ATS Optimizer", href: "/dashboard/resume/ats", icon: ClipboardCheck },
      { label: "JD Matcher", href: "/dashboard/resume/match", icon: Target },
      { label: "AI Rewriter", href: "/dashboard/resume/rewrite", icon: PenLine },
      { label: "GitHub Analyzer", href: "/dashboard/github", icon: GitBranch },
    ],
  },
  {
    label: "Interview & Growth",
    items: [
      { label: "Interview Prep", href: "/dashboard/interview", icon: MessageSquareText },
      { label: "OA Practice", href: "/dashboard/interview/oa/session", icon: Brain },
      { label: "AI Recruiter Mode", href: "/dashboard/recruiter", icon: BriefcaseBusiness },
      { label: "Career Coach", href: "/dashboard/coach", icon: Compass },
      { label: "Career Insights", href: "/dashboard/analytics", icon: BarChart3 },
      { label: "History", href: "/dashboard/resume/history", icon: Activity },
    ],
  },
  {
    label: "Settings",
    items: [{ label: "Settings", href: "/dashboard/settings", icon: Settings }],
  },
];

const quickActions: QuickActionData[] = [
  {
    title: "Improve Resume Impact",
    subtitle: "Add metrics and strong keywords",
    href: "/dashboard/resume/ats",
    icon: ClipboardCheck,
    cta: "Start",
    accent: "purple",
  },
  {
    title: "Practice DSA",
    subtitle: "Solve 3 problems today",
    href: "/dashboard/interview/oa/session",
    icon: ClipboardCheck,
    cta: "Open",
    accent: "blue",
  },
  {
    title: "Review Projects",
    subtitle: "Keep your portfolio updated",
    href: "/dashboard/github",
    icon: GitBranch,
    cta: "Practice",
    accent: "emerald",
  },
  {
    title: "Mock Interview",
    subtitle: "Boost your confidence",
    href: "/dashboard/interview",
    icon: MessageSquareText,
    cta: "Analyze",
    accent: "amber",
  },
];

const commandCenterCards: CommandCenterCardData[] = [
  {
    title: "Resume Hub",
    subtitle: "Optimize and enhance your resume",
    href: "/dashboard/resume",
    icon: FileText,
    tone: "cyan",
  },
  {
    title: "ATS Optimizer",
    subtitle: "Make your resume ATS-friendly",
    href: "/dashboard/resume/ats",
    icon: ClipboardCheck,
    tone: "blue",
  },
  {
    title: "JD Matcher",
    subtitle: "Match your resume with any job",
    href: "/dashboard/resume/match",
    icon: Link2,
    tone: "emerald",
  },
  {
    title: "AI Rewriter",
    subtitle: "Rewrite for impact and clarity",
    href: "/dashboard/resume/rewrite",
    icon: WandSparkles,
    tone: "amber",
  },
  {
    title: "Interview Prep",
    subtitle: "Prepare with AI for any interview",
    href: "/dashboard/interview",
    icon: UserRound,
    tone: "purple",
  },
  {
    title: "OA Practice",
    subtitle: "Sharpen your skills with practice",
    href: "/dashboard/interview/oa/session",
    icon: Brain,
    tone: "purple",
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

function buildResumeSnapshot(latestResume: LatestResume): ResumeSnapshotData {
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

function isNextNavigationError(error: unknown) {
  if (!error || typeof error !== "object" || !("digest" in error)) {
    return false;
  }

  const digest = (error as { digest?: unknown }).digest;

  return (
    typeof digest === "string" &&
    (digest.startsWith("NEXT_REDIRECT") || digest.startsWith("NEXT_NOT_FOUND"))
  );
}

function logDashboardServerError(error: unknown, source: string) {
  if (process.env.NODE_ENV === "production") {
    return;
  }

  console.error("[dashboard-server]", {
    source,
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
  });
}

function getDatabaseIssue(error: unknown): DashboardRuntimeIssue {
  if (isPrismaConfigurationError(error)) {
    return {
      title: "Dashboard database is not configured.",
      description:
        "The production DATABASE_URL environment variable is missing. Add the Neon connection string in Vercel Project Settings, then redeploy.",
    };
  }

  const message = error instanceof Error ? error.message : String(error);

  if (/does not exist|table|relation|schema|P2021|P2022/i.test(message)) {
    return {
      title: "Dashboard database schema is not ready.",
      description:
        "The production database is reachable, but the Prisma schema has not been synced. Run `npx prisma db push` with the production DATABASE_URL, then redeploy.",
    };
  }

  if (/connect|connection|timeout|fetch failed|network|database|prisma|neon/i.test(message)) {
    return {
      title: "Dashboard database connection failed.",
      description:
        "TalentForge AI could not reach the production database. Verify DATABASE_URL, Neon project status, and Vercel environment variable scope.",
    };
  }

  return {
    title: "Dashboard data could not load.",
    description:
      "Authentication succeeded, but the dashboard data loader failed. Check the Vercel function logs for the server error details.",
  };
}

async function loadDashboardUser(): Promise<
  { user: DashboardUser; issue: null } | { user: null; issue: DashboardRuntimeIssue }
> {
  try {
    return { user: await getCurrentDbUser(), issue: null };
  } catch (error) {
    if (isNextNavigationError(error)) {
      throw error;
    }

    logDashboardServerError(error, "get-current-db-user");

    return { user: null, issue: getDatabaseIssue(error) };
  }
}

async function loadLatestResume(userId: string): Promise<
  { latestResume: LatestResume; issue: null } | { latestResume: null; issue: DashboardRuntimeIssue }
> {
  try {
    const latestResume = await withRetry(() =>
      prisma.resume.findFirst({
        where: { userId },
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

    return { latestResume, issue: null };
  } catch (error) {
    logDashboardServerError(error, "load-latest-resume");

    return { latestResume: null, issue: getDatabaseIssue(error) };
  }
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
  const userResult = await loadDashboardUser();

  if (userResult.issue) {
    return (
      <DashboardErrorFallback
        title={userResult.issue.title}
        description={userResult.issue.description}
      />
    );
  }

  const user = userResult.user;

  if (!user.role) {
    redirect("/onboarding");
  }

  const profile: UserProfile = {
    email: user.email,
    imageUrl: user.imageUrl,
    role: user.role,
    initial: (user.name || user.email)?.[0]?.toUpperCase() ?? "U",
    name: user.name,
    plan: "Starter",
  };
  const resumeResult = await loadLatestResume(user.id);

  if (resumeResult.issue) {
    return (
      <DashboardErrorFallback
        title={resumeResult.issue.title}
        description={resumeResult.issue.description}
      />
    );
  }

  const latestResume = resumeResult.latestResume;
  const snapshot = buildResumeSnapshot(latestResume);
  const readiness = getCareerReadiness(snapshot);

  return (
    <PremiumBackground contentClassName="mx-auto flex min-h-screen w-full max-w-[1500px] flex-col px-0 py-0 xl:flex-row">
      <div className="xl:hidden">
        <MobileExecutiveNav profile={profile} />
      </div>

      <div className="hidden xl:block xl:w-[272px] xl:shrink-0">
        <ExecutiveSidebar profile={profile} />
      </div>

      <main className="relative min-w-0 flex-1 px-4 py-4 sm:px-5 lg:px-5 lg:py-5">
        <DashboardAmbient />
        <DashboardHeader profile={profile} />

        <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
          <DashboardMotionSection>
            <WelcomeHero snapshot={snapshot} readiness={readiness} />
          </DashboardMotionSection>
          <DashboardMotionSection delay={0.08}>
            <ReadinessPanel snapshot={snapshot} readiness={readiness} />
          </DashboardMotionSection>
        </div>

        <div className="mt-4 grid gap-4 2xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-4">
            <CareerCommandCenter />
            <RoadmapBanner />
          </div>
          <TodaysFocus snapshot={snapshot} />
        </div>

        <div className="mt-4 grid gap-4 2xl:grid-cols-[minmax(0,0.86fr)_minmax(0,1.14fr)]">
          <CareerOverview snapshot={snapshot} readiness={readiness} />
          <ActivityTimeline />
        </div>

        <div className="mt-4">
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

function DashboardAmbient() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <span className="absolute left-[8%] top-24 h-72 w-72 rounded-full bg-[#00E5FF]/5 blur-3xl" />
      <span className="absolute right-[10%] top-10 h-80 w-80 rounded-full bg-[#8B5CF6]/6 blur-3xl" />
      <span className="absolute bottom-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[#3BA8FF]/4 blur-3xl" />
      {[12, 24, 36, 48, 60, 72].map((offset, index) => (
        <span
          key={offset}
          className="absolute h-1 w-1 rounded-full bg-cyan-100/55 shadow-[0_0_8px_rgba(0,229,255,0.72)]"
          style={{
            left: `${offset}%`,
            top: `${18 + ((index * 17) % 54)}%`,
          }}
        />
      ))}
    </div>
  );
}

function ExecutiveSidebar({ profile }: { profile: UserProfile }) {
  return (
    <aside className="sticky top-0 flex h-screen flex-col p-2.5">
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-[24px] border border-cyan-200/10 bg-[#071024]/72 px-3.5 py-4 shadow-[0_24px_90px_rgba(0,0,0,0.28),0_0_42px_rgba(0,229,255,0.08)] backdrop-blur-2xl">
        <span className="pointer-events-none absolute -left-24 top-20 h-56 w-56 rounded-full bg-[#00E5FF]/10 blur-3xl" />
        <span className="pointer-events-none absolute -right-24 bottom-20 h-56 w-56 rounded-full bg-[#8B5CF6]/10 blur-3xl" />
      <Link
        href="/dashboard"
        className="relative flex shrink-0 items-center gap-3 rounded-2xl px-1 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/40"
      >
        <span className="relative grid h-10 w-10 place-items-center">
          <span className="absolute h-8 w-11 rounded-[0.65rem] bg-gradient-to-br from-[#00E5FF] via-[#6A5CFF] to-[#FF3DFE] opacity-85 shadow-[0_0_24px_rgba(139,92,246,0.28)] [clip-path:polygon(8%_10%,100%_10%,78%_38%,59%_38%,45%_90%,27%_90%,43%_38%,0_38%)]" />
          <span className="relative text-[0.72rem] font-black tracking-tighter text-white drop-shadow-[0_0_12px_rgba(0,229,255,0.8)]">
            TF
          </span>
        </span>
        <span className="text-base font-semibold tracking-tight text-white">TalentForge AI</span>
      </Link>

      <nav className="mt-4 min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain pb-2 pr-1 [scrollbar-color:rgba(0,229,255,0.24)_transparent] [scrollbar-width:thin]" aria-label="Dashboard navigation">
        {dashboardNav.map((group) => (
          <div key={group.label} className="space-y-1.5">
            <p className="px-3 text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-slate-500/75">
              {group.label}
            </p>
            <div className="grid gap-1">
              {group.items.map((item) => (
                <SidebarLink key={item.href} item={item} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="mt-auto shrink-0 pt-2.5">
        <div className="relative rounded-[1.15rem] border border-white/[0.08] bg-white/[0.035] p-2.5">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-2xl bg-gradient-to-br from-[#00E5FF] to-[#6A5CFF] text-sm font-bold text-white">
              {profile.initial}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{getDisplayName(profile.email)}</p>
              <p className="truncate text-xs text-slate-500">{profile.role}</p>
            </div>
          </div>
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
      className={`group relative flex h-9 items-center gap-3 rounded-2xl border px-3 text-sm transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/35 ${
        item.active
          ? "border-cyan-300/38 bg-[linear-gradient(135deg,rgba(0,229,255,0.22),rgba(106,92,255,0.24))] text-white shadow-[0_0_34px_rgba(0,229,255,0.24),inset_0_1px_0_rgba(255,255,255,0.1),inset_0_0_20px_rgba(0,229,255,0.055)]"
          : "border-transparent text-slate-400 hover:-translate-y-0.5 hover:border-white/[0.1] hover:bg-white/[0.055] hover:text-slate-100"
      }`}
    >
      <span
        className={`grid h-6 w-6 shrink-0 place-items-center rounded-xl transition duration-300 ${
          item.active
            ? "bg-cyan-300/10 text-cyan-50 shadow-[0_0_18px_rgba(0,229,255,0.22)]"
            : "text-slate-500 group-hover:bg-cyan-300/8 group-hover:text-cyan-100 group-hover:shadow-[0_0_16px_rgba(0,229,255,0.12)]"
        }`}
      >
        <Icon className="h-3.5 w-3.5" />
      </span>
      <span>{item.label}</span>
    </Link>
  );
}

function DashboardHeader({ profile }: { profile: UserProfile }) {
  const name = profile.name || getDisplayName(profile.email);
  const accountProfile: AccountDropdownProfile = {
    email: profile.email,
    imageUrl: profile.imageUrl,
    initial: profile.initial,
    name: profile.name,
    plan: profile.plan,
  };

  return (
    <header className="relative flex flex-col gap-3 py-1 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <p className="text-lg font-medium tracking-tight text-slate-300">Good evening,</p>
        <h1 className="mt-1.5 bg-gradient-to-r from-[#39C8FF] via-[#7C5CFF] to-[#FF3DFE] bg-clip-text text-[2.35rem] font-semibold leading-none tracking-tight text-transparent sm:text-[2.8rem]">
          {name}
          <span className="ml-2 text-white drop-shadow-[0_0_16px_rgba(139,92,246,0.7)]">
            ✦
          </span>
        </h1>
        <p className="mt-2 text-base text-slate-400">
          Let&apos;s accelerate your career journey.
        </p>
      </div>

      <div className="flex items-center gap-2.5 lg:pt-2">
        <Link
          href="/dashboard/coach"
          className="group inline-flex h-10 items-center gap-2 rounded-[1.2rem] border border-purple-300/22 bg-[#0B1024]/78 px-4 text-sm font-semibold text-white shadow-[0_0_28px_rgba(139,92,246,0.12)] backdrop-blur-2xl transition duration-300 hover:-translate-y-0.5 hover:border-purple-200/38 hover:bg-purple-300/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300/40"
        >
          <Sparkles className="h-4 w-4 text-purple-100" />
          AI Assistant
          <ArrowRight className="h-4 w-4 text-slate-500 transition duration-300 group-hover:translate-x-0.5 group-hover:text-cyan-100" />
        </Link>
        <button
          type="button"
          aria-label="Notifications"
          className="relative grid h-10 w-10 place-items-center rounded-full border border-white/[0.08] bg-[#080D1D]/76 text-slate-300 shadow-[0_0_22px_rgba(0,0,0,0.22)] backdrop-blur-2xl transition hover:border-cyan-300/25 hover:text-cyan-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/35"
        >
          <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-[#8B5CF6] shadow-[0_0_12px_rgba(139,92,246,0.9)]" />
          <Bell className="h-4 w-4" />
        </button>
        <AccountDropdown profile={accountProfile} />
      </div>
    </header>
  );
}

function WelcomeHero({
  snapshot,
  readiness,
}: {
  snapshot: ResumeSnapshotData;
  readiness: number | null;
}) {
  const insight = getAiInsight(snapshot, readiness);
  const suggestion = getRecommendedAction(snapshot);

  return (
    <section className="relative min-h-[270px] overflow-hidden rounded-[24px] border border-white/[0.105] bg-[radial-gradient(circle_at_74%_28%,rgba(139,92,246,0.28),transparent_28%),radial-gradient(circle_at_75%_74%,rgba(0,229,255,0.16),transparent_24%),linear-gradient(135deg,rgba(5,10,25,0.96),rgba(9,15,34,0.9)_50%,rgba(3,7,18,0.95))] p-5 shadow-[0_26px_86px_rgba(0,0,0,0.38),0_0_44px_rgba(139,92,246,0.11),0_0_34px_rgba(0,229,255,0.06),inset_0_1px_0_rgba(255,255,255,0.075)] sm:p-6">
      <div className="pointer-events-none absolute -right-16 -top-20 h-72 w-72 rounded-full bg-[#8B5CF6]/18 blur-3xl" />
      <div className="pointer-events-none absolute right-24 top-20 h-56 w-56 rounded-full bg-[#00E5FF]/11 blur-3xl" />
      <div className="pointer-events-none absolute right-24 bottom-8 h-20 w-72 rounded-[50%] border border-cyan-200/18 bg-[#3BA8FF]/11 blur-sm" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.095),transparent_22%,rgba(255,255,255,0.035)_54%,transparent_74%)] opacity-75" />
      <div className="relative grid h-full gap-5 lg:grid-cols-[minmax(0,0.78fr)_minmax(340px,0.9fr)] lg:items-center">
        <div className="max-w-xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-purple-300/18 bg-purple-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-purple-100 shadow-[0_0_18px_rgba(139,92,246,0.14)]">
            <Sparkles className="h-3.5 w-3.5" />
            AI Insight
          </span>
          <h2 className="mt-4 max-w-[370px] text-[1.8rem] font-semibold leading-tight tracking-tight text-white sm:text-[1.95rem]">
            You&apos;re building something{" "}
            <span className="bg-gradient-to-r from-[#39C8FF] to-[#8B5CF6] bg-clip-text text-transparent">
              great.
            </span>
          </h2>
          <p className="mt-3 max-w-md text-sm leading-6 text-slate-400">{insight}</p>
          <Link
            href={suggestion.href}
            className="group mt-5 inline-flex h-10 items-center gap-3 rounded-full border border-cyan-300/26 bg-[linear-gradient(135deg,rgba(0,229,255,0.14),rgba(139,92,246,0.14))] px-5 text-sm font-semibold text-white shadow-[0_0_34px_rgba(0,229,255,0.18),0_0_24px_rgba(139,92,246,0.1)] transition duration-300 hover:-translate-y-0.5 hover:border-cyan-200/45 hover:shadow-[0_0_42px_rgba(139,92,246,0.24),0_0_34px_rgba(0,229,255,0.2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/35"
          >
            Get AI Recommendations
            <ArrowRight className="h-4 w-4 transition duration-300 group-hover:translate-x-1" />
          </Link>
        </div>

        <HeroIllustration />
      </div>
    </section>
  );
}

function HeroIllustration() {
  return (
    <div className="relative mx-auto hidden h-[250px] w-[360px] place-items-center lg:grid" aria-hidden="true">
      <div className="absolute inset-3 rounded-full bg-[radial-gradient(circle_at_center,rgba(0,229,255,0.24),rgba(60,130,255,0.26)_36%,rgba(139,92,246,0.27)_58%,transparent_78%)] blur-2xl" />
      <div className="absolute h-[15rem] w-[15rem] rounded-full border border-cyan-100/36 bg-[radial-gradient(circle_at_center,rgba(0,229,255,0.14),transparent_62%)] shadow-[0_0_56px_rgba(0,229,255,0.34),0_0_90px_rgba(139,92,246,0.28)]" />
      <div className="absolute h-[12.5rem] w-[12.5rem] rounded-full border border-purple-200/50 shadow-[0_0_58px_rgba(139,92,246,0.54)]" />
      <div className="absolute h-28 w-[20rem] rounded-[50%] border border-cyan-200/36 shadow-[0_0_34px_rgba(0,229,255,0.32)]" />
      <div className="absolute h-[18rem] w-28 rounded-[50%] border border-purple-200/28 shadow-[0_0_32px_rgba(139,92,246,0.26)]" />
      <div className="absolute h-40 w-[20rem] rotate-12 rounded-[50%] border border-[#3BA8FF]/32 shadow-[0_0_28px_rgba(59,168,255,0.22)]" />
      <div className="absolute h-40 w-[20rem] -rotate-12 rounded-[50%] border border-[#FF3DFE]/28 shadow-[0_0_28px_rgba(255,61,254,0.2)]" />
      <div className="absolute bottom-5 h-14 w-[18.5rem] rounded-[50%] border border-cyan-200/46 bg-[radial-gradient(ellipse_at_center,rgba(0,229,255,0.58),rgba(139,92,246,0.34)_42%,transparent_74%)] shadow-[0_0_54px_rgba(0,229,255,0.54),0_0_72px_rgba(139,92,246,0.38)]" />
      <div className="absolute bottom-9 h-8 w-60 rounded-[50%] border border-cyan-100/68 bg-cyan-300/14 shadow-[0_0_42px_rgba(0,229,255,0.82)]" />
      <div className="absolute bottom-12 h-2 w-64 rounded-full bg-gradient-to-r from-transparent via-cyan-100 to-transparent shadow-[0_0_36px_rgba(0,229,255,1)]" />
      <div className="absolute bottom-8 h-9 w-72 rounded-[50%] bg-[#00E5FF]/26 blur-md" />
      {[0, 1, 2, 3, 4, 5, 6, 7].map((dot) => {
        const positions = [
          "left-[24%] top-[24%]",
          "left-[35%] top-[38%]",
          "right-[27%] top-[22%]",
          "right-[17%] top-[42%]",
          "left-[31%] bottom-[36%]",
          "right-[39%] bottom-[32%]",
          "left-[18%] top-[47%]",
          "right-[24%] bottom-[45%]",
        ];
        return (
          <span
            key={dot}
            className={`absolute h-2.5 w-2.5 rounded-full bg-cyan-100 shadow-[0_0_22px_rgba(0,229,255,1),0_0_10px_rgba(255,255,255,0.55)] ${positions[dot]}`}
          />
        );
      })}
      <div className="relative grid h-44 w-28 place-items-center border border-cyan-50/82 bg-[linear-gradient(155deg,rgba(104,219,255,0.78),rgba(75,119,255,0.78)_42%,rgba(158,88,255,0.72))] shadow-[0_0_62px_rgba(0,229,255,0.68),0_0_110px_rgba(139,92,246,0.7),inset_0_0_44px_rgba(255,255,255,0.32),inset_0_-22px_34px_rgba(6,10,25,0.22)] [clip-path:polygon(50%_0%,88%_18%,78%_78%,50%_100%,22%_78%,12%_18%)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_36%_18%,rgba(255,255,255,0.72),transparent_22%),linear-gradient(90deg,rgba(255,255,255,0.44),transparent_34%,rgba(255,255,255,0.22)_58%,transparent)]" />
        <div className="absolute left-1/2 top-4 h-32 w-px -translate-x-1/2 bg-white/46" />
        <div className="absolute bottom-7 h-16 w-20 rounded-full bg-[#00E5FF]/22 blur-xl" />
        <div className="relative grid h-[4.6rem] w-[4.6rem] place-items-center rounded-full bg-[#050914]/86 ring-1 ring-cyan-100/24 shadow-[0_0_38px_rgba(0,229,255,0.3),inset_0_0_34px_rgba(0,229,255,0.16),inset_0_-14px_26px_rgba(0,0,0,0.24)]">
          <span className="bg-gradient-to-r from-[#39C8FF] via-[#6A5CFF] to-[#B05CFF] bg-clip-text text-[1.45rem] font-black tracking-tighter text-transparent drop-shadow-[0_0_30px_rgba(0,229,255,1)]">
            TF
          </span>
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
  const label = readiness === null ? "N/A" : `${readiness}%`;

  return (
    <section className="relative overflow-hidden rounded-[22px] border border-white/[0.095] bg-[linear-gradient(145deg,rgba(7,13,31,0.95),rgba(12,18,38,0.88))] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.26),inset_0_1px_0_rgba(255,255,255,0.055)]">
      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[#8B5CF6]/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-24 w-full bg-[radial-gradient(ellipse_at_bottom,rgba(0,229,255,0.07),transparent_68%)]" />
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-white">Career Readiness</h2>
          <p className="mt-1 text-xs text-slate-500">
            {snapshot.resumeTitle ? "Improving" : "Awaiting resume"}
          </p>
        </div>
        <span className="rounded-xl bg-gradient-to-r from-emerald-300/14 to-cyan-300/12 px-3 py-1 text-xs font-semibold text-emerald-100 ring-1 ring-emerald-300/16 shadow-[0_0_16px_rgba(52,211,153,0.08)]">
          {readiness === null ? "Baseline needed" : "Improving"}
        </span>
      </div>
      <div className="relative mt-4 flex justify-center">
        <span className="absolute top-1/2 h-32 w-32 -translate-y-1/2 rounded-full bg-[#00E5FF]/10 blur-2xl" aria-hidden="true" />
        <ReadinessDonut value={readinessProgress} label={label} />
      </div>
      <p className="relative mx-auto mt-3 max-w-[240px] text-center text-sm leading-6 text-slate-400">
        {readiness === null
          ? "Upload a resume to activate readiness scoring."
          : "You are on the right track. Keep optimizing to reach the next level."}
      </p>
      <div className="relative mt-3 h-6 overflow-hidden rounded-full bg-white/[0.04]" aria-hidden="true">
        <div className="absolute inset-x-0 bottom-0 h-5 rounded-[50%] bg-gradient-to-r from-[#00E5FF]/20 via-[#8B5CF6]/20 to-[#00E5FF]/10 blur-sm" />
      </div>
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

function CareerCommandCenter() {
  return (
    <section className="relative overflow-visible">
      <div className="pointer-events-none absolute inset-x-0 top-12 h-px bg-gradient-to-r from-transparent via-[#3BA8FF]/22 to-transparent" />
      <div className="pointer-events-none absolute left-1/2 top-12 h-8 w-[58%] -translate-x-1/2 rounded-[50%] border border-[#3BA8FF]/8 bg-[#3BA8FF]/[0.025] blur-[2px]" />
      <div className="relative mb-3">
        <h2 className="text-lg font-semibold tracking-tight text-white">Your Command Center</h2>
      </div>
      <DashboardMotionGrid
        className="relative grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6"
        delay={0.08}
      >
        {commandCenterCards.map((card) => (
          <DashboardMotionItem key={card.title}>
            <CommandCenterCard card={card} />
          </DashboardMotionItem>
        ))}
      </DashboardMotionGrid>
    </section>
  );
}

function CommandCenterCard({ card }: { card: CommandCenterCardData }) {
  const Icon = card.icon;
  const tone = getTone(card.tone);
  const glassColor = hexToRgb(tone.stroke);

  return (
    <Link
      href={card.href}
      className="group relative flex h-[210px] flex-col items-center overflow-hidden rounded-[16px] border px-3.5 pb-3.5 pt-5 text-center transition duration-300 hover:-translate-y-1 hover:scale-[1.018] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/35"
      style={{
        borderColor: `rgba(${glassColor},0.5)`,
        background: `radial-gradient(circle at 50% 18%, rgba(${glassColor},0.2), transparent 30%), radial-gradient(circle at 50% 108%, rgba(${glassColor},0.1), transparent 28%), linear-gradient(180deg, rgba(8,13,31,0.97), rgba(4,8,20,0.95))`,
        boxShadow: `0 16px 42px rgba(0,0,0,0.32), 0 0 16px rgba(${glassColor},0.12), inset 0 1px 0 rgba(255,255,255,0.1)`,
      }}
    >
      <span className="pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
      <span className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-[linear-gradient(180deg,transparent,rgba(255,255,255,0.025))]" />
      <span
        className="pointer-events-none absolute left-1/2 top-7 h-14 w-14 -translate-x-1/2 rounded-full opacity-42 blur-lg transition duration-300 group-hover:opacity-72"
        style={{ background: tone.stroke }}
      />
      <span
        className="pointer-events-none absolute -bottom-8 left-1/2 h-16 w-16 -translate-x-1/2 rounded-full opacity-14 blur-lg"
        style={{ background: tone.stroke }}
      />
      <span
        className="relative grid h-16 w-16 place-items-center rounded-[1.15rem] border text-white transition duration-300 group-hover:rotate-3 group-hover:scale-110"
        style={{
          borderColor: `rgba(${glassColor},0.62)`,
          background: `radial-gradient(circle at 50% 42%, rgba(${glassColor},0.36), rgba(${glassColor},0.1) 58%, rgba(255,255,255,0.035))`,
          boxShadow: `0 0 18px rgba(${glassColor},0.36), inset 0 1px 0 rgba(255,255,255,0.18), inset 0 -16px 22px rgba(0,0,0,0.2)`,
          color: tone.stroke,
        }}
      >
        <span className="absolute inset-2.5 rounded-[0.95rem] border border-white/10 bg-white/[0.035]" />
        <Icon className="relative h-8 w-8 drop-shadow-[0_0_8px_currentColor]" strokeWidth={2.35} />
        <span
          className="absolute right-3 top-3 h-1.5 w-1.5 rounded-full bg-white/80 shadow-[0_0_8px_currentColor]"
          style={{ color: tone.stroke }}
        />
      </span>
      <h3 className="relative mt-4 flex h-10 items-center justify-center text-[0.92rem] font-semibold leading-tight text-white">
        {card.title}
      </h3>
      <p className="relative mx-auto mt-1.5 h-[3.75rem] max-w-[9.5rem] overflow-hidden text-[0.72rem] leading-5 text-slate-400">
        {card.subtitle}
      </p>
      <span
        className="relative mt-auto grid h-8 w-8 place-items-center rounded-full border transition duration-300 group-hover:scale-110"
        style={{
          borderColor: `rgba(${glassColor},0.4)`,
          background: `rgba(${glassColor},0.12)`,
          color: tone.stroke,
          boxShadow: `0 0 18px rgba(${glassColor},0.16)`,
        }}
      >
        <ArrowRight className="h-4 w-4 transition duration-300 group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

function RoadmapBanner() {
  return (
    <section className="group relative overflow-hidden rounded-[20px] border border-purple-300/18 bg-[radial-gradient(circle_at_8%_45%,rgba(251,191,36,0.16),transparent_20%),radial-gradient(circle_at_92%_100%,rgba(139,92,246,0.22),transparent_34%),linear-gradient(135deg,rgba(7,16,36,0.86),rgba(11,13,35,0.74))] px-4 py-3.5 shadow-[0_24px_80px_rgba(0,0,0,0.22),0_0_34px_rgba(139,92,246,0.12)] backdrop-blur-2xl">
      <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-purple-200/50 to-transparent" />
      <div className="pointer-events-none absolute -left-7 top-1/2 h-24 w-24 -translate-y-1/2 rounded-full bg-[#FBBF24]/16 blur-2xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-20 w-56 bg-[linear-gradient(135deg,transparent,rgba(139,92,246,0.28))] blur-xl" />
      <div className="pointer-events-none absolute bottom-0 right-7 h-16 w-28 bg-[linear-gradient(135deg,transparent_45%,rgba(139,92,246,0.34)_45%,rgba(13,7,28,0.8))]" />
      <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full border border-amber-200/22 bg-amber-300/10 text-amber-100 shadow-[0_0_30px_rgba(251,191,36,0.2)]">
            <Sparkles className="h-7 w-7 drop-shadow-[0_0_14px_rgba(251,191,36,0.8)]" />
          </span>
          <p className="max-w-xl text-sm leading-6 text-slate-300">
            Every step you take today brings you closer to your dream career.
          </p>
        </div>
        <Link
          href="/dashboard/coach"
          className="group/link inline-flex h-10 shrink-0 items-center justify-center gap-3 rounded-[1.05rem] border border-purple-300/32 bg-purple-300/10 px-6 text-sm font-semibold text-white shadow-[0_0_22px_rgba(139,92,246,0.12)] transition duration-300 hover:-translate-y-0.5 hover:border-cyan-300/32 hover:bg-cyan-300/8 hover:shadow-[0_0_28px_rgba(139,92,246,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300/35"
        >
          View Career Roadmap
          <ArrowRight className="h-4 w-4 transition duration-300 group-hover/link:translate-x-1" />
        </Link>
      </div>
    </section>
  );
}

function ReadinessDonut({ value, label }: { value: number; label: string }) {
  const clampedValue = Math.max(0, Math.min(100, value));

  return (
    <div
      className="relative grid h-36 w-36 place-items-center rounded-full p-2.5 shadow-[0_0_34px_rgba(0,229,255,0.18),0_0_46px_rgba(139,92,246,0.18)]"
      style={{
        background: `conic-gradient(#8B5CF6 0 ${clampedValue * 0.58}%, #3BA8FF ${clampedValue * 0.58}% ${clampedValue}%, rgba(255,255,255,0.08) 0)`,
      }}
      role="img"
      aria-label={`Career readiness ${label}`}
    >
      <span className="absolute inset-1 rounded-full bg-[linear-gradient(115deg,rgba(255,255,255,0.16),transparent_32%,rgba(255,255,255,0.04)_62%,transparent)] opacity-80" />
      <div className="relative grid h-full w-full place-items-center rounded-full bg-[#070B16] text-center shadow-inner ring-1 ring-white/10">
        <div>
          <Sparkles className="mx-auto mb-2 h-4 w-4 text-cyan-100 drop-shadow-[0_0_10px_rgba(0,229,255,0.8)]" />
          <p className="text-xs font-medium text-purple-200">{label === "N/A" ? "Pending" : "Excellent"}</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight text-white">{label}</p>
          <p className="mt-1 text-xs text-slate-500">{label === "N/A" ? "Awaiting score" : "Keep going"}</p>
        </div>
      </div>
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
    <DashboardPanel title="Career Overview" description="Radar and progress signals from your latest career evidence.">
      <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-center">
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
    <div className="relative overflow-hidden rounded-[22px] border border-white/[0.095] bg-[radial-gradient(circle_at_48%_46%,rgba(0,229,255,0.1),transparent_54%),radial-gradient(circle_at_72%_18%,rgba(139,92,246,0.08),transparent_38%),linear-gradient(145deg,rgba(5,10,25,0.96),rgba(8,14,31,0.9))] p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.055),0_18px_54px_rgba(0,0,0,0.22)]">
      <div className="pointer-events-none absolute -left-14 top-10 h-32 w-32 rounded-full bg-[#00E5FF]/7 blur-3xl" />
      <div className="pointer-events-none absolute -right-10 bottom-4 h-32 w-32 rounded-full bg-[#8B5CF6]/7 blur-3xl" />
      <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/38 to-transparent" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#3BA8FF]/6 blur-xl" />
      <svg
        className="relative mx-auto h-56 w-full max-w-[250px] drop-shadow-[0_0_12px_rgba(0,229,255,0.16)]"
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
              stroke="rgba(0,229,255,0.18)"
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
            stroke="rgba(139,92,246,0.22)"
          />
        ))}
        <polygon
          points={polygonPoints}
          fill="rgba(0,229,255,0.2)"
          stroke="#00E5FF"
          strokeWidth="2.5"
        />
        <polygon
          points={polygonPoints}
          fill="rgba(139,92,246,0.15)"
          stroke="#8B5CF6"
          strokeWidth="1.8"
          opacity="0.8"
        />
        {points.map((point) => (
          <text
            key={point.label}
            x={point.labelX}
            y={point.labelY}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="rgba(226,232,240,0.78)"
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
    <div className="group relative overflow-hidden rounded-2xl border border-white/[0.075] bg-[#071024]/72 p-2.5 shadow-[0_12px_34px_rgba(0,0,0,0.16)] transition duration-300 hover:-translate-y-0.5 hover:border-cyan-200/18 hover:bg-white/[0.045]">
      <span
        className="pointer-events-none absolute -left-10 top-1/2 h-20 w-20 -translate-y-1/2 rounded-full opacity-28 blur-2xl transition duration-300 group-hover:opacity-55"
        style={{ background: tone.stroke }}
      />
      <div className="relative flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span
            className="h-2 w-2 rounded-full shadow-[0_0_12px_currentColor]"
            style={{ background: tone.stroke, color: tone.stroke }}
          />
          <p className="text-[0.82rem] font-medium text-slate-300">{metric.label}</p>
        </div>
        <p className="text-[0.82rem] font-semibold text-white">{value === null ? "--" : `${value}/100`}</p>
      </div>
      <div className="relative mt-2.5 h-2 overflow-hidden rounded-full bg-white/[0.08] shadow-inner">
        <span className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.08),transparent)]" />
        <div
          className="relative h-full rounded-full shadow-[0_0_18px_rgba(0,229,255,0.24)] transition-[width] duration-500"
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
      <div className="grid gap-2.5">
        <Link
          href={primaryAction.href}
          className="group relative flex items-center gap-3.5 overflow-hidden rounded-[20px] border border-purple-300/18 bg-[linear-gradient(135deg,rgba(9,15,34,0.94),rgba(12,18,38,0.88))] p-3.5 shadow-[0_16px_42px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.055)] transition duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:border-purple-200/35 hover:shadow-[0_0_24px_rgba(139,92,246,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300/35"
        >
          <span className="pointer-events-none absolute -right-10 -top-12 h-28 w-28 rounded-full bg-purple-300/10 blur-2xl" />
          <span className="relative grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-purple-300/18 to-cyan-300/12 text-purple-100 ring-1 ring-purple-300/18">
            <Sparkles className="h-5 w-5" />
          </span>
          <span className="relative min-w-0 flex-1">
            <span className="block text-sm font-semibold text-white">{primaryAction.title}</span>
            <span className="mt-1 block text-xs leading-5 text-slate-400">{primaryAction.description}</span>
          </span>
          <span className="relative rounded-xl border border-purple-300/20 bg-purple-300/16 px-4 py-2 text-xs font-semibold text-purple-100">
            Start
          </span>
        </Link>

        {quickActions.slice(1).map((action) => {
          const Icon = action.icon;

          return (
            <Link
              key={action.title}
              href={action.href}
              className="group flex items-center gap-3.5 rounded-[18px] border border-white/[0.075] bg-[#071024]/72 p-3.5 shadow-[0_12px_34px_rgba(0,0,0,0.16)] transition duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:border-cyan-300/18 hover:bg-white/[0.045] hover:shadow-[0_0_22px_rgba(0,229,255,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/35"
            >
              <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border ${getTone(action.accent).icon}`}>
                <Icon className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-white">{action.title}</span>
                <span className="mt-1 block text-xs text-slate-500">{action.subtitle}</span>
              </span>
              <ArrowRight className="h-4 w-4 text-slate-500 transition duration-300 group-hover:translate-x-1 group-hover:text-cyan-100" />
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
      title: "Improve Resume Impact",
      description: "Add metrics and strong keywords.",
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
      <div className="mt-3 flex justify-center">
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
  const tone = getTone(index === 0 ? "purple" : index === 1 ? "amber" : "blue");

  return (
    <div
      className="group relative grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3.5 overflow-hidden rounded-[1.05rem] border border-white/[0.08] bg-[linear-gradient(135deg,rgba(7,16,36,0.94),rgba(10,15,32,0.88))] px-3.5 py-3 shadow-[0_14px_40px_rgba(0,0,0,0.2)] transition duration-300 hover:-translate-y-1 hover:border-cyan-200/20 hover:bg-white/[0.045] hover:shadow-[0_0_26px_rgba(0,229,255,0.08)]"
      style={{ boxShadow: `0 14px 40px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)` }}
    >
      <span className="pointer-events-none absolute inset-y-0 left-0 w-1 rounded-full opacity-70" style={{ background: tone.gradient }} />
      <span className="pointer-events-none absolute -left-12 top-1/2 h-28 w-28 -translate-y-1/2 rounded-full opacity-18 blur-2xl transition duration-300 group-hover:opacity-45" style={{ background: tone.stroke }} />
      <span className={`relative grid h-10 w-10 place-items-center rounded-full border ${tone.icon} shadow-[0_0_24px_rgba(0,229,255,0.08)]`}>
        <Icon className="h-4 w-4" />
      </span>
      <div className="relative min-w-0">
        <p className="truncate text-[0.82rem] font-semibold text-white">{activity.label}</p>
        <p className="truncate text-[0.72rem] text-slate-500">{activity.detail}</p>
      </div>
      <div className="relative text-right">
        <p className="text-[0.7rem] text-slate-500">{activity.time}</p>
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
      <div className="relative grid gap-3 py-2 md:grid-cols-4">
        <span className="pointer-events-none absolute left-[10%] right-[10%] top-[4.15rem] hidden h-px bg-gradient-to-r from-cyan-300/8 via-purple-300/34 to-cyan-300/8 shadow-[0_0_16px_rgba(139,92,246,0.18)] md:block" />
        <span className="pointer-events-none absolute left-[18%] right-[18%] top-[4.15rem] hidden h-[2px] rounded-full bg-gradient-to-r from-transparent via-cyan-300/16 to-transparent blur-sm md:block" />
        {recommendations.map((item, index) => {
          const Icon = item.icon;
          const tone = getTone(item.tone);

          return (
            <div
              key={item.title}
              className="group relative overflow-hidden rounded-[20px] border border-white/[0.075] bg-[linear-gradient(155deg,rgba(7,16,36,0.94),rgba(9,14,31,0.86))] px-3.5 py-4 text-center shadow-[0_16px_44px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.045)] transition duration-300 hover:-translate-y-1 hover:border-cyan-200/18 hover:bg-white/[0.045] hover:shadow-[0_0_28px_rgba(139,92,246,0.1)]"
            >
              <span
                className="pointer-events-none absolute -top-16 left-1/2 h-32 w-32 -translate-x-1/2 rounded-full opacity-18 blur-2xl transition duration-300 group-hover:opacity-48"
                style={{ background: tone.stroke }}
              />
              <span className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
              {index < recommendations.length - 1 ? (
                <span className="pointer-events-none absolute left-1/2 top-6 hidden h-px w-full bg-gradient-to-r from-transparent via-cyan-300/20 to-transparent md:block" />
              ) : null}
              <span className={`relative mx-auto grid h-14 w-14 place-items-center rounded-full border ${tone.icon} shadow-[0_0_32px_rgba(139,92,246,0.12)] transition duration-300 group-hover:scale-110`}>
                <span className="absolute inset-1 rounded-full bg-white/[0.03]" />
                <Icon className="relative h-5 w-5" />
              </span>
              <h3 className="relative mt-3 text-[0.82rem] font-semibold text-white">{item.title}</h3>
              <p className="relative mx-auto mt-1 max-w-[160px] text-[0.72rem] leading-5 text-slate-500">{item.detail}</p>
              <span className={`relative mt-3 inline-flex rounded-full border px-2.5 py-1 text-[0.6rem] font-semibold ${tone.badge}`}>
                {item.impact}
              </span>
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex justify-center">
        <Link
          href="/dashboard/coach"
          className="inline-flex h-10 items-center justify-center rounded-2xl border border-purple-300/24 bg-purple-300/8 px-5 text-sm font-semibold text-white shadow-[0_0_24px_rgba(139,92,246,0.1)] transition hover:-translate-y-0.5 hover:border-cyan-300/28 hover:bg-cyan-300/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300/35"
        >
          View Full Roadmap
        </Link>
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
    <section className="relative overflow-hidden rounded-[24px] border border-white/[0.095] bg-[radial-gradient(circle_at_12%_0%,rgba(0,229,255,0.08),transparent_28%),radial-gradient(circle_at_88%_4%,rgba(139,92,246,0.09),transparent_30%),linear-gradient(145deg,rgba(5,10,25,0.96),rgba(9,15,34,0.9)_55%,rgba(4,8,20,0.95))] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.3),0_0_28px_rgba(0,229,255,0.035),inset_0_1px_0_rgba(255,255,255,0.055)]">
      <div className="pointer-events-none absolute -left-16 top-0 h-56 w-56 rounded-full bg-[#00E5FF]/6 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-0 h-56 w-56 rounded-full bg-[#8B5CF6]/7 blur-3xl" />
      <div className="pointer-events-none absolute left-1/4 top-0 h-24 w-1/2 rounded-full bg-[#3BA8FF]/4 blur-3xl" />
      <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/42 to-transparent" />
      <div className="pointer-events-none absolute inset-y-10 left-0 w-px bg-gradient-to-b from-transparent via-cyan-200/28 to-transparent" />
      <div className="pointer-events-none absolute inset-y-10 right-0 w-px bg-gradient-to-b from-transparent via-purple-200/28 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-[radial-gradient(ellipse_at_bottom,rgba(59,168,255,0.06),transparent_72%)]" />
      <div className="relative mb-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-[0.95rem] font-semibold tracking-tight text-white">{title}</h2>
          {description ? <p className="mt-1 text-[0.72rem] text-slate-500">{description}</p> : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div className="relative">{children}</div>
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

function hexToRgb(hex: string) {
  const normalized = hex.replace("#", "");
  const value = Number.parseInt(normalized, 16);
  const red = (value >> 16) & 255;
  const green = (value >> 8) & 255;
  const blue = value & 255;

  return `${red},${green},${blue}`;
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
