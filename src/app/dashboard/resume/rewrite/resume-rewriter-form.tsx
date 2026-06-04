"use client";

import { Check, Copy } from "lucide-react";
import type { ReactNode } from "react";
import {
  useActionState,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import { rewriteResumeForJD } from "@/app/dashboard/resume/rewrite/actions";
import { initialResumeRewriteState } from "@/app/dashboard/resume/rewrite/state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import type { ResumeRewriteResult } from "@/lib/resume-rewriter";

type ResumeOption = {
  id: string;
  title: string;
  createdAtLabel: string;
};

type SavedResumeRewriteState = {
  selectedResumeId: string;
  jobDescription: string;
  generatedRewrite: ResumeRewriteResult;
  generatedAt: string;
};

const RESUME_REWRITE_STORAGE_KEY = "talentforge_resume_rewrite";
const RESUME_REWRITE_STORAGE_EVENT = "talentforge.resumeRewrite.storage";

function subscribeToSavedRewrite(callback: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  window.addEventListener("storage", callback);
  window.addEventListener(RESUME_REWRITE_STORAGE_EVENT, callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(RESUME_REWRITE_STORAGE_EVENT, callback);
  };
}

function getSavedRewriteSnapshot() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(RESUME_REWRITE_STORAGE_KEY);
}

function getServerSavedRewriteSnapshot() {
  return null;
}

function notifySavedRewriteChanged() {
  window.dispatchEvent(new Event(RESUME_REWRITE_STORAGE_EVENT));
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isResumeRewriteResult(value: unknown): value is ResumeRewriteResult {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Partial<ResumeRewriteResult>;

  return (
    typeof candidate.professionalSummary === "string" &&
    isStringArray(candidate.experienceBullets) &&
    isStringArray(candidate.skillsSection) &&
    isStringArray(candidate.atsKeywords) &&
    isStringArray(candidate.missingSkills)
  );
}

function SectionCard({
  title,
  children,
  copyText,
  tone = "default",
}: {
  title: string;
  children: ReactNode;
  copyText: string;
  tone?: "default" | "good" | "warn";
}) {
  const [copied, setCopied] = useState(false);
  const titleTone =
    tone === "good"
      ? "text-emerald-200"
      : tone === "warn"
        ? "text-amber-200"
        : "text-zinc-100";

  async function copySection() {
    try {
      await navigator.clipboard.writeText(copyText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <Card className="border-white/10 bg-gradient-to-b from-white/[0.075] to-white/[0.035] text-white shadow-[0_18px_60px_rgba(0,0,0,0.22)] ring-1 ring-white/10">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className={`text-base ${titleTone}`}>{title}</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={copySection}
            className="border-white/15 bg-white/[0.04] text-white hover:border-cyan-200/30 hover:bg-cyan-300/10 hover:text-white"
          >
            {copied ? <Check /> : <Copy />}
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function BulletList({ items, tone = "default" }: { items: string[]; tone?: "default" | "good" | "warn" }) {
  const marker =
    tone === "good" ? "bg-emerald-300" : tone === "warn" ? "bg-amber-300" : "bg-cyan-300";

  return (
    <ul className="space-y-2 text-sm leading-6 text-zinc-300">
      {items.map((item) => (
        <li key={item} className="flex gap-2">
          <span className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${marker}`} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function ResumeRewriterForm({ resumes }: { resumes: ResumeOption[] }) {
  const [state, formAction, pending] = useActionState(
    rewriteResumeForJD,
    initialResumeRewriteState
  );
  const [hideCurrentActionResult, setHideCurrentActionResult] = useState(false);
  const lastSubmittedResumeId = useRef("");
  const lastSubmittedJobDescription = useRef("");
  const savedRewriteSnapshot = useSyncExternalStore(
    subscribeToSavedRewrite,
    getSavedRewriteSnapshot,
    getServerSavedRewriteSnapshot
  );
  const resumeIds = useMemo(() => new Set(resumes.map((resume) => resume.id)), [resumes]);
  const savedRewriteState = useMemo(() => {
    if (!savedRewriteSnapshot) return null;

    try {
      const parsed = JSON.parse(savedRewriteSnapshot) as Partial<SavedResumeRewriteState>;

      if (
        typeof parsed.selectedResumeId !== "string" ||
        typeof parsed.jobDescription !== "string" ||
        typeof parsed.generatedAt !== "string" ||
        !isResumeRewriteResult(parsed.generatedRewrite)
      ) {
        return null;
      }

      return parsed as SavedResumeRewriteState;
    } catch {
      return null;
    }
  }, [savedRewriteSnapshot]);
  const validSavedRewriteState =
    savedRewriteState && resumeIds.has(savedRewriteState.selectedResumeId)
      ? savedRewriteState
      : null;
  const rewrite = hideCurrentActionResult
    ? validSavedRewriteState?.generatedRewrite ?? null
    : state.rewrite ?? validSavedRewriteState?.generatedRewrite ?? null;

  useEffect(() => {
    if (savedRewriteSnapshot && !validSavedRewriteState) {
      window.localStorage.removeItem(RESUME_REWRITE_STORAGE_KEY);
      notifySavedRewriteChanged();
    }
  }, [savedRewriteSnapshot, validSavedRewriteState]);

  useEffect(() => {
    if (
      state.status !== "success" ||
      !state.rewrite ||
      !lastSubmittedResumeId.current
    ) {
      return;
    }

    const nextSavedState: SavedResumeRewriteState = {
      selectedResumeId: lastSubmittedResumeId.current,
      jobDescription: lastSubmittedJobDescription.current,
      generatedRewrite: state.rewrite,
      generatedAt: new Date().toISOString(),
    };

    window.localStorage.setItem(
      RESUME_REWRITE_STORAGE_KEY,
      JSON.stringify(nextSavedState)
    );
    notifySavedRewriteChanged();
  }, [state.rewrite, state.status]);

  function submitRewrite(formData: FormData) {
    const resumeId = formData.get("resumeId");
    const jobDescription = formData.get("jobDescription");

    lastSubmittedResumeId.current =
      typeof resumeId === "string" ? resumeId : "";
    lastSubmittedJobDescription.current =
      typeof jobDescription === "string" ? jobDescription : "";
    setHideCurrentActionResult(false);
    formAction(formData);
  }

  function clearSavedRewrite() {
    const confirmed = window.confirm("Clear this saved resume rewrite?");

    if (!confirmed) {
      return;
    }

    window.localStorage.removeItem(RESUME_REWRITE_STORAGE_KEY);
    notifySavedRewriteChanged();
    setHideCurrentActionResult(true);
  }

  return (
    <div className="space-y-10">
      <Card className="overflow-hidden border-cyan-200/15 bg-gradient-to-br from-cyan-300/[0.1] via-white/[0.055] to-emerald-300/[0.055] text-white shadow-[0_28px_90px_rgba(0,0,0,0.38)] ring-1 ring-cyan-200/10">
        <CardHeader className="border-b border-white/10 bg-black/10">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <CardTitle className="text-xl">Generate Resume Rewrite</CardTitle>
              <p className="mt-2 text-sm leading-6 text-zinc-400">
                Select one parsed resume, paste a JD, and generate truthful
                recruiter-ready sections tailored to the role.
              </p>
            </div>
            <p className="text-xs font-medium uppercase text-cyan-100">
              Saved locally only
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <form action={submitRewrite} className="space-y-6 pt-6">
            <div className="grid gap-5 lg:grid-cols-[380px_1fr]">
              <div className="rounded-xl border border-white/10 bg-black/20 p-4 shadow-inner">
                <label htmlFor="resumeId" className="text-sm font-medium text-zinc-200">
                  Resume
                </label>
                <p className="mt-1 text-xs leading-5 text-zinc-500">
                  Only your readable uploaded resumes are available.
                </p>
                <select
                  key={`rewrite-resume-${validSavedRewriteState?.selectedResumeId ?? "empty"}`}
                  id="resumeId"
                  name="resumeId"
                  required
                  defaultValue={validSavedRewriteState?.selectedResumeId ?? ""}
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
                  Paste at least 50 characters. Include responsibilities,
                  required skills, tools, and qualifications.
                </p>
                <Textarea
                  key={`rewrite-jd-${validSavedRewriteState?.selectedResumeId ?? "empty"}`}
                  id="jobDescription"
                  name="jobDescription"
                  required
                  rows={12}
                  defaultValue={validSavedRewriteState?.jobDescription ?? ""}
                  placeholder="Paste the job description you want to tailor this resume toward..."
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
              {pending ? "Generating..." : "Generate Rewrite"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {rewrite ? (
        <section className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase text-cyan-100">
                Latest Resume Rewrite
              </p>
              <p className="mt-1 text-sm text-zinc-500">
                Saved in this browser. Missing skills are suggestions, not
                added as claimed experience.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={clearSavedRewrite}
              className="border-white/15 bg-white/[0.04] text-white hover:border-cyan-200/30 hover:bg-cyan-300/10 hover:text-white"
            >
              Clear saved rewrite
            </Button>
          </div>

          <SectionCard
            title="Rewritten Professional Summary"
            copyText={rewrite.professionalSummary}
          >
            <p className="text-sm leading-7 text-zinc-300">
              {rewrite.professionalSummary}
            </p>
          </SectionCard>

          <div className="grid gap-5 xl:grid-cols-2">
            <SectionCard
              title="Rewritten Experience Bullets"
              copyText={rewrite.experienceBullets.map((item) => `- ${item}`).join("\n")}
            >
              <BulletList items={rewrite.experienceBullets} />
            </SectionCard>

            <SectionCard
              title="Optimized Skills Section"
              copyText={rewrite.skillsSection.join(", ")}
              tone="good"
            >
              <div className="flex flex-wrap gap-2">
                {rewrite.skillsSection.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full border border-emerald-200/20 bg-emerald-300/10 px-3 py-1 text-sm text-emerald-50"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </SectionCard>
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            <SectionCard
              title="ATS Keyword Suggestions"
              copyText={rewrite.atsKeywords.join(", ")}
            >
              <div className="flex flex-wrap gap-2">
                {rewrite.atsKeywords.length ? (
                  rewrite.atsKeywords.map((keyword) => (
                    <span
                      key={keyword}
                      className="rounded-full border border-cyan-200/20 bg-cyan-300/10 px-3 py-1 text-sm text-cyan-50"
                    >
                      {keyword}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-zinc-400">
                    No strong ATS keyword suggestions were extracted.
                  </p>
                )}
              </div>
            </SectionCard>

            <SectionCard
              title="Missing Skills Suggestions"
              copyText={rewrite.missingSkills.join(", ")}
              tone="warn"
            >
              {rewrite.missingSkills.length ? (
                <BulletList items={rewrite.missingSkills} tone="warn" />
              ) : (
                <p className="text-sm leading-6 text-zinc-400">
                  No major missing skills were detected from this JD.
                </p>
              )}
            </SectionCard>
          </div>
        </section>
      ) : (
        <Card className="border-white/10 bg-gradient-to-b from-white/[0.055] to-white/[0.025] text-white shadow-[0_18px_60px_rgba(0,0,0,0.2)] ring-1 ring-white/10">
          <CardContent className="py-10 text-center">
            <p className="text-sm font-semibold uppercase text-cyan-100">
              No rewrite generated yet
            </p>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
              Choose a resume and paste a job description to generate a
              professional summary, rewritten bullets, optimized skills, and
              ATS keyword guidance.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
