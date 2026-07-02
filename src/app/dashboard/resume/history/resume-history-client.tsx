"use client";

import Link from "next/link";
import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent, ReactNode } from "react";
import {
  BarChart3,
  CheckCircle2,
  CircleDot,
  Database,
  FileText,
  GitCompareArrows,
  History,
  Layers3,
  Minus,
  PenLine,
  Plus,
  RotateCcw,
  Sparkles,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import {
  initialRestoreResumeVersionState,
  restoreResumeVersion,
} from "@/app/dashboard/resume/history/actions";
import { PremiumModuleHero } from "@/components/dashboard/premium-module-hero";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { forge } from "@/lib/talentforge-design";
import {
  diffResumeVersionSkills,
  readLocalResumeHistory,
  type CanonicalResumeSkill,
  type ResumeSkillCategory,
  type ResumeVersionSourceType,
} from "@/lib/resume-versioning-client";

export type ResumeHistoryVersion = {
  id: string;
  resumeId: string;
  versionNumber: number;
  sourceType: ResumeVersionSourceType;
  sourceLabel: string | null;
  targetLabel: string | null;
  contentHash: string | null;
  createdAt: string;
  updatedAt?: string;
  atsScore: number | null;
  jobMatchScore: number | null;
  addedKeywords: string[];
  removedKeywords: string[];
  content: string;
};

export type ResumeHistoryResume = {
  id: string;
  title: string;
  createdAt: string;
  versions: ResumeHistoryVersion[];
};

type ResumeHistoryClientProps = {
  resumes: ResumeHistoryResume[];
};

const SOURCE_LABELS: Record<ResumeVersionSourceType, string> = {
  original: "Original",
  ats_optimizer: "ATS optimized",
  resume_rewriter: "Rewritten",
  manual: "Restored",
};
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function safeDateLabel(value: unknown): string {
  const date =
    value instanceof Date
      ? value
      : typeof value === "string" || typeof value === "number"
        ? new Date(value)
        : null;

  if (!date || Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return date.toLocaleString();
}

function isSourceType(value: unknown): value is ResumeVersionSourceType {
  return (
    value === "original" ||
    value === "ats_optimizer" ||
    value === "resume_rewriter" ||
    value === "manual"
  );
}

function isHistoryVersion(value: unknown): value is ResumeHistoryVersion {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.resumeId === "string" &&
    typeof value.versionNumber === "number" &&
    isSourceType(value.sourceType) &&
    (typeof value.sourceLabel === "string" || value.sourceLabel === null) &&
    (typeof value.targetLabel === "string" || value.targetLabel === null) &&
    (typeof value.contentHash === "string" || value.contentHash === null) &&
    typeof value.createdAt === "string" &&
    (typeof value.atsScore === "number" || value.atsScore === null) &&
    (typeof value.jobMatchScore === "number" || value.jobMatchScore === null) &&
    isStringArray(value.addedKeywords) &&
    isStringArray(value.removedKeywords) &&
    typeof value.content === "string"
  );
}

function normalizeScore(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function normalizeStringArray(value: unknown) {
  return isStringArray(value) ? value : [];
}

function normalizeResumeVersion(
  version: unknown,
  fallbackResumeId: string,
  fallbackVersionNumber: number
): ResumeHistoryVersion | null {
  if (!isRecord(version)) return null;

  const sourceType = isSourceType(version.sourceType) ? version.sourceType : "manual";
  const id =
    typeof version.id === "string"
      ? version.id
      : `${fallbackResumeId}-${fallbackVersionNumber}`;

  return {
    id,
    resumeId:
      typeof version.resumeId === "string" ? version.resumeId : fallbackResumeId,
    versionNumber:
      typeof version.versionNumber === "number"
        ? version.versionNumber
        : fallbackVersionNumber,
    sourceType,
    sourceLabel: typeof version.sourceLabel === "string" ? version.sourceLabel : null,
    targetLabel: typeof version.targetLabel === "string" ? version.targetLabel : null,
    contentHash: typeof version.contentHash === "string" ? version.contentHash : "",
    createdAt: safeDateLabel(version.createdAt),
    updatedAt: safeDateLabel(version.updatedAt ?? version.createdAt),
    atsScore: normalizeScore(version.atsScore),
    jobMatchScore: normalizeScore(version.jobMatchScore),
    addedKeywords: normalizeStringArray(version.addedKeywords),
    removedKeywords: normalizeStringArray(version.removedKeywords),
    content: typeof version.content === "string" ? version.content : "",
  };
}

function isHistoryResume(value: unknown): value is ResumeHistoryResume {
  if (!isRecord(value)) return false;

  const resumeId = typeof value.id === "string" ? value.id : "local-resume";
  const versions = Array.isArray(value.versions)
    ? value.versions
        .map((version, index) =>
          normalizeResumeVersion(version, resumeId, index + 1)
        )
        .filter((version): version is ResumeHistoryVersion => Boolean(version))
    : [];

  Object.assign(value, {
    id: resumeId,
    title: typeof value.title === "string" ? value.title : "Local Resume",
    createdAt: safeDateLabel(value.createdAt),
    versions,
  });

  return (
    typeof value.id === "string" &&
    typeof value.title === "string" &&
    typeof value.createdAt === "string" &&
    Array.isArray(value.versions) &&
    value.versions.every(isHistoryVersion)
  );
}

function formatDate(value: string) {
  if (value === "Unknown date") return value;

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function hasScore(value: number | null | undefined): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

export function formatScore(value: number | null | undefined) {
  return hasScore(value) ? String(value) : "Not analyzed yet";
}

function compactScore(value: number | null | undefined) {
  return hasScore(value) ? String(value) : "--";
}

function scoreDeltaLabel(previous: number | null, current: number | null) {
  if (hasScore(previous) && !hasScore(current)) return "Pending analysis";
  if (!hasScore(previous) && !hasScore(current)) return "Pending analysis";
  if (!hasScore(previous) && hasScore(current)) return "No prior score";
  if (!hasScore(previous) || !hasScore(current)) return "Pending analysis";

  const delta = current - previous;
  if (delta === 0) return "No change";

  return `${delta > 0 ? "+" : ""}${delta}`;
}

function getScoreTone(score: number | null) {
  if (!hasScore(score)) return "text-zinc-500";
  if (score >= 80) return "text-emerald-300";
  if (score >= 60) return "text-cyan-200";
  return "text-amber-200";
}

export function getPreviousVersion(
  versions: ResumeHistoryVersion[],
  selectedVersion: ResumeHistoryVersion
) {
  const selectedIndex = versions.findIndex((version) => version.id === selectedVersion.id);

  return selectedIndex > 0 ? versions[selectedIndex - 1] : null;
}

export function compareVersionScores(
  previous: ResumeHistoryVersion | null,
  current: ResumeHistoryVersion
) {
  return {
    ats: {
      previous: previous?.atsScore ?? null,
      current: current.atsScore,
      label: scoreDeltaLabel(previous?.atsScore ?? null, current.atsScore),
      pending: hasScore(previous?.atsScore) && !hasScore(current.atsScore),
    },
    jdMatch: {
      previous: previous?.jobMatchScore ?? null,
      current: current.jobMatchScore,
      label: scoreDeltaLabel(previous?.jobMatchScore ?? null, current.jobMatchScore),
      pending: hasScore(previous?.jobMatchScore) && !hasScore(current.jobMatchScore),
    },
  };
}

function keywordList(items: string[], emptyText: string) {
  return items.length ? items.slice(0, 10).join(", ") : emptyText;
}

function getSemanticSkillDiff(
  previousVersion: ResumeHistoryVersion | null,
  selectedVersion: ResumeHistoryVersion
) {
  if (!previousVersion) {
    return diffResumeVersionSkills("", selectedVersion.content);
  }

  return diffResumeVersionSkills(previousVersion.content, selectedVersion.content);
}

function groupSkillsByCategory(skills: CanonicalResumeSkill[]) {
  return skills.reduce<Record<ResumeSkillCategory, CanonicalResumeSkill[]>>(
    (groups, skill) => {
      groups[skill.category].push(skill);
      return groups;
    },
    {
      Frontend: [],
      Backend: [],
      Testing: [],
      Architecture: [],
      DevOps: [],
      Databases: [],
      Cloud: [],
      "AI/ML": [],
    }
  );
}

function clampScore(value: number | null | undefined) {
  return hasScore(value) ? Math.max(0, Math.min(100, value)) : 0;
}

function scoreWidth(value: number | null | undefined) {
  return `${clampScore(value)}%`;
}

function deltaNumber(previous: number | null | undefined, current: number | null | undefined) {
  return hasScore(previous) && hasScore(current) ? current - previous : null;
}

function signedNumber(value: number | null, suffix = "") {
  if (value === null) return "Pending";
  if (value === 0) return `0${suffix}`;

  return `${value > 0 ? "+" : ""}${value}${suffix}`;
}

function categoryLabel(category: ResumeSkillCategory) {
  if (category === "Databases") return "Database";
  if (category === "AI/ML") return "AI";

  return category;
}

function lastUpdatedLabel(version: ResumeHistoryVersion | undefined) {
  return version ? formatDate(version.updatedAt ?? version.createdAt) : "No versions";
}

function latestVersion(versions: ResumeHistoryVersion[]) {
  return versions.at(-1);
}

function bestScore(
  versions: ResumeHistoryVersion[],
  key: "atsScore" | "jobMatchScore"
) {
  const scores = versions
    .map((version) => version[key])
    .filter((score): score is number => hasScore(score));

  return scores.length ? Math.max(...scores) : null;
}

function KeywordChips({
  items,
  emptyText,
  tone = "cyan",
}: {
  items: string[];
  emptyText: string;
  tone?: "cyan" | "purple" | "amber";
}) {
  const toneClass =
    tone === "amber"
      ? "border-amber-300/20 bg-amber-300/10 text-amber-100"
      : tone === "purple"
        ? "border-[#8B5CF6]/25 bg-[#8B5CF6]/10 text-purple-100"
        : "border-[#00E5FF]/20 bg-[#00E5FF]/10 text-cyan-50";

  if (!items.length) {
    return <p className="text-sm leading-6 text-zinc-400">{emptyText}</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {items.slice(0, 12).map((item) => (
        <span
          key={item}
          className={`rounded-full border px-3 py-1 text-xs transition duration-300 hover:-translate-y-0.5 ${toneClass}`}
        >
          {item}
        </span>
      ))}
    </div>
  );
}

function SkillChip({ skill, tone = "cyan" }: { skill: CanonicalResumeSkill; tone?: "cyan" | "amber" }) {
  const toneClass =
    tone === "amber"
      ? "border-amber-300/20 bg-amber-300/10 text-amber-100 hover:border-amber-200/40"
      : "border-[#00E5FF]/20 bg-[#00E5FF]/10 text-cyan-50 hover:border-[#00E5FF]/40";

  return (
    <span
      className={`group relative rounded-full border px-3 py-1 text-xs transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_20px_rgba(0,229,255,0.14)] ${toneClass}`}
      title={`${skill.confidence}% confidence`}
    >
      {skill.skill}
      <span className="ml-1 text-[0.65rem] text-white/45 transition group-hover:text-white/75">
        {skill.confidence}%
      </span>
    </span>
  );
}

function SkillCategoryList({
  skills,
  emptyText,
  tone = "cyan",
}: {
  skills: CanonicalResumeSkill[];
  emptyText: string;
  tone?: "cyan" | "amber";
}) {
  if (!skills.length) {
    return <p className="text-sm leading-6 text-zinc-400">{emptyText}</p>;
  }

  const grouped = groupSkillsByCategory(skills);

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {Object.entries(grouped).flatMap(([category, categorySkills]) =>
        categorySkills.length ? (
          <div key={category} className="rounded-2xl border border-white/10 bg-[#101827]/55 p-3">
            <p className="text-[0.68rem] font-semibold uppercase tracking-wide text-zinc-500">
              {categoryLabel(category as ResumeSkillCategory)}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {categorySkills.map((skill) => (
                <SkillChip key={skill.skill} skill={skill} tone={tone} />
              ))}
            </div>
          </div>
        ) : []
      )}
    </div>
  );
}

function SectionHeader({
  icon: Icon,
  eyebrow,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-white/10 bg-[#101827]/60 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-[#00E5FF]/20 bg-[#00E5FF]/10 text-cyan-100 shadow-[0_0_24px_rgba(0,229,255,0.12)]">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-cyan-100">
            {eyebrow}
          </p>
          <h2 className="mt-1 text-lg font-semibold tracking-tight text-white">
            {title}
          </h2>
          {description ? (
            <p className="mt-1 text-sm leading-6 text-zinc-400">{description}</p>
          ) : null}
        </div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

function GradientDivider() {
  return (
    <div className="h-px w-full bg-gradient-to-r from-transparent via-[#00E5FF]/30 to-transparent" />
  );
}

function MiniProgress({
  value,
  tone = "cyan",
}: {
  value: number | null | undefined;
  tone?: "cyan" | "purple" | "emerald" | "amber";
}) {
  const fillClass =
    tone === "purple"
      ? "bg-gradient-to-r from-[#8B5CF6] to-[#00E5FF] shadow-[0_0_18px_rgba(139,92,246,0.32)]"
      : tone === "emerald"
        ? "bg-gradient-to-r from-emerald-300 to-[#00E5FF] shadow-[0_0_18px_rgba(52,211,153,0.25)]"
        : tone === "amber"
          ? "bg-gradient-to-r from-amber-300 to-[#8B5CF6] shadow-[0_0_18px_rgba(251,191,36,0.2)]"
          : forge.progressFill;

  return (
    <div className={`h-1.5 ${forge.progressTrack}`} aria-hidden="true">
      <div
        className={`h-full rounded-full transition-all duration-700 ${fillClass}`}
        style={{ width: scoreWidth(value) }}
      />
    </div>
  );
}

function PremiumMetricCard({
  label,
  value,
  helper,
  icon: Icon,
  tone = "cyan",
}: {
  label: string;
  value: string;
  helper?: string;
  icon: LucideIcon;
  tone?: "cyan" | "purple" | "emerald" | "amber";
}) {
  const toneClass =
    tone === "purple"
      ? "border-[#8B5CF6]/25 bg-[#8B5CF6]/10 text-purple-100"
      : tone === "emerald"
        ? "border-emerald-300/25 bg-emerald-300/10 text-emerald-100"
        : tone === "amber"
          ? "border-amber-300/25 bg-amber-300/10 text-amber-100"
          : "border-[#00E5FF]/25 bg-[#00E5FF]/10 text-cyan-100";

  return (
    <div className={`group rounded-2xl border p-3 transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_28px_rgba(0,229,255,0.14)] ${toneClass}`}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-[0.68rem] font-semibold uppercase tracking-wide text-white/55">
          {label}
        </p>
        <Icon className="h-3.5 w-3.5 opacity-80 transition group-hover:scale-110" aria-hidden="true" />
      </div>
      <p className="mt-2 text-xl font-semibold tracking-tight text-white">{value}</p>
      {helper ? <p className="mt-1 truncate text-xs text-white/50">{helper}</p> : null}
    </div>
  );
}

function AnalyticsCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card className={`${forge.card} overflow-hidden ${className}`}>
      {children}
    </Card>
  );
}

function ComparisonCard({
  label,
  value,
  helper,
  icon: Icon,
  progress,
  tone = "cyan",
}: {
  label: string;
  value: string;
  helper: string;
  icon: LucideIcon;
  progress: number | null | undefined;
  tone?: "cyan" | "purple" | "emerald" | "amber";
}) {
  const textTone =
    tone === "purple"
      ? "text-purple-100"
      : tone === "emerald"
        ? "text-emerald-200"
        : tone === "amber"
          ? "text-amber-200"
          : "text-cyan-100";

  return (
    <div className={`${forge.metric} group transition duration-300 hover:-translate-y-0.5 hover:border-[#00E5FF]/25 hover:bg-white/[0.055]`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[0.68rem] font-semibold uppercase tracking-wide text-zinc-500">
            {label}
          </p>
          <p className={`mt-2 text-2xl font-semibold tracking-tight ${textTone}`}>
            {value}
          </p>
        </div>
        <span className="grid h-9 w-9 place-items-center rounded-2xl border border-white/10 bg-white/[0.04] text-cyan-100 transition group-hover:scale-105">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-2 min-h-8 text-xs leading-4 text-zinc-500">{helper}</p>
      <MiniProgress value={progress} tone={tone} />
    </div>
  );
}

function InsightCard({
  label,
  value,
  helper,
  tone = "cyan",
}: {
  label: string;
  value: string;
  helper: string;
  tone?: "cyan" | "purple" | "emerald" | "amber";
}) {
  return (
    <div className={`${forge.metric} min-h-28 transition duration-300 hover:-translate-y-0.5 hover:border-[#00E5FF]/25`}>
      <p className="text-[0.68rem] font-semibold uppercase tracking-wide text-zinc-500">
        {label}
      </p>
      <p className={`mt-3 text-3xl font-semibold ${tone === "emerald" ? "text-emerald-300" : tone === "amber" ? "text-amber-200" : tone === "purple" ? "text-purple-100" : "text-cyan-100"}`}>
        {value}
      </p>
      <p className="mt-2 text-xs leading-5 text-zinc-500">{helper}</p>
    </div>
  );
}

function TimelineCard({
  version,
  selected,
  latest,
  onSelectVersion,
}: {
  version: ResumeHistoryVersion;
  selected: boolean;
  latest: boolean;
  onSelectVersion: (versionId: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelectVersion(version.id)}
      aria-pressed={selected}
      className={`group relative w-full rounded-2xl border p-3 text-left outline-none transition duration-300 focus-visible:border-[#00E5FF]/60 focus-visible:ring-2 focus-visible:ring-[#00E5FF]/25 ${
        selected
          ? "border-[#00E5FF]/45 bg-[#00E5FF]/10 shadow-[0_0_34px_rgba(0,229,255,0.18)]"
          : "border-white/10 bg-[#101827]/55 hover:-translate-y-0.5 hover:border-[#00E5FF]/25 hover:bg-white/[0.055]"
      }`}
    >
      <span
        className={`absolute -left-[1.06rem] top-5 h-3 w-3 rounded-full border ${
          selected
            ? "border-cyan-100 bg-[#00E5FF] shadow-[0_0_18px_rgba(0,229,255,0.9)]"
            : "border-white/20 bg-[#6A5CFF]"
        }`}
      />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-white">V{version.versionNumber}</p>
            {latest ? (
              <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-2 py-0.5 text-[0.65rem] font-semibold uppercase text-emerald-100">
                Latest
              </span>
            ) : null}
          </div>
          <p className="mt-1 truncate text-xs text-zinc-500">
            {formatDate(version.createdAt)}
          </p>
        </div>
        <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[0.65rem] font-semibold uppercase text-zinc-300">
          {SOURCE_LABELS[version.sourceType]}
        </span>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
        <div>
          <p className="text-zinc-500">ATS</p>
          <p className={`mt-1 font-semibold ${getScoreTone(version.atsScore)}`}>
            {compactScore(version.atsScore)}
          </p>
        </div>
        <div>
          <p className="text-zinc-500">JD</p>
          <p className={`mt-1 font-semibold ${getScoreTone(version.jobMatchScore)}`}>
            {compactScore(version.jobMatchScore)}
          </p>
        </div>
        <div>
          <p className="text-zinc-500">Status</p>
          <p className="mt-1 truncate font-semibold text-cyan-100">
            {version.sourceLabel ?? SOURCE_LABELS[version.sourceType]}
          </p>
        </div>
      </div>
    </button>
  );
}

export function ResumeVersionTimeline({
  versions,
  selectedVersionId,
  onSelectVersion,
}: {
  versions: ResumeHistoryVersion[];
  selectedVersionId: string;
  onSelectVersion: (versionId: string) => void;
}) {
  const latestId = latestVersion(versions)?.id;

  return (
    <AnalyticsCard className="h-fit xl:sticky xl:top-6">
      <SectionHeader
        icon={History}
        eyebrow="Timeline"
        title="Version stream"
        description={`${versions.length} snapshots, newest first.`}
      />
      <CardContent className="relative space-y-2 py-4 pl-7">
        <span className="absolute bottom-5 left-[1.09rem] top-5 w-px bg-gradient-to-b from-[#00E5FF]/35 via-white/10 to-[#8B5CF6]/25" />
        {[...versions].reverse().map((version) => (
          <TimelineCard
            key={version.id}
            version={version}
            selected={version.id === selectedVersionId}
            latest={version.id === latestId}
            onSelectVersion={onSelectVersion}
          />
        ))}
      </CardContent>
    </AnalyticsCard>
  );
}

export function ResumeComparisonCard({
  selectedVersion,
  previousVersion,
}: {
  selectedVersion: ResumeHistoryVersion;
  previousVersion: ResumeHistoryVersion | null;
}) {
  const comparison = compareVersionScores(previousVersion, selectedVersion);
  const semanticDiff = getSemanticSkillDiff(previousVersion, selectedVersion);
  const atsDelta = deltaNumber(comparison.ats.previous, comparison.ats.current);
  const jdDelta = deltaNumber(comparison.jdMatch.previous, comparison.jdMatch.current);
  const netImprovement =
    (atsDelta ?? 0) +
    (jdDelta ?? 0) +
    selectedVersion.addedKeywords.length -
    selectedVersion.removedKeywords.length +
    semanticDiff.addedSkills.length -
    semanticDiff.removedSkills.length;
  const hasMissingCurrentScore =
    !hasScore(selectedVersion.atsScore) || !hasScore(selectedVersion.jobMatchScore);

  return (
    <AnalyticsCard>
      <SectionHeader
        icon={GitCompareArrows}
        eyebrow="Compare"
        title={
          previousVersion
            ? `V${previousVersion.versionNumber} to V${selectedVersion.versionNumber}`
            : `V${selectedVersion.versionNumber} baseline`
        }
        description="Score movement, keywords, and semantic skill changes."
        action={<VersionRestoreDialog version={selectedVersion} />}
      />
      <CardContent className="space-y-5 py-5">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <ComparisonCard
            icon={BarChart3}
            label="ATS delta"
            value={signedNumber(atsDelta)}
            helper={`${formatScore(comparison.ats.previous)} to ${formatScore(comparison.ats.current)}`}
            progress={selectedVersion.atsScore}
            tone={atsDelta !== null && atsDelta > 0 ? "emerald" : "cyan"}
          />
          <ComparisonCard
            icon={Target}
            label="JD delta"
            value={signedNumber(jdDelta)}
            helper={`${formatScore(comparison.jdMatch.previous)} to ${formatScore(comparison.jdMatch.current)}`}
            progress={selectedVersion.jobMatchScore}
            tone={jdDelta !== null && jdDelta > 0 ? "emerald" : "purple"}
          />
          <ComparisonCard
            icon={Plus}
            label="Keywords added"
            value={`+${selectedVersion.addedKeywords.length}`}
            helper={keywordList(selectedVersion.addedKeywords, "No new keywords")}
            progress={Math.min(100, selectedVersion.addedKeywords.length * 12)}
            tone="emerald"
          />
          <ComparisonCard
            icon={Minus}
            label="Keywords removed"
            value={String(selectedVersion.removedKeywords.length)}
            helper={keywordList(selectedVersion.removedKeywords, "No removed keywords")}
            progress={Math.min(100, selectedVersion.removedKeywords.length * 12)}
            tone="amber"
          />
          <ComparisonCard
            icon={Zap}
            label="Skills gained"
            value={`+${semanticDiff.addedSkills.length}`}
            helper="New semantic skills detected"
            progress={Math.min(100, semanticDiff.addedSkills.length * 18)}
            tone="cyan"
          />
          <ComparisonCard
            icon={CircleDot}
            label="Skills lost"
            value={String(semanticDiff.removedSkills.length)}
            helper="Previously detected skills missing"
            progress={Math.min(100, semanticDiff.removedSkills.length * 18)}
            tone="amber"
          />
          <ComparisonCard
            icon={TrendingUp}
            label="Net improvement"
            value={signedNumber(netImprovement)}
            helper="Combined score, keyword, and skill movement"
            progress={Math.min(100, Math.abs(netImprovement) * 5)}
            tone={netImprovement >= 0 ? "emerald" : "amber"}
          />
          <ComparisonCard
            icon={CheckCircle2}
            label="Status"
            value={selectedVersion.sourceLabel ?? SOURCE_LABELS[selectedVersion.sourceType]}
            helper={selectedVersion.targetLabel ?? "Snapshot ready for review"}
            progress={hasMissingCurrentScore ? 48 : 100}
            tone={hasMissingCurrentScore ? "amber" : "cyan"}
          />
        </div>

        {hasMissingCurrentScore ? (
          <div className={forge.statusWarning}>
            <p>
              Run ATS analysis or JD Match for this version to unlock complete score deltas.
            </p>
            <div className="mt-3 flex flex-wrap gap-3">
              {!hasScore(selectedVersion.atsScore) ? (
                <Button asChild variant="outline" className={forge.secondaryButton}>
                  <Link href="/dashboard/resume/ats">Run ATS</Link>
                </Button>
              ) : null}
              {!hasScore(selectedVersion.jobMatchScore) ? (
                <Button asChild variant="outline" className={forge.secondaryButton}>
                  <Link href="/dashboard/resume/match">Run JD Match</Link>
                </Button>
              ) : null}
            </div>
          </div>
        ) : null}

        <GradientDivider />

        <div className="grid gap-4 xl:grid-cols-[1.3fr_0.9fr]">
          <div className={`${forge.panel} p-4`}>
            <SectionHeader
              icon={Database}
              eyebrow="Skills"
              title="Skill intelligence"
              description="Grouped semantic skills by category."
            />
            <div className="grid gap-4 p-4 lg:grid-cols-2">
              <div>
                <p className="mb-3 text-sm font-semibold text-emerald-200">
                  Skills gained
                </p>
                <SkillCategoryList
                  skills={semanticDiff.addedSkills}
                  emptyText="No new skills in this version."
                />
              </div>
              <div>
                <p className="mb-3 text-sm font-semibold text-amber-200">
                  Skills lost
                </p>
                <SkillCategoryList
                  skills={semanticDiff.removedSkills}
                  emptyText="No important skills were removed."
                  tone="amber"
                />
              </div>
            </div>
          </div>
          <div className={`${forge.panel} p-4`}>
            <SectionHeader
              icon={Layers3}
              eyebrow="Keywords"
              title="Keyword movement"
              description="Compact view of added and removed language."
            />
            <div className="space-y-5 p-4">
              <div>
                <p className="mb-3 text-sm font-semibold text-cyan-100">Added</p>
                <KeywordChips
                  items={selectedVersion.addedKeywords}
                  emptyText="No new keywords in this version."
                />
              </div>
              <div>
                <p className="mb-3 text-sm font-semibold text-amber-200">Removed</p>
                <KeywordChips
                  items={selectedVersion.removedKeywords}
                  emptyText="No removed keywords in this version."
                  tone="amber"
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </AnalyticsCard>
  );
}

function buildPolyline(
  versions: ResumeHistoryVersion[],
  key: "atsScore" | "jobMatchScore"
) {
  const denominator = Math.max(1, versions.length - 1);

  return versions
    .map((version, index) =>
      hasScore(version[key])
        ? `${(index / denominator) * 100},${100 - clampScore(version[key])}`
        : null
    )
    .filter((point): point is string => Boolean(point))
    .join(" ");
}

export function ResumeEvolutionChart({
  versions,
}: {
  versions: ResumeHistoryVersion[];
}) {
  const scoredVersions = versions.filter(
    (version) => version.atsScore !== null || version.jobMatchScore !== null
  );
  const latest = latestVersion(versions);
  const bestAts = bestScore(versions, "atsScore");
  const bestJd = bestScore(versions, "jobMatchScore");
  const atsLine = buildPolyline(versions, "atsScore");
  const jdLine = buildPolyline(versions, "jobMatchScore");

  return (
    <AnalyticsCard>
      <SectionHeader
        icon={TrendingUp}
        eyebrow="Evolution"
        title="Score trajectory"
        description={`V1 to V${versions.at(-1)?.versionNumber ?? 1}, latest and best highlighted.`}
      />
      <CardContent className="py-5">
        {scoredVersions.length ? (
          <div className="space-y-5">
            <div className="relative h-64 overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#070B16]/70 p-4 shadow-inner">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(0,229,255,0.14),transparent_18rem),radial-gradient(circle_at_82%_75%,rgba(139,92,246,0.14),transparent_18rem)]" />
              <svg
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                className="relative h-full w-full"
                role="img"
                aria-label="ATS and JD Match score trend chart"
              >
                <defs>
                  <linearGradient id="atsTrend" x1="0" x2="1" y1="0" y2="0">
                    <stop offset="0%" stopColor="#00E5FF" />
                    <stop offset="100%" stopColor="#67E8F9" />
                  </linearGradient>
                  <linearGradient id="jdTrend" x1="0" x2="1" y1="0" y2="0">
                    <stop offset="0%" stopColor="#8B5CF6" />
                    <stop offset="100%" stopColor="#00E5FF" />
                  </linearGradient>
                </defs>
                {[20, 40, 60, 80].map((line) => (
                  <line
                    key={line}
                    x1="0"
                    x2="100"
                    y1={line}
                    y2={line}
                    stroke="rgba(255,255,255,0.08)"
                    strokeWidth="0.35"
                  />
                ))}
                {atsLine ? (
                  <polyline
                    points={atsLine}
                    fill="none"
                    stroke="url(#atsTrend)"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.7"
                    className="drop-shadow-[0_0_10px_rgba(0,229,255,0.55)]"
                  />
                ) : null}
                {jdLine ? (
                  <polyline
                    points={jdLine}
                    fill="none"
                    stroke="url(#jdTrend)"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    className="drop-shadow-[0_0_10px_rgba(139,92,246,0.45)]"
                  />
                ) : null}
                {versions.map((version, index) => {
                  const x = (index / Math.max(1, versions.length - 1)) * 100;
                  const isLatest = version.id === latest?.id;

                  return (
                    <g key={version.id}>
                      {hasScore(version.atsScore) ? (
                        <circle
                          cx={x}
                          cy={100 - version.atsScore}
                          r={isLatest || version.atsScore === bestAts ? 1.8 : 1.1}
                          fill={version.atsScore === bestAts ? "#34D399" : "#00E5FF"}
                        >
                          <title>{`V${version.versionNumber} ATS ${version.atsScore}`}</title>
                        </circle>
                      ) : null}
                      {hasScore(version.jobMatchScore) ? (
                        <circle
                          cx={x}
                          cy={100 - version.jobMatchScore}
                          r={isLatest || version.jobMatchScore === bestJd ? 1.6 : 1}
                          fill={version.jobMatchScore === bestJd ? "#C4B5FD" : "#8B5CF6"}
                        >
                          <title>{`V${version.versionNumber} JD ${version.jobMatchScore}`}</title>
                        </circle>
                      ) : null}
                    </g>
                  );
                })}
              </svg>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <PremiumMetricCard
                icon={BarChart3}
                label="Best ATS"
                value={formatScore(bestAts)}
                helper="Highest saved ATS"
                tone="emerald"
              />
              <PremiumMetricCard
                icon={Target}
                label="Best JD"
                value={formatScore(bestJd)}
                helper="Highest saved match"
                tone="purple"
              />
              <PremiumMetricCard
                icon={Sparkles}
                label="Latest"
                value={`V${latest?.versionNumber ?? "--"}`}
                helper={latest ? `${compactScore(latest.atsScore)} ATS / ${compactScore(latest.jobMatchScore)} JD` : "No version"}
              />
            </div>
          </div>
        ) : (
          <p className="text-sm leading-6 text-zinc-400">
            Score trends will appear after ATS or JD match scores are saved on versions.
          </p>
        )}
      </CardContent>
    </AnalyticsCard>
  );
}

export function VersionRestoreDialog({
  version,
}: {
  version: ResumeHistoryVersion;
}) {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const cancelButtonRef = useRef<HTMLButtonElement | null>(null);
  const [state, formAction, pending] = useActionState(
    restoreResumeVersion,
    initialRestoreResumeVersionState
  );

  useEffect(() => {
    if (!open) return;

    cancelButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !pending) {
        setOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, pending]);

  function handleDialogKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Tab") return;

    const focusableElements = Array.from(
      dialogRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      ) ?? []
    ).filter((element) => !element.hasAttribute("disabled"));

    if (!focusableElements.length) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className={forge.secondaryButton}
        onClick={() => setOpen(true)}
      >
        <RotateCcw className="mr-2 h-4 w-4" />
        Restore Version
      </Button>
      {open ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm">
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="restore-version-title"
            aria-describedby="restore-version-description"
            onKeyDown={handleDialogKeyDown}
            className="w-full max-w-md rounded-[1.75rem] border border-white/10 bg-[#101827] p-6 text-white shadow-[0_0_32px_rgba(106,92,255,0.12)]"
          >
            <h3 id="restore-version-title" className="text-xl font-semibold">
              Restore Version {version.versionNumber}?
            </h3>
            <p id="restore-version-description" className="mt-3 text-sm leading-6 text-zinc-400">
              This will replace the current resume text with this version and create a new
              restored snapshot in the timeline. Uploaded PDFs are not deleted.
            </p>
            <form action={formAction} className="mt-5 space-y-4">
              <input type="hidden" name="versionId" value={version.id} />
              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Button
                  ref={cancelButtonRef}
                  type="button"
                  variant="outline"
                  className={forge.secondaryButton}
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={pending}
                  className={`${forge.primaryButton} disabled:opacity-60`}
                >
                  {pending ? "Restoring..." : "Restore"}
                </Button>
              </div>
              {state.message ? (
                <p
                  aria-live="polite"
                  role={state.status === "error" ? "alert" : "status"}
                  className={
                    state.status === "error"
                      ? "text-sm text-red-300"
                      : "text-sm text-emerald-300"
                  }
                >
                  {state.message}
                </p>
              ) : null}
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}

export function ResumeHistoryClient({ resumes }: ResumeHistoryClientProps) {
  const [availableResumes] = useState(() =>
    resumes.length || typeof window === "undefined"
      ? resumes
      : readLocalResumeHistory(isHistoryResume)
  );
  const [selectedResumeId, setSelectedResumeId] = useState(resumes[0]?.id ?? "");

  const selectedResume = useMemo(
    () =>
      availableResumes.find((resume) => resume.id === selectedResumeId) ??
      availableResumes[0],
    [availableResumes, selectedResumeId]
  );
  const versions = useMemo(() => selectedResume?.versions ?? [], [selectedResume]);
  const [selectedVersionId, setSelectedVersionId] = useState(versions.at(-1)?.id ?? "");
  const selectedVersion = useMemo(
    () =>
      versions.find((version) => version.id === selectedVersionId) ??
      versions.at(-1) ??
      versions[0],
    [selectedVersionId, versions]
  );
  const previousVersion = selectedVersion
    ? getPreviousVersion(versions, selectedVersion)
    : null;

  function handleResumeChange(resumeId: string) {
    const nextResume = availableResumes.find((resume) => resume.id === resumeId);

    setSelectedResumeId(resumeId);
    setSelectedVersionId(nextResume?.versions.at(-1)?.id ?? "");
  }

  if (!selectedResume || !selectedVersion) {
    return (
      <AnalyticsCard>
        <CardContent className="p-8 text-center text-zinc-400">
          Upload a resume to start tracking version history.
        </CardContent>
      </AnalyticsCard>
    );
  }

  const latest = latestVersion(versions);
  const selectedDiff = getSemanticSkillDiff(previousVersion, selectedVersion);
  const totalKeywordsAdded = versions.reduce(
    (total, version) => total + version.addedKeywords.length,
    0
  );

  return (
    <div className="space-y-6">
      <PremiumModuleHero
        badge="Resume Version History"
        title="Track every resume improvement."
        description="Compare snapshots, inspect score movement, and restore the version with the strongest hiring signal."
        variant="history"
        primaryCta={{ href: "/dashboard/resume/ats", label: "Run ATS", icon: BarChart3 }}
        secondaryCta={{ href: "/dashboard/resume/match", label: "JD Match", icon: Target }}
        status={
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <label className="grid min-w-64 gap-2 text-sm text-zinc-300">
              <span className="sr-only">Selected Resume</span>
              <select
                value={selectedResume.id}
                onChange={(event) => handleResumeChange(event.target.value)}
                className={forge.select}
                aria-label="Select resume"
              >
                {availableResumes.map((resume) => (
                  <option key={resume.id} value={resume.id}>
                    {resume.title}
                  </option>
                ))}
              </select>
            </label>
            <VersionRestoreDialog version={selectedVersion} />
          </div>
        }
        metrics={[
          { label: "Versions", value: String(versions.length), helper: selectedResume.title, icon: Layers3, progress: Math.min(100, versions.length * 16), trend: "tracked" },
          { label: "Latest ATS", value: formatScore(latest?.atsScore), helper: latest ? `Version ${latest.versionNumber}` : "No score", icon: BarChart3, tone: "emerald", progress: latest?.atsScore ?? 0, trend: "+score" },
          { label: "Best ATS", value: formatScore(bestScore(versions, "atsScore")), helper: "Highest saved score", icon: TrendingUp, progress: bestScore(versions, "atsScore") ?? 0, trend: "peak" },
          { label: "Latest JD", value: formatScore(latest?.jobMatchScore), helper: latest ? `Version ${latest.versionNumber}` : "No score", icon: Target, tone: "purple", progress: latest?.jobMatchScore ?? 0, trend: "fit" },
          { label: "Skills added", value: `+${selectedDiff.addedSkills.length}`, helper: `${totalKeywordsAdded} keywords tracked`, icon: Zap, tone: "amber", progress: Math.min(100, selectedDiff.addedSkills.length * 18), trend: "+skills" },
          { label: "Updated", value: latest ? `V${latest.versionNumber}` : "--", helper: lastUpdatedLabel(latest), icon: CheckCircle2, progress: 92, trend: "latest" },
        ]}
        quickActions={[
          { href: "/dashboard/resume/ats", title: "ATS Optimizer", subtitle: "Improve current version", icon: BarChart3 },
          { href: "/dashboard/resume/match", title: "JD Match", subtitle: "Compare against a role", icon: Target },
          { href: "/dashboard/resume/rewrite", title: "AI Rewrite", subtitle: "Generate a new version", icon: PenLine },
          { href: "/dashboard/resume", title: "Resume Dashboard", subtitle: "Upload or analyze", icon: FileText },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-[330px_minmax(0,1fr)]">
        <ResumeVersionTimeline
          versions={versions}
          selectedVersionId={selectedVersion.id}
          onSelectVersion={setSelectedVersionId}
        />
        <div className="space-y-6">
          <ResumeComparisonCard
            selectedVersion={selectedVersion}
            previousVersion={previousVersion}
          />
          <ImprovementSummary
            selectedVersion={selectedVersion}
            previousVersion={previousVersion}
          />
          <ResumeEvolutionChart versions={versions} />
        </div>
      </div>
    </div>
  );
}

function ImprovementSummary({
  selectedVersion,
  previousVersion,
}: {
  selectedVersion: ResumeHistoryVersion;
  previousVersion: ResumeHistoryVersion | null;
}) {
  const comparison = compareVersionScores(previousVersion, selectedVersion);
  const semanticDiff = getSemanticSkillDiff(previousVersion, selectedVersion);
  const atsDelta = deltaNumber(comparison.ats.previous, comparison.ats.current);
  const jdDelta = deltaNumber(comparison.jdMatch.previous, comparison.jdMatch.current);
  const netSkillGrowth =
    semanticDiff.currentSkills.length - semanticDiff.previousSkills.length;
  const netPercent =
    atsDelta !== null || jdDelta !== null
      ? Math.round(((atsDelta ?? 0) + (jdDelta ?? 0)) / 2)
      : null;
  const improvements: Array<{
    label: string;
    value: string;
    helper: string;
    tone?: "cyan" | "purple" | "emerald" | "amber";
  }> = [
    {
      label: "ATS",
      value: signedNumber(atsDelta),
      helper: `${formatScore(comparison.ats.previous)} to ${formatScore(comparison.ats.current)}`,
      tone: atsDelta !== null && atsDelta > 0 ? "emerald" : "cyan",
    },
    {
      label: "JD match",
      value: signedNumber(jdDelta),
      helper: `${formatScore(comparison.jdMatch.previous)} to ${formatScore(comparison.jdMatch.current)}`,
      tone: jdDelta !== null && jdDelta > 0 ? "emerald" : "purple",
    },
    {
      label: "Keywords",
      value: `+${selectedVersion.addedKeywords.length}`,
      helper: `${selectedVersion.removedKeywords.length} removed`,
      tone: "cyan",
    },
    {
      label: "Skills",
      value: `+${semanticDiff.addedSkills.length}`,
      helper: `${semanticDiff.removedSkills.length} removed`,
      tone: "emerald",
    },
    {
      label: "Net skills",
      value: `${netSkillGrowth > 0 ? "+" : ""}${netSkillGrowth}`,
      helper: `${semanticDiff.currentSkills.length} currently detected`,
      tone: netSkillGrowth >= 0 ? "emerald" : "amber",
    },
    {
      label: "Net %",
      value: signedNumber(netPercent, "%"),
      helper: "Average score movement",
      tone: netPercent !== null && netPercent >= 0 ? "emerald" : "amber",
    },
  ];

  return (
    <AnalyticsCard>
      <SectionHeader
        icon={Sparkles}
        eyebrow="Summary"
        title="Improvement KPIs"
        description="The selected version at a glance."
      />
      <CardContent className="grid gap-3 py-5 sm:grid-cols-2 xl:grid-cols-3">
        {improvements.map((item) => (
          <InsightCard
            key={item.label}
            label={item.label}
            value={item.value}
            helper={item.helper}
            tone={item.tone}
          />
        ))}
      </CardContent>
    </AnalyticsCard>
  );
}
