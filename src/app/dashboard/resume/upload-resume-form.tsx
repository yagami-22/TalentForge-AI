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
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <label htmlFor="title" className="text-sm font-medium text-zinc-200">
          Resume title
        </label>
        <Input
          id="title"
          name="title"
          placeholder="Software Engineer Resume"
          className="border-white/10 bg-white/[0.06] text-white placeholder:text-zinc-500"
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
          className="border-white/10 bg-white/[0.06] text-white file:mr-4 file:rounded-md file:border-0 file:bg-cyan-300 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-slate-950"
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

      <Button
        type="submit"
        disabled={pending}
        className="w-full bg-cyan-300 text-slate-950 hover:bg-cyan-200 disabled:opacity-60"
      >
        {pending ? "Uploading..." : "Upload Resume"}
      </Button>
    </form>
  );
}
