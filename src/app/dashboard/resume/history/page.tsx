import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import {
  ResumeHistoryClient,
  type ResumeHistoryResume,
} from "@/app/dashboard/resume/history/resume-history-client";
import { Button } from "@/components/ui/button";
import {
  jsonArrayToStrings,
  type ResumeVersionSourceType,
} from "@/lib/resume-versioning-client";
import { forge } from "@/lib/talentforge-design";

export const runtime = "nodejs";

async function getResumeHistory(userId: string) {
  const { prisma } = await import("@/lib/prisma");
  const { withRetry } = await import("@/lib/retry");

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

async function getHistoryUser() {
  if (!process.env.DATABASE_URL) {
    const clerkUser = await currentUser();

    if (!clerkUser) {
      redirect("/sign-in");
    }

    return null;
  }

  const { getCurrentDbUser } = await import("@/lib/current-user");
  return getCurrentDbUser();
}

function isResumeVersionSourceType(value: string): value is ResumeVersionSourceType {
  return (
    value === "original" ||
    value === "ats_optimizer" ||
    value === "resume_rewriter" ||
    value === "manual"
  );
}

function safeDateLabel(value: unknown): string {
  const date =
    value instanceof Date
      ? value
      : typeof value === "string" || typeof value === "number"
        ? new Date(value)
        : null;

  if (!date || Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return date.toLocaleString();
}

function normalizeScore(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function normalizeResumeVersion(
  version: Record<string, unknown>,
  fallbackResumeId: string,
  fallbackVersionNumber: number
): ResumeHistoryResume["versions"][number] {
  const sourceType =
    typeof version.sourceType === "string" && isResumeVersionSourceType(version.sourceType)
      ? version.sourceType
      : "manual";

  return {
    id: typeof version.id === "string" ? version.id : `${fallbackResumeId}-${fallbackVersionNumber}`,
    resumeId:
      typeof version.resumeId === "string" ? version.resumeId : fallbackResumeId,
    versionNumber:
      typeof version.versionNumber === "number"
        ? version.versionNumber
        : fallbackVersionNumber,
    sourceType,
    sourceLabel: typeof version.sourceLabel === "string" ? version.sourceLabel : null,
    targetLabel: typeof version.targetLabel === "string" ? version.targetLabel : null,
    contentHash: typeof version.contentHash === "string" ? version.contentHash : "",
    createdAt: safeDateLabel(version.createdAt),
    updatedAt: safeDateLabel(version.updatedAt ?? version.createdAt),
    atsScore: normalizeScore(version.atsScore),
    jobMatchScore: normalizeScore(version.jobMatchScore),
    addedKeywords: jsonArrayToStrings(version.addedKeywords),
    removedKeywords: jsonArrayToStrings(version.removedKeywords),
    content: typeof version.content === "string" ? version.content : "",
  };
}

export default async function ResumeHistoryPage() {
  const user = await getHistoryUser();

  if (user && !user.role) {
    redirect("/onboarding");
  }

  let serializedResumes: ResumeHistoryResume[] = [];

  if (user) {
    let resumes = await getResumeHistory(user.id);
    const resumesNeedingOriginalVersion = resumes.filter(
      (resume) => resume.versions.length === 0 && resume.extractedText
    );

    for (const resume of resumesNeedingOriginalVersion) {
      const { ensureOriginalResumeVersion } = await import(
        "@/lib/resume-versioning-server"
      );

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

    serializedResumes = resumes.map((resume) => ({
      id: resume.id,
      title: resume.title,
      createdAt: safeDateLabel(resume.createdAt),
      versions: resume.versions.map((version, index) =>
        normalizeResumeVersion(version, resume.id, index + 1)
      ),
    }));
  }

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

        <ResumeHistoryClient resumes={serializedResumes} />
      </section>
    </main>
  );
}
