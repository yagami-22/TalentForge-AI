"use client";

import { useActionState, useEffect } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";

import { generateMockInterview } from "@/app/dashboard/interview/actions";
import {
  initialInterviewSetupState,
} from "@/app/dashboard/interview/state";
import {
  INTERVIEW_ANSWERS_STORAGE_KEY,
  INTERVIEW_EVALUATION_STORAGE_KEY,
  INTERVIEW_SESSION_STORAGE_KEY,
} from "@/app/dashboard/interview/interview-storage";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { INTERVIEW_MODE_OPTIONS } from "@/lib/interview-prep";
import { forge } from "@/lib/talentforge-design";

type ResumeOption = {
  id: string;
  title: string;
  createdAtLabel: string;
};

export function InterviewSetupForm({ resumes }: { resumes: ResumeOption[] }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    generateMockInterview,
    initialInterviewSetupState
  );

  useEffect(() => {
    if (state.status !== "success" || !state.session) {
      return;
    }

    window.localStorage.setItem(
      INTERVIEW_SESSION_STORAGE_KEY,
      JSON.stringify(state.session)
    );
    window.localStorage.removeItem(INTERVIEW_ANSWERS_STORAGE_KEY);
    window.localStorage.removeItem(INTERVIEW_EVALUATION_STORAGE_KEY);
    router.push("/dashboard/interview/session");
  }, [router, state.session, state.status]);

  return (
    <CardShell title="Create Interview Session" badge="Local session v1">
      <form action={formAction} className="space-y-4 pt-5">
        <div className="rounded-3xl border border-[#00E5FF]/15 bg-[linear-gradient(135deg,rgba(0,229,255,0.08),rgba(255,255,255,0.035)_48%,rgba(106,92,255,0.08))] p-4 shadow-[0_0_30px_rgba(0,229,255,0.08)]">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-[minmax(260px,1fr)_minmax(320px,1.2fr)_minmax(190px,auto)] lg:items-stretch">
            <div className={forge.metric}>
              <p className="text-xs font-medium uppercase text-cyan-100">
                Selected resume
              </p>
              <label htmlFor="resumeId" className="text-sm font-medium text-zinc-200">
                Resume
              </label>
              <p className="mt-1 text-xs leading-5 text-zinc-500">
                Questions use parsed text from your uploaded resume.
              </p>
              <select
                id="resumeId"
                name="resumeId"
                required
                className={`mt-3 ${forge.select}`}
              >
                <option value="">Select a resume</option>
                {resumes.map((resume) => (
                  <option key={resume.id} value={resume.id} className="bg-slate-950">
                    {resume.title} - {resume.createdAtLabel}
                  </option>
                ))}
              </select>
            </div>

            <div className={forge.metric}>
              <p className="text-xs font-medium uppercase text-cyan-100">
                Interview mode
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {INTERVIEW_MODE_OPTIONS.map((mode) => (
                  <label
                    key={mode.value}
                    className="cursor-pointer rounded-2xl border border-white/10 bg-[#070B1F]/70 p-3 text-sm text-zinc-300 transition duration-300 hover:-translate-y-0.5 hover:border-[#00E5FF]/30 hover:bg-[#00E5FF]/10 hover:shadow-[0_0_24px_rgba(0,229,255,0.12)]"
                  >
                    <input
                      type="radio"
                      name="mode"
                      value={mode.value}
                      required
                      className="mr-2 accent-cyan-200"
                    />
                    <span className="font-medium text-zinc-100">{mode.title}</span>
                    <span className="mt-1 block text-xs leading-5 text-zinc-500">
                      {mode.description}
                    </span>
                    <span className="mt-2 flex flex-wrap gap-1">
                      {mode.futureExpansionNotes.slice(0, 3).map((note) => (
                        <span
                          key={note}
                          className="rounded-full border border-[#00E5FF]/15 bg-[#00E5FF]/10 px-2 py-0.5 text-[0.7rem] text-cyan-50"
                        >
                          {note}
                        </span>
                      ))}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-[#00E5FF]/15 bg-[#00E5FF]/10 p-3 shadow-[0_0_28px_rgba(0,229,255,0.08)]">
              <p className="text-xs font-medium uppercase text-cyan-100">
                Primary action
              </p>
              <Button
                type="submit"
                disabled={pending || resumes.length === 0}
                className={`mt-3 h-14 w-full px-6 ${forge.primaryButton}`}
              >
                {pending ? "Generating..." : "Generate Questions"}
              </Button>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/20 p-4 shadow-inner">
          <div className="flex flex-col gap-1 border-b border-white/10 pb-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase text-cyan-100">
                Input
              </p>
              <label
                htmlFor="jobDescription"
                className="text-sm font-medium text-zinc-200"
              >
                Job description
              </label>
            </div>
            <p className="text-xs leading-5 text-zinc-500">
              Used to tailor questions to required skills and seniority.
            </p>
          </div>
          <Textarea
            id="jobDescription"
            name="jobDescription"
            required
            rows={9}
            placeholder="Paste the job description you want to practice for..."
            className={`mt-3 max-h-[52vh] min-h-60 resize-y overflow-y-auto p-4 ${forge.input}`}
          />
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
      </form>
    </CardShell>
  );
}

function CardShell({
  title,
  badge,
  children,
}: {
  title: string;
  badge: string;
  children: ReactNode;
}) {
  return (
    <div className={forge.cardStrong}>
      <div className="border-b border-white/10 bg-[#070B1F]/60 px-4 py-4 sm:px-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-400">
              Generate 8 role-specific questions from resume evidence and JD requirements.
            </p>
          </div>
          <p className="text-xs font-medium uppercase text-cyan-100">{badge}</p>
        </div>
      </div>
      <div className="px-4 pb-5 sm:px-6">{children}</div>
    </div>
  );
}
