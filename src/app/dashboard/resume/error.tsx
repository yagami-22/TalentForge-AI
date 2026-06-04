"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#05070d] px-6 text-white">
      <div className="max-w-md text-center">
        <p className="text-sm font-semibold uppercase text-red-300">
          Resume Library Error
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          We could not load your resumes.
        </h1>
        <p className="mt-4 text-sm leading-6 text-zinc-400">
          Try again. If this keeps happening, check the database connection and
          upload storage path.
        </p>
        <Button
          onClick={() => unstable_retry()}
          className="mt-6 bg-cyan-300 text-slate-950 hover:bg-cyan-200"
        >
          Try Again
        </Button>
      </div>
    </main>
  );
}
