"use client";

import { useActionState } from "react";

import { uploadResume } from "@/app/dashboard/resume/actions";
import { initialUploadResumeState } from "@/app/dashboard/resume/state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function UploadResumeForm() {
  const [state, formAction, pending] = useActionState(
    uploadResume,
    initialUploadResumeState
  );

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="title" className="text-sm font-medium text-zinc-200">
          Resume title
        </label>
        <Input
          id="title"
          name="title"
          placeholder="Software Engineer Resume"
          className="border-white/10 bg-black/20 text-white shadow-inner placeholder:text-zinc-500 focus-visible:border-cyan-200/40 focus-visible:ring-cyan-300/20"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="resume" className="text-sm font-medium text-zinc-200">
          PDF file
        </label>
        <Input
          id="resume"
          name="resume"
          type="file"
          accept="application/pdf,.pdf"
          required
          className="border-white/10 bg-black/20 text-white shadow-inner file:mr-4 file:rounded-md file:border-0 file:bg-cyan-200 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-slate-950 hover:border-cyan-200/30 focus-visible:border-cyan-200/40 focus-visible:ring-cyan-300/20"
        />
        <p className="text-xs text-zinc-500">PDF only, up to 8 MB.</p>
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

      {state.warning ? (
        <p
          aria-live="polite"
          className="rounded-md border border-amber-300/20 bg-amber-300/10 px-3 py-2 text-sm leading-6 text-amber-100"
        >
          {state.warning}
        </p>
      ) : null}

      <Button
        type="submit"
        disabled={pending}
        className="w-full bg-gradient-to-r from-cyan-200 to-emerald-200 text-slate-950 shadow-[0_12px_35px_rgba(34,211,238,0.18)] hover:from-cyan-100 hover:to-emerald-100 disabled:opacity-60"
      >
        {pending ? "Uploading..." : "Upload Resume"}
      </Button>
    </form>
  );
}
