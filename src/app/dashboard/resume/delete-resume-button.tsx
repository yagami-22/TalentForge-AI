"use client";

import { useActionState } from "react";

import { deleteResume } from "@/app/dashboard/resume/actions";
import { initialDeleteResumeState } from "@/app/dashboard/resume/state";
import { Button } from "@/components/ui/button";
import { forge } from "@/lib/talentforge-design";

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
        className="rounded-2xl border-red-300/25 bg-red-400/[0.08] text-red-100 shadow-[0_0_24px_rgba(248,113,113,0.08)] hover:-translate-y-0.5 hover:border-red-200/40 hover:bg-red-400/15 hover:text-red-50 disabled:opacity-60"
      >
        {pending ? "Deleting..." : "Delete"}
      </Button>
      {state.message ? (
        <p
          aria-live="polite"
          className={
            state.status === "error"
              ? `${forge.statusError} text-xs`
              : `${forge.statusSuccess} text-xs`
          }
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
