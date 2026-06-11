import Link from "next/link";
import { redirect } from "next/navigation";

import { DashboardEmptyState } from "@/app/dashboard/dashboard-production";
import { MatchAnalyzerForm } from "@/app/dashboard/resume/match/match-analyzer-form";
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

      <section className="mx-auto w-full max-w-7xl py-10 lg:py-12">
        <div className={forge.hero}>
          <div className={forge.heroGlowCyan} />
          <div className={forge.heroGlowPurple} />
          <div className="relative">
            <span className={forge.badge}>
              Evidence-based resume intelligence
            </span>
            <h1 className="mt-4 max-w-4xl text-3xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              See exactly how your resume matches the role.
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-zinc-300">
              Paste a job description, choose one uploaded resume, and get a
              structured match report across skills, tools, responsibilities,
              seniority, and proof.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {[
                ["100-point score", "Weighted by job-critical evidence"],
                ["Evidence table", "See what matched and what is missing"],
                ["Gap analysis", "Prioritized edits for faster tailoring"],
              ].map(([title, description]) => (
                <div
                  key={title}
                  className={`${forge.metric} ${forge.hoverCard}`}
                >
                  <p className="font-semibold text-zinc-100">{title}</p>
                  <p className="mt-1 text-sm leading-6 text-zinc-400">
                    {description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl pb-16">
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
