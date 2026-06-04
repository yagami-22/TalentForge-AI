import Link from "next/link";
import { redirect } from "next/navigation";

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
    <Card className="border-white/10 bg-white/[0.04] text-white ring-white/10">
      <CardHeader className="pb-3">
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
    <Card className="border-white/10 bg-white/[0.04] text-white ring-white/10">
      <CardHeader className="space-y-3 pb-3">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-base leading-6">{category.name}</CardTitle>
          <p className="shrink-0 text-sm font-semibold text-cyan-200">
            {category.score}/{category.maxScore}
          </p>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-cyan-300"
            style={{ width: scoreWidth(category.score, category.maxScore) }}
          />
        </div>
        <CardDescription className="line-clamp-3 text-xs leading-5 text-zinc-400">
          {category.reason}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <details className="rounded-md border border-white/10 bg-black/10 px-3 py-2">
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
        <details className="rounded-md border border-white/10 bg-black/10 px-3 py-2">
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
        <details className="rounded-md border border-white/10 bg-black/10 px-3 py-2">
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
          <details className="rounded-md border border-white/10 bg-black/10 px-3 py-2">
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
    <main className="min-h-screen bg-[#05070d] px-6 py-8 text-white lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          TalentForge AI
        </Link>
        <Button
          asChild
          variant="outline"
          className="border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white"
        >
          <Link href="/dashboard">Dashboard</Link>
        </Button>
      </div>

      <section className="mx-auto w-full max-w-7xl py-10">
        <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
          <div className="flex flex-col justify-center">
            <p className="text-sm font-semibold uppercase text-cyan-200">
              Resume Analyzer v3
            </p>
            <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl">
              Evidence-based resume diagnostics.
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-zinc-300">
              Upload a PDF resume to generate a criteria-based analysis with
              explainable scoring, missing evidence, quick wins, and red flags.
            </p>
          </div>

          <Card className="border-white/10 bg-white/[0.055] text-white ring-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Upload Resume</CardTitle>
              <CardDescription className="text-sm leading-6 text-zinc-400">
                Existing uploads stay compatible. New uploads store the full
                analysis JSON.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UploadResumeForm />
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl pb-16">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase text-cyan-200">
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
                  <Card className="border-white/10 bg-white/[0.055] text-white ring-white/10">
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
                              analyzed with Resume Analyzer v3.
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-3 lg:justify-end">
                          {resume.fileUrl ? (
                            <Button
                              asChild
                              variant="outline"
                              className="border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white"
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
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                        <div className="rounded-md border border-white/10 bg-black/15 p-3">
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
                        <div className="rounded-md border border-white/10 bg-black/15 p-3">
                          <p className="text-xs font-medium uppercase text-zinc-500">
                            Grade
                          </p>
                          <p className="mt-2 text-lg font-semibold text-zinc-100">
                            {grade ?? "Not scored"}
                          </p>
                        </div>
                        <div className="rounded-md border border-white/10 bg-black/15 p-3">
                          <p className="text-xs font-medium uppercase text-zinc-500">
                            Readiness
                          </p>
                          <p className="mt-2 text-lg font-semibold text-zinc-100">
                            {hiringReadiness}
                          </p>
                        </div>
                        <div className="rounded-md border border-white/10 bg-black/15 p-3">
                          <p className="text-xs font-medium uppercase text-zinc-500">
                            Profile
                          </p>
                          <p className="mt-2 text-lg font-semibold text-zinc-100">
                            {detectedProfileType}
                          </p>
                        </div>
                        <div className="rounded-md border border-white/10 bg-black/15 p-3">
                          <p className="text-xs font-medium uppercase text-zinc-500">
                            Seniority
                          </p>
                          <p className="mt-2 text-lg font-semibold text-zinc-100">
                            {detectedSeniority}
                          </p>
                        </div>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-cyan-300"
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
                    <Card className="border-white/10 bg-white/[0.035] text-white ring-white/10">
                      <CardHeader>
                        <CardTitle className="text-base">
                          Category scoring pending
                        </CardTitle>
                        <CardDescription className="leading-6 text-zinc-400">
                          Upload this resume again to generate the full v3
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
          <Card className="border-white/10 bg-white/[0.035] text-white ring-white/10">
            <CardHeader>
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
