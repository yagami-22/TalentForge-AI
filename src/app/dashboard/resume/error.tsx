"use client";

import { useEffect } from "react";

import { DashboardErrorFallback } from "@/app/dashboard/dashboard-production";
import { logClientError } from "@/lib/client-error-logging";

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    logClientError(error, {
      digest: error.digest,
      route: "/dashboard/resume",
      source: "resume-error-boundary",
    });
  }, [error]);

  return (
    <DashboardErrorFallback
      title="We could not load your resumes."
      description="Try again. If this keeps happening, check the database connection and upload storage path."
      onRetry={unstable_retry}
    />
  );
}
