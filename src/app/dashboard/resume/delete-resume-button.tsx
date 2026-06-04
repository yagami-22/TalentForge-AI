"use client";

import { useActionState } from "react";

import { deleteResume } from "@/app/dashboard/resume/actions";
import { initialDeleteResumeState } from "@/app/dashboard/resume/state";
import { Button } from "@/components/ui/button";

type DeleteResumeButtonProps = {
  resumeId: string;
  resumeTitle: string;
};

export function DeleteResumeButton({
  resumeId,
  resumeTitle,
}: DeleteResumeButtonProps) {
  const [state, formAction, pending] = useActionState(
    deleteResume,
    initialDeleteResumeState
  );

  return (
    <form
      action={formAction}
      className="space-y-2"
      onSubmit={(event) => {
        const confirmed = window.confirm(
          `Delete "${resumeTitle}"? This removes the resume and its uploaded PDF.`
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
        className="border-red-300/25 bg-red-400/[0.08] text-red-100 shadow-sm hover:border-red-200/40 hover:bg-red-400/15 hover:text-red-50 disabled:opacity-60"
      >
        {pending ? "Deleting..." : "Delete"}
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
