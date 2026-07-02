import Link from "next/link";
import { redirect } from "next/navigation";

import { GitHubAnalyzerClient } from "@/app/dashboard/github/github-analyzer-client";
import { Button } from "@/components/ui/button";
import { getCurrentDbUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { extractCanonicalResumeSkills } from "@/lib/resume-versioning-client";
import { withRetry } from "@/lib/retry";
import { forge } from "@/lib/talentforge-design";

export const runtime = "nodejs";

export default async function GitHubAnalyzerPage() {
  const user = await getCurrentDbUser();

  if (!user.role) {
    redirect("/onboarding");
  }

  const latestResume = await withRetry(() =>
    prisma.resume.findFirst({
      where: {
        userId: user.id,
        extractedText: {
          not: null,
        },
      },
      orderBy: { updatedAt: "desc" },
      select: {
        title: true,
        extractedText: true,
      },
    })
  );
  const resumeSkills = latestResume?.extractedText
    ? extractCanonicalResumeSkills(latestResume.extractedText).map((skill) => skill.skill)
    : [];

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

      <GitHubAnalyzerClient
        resumeContext={{
          title: latestResume?.title ?? null,
          skills: resumeSkills,
        }}
      />
    </main>
  );
}
