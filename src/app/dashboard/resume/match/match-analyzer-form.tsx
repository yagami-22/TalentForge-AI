"use client";

import {
  useActionState,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import { analyzeResumeMatch } from "@/app/dashboard/resume/match/actions";
import { initialMatchResumeState } from "@/app/dashboard/resume/match/state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import type { JobDescriptionMatchAnalysis } from "@/lib/jd-match-analyzer";

type ResumeOption = {
  id: string;
  title: string;
  createdAtLabel: string;
};

type SavedMatchState = {
  resumeId: string;
  jobDescription: string;
  analysis: JobDescriptionMatchAnalysis;
};

const JD_MATCH_STORAGE_KEY = "talentforge.jdMatch.latest";
const JD_MATCH_STORAGE_EVENT = "talentforge.jdMatch.storage";

function subscribeToSavedMatch(callback: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  window.addEventListener("storage", callback);
  window.addEventListener(JD_MATCH_STORAGE_EVENT, callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(JD_MATCH_STORAGE_EVENT, callback);
  };
}

function getSavedMatchSnapshot() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(JD_MATCH_STORAGE_KEY);
}

function getServerSavedMatchSnapshot() {
  return null;
}

function notifySavedMatchChanged() {
  window.dispatchEvent(new Event(JD_MATCH_STORAGE_EVENT));
}

function scoreWidth(score: number, maxScore = 100) {
  return `${Math.max(0, Math.min(100, (score / maxScore) * 100))}%`;
}

function statusTone(status: string) {
  if (status === "Matched") {
    return "border-emerald-300/25 bg-emerald-300/10 text-emerald-100";
  }

  if (status === "Partial") {
    return "border-amber-300/25 bg-amber-300/10 text-amber-100";
  }

  return "border-red-300/25 bg-red-300/10 text-red-100";
}

function ListBlock({
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
          {(items.length ? items : ["No items found."]).slice(0, 8).map((item) => {
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

export function MatchAnalyzerForm({ resumes }: { resumes: ResumeOption[] }) {
  const [state, formAction, pending] = useActionState(
    analyzeResumeMatch,
    initialMatchResumeState
  );
  const [hideCurrentActionResult, setHideCurrentActionResult] = useState(false);
  const lastSubmittedResumeId = useRef("");
  const lastSubmittedJobDescription = useRef("");
  const savedMatchSnapshot = useSyncExternalStore(
    subscribeToSavedMatch,
    getSavedMatchSnapshot,
    getServerSavedMatchSnapshot
  );
  const resumeIds = useMemo(() => new Set(resumes.map((resume) => resume.id)), [resumes]);
  const savedMatchState = useMemo(() => {
    if (!savedMatchSnapshot) return null;

    try {
      const parsed = JSON.parse(savedMatchSnapshot) as Partial<SavedMatchState>;

      if (
        typeof parsed.resumeId !== "string" ||
        typeof parsed.jobDescription !== "string" ||
        !parsed.analysis
      ) {
        return null;
      }

      return parsed as SavedMatchState;
    } catch {
      return null;
    }
  }, [savedMatchSnapshot]);
  const validSavedMatchState =
    savedMatchState && resumeIds.has(savedMatchState.resumeId)
      ? savedMatchState
      : null;
  const analysis = hideCurrentActionResult
    ? validSavedMatchState?.analysis ?? null
    : state.analysis ?? validSavedMatchState?.analysis ?? null;

  useEffect(() => {
    if (savedMatchSnapshot && !validSavedMatchState) {
      window.localStorage.removeItem(JD_MATCH_STORAGE_KEY);
      notifySavedMatchChanged();
    }
  }, [savedMatchSnapshot, validSavedMatchState]);

  useEffect(() => {
    if (
      state.status !== "success" ||
      !state.analysis ||
      !lastSubmittedResumeId.current
    ) {
      return;
    }

    const nextSavedState: SavedMatchState = {
      resumeId: lastSubmittedResumeId.current,
      jobDescription: lastSubmittedJobDescription.current,
      analysis: state.analysis,
    };

    window.localStorage.setItem(
      JD_MATCH_STORAGE_KEY,
      JSON.stringify(nextSavedState)
    );
    notifySavedMatchChanged();
  }, [state.analysis, state.status]);

  function submitMatch(formData: FormData) {
    const resumeId = formData.get("resumeId");
    const jobDescription = formData.get("jobDescription");

    lastSubmittedResumeId.current =
      typeof resumeId === "string" ? resumeId : "";
    lastSubmittedJobDescription.current =
      typeof jobDescription === "string" ? jobDescription : "";
    setHideCurrentActionResult(false);
    formAction(formData);
  }

  function clearSavedMatch() {
    const confirmed = window.confirm("Clear this saved match analysis?");

    if (!confirmed) {
      return;
    }

    window.localStorage.removeItem(JD_MATCH_STORAGE_KEY);
    notifySavedMatchChanged();
    setHideCurrentActionResult(true);
  }

  return (
    <div className="space-y-10">
      <Card className="overflow-hidden border-cyan-200/15 bg-gradient-to-br from-cyan-300/[0.1] via-white/[0.055] to-emerald-300/[0.055] text-white shadow-[0_28px_90px_rgba(0,0,0,0.38)] ring-1 ring-cyan-200/10">
        <CardHeader className="border-b border-white/10 bg-black/10">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <CardTitle className="text-xl">Analyze Match</CardTitle>
              <p className="mt-2 text-sm leading-6 text-zinc-400">
                Choose a resume, paste a full JD, and receive an evidence-led
                comparison.
              </p>
            </div>
            <p className="text-xs font-medium uppercase text-cyan-100">
              Private to your workspace
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <form action={submitMatch} className="space-y-6 pt-6">
            <div className="grid gap-5 lg:grid-cols-[380px_1fr]">
              <div className="rounded-xl border border-white/10 bg-black/20 p-4 shadow-inner">
                <label htmlFor="resumeId" className="text-sm font-medium text-zinc-200">
                  Resume
                </label>
                <p className="mt-1 text-xs leading-5 text-zinc-500">
                  Select a readable uploaded resume. Only your resumes appear here.
                </p>
                <select
                  key={`resume-${validSavedMatchState?.resumeId ?? "empty"}`}
                  id="resumeId"
                  name="resumeId"
                  required
                  defaultValue={validSavedMatchState?.resumeId ?? ""}
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
                  Include responsibilities, required skills, tools, seniority,
                  and preferred qualifications for best results.
                </p>
                <Textarea
                  key={`jd-${validSavedMatchState?.resumeId ?? "empty"}`}
                  id="jobDescription"
                  name="jobDescription"
                  required
                  rows={12}
                  defaultValue={validSavedMatchState?.jobDescription ?? ""}
                  placeholder="Paste the full job description with responsibilities, requirements, and qualifications..."
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
              {pending ? "Analyzing..." : "Analyze Match"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {analysis ? (
        <section className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase text-cyan-100">
                Latest Match Report
              </p>
              <p className="mt-1 text-sm text-zinc-500">
                Saved locally in this browser for refresh recovery.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={clearSavedMatch}
              className="border-white/15 bg-white/[0.04] text-white hover:border-cyan-200/30 hover:bg-cyan-300/10 hover:text-white"
            >
              Clear saved match
            </Button>
          </div>
          <Card className="overflow-hidden border-white/10 bg-gradient-to-br from-white/[0.09] via-white/[0.045] to-cyan-300/[0.055] text-white shadow-[0_28px_100px_rgba(0,0,0,0.38)] ring-1 ring-white/10">
            <CardContent className="space-y-5 pt-6">
              <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
                <div className="flex items-center justify-center rounded-2xl border border-cyan-200/15 bg-black/25 p-6">
                  <div
                    className="grid h-40 w-40 place-items-center rounded-full"
                    style={{
                      background: `conic-gradient(rgb(103 232 249) ${analysis.matchScore}%, rgba(255,255,255,0.1) 0)`,
                    }}
                  >
                    <div className="grid h-32 w-32 place-items-center rounded-full bg-[#07101a] shadow-inner">
                      <div className="text-center">
                        <p className="text-4xl font-semibold text-cyan-100">
                          {analysis.matchScore}
                        </p>
                        <p className="text-xs uppercase text-zinc-500">
                          Match score
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="grid gap-3 md:grid-cols-3">
                    <div className="rounded-xl border border-emerald-200/20 bg-emerald-300/10 p-4">
                      <p className="text-xs font-medium uppercase text-emerald-100/70">
                        Grade
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-emerald-100">
                        {analysis.matchGrade}
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
                      style={{ width: scoreWidth(analysis.matchScore) }}
                    />
                  </div>
                  <p className="text-sm leading-6 text-zinc-300">{analysis.summary}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div>
            <div className="mb-3 flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase text-cyan-100">
                  Match Breakdown
                </p>
                <h2 className="mt-1 text-xl font-semibold">Category scores</h2>
              </div>
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
                  <p className="text-sm leading-6 text-zinc-400">{category.reason}</p>
                </CardContent>
              </Card>
            ))}
            </div>
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Skills and keywords</h2>
              <ListBlock title="Matched Skills" items={analysis.matchedSkills} tone="good" />
              <ListBlock title="Missing Skills" items={analysis.missingSkills} tone="warn" />
              <ListBlock title="Matched Keywords" items={analysis.matchedKeywords} tone="good" />
              <ListBlock title="Missing Keywords" items={analysis.missingKeywords} tone="warn" />
            </div>
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Responsibilities</h2>
              <ListBlock title="Matched Responsibilities" items={analysis.matchedResponsibilities} tone="good" />
              <ListBlock title="Missing Responsibilities" items={analysis.missingResponsibilities} tone="warn" />
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <ListBlock title="Strengths" items={analysis.strengths} tone="good" />
            <ListBlock title="Gaps" items={analysis.gaps} tone="warn" />
            <ListBlock title="Quick Wins" items={analysis.quickWins} />
          </div>

          <Card className="border-white/10 bg-gradient-to-b from-white/[0.075] to-white/[0.035] text-white shadow-[0_18px_60px_rgba(0,0,0,0.22)] ring-1 ring-white/10">
            <CardHeader>
              <CardTitle>Evidence table</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              {analysis.evidence.map((item) => (
                <div
                  key={`${item.jdRequirement}-${item.status}`}
                  className="rounded-xl border border-white/10 bg-black/20 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-zinc-100">{item.jdRequirement}</p>
                    <span className={`rounded-full border px-2 py-0.5 text-xs ${statusTone(item.status)}`}>
                      {item.status}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">
                    {item.resumeEvidence}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-gradient-to-b from-white/[0.075] to-white/[0.035] text-white shadow-[0_18px_60px_rgba(0,0,0,0.22)] ring-1 ring-white/10">
            <CardHeader>
              <CardTitle>Actionable rewrite suggestions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {analysis.rewriteSuggestions.map((item) => (
                <div key={item.resumeIssue} className="rounded-xl border border-cyan-200/15 bg-cyan-300/[0.055] p-4">
                  <p className="font-medium text-zinc-100">{item.resumeIssue}</p>
                  <p className="mt-2 text-sm leading-6 text-cyan-100">
                    {item.suggestedRewrite}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">
                    {item.whyBetter}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      ) : null}
    </div>
  );
}
