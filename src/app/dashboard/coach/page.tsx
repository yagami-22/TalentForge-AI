import Link from "next/link";
import { redirect } from "next/navigation";

import { CareerCoachClient } from "@/app/dashboard/coach/career-coach-client";
import { Button } from "@/components/ui/button";
import { getCurrentDbUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { withRetry } from "@/lib/retry";
import { forge } from "@/lib/talentforge-design";
import type {
  CareerCoachResumeSnapshot,
} from "@/lib/career-coach";
import type { ResumeDiagnostics } from "@/lib/resume-analyzer";

export const runtime = "nodejs";

function jsonToStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function isResumeDiagnostics(value: unknown): value is ResumeDiagnostics {
  return (
    typeof value === "object" &&
    value !== null &&
    "overallScore" in value &&
    "grade" in value &&
    "categoryScores" in value &&
    typeof value.overallScore === "number" &&
    typeof value.grade === "string" &&
    Array.isArray(value.categoryScores)
  );
}

export default async function CareerCoachPage() {
  const user = await getCurrentDbUser();

  if (!user.role) {
    redirect("/onboarding");
  }

  const latestResume = await withRetry(() =>
    prisma.resume.findFirst({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
        atsScore: true,
        matchScore: true,
        atsAnalysis: true,
        atsIssues: true,
        atsSuggestions: true,
      },
    })
  );
  const resumeSnapshot: CareerCoachResumeSnapshot | null = latestResume
    ? {
        id: latestResume.id,
        title: latestResume.title,
        uploadedAt: latestResume.createdAt.toISOString(),
        updatedAt: latestResume.updatedAt.toISOString(),
        atsScore: latestResume.atsScore,
        matchScore: latestResume.matchScore,
        analysis: isResumeDiagnostics(latestResume.atsAnalysis)
          ? latestResume.atsAnalysis
          : null,
        issues: jsonToStringArray(latestResume.atsIssues),
        suggestions: jsonToStringArray(latestResume.atsSuggestions),
      }
    : null;

  return (
    <main className={forge.page}>
      <div className={forge.topNav}>
        <Link href="/" className="text-lg font-semibold tracking-tight">
          TalentForge AI
        </Link>
        <Button asChild variant="outline" className={forge.secondaryButton}>
          <Link href="/dashboard">Dashboard</Link>
        </Button>
      </div>

      <CareerCoachClient resume={resumeSnapshot} />
    </main>
  );
}
