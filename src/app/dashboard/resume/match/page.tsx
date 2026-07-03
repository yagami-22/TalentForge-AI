import Link from "next/link";
import { ClipboardCheck, FileText, History, PenLine, SearchCheck, Target } from "lucide-react";
import { redirect } from "next/navigation";

import { DashboardEmptyState } from "@/app/dashboard/dashboard-production";
import { MatchAnalyzerForm } from "@/app/dashboard/resume/match/match-analyzer-form";
import { PremiumModuleHero } from "@/components/dashboard/premium-module-hero";
import { Button } from "@/components/ui/button";
import { getCurrentDbUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { withRetry } from "@/lib/retry";
import { forge } from "@/lib/talentforge-design";

export const runtime = "nodejs";

export default async function ResumeMatchPage() {
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
            <Link href="/dashboard/resume/ats">Optimize Resume for ATS</Link>
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
          <Button
            asChild
            variant="outline"
            className={forge.secondaryButton}
          >
            <Link href="/dashboard">Dashboard</Link>
          </Button>
        </div>
      </div>

      <section className={forge.section}>
        <PremiumModuleHero
          badge="Evidence-based resume intelligence"
          title="See exactly how your resume matches the role."
          description="Paste a job description, choose one uploaded resume, and get a structured match report across skills, tools, seniority, and proof."
          variant="match"
          primaryCta={{ href: "/dashboard/resume/match", label: "Analyze Match", icon: Target }}
          secondaryCta={{ href: "/dashboard/resume/ats", label: "Optimize ATS", icon: ClipboardCheck }}
          metrics={[
            { label: "Match", value: "100 pt", helper: "Role fit score", icon: Target, tone: "purple", progress: 91, trend: "+fit" },
            { label: "Resumes", value: String(resumes.length), helper: "Readable uploads", icon: FileText, progress: Math.min(100, resumes.length * 18), trend: "ready" },
            { label: "Evidence", value: "Mapped", helper: "Skills and proof", icon: SearchCheck, progress: 86, trend: "linked" },
            { label: "Gaps", value: "Ranked", helper: "Prioritized edits", icon: ClipboardCheck, tone: "amber", progress: 64, trend: "focus" },
          ]}
          quickActions={[
            { href: "/dashboard/resume/ats", title: "ATS Optimizer", subtitle: "Tune keyword coverage", icon: ClipboardCheck },
            { href: "/dashboard/resume/rewrite", title: "AI Rewrite", subtitle: "Tailor bullets safely", icon: PenLine },
            { href: "/dashboard/resume/history", title: "Version History", subtitle: "Compare improvements", icon: History },
            { href: "/dashboard/resume", title: "Resume Dashboard", subtitle: "Manage uploads", icon: FileText },
          ]}
        />
      </section>

      <section className={`${forge.content} pb-12`}>
        {resumes.length ? (
          <MatchAnalyzerForm
            resumes={resumes.map((resume) => ({
              id: resume.id,
              title: resume.title,
              createdAtLabel: resume.createdAt.toLocaleDateString(),
            }))}
          />
        ) : (
          <DashboardEmptyState
            title="No readable resumes available"
            description="Upload a text-based resume PDF before matching it to a job description."
            actionHref="/dashboard/resume"
            actionLabel="Upload Resume"
          />
        )}
      </section>
    </main>
  );
}
