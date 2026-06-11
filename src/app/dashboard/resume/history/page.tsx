import Link from "next/link";
import { redirect } from "next/navigation";

import { ResumeHistoryClient } from "@/app/dashboard/resume/history/resume-history-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentDbUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { withRetry } from "@/lib/retry";
import {
  ensureOriginalResumeVersion,
  jsonArrayToStrings,
  type ResumeVersionSourceType,
} from "@/lib/resume-versioning";
import { forge } from "@/lib/talentforge-design";

export const runtime = "nodejs";

async function getResumeHistory(userId: string) {
  return withRetry(() =>
    prisma.resume.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        versions: {
          orderBy: { versionNumber: "asc" },
        },
      },
    })
  );
}

function isResumeVersionSourceType(value: string): value is ResumeVersionSourceType {
  return (
    value === "original" ||
    value === "ats_optimizer" ||
    value === "resume_rewriter" ||
    value === "manual"
  );
}

export default async function ResumeHistoryPage() {
  const user = await getCurrentDbUser();

  if (!user.role) {
    redirect("/onboarding");
  }

  let resumes = await getResumeHistory(user.id);
  const resumesNeedingOriginalVersion = resumes.filter(
    (resume) => resume.versions.length === 0 && resume.extractedText
  );

  for (const resume of resumesNeedingOriginalVersion) {
    await ensureOriginalResumeVersion({
      resumeId: resume.id,
      content: resume.extractedText,
      atsScore: resume.atsScore,
      jobMatchScore: resume.matchScore,
    });
  }

  if (resumesNeedingOriginalVersion.length) {
    resumes = await getResumeHistory(user.id);
  }

  const serializedResumes = resumes.map((resume) => ({
    id: resume.id,
    title: resume.title,
    createdAt: resume.createdAt.toISOString(),
    versions: resume.versions.map((version) => ({
      id: version.id,
      resumeId: version.resumeId,
      versionNumber: version.versionNumber,
      sourceType: isResumeVersionSourceType(version.sourceType)
        ? version.sourceType
        : ("manual" as const),
      createdAt: version.createdAt.toISOString(),
      atsScore: version.atsScore,
      jobMatchScore: version.jobMatchScore,
      addedKeywords: jsonArrayToStrings(version.addedKeywords),
      removedKeywords: jsonArrayToStrings(version.removedKeywords),
      content: version.content,
    })),
  }));

  return (
    <main className={forge.page}>
      <div className={forge.topNav}>
        <Link href="/" className="text-lg font-semibold tracking-tight">
          TalentForge AI
        </Link>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" className={forge.secondaryButton}>
            <Link href="/dashboard/resume">Resume Intelligence</Link>
          </Button>
          <Button asChild variant="outline" className={forge.secondaryButton}>
            <Link href="/dashboard">Dashboard</Link>
          </Button>
        </div>
      </div>

      <section className="mx-auto w-full max-w-7xl space-y-6 py-10 lg:py-12">
        <div className={forge.hero}>
          <div className={forge.heroGlowCyan} />
          <div className={forge.heroGlowPurple} />
          <p className={forge.badge}>Resume Version History</p>
          <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight text-white sm:text-5xl">
            Track every resume improvement over time.
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-zinc-300">
            Compare original uploads, ATS optimizer snapshots, AI rewrites, and
            restored versions with score trends and keyword movement.
          </p>
        </div>

        {serializedResumes.length ? (
          <ResumeHistoryClient resumes={serializedResumes} />
        ) : (
          <Card className={forge.cardStrong}>
            <CardHeader>
              <CardTitle>No resume versions yet</CardTitle>
              <CardDescription className="text-zinc-400">
                Upload a resume to create Version 1, then run ATS optimization
                or the AI Resume Rewriter to build your timeline.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className={forge.primaryButton}>
                <Link href="/dashboard/resume">Upload Resume</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </section>
    </main>
  );
}
