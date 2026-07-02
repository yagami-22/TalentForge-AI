"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  CheckCircle2,
  FileSearch,
  ShieldCheck,
  Sparkles,
  Target,
  Upload,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import type {
  RecruiterCandidateEvaluation,
  RecruiterRisk,
  RecruiterScore,
} from "@/lib/recruiter-mode";
import { forge } from "@/lib/talentforge-design";

export function RecruiterHero({
  title,
  description,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
}: {
  title: string;
  description: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}) {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-white/[0.07] bg-[linear-gradient(135deg,rgba(0,229,255,0.07),rgba(106,92,255,0.055)_48%,rgba(139,92,246,0.065))] p-6 shadow-[0_0_18px_rgba(0,229,255,0.04)] backdrop-blur-2xl sm:p-7">
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#00E5FF]/7 blur-3xl" />
      <div className="relative grid gap-5 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-center">
        <div>
          <p className={forge.badge}>AI Recruiter Mode</p>
          <h1 className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            {title}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-300 sm:text-base">
            {description}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild className={forge.primaryButton}>
              <Link href={primaryHref}>
                <Upload className="h-4 w-4" />
                {primaryLabel}
              </Link>
            </Button>
            {secondaryHref && secondaryLabel ? (
              <Button asChild variant="outline" className={forge.secondaryButton}>
                <Link href={secondaryHref}>
                  {secondaryLabel}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            ) : null}
          </div>
        </div>
        <div className="hidden lg:block">
          <div className="relative ml-auto h-52 w-52">
            <div className="absolute inset-4 rounded-full border border-cyan-300/18 bg-[#101827]/62" />
            <div className="absolute inset-16 rounded-[1.5rem] border border-purple-300/18 bg-white/[0.04]" />
            <Users className="absolute left-1/2 top-1/2 h-9 w-9 -translate-x-1/2 -translate-y-1/2 text-cyan-100" />
          </div>
        </div>
      </div>
    </section>
  );
}

export function HiringScoreCard({ score }: { score: RecruiterScore }) {
  const hasNumericScore = score.score !== null;
  const displayScore = hasNumericScore ? score.score : "Not Provided";

  return (
    <article className="rounded-[1.45rem] border border-white/[0.07] bg-white/[0.035] p-4 shadow-[0_0_14px_rgba(0,229,255,0.032)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            {score.label}
          </p>
          <p className={`mt-2 font-semibold text-white ${hasNumericScore ? "text-3xl" : "text-lg"}`}>
            {displayScore}
          </p>
          {score.includedInOverall === false ? (
            <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-cyan-100/70">
              Not counted in overall
            </p>
          ) : null}
        </div>
        {score.score !== null ? (
          <ScoreRing value={score.score} />
        ) : (
          <div className="grid h-14 w-14 place-items-center rounded-full border border-white/[0.08] bg-[#101827]/72 text-xs font-semibold text-zinc-400">
            N/A
          </div>
        )}
      </div>
      <p className="mt-3 text-xs leading-5 text-zinc-500">{score.explanation}</p>
      {score.evidenceFound?.length || score.evidenceMissing?.length ? (
        <div className="mt-3 grid gap-2 text-[11px] leading-4 text-zinc-500 sm:grid-cols-2">
          {score.evidenceFound?.length ? (
            <div>
              <p className="font-semibold uppercase tracking-wide text-cyan-100/70">Evidence found</p>
              <p className="mt-1">{score.evidenceFound.slice(0, 3).join(", ")}</p>
            </div>
          ) : null}
          {score.evidenceMissing?.length ? (
            <div>
              <p className="font-semibold uppercase tracking-wide text-amber-100/70">Missing</p>
              <p className="mt-1">{score.evidenceMissing.slice(0, 3).join(", ")}</p>
            </div>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

export function CandidateCard({
  candidate,
  compact = false,
}: {
  candidate: RecruiterCandidateEvaluation;
  compact?: boolean;
}) {
  return (
    <article className="rounded-[1.65rem] border border-white/[0.07] bg-white/[0.035] p-5 shadow-[0_0_16px_rgba(0,229,255,0.035)]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-cyan-100">
            {candidate.recommendation}
          </p>
          <h3 className="mt-2 text-xl font-semibold text-white">{candidate.name}</h3>
          <p className="mt-1 text-xs text-zinc-500">{candidate.fileName}</p>
        </div>
        <div className="rounded-2xl border border-[#00E5FF]/18 bg-[#00E5FF]/10 px-4 py-3 text-center">
          <p className="text-3xl font-semibold text-cyan-100">
            {candidate.overallHireScore.score ?? 0}
          </p>
          <p className="text-xs uppercase text-zinc-500">Hire score</p>
        </div>
      </div>
      <p className="mt-4 text-sm leading-6 text-zinc-400">
        {candidate.executiveSummary}
      </p>
      {!compact ? (
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <MiniMetric label="Technical" value={candidate.scores.technical.score ?? 0} />
          <MiniMetric label="Skill Match" value={candidate.scores.skillMatch.score ?? 0} />
          <MiniMetric label="Projects" value={candidate.scores.projectQuality.score ?? 0} />
        </div>
      ) : null}
    </article>
  );
}

export function RiskCard({ risk }: { risk: RecruiterRisk }) {
  const tone =
    risk.severity === "High"
      ? "border-red-300/20 bg-red-300/10 text-red-100"
      : risk.severity === "Medium"
        ? "border-amber-300/20 bg-amber-300/10 text-amber-100"
        : "border-cyan-300/20 bg-cyan-300/10 text-cyan-100";

  return (
    <div className={`rounded-[1.3rem] border p-4 ${tone}`}>
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4" />
        <p className="text-sm font-semibold">{risk.title}</p>
      </div>
      <p className="mt-2 text-xs leading-5 opacity-80">{risk.reason}</p>
    </div>
  );
}

export function StrengthCard({
  title,
  items,
  icon: Icon = CheckCircle2,
}: {
  title: string;
  items: string[];
  icon?: LucideIcon;
}) {
  return (
    <div className={forge.metric}>
      <p className="flex items-center gap-2 text-sm font-semibold text-zinc-100">
        <Icon className="h-4 w-4 text-cyan-100" />
        {title}
      </p>
      <ul className="mt-3 space-y-2 text-sm leading-6 text-zinc-400">
        {(items.length ? items : ["No items available."]).map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export function RecommendationCard({
  recommendation,
  reason,
}: {
  recommendation: string;
  reason: string;
}) {
  return (
    <div className="rounded-[1.4rem] border border-[#00E5FF]/18 bg-[#00E5FF]/8 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-cyan-100">
        Recommendation
      </p>
      <p className="mt-2 text-xl font-semibold text-white">{recommendation}</p>
      <p className="mt-2 text-sm leading-6 text-zinc-400">{reason}</p>
    </div>
  );
}

export function InterviewQuestionCard({
  title,
  questions,
}: {
  title: string;
  questions: string[];
}) {
  return (
    <div className={forge.metric}>
      <p className="text-sm font-semibold text-zinc-100">{title}</p>
      <ol className="mt-3 space-y-2 text-sm leading-6 text-zinc-400">
        {questions.map((question, index) => (
          <li key={question}>
            {index + 1}. {question}
          </li>
        ))}
      </ol>
    </div>
  );
}

export function ExecutiveSummaryCard({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-[1.65rem] border border-white/[0.08] bg-[linear-gradient(135deg,rgba(0,229,255,0.08),rgba(255,255,255,0.035)_48%,rgba(139,92,246,0.08))] p-5 shadow-[0_0_28px_rgba(0,229,255,0.07)]">
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-cyan-100">
        <Sparkles className="h-4 w-4" />
        Executive Summary
      </p>
      <div className="mt-3 text-sm leading-7 text-zinc-300">{children}</div>
    </div>
  );
}

export function RecruiterSection({
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
    <section className="rounded-[1.75rem] border border-white/[0.07] bg-white/[0.035] p-5 shadow-[0_0_18px_rgba(0,229,255,0.04)] backdrop-blur-2xl sm:p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-white">{title}</h2>
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

function MiniMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#101827]/58 p-3">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="mt-1 text-lg font-semibold text-white">{value}</p>
      <div className={`mt-2 h-1.5 ${forge.progressTrack}`}>
        <div className={forge.progressFill} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function ScoreRing({ value }: { value: number }) {
  return (
    <div
      className="grid h-14 w-14 place-items-center rounded-full p-1"
      style={{
        background: `conic-gradient(#00E5FF ${value}%, rgba(255,255,255,0.1) 0)`,
      }}
      aria-label={`${value}%`}
    >
      <div className="grid h-full w-full place-items-center rounded-full bg-[#070B16] text-xs font-semibold text-white">
        {value}
      </div>
    </div>
  );
}

export const recruiterIcons = {
  BarChart3,
  BriefcaseBusiness,
  FileSearch,
  ShieldCheck,
  Target,
  Users,
};
