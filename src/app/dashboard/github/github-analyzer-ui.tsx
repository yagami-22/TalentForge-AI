"use client";

import type { ReactNode } from "react";
import {
  ArrowRight,
  BookOpen,
  Code2,
  ExternalLink,
  GitBranch,
  GitFork,
  RadioTower,
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
    <section className="relative overflow-hidden rounded-[2rem] border border-white/[0.08] bg-[linear-gradient(135deg,rgba(0,229,255,0.12),rgba(106,92,255,0.09)_48%,rgba(139,92,246,0.12))] p-5 shadow-[0_0_38px_rgba(0,229,255,0.11),0_0_54px_rgba(106,92,255,0.1)] backdrop-blur-2xl sm:p-6">
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#00E5FF]/14 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 left-20 h-64 w-64 rounded-full bg-[#8B5CF6]/14 blur-3xl" />
      <div className="relative grid gap-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(420px,1.05fr)] xl:items-center">
        <div>
          <p className={forge.badge}>GitHub Profile Analyzer</p>
          <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Repository intelligence for serious hiring signal.
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-300">
            Inspect public code, README depth, stack evidence, deployment, architecture, and resume alignment the way a technical recruiter would.
          </p>
          {children}
        </div>
        <div className="rounded-[1.7rem] border border-white/[0.08] bg-[#050816]/55 p-4 shadow-[inset_0_0_38px_rgba(0,229,255,0.06)]">
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
                className="rounded-2xl border border-white/[0.08] bg-white/[0.045] p-3"
              >
                <p className="text-[0.66rem] font-semibold uppercase tracking-wide text-zinc-500">
                  {metric.label}
                </p>
                <p
                  className={`mt-1 text-xl font-semibold ${
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
          <div className="mt-3 rounded-2xl border border-cyan-300/14 bg-[#00E5FF]/8 p-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-cyan-100">
              <SparklineIcon />
              AI recruiter summary
            </div>
            <p className="mt-2 text-sm leading-6 text-zinc-300">
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
    <article className="rounded-[1.45rem] border border-white/[0.08] bg-white/[0.045] p-4 shadow-[0_0_24px_rgba(0,229,255,0.06)] transition duration-300 hover:-translate-y-0.5 hover:border-cyan-300/18 hover:bg-white/[0.06]">
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
    <article className="flex min-h-full flex-col rounded-[1.5rem] border border-white/[0.08] bg-[#070B1F]/58 p-4 shadow-[0_0_24px_rgba(0,229,255,0.05)] transition duration-300 hover:-translate-y-0.5 hover:border-cyan-300/20 hover:bg-white/[0.055]">
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
          aria-label="Language distribution donut"
        >
          <div className="grid h-20 w-20 place-items-center rounded-full border border-white/[0.08] bg-[#070B1F] text-center">
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
    <div className="overflow-hidden rounded-[1.5rem] border border-white/[0.08] bg-[#070B1F]/58">
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
    <div className="rounded-[1.4rem] border border-white/[0.08] bg-[#070B1F]/58 p-4">
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
    <section className="rounded-[1.75rem] border border-white/[0.08] bg-white/[0.04] p-5 shadow-[0_0_30px_rgba(0,229,255,0.07)] backdrop-blur-2xl sm:p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
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
}: {
  title: string;
  description: string;
  details?: string[];
  action?: ReactNode;
}) {
  return (
    <div className="rounded-[1.5rem] border border-white/[0.08] bg-[#070B1F]/58 p-8 text-center">
      <BookOpen className="mx-auto h-8 w-8 text-cyan-100" />
      <h3 className="mt-4 text-lg font-semibold text-white">{title}</h3>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-zinc-400">
        {description}
      </p>
      {details?.length ? (
        <div className="mx-auto mt-5 grid max-w-2xl gap-2 text-left sm:grid-cols-2">
          {details.map((detail) => (
            <span
              key={detail}
              className="rounded-2xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs leading-5 text-zinc-300"
            >
              {detail}
            </span>
          ))}
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
