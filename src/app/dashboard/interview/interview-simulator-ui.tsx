"use client";

import type { ReactNode } from "react";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock3,
  Gauge,
  Lightbulb,
  MessageSquareText,
  Play,
  RotateCcw,
  Sparkles,
  Target,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { forge } from "@/lib/talentforge-design";

export type SimulatorMode = {
  value: string;
  title: string;
  description: string;
  icon: LucideIcon;
  mappedMode: string;
};

export function InterviewModeCard({
  mode,
  selected,
  onSelect,
}: {
  mode: SimulatorMode;
  selected: boolean;
  onSelect: (value: string) => void;
}) {
  const Icon = mode.icon;

  return (
    <button
      type="button"
      onClick={() => onSelect(mode.value)}
      aria-pressed={selected}
      className={`group rounded-[1.45rem] border p-4 text-left transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00E5FF]/30 ${
        selected
          ? "border-cyan-300/35 bg-[#00E5FF]/12 shadow-[0_0_28px_rgba(0,229,255,0.14)]"
          : "border-white/[0.08] bg-[#070B1F]/62 hover:-translate-y-0.5 hover:border-cyan-300/22 hover:bg-[#00E5FF]/8"
      }`}
    >
      <span className="grid h-10 w-10 place-items-center rounded-2xl border border-cyan-300/16 bg-[#00E5FF]/8 text-cyan-100">
        <Icon className="h-4 w-4" />
      </span>
      <span className="mt-4 block text-sm font-semibold text-white">{mode.title}</span>
      <span className="mt-1 block text-xs leading-5 text-zinc-500">
        {mode.description}
      </span>
    </button>
  );
}

export function CompanySelector({
  companies,
  value,
  customValue,
  onChange,
  onCustomChange,
}: {
  companies: string[];
  value: string;
  customValue: string;
  onChange: (value: string) => void;
  onCustomChange: (value: string) => void;
}) {
  return (
    <div className={forge.metric}>
      <div className="flex items-center gap-2">
        <Building2 className="h-4 w-4 text-cyan-100" />
        <p className="text-xs font-semibold uppercase tracking-wide text-cyan-100">
          Company Style
        </p>
      </div>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`mt-3 ${forge.select}`}
        aria-label="Company style"
      >
        {companies.map((company) => (
          <option key={company} value={company}>
            {company}
          </option>
        ))}
      </select>
      {value === "Custom" ? (
        <input
          value={customValue}
          onChange={(event) => onCustomChange(event.target.value)}
          className="mt-3 h-11 w-full rounded-2xl border border-white/10 bg-[rgba(5,8,22,0.75)] px-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-[#00E5FF]/50 focus:ring-2 focus:ring-[#00E5FF]/20"
          placeholder="Enter company style"
          aria-label="Custom company style"
        />
      ) : null}
    </div>
  );
}

export function DifficultySelector({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className={forge.metric}>
      <div className="flex items-center gap-2">
        <Gauge className="h-4 w-4 text-purple-100" />
        <p className="text-xs font-semibold uppercase tracking-wide text-cyan-100">
          Difficulty
        </p>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            aria-pressed={value === option}
            className={`rounded-2xl border px-3 py-2 text-sm transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00E5FF]/30 ${
              value === option
                ? "border-purple-300/30 bg-purple-300/12 text-purple-100"
                : "border-white/10 bg-[#070B1F]/58 text-zinc-400 hover:border-cyan-300/20 hover:text-zinc-100"
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

export function InterviewSessionCard({
  eyebrow,
  title,
  badge,
  children,
}: {
  eyebrow: string;
  title: string;
  badge?: string;
  children: ReactNode;
}) {
  return (
    <section className={forge.cardStrong}>
      <div className="border-b border-white/10 bg-[#070B1F]/60 px-5 py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-cyan-100">
              {eyebrow}
            </p>
            <h2 className="mt-2 text-xl font-semibold leading-7 text-white">
              {title}
            </h2>
          </div>
          {badge ? (
            <span className="w-fit rounded-full border border-[#8B5CF6]/25 bg-[#8B5CF6]/12 px-3 py-1 text-xs text-purple-100">
              {badge}
            </span>
          ) : null}
        </div>
      </div>
      {children}
    </section>
  );
}

export function InterviewTimer({
  elapsedSeconds,
  running,
  onToggle,
  onReset,
}: {
  elapsedSeconds: number;
  running: boolean;
  onToggle: () => void;
  onReset: () => void;
}) {
  return (
    <div className="rounded-[1.35rem] border border-white/[0.08] bg-[#070B1F]/62 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-cyan-100">
            <Clock3 className="h-4 w-4" />
            Timer
          </p>
          <p className="mt-2 text-3xl font-semibold text-white">
            {formatTime(elapsedSeconds)}
          </p>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onToggle} className={forge.secondaryButton}>
            {running ? "Pause" : "Start"}
          </Button>
          <Button type="button" variant="outline" onClick={onReset} className={forge.secondaryButton}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function InterviewProgress({
  current,
  total,
  answered,
}: {
  current: number;
  total: number;
  answered: number;
}) {
  const progress = total ? Math.round((current / total) * 100) : 0;

  return (
    <div className="rounded-[1.35rem] border border-white/[0.08] bg-[#070B1F]/62 p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-cyan-100">
            Progress
          </p>
          <p className="mt-2 text-sm text-zinc-400">
            Question {current} of {total} · {answered} answered
          </p>
        </div>
        <span className="text-lg font-semibold text-white">{progress}%</span>
      </div>
      <div className={`mt-4 h-2 ${forge.progressTrack}`}>
        <div className={forge.progressFill} style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}

export function InterviewReportCard({
  title,
  value,
  helper,
  icon: Icon = Target,
}: {
  title: string;
  value: string;
  helper: string;
  icon?: LucideIcon;
}) {
  return (
    <article className="rounded-[1.45rem] border border-white/[0.08] bg-white/[0.04] p-4 shadow-[0_0_24px_rgba(0,229,255,0.07)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            {title}
          </p>
          <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
        </div>
        <span className="grid h-10 w-10 place-items-center rounded-2xl border border-cyan-300/16 bg-[#00E5FF]/8 text-cyan-100">
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-3 text-xs leading-5 text-zinc-500">{helper}</p>
    </article>
  );
}

export function FeedbackCard({
  title,
  items,
  tone = "default",
}: {
  title: string;
  items: string[];
  tone?: "default" | "good" | "warn";
}) {
  const titleTone =
    tone === "good"
      ? "text-emerald-200"
      : tone === "warn"
        ? "text-amber-200"
        : "text-zinc-100";

  return (
    <div className={forge.metric}>
      <p className={`text-sm font-semibold ${titleTone}`}>{title}</p>
      <ul className="mt-3 space-y-2 text-sm leading-6 text-zinc-400">
        {(items.length ? items : ["No items available yet."]).map((item) => (
          <li key={item} className="flex gap-2">
            <CheckCircle2 className="mt-1 h-3.5 w-3.5 shrink-0 text-cyan-100" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SessionActionButton({
  children,
  onClick,
  icon: Icon = Play,
}: {
  children: ReactNode;
  onClick: () => void;
  icon?: LucideIcon;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-zinc-300 transition duration-300 hover:border-cyan-300/25 hover:bg-[#00E5FF]/10 hover:text-cyan-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00E5FF]/30"
    >
      <Icon className="h-4 w-4" />
      {children}
    </button>
  );
}

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
}

export const simulatorIcons = {
  ArrowRight,
  Lightbulb,
  MessageSquareText,
  Sparkles,
};
