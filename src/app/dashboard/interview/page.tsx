import Link from "next/link";
import { redirect } from "next/navigation";

import { InterviewSetupForm } from "@/app/dashboard/interview/interview-setup-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getCurrentDbUser } from "@/lib/current-user";
import { INTERVIEW_MODE_OPTIONS } from "@/lib/interview-prep";
import { prisma } from "@/lib/prisma";
import { forge } from "@/lib/talentforge-design";

export const runtime = "nodejs";

export default async function InterviewPage() {
  const user = await getCurrentDbUser();

  if (!user.role) {
    redirect("/onboarding");
  }

  const resumes = await prisma.resume.findMany({
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
  });

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
              Mock Interview Preparation
            </span>
            <h1 className="mt-4 max-w-4xl text-3xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              Practice the questions your resume is likely to trigger.
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-zinc-300">
              Select a parsed resume, paste a job description, choose an
              interview mode, and generate focused text-based practice with
              evaluation feedback.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {INTERVIEW_MODE_OPTIONS.map((mode) => (
                <div
                  key={mode.value}
                  className={`${forge.metric} ${forge.hoverCard}`}
                >
                  <div className="mb-3 grid h-9 w-9 place-items-center rounded-xl border border-[#00E5FF]/20 bg-[#00E5FF]/10 text-xs font-semibold text-cyan-100 shadow-[0_0_18px_rgba(0,229,255,0.14)]">
                    {mode.iconPlaceholder}
                  </div>
                  <p className="font-semibold text-zinc-100">{mode.title}</p>
                  <p className="mt-1 text-sm leading-6 text-zinc-400">
                    {mode.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl pb-16">
        {resumes.length ? (
          <InterviewSetupForm
            resumes={resumes.map((resume) => ({
              id: resume.id,
              title: resume.title,
              createdAtLabel: resume.createdAt.toLocaleDateString(),
            }))}
          />
        ) : (
          <Card className={`h-fit ${forge.card}`}>
            <CardHeader className="pb-4">
              <CardTitle>No readable resumes available</CardTitle>
              <CardDescription className="leading-6 text-zinc-400">
                Upload and analyze a text-based resume PDF before starting mock
                interview practice.
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </section>
    </main>
  );
}
