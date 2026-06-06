import Link from "next/link";
import { redirect } from "next/navigation";

import { DeleteResumeButton } from "@/app/dashboard/resume/delete-resume-button";
import { ReanalyzeResumeButton } from "@/app/dashboard/resume/reanalyze-resume-button";
import { UploadResumeForm } from "@/app/dashboard/resume/upload-resume-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getCurrentDbUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { forge } from "@/lib/talentforge-design";
import type {
  ResumeCategoryScore,
  ResumeDiagnostics,
  ResumeAnalysisGrade,
  ResumeScoreBreakdownItem,
} from "@/lib/resume-analyzer";

export const runtime = "nodejs";

function jsonToStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function isResumeCategoryScore(value: unknown): value is ResumeCategoryScore {
  return (
    typeof value === "object" &&
    value !== null &&
    "name" in value &&
    "score" in value &&
    "maxScore" in value &&
    typeof value.name === "string" &&
    typeof value.score === "number" &&
    typeof value.maxScore === "number"
  );
}

function isScoreBreakdownItem(value: unknown): value is ResumeScoreBreakdownItem {
  return (
    typeof value === "object" &&
    value !== null &&
    "name" in value &&
    "score" in value &&
    "maxScore" in value &&
    typeof value.name === "string" &&
    typeof value.score === "number" &&
    typeof value.maxScore === "number"
  );
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
    Array.isArray(value.categoryScores) &&
    "topIssues" in value &&
    "quickWins" in value &&
    "redFlags" in value &&
    Array.isArray(value.topIssues) &&
    Array.isArray(value.quickWins) &&
    Array.isArray(value.redFlags)
  );
}

function getStringField(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function getEvidenceRows(
  category: ResumeCategoryScore,
  field: "evidenceFound" | "missingEvidence"
) {
  const value = category[field];

  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function getDisplayGrade(score: number | null): ResumeAnalysisGrade | null {
  if (score === null) {
    return null;
  }

  if (score >= 90) return "Excellent";
  if (score >= 80) return "Strong";
  if (score >= 70) return "Good";
  if (score >= 55) return "Average";
  return "Weak";
}

function getScoreTone(score: number | null) {
  if (score === null) {
    return "text-zinc-400";
  }

  if (score >= 80) {
    return "text-emerald-300";
  }

  if (score >= 60) {
    return "text-cyan-200";
  }

  return "text-amber-200";
}

function getCategoryRows(analysis: ResumeDiagnostics | null) {
  return analysis?.categoryScores.filter(isResumeCategoryScore) ?? [];
}

function getBreakdownRows(category: ResumeCategoryScore) {
  return Array.isArray(category.breakdown)
    ? category.breakdown.filter(isScoreBreakdownItem)
    : [];
}

function scoreWidth(score: number | null, maxScore = 100) {
  if (score === null || maxScore <= 0) {
    return "0%";
  }

  return `${Math.max(0, Math.min(100, (score / maxScore) * 100))}%`;
}

function CompactListCard({
  title,
  items,
  emptyText,
  tone = "default",
}: {
  title: string;
  items: string[];
  emptyText: string;
  tone?: "default" | "warning" | "danger";
}) {
  const titleTone =
    tone === "danger"
      ? "text-red-200"
      : tone === "warning"
        ? "text-amber-200"
        : "text-zinc-200";

  return (
    <Card className={`overflow-hidden ${forge.card} ${forge.hoverCard}`}>
      <CardHeader className="border-b border-white/10 bg-[#070B1F]/60 pb-3">
        <CardTitle className={`text-base ${titleTone}`}>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 text-sm leading-6 text-zinc-400">
          {(items.length ? items : [emptyText]).slice(0, 6).map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function CategoryCard({ category }: { category: ResumeCategoryScore }) {
  const evidenceRows = getEvidenceRows(category, "evidenceFound");
  const missingRows = getEvidenceRows(category, "missingEvidence");
  const breakdownRows = getBreakdownRows(category);

  return (
    <Card className={`overflow-hidden ${forge.card} ${forge.hoverCard}`}>
      <CardHeader className="space-y-3 border-b border-white/10 bg-[#070B1F]/60 pb-3">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-base leading-6">{category.name}</CardTitle>
          <p className="shrink-0 rounded-full border border-[#00E5FF]/20 bg-[#00E5FF]/10 px-2.5 py-1 text-sm font-semibold text-cyan-100">
            {category.score}/{category.maxScore}
          </p>
        </div>
        <div className={`h-1.5 ${forge.progressTrack}`}>
          <div
            className={forge.progressFill}
            style={{ width: scoreWidth(category.score, category.maxScore) }}
          />
        </div>
        <CardDescription className="line-clamp-3 text-xs leading-5 text-zinc-400">
          {category.reason}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <details className="rounded-md border border-white/10 bg-black/20 px-3 py-2">
          <summary className="cursor-pointer text-xs font-medium text-emerald-200">
            Evidence found ({evidenceRows.length})
          </summary>
          <ul className="mt-2 space-y-1 text-xs leading-5 text-zinc-400">
            {(evidenceRows.length ? evidenceRows : ["No strong evidence found."])
              .slice(0, 5)
              .map((item) => (
                <li key={item}>{item}</li>
              ))}
          </ul>
        </details>
        <details className="rounded-md border border-white/10 bg-black/20 px-3 py-2">
          <summary className="cursor-pointer text-xs font-medium text-amber-200">
            Missing evidence ({missingRows.length})
          </summary>
          <ul className="mt-2 space-y-1 text-xs leading-5 text-zinc-400">
            {(missingRows.length ? missingRows : ["No major missing evidence."])
              .slice(0, 5)
              .map((item) => (
                <li key={item}>{item}</li>
              ))}
          </ul>
        </details>
        <details className="rounded-md border border-white/10 bg-black/20 px-3 py-2">
          <summary className="cursor-pointer text-xs font-medium text-cyan-200">
            Suggestions ({category.suggestions.length})
          </summary>
          <ul className="mt-2 space-y-1 text-xs leading-5 text-zinc-400">
            {(category.suggestions.length
              ? category.suggestions
              : ["No category-specific suggestion."])
              .slice(0, 4)
              .map((item) => (
                <li key={item}>{item}</li>
              ))}
          </ul>
        </details>
        {breakdownRows.length ? (
          <details className="rounded-md border border-white/10 bg-black/20 px-3 py-2">
            <summary className="cursor-pointer text-xs font-medium text-zinc-300">
              Subcriteria ({breakdownRows.length})
            </summary>
            <div className="mt-2 space-y-2">
              {breakdownRows.slice(0, 6).map((item) => (
                <div key={item.name} className="text-xs leading-5 text-zinc-400">
                  <div className="flex justify-between gap-3 text-zinc-300">
                    <span>{item.name}</span>
                    <span>
                      {item.score}/{item.maxScore}
                    </span>
                  </div>
                  <p className="text-zinc-500">{item.reason}</p>
                </div>
              ))}
            </div>
          </details>
        ) : null}
      </CardContent>
    </Card>
  );
}

export default async function ResumePage() {
  const user = await getCurrentDbUser();

  if (!user.role) {
    redirect("/onboarding");
  }

  const resumes = await prisma.resume.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className={forge.page}>
      <div className={forge.topNav}>
        <Link href="/" className="text-lg font-semibold tracking-tight">
          TalentForge AI
        </Link>
        <Button
          asChild
          variant="outline"
          className={forge.secondaryButton}
        >
          <Link href="/dashboard">Dashboard</Link>
        </Button>
      </div>

      <section className="mx-auto w-full max-w-7xl space-y-5 py-10 lg:py-12">
        <div className={forge.hero}>
          <div className={forge.heroGlowCyan} />
          <div className={forge.heroGlowPurple} />
          <p className={forge.badge}>
            Resume Intelligence
          </p>
          <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight text-white sm:text-5xl">
            Evidence-based resume diagnostics.
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-zinc-300">
            Upload a PDF resume to generate a criteria-based analysis with
            explainable scoring, missing evidence, quick wins, and red flags.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              asChild
              className={forge.primaryButton}
            >
              <Link href="/dashboard/resume/match">
                Match Resume to Job Description
              </Link>
            </Button>
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
              <Link href="/dashboard/resume/rewrite">AI Resume Rewriter</Link>
            </Button>
          </div>
          <div className="mt-6 grid gap-3 text-sm text-zinc-300 sm:grid-cols-3">
            {["Explainable scoring", "Evidence-backed gaps", "Portfolio-aware review"].map(
              (item) => (
                <div
                  key={item}
                  className="rounded-full border border-[#00E5FF]/15 bg-[#00E5FF]/10 px-3 py-2 text-cyan-50 shadow-[0_0_18px_rgba(0,229,255,0.08)]"
                >
                  {item}
                </div>
              )
            )}
          </div>
        </div>

        <Card className={forge.cardStrong}>
          <CardHeader className="pb-3">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <CardTitle className="text-lg">Upload Resume</CardTitle>
                <CardDescription className="text-sm leading-6 text-zinc-400">
                  Existing uploads stay compatible. New uploads store the full
                  analysis JSON.
                </CardDescription>
              </div>
              <p className="text-xs font-medium uppercase text-cyan-100">
                PDF only
              </p>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <UploadResumeForm />
          </CardContent>
        </Card>
      </section>

      <section className="mx-auto w-full max-w-7xl pb-16">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase text-cyan-100">
              Library
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">
              Resume reports
            </h2>
          </div>
          <p className="text-sm text-zinc-500">
            {resumes.length} {resumes.length === 1 ? "resume" : "resumes"}
          </p>
        </div>

        {resumes.length ? (
          <div className="space-y-8">
            {resumes.map((resume) => {
              const analysis = isResumeDiagnostics(resume.atsAnalysis)
                ? resume.atsAnalysis
                : null;
              const issues = analysis?.topIssues.length
                ? analysis.topIssues
                : jsonToStringArray(resume.atsIssues);
              const suggestions = analysis?.quickWins.length
                ? analysis.quickWins
                : jsonToStringArray(resume.atsSuggestions);
              const redFlags = analysis?.redFlags ?? [];
              const categoryRows = getCategoryRows(analysis);
              const score = resume.atsScore ?? null;
              const grade = analysis?.grade ?? getDisplayGrade(score);
              const hiringReadiness = getStringField(
                analysis?.hiringReadiness,
                "Not assessed"
              );
              const detectedProfileType = getStringField(
                analysis?.detectedProfileType,
                "Profile pending"
              );
              const detectedSeniority = getStringField(
                analysis?.detectedSeniority,
                "Seniority pending"
              );

              return (
                <article key={resume.id} className="space-y-4">
                  <Card className={forge.cardStrong}>
                    <CardHeader className="pb-4">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0">
                          <CardTitle className="truncate text-xl leading-7">
                            {resume.title}
                          </CardTitle>
                          <CardDescription className="mt-1 text-zinc-400">
                            Uploaded {resume.createdAt.toLocaleDateString()}
                            {" "} - {resume.extractionSource ?? "Source pending"}
                          </CardDescription>
                          {analysis?.summary ? (
                            <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-300">
                              {analysis.summary}
                            </p>
                          ) : (
                            <p className="mt-3 text-sm leading-6 text-zinc-500">
                              Full diagnostics will appear after this resume is
                              analyzed with Resume Intelligence.
                            </p>
                          )}
                        </div>
                        <div className="flex items-start gap-3 lg:justify-end">
                          {resume.fileUrl ? (
                            <Button
                              asChild
                              variant="outline"
                              className={forge.secondaryButton}
                            >
                              <a
                                href={resume.fileUrl}
                                target="_blank"
                                rel="noreferrer"
                              >
                                View PDF
                              </a>
                            </Button>
                          ) : null}
                          <ReanalyzeResumeButton
                            resumeId={resume.id}
                            resumeTitle={resume.title}
                          />
                          <DeleteResumeButton
                            resumeId={resume.id}
                            resumeTitle={resume.title}
                          />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                        <div className={forge.metric}>
                          <p className="text-xs font-medium uppercase text-zinc-500">
                            Overall
                          </p>
                          <p
                            className={`mt-1 text-3xl font-semibold ${getScoreTone(
                              score
                            )}`}
                          >
                            {score === null ? "--" : score}
                          </p>
                        </div>
                        <div className={forge.metric}>
                          <p className="text-xs font-medium uppercase text-zinc-500">
                            Grade
                          </p>
                          <p className="mt-2 text-lg font-semibold text-zinc-100">
                            {grade ?? "Not scored"}
                          </p>
                        </div>
                        <div className={forge.metric}>
                          <p className="text-xs font-medium uppercase text-zinc-500">
                            Readiness
                          </p>
                          <p className="mt-2 text-lg font-semibold text-zinc-100">
                            {hiringReadiness}
                          </p>
                        </div>
                        <div className={forge.metric}>
                          <p className="text-xs font-medium uppercase text-zinc-500">
                            Profile
                          </p>
                          <p className="mt-2 text-lg font-semibold text-zinc-100">
                            {detectedProfileType}
                          </p>
                        </div>
                        <div className={forge.metric}>
                          <p className="text-xs font-medium uppercase text-zinc-500">
                            Seniority
                          </p>
                          <p className="mt-2 text-lg font-semibold text-zinc-100">
                            {detectedSeniority}
                          </p>
                        </div>
                      </div>
                      <div className={`h-1.5 ${forge.progressTrack}`}>
                        <div
                          className={forge.progressFill}
                          style={{ width: scoreWidth(score) }}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {categoryRows.length ? (
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                      {categoryRows.map((category) => (
                        <CategoryCard key={category.name} category={category} />
                      ))}
                    </div>
                  ) : (
                    <Card className={`h-fit ${forge.card}`}>
                      <CardHeader className="pb-4">
                        <CardTitle className="text-base">
                          Category scoring pending
                        </CardTitle>
                        <CardDescription className="leading-6 text-zinc-400">
                          Upload this resume again to generate the full
                          category breakdown.
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  )}

                  <div className="grid gap-4 lg:grid-cols-3">
                    <CompactListCard
                      title="Top Issues"
                      items={issues}
                      emptyText="No major issues available for this resume."
                      tone="warning"
                    />
                    <CompactListCard
                      title="Quick Wins"
                      items={suggestions}
                      emptyText="No quick wins generated yet."
                    />
                    <CompactListCard
                      title="Red Flags"
                      items={redFlags}
                      emptyText="No severe red flags detected."
                      tone="danger"
                    />
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <Card className={`h-fit ${forge.card}`}>
            <CardHeader className="pb-4">
              <CardTitle>No resumes uploaded yet</CardTitle>
              <CardDescription className="leading-6 text-zinc-400">
                Upload your first PDF resume to start building your career
                workspace.
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </section>
    </main>
  );
}
