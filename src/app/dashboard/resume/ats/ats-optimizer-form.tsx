"use client";

import {
  useActionState,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import { optimizeResumeForATS } from "@/app/dashboard/resume/ats/actions";
import { initialATSOptimizerState } from "@/app/dashboard/resume/ats/state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import type {
  ATSOptimizationAnalysis,
  ATSWarningSeverity,
} from "@/lib/ats-optimizer";

type ResumeOption = {
  id: string;
  title: string;
  createdAtLabel: string;
};

type SavedATSState = {
  resumeId: string;
  jobDescription: string;
  analysis: ATSOptimizationAnalysis;
};

const ATS_STORAGE_KEY = "talentforge.atsOptimizer.latest";
const ATS_STORAGE_EVENT = "talentforge.atsOptimizer.storage";

function subscribeToSavedATS(callback: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  window.addEventListener("storage", callback);
  window.addEventListener(ATS_STORAGE_EVENT, callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(ATS_STORAGE_EVENT, callback);
  };
}

function getSavedATSSnapshot() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(ATS_STORAGE_KEY);
}

function getServerSavedATSSnapshot() {
  return null;
}

function notifySavedATSChanged() {
  window.dispatchEvent(new Event(ATS_STORAGE_EVENT));
}

function scoreWidth(score: number, maxScore = 100) {
  return `${Math.max(0, Math.min(100, (score / maxScore) * 100))}%`;
}

function severityTone(severity: ATSWarningSeverity) {
  if (severity === "High") {
    return "border-red-300/25 bg-red-300/10 text-red-100";
  }

  if (severity === "Medium") {
    return "border-amber-300/25 bg-amber-300/10 text-amber-100";
  }

  return "border-cyan-300/25 bg-cyan-300/10 text-cyan-100";
}

function ListCard({
  title,
  items,
  tone = "default",
  emptyText = "No items found.",
}: {
  title: string;
  items: string[];
  tone?: "default" | "good" | "warn";
  emptyText?: string;
}) {
  const titleTone =
    tone === "good"
      ? "text-emerald-200"
      : tone === "warn"
        ? "text-amber-200"
        : "text-zinc-100";

  return (
    <Card className="border-white/10 bg-gradient-to-b from-white/[0.075] to-white/[0.035] text-white shadow-[0_18px_60px_rgba(0,0,0,0.22)] ring-1 ring-white/10">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className={`text-base ${titleTone}`}>{title}</CardTitle>
          <span className="rounded-full border border-white/10 bg-black/20 px-2 py-0.5 text-xs text-zinc-400">
            {items.length}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 text-sm leading-6 text-zinc-400">
          {(items.length ? items : [emptyText]).slice(0, 10).map((item) => {
            const marker =
              tone === "good"
                ? "bg-emerald-300"
                : tone === "warn"
                  ? "bg-amber-300"
                  : "bg-cyan-300";

            return (
              <li key={item} className="flex gap-2">
                <span className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${marker}`} />
                <span>{item}</span>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}

export function ATSOptimizerForm({ resumes }: { resumes: ResumeOption[] }) {
  const [state, formAction, pending] = useActionState(
    optimizeResumeForATS,
    initialATSOptimizerState
  );
  const [hideCurrentActionResult, setHideCurrentActionResult] = useState(false);
  const lastSubmittedResumeId = useRef("");
  const lastSubmittedJobDescription = useRef("");
  const savedATSSnapshot = useSyncExternalStore(
    subscribeToSavedATS,
    getSavedATSSnapshot,
    getServerSavedATSSnapshot
  );
  const resumeIds = useMemo(() => new Set(resumes.map((resume) => resume.id)), [resumes]);
  const savedATSState = useMemo(() => {
    if (!savedATSSnapshot) return null;

    try {
      const parsed = JSON.parse(savedATSSnapshot) as Partial<SavedATSState>;

      if (
        typeof parsed.resumeId !== "string" ||
        typeof parsed.jobDescription !== "string" ||
        !parsed.analysis
      ) {
        return null;
      }

      return parsed as SavedATSState;
    } catch {
      return null;
    }
  }, [savedATSSnapshot]);
  const validSavedATSState =
    savedATSState && resumeIds.has(savedATSState.resumeId) ? savedATSState : null;
  const analysis = hideCurrentActionResult
    ? validSavedATSState?.analysis ?? null
    : state.analysis ?? validSavedATSState?.analysis ?? null;

  useEffect(() => {
    if (savedATSSnapshot && !validSavedATSState) {
      window.localStorage.removeItem(ATS_STORAGE_KEY);
      notifySavedATSChanged();
    }
  }, [savedATSSnapshot, validSavedATSState]);

  useEffect(() => {
    if (
      state.status !== "success" ||
      !state.analysis ||
      !lastSubmittedResumeId.current
    ) {
      return;
    }

    const nextSavedState: SavedATSState = {
      resumeId: lastSubmittedResumeId.current,
      jobDescription: lastSubmittedJobDescription.current,
      analysis: state.analysis,
    };

    window.localStorage.setItem(ATS_STORAGE_KEY, JSON.stringify(nextSavedState));
    notifySavedATSChanged();
  }, [state.analysis, state.status]);

  function submitATSOptimization(formData: FormData) {
    const resumeId = formData.get("resumeId");
    const jobDescription = formData.get("jobDescription");

    lastSubmittedResumeId.current =
      typeof resumeId === "string" ? resumeId : "";
    lastSubmittedJobDescription.current =
      typeof jobDescription === "string" ? jobDescription : "";
    setHideCurrentActionResult(false);
    formAction(formData);
  }

  function clearSavedATSAnalysis() {
    const confirmed = window.confirm("Clear this saved ATS analysis?");

    if (!confirmed) {
      return;
    }

    window.localStorage.removeItem(ATS_STORAGE_KEY);
    notifySavedATSChanged();
    setHideCurrentActionResult(true);
  }

  return (
    <div className="space-y-10">
      <Card className="overflow-hidden border-cyan-200/15 bg-gradient-to-br from-cyan-300/[0.1] via-white/[0.055] to-emerald-300/[0.055] text-white shadow-[0_28px_90px_rgba(0,0,0,0.38)] ring-1 ring-cyan-200/10">
        <CardHeader className="border-b border-white/10 bg-black/10">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <CardTitle className="text-xl">Optimize for ATS</CardTitle>
              <p className="mt-2 text-sm leading-6 text-zinc-400">
                Select a resume, paste a full JD, and get keyword, bullet, and
                readability fixes.
              </p>
            </div>
            <p className="text-xs font-medium uppercase text-cyan-100">
              Saved locally only
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <form action={submitATSOptimization} className="space-y-6 pt-6">
            <div className="grid gap-5 lg:grid-cols-[380px_1fr]">
              <div className="rounded-xl border border-white/10 bg-black/20 p-4 shadow-inner">
                <label htmlFor="resumeId" className="text-sm font-medium text-zinc-200">
                  Resume
                </label>
                <p className="mt-1 text-xs leading-5 text-zinc-500">
                  Only readable resumes uploaded by you are available.
                </p>
                <select
                  key={`ats-resume-${validSavedATSState?.resumeId ?? "empty"}`}
                  id="resumeId"
                  name="resumeId"
                  required
                  defaultValue={validSavedATSState?.resumeId ?? ""}
                  className="mt-3 h-12 w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 text-sm text-white outline-none ring-cyan-300/20 transition focus:border-cyan-200/50 focus:ring-2"
                >
                  <option value="">Select a resume</option>
                  {resumes.map((resume) => (
                    <option key={resume.id} value={resume.id} className="bg-slate-950">
                      {resume.title} - {resume.createdAtLabel}
                    </option>
                  ))}
                </select>
              </div>

              <div className="rounded-xl border border-white/10 bg-black/20 p-4 shadow-inner">
                <label
                  htmlFor="jobDescription"
                  className="text-sm font-medium text-zinc-200"
                >
                  Job description
                </label>
                <p className="mt-1 text-xs leading-5 text-zinc-500">
                  Paste responsibilities, requirements, skills, tools, and
                  preferred qualifications. Short or vague JDs are rejected.
                </p>
                <Textarea
                  key={`ats-jd-${validSavedATSState?.resumeId ?? "empty"}`}
                  id="jobDescription"
                  name="jobDescription"
                  required
                  rows={12}
                  defaultValue={validSavedATSState?.jobDescription ?? ""}
                  placeholder="Paste the complete job description with responsibilities, requirements, and qualifications..."
                  className="mt-3 min-h-80 rounded-xl border-white/10 bg-slate-950/70 p-4 text-white shadow-inner placeholder:text-zinc-500 focus-visible:border-cyan-200/50 focus-visible:ring-cyan-300/20"
                />
              </div>
            </div>

            {state.message ? (
              <p
                aria-live="polite"
                className={
                  state.status === "error"
                    ? "rounded-md border border-red-300/20 bg-red-400/10 px-3 py-2 text-sm text-red-200"
                    : "rounded-md border border-emerald-300/20 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-200"
                }
              >
                {state.message}
              </p>
            ) : null}

            <Button
              type="submit"
              disabled={pending || resumes.length === 0}
              className="h-12 rounded-xl bg-gradient-to-r from-cyan-200 to-emerald-200 px-6 text-slate-950 shadow-[0_16px_45px_rgba(34,211,238,0.22)] hover:from-cyan-100 hover:to-emerald-100 disabled:opacity-60"
            >
              {pending ? "Optimizing..." : "Optimize for ATS"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {analysis ? (
        <section className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase text-cyan-100">
                ATS Optimization Report
              </p>
              <p className="mt-1 text-sm text-zinc-500">
                Saved locally in this browser for refresh recovery.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={clearSavedATSAnalysis}
              className="border-white/15 bg-white/[0.04] text-white hover:border-cyan-200/30 hover:bg-cyan-300/10 hover:text-white"
            >
              Clear saved ATS analysis
            </Button>
          </div>

          <Card className="overflow-hidden border-white/10 bg-gradient-to-br from-white/[0.09] via-white/[0.045] to-cyan-300/[0.055] text-white shadow-[0_28px_100px_rgba(0,0,0,0.38)] ring-1 ring-white/10">
            <CardContent className="space-y-5 pt-6">
              <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
                <div className="flex items-center justify-center rounded-2xl border border-cyan-200/15 bg-black/25 p-6">
                  <div
                    className="grid h-40 w-40 place-items-center rounded-full"
                    style={{
                      background: `conic-gradient(rgb(103 232 249) ${analysis.atsScore}%, rgba(255,255,255,0.1) 0)`,
                    }}
                  >
                    <div className="grid h-32 w-32 place-items-center rounded-full bg-[#07101a] shadow-inner">
                      <div className="text-center">
                        <p className="text-4xl font-semibold text-cyan-100">
                          {analysis.atsScore}
                        </p>
                        <p className="text-xs uppercase text-zinc-500">ATS score</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="grid gap-3 md:grid-cols-3">
                    <div className="rounded-xl border border-emerald-200/20 bg-emerald-300/10 p-4">
                      <p className="text-xs font-medium uppercase text-emerald-100/70">
                        Keyword coverage
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-emerald-100">
                        {analysis.keywordCoverage}%
                      </p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                      <p className="text-xs font-medium uppercase text-zinc-500">
                        Target role
                      </p>
                      <p className="mt-2 text-xl font-semibold text-zinc-100">
                        {analysis.targetRole}
                      </p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                      <p className="text-xs font-medium uppercase text-zinc-500">
                        Domain
                      </p>
                      <p className="mt-2 text-xl font-semibold text-zinc-100">
                        {analysis.detectedDomain}
                      </p>
                    </div>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/10 shadow-inner">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-emerald-300"
                      style={{ width: scoreWidth(analysis.atsScore) }}
                    />
                  </div>
                  <p className="text-sm leading-6 text-zinc-300">{analysis.summary}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div>
            <div className="mb-3">
              <p className="text-sm font-semibold uppercase text-cyan-100">
                Score Breakdown
              </p>
              <h2 className="mt-1 text-xl font-semibold">ATS categories</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {analysis.categoryScores.map((category) => (
                <Card
                  key={category.name}
                  className="border-white/10 bg-gradient-to-b from-white/[0.075] to-white/[0.035] text-white shadow-[0_18px_60px_rgba(0,0,0,0.2)] ring-1 ring-white/10"
                >
                  <CardHeader className="space-y-3 pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <CardTitle className="text-base">{category.name}</CardTitle>
                      <p className="rounded-md border border-cyan-300/20 bg-cyan-300/10 px-2 py-1 text-sm font-semibold text-cyan-100">
                        {category.score}/{category.maxScore}
                      </p>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-emerald-300"
                        style={{ width: scoreWidth(category.score, category.maxScore) }}
                      />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-6 text-zinc-400">
                      {category.reason}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            <ListCard
              title="Matched ATS Keywords"
              items={analysis.matchedATSKeywords}
              tone="good"
              emptyText="No strong ATS keyword matches found."
            />
            <ListCard
              title="Missing ATS Keywords"
              items={analysis.missingATSKeywords}
              tone="warn"
              emptyText="No major missing keywords detected."
            />
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            <ListCard
              title="Weak Bullets"
              items={analysis.weakBullets}
              tone="warn"
              emptyText="No weak bullets detected from extracted text."
            />
            <Card className="border-white/10 bg-gradient-to-b from-white/[0.075] to-white/[0.035] text-white shadow-[0_18px_60px_rgba(0,0,0,0.22)] ring-1 ring-white/10">
              <CardHeader>
                <CardTitle>Optimized bullets</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {(analysis.optimizedBullets.length
                  ? analysis.optimizedBullets
                  : [
                      {
                        original: "No weak bullet rewrite needed.",
                        improved: "Your visible bullets already have enough structure for this pass.",
                        reason: "No vague extracted bullets were selected for optimization.",
                      },
                    ]
                ).map((item) => (
                  <div
                    key={item.original}
                    className="rounded-xl border border-cyan-200/15 bg-cyan-300/[0.055] p-4"
                  >
                    <p className="text-xs font-medium uppercase text-zinc-500">
                      Original
                    </p>
                    <p className="mt-1 text-sm leading-6 text-zinc-300">
                      {item.original}
                    </p>
                    <p className="mt-3 text-xs font-medium uppercase text-cyan-100">
                      Improved
                    </p>
                    <p className="mt-1 text-sm leading-6 text-cyan-50">
                      {item.improved}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-zinc-400">
                      {item.reason}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card className="border-white/10 bg-gradient-to-b from-white/[0.075] to-white/[0.035] text-white shadow-[0_18px_60px_rgba(0,0,0,0.22)] ring-1 ring-white/10">
            <CardHeader>
              <CardTitle>ATS warnings</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              {(analysis.atsWarnings.length
                ? analysis.atsWarnings
                : [
                    {
                      warning: "No major ATS warnings detected.",
                      severity: "Low" as ATSWarningSeverity,
                      fix: "Keep tailoring keywords and measurable evidence to the JD.",
                    },
                  ]
              ).map((item) => (
                <div
                  key={`${item.warning}-${item.severity}`}
                  className="rounded-xl border border-white/10 bg-black/20 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-zinc-100">{item.warning}</p>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-xs ${severityTone(
                        item.severity
                      )}`}
                    >
                      {item.severity}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">{item.fix}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="grid gap-4 lg:grid-cols-2">
            <ListCard title="Strengths" items={analysis.strengths} tone="good" />
            <ListCard title="Quick Wins" items={analysis.quickWins} />
          </div>
        </section>
      ) : null}
    </div>
  );
}
