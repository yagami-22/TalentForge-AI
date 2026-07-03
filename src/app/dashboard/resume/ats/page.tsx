import Link from "next/link";
import { ClipboardCheck, FileText, History, PenLine, Target, Zap } from "lucide-react";
import { redirect } from "next/navigation";

import { DashboardEmptyState } from "@/app/dashboard/dashboard-production";
import { ATSOptimizerForm } from "@/app/dashboard/resume/ats/ats-optimizer-form";
import { PremiumModuleHero } from "@/components/dashboard/premium-module-hero";
import { Button } from "@/components/ui/button";
import { getCurrentDbUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { withRetry } from "@/lib/retry";
import { forge } from "@/lib/talentforge-design";

export const runtime = "nodejs";

export default async function ATSOptimizerPage() {
  const user = await getCurrentDbUser();

  if (!user.role) {
    redirect("/onboarding");
  }

  const resumes = await withRetry(() =>
    prisma.resume.findMany({
      where: {
        userId: user.id,
        extractedText: {
          not: null,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        title: true,
        createdAt: true,
      },
    })
  );

  return (
    <main className={forge.page}>
      <div className={forge.topNav}>
        <Link href="/" className="text-lg font-semibold tracking-tight">
          TalentForge AI
        </Link>
        <div className="flex flex-wrap justify-end gap-3">
          <Button
            asChild
            variant="outline"
            className={forge.secondaryButton}
          >
            <Link href="/dashboard/resume/match">JD Match</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className={forge.secondaryButton}
          >
            <Link href="/dashboard/resume/rewrite">AI Rewriter</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className={forge.secondaryButton}
          >
            <Link href="/dashboard/resume">Resume Dashboard</Link>
          </Button>
        </div>
      </div>

      <section className={forge.section}>
        <PremiumModuleHero
          badge="ATS Optimization Engine v0.4"
          title="Tune your resume for the job description."
          description="Select an uploaded resume, paste a complete JD, and receive an ATS-focused report with missing keywords, warnings, and bullet rewrites."
          variant="ats"
          primaryCta={{ href: "/dashboard/resume/ats", label: "Optimize ATS", icon: ClipboardCheck }}
          secondaryCta={{ href: "/dashboard/resume/match", label: "Open JD Match", icon: Target }}
          metrics={[
            { label: "ATS", value: "100 pt", helper: "Weighted scoring", icon: Zap, tone: "emerald", progress: 94, trend: "+8" },
            { label: "Resumes", value: String(resumes.length), helper: "Readable uploads", icon: FileText, progress: Math.min(100, resumes.length * 18), trend: "ready" },
            { label: "Keywords", value: "Heatmap", helper: "Coverage report", icon: Target, progress: 82, trend: "scan" },
            { label: "Rewrites", value: "Safe", helper: "No invented claims", icon: PenLine, progress: 76, trend: "guarded" },
          ]}
          quickActions={[
            { href: "/dashboard/resume/match", title: "Match JD", subtitle: "Compare resume fit", icon: Target },
            { href: "/dashboard/resume/rewrite", title: "AI Rewrite", subtitle: "Improve bullets", icon: PenLine },
            { href: "/dashboard/resume/history", title: "Version History", subtitle: "Track changes", icon: History },
            { href: "/dashboard/resume", title: "Resume Dashboard", subtitle: "Upload or review", icon: FileText },
          ]}
        />
      </section>

      <section className={`${forge.content} pb-12`}>
        {resumes.length ? (
          <ATSOptimizerForm
            resumes={resumes.map((resume) => ({
              id: resume.id,
              title: resume.title,
              createdAtLabel: resume.createdAt.toLocaleDateString(),
            }))}
          />
        ) : (
          <DashboardEmptyState
            title="No readable resumes available"
            description="Upload a text-based resume PDF before optimizing it for ATS."
            actionHref="/dashboard/resume"
            actionLabel="Upload Resume"
          />
        )}
      </section>
    </main>
  );
}
