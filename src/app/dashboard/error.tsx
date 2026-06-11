"use client";

import { useEffect } from "react";

import { DashboardErrorFallback } from "@/app/dashboard/dashboard-production";
import { logClientError } from "@/lib/client-error-logging";

export default function DashboardError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    logClientError(error, {
      digest: error.digest,
      route: "/dashboard",
      source: "dashboard-error-boundary",
    });
  }, [error]);

  return <DashboardErrorFallback onRetry={unstable_retry} />;
}
