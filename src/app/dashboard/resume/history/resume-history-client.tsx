"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import {
  ArrowRight,
  GitCompareArrows,
  History,
  RotateCcw,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import {
  initialRestoreResumeVersionState,
  restoreResumeVersion,
} from "@/app/dashboard/resume/history/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

function numericDelta(previous: number | null | undefined, current: number | null | undefined) {
  return hasScore(previous) && hasScore(current) ? current - previous : null;
}

function versionChangeSummary(
  versions: ResumeHistoryVersion[],
  version: ResumeHistoryVersion
) {
  const previous = getPreviousVersion(versions, version);
  const atsDelta = numericDelta(previous?.atsScore, version.atsScore);
  const jdDelta = numericDelta(previous?.jobMatchScore, version.jobMatchScore);
  const items = [
    atsDelta !== null ? `${atsDelta >= 0 ? "+" : ""}${atsDelta} ATS` : null,
    jdDelta !== null ? `${jdDelta >= 0 ? "+" : ""}${jdDelta} JD Match` : null,
    version.addedKeywords.length
      ? `+${version.addedKeywords.length} Keywords`
      : null,
  ].filter((item): item is string => Boolean(item));

  return items.length ? items.join(" | ") : "No score movement yet";
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

function SkillCategoryList({
  skills,
  emptyText,
}: {
  skills: CanonicalResumeSkill[];
  emptyText: string;
}) {
  if (!skills.length) {
    return <p className="mt-2 text-sm leading-6 text-zinc-300">{emptyText}</p>;
  }

  const grouped = groupSkillsByCategory(skills);

  return (
    <div className="mt-3 space-y-3">
      {Object.entries(grouped).flatMap(([category, categorySkills]) =>
        categorySkills.length ? (
          <div key={category}>
            <p className="text-xs font-semibold uppercase text-zinc-500">{category}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {categorySkills.map((skill) => (
                <span
                  key={skill.skill}
                  className="rounded-full border border-[#00E5FF]/15 bg-[#00E5FF]/10 px-3 py-1 text-xs text-cyan-50"
                >
                  {skill.skill} ({skill.confidence}%)
                </span>
              ))}
            </div>
          </div>
        ) : []
      )}
    </div>
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
  return (
    <Card className={`${forge.card} h-fit overflow-hidden`}>
      <CardHeader className="border-b border-white/10 bg-[#070B1F]/60">
        <div className="flex items-center gap-3">
          <span className="rounded-2xl border border-[#00E5FF]/20 bg-[#00E5FF]/10 p-2 text-cyan-100">
            <History className="h-4 w-4" />
          </span>
          <div>
            <CardTitle className="text-lg">Version Timeline</CardTitle>
            <CardDescription className="text-zinc-400">
              Track every uploaded, optimized, rewritten, and restored snapshot.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {versions.map((version) => {
          const selected = version.id === selectedVersionId;

          return (
            <button
              key={version.id}
              type="button"
              onClick={() => onSelectVersion(version.id)}
              className={`w-full rounded-2xl border p-4 text-left transition duration-300 ${
                selected
                  ? "border-[#00E5FF]/40 bg-[#00E5FF]/10 shadow-[0_0_30px_rgba(0,229,255,0.16)]"
                  : "border-white/10 bg-black/20 hover:border-[#00E5FF]/25 hover:bg-white/[0.06]"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-white">
                    Version {version.versionNumber}
                  </p>
                  <p className="mt-1 text-xs text-zinc-400">
                    {version.sourceLabel ?? SOURCE_LABELS[version.sourceType]}
                  </p>
                  {version.targetLabel ? (
                    <p className="mt-1 text-xs text-cyan-100">{version.targetLabel}</p>
                  ) : null}
                  <p className="mt-2 text-xs text-zinc-500">
                    {versionChangeSummary(versions, version)}
                  </p>
                </div>
                <span className="rounded-full border border-[#6A5CFF]/25 bg-[#6A5CFF]/10 px-2.5 py-1 text-xs text-purple-100">
                  {formatDate(version.createdAt)}
                </span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-xl border border-white/10 bg-[#070B1F]/60 p-2">
                  <p className="text-zinc-500">ATS</p>
                  <p className={`mt-1 font-semibold ${getScoreTone(version.atsScore)}`}>
                    {compactScore(version.atsScore)}
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-[#070B1F]/60 p-2">
                  <p className="text-zinc-500">JD Match</p>
                  <p className={`mt-1 font-semibold ${getScoreTone(version.jobMatchScore)}`}>
                    {compactScore(version.jobMatchScore)}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </CardContent>
    </Card>
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
  const hasMissingCurrentScore =
    !hasScore(selectedVersion.atsScore) || !hasScore(selectedVersion.jobMatchScore);

  return (
    <Card className={`${forge.cardStrong} overflow-hidden`}>
      <CardHeader className="border-b border-white/10 pb-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-cyan-100">
              <GitCompareArrows className="h-4 w-4" />
              <p className="text-xs font-semibold uppercase tracking-wide">
                Compare Versions
              </p>
            </div>
            <CardTitle className="mt-2 text-2xl">
              {previousVersion
                ? `Version ${previousVersion.versionNumber} to Version ${selectedVersion.versionNumber}`
                : `Version ${selectedVersion.versionNumber} baseline`}
            </CardTitle>
            <CardDescription className="mt-2 text-zinc-400">
              {SOURCE_LABELS[selectedVersion.sourceType]} versions can be compared once ATS or JD Match analysis has been run for that snapshot.
            </CardDescription>
          </div>
          <VersionRestoreDialog version={selectedVersion} />
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-3 md:grid-cols-2">
          <div className={forge.metric}>
            <p className="text-xs font-medium uppercase text-zinc-500">ATS Score</p>
            <div className="mt-2 flex flex-wrap items-end gap-3">
              <span className={`font-semibold text-zinc-500 ${hasScore(comparison.ats.previous) ? "text-3xl" : "text-xl"}`}>
                {formatScore(comparison.ats.previous)}
              </span>
              <ArrowRight className="mb-2 h-4 w-4 text-zinc-500" />
              <span className={`font-semibold ${getScoreTone(selectedVersion.atsScore)} ${hasScore(comparison.ats.current) ? "text-3xl" : "text-xl"}`}>
                {formatScore(comparison.ats.current)}
              </span>
              <span className="mb-1 rounded-full border border-[#00E5FF]/20 bg-[#00E5FF]/10 px-2 py-1 text-xs text-cyan-100">
                {comparison.ats.label}
              </span>
            </div>
          </div>
          <div className={forge.metric}>
            <p className="text-xs font-medium uppercase text-zinc-500">JD Match</p>
            <div className="mt-2 flex flex-wrap items-end gap-3">
              <span className={`font-semibold text-zinc-500 ${hasScore(comparison.jdMatch.previous) ? "text-3xl" : "text-xl"}`}>
                {formatScore(comparison.jdMatch.previous)}
              </span>
              <ArrowRight className="mb-2 h-4 w-4 text-zinc-500" />
              <span
                className={`font-semibold ${getScoreTone(
                  selectedVersion.jobMatchScore
                )} ${hasScore(comparison.jdMatch.current) ? "text-3xl" : "text-xl"}`}
              >
                {formatScore(comparison.jdMatch.current)}
              </span>
              <span className="mb-1 rounded-full border border-[#6A5CFF]/25 bg-[#6A5CFF]/10 px-2 py-1 text-xs text-purple-100">
                {comparison.jdMatch.label}
              </span>
            </div>
          </div>
        </div>
        {hasMissingCurrentScore ? (
          <div className="rounded-2xl border border-amber-300/15 bg-amber-300/[0.06] p-4">
            <p className="text-sm leading-6 text-amber-100">
              Run ATS analysis or JD Match for this version to compare score improvements.
            </p>
            <div className="mt-3 flex flex-wrap gap-3">
              {!hasScore(selectedVersion.atsScore) ? (
                <Button asChild variant="outline" className={forge.secondaryButton}>
                  <Link href="/dashboard/resume/ats">Run ATS for this version</Link>
                </Button>
              ) : null}
              {!hasScore(selectedVersion.jobMatchScore) ? (
                <Button asChild variant="outline" className={forge.secondaryButton}>
                  <Link href="/dashboard/resume/match">Match this version to a JD</Link>
                </Button>
              ) : null}
            </div>
          </div>
        ) : null}
        <div className="grid gap-3 lg:grid-cols-3">
          <div className="rounded-2xl border border-emerald-300/15 bg-emerald-300/[0.06] p-4">
            <p className="text-sm font-semibold text-emerald-200">Skills Added</p>
            <SkillCategoryList
              skills={semanticDiff.addedSkills}
              emptyText="No new skills in this version."
            />
          </div>
          <div className="rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.06] p-4">
            <p className="text-sm font-semibold text-cyan-200">Keywords Added</p>
            <p className="mt-2 text-sm leading-6 text-zinc-300">
              {keywordList(
                selectedVersion.addedKeywords,
                "No new keywords in this version."
              )}
            </p>
          </div>
          <div className="rounded-2xl border border-amber-300/15 bg-amber-300/[0.06] p-4">
            <p className="text-sm font-semibold text-amber-200">Skills Lost</p>
            <SkillCategoryList
              skills={semanticDiff.removedSkills}
              emptyText="No important skills were removed."
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ResumeEvolutionChart({
  versions,
}: {
  versions: ResumeHistoryVersion[];
}) {
  const scoredVersions = versions.filter(
    (version) => version.atsScore !== null || version.jobMatchScore !== null
  );

  return (
    <Card className={`${forge.card} overflow-hidden`}>
      <CardHeader className="border-b border-white/10 bg-[#070B1F]/60">
        <div className="flex items-center gap-3">
          <span className="rounded-2xl border border-[#6A5CFF]/25 bg-[#6A5CFF]/10 p-2 text-purple-100">
            <TrendingUp className="h-4 w-4" />
          </span>
          <div>
            <CardTitle className="text-lg">Resume Evolution Chart</CardTitle>
            <CardDescription className="text-zinc-400">
              ATS and JD trend from Version 1 to Version {versions.at(-1)?.versionNumber ?? 1}.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {scoredVersions.length ? (
          <div className="space-y-4">
            {versions.map((version) => (
              <div key={version.id} className="grid gap-2 sm:grid-cols-[110px_1fr]">
                <p className="text-sm text-zinc-400">V{version.versionNumber}</p>
                <div className="space-y-2">
                  <div>
                    <div className="mb-1 flex justify-between text-xs text-zinc-500">
                      <span>ATS</span>
                      <span>{hasScore(version.atsScore) ? formatScore(version.atsScore) : "Not analyzed"}</span>
                    </div>
                    {hasScore(version.atsScore) ? (
                      <div className={`h-2 ${forge.progressTrack}`}>
                        <div
                          className={forge.progressFill}
                          style={{ width: `${version.atsScore}%` }}
                        />
                      </div>
                    ) : (
                      <div className={`h-2 border border-dashed border-white/10 ${forge.progressTrack}`} />
                    )}
                  </div>
                  <div>
                    <div className="mb-1 flex justify-between text-xs text-zinc-500">
                      <span>JD Match</span>
                      <span>{hasScore(version.jobMatchScore) ? formatScore(version.jobMatchScore) : "Not analyzed"}</span>
                    </div>
                    {hasScore(version.jobMatchScore) ? (
                      <div className={`h-2 ${forge.progressTrack}`}>
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#00E5FF] shadow-[0_0_18px_rgba(106,92,255,0.3)]"
                          style={{ width: `${version.jobMatchScore}%` }}
                        />
                      </div>
                    ) : (
                      <div className={`h-2 border border-dashed border-white/10 ${forge.progressTrack}`} />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm leading-6 text-zinc-400">
            Score trends will appear after ATS or JD match scores are saved on versions.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export function VersionRestoreDialog({
  version,
}: {
  version: ResumeHistoryVersion;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(
    restoreResumeVersion,
    initialRestoreResumeVersionState
  );

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
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#070B1F] p-6 text-white shadow-[0_0_60px_rgba(106,92,255,0.2)]">
            <h3 className="text-xl font-semibold">Restore Version {version.versionNumber}?</h3>
            <p className="mt-3 text-sm leading-6 text-zinc-400">
              This will replace the current resume text with this version and create a new
              restored snapshot in the timeline. Uploaded PDFs are not deleted.
            </p>
            <form action={formAction} className="mt-5 space-y-4">
              <input type="hidden" name="versionId" value={version.id} />
              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Button
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
      <Card className={forge.card}>
        <CardContent className="p-8 text-center text-zinc-400">
          Upload a resume to start tracking version history.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className={forge.cardStrong}>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className={forge.badge}>Resume Versions</p>
              <CardTitle className="mt-3 text-2xl">History command center</CardTitle>
              <CardDescription className="mt-2 max-w-2xl text-zinc-400">
                Save, compare, and restore resume versions as your ATS score,
                JD match, and keyword coverage evolve.
              </CardDescription>
            </div>
            <label className="grid gap-2 text-sm text-zinc-300">
              <span className="font-medium text-zinc-200">Selected Resume</span>
              <select
                value={selectedResume.id}
                onChange={(event) => handleResumeChange(event.target.value)}
                className={`${forge.select} min-w-72`}
              >
                {availableResumes.map((resume) => (
                  <option key={resume.id} value={resume.id}>
                    {resume.title}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
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
          <div className="grid gap-6 lg:grid-cols-2">
            <ImprovementSummary
              selectedVersion={selectedVersion}
              previousVersion={previousVersion}
            />
            <ResumeEvolutionChart versions={versions} />
          </div>
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
  const netSkillGrowth =
    semanticDiff.currentSkills.length - semanticDiff.previousSkills.length;
  const improvements = [
    {
      label: "ATS improvement",
      value: comparison.ats.label,
    },
    {
      label: "JD match improvement",
      value: comparison.jdMatch.label,
    },
    {
      label: "Skills Added",
      value: `${semanticDiff.addedSkills.length} added`,
    },
    {
      label: "Skills Lost",
      value: semanticDiff.removedSkills.length
        ? `${semanticDiff.removedSkills.length} lost`
        : "None",
    },
    {
      label: "Net Skill Growth",
      value: `${netSkillGrowth > 0 ? "+" : ""}${netSkillGrowth}`,
    },
  ];

  return (
    <Card className={`${forge.card} overflow-hidden`}>
      <CardHeader className="border-b border-white/10 bg-[#070B1F]/60">
        <div className="flex items-center gap-3">
          <span className="rounded-2xl border border-[#00E5FF]/20 bg-[#00E5FF]/10 p-2 text-cyan-100">
            <Sparkles className="h-4 w-4" />
          </span>
          <div>
            <CardTitle className="text-lg">Improvement Summary</CardTitle>
            <CardDescription className="text-zinc-400">
              What changed in the selected version.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2">
        {improvements.map((item) => (
          <div key={item.label} className={forge.metric}>
            <p className="text-xs font-medium uppercase text-zinc-500">{item.label}</p>
            <p className="mt-2 text-lg font-semibold text-zinc-100">{item.value}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
