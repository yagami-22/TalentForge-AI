"use client";

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
import type { ResumeVersionSourceType } from "@/lib/resume-versioning";

export type ResumeHistoryVersion = {
  id: string;
  resumeId: string;
  versionNumber: number;
  sourceType: ResumeVersionSourceType;
  createdAt: string;
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

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function scoreDisplay(score: number | null) {
  return score === null ? "--" : String(score);
}

function scoreDelta(previous: number | null, current: number | null) {
  if (previous === null || current === null) return null;

  return current - previous;
}

function deltaLabel(delta: number | null) {
  if (delta === null) return "No prior score";
  if (delta === 0) return "No change";

  return `${delta > 0 ? "+" : ""}${delta}`;
}

function getScoreTone(score: number | null) {
  if (score === null) return "text-zinc-500";
  if (score >= 80) return "text-emerald-300";
  if (score >= 60) return "text-cyan-200";
  return "text-amber-200";
}

function findPreviousVersion(
  versions: ResumeHistoryVersion[],
  selectedVersion: ResumeHistoryVersion
) {
  const selectedIndex = versions.findIndex((version) => version.id === selectedVersion.id);

  return selectedIndex > 0 ? versions[selectedIndex - 1] : null;
}

function keywordList(items: string[], emptyText: string) {
  return items.length ? items.slice(0, 10).join(", ") : emptyText;
}

function getSkillSignals(items: string[]) {
  return items.filter((item) =>
    /\b(?:react|typescript|javascript|next\.js|sql|api|apis|testing|git|github|database|authentication|machine learning|frontend|backend|docker|cloud|accessibility|seo|ci\/cd)\b/i.test(
      item
    )
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
                    {SOURCE_LABELS[version.sourceType]}
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
                    {scoreDisplay(version.atsScore)}
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-[#070B1F]/60 p-2">
                  <p className="text-zinc-500">JD Match</p>
                  <p className={`mt-1 font-semibold ${getScoreTone(version.jobMatchScore)}`}>
                    {scoreDisplay(version.jobMatchScore)}
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
  const atsDelta = scoreDelta(previousVersion?.atsScore ?? null, selectedVersion.atsScore);
  const matchDelta = scoreDelta(
    previousVersion?.jobMatchScore ?? null,
    selectedVersion.jobMatchScore
  );

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
              Version {previousVersion?.versionNumber ?? selectedVersion.versionNumber}
              {previousVersion ? " to " : " baseline "}
              Version {selectedVersion.versionNumber}
            </CardTitle>
            <CardDescription className="mt-2 text-zinc-400">
              Side-by-side improvement signals from the selected version.
            </CardDescription>
          </div>
          <VersionRestoreDialog version={selectedVersion} />
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-3 md:grid-cols-2">
          <div className={forge.metric}>
            <p className="text-xs font-medium uppercase text-zinc-500">ATS Score</p>
            <div className="mt-2 flex items-end gap-3">
              <span className="text-3xl font-semibold text-zinc-500">
                {scoreDisplay(previousVersion?.atsScore ?? null)}
              </span>
              <ArrowRight className="mb-2 h-4 w-4 text-zinc-500" />
              <span className={`text-3xl font-semibold ${getScoreTone(selectedVersion.atsScore)}`}>
                {scoreDisplay(selectedVersion.atsScore)}
              </span>
              <span className="mb-1 rounded-full border border-[#00E5FF]/20 bg-[#00E5FF]/10 px-2 py-1 text-xs text-cyan-100">
                {deltaLabel(atsDelta)}
              </span>
            </div>
          </div>
          <div className={forge.metric}>
            <p className="text-xs font-medium uppercase text-zinc-500">JD Match</p>
            <div className="mt-2 flex items-end gap-3">
              <span className="text-3xl font-semibold text-zinc-500">
                {scoreDisplay(previousVersion?.jobMatchScore ?? null)}
              </span>
              <ArrowRight className="mb-2 h-4 w-4 text-zinc-500" />
              <span
                className={`text-3xl font-semibold ${getScoreTone(
                  selectedVersion.jobMatchScore
                )}`}
              >
                {scoreDisplay(selectedVersion.jobMatchScore)}
              </span>
              <span className="mb-1 rounded-full border border-[#6A5CFF]/25 bg-[#6A5CFF]/10 px-2 py-1 text-xs text-purple-100">
                {deltaLabel(matchDelta)}
              </span>
            </div>
          </div>
        </div>
        <div className="grid gap-3 lg:grid-cols-3">
          <div className="rounded-2xl border border-emerald-300/15 bg-emerald-300/[0.06] p-4">
            <p className="text-sm font-semibold text-emerald-200">Keywords Added</p>
            <p className="mt-2 text-sm leading-6 text-zinc-300">
              {keywordList(selectedVersion.addedKeywords, "No new keywords in this version.")}
            </p>
          </div>
          <div className="rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.06] p-4">
            <p className="text-sm font-semibold text-cyan-200">Skills Added</p>
            <p className="mt-2 text-sm leading-6 text-zinc-300">
              {keywordList(
                getSkillSignals(selectedVersion.addedKeywords),
                "No new skill signals in this version."
              )}
            </p>
          </div>
          <div className="rounded-2xl border border-amber-300/15 bg-amber-300/[0.06] p-4">
            <p className="text-sm font-semibold text-amber-200">Keywords Removed</p>
            <p className="mt-2 text-sm leading-6 text-zinc-300">
              {keywordList(
                selectedVersion.removedKeywords,
                "No important keywords were removed."
              )}
            </p>
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
                      <span>{scoreDisplay(version.atsScore)}</span>
                    </div>
                    <div className={`h-2 ${forge.progressTrack}`}>
                      <div
                        className={forge.progressFill}
                        style={{ width: `${version.atsScore ?? 0}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="mb-1 flex justify-between text-xs text-zinc-500">
                      <span>JD Match</span>
                      <span>{scoreDisplay(version.jobMatchScore)}</span>
                    </div>
                    <div className={`h-2 ${forge.progressTrack}`}>
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#00E5FF] shadow-[0_0_18px_rgba(106,92,255,0.3)]"
                        style={{ width: `${version.jobMatchScore ?? 0}%` }}
                      />
                    </div>
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
  const [selectedResumeId, setSelectedResumeId] = useState(resumes[0]?.id ?? "");
  const selectedResume = useMemo(
    () => resumes.find((resume) => resume.id === selectedResumeId) ?? resumes[0],
    [resumes, selectedResumeId]
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
    ? findPreviousVersion(versions, selectedVersion)
    : null;

  function handleResumeChange(resumeId: string) {
    const nextResume = resumes.find((resume) => resume.id === resumeId);

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
                {resumes.map((resume) => (
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
  const atsDelta = scoreDelta(previousVersion?.atsScore ?? null, selectedVersion.atsScore);
  const matchDelta = scoreDelta(
    previousVersion?.jobMatchScore ?? null,
    selectedVersion.jobMatchScore
  );
  const improvements = [
    {
      label: "ATS improvement",
      value: deltaLabel(atsDelta),
    },
    {
      label: "JD match improvement",
      value: deltaLabel(matchDelta),
    },
    {
      label: "Keyword growth",
      value: `${selectedVersion.addedKeywords.length} added`,
    },
    {
      label: "Skill growth",
      value: getSkillSignals(selectedVersion.addedKeywords).length
        ? `${getSkillSignals(selectedVersion.addedKeywords).length} skills added`
        : "No new skill signals",
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
