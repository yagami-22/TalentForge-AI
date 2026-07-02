"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
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
  Sparkles,
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
      { label: "AI Career Coach", href: "/dashboard/coach", icon: Compass },
    ],
  },
  {
    label: "Resume Intelligence",
    ariaLabel: "Resume intelligence navigation",
    items: [
      { label: "Resume Intelligence", href: "/dashboard/resume", icon: FileText },
      { label: "Job Matcher", href: "/dashboard/resume/match", icon: Target },
      { label: "ATS Optimizer", href: "/dashboard/resume/ats", icon: ClipboardCheck },
      { label: "Resume Rewriter", href: "/dashboard/resume/rewrite", icon: PenLine },
      { label: "GitHub Analyzer", href: "/dashboard/github", icon: GitBranch, matchPrefix: true },
    ],
  },
  {
    label: "Interview",
    ariaLabel: "Interview navigation",
    items: [
      { label: "AI Mock Interviews", href: "/dashboard/interview", icon: MessageSquareText },
    ],
  },
  {
    label: "Recruiter",
    ariaLabel: "Recruiter navigation",
    items: [
      {
        label: "AI Recruiter Mode",
        href: "/dashboard/recruiter",
        icon: BriefcaseBusiness,
        matchPrefix: true,
      },
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
    <aside className="sticky top-5 h-[calc(100vh-2.5rem)]">
      <div className="flex h-full min-h-0 flex-col rounded-[1.75rem] border border-white/[0.08] bg-white/[0.035] p-4 shadow-[0_0_32px_rgba(0,229,255,0.08),0_0_42px_rgba(106,92,255,0.08)] backdrop-blur-2xl">
        <Logo />
        <div className="mt-5 min-h-0 flex-1 space-y-5 overflow-y-auto pr-1 pb-3 overscroll-contain [scrollbar-width:thin] [scrollbar-color:rgba(0,229,255,0.28)_transparent]">
          {sidebarGroups.map((group) => (
            <SidebarGroup
              key={group.label}
              label={group.label}
              items={group.items}
              ariaLabel={group.ariaLabel}
            />
          ))}
        </div>
        <UserProfileCard profile={profile} />
      </div>
    </aside>
  );
}

export function MobileSidebar({ profile }: { profile: UserProfile }) {
  return (
    <details className="group rounded-2xl border border-white/[0.08] bg-white/[0.04] p-3 shadow-[0_0_32px_rgba(0,229,255,0.08)] backdrop-blur-2xl">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
        <Logo compact />
        <span className="grid h-10 w-10 place-items-center rounded-xl border border-white/[0.08] bg-[#070b1f]/70 text-cyan-100">
          <Menu className="h-5 w-5" />
        </span>
      </summary>
      <div className="mt-4 space-y-4 border-t border-white/[0.08] pt-4">
        {sidebarGroups.map((group) => (
          <SidebarGroup
            key={group.label}
            label={group.label}
            items={group.items}
            ariaLabel={`Mobile ${group.ariaLabel.toLowerCase()}`}
          />
        ))}
      </div>
      <UserProfileCard profile={profile} />
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
    <div>
      <p className="px-3 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-slate-600">
        {label}
      </p>
      <nav className="mt-2 grid gap-1" aria-label={ariaLabel}>
        {items.map((item) => (
          <SidebarNavItem key={item.label} item={item} />
        ))}
      </nav>
    </div>
  );
}

function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-3 rounded-2xl px-2 py-2">
      <span className="relative grid h-11 w-11 place-items-center rounded-2xl border border-cyan-300/20 bg-[#00E5FF]/10 text-cyan-100 shadow-[0_0_22px_rgba(0,229,255,0.18)]">
        <Sparkles className="h-5 w-5" />
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
      className={`group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm text-slate-400 outline-none transition duration-300 focus-visible:ring-2 focus-visible:ring-[#00E5FF]/30 ${
        active
          ? "border border-cyan-300/20 bg-[#00E5FF]/12 text-cyan-50 shadow-[0_0_24px_rgba(0,229,255,0.12)]"
          : "hover:bg-white/[0.055] hover:text-slate-100"
      }`}
    >
      <Icon
        className={`h-4 w-4 transition duration-300 ${
          active ? "text-[#00E5FF]" : "text-slate-600 group-hover:text-cyan-100"
        }`}
      />
      <span className="truncate">{item.label}</span>
    </Link>
  );
}

function UserProfileCard({ profile }: { profile: UserProfile }) {
  return (
    <div className="mt-4 shrink-0 rounded-[1.35rem] border border-white/[0.08] bg-[#070b1f]/66 p-3">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-[#00E5FF] to-[#6A5CFF] text-sm font-bold text-white shadow-[0_0_22px_rgba(0,229,255,0.18)]">
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
