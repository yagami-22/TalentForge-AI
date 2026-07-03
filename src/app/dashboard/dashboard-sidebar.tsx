"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  BarChart3,
  Brain,
  BriefcaseBusiness,
  ClipboardCheck,
  Compass,
  FileText,
  GitBranch,
  Home,
  Menu,
  MessageSquareText,
  PenLine,
  Settings,
  Target,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  matchPrefix?: boolean;
};

type UserProfile = {
  email: string;
  role: string;
  initial: string;
};

const sidebarGroups: Array<{
  label: string;
  ariaLabel: string;
  items: NavItem[];
}> = [
  {
    label: "Main",
    ariaLabel: "Primary dashboard navigation",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: Home },
    ],
  },
  {
    label: "Career Intelligence",
    ariaLabel: "Career intelligence navigation",
    items: [
      { label: "Resume Hub", href: "/dashboard/resume", icon: FileText },
      { label: "ATS Optimizer", href: "/dashboard/resume/ats", icon: ClipboardCheck },
      { label: "JD Matcher", href: "/dashboard/resume/match", icon: Target },
      { label: "AI Rewriter", href: "/dashboard/resume/rewrite", icon: PenLine },
      { label: "GitHub Analyzer", href: "/dashboard/github", icon: GitBranch, matchPrefix: true },
    ],
  },
  {
    label: "Interview & Growth",
    ariaLabel: "Interview and growth navigation",
    items: [
      { label: "Interview Prep", href: "/dashboard/interview", icon: MessageSquareText },
      { label: "OA Practice", href: "/dashboard/interview/oa/session", icon: Brain },
      {
        label: "AI Recruiter Mode",
        href: "/dashboard/recruiter",
        icon: BriefcaseBusiness,
        matchPrefix: true,
      },
      { label: "Career Coach", href: "/dashboard/coach", icon: Compass },
      { label: "Career Insights", href: "/dashboard/analytics", icon: BarChart3 },
      { label: "History", href: "/dashboard/resume/history", icon: Activity },
    ],
  },
  {
    label: "Settings",
    ariaLabel: "Settings navigation",
    items: [
      { label: "Settings", href: "/dashboard/settings", icon: Settings },
    ],
  },
];

export function Sidebar({ profile }: { profile: UserProfile }) {
  return (
    <aside className="sticky top-3 h-[calc(100vh-1.5rem)] w-[292px] shrink-0">
      <div className="relative flex h-full min-h-0 flex-col overflow-hidden rounded-[26px] border border-cyan-200/10 bg-[#071024]/72 p-4 shadow-[0_24px_90px_rgba(0,0,0,0.28),0_0_42px_rgba(0,229,255,0.08)] backdrop-blur-2xl">
        <span className="pointer-events-none absolute -left-24 top-20 h-56 w-56 rounded-full bg-[#00E5FF]/10 blur-3xl" />
        <span className="pointer-events-none absolute -right-24 bottom-20 h-56 w-56 rounded-full bg-[#8B5CF6]/10 blur-3xl" />
        <Logo />
        <div className="mt-5 min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain pb-2 pr-1 [scrollbar-color:rgba(0,229,255,0.24)_transparent] [scrollbar-width:thin]">
          {sidebarGroups.map((group) => (
            <SidebarGroup
              key={group.label}
              label={group.label}
              items={group.items}
              ariaLabel={group.ariaLabel}
            />
          ))}
        </div>
        <div className="mt-auto shrink-0 pt-3">
          <UserProfileCard profile={profile} />
        </div>
      </div>
    </aside>
  );
}

export function MobileSidebar({ profile }: { profile: UserProfile }) {
  return (
    <details className="group rounded-[26px] border border-cyan-200/10 bg-[#071024]/72 p-3 shadow-[0_24px_90px_rgba(0,0,0,0.26),0_0_42px_rgba(0,229,255,0.06)] backdrop-blur-2xl">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
        <Logo compact />
        <span className="grid h-10 w-10 place-items-center rounded-xl border border-cyan-200/10 bg-[#071024]/72 text-cyan-100 shadow-[0_0_18px_rgba(0,229,255,0.08)] ring-1 ring-white/[0.06] transition duration-200 group-open:rotate-90">
          <Menu className="h-5 w-5" />
        </span>
      </summary>
      <div className="mt-4 space-y-6 border-t border-white/[0.06] pt-4">
        {sidebarGroups.map((group) => (
          <SidebarGroup
            key={group.label}
            label={group.label}
            items={group.items}
            ariaLabel={`Mobile ${group.ariaLabel.toLowerCase()}`}
          />
        ))}
      </div>
      <div className="mt-5">
        <UserProfileCard profile={profile} />
      </div>
    </details>
  );
}

function SidebarGroup({
  label,
  items,
  ariaLabel,
}: {
  label: string;
  items: NavItem[];
  ariaLabel: string;
}) {
  return (
    <div className="space-y-2">
      <p className="px-3 text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-slate-500/75">
        {label}
      </p>
      <nav className="grid gap-1" aria-label={ariaLabel}>
        {items.map((item) => (
          <SidebarNavItem key={item.label} item={item} />
        ))}
      </nav>
    </div>
  );
}

function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="relative flex items-center gap-3 rounded-2xl px-1 py-1 outline-none transition focus-visible:ring-2 focus-visible:ring-[#00E5FF]/20">
      <span className="relative grid h-11 w-11 place-items-center">
        <span className="absolute h-8 w-11 rounded-[0.65rem] bg-gradient-to-br from-[#00E5FF] via-[#6A5CFF] to-[#FF3DFE] opacity-85 shadow-[0_0_24px_rgba(139,92,246,0.28)] [clip-path:polygon(8%_10%,100%_10%,78%_38%,59%_38%,45%_90%,27%_90%,43%_38%,0_38%)]" />
        <span className="relative text-[0.72rem] font-black tracking-tighter text-white drop-shadow-[0_0_12px_rgba(0,229,255,0.8)]">
          TF
        </span>
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

function SidebarNavItem({
  item,
}: {
  item: NavItem;
}) {
  const pathname = usePathname();
  const active =
    pathname === item.href ||
    Boolean(item.matchPrefix && pathname.startsWith(`${item.href}/`));
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={`group relative flex h-10 items-center gap-3.5 rounded-2xl border px-3.5 text-sm text-slate-400 outline-none transition duration-300 focus-visible:ring-2 focus-visible:ring-[#00E5FF]/22 ${
        active
          ? "border-cyan-300/38 bg-[linear-gradient(135deg,rgba(0,229,255,0.22),rgba(106,92,255,0.24))] text-white shadow-[0_0_34px_rgba(0,229,255,0.24),inset_0_1px_0_rgba(255,255,255,0.1),inset_0_0_20px_rgba(0,229,255,0.055)]"
          : "border-transparent hover:-translate-y-0.5 hover:border-white/[0.1] hover:bg-white/[0.055] hover:text-slate-100"
      }`}
    >
      {active ? (
        <span className="absolute inset-y-2 left-1 w-0.5 rounded-full bg-cyan-200 shadow-[0_0_16px_rgba(0,229,255,0.8)]" aria-hidden="true" />
      ) : null}
      <span
        className={`grid h-7 w-7 shrink-0 place-items-center rounded-xl transition duration-300 ${
          active
            ? "bg-cyan-300/10 text-cyan-50 shadow-[0_0_18px_rgba(0,229,255,0.22)]"
            : "text-slate-600 group-hover:bg-cyan-300/8 group-hover:text-cyan-100 group-hover:shadow-[0_0_16px_rgba(0,229,255,0.12)]"
        }`}
      >
        <Icon className="h-4 w-4" />
      </span>
      <span className="truncate">{item.label}</span>
    </Link>
  );
}

function UserProfileCard({ profile }: { profile: UserProfile }) {
  return (
    <div className="relative shrink-0 rounded-[1.25rem] border border-white/[0.08] bg-white/[0.035] p-3">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-[#00E5FF] to-[#6A5CFF] text-sm font-bold text-white shadow-[0_0_18px_rgba(0,229,255,0.16)]">
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
