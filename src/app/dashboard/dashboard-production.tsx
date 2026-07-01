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
        <div className={`h-6 w-36 ${forge.skeleton}`} />
        <div className="flex flex-wrap justify-end gap-3">
          <div className={`h-9 w-24 ${forge.skeleton}`} />
          <div className={`hidden h-9 w-32 sm:block ${forge.skeleton}`} />
        </div>
      </div>

      <section className={forge.section}>
        <div className={forge.hero}>
          <div className="h-5 w-40 animate-pulse rounded-full bg-cyan-200/15" />
          <div className={`mt-5 h-10 max-w-3xl ${forge.skeleton}`} />
          <div className={`mt-4 h-5 max-w-2xl ${forge.skeleton}`} />
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: metricCount }).map((_, index) => (
              <div key={index} className={forge.metric}>
                <div className={`h-4 w-20 ${forge.skeleton}`} />
                <div className={`mt-4 h-8 w-16 ${forge.skeleton}`} />
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-2">
          {Array.from({ length: chartCount }).map((_, index) => (
            <Card key={index} className={`${forge.card} overflow-hidden`}>
              <CardHeader className="border-b border-white/10 bg-[#070B1F]/60">
                <div className={`h-5 w-44 ${forge.skeleton}`} />
              </CardHeader>
              <CardContent className="h-72 pt-5">
                <div className={`h-full ${forge.skeleton}`} />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {Array.from({ length: listCount }).map((_, index) => (
            <Card key={index} className={`${forge.card} overflow-hidden`}>
              <CardHeader className="border-b border-white/10 bg-[#070B1F]/60">
                <div className={`h-5 w-40 ${forge.skeleton}`} />
              </CardHeader>
              <CardContent className="space-y-3">
                <div className={`h-4 ${forge.skeleton}`} />
                <div className={`h-4 w-5/6 ${forge.skeleton}`} />
                <div className={`h-4 w-2/3 ${forge.skeleton}`} />
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
    <Card className={`${forge.cardStrong} h-fit`}>
      <CardContent className="px-6 py-12 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-[#00E5FF]/20 bg-[#00E5FF]/10 text-cyan-100 shadow-[0_0_28px_rgba(0,229,255,0.16)]">
          <Inbox className="h-7 w-7" aria-hidden="true" />
        </span>
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
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-amber-300/20 bg-amber-300/10 text-amber-100 shadow-[0_0_28px_rgba(251,191,36,0.12)]">
              <AlertTriangle className="h-7 w-7" aria-hidden="true" />
            </span>
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
