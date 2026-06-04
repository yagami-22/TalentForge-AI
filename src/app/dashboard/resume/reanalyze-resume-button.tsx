"use client";

import { useActionState } from "react";

import { reanalyzeResume } from "@/app/dashboard/resume/actions";
import { initialReanalyzeResumeState } from "@/app/dashboard/resume/state";
import { Button } from "@/components/ui/button";

type ReanalyzeResumeButtonProps = {
  resumeId: string;
  resumeTitle: string;
};

export function ReanalyzeResumeButton({
  resumeId,
  resumeTitle,
}: ReanalyzeResumeButtonProps) {
  const [state, formAction, pending] = useActionState(
    reanalyzeResume,
    initialReanalyzeResumeState
  );

  return (
    <form
      action={formAction}
      className="space-y-2"
      onSubmit={(event) => {
        const confirmed = window.confirm(
          `Re-analyze "${resumeTitle}" using the latest Resume Analyzer?`
        );

        if (!confirmed) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="resumeId" value={resumeId} />
      <Button
        type="submit"
        disabled={pending}
        variant="outline"
        className="border-emerald-200/25 bg-emerald-300/10 text-emerald-50 shadow-sm hover:border-emerald-100/40 hover:bg-emerald-300/15 hover:text-white disabled:opacity-60"
      >
        {pending ? "Re-analyzing..." : "Re-analyze resume"}
      </Button>
      {state.message ? (
        <p
          aria-live="polite"
          className={
            state.status === "error"
              ? "text-xs text-red-300"
              : "text-xs text-emerald-300"
          }
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
