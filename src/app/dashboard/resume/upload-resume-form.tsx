"use client";

import { useActionState } from "react";

import { uploadResume } from "@/app/dashboard/resume/actions";
import { initialUploadResumeState } from "@/app/dashboard/resume/state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { forge } from "@/lib/talentforge-design";

export function UploadResumeForm() {
  const [state, formAction, pending] = useActionState(
    uploadResume,
    initialUploadResumeState
  );

  return (
    <form
      action={formAction}
      className="grid gap-3 md:grid-cols-2 lg:grid-cols-[minmax(220px,0.85fr)_minmax(280px,1.1fr)_minmax(170px,auto)] lg:items-stretch"
    >
      <div className={forge.metric}>
        <p className="text-xs font-medium uppercase text-cyan-100">
          Resume details
        </p>
        <label htmlFor="title" className="text-sm font-medium text-zinc-200">
          Resume title
        </label>
        <Input
          id="title"
          name="title"
          maxLength={90}
          placeholder="Software Engineer Resume"
          aria-invalid={state.status === "error"}
          className={`mt-2 ${forge.input}`}
        />
      </div>

      <div className={forge.metric}>
        <p className="text-xs font-medium uppercase text-cyan-100">
          Upload file
        </p>
        <label htmlFor="resume" className="text-sm font-medium text-zinc-200">
          PDF file
        </label>
        <Input
          id="resume"
          name="resume"
          type="file"
          accept="application/pdf,.pdf"
          required
          aria-invalid={state.status === "error"}
          className={`mt-2 ${forge.input} file:mr-4 file:rounded-md file:border-0 file:bg-[#00E5FF] file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-slate-950 hover:border-[#00E5FF]/30`}
        />
        <p className="text-xs text-zinc-500">PDF only, up to 8 MB.</p>
      </div>

      <div className="rounded-2xl border border-[#00E5FF]/15 bg-[#00E5FF]/10 p-3 shadow-[0_0_28px_rgba(0,229,255,0.08)]">
        <p className="text-xs font-medium uppercase text-cyan-100">
          Analyze
        </p>
        <Button
          type="submit"
          disabled={pending}
          className={`mt-3 h-12 w-full px-6 ${forge.primaryButton}`}
        >
          {pending ? "Uploading..." : "Upload Resume"}
        </Button>
      </div>

      {state.message ? (
        <p
          aria-live="polite"
          className={
            state.status === "error"
              ? "text-sm text-red-300 lg:col-span-3"
              : "text-sm text-emerald-300 lg:col-span-3"
          }
        >
          {state.message}
        </p>
      ) : null}

      {state.warning ? (
        <p
          aria-live="polite"
          className="rounded-md border border-amber-300/20 bg-amber-300/10 px-3 py-2 text-sm leading-6 text-amber-100 lg:col-span-3"
        >
          {state.warning}
        </p>
      ) : null}
    </form>
  );
}
