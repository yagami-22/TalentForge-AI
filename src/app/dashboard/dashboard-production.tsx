import Link from "next/link";
import { AlertTriangle, Inbox } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { forge } from "@/lib/talentforge-design";

type DashboardSkeletonProps = {
  label: string;
  metricCount?: number;
  chartCount?: number;
  listCount?: number;
};

export function DashboardSkeleton({
  label,
  metricCount = 4,
  chartCount = 2,
  listCount = 2,
}: DashboardSkeletonProps) {
  return (
    <main className={forge.page} aria-busy="true" aria-label={`${label} loading`}>
      <div className={forge.topNav}>
        <div className="h-6 w-36 animate-pulse rounded-lg bg-white/10" />
        <div className="flex flex-wrap justify-end gap-3">
          <div className="h-9 w-24 animate-pulse rounded-xl bg-white/10" />
          <div className="hidden h-9 w-32 animate-pulse rounded-xl bg-white/10 sm:block" />
        </div>
      </div>

      <section className="mx-auto w-full max-w-7xl space-y-6 py-10 lg:py-12">
        <div className={forge.hero}>
          <div className="h-5 w-40 animate-pulse rounded-full bg-cyan-200/15" />
          <div className="mt-5 h-10 max-w-3xl animate-pulse rounded-xl bg-white/10" />
          <div className="mt-4 h-5 max-w-2xl animate-pulse rounded-lg bg-white/10" />
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: metricCount }).map((_, index) => (
              <div key={index} className={forge.metric}>
                <div className="h-4 w-20 animate-pulse rounded bg-white/10" />
                <div className="mt-4 h-8 w-16 animate-pulse rounded bg-white/10" />
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-2">
          {Array.from({ length: chartCount }).map((_, index) => (
            <Card key={index} className={`${forge.card} overflow-hidden`}>
              <CardHeader className="border-b border-white/10 bg-[#070B1F]/60">
                <div className="h-5 w-44 animate-pulse rounded bg-white/10" />
              </CardHeader>
              <CardContent className="h-72 pt-5">
                <div className="h-full animate-pulse rounded-2xl bg-white/[0.06]" />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {Array.from({ length: listCount }).map((_, index) => (
            <Card key={index} className={`${forge.card} overflow-hidden`}>
              <CardHeader className="border-b border-white/10 bg-[#070B1F]/60">
                <div className="h-5 w-40 animate-pulse rounded bg-white/10" />
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="h-4 animate-pulse rounded bg-white/10" />
                <div className="h-4 w-5/6 animate-pulse rounded bg-white/10" />
                <div className="h-4 w-2/3 animate-pulse rounded bg-white/10" />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}

export function DashboardEmptyState({
  title,
  description,
  actionHref,
  actionLabel,
}: {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <Card className={`${forge.card} h-fit`}>
      <CardContent className="py-10 text-center">
        <Inbox className="mx-auto h-8 w-8 text-cyan-200" aria-hidden="true" />
        <h2 className="mt-4 text-xl font-semibold">{title}</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-zinc-400">
          {description}
        </p>
        {actionHref && actionLabel ? (
          <Button asChild className={`mt-5 ${forge.primaryButton}`}>
            <Link href={actionHref}>{actionLabel}</Link>
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function DashboardErrorFallback({
  title = "This dashboard view could not load.",
  description = "A temporary production error interrupted this route.",
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <main className={forge.page}>
      <section className="mx-auto grid min-h-[70vh] w-full max-w-3xl place-items-center">
        <Card className={`${forge.cardStrong} w-full`}>
          <CardContent className="p-8 text-center">
            <AlertTriangle className="mx-auto h-10 w-10 text-amber-200" aria-hidden="true" />
            <h1 className="mt-5 text-2xl font-semibold">{title}</h1>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-zinc-300">
              {description}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {onRetry ? (
                <Button type="button" className={forge.primaryButton} onClick={onRetry}>
                  Try again
                </Button>
              ) : null}
              <Button asChild variant="outline" className={forge.secondaryButton}>
                <Link href="/dashboard">Return to Dashboard</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
