"use client";

import type { ReactNode } from "react";
import {
  ArrowRight,
  Award,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Circle,
  Clock,
  Compass,
  Flame,
  GraduationCap,
  Lightbulb,
  Target,
  TrendingUp,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

export type ReadinessCategory = {
  label: string;
  value: number | null;
  description: string;
  icon: LucideIcon;
};

export type RoadmapWeek = {
  id: string;
  title: string;
  focus: string;
  items: string[];
};

export type CoachRecommendation = {
  id: string;
  title: string;
  priority: "High" | "Medium" | "Low";
  reason: string;
  impact: string;
  difficulty: "Easy" | "Medium" | "Hard";
};

export type LearningTopic = {
  title: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  hours: number;
  priority: "High" | "Medium" | "Low";
};

export type CoachTimelineEvent = {
  id: string;
  title: string;
  detail: string;
  time: string;
  active: boolean;
};

export type Achievement = {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
};

export function CareerHero({
  goal,
  readiness,
  timeline,
  nextMilestone,
  recommendation,
  recentProgress,
  targetCompany,
  onRefresh,
  goalControl,
}: {
  goal: string;
  readiness: number;
  timeline: string;
  nextMilestone: string;
  recommendation: string;
  recentProgress: string;
  targetCompany: string;
  onRefresh: () => void;
  goalControl: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-white/[0.07] bg-[linear-gradient(135deg,rgba(0,229,255,0.08),rgba(106,92,255,0.06)_48%,rgba(139,92,246,0.075))] p-5 shadow-[0_0_20px_rgba(0,229,255,0.045),0_0_30px_rgba(106,92,255,0.04)] backdrop-blur-2xl sm:p-7">
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#00E5FF]/8 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 left-1/2 h-64 w-64 rounded-full bg-[#8B5CF6]/8 blur-3xl" />
      <div className="relative grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-center">
        <div className="max-w-4xl">
          <p className="inline-flex rounded-full border border-[#00E5FF]/18 bg-[#00E5FF]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cyan-100">
            AI Career Coach
          </p>
          <h1 className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Your career operating system.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-300 sm:text-base">
            You are targeting <span className="text-cyan-100">{goal}</span>. TalentForge combines resume, ATS, JD match, interview, skills, projects, experience, and version history into one weekly execution plan.
          </p>
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            <HeroFact label="Target Company" value={targetCompany} />
            <HeroFact label="Timeline" value={timeline} />
            <HeroFact label="Recent Progress" value={recentProgress} />
          </div>
          <div className="mt-5 rounded-[1.4rem] border border-white/[0.08] bg-[#101827]/58 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              AI Recommendation
            </p>
            <p className="mt-2 text-sm leading-6 text-zinc-300">{recommendation}</p>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button
              type="button"
              onClick={onRefresh}
              className="rounded-2xl bg-gradient-to-r from-[#00E5FF] via-[#6A5CFF] to-[#8B5CF6] text-white shadow-[0_0_18px_rgba(0,229,255,0.16)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_26px_rgba(0,229,255,0.22)]"
            >
              Refresh Operating Plan
            </Button>
            <a
              href="#weekly-roadmap"
              className="inline-flex h-10 items-center gap-2 rounded-2xl border border-white/12 bg-white/[0.035] px-4 text-sm font-medium text-white shadow-[0_0_12px_rgba(0,229,255,0.035)] transition duration-300 hover:-translate-y-0.5 hover:border-[#00E5FF]/20 hover:bg-[#00E5FF]/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00E5FF]/20"
            >
              View Roadmap
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-[1.7rem] border border-cyan-300/12 bg-[#101827]/64 p-5 shadow-[0_0_16px_rgba(0,229,255,0.045)]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-cyan-100">
                  Career Readiness
                </p>
                <p className="mt-2 text-5xl font-semibold tracking-tight text-white">
                  {readiness}%
                </p>
              </div>
              <ReadinessRing value={readiness} size="lg" />
            </div>
            <p className="mt-4 text-sm leading-6 text-zinc-400">
              Next milestone: <span className="text-zinc-100">{nextMilestone}</span>
            </p>
          </div>
          {goalControl}
        </div>
      </div>
    </section>
  );
}

function HeroFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.25rem] border border-white/[0.08] bg-white/[0.035] p-3">
      <p className="text-[0.68rem] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-2 truncate text-sm font-semibold text-zinc-100">{value}</p>
    </div>
  );
}

export function ReadinessCard({ category }: { category: ReadinessCategory }) {
  const Icon = category.icon;
  const value = category.value ?? 0;

  return (
    <article className="group rounded-[1.55rem] border border-white/[0.07] bg-white/[0.035] p-4 shadow-[0_0_14px_rgba(0,229,255,0.032)] backdrop-blur-2xl transition duration-300 hover:-translate-y-0.5 hover:border-cyan-300/16">
      <div className="flex items-start justify-between gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-2xl border border-cyan-300/16 bg-[#00E5FF]/8 text-cyan-100">
          <Icon className="h-4 w-4" />
        </span>
        <ReadinessRing value={value} />
      </div>
      <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
        {category.label}
      </p>
      <p className="mt-2 text-2xl font-semibold text-white">
        {category.value === null ? "--" : `${category.value}%`}
      </p>
      <p className="mt-2 text-xs leading-5 text-zinc-500">{category.description}</p>
    </article>
  );
}

export function RoadmapCard({
  week,
  checked,
  onToggle,
}: {
  week: RoadmapWeek;
  checked: Record<string, boolean>;
  onToggle: (id: string) => void;
}) {
  return (
    <article className="rounded-[1.65rem] border border-white/[0.08] bg-[#101827]/58 p-5 shadow-[0_0_28px_rgba(0,229,255,0.07)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-cyan-100">
            {week.title}
          </p>
          <h3 className="mt-2 text-lg font-semibold text-white">{week.focus}</h3>
        </div>
        <CalendarDays className="h-5 w-5 text-purple-100" />
      </div>
      <div className="mt-4 space-y-2">
        {week.items.map((item, index) => {
          const id = `${week.id}-${index}`;
          const isChecked = checked[id] ?? false;

          return (
            <button
              key={id}
              type="button"
              onClick={() => onToggle(id)}
              className="flex w-full items-start gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.035] px-3 py-2.5 text-left text-sm text-zinc-300 transition duration-300 hover:border-cyan-300/18 hover:bg-[#00E5FF]/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00E5FF]/30"
              aria-pressed={isChecked}
            >
              {isChecked ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-200" />
              ) : (
                <Circle className="mt-0.5 h-4 w-4 shrink-0 text-slate-600" />
              )}
              <span className={isChecked ? "text-zinc-500 line-through" : undefined}>
                {item}
              </span>
            </button>
          );
        })}
      </div>
    </article>
  );
}

export function RecommendationCard({ item }: { item: CoachRecommendation }) {
  return (
    <article className="rounded-[1.55rem] border border-white/[0.08] bg-white/[0.04] p-4 shadow-[0_0_26px_rgba(0,229,255,0.07)]">
      <div className="flex flex-wrap gap-2">
        <PriorityPill priority={item.priority} />
        <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs font-medium text-zinc-400">
          {item.difficulty}
        </span>
        <span className="rounded-full border border-[#00E5FF]/18 bg-[#00E5FF]/8 px-2.5 py-1 text-xs font-medium text-cyan-100">
          {item.impact}
        </span>
      </div>
      <h3 className="mt-3 text-base font-semibold text-white">{item.title}</h3>
      <p className="mt-2 text-sm leading-6 text-zinc-400">{item.reason}</p>
    </article>
  );
}

export function AchievementBadge({ achievement }: { achievement: Achievement }) {
  return (
    <div
      className={`rounded-[1.35rem] border p-4 transition duration-300 ${
        achievement.unlocked
          ? "border-emerald-300/18 bg-emerald-300/8 text-emerald-100 shadow-[0_0_24px_rgba(52,211,153,0.08)]"
          : "border-white/[0.08] bg-white/[0.035] text-zinc-500"
      }`}
    >
      <Award className="h-5 w-5" />
      <p className="mt-3 text-sm font-semibold">{achievement.title}</p>
      <p className="mt-1 text-xs leading-5 opacity-75">{achievement.description}</p>
    </div>
  );
}

export function TimelineCard({ event }: { event: CoachTimelineEvent }) {
  return (
    <div className="relative pl-8">
      <span className="absolute left-[7px] top-6 h-full w-px bg-white/10" />
      <span
        className={`absolute left-0 top-1 grid h-4 w-4 place-items-center rounded-full border ${
          event.active
            ? "border-[#00E5FF]/24 bg-[#00E5FF]/10 shadow-[0_0_12px_rgba(0,229,255,0.1)]"
            : "border-white/15 bg-white/[0.04]"
        }`}
      />
      <div className="rounded-[1.2rem] border border-white/[0.08] bg-[#101827]/50 p-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-zinc-100">{event.title}</p>
          <span className="text-xs text-zinc-600">{event.time}</span>
        </div>
        <p className="mt-1 text-xs leading-5 text-zinc-500">{event.detail}</p>
      </div>
    </div>
  );
}

export function ProgressChart({
  title,
  points,
  accent = "#00E5FF",
}: {
  title: string;
  points: number[];
  accent?: string;
}) {
  const normalizedPoints = points.length ? points : [0];
  const polyline = normalizedPoints
    .map((value, index) => {
      const x = (index / Math.max(1, normalizedPoints.length - 1)) * 180 + 8;
      const y = 88 - (Math.max(0, Math.min(100, value)) / 100) * 72;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="rounded-[1.35rem] border border-white/[0.08] bg-[#101827]/54 p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-white">{title}</p>
        <TrendingUp className="h-4 w-4 text-cyan-100" />
      </div>
      <svg
        className="mt-4 h-28 w-full"
        viewBox="0 0 196 100"
        role="img"
        aria-label={`${title} progress chart values: ${normalizedPoints.join(", ")}.`}
      >
        {[0, 1, 2].map((line) => (
          <line
            key={line}
            x1="0"
            x2="196"
            y1={22 + line * 26}
            y2={22 + line * 26}
            stroke="rgba(255,255,255,0.06)"
          />
        ))}
        <polyline
          points={polyline}
          fill="none"
          stroke={accent}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="4"
        />
      </svg>
    </div>
  );
}

export function LearningCard({ topic }: { topic: LearningTopic }) {
  return (
    <article className="rounded-[1.35rem] border border-white/[0.08] bg-[#101827]/54 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-white">{topic.title}</p>
          <p className="mt-1 text-xs text-zinc-500">{topic.difficulty}</p>
        </div>
        <GraduationCap className="h-5 w-5 text-purple-100" />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <PriorityPill priority={topic.priority} />
        <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs text-zinc-400">
          <Clock className="h-3 w-3" />
          {topic.hours}h
        </span>
      </div>
    </article>
  );
}

export function CoachSection({
  eyebrow,
  title,
  description,
  action,
  children,
  id,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  id?: string;
}) {
  return (
    <section
      id={id}
      className="rounded-[1.75rem] border border-white/[0.07] bg-white/[0.035] p-5 shadow-[0_0_18px_rgba(0,229,255,0.04)] backdrop-blur-2xl sm:p-6"
    >
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          {eyebrow ? (
            <p className="text-xs font-semibold uppercase tracking-wide text-cyan-100">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-white">{title}</h2>
          {description ? (
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
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

export function SourcePill({
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
          ? "border-emerald-300/20 bg-emerald-300/10 text-emerald-100"
          : "border-amber-300/20 bg-amber-300/10 text-amber-100"
      }`}
    >
      {available ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Flame className="h-3.5 w-3.5" />}
      {label}
    </span>
  );
}

export function ReadinessRing({
  value,
  size = "sm",
}: {
  value: number;
  size?: "sm" | "lg";
}) {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div
      className={`grid shrink-0 place-items-center rounded-full p-1 ${
        size === "lg" ? "h-24 w-24" : "h-14 w-14"
      }`}
      style={{
        background: `conic-gradient(#00E5FF ${clamped}%, rgba(255,255,255,0.1) 0)`,
      }}
      aria-label={`${clamped}% readiness`}
    >
      <div className="grid h-full w-full place-items-center rounded-full bg-[#070B16] text-center shadow-inner">
        <span className={size === "lg" ? "text-2xl font-semibold text-white" : "text-xs font-semibold text-white"}>
          {clamped}
        </span>
      </div>
    </div>
  );
}

function PriorityPill({ priority }: { priority: "High" | "Medium" | "Low" }) {
  const className =
    priority === "High"
      ? "border-red-300/20 bg-red-300/10 text-red-100"
      : priority === "Medium"
        ? "border-amber-300/20 bg-amber-300/10 text-amber-100"
        : "border-cyan-300/20 bg-cyan-300/10 text-cyan-100";

  return (
    <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${className}`}>
      {priority}
    </span>
  );
}

export const coachIcons = {
  BarChart3,
  Compass,
  Lightbulb,
  Target,
};
