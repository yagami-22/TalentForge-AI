"use client";

import type { ReactNode } from "react";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Code2,
  ExternalLink,
  GitBranch,
  GitFork,
  RadioTower,
  SearchCheck,
  ShieldCheck,
  Star,
  Target,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { forge } from "@/lib/talentforge-design";

export type GitHubScoreMetric = {
  label: string;
  value: number;
  description: string;
  icon: LucideIcon;
  tone?: "cyan" | "purple" | "emerald" | "amber";
};

export type GitHubRepositoryView = {
  name: string;
  url: string;
  liveDemoUrl: string | null;
  description: string | null;
  language: string | null;
  stars: number;
  forks: number;
  topics: string[];
  homepage: string | null;
  updatedAt: string;
  hasReadme: boolean;
  score: number;
  weight: "High" | "Medium" | "Low" | "Ignore";
  recruiterGrade: "A+" | "A" | "B" | "C" | "Needs Proof";
  productionStatus: "Production-grade" | "Portfolio-ready" | "Promising" | "Low signal";
  aiSummary: string;
  technologies: string[];
  evidence: string[];
  quality: Array<{ label: string; value: number }>;
  signals: {
    architecture: boolean;
    deployment: boolean;
    testing: boolean;
    readme: boolean;
  };
  issues: string[];
};

export type GitHubRecommendation = {
  title: string;
  reason: string;
  priority: "High" | "Medium" | "Low";
  impact: string;
};

export function GitHubHero({
  children,
  isLoading,
  metrics = [],
  summary,
}: {
  children: ReactNode;
  isLoading: boolean;
  metrics?: Array<{ label: string; value: string; tone?: "cyan" | "purple" | "emerald" | "amber" }>;
  summary?: string;
}) {
  return (
    <section className="relative overflow-hidden rounded-[1.1rem] border border-cyan-300/20 bg-[radial-gradient(circle_at_8%_0%,rgba(0,229,255,0.16),transparent_30%),radial-gradient(circle_at_88%_0%,rgba(151,71,255,0.22),transparent_33%),radial-gradient(circle_at_46%_108%,rgba(0,135,255,0.08),transparent_34%),linear-gradient(135deg,#050916_0%,#060817_48%,#12051f_100%)] p-4 shadow-[0_0_24px_rgba(0,229,255,0.08),inset_0_0_42px_rgba(139,92,246,0.035)] backdrop-blur-2xl sm:p-5">
      <div
        className="pointer-events-none absolute inset-0 opacity-45"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(120,210,255,0.18) 0 1px, transparent 1.6px)",
          backgroundSize: "26px 26px",
        }}
      />
      <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-cyan-300/70 via-blue-400/35 to-purple-400/70" />
      <div className="pointer-events-none absolute -right-14 -top-24 h-64 w-64 rounded-full bg-[#8B5CF6]/14 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 left-10 h-64 w-64 rounded-full bg-[#00E5FF]/13 blur-3xl" />
      <div className="relative grid gap-5 xl:grid-cols-[minmax(0,0.92fr)_minmax(420px,0.82fr)] xl:items-center">
        <div>
          <p className={forge.badge}>GitHub Profile Analyzer</p>
          <h1 className="mt-3 max-w-2xl text-2xl font-semibold tracking-tight text-white sm:text-[2rem] sm:leading-[1.12]">
            Repository intelligence for serious hiring signal.
          </h1>
          <p className="mt-2 max-w-2xl text-xs leading-5 text-zinc-300 sm:text-sm">
            Inspect public code, README depth, stack evidence, deployment, architecture, and resume alignment the way a technical recruiter would.
          </p>
          {children}
        </div>
        <div className="rounded-[1rem] border border-white/[0.065] bg-[#060915]/60 p-3 shadow-[inset_0_0_30px_rgba(0,229,255,0.04),0_18px_45px_rgba(0,0,0,0.18)]">
          <div className="grid gap-3 sm:grid-cols-3">
            {(metrics.length
              ? metrics
              : [
                  { label: "Overall Score", value: isLoading ? "..." : "Ready", tone: "cyan" as const },
                  { label: "Recruiter Readiness", value: "Evidence", tone: "emerald" as const },
                  { label: "Production Projects", value: "Scan", tone: "purple" as const },
                  { label: "Public Repos", value: "API", tone: "amber" as const },
                  { label: "Live Deployments", value: "Proof", tone: "cyan" as const },
                  { label: "Languages Used", value: "Stack", tone: "purple" as const },
                ]).map((metric) => (
              <div
                key={metric.label}
                className="rounded-xl border border-white/[0.08] bg-[linear-gradient(135deg,rgba(255,255,255,0.045),rgba(139,92,246,0.035))] px-3 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)]"
              >
                <p className="text-[0.66rem] font-semibold uppercase tracking-wide text-zinc-500">
                  {metric.label}
                </p>
                <p
                  className={`mt-1 text-lg font-semibold ${
                    metric.tone === "emerald"
                      ? "text-emerald-100"
                      : metric.tone === "purple"
                        ? "text-purple-100"
                        : metric.tone === "amber"
                          ? "text-amber-100"
                          : "text-cyan-100"
                  }`}
                >
                  {metric.value}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-3 rounded-xl border border-cyan-300/22 bg-[linear-gradient(135deg,rgba(0,229,255,0.1),rgba(59,130,246,0.06)_52%,rgba(139,92,246,0.08))] px-3 py-2.5 shadow-[0_0_22px_rgba(0,229,255,0.055)]">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-cyan-100">
              <SparklineIcon />
              AI recruiter summary
            </div>
            <p className="mt-2 text-xs leading-5 text-zinc-300 sm:text-sm">
              {summary ?? "Run an analysis to generate a compact recruiter-facing summary from public repository evidence."}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function GitHubScoreCard({ metric }: { metric: GitHubScoreMetric }) {
  const Icon = metric.icon;
  const tone =
    metric.tone === "emerald"
      ? "border-emerald-300/20 bg-emerald-300/10 text-emerald-100"
      : metric.tone === "purple"
        ? "border-purple-300/20 bg-purple-300/10 text-purple-100"
        : metric.tone === "amber"
          ? "border-amber-300/20 bg-amber-300/10 text-amber-100"
          : "border-cyan-300/20 bg-cyan-300/10 text-cyan-100";

  return (
    <article className="rounded-[1.45rem] border border-white/[0.07] bg-white/[0.035] p-4 shadow-[0_0_14px_rgba(0,229,255,0.032)] transition duration-300 hover:-translate-y-0.5 hover:border-cyan-300/16 hover:bg-white/[0.048]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            {metric.label}
          </p>
          <p className="mt-2 text-3xl font-semibold text-white">{metric.value}</p>
        </div>
        <span className={`grid h-11 w-11 place-items-center rounded-2xl border ${tone}`}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <div className={`mt-4 h-1.5 ${forge.progressTrack}`}>
        <div className={forge.progressFill} style={{ width: `${metric.value}%` }} />
      </div>
      <p className="mt-3 text-xs leading-5 text-zinc-500">{metric.description}</p>
    </article>
  );
}

export function RepositoryCard({ repo }: { repo: GitHubRepositoryView }) {
  const updated = new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(repo.updatedAt));

  return (
    <article className="flex min-h-full flex-col rounded-[1.5rem] border border-white/[0.07] bg-[#101827]/56 p-4 shadow-[0_0_14px_rgba(0,229,255,0.032)] transition duration-300 hover:-translate-y-0.5 hover:border-cyan-300/16 hover:bg-white/[0.048]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-cyan-300/18 bg-[#00E5FF]/10 text-cyan-100">
            <GitBranch className="h-4 w-4" />
          </span>
          <div className="min-w-0">
          <a
            href={repo.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-base font-semibold text-white hover:text-cyan-100"
          >
            {repo.name}
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
          <p className="mt-1 line-clamp-2 text-xs leading-5 text-zinc-400">
            {repo.aiSummary}
          </p>
          </div>
        </div>
        <div className="text-right">
          <span className="block rounded-full border border-[#00E5FF]/18 bg-[#00E5FF]/8 px-3 py-1 text-sm font-semibold text-cyan-100">
            {repo.score}
          </span>
          <span className="mt-1 block text-xs font-medium text-zinc-500">{repo.recruiterGrade}</span>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-1.5">
        <span
          className={`rounded-full border px-2.5 py-1 text-xs ${
            repo.weight === "High"
              ? "border-emerald-300/18 bg-emerald-300/8 text-emerald-100"
              : repo.weight === "Medium"
                ? "border-cyan-300/18 bg-cyan-300/8 text-cyan-100"
                : repo.weight === "Low"
                  ? "border-amber-300/18 bg-amber-300/8 text-amber-100"
                  : "border-white/10 bg-white/[0.04] text-zinc-500"
          }`}
        >
          {repo.productionStatus}
        </span>
        {repo.language ? (
          <span className="rounded-full border border-purple-300/18 bg-purple-300/8 px-2.5 py-1 text-xs text-purple-100">
            {repo.language}
          </span>
        ) : null}
        <SignalBadge active={repo.signals.architecture} label="Architecture" />
        <SignalBadge active={repo.signals.deployment} label="Deployment" />
        <SignalBadge active={repo.signals.testing} label="Testing" />
        <SignalBadge active={repo.signals.readme} label="README" />
      </div>
      {repo.technologies.length ? (
        <div className="mt-3 flex flex-wrap gap-1.5" aria-label={`${repo.name} technology stack`}>
          {repo.technologies.slice(0, 6).map((technology) => (
            <span
              key={technology}
              className="rounded-full border border-white/10 bg-white/[0.035] px-2 py-0.5 text-[0.68rem] text-zinc-300"
            >
              {technology}
            </span>
          ))}
        </div>
      ) : null}
      {repo.quality.length ? (
        <div className="mt-4 grid grid-cols-2 gap-2">
          {repo.quality.slice(0, 4).map((item) => (
            <div key={item.label}>
              <div className="flex items-center justify-between gap-3 text-xs">
                <span className="text-zinc-500">{item.label}</span>
                <span className="font-medium text-zinc-300">{item.value}</span>
              </div>
              <div className={`mt-1.5 h-1.5 ${forge.progressTrack}`}>
                <div className={forge.progressFill} style={{ width: `${item.value}%` }} />
              </div>
            </div>
          ))}
        </div>
      ) : null}
      <div className="mt-auto pt-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.08] pt-3 text-xs text-zinc-500">
          <span>Updated {updated}</span>
          <span className="inline-flex items-center gap-1">
            <Star className="h-3 w-3" />
            {repo.stars}
            <GitFork className="ml-1 h-3 w-3" />
            {repo.forks}
          </span>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Button asChild variant="outline" className="h-9 rounded-xl border-white/10 bg-white/[0.04] text-xs text-zinc-200 hover:bg-white/[0.08]">
            <a href={repo.url} target="_blank" rel="noreferrer">
              GitHub
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </Button>
          <Button
            asChild={Boolean(repo.liveDemoUrl)}
            disabled={!repo.liveDemoUrl}
            variant="outline"
            className="h-9 rounded-xl border-cyan-300/18 bg-[#00E5FF]/8 text-xs text-cyan-100 hover:bg-[#00E5FF]/12 disabled:opacity-45"
          >
            {repo.liveDemoUrl ? (
              <a href={repo.liveDemoUrl} target="_blank" rel="noreferrer">
                Live demo
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            ) : (
              <span>Live demo</span>
            )}
          </Button>
        </div>
      </div>
    </article>
  );
}

function SignalBadge({ active, label }: { active: boolean; label: string }) {
  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-xs ${
        active
          ? "border-emerald-300/18 bg-emerald-300/8 text-emerald-100"
          : "border-white/10 bg-white/[0.035] text-zinc-500"
      }`}
    >
      {label}
    </span>
  );
}

function SparklineIcon() {
  return <RadioTower className="h-3.5 w-3.5" />;
}

function GitHubMark({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
    >
      <path d="M12 2C6.48 2 2 6.59 2 12.26c0 4.51 2.87 8.34 6.84 9.69.5.1.68-.22.68-.49 0-.24-.01-.88-.01-1.73-2.78.62-3.37-1.38-3.37-1.38-.45-1.18-1.1-1.5-1.1-1.5-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05A9.36 9.36 0 0 1 12 6.93c.85 0 1.7.12 2.5.35 1.91-1.33 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.81-4.57 5.07.36.32.68.95.68 1.92 0 1.38-.01 2.49-.01 2.83 0 .27.18.59.69.49A10.12 10.12 0 0 0 22 12.26C22 6.59 17.52 2 12 2Z" />
    </svg>
  );
}

export function LanguageChart({
  languages,
}: {
  languages: Array<{ language: string; bytes: number; percent: number }>;
}) {
  return (
    <div className="rounded-[1.5rem] border border-white/[0.08] bg-white/[0.04] p-5 shadow-[0_0_26px_rgba(0,229,255,0.06)]">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-white">Language mix</p>
        <Code2 className="h-4 w-4 text-cyan-100" />
      </div>
      <div className="mt-5 space-y-3">
        {(languages.length ? languages : [{ language: "No language data", bytes: 1, percent: 0 }]).map((item) => (
          <div key={item.language}>
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="text-zinc-300">{item.language}</span>
              <span className="text-zinc-500">{item.percent}%</span>
            </div>
            <div className={`mt-2 h-2 ${forge.progressTrack}`}>
              <div className={forge.progressFill} style={{ width: `${item.percent}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TechStackChart({
  technologies,
}: {
  technologies: Array<{ technology: string; count: number; percent: number }>;
}) {
  return (
    <div className="rounded-[1.5rem] border border-white/[0.08] bg-white/[0.04] p-5 shadow-[0_0_26px_rgba(0,229,255,0.06)]">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-white">Verified tech stack</p>
        <Target className="h-4 w-4 text-cyan-100" />
      </div>
      <div className="mt-5 space-y-3">
        {(technologies.length ? technologies : [{ technology: "No stack evidence", count: 0, percent: 0 }]).map((item) => (
          <div key={item.technology}>
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="text-zinc-300">{item.technology}</span>
              <span className="text-zinc-500">{item.count} repo{item.count === 1 ? "" : "s"}</span>
            </div>
            <div className={`mt-2 h-2 ${forge.progressTrack}`}>
              <div className={forge.progressFill} style={{ width: `${item.percent}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function LanguageDonut({
  languages,
}: {
  languages: Array<{ language: string; bytes: number; percent: number }>;
}) {
  const palette = ["#00E5FF", "#8B5CF6", "#34D399", "#F59E0B", "#A78BFA"];
  const summary = languages.length
    ? languages
        .slice(0, 5)
        .map((item) => `${item.language} ${item.percent}%`)
        .join(", ")
    : "No language data available.";
  const segmentState = languages.slice(0, 5).reduce(
    (state, language, index) => {
      const start = state.cursor;
      const nextCursor = state.cursor + Math.max(language.percent, 2);
      return {
        cursor: nextCursor,
        segments: [
          ...state.segments,
          `${palette[index % palette.length]} ${start}% ${nextCursor}%`,
        ],
      };
    },
    { cursor: 0, segments: [] as string[] }
  );
  const segments = segmentState.segments;
  const cursor = segmentState.cursor;
  const background = segments.length
    ? `conic-gradient(${segments.join(", ")}, rgba(255,255,255,0.08) ${cursor}% 100%)`
    : "conic-gradient(rgba(255,255,255,0.08) 0% 100%)";

  return (
    <div className="rounded-[1.5rem] border border-white/[0.08] bg-white/[0.04] p-5 shadow-[0_0_26px_rgba(0,229,255,0.06)]">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-white">Language donut</p>
        <Code2 className="h-4 w-4 text-cyan-100" />
      </div>
      <div className="mt-5 flex items-center gap-5">
        <div
          className="grid h-32 w-32 shrink-0 place-items-center rounded-full"
          style={{ background }}
          role="img"
          aria-label={`Language distribution donut. ${summary}`}
        >
          <div className="grid h-20 w-20 place-items-center rounded-full border border-white/[0.08] bg-[#101827] text-center">
            <span className="text-xl font-semibold text-white">{languages.length}</span>
            <span className="-mt-4 text-[0.65rem] uppercase tracking-wide text-zinc-500">langs</span>
          </div>
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          {(languages.length ? languages.slice(0, 5) : [{ language: "No language data", bytes: 1, percent: 0 }]).map((item, index) => (
            <div key={item.language} className="flex items-center justify-between gap-3 text-sm">
              <span className="flex min-w-0 items-center gap-2 text-zinc-300">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: palette[index % palette.length] }}
                />
                <span className="truncate">{item.language}</span>
              </span>
              <span className="text-zinc-500">{item.percent}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function RadarChart({
  title,
  items,
}: {
  title: string;
  items: Array<{ label: string; value: number }>;
}) {
  return (
    <div className="rounded-[1.5rem] border border-white/[0.08] bg-white/[0.04] p-5 shadow-[0_0_26px_rgba(0,229,255,0.06)]">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-white">{title}</p>
        <Target className="h-4 w-4 text-cyan-100" />
      </div>
      <div className="mt-5 grid gap-3">
        {items.map((item) => (
          <div key={item.label}>
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="text-zinc-300">{item.label}</span>
              <span className="text-zinc-500">{item.value}</span>
            </div>
            <div className={`mt-2 h-2 ${forge.progressTrack}`}>
              <div className={forge.progressFill} style={{ width: `${item.value}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function RepositoryQualityComparison({
  repos,
}: {
  repos: GitHubRepositoryView[];
}) {
  return (
    <div className="rounded-[1.5rem] border border-white/[0.08] bg-white/[0.04] p-5 shadow-[0_0_26px_rgba(0,229,255,0.06)]">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-white">Repository quality</p>
        <GitBranch className="h-4 w-4 text-cyan-100" />
      </div>
      <div className="mt-5 space-y-4">
        {repos.slice(0, 5).map((repo) => (
          <div key={repo.url}>
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="truncate text-zinc-300">{repo.name}</span>
              <span className="text-zinc-500">{repo.score}</span>
            </div>
            <div className={`mt-2 h-2 ${forge.progressTrack}`}>
              <div className={forge.progressFill} style={{ width: `${repo.score}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ActivityTimeline({
  items,
}: {
  items: Array<{ label: string; detail: string; tone: "cyan" | "purple" | "emerald" | "amber" }>;
}) {
  const toneClass = {
    cyan: "bg-cyan-300",
    purple: "bg-purple-300",
    emerald: "bg-emerald-300",
    amber: "bg-amber-300",
  };

  return (
    <div className="rounded-[1.5rem] border border-white/[0.08] bg-white/[0.04] p-5 shadow-[0_0_26px_rgba(0,229,255,0.06)]">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-white">GitHub activity timeline</p>
        <RadioTower className="h-4 w-4 text-cyan-100" />
      </div>
      <div className="mt-5 space-y-4">
        {items.map((item) => (
          <div key={item.label} className="flex gap-3">
            <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${toneClass[item.tone]}`} />
            <div>
              <p className="text-sm font-medium text-zinc-200">{item.label}</p>
              <p className="mt-0.5 text-xs leading-5 text-zinc-500">{item.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TopProjectsTable({ repos }: { repos: GitHubRepositoryView[] }) {
  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-white/[0.08] bg-[#101827]/58">
      <div className="grid grid-cols-[1.2fr_0.45fr_0.55fr_0.9fr] gap-3 border-b border-white/[0.08] px-4 py-3 text-[0.68rem] font-semibold uppercase tracking-wide text-zinc-500">
        <span>Project</span>
        <span>Score</span>
        <span>Grade</span>
        <span>Recruiter value</span>
      </div>
      {repos.slice(0, 6).map((repo) => (
        <div
          key={repo.url}
          className="grid grid-cols-[1.2fr_0.45fr_0.55fr_0.9fr] gap-3 border-b border-white/[0.06] px-4 py-3 text-sm last:border-b-0"
        >
          <span className="min-w-0">
            <span className="block truncate font-medium text-white">{repo.name}</span>
            <span className="mt-1 block truncate text-xs text-zinc-500">{repo.technologies.slice(0, 4).join(" · ") || "Stack evidence limited"}</span>
          </span>
          <span className="font-semibold text-cyan-100">{repo.score}</span>
          <span className="text-zinc-300">{repo.recruiterGrade}</span>
          <span className="text-xs leading-5 text-zinc-400">{repo.productionStatus}</span>
        </div>
      ))}
    </div>
  );
}

export function GitHubRecommendationCard({ recommendation }: { recommendation: GitHubRecommendation }) {
  const tone =
    recommendation.priority === "High"
      ? "border-red-300/20 bg-red-300/10 text-red-100"
      : recommendation.priority === "Medium"
        ? "border-amber-300/20 bg-amber-300/10 text-amber-100"
        : "border-cyan-300/20 bg-cyan-300/10 text-cyan-100";

  return (
    <article className="rounded-[1.4rem] border border-white/[0.08] bg-white/[0.04] p-4">
      <div className="flex flex-wrap gap-2">
        <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${tone}`}>
          {recommendation.priority}
        </span>
        <span className="rounded-full border border-[#00E5FF]/18 bg-[#00E5FF]/8 px-2.5 py-1 text-xs text-cyan-100">
          {recommendation.impact}
        </span>
      </div>
      <h3 className="mt-3 text-base font-semibold text-white">{recommendation.title}</h3>
      <p className="mt-2 text-sm leading-6 text-zinc-400">{recommendation.reason}</p>
    </article>
  );
}

export function GitHubInsightCard({
  title,
  items,
  icon: Icon = Target,
}: {
  title: string;
  items: string[];
  icon?: LucideIcon;
}) {
  return (
    <div className="rounded-[1.4rem] border border-white/[0.08] bg-[#101827]/58 p-4">
      <p className="flex items-center gap-2 text-sm font-semibold text-zinc-100">
        <Icon className="h-4 w-4 text-cyan-100" />
        {title}
      </p>
      <ul className="mt-3 space-y-2 text-sm leading-6 text-zinc-400">
        {(items.length ? items : ["No issues detected."]).map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export function GitHubSection({
  title,
  description,
  children,
  action,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className="rounded-[1.75rem] border border-white/[0.07] bg-white/[0.035] p-5 shadow-[0_0_18px_rgba(0,229,255,0.04)] backdrop-blur-2xl">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-cyan-100">
            GitHub Analyzer
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-white">{title}</h2>
          {description ? (
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">{description}</p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {children}
    </section>
  );
}

export function AnalyzerEmptyState({
  title,
  description,
  details,
  action,
  statusRole,
}: {
  title: string;
  description: string;
  details?: string[];
  action?: ReactNode;
  statusRole?: "status" | "alert";
}) {
  const featureIcons = [ShieldCheck, Target, BarChart3, SearchCheck];

  return (
    <div
      role={statusRole}
      aria-live={statusRole ? "polite" : undefined}
      className="relative overflow-hidden rounded-[1.1rem] border border-cyan-300/22 bg-[radial-gradient(circle_at_50%_22%,rgba(0,148,255,0.34),transparent_23%),radial-gradient(circle_at_44%_29%,rgba(163,73,255,0.32),transparent_28%),radial-gradient(circle_at_6%_0%,rgba(0,229,255,0.16),transparent_35%),radial-gradient(circle_at_92%_5%,rgba(117,35,255,0.28),transparent_40%),linear-gradient(135deg,#030613_0%,#050716_42%,#100021_100%)] px-5 py-7 text-center shadow-[0_0_30px_rgba(0,229,255,0.08),inset_0_0_58px_rgba(139,92,246,0.06)] sm:px-8"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-35"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(135,217,255,0.28) 0 1px, transparent 1.7px)",
          backgroundSize: "30px 30px",
        }}
      />
      <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-cyan-300/75 via-blue-400/35 to-purple-400/75" />
      <div className="pointer-events-none absolute left-1/2 top-10 h-60 w-[44rem] -translate-x-1/2 rounded-full bg-[#00E5FF]/18 blur-3xl" />
      <div className="pointer-events-none absolute left-[42%] top-12 h-60 w-[34rem] -translate-x-1/2 rounded-full bg-[#8B5CF6]/18 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-8 h-80 w-80 rounded-full bg-[#8B5CF6]/16 blur-3xl" />
      <div className="relative mx-auto h-[20rem] max-w-4xl [perspective:900px]">
        <div className="absolute left-1/2 top-[8.7rem] h-28 w-[34rem] -translate-x-1/2 rounded-full border border-cyan-300/24 bg-[radial-gradient(ellipse_at_center,rgba(0,229,255,0.34),rgba(139,92,246,0.22)_42%,transparent_72%)] shadow-[0_0_52px_rgba(0,229,255,0.28)]" />
        <div className="absolute left-[47%] top-[9.1rem] h-20 w-[28rem] -translate-x-1/2 rounded-full border border-purple-400/35 shadow-[0_0_22px_rgba(139,92,246,0.32)] [transform:rotateX(64deg)]" />
        <div className="absolute left-[54%] top-[9.75rem] h-14 w-[23rem] -translate-x-1/2 rounded-full border border-cyan-300/32 shadow-[0_0_22px_rgba(0,229,255,0.26)] [transform:rotateX(64deg)]" />
        <div className="absolute left-1/2 top-[3.75rem] h-36 w-56 -translate-x-[58%] rounded-[1.35rem] border border-cyan-200/38 bg-[linear-gradient(135deg,rgba(255,255,255,0.22),rgba(94,153,255,0.13)_45%,rgba(139,92,246,0.18))] shadow-[0_0_44px_rgba(139,92,246,0.32),inset_0_1px_0_rgba(255,255,255,0.22)] backdrop-blur-md [transform:rotateX(8deg)_rotateY(-19deg)_rotateZ(-2deg)]" />
        <div className="absolute left-1/2 top-[4.85rem] grid h-36 w-64 -translate-x-1/2 place-items-center rounded-[1.35rem] border border-cyan-100/48 bg-[linear-gradient(135deg,rgba(255,255,255,0.22),rgba(26,50,91,0.66)_40%,rgba(0,153,255,0.15))] shadow-[0_0_46px_rgba(0,229,255,0.28),inset_0_1px_0_rgba(255,255,255,0.22),inset_0_-22px_38px_rgba(139,92,246,0.14)] backdrop-blur-md [transform:rotateX(8deg)_rotateY(-12deg)_rotateZ(1deg)]">
          <span className="absolute left-5 top-5 h-1.5 w-1.5 rounded-full bg-white/85 shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
          <span className="absolute left-9 top-6 h-1 w-1 rounded-full bg-white/65" />
          <span className="grid h-20 w-20 place-items-center rounded-full bg-[linear-gradient(180deg,#ffffff,#d7e6ff)] text-[#101827] shadow-[0_0_28px_rgba(255,255,255,0.2)]">
            <GitHubMark className="h-14 w-14" />
          </span>
        </div>
        <div className="absolute left-[18%] top-[5.7rem] grid h-20 w-20 place-items-center rounded-[1.35rem] border border-emerald-300/28 bg-emerald-300/14 text-emerald-100 shadow-[0_0_30px_rgba(52,211,153,0.28)] backdrop-blur-md">
          <SearchCheck className="h-9 w-9" />
        </div>
        <div className="absolute right-[18%] top-[5.9rem] grid h-20 w-20 place-items-center rounded-[1.35rem] border border-cyan-300/30 bg-cyan-300/14 text-cyan-100 shadow-[0_0_30px_rgba(0,229,255,0.28)] backdrop-blur-md">
          <Code2 className="h-9 w-9" />
        </div>
        <div className="absolute left-[19%] top-[13.2rem] grid h-16 w-16 place-items-center rounded-[1.2rem] border border-purple-300/30 bg-purple-300/16 text-purple-100 shadow-[0_0_30px_rgba(139,92,246,0.3)] backdrop-blur-md">
          <BarChart3 className="h-8 w-8" />
        </div>
      </div>
      <h3 className="bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-400 bg-clip-text text-3xl font-semibold tracking-tight text-transparent drop-shadow-[0_0_22px_rgba(59,130,246,0.28)]">{title}</h3>
      <p className="mx-auto mt-3 max-w-3xl text-base leading-7 text-zinc-300">
        {description}
      </p>
      {details?.length ? (
        <div className="mx-auto mt-6 grid max-w-5xl gap-3 text-left sm:grid-cols-2 xl:grid-cols-4">
          {details.map((detail, index) => {
            const Icon = featureIcons[index % featureIcons.length] ?? BookOpen;
            const [detailTitle, detailBody] = detail.split("|");

            return (
              <span
                key={detail}
                className="flex min-h-[4.4rem] items-center gap-3 rounded-xl border border-cyan-300/16 bg-[linear-gradient(135deg,rgba(8,14,31,0.82),rgba(17,12,37,0.72))] px-4 py-3 text-xs leading-5 text-zinc-300 shadow-[0_0_18px_rgba(0,229,255,0.045)]"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-cyan-300/18 bg-cyan-300/10 text-cyan-100 shadow-[0_0_14px_rgba(0,229,255,0.12)]">
                  <Icon className="h-4 w-4" />
                </span>
                <span>
                  <span className="block font-semibold text-zinc-100">{detailTitle}</span>
                  {detailBody ? <span className="mt-1 block text-zinc-400">{detailBody}</span> : null}
                </span>
              </span>
            );
          })}
        </div>
      ) : null}
      {action ? (
        <div className="mt-5 flex justify-center">
          {action}
        </div>
      ) : null}
    </div>
  );
}

export function ExternalProfileButton({ href }: { href: string }) {
  return (
    <Button asChild variant="outline" className={forge.secondaryButton}>
      <a href={href} target="_blank" rel="noreferrer">
        Open GitHub
        <ArrowRight className="h-4 w-4" />
      </a>
    </Button>
  );
}
