import Link from "next/link";
import { redirect } from "next/navigation";

import { AnalyticsDashboardClient } from "@/app/dashboard/analytics/analytics-client";
import { Button } from "@/components/ui/button";
import { getCurrentDbUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { withRetry } from "@/lib/retry";
import {
  extractResumeVersionKeywords,
  jsonArrayToStrings,
} from "@/lib/resume-versioning";
import { forge } from "@/lib/talentforge-design";

export const runtime = "nodejs";

export default async function AnalyticsPage() {
  const user = await getCurrentDbUser();

  if (!user.role) {
    redirect("/onboarding");
  }

  const resumes = await withRetry(() =>
    prisma.resume.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        extractedText: true,
        atsScore: true,
        matchScore: true,
        createdAt: true,
        updatedAt: true,
        versions: {
          orderBy: { versionNumber: "asc" },
          select: {
            id: true,
            versionNumber: true,
            sourceType: true,
            atsScore: true,
            jobMatchScore: true,
            addedKeywords: true,
            removedKeywords: true,
            createdAt: true,
          },
        },
      },
    })
  );
  const latestResume = resumes[0] ?? null;
  const detectedSkills = Array.from(
    new Set(
      resumes.flatMap((resume) => [
        ...extractResumeVersionKeywords(resume.extractedText ?? ""),
        ...resume.versions.flatMap((version) => jsonArrayToStrings(version.addedKeywords)),
      ])
    )
  ).slice(0, 24);

  return (
    <main className={forge.page}>
      <div className={forge.topNav}>
        <Link href="/" className="text-lg font-semibold tracking-tight">
          TalentForge AI
        </Link>
        <div className="flex flex-wrap justify-end gap-3">
          <Button asChild variant="outline" className={forge.secondaryButton}>
            <Link href="/dashboard">Dashboard</Link>
          </Button>
          <Button asChild variant="outline" className={forge.secondaryButton}>
            <Link href="/dashboard/resume">Resume Intelligence</Link>
          </Button>
        </div>
      </div>

      <section className="mx-auto w-full max-w-7xl space-y-6 py-10 lg:py-12">
        <AnalyticsDashboardClient
          serverData={{
            latestResume: latestResume
              ? {
                  id: latestResume.id,
                  title: latestResume.title,
                  atsScore: latestResume.atsScore,
                  matchScore: latestResume.matchScore,
                  createdAt: latestResume.createdAt.toISOString(),
                  updatedAt: latestResume.updatedAt.toISOString(),
                }
              : null,
            resumes: resumes.map((resume) => ({
              id: resume.id,
              title: resume.title,
              atsScore: resume.atsScore,
              matchScore: resume.matchScore,
              createdAt: resume.createdAt.toISOString(),
              updatedAt: resume.updatedAt.toISOString(),
              versions: resume.versions.map((version) => ({
                id: version.id,
                versionNumber: version.versionNumber,
                sourceType: version.sourceType,
                atsScore: version.atsScore,
                jobMatchScore: version.jobMatchScore,
                addedKeywords: jsonArrayToStrings(version.addedKeywords),
                removedKeywords: jsonArrayToStrings(version.removedKeywords),
                createdAt: version.createdAt.toISOString(),
              })),
            })),
            detectedSkills,
          }}
        />
      </section>
    </main>
  );
}
