import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import {
  Bell,
  CheckCircle2,
  ClipboardCheck,
  Compass,
  FileSearch,
  FileText,
  Home,
  Menu,
  MessageSquareText,
  PenLine,
  Search,
  Settings,
  Sparkles,
  Target,
  Upload,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getCurrentDbUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { withRetry } from "@/lib/retry";

type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

type FeatureCardData = {
  title: string;
  description: string;
  features: string[];
  href: string;
  buttonLabel: string;
  icon: LucideIcon;
};

type QuickActionData = {
  label: string;
  href: string;
  icon: LucideIcon;
};

type ActivityData = {
  label: string;
  detail: string;
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

const sidebarItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: Home },
  { label: "Resume Intelligence", href: "/dashboard/resume", icon: FileText },
  { label: "AI Mock Interviews", href: "/dashboard/interview", icon: MessageSquareText },
  { label: "AI Career Coach", href: "/dashboard/coach", icon: Compass },
  { label: "Job Matcher", href: "/dashboard/resume/match", icon: Target },
  { label: "ATS Optimizer", href: "/dashboard/resume/ats", icon: ClipboardCheck },
  { label: "Resume Rewriter", href: "/dashboard/resume/rewrite", icon: PenLine },
  { label: "Reports", href: "/dashboard/resume", icon: FileSearch },
  { label: "Settings", href: "/dashboard", icon: Settings },
];

const featureCards: FeatureCardData[] = [
  {
    title: "Resume Intelligence",
    description:
      "Upload, analyze, and optimize your resume to beat ATS and impress recruiters.",
    features: ["ATS Analysis", "Resume Match", "Resume Rewriter"],
    href: "/dashboard/resume",
    buttonLabel: "Open Dashboard",
    icon: FileSearch,
  },
  {
    title: "AI Mock Interviews",
    description:
      "Practice realistic interviews with AI feedback across OA, technical, project, and behavioral rounds.",
    features: ["OA Assessment", "Technical Interview", "Project Deep Dive", "Behavioral / HR"],
    href: "/dashboard/interview",
    buttonLabel: "Start Practice",
    icon: MessageSquareText,
  },
  {
    title: "AI Career Coach",
    description:
      "Get a personalized roadmap based on your goals, skills, and market trends.",
    features: ["Career Roadmap", "Skill Gap Analysis", "Personalized Guidance"],
    href: "/dashboard/coach",
    buttonLabel: "Explore Coach",
    icon: Compass,
  },
];

const quickActions: QuickActionData[] = [
  { label: "Upload Resume", href: "/dashboard/resume", icon: Upload },
  { label: "Match Job", href: "/dashboard/resume/match", icon: Target },
  { label: "Start Interview", href: "/dashboard/interview", icon: MessageSquareText },
  { label: "ATS Check", href: "/dashboard/resume/ats", icon: ClipboardCheck },
];

const recentActivity: ActivityData[] = [
  { label: "Resume scanned", detail: "Resume Intelligence completed" },
  { label: "ATS improved", detail: "Optimization checklist updated" },
  { label: "Job matched", detail: "JD match report generated" },
  { label: "Mock interview completed", detail: "Practice feedback saved" },
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

  return (
    <main className="min-h-screen overflow-hidden bg-[#050816] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_15%_5%,rgba(0,229,255,0.16),transparent_32rem),radial-gradient(circle_at_85%_8%,rgba(106,92,255,0.18),transparent_34rem),radial-gradient(circle_at_55%_85%,rgba(139,92,246,0.12),transparent_34rem),linear-gradient(180deg,#050816_0%,#070b1f_52%,#050816_100%)]" />
      <div className="relative mx-auto flex w-full max-w-[1540px] flex-col gap-5 px-4 py-4 sm:px-6 xl:flex-row xl:px-7">
        <div className="xl:hidden">
          <MobileSidebar profile={profile} />
        </div>

        <div className="hidden xl:block xl:w-72 xl:shrink-0">
          <Sidebar profile={profile} />
        </div>

        <section className="min-w-0 flex-1 space-y-5">
          <TopHeader profile={profile} />

          <div className="grid gap-5 2xl:grid-cols-[1fr_370px]">
            <div className="space-y-5">
              <HeroBanner />
              <ResumeSnapshotCard snapshot={snapshot} />

              <section className="grid gap-5 lg:grid-cols-3">
                {featureCards.map((feature) => (
                  <FeatureCard key={feature.title} feature={feature} />
                ))}
              </section>
            </div>

            <aside className="grid gap-5 lg:grid-cols-3 2xl:block 2xl:space-y-5">
              <ActivityPanel />
              <QuickActions />
              <MotivationCard />
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}

function Sidebar({ profile }: { profile: UserProfile }) {
  return (
    <aside className="sticky top-4 h-[calc(100vh-2rem)]">
      <div className="flex h-full flex-col rounded-[1.75rem] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] p-4 shadow-[0_0_40px_rgba(0,229,255,0.12),0_0_60px_rgba(106,92,255,0.12)] backdrop-blur-2xl">
        <Logo />
        <nav className="mt-7 grid gap-1.5">
          {sidebarItems.map((item) => (
            <SidebarNavItem key={item.label} item={item} />
          ))}
        </nav>
        <UserProfileCard profile={profile} />
      </div>
    </aside>
  );
}

function MobileSidebar({ profile }: { profile: UserProfile }) {
  return (
    <details className="group rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] p-3 shadow-[0_0_40px_rgba(0,229,255,0.1)] backdrop-blur-2xl">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
        <Logo compact />
        <span className="grid h-10 w-10 place-items-center rounded-xl border border-[rgba(255,255,255,0.08)] bg-[#070b1f]/70 text-cyan-100">
          <Menu className="h-5 w-5" />
        </span>
      </summary>
      <nav className="mt-4 grid gap-1.5 border-t border-[rgba(255,255,255,0.08)] pt-4">
        {sidebarItems.map((item) => (
          <SidebarNavItem key={item.label} item={item} />
        ))}
      </nav>
      <UserProfileCard profile={profile} />
    </details>
  );
}

function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-3 rounded-2xl px-2 py-2">
      <span className="relative grid h-11 w-11 place-items-center rounded-2xl border border-cyan-300/25 bg-[#00E5FF]/10 text-cyan-100 shadow-[0_0_28px_rgba(0,229,255,0.24)]">
        <Sparkles className="h-5 w-5" />
        <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-[#8B5CF6] shadow-[0_0_18px_rgba(139,92,246,0.8)]" />
      </span>
      {!compact ? (
        <span>
          <span className="block text-base font-semibold tracking-tight">
            TalentForge AI
          </span>
          <span className="text-xs text-slate-500">Career Intelligence</span>
        </span>
      ) : (
        <span className="text-base font-semibold tracking-tight">TalentForge AI</span>
      )}
    </Link>
  );
}

function SidebarNavItem({ item }: { item: NavItem }) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      className="group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm text-slate-400 transition duration-300 hover:-translate-y-0.5 hover:bg-[#00E5FF]/10 hover:text-cyan-50 hover:shadow-[0_0_28px_rgba(0,229,255,0.12)]"
    >
      <Icon className="h-4 w-4 text-slate-500 transition duration-300 group-hover:text-[#00E5FF]" />
      <span>{item.label}</span>
    </Link>
  );
}

function UserProfileCard({ profile }: { profile: UserProfile }) {
  return (
    <div className="mt-auto rounded-3xl border border-[rgba(255,255,255,0.08)] bg-[#070b1f]/70 p-4 shadow-[0_0_40px_rgba(106,92,255,0.12)]">
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-[#00E5FF] via-[#6A5CFF] to-[#8B5CF6] text-sm font-bold text-white shadow-[0_0_30px_rgba(0,229,255,0.26)]">
          {profile.initial}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-white">{profile.email}</p>
          <p className="text-xs capitalize text-slate-500">{profile.role.toLowerCase()}</p>
        </div>
      </div>
    </div>
  );
}

function TopHeader({ profile }: { profile: UserProfile }) {
  return (
    <header className="flex flex-col gap-3 rounded-[1.5rem] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] p-4 shadow-[0_0_40px_rgba(0,229,255,0.1)] backdrop-blur-2xl md:flex-row md:items-center md:justify-between">
      <div className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[#070b1f]/70 px-4 py-3">
        <Search className="h-4 w-4 text-[#00E5FF]" />
        <span className="text-sm text-slate-500">Search anything...</span>
      </div>
      <div className="flex items-center justify-between gap-3 md:justify-end">
        <button
          type="button"
          aria-label="Notifications"
          className="grid h-11 w-11 place-items-center rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[#070b1f]/70 text-slate-300 transition duration-300 hover:-translate-y-0.5 hover:border-cyan-300/30 hover:bg-[#00E5FF]/10 hover:text-cyan-50 hover:shadow-[0_0_28px_rgba(0,229,255,0.18)]"
        >
          <Bell className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-3 rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[#070b1f]/70 px-3 py-2">
          <span className="grid h-9 w-9 place-items-center rounded-2xl bg-gradient-to-br from-[#00E5FF] to-[#6A5CFF] text-sm font-bold text-white">
            {profile.initial}
          </span>
          <span className="hidden max-w-[220px] truncate text-sm text-slate-300 sm:block">
            {profile.email}
          </span>
        </div>
      </div>
    </header>
  );
}

function HeroBanner() {
  return (
    <section className="relative min-h-[500px] overflow-hidden rounded-[2rem] border border-[rgba(255,255,255,0.08)] bg-[linear-gradient(135deg,rgba(0,229,255,0.16),rgba(106,92,255,0.14)_48%,rgba(139,92,246,0.18))] p-7 shadow-[0_0_40px_rgba(0,229,255,0.12),0_0_60px_rgba(106,92,255,0.12)] sm:p-10 lg:p-12">
      <div className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-[#00E5FF]/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-8 h-96 w-96 rounded-full bg-[#6A5CFF]/24 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_24%_22%,rgba(255,255,255,0.18)_0_1px,transparent_2px),radial-gradient(circle_at_72%_30%,rgba(0,229,255,0.28)_0_1px,transparent_2px),radial-gradient(circle_at_52%_78%,rgba(139,92,246,0.32)_0_1px,transparent_2px)]" />
      <div className="relative grid gap-8 lg:grid-cols-[1fr_360px] lg:items-center">
        <div className="max-w-3xl">
          <span className="inline-flex rounded-full border border-cyan-300/25 bg-[#00E5FF]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-cyan-100 shadow-[0_0_24px_rgba(0,229,255,0.16)]">
            Premium AI Career OS
          </span>
          <h1 className="mt-6 text-5xl font-semibold leading-[0.96] tracking-tight sm:text-7xl">
            Stand out.
            <br />
            <span className="bg-gradient-to-r from-[#00E5FF] via-white to-[#8B5CF6] bg-clip-text text-transparent">
              Get hired.
            </span>
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
            AI-powered tools to analyze, optimize, and accelerate your career.
          </p>
          <Button
            asChild
            className="group relative mt-8 h-12 overflow-hidden rounded-2xl bg-gradient-to-r from-[#00E5FF] via-[#6A5CFF] to-[#8B5CF6] px-6 text-white shadow-[0_0_32px_rgba(0,229,255,0.25)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_46px_rgba(0,229,255,0.36)]"
          >
            <Link href="/dashboard/resume">
              <span className="absolute inset-y-0 -left-10 w-10 skew-x-12 bg-white/30 transition duration-300 group-hover:left-full" />
              <span className="relative">Start Your Journey</span>
            </Link>
          </Button>
        </div>

        <AiIllustration />
      </div>
    </section>
  );
}

function ResumeSnapshotCard({ snapshot }: { snapshot: ResumeSnapshotData }) {
  const atsScore = snapshot.atsScore ?? 0;
  const matchScore = snapshot.matchScore ?? 0;
  const scoreLabel = snapshot.atsScore === null ? "--" : String(snapshot.atsScore);
  const matchLabel = snapshot.matchScore === null ? "--" : `${snapshot.matchScore}%`;

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-cyan-300/15 bg-[rgba(255,255,255,0.04)] p-6 shadow-[0_0_40px_rgba(0,229,255,0.12),0_0_60px_rgba(106,92,255,0.12)] backdrop-blur-2xl sm:p-7">
      <div className="pointer-events-none absolute -left-20 bottom-0 h-56 w-56 rounded-full bg-[#00E5FF]/14 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-[#8B5CF6]/18 blur-3xl" />
      <div className="relative grid gap-6 xl:grid-cols-[260px_1fr] xl:items-center">
        <div>
          <span className="inline-flex rounded-full border border-[#00E5FF]/20 bg-[#00E5FF]/10 px-3 py-1 text-xs font-medium text-cyan-100">
            Resume command center
          </span>
          <h2 className="mt-4 text-2xl font-semibold tracking-tight">
            Resume Intelligence Snapshot
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Latest insights from your uploaded resume.
          </p>
          {snapshot.resumeTitle ? (
            <p className="mt-4 truncate rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[#070b1f]/70 px-3 py-2 text-xs text-slate-400">
              Latest resume: <span className="text-slate-200">{snapshot.resumeTitle}</span>
            </p>
          ) : null}
        </div>

        <div className="grid gap-4 md:grid-cols-[190px_1fr]">
          <div className="rounded-[1.5rem] border border-cyan-300/15 bg-[#070b1f]/72 p-5 shadow-[0_0_34px_rgba(0,229,255,0.12)]">
            <div
              className="mx-auto grid h-36 w-36 place-items-center rounded-full p-2"
              style={{
                background: `conic-gradient(#00E5FF ${atsScore}%, rgba(255,255,255,0.08) 0)`,
              }}
            >
              <div className="grid h-full w-full place-items-center rounded-full bg-[#050816] text-center shadow-inner">
                <div>
                  <p className="text-4xl font-semibold tracking-tight text-white">{scoreLabel}</p>
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-500">/ 100</p>
                </div>
              </div>
            </div>
            <p className="mt-4 text-center text-sm font-medium text-cyan-100">
              Latest ATS Score
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <SnapshotMetric
              label="Job Match Score"
              value={matchLabel}
              helper="Latest JD comparison"
              progress={matchScore}
            />
            <SnapshotMetric
              label="Resume Health"
              value={snapshot.health}
              helper="Evidence-based readiness"
              badge
            />
            <SnapshotMetric
              label="Detected Role"
              value={snapshot.detectedRole}
              helper="From resume signals"
              badge
            />
            <SnapshotMetric
              label="Last Analysis"
              value={snapshot.lastAnalysis}
              helper="Most recent resume update"
              badge
            />
          </div>
        </div>

        <div className="xl:col-start-2">
          <div className="grid gap-3 sm:grid-cols-3">
            <SnapshotAction href="/dashboard/resume" label="Open Resume Dashboard" />
            <SnapshotAction href="/dashboard/resume/ats" label="Re-run ATS Analysis" />
            <SnapshotAction href="/dashboard/resume/match" label="Match Against New Job" />
          </div>
        </div>
      </div>
    </section>
  );
}

function SnapshotMetric({
  label,
  value,
  helper,
  progress,
  badge = false,
}: {
  label: string;
  value: string;
  helper: string;
  progress?: number;
  badge?: boolean;
}) {
  return (
    <div className="rounded-[1.4rem] border border-[rgba(255,255,255,0.08)] bg-[#070b1f]/70 p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</p>
      {badge ? (
        <span className="mt-3 inline-flex max-w-full rounded-full border border-[#8B5CF6]/25 bg-[#8B5CF6]/12 px-3 py-1.5 text-sm font-semibold text-purple-100">
          <span className="truncate">{value}</span>
        </span>
      ) : (
        <p className="mt-3 text-2xl font-semibold text-white">{value}</p>
      )}
      <p className="mt-2 text-xs text-slate-500">{helper}</p>
      {typeof progress === "number" ? (
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/[0.06]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#00E5FF] to-[#8B5CF6] shadow-[0_0_18px_rgba(0,229,255,0.35)]"
            style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
          />
        </div>
      ) : null}
    </div>
  );
}

function SnapshotAction({ href, label }: { href: string; label: string }) {
  return (
    <Button
      asChild
      className="h-11 rounded-2xl border border-cyan-300/15 bg-[#00E5FF]/10 text-cyan-50 shadow-[0_0_24px_rgba(0,229,255,0.12)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#00E5FF]/18 hover:shadow-[0_0_34px_rgba(0,229,255,0.24)]"
    >
      <Link href={href}>{label}</Link>
    </Button>
  );
}

function AiIllustration() {
  return (
    <div className="relative mx-auto hidden h-80 w-80 lg:block">
      <div className="absolute inset-8 rounded-full border border-cyan-300/20 bg-[#070b1f]/60 shadow-[0_0_60px_rgba(0,229,255,0.18)] backdrop-blur-xl" />
      <div className="absolute inset-20 rounded-full border border-purple-300/20 bg-gradient-to-br from-[#00E5FF]/16 to-[#8B5CF6]/20" />
      <div className="absolute left-1/2 top-1/2 grid h-24 w-24 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-3xl border border-white/10 bg-white/[0.06] shadow-[0_0_40px_rgba(106,92,255,0.28)]">
        <Sparkles className="h-9 w-9 text-cyan-100" />
      </div>
      {[0, 1, 2, 3, 4, 5].map((item) => (
        <span
          key={item}
          className="absolute h-3 w-3 rounded-full bg-[#00E5FF] shadow-[0_0_22px_rgba(0,229,255,0.85)]"
          style={{
            left: `${50 + Math.cos((item / 6) * Math.PI * 2) * 42}%`,
            top: `${50 + Math.sin((item / 6) * Math.PI * 2) * 42}%`,
          }}
        />
      ))}
      <svg
        className="absolute inset-0 h-full w-full opacity-70"
        viewBox="0 0 320 320"
        aria-hidden="true"
      >
        <circle cx="160" cy="160" r="118" fill="none" stroke="rgba(0,229,255,0.18)" />
        <circle cx="160" cy="160" r="82" fill="none" stroke="rgba(139,92,246,0.2)" />
        <path
          d="M83 160h234M160 40v240M76 103c65 40 126 40 188 0M76 217c65-40 126-40 188 0"
          fill="none"
          stroke="rgba(255,255,255,0.12)"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

function FeatureCard({ feature }: { feature: FeatureCardData }) {
  const Icon = feature.icon;

  return (
    <div className="group flex min-h-[390px] flex-col rounded-[1.75rem] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] p-6 shadow-[0_0_40px_rgba(0,229,255,0.09),0_0_60px_rgba(106,92,255,0.08)] transition duration-300 hover:-translate-y-1 hover:border-cyan-300/25 hover:bg-white/[0.055] hover:shadow-[0_0_52px_rgba(0,229,255,0.16),0_0_70px_rgba(106,92,255,0.15)]">
      <span className="grid h-14 w-14 place-items-center rounded-2xl border border-cyan-300/20 bg-[#00E5FF]/10 text-cyan-100 shadow-[0_0_28px_rgba(0,229,255,0.12)]">
        <Icon className="h-7 w-7" />
      </span>
      <h3 className="mt-6 text-2xl font-semibold tracking-tight">{feature.title}</h3>
      <p className="mt-4 text-sm leading-7 text-slate-400">{feature.description}</p>
      <ul className="mt-6 space-y-3 text-sm text-slate-300">
        {feature.features.map((item) => (
          <li key={item} className="flex items-center gap-2.5">
            <CheckCircle2 className="h-4 w-4 text-[#00E5FF]" />
            {item}
          </li>
        ))}
      </ul>
      <Button
        asChild
        className="mt-auto h-11 rounded-2xl bg-[#00E5FF]/12 text-cyan-50 shadow-[0_0_24px_rgba(0,229,255,0.12)] ring-1 ring-cyan-300/20 transition duration-300 hover:bg-[#00E5FF]/20 hover:shadow-[0_0_34px_rgba(0,229,255,0.24)]"
      >
        <Link href={feature.href}>{feature.buttonLabel}</Link>
      </Button>
    </div>
  );
}

function ActivityPanel() {
  return (
    <Panel title="Activity Overview">
      <div className="relative space-y-5">
        <div className="absolute bottom-3 left-[15px] top-3 w-px bg-gradient-to-b from-[#00E5FF] via-[#6A5CFF] to-transparent" />
        {recentActivity.map((activity) => (
          <ActivityItem key={activity.label} activity={activity} />
        ))}
      </div>
    </Panel>
  );
}

function QuickActions() {
  return (
    <Panel title="Quick Actions">
      <div className="grid gap-3">
        {quickActions.map((action) => (
          <QuickActionItem key={action.label} action={action} />
        ))}
      </div>
    </Panel>
  );
}

function MotivationCard() {
  return (
    <div className="relative overflow-hidden rounded-[1.75rem] border border-purple-300/20 bg-[rgba(255,255,255,0.04)] p-6 shadow-[0_0_60px_rgba(106,92,255,0.16)]">
      <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-[#8B5CF6]/24 blur-3xl" />
      <div className="relative">
        <Sparkles className="h-6 w-6 text-[#8B5CF6]" />
        <p className="mt-5 text-xl font-semibold leading-8 text-white">
          &quot;The best way to predict your future is to create it.&quot;
        </p>
        <p className="mt-4 text-sm font-medium text-purple-200">- TalentForge AI</p>
      </div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-[1.75rem] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] p-5 shadow-[0_0_40px_rgba(0,229,255,0.1)] backdrop-blur-xl">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function ActivityItem({ activity }: { activity: ActivityData }) {
  return (
    <div className="relative flex gap-4 pl-11">
      <span className="absolute left-0 top-1 grid h-8 w-8 place-items-center rounded-full border border-cyan-300/25 bg-[#070b1f] text-[#00E5FF] shadow-[0_0_18px_rgba(0,229,255,0.28)]">
        <Zap className="h-3.5 w-3.5" />
      </span>
      <div className="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[#070b1f]/60 px-4 py-3">
        <p className="text-sm font-medium text-slate-100">{activity.label}</p>
        <p className="mt-1 text-xs leading-5 text-slate-500">{activity.detail}</p>
      </div>
    </div>
  );
}

function QuickActionItem({ action }: { action: QuickActionData }) {
  const Icon = action.icon;

  return (
    <Link
      href={action.href}
      className="group flex items-center justify-between rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[#070b1f]/70 px-4 py-3 text-sm text-slate-300 transition duration-300 hover:-translate-y-0.5 hover:border-cyan-300/25 hover:bg-[#00E5FF]/10 hover:text-cyan-50 hover:shadow-[0_0_28px_rgba(0,229,255,0.14)]"
    >
      <span className="flex items-center gap-3">
        <Icon className="h-4 w-4 text-[#00E5FF]" />
        {action.label}
      </span>
      <span className="text-xs text-slate-600 transition group-hover:text-cyan-200">
        Open
      </span>
    </Link>
  );
}
