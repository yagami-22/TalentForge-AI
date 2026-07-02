import Link from "next/link";
import {
  BarChart3,
  FileText,
  History,
  MessageSquareText,
  Mic,
  Route,
  Target,
} from "lucide-react";
import { redirect } from "next/navigation";

import { DashboardEmptyState } from "@/app/dashboard/dashboard-production";
import { InterviewSetupForm } from "@/app/dashboard/interview/interview-setup-form";
import { PremiumModuleHero } from "@/components/dashboard/premium-module-hero";
import { Button } from "@/components/ui/button";
import { getCurrentDbUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { withRetry } from "@/lib/retry";
import { forge } from "@/lib/talentforge-design";

export const runtime = "nodejs";

export default async function InterviewPage() {
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
            <Link href="/dashboard/resume">Resume Dashboard</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className={forge.secondaryButton}
          >
            <Link href="/dashboard/interview/history">Interview History</Link>
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
          badge="Mock Interview Preparation"
          title="Simulate the company interview before the real one."
          description="Choose mode, company style, difficulty, resume, and target role to generate a realistic adaptive interview session with score breakdowns."
          variant="interview"
          primaryCta={{ href: "/dashboard/interview", label: "Generate Questions", icon: MessageSquareText }}
          secondaryCta={{ href: "/dashboard/interview/history", label: "View History", icon: History }}
          metrics={[
            { label: "Resumes", value: String(resumes.length), helper: "Ready for practice", icon: FileText, progress: Math.min(100, resumes.length * 18), trend: "parsed" },
            { label: "Modes", value: "8", helper: "Company-style rounds", icon: Route, progress: 100, trend: "full" },
            { label: "Signals", value: "Adaptive", helper: "CV, JD, coach, history", icon: Target, progress: 86, trend: "smart" },
            { label: "Report", value: "5 Scores", helper: "Technical + communication", icon: BarChart3, tone: "purple", progress: 88, trend: "+score" },
          ]}
          quickActions={[
            { href: "/dashboard/interview", title: "Mock Interview", subtitle: "Generate role questions", icon: MessageSquareText },
            { href: "/dashboard/interview/report", title: "Latest Report", subtitle: "Review score breakdown", icon: BarChart3 },
            { href: "/dashboard/resume", title: "Resume Dashboard", subtitle: "Update resume evidence", icon: FileText },
            { href: "/dashboard/interview/oa/session", title: "OA Session", subtitle: "Continue assessment", icon: Mic },
          ]}
        />
      </section>

      <section className={`${forge.content} pb-16`}>
        {resumes.length ? (
          <InterviewSetupForm
            resumes={resumes.map((resume) => ({
              id: resume.id,
              title: resume.title,
              createdAtLabel: resume.createdAt.toLocaleDateString(),
            }))}
          />
        ) : (
          <DashboardEmptyState
            title="No readable resumes available"
            description="Upload and analyze a text-based resume PDF before starting mock interview practice."
            actionHref="/dashboard/resume"
            actionLabel="Upload Resume"
          />
        )}
      </section>
    </main>
  );
}
