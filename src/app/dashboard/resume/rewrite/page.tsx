import Link from "next/link";
import { redirect } from "next/navigation";

import { ResumeRewriterForm } from "@/app/dashboard/resume/rewrite/resume-rewriter-form";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentDbUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export default async function ResumeRewritePage() {
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
    <main className="min-h-screen bg-[radial-gradient(circle_at_18%_0%,rgba(34,211,238,0.2),transparent_28rem),radial-gradient(circle_at_86%_18%,rgba(16,185,129,0.12),transparent_24rem),linear-gradient(180deg,#05070d_0%,#08111d_48%,#05070d_100%)] px-5 py-7 text-white sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 shadow-[0_18px_60px_rgba(0,0,0,0.25)] backdrop-blur">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          TalentForge AI
        </Link>
        <div className="flex flex-wrap justify-end gap-3">
          <Button
            asChild
            variant="outline"
            className="border-white/15 bg-white/[0.04] text-white hover:border-cyan-200/30 hover:bg-cyan-300/10 hover:text-white"
          >
            <Link href="/dashboard/resume/match">JD Match</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="border-white/15 bg-white/[0.04] text-white hover:border-cyan-200/30 hover:bg-cyan-300/10 hover:text-white"
          >
            <Link href="/dashboard/resume/ats">ATS Optimizer</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="border-white/15 bg-white/[0.04] text-white hover:border-cyan-200/30 hover:bg-cyan-300/10 hover:text-white"
          >
            <Link href="/dashboard/resume">Resume Dashboard</Link>
          </Button>
        </div>
      </div>

      <section className="mx-auto w-full max-w-7xl py-10 lg:py-12">
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.09] via-white/[0.045] to-cyan-300/[0.055] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.38)] backdrop-blur sm:p-8 lg:p-10">
          <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-cyan-300/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 left-16 h-56 w-56 rounded-full bg-emerald-300/10 blur-3xl" />
          <div className="relative">
            <span className="inline-flex rounded-full border border-cyan-200/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase text-cyan-100">
              Truthful JD-tailored rewriting
            </span>
            <h1 className="mt-4 max-w-4xl text-3xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              AI Resume Rewriter
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-zinc-300">
              Rewrite resume content for a specific job description while
              preserving evidence. The tool improves wording, highlights ATS
              keywords, and keeps missing skills separate from claimed skills.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {[
                ["Professional summary", "Role-aligned and evidence-safe"],
                ["Bullet rewrites", "Stronger action verbs and JD language"],
                ["Skills guidance", "Matched keywords plus missing skills"],
              ].map(([title, description]) => (
                <div
                  key={title}
                  className="rounded-xl border border-white/10 bg-black/20 p-4 shadow-inner"
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
          <ResumeRewriterForm
            resumes={resumes.map((resume) => ({
              id: resume.id,
              title: resume.title,
              createdAtLabel: resume.createdAt.toLocaleDateString(),
            }))}
          />
        ) : (
          <Card className="border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.035] text-white shadow-[0_24px_80px_rgba(0,0,0,0.3)] ring-white/10">
            <CardHeader>
              <CardTitle>No readable resumes available</CardTitle>
              <CardDescription className="leading-6 text-zinc-400">
                Upload and analyze a text-based resume PDF before generating a
                JD-tailored rewrite.
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </section>
    </main>
  );
}
