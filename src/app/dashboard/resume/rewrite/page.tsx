import Link from "next/link";
import { ClipboardCheck, FileText, History, PenLine, ShieldCheck, Target } from "lucide-react";
import { redirect } from "next/navigation";

import { DashboardEmptyState } from "@/app/dashboard/dashboard-production";
import { ResumeRewriterForm } from "@/app/dashboard/resume/rewrite/resume-rewriter-form";
import { PremiumModuleHero } from "@/components/dashboard/premium-module-hero";
import { Button } from "@/components/ui/button";
import { getCurrentDbUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { withRetry } from "@/lib/retry";
import { forge } from "@/lib/talentforge-design";

export const runtime = "nodejs";

export default async function ResumeRewritePage() {
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
            <Link href="/dashboard/resume/ats">ATS Optimizer</Link>
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
          badge="Truthful JD-tailored rewriting"
          title="AI Resume Rewriter"
          description="Rewrite resume content for a specific job description while preserving evidence and separating missing skills from claimed skills."
          variant="rewrite"
          primaryCta={{ href: "/dashboard/resume/rewrite", label: "Rewrite Resume", icon: PenLine }}
          secondaryCta={{ href: "/dashboard/resume/match", label: "Match JD First", icon: Target }}
          metrics={[
            { label: "Resumes", value: String(resumes.length), helper: "Readable uploads", icon: FileText, progress: Math.min(100, resumes.length * 18), trend: "ready" },
            { label: "Summary", value: "Aligned", helper: "Role-specific", icon: PenLine, tone: "purple", progress: 88, trend: "+tone" },
            { label: "Bullets", value: "Stronger", helper: "Action verbs", icon: Target, progress: 84, trend: "+impact" },
            { label: "Claims", value: "Safe", helper: "Evidence-preserved", icon: ShieldCheck, tone: "emerald", progress: 96, trend: "guarded" },
          ]}
          quickActions={[
            { href: "/dashboard/resume/match", title: "JD Match", subtitle: "Find role gaps", icon: Target },
            { href: "/dashboard/resume/ats", title: "ATS Optimizer", subtitle: "Improve coverage", icon: ClipboardCheck },
            { href: "/dashboard/resume/history", title: "Version History", subtitle: "Track rewrites", icon: History },
            { href: "/dashboard/resume", title: "Resume Dashboard", subtitle: "Upload or analyze", icon: FileText },
          ]}
        />
      </section>

      <section className={`${forge.content} pb-16`}>
        {resumes.length ? (
          <ResumeRewriterForm
            resumes={resumes.map((resume) => ({
              id: resume.id,
              title: resume.title,
              createdAtLabel: resume.createdAt.toLocaleDateString(),
            }))}
          />
        ) : (
          <DashboardEmptyState
            title="No readable resumes available"
            description="Upload and analyze a text-based resume PDF before generating a JD-tailored rewrite."
            actionHref="/dashboard/resume"
            actionLabel="Upload Resume"
          />
        )}
      </section>
    </main>
  );
}
