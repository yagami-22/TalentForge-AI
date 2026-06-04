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

export const runtime = "nodejs";

function jsonToStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
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

      <section className="mx-auto grid w-full max-w-7xl gap-6 py-16 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="text-sm font-semibold uppercase text-cyan-200">
            Resume Upload
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
            Upload and track your resumes.
          </h1>
          <p className="mt-5 text-lg leading-8 text-zinc-300">
            Add PDF resumes to your TalentForge workspace so future ATS and job
            match analysis can run from a clean source of truth.
          </p>
        </div>

        <Card className="border-white/10 bg-white/[0.055] text-white ring-white/10">
          <CardHeader>
            <CardTitle>Upload Resume</CardTitle>
            <CardDescription className="leading-6 text-zinc-400">
              Upload a text-based PDF to extract resume content and generate a
              rule-based ATS scan.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UploadResumeForm />
          </CardContent>
        </Card>
      </section>

      <section className="mx-auto w-full max-w-7xl pb-16">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase text-cyan-200">
              Library
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">
              Resume listing
            </h2>
          </div>
          <p className="text-sm text-zinc-500">
            {resumes.length} {resumes.length === 1 ? "resume" : "resumes"}
          </p>
        </div>

        {resumes.length ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {resumes.map((resume) => {
              const issues = jsonToStringArray(resume.atsIssues);
              const suggestions = jsonToStringArray(resume.atsSuggestions);
              const score = resume.atsScore ?? null;

              return (
                <Card
                  key={resume.id}
                  className="border-white/10 bg-white/[0.055] text-white ring-white/10"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <CardTitle className="leading-7">
                          {resume.title}
                        </CardTitle>
                        <CardDescription className="mt-1 text-zinc-400">
                          Uploaded {resume.createdAt.toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-xs font-medium uppercase text-zinc-500">
                          ATS
                        </p>
                        <p
                          className={`text-2xl font-semibold ${getScoreTone(
                            score
                          )}`}
                        >
                          {score === null ? "--" : score}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-cyan-300"
                        style={{ width: `${score ?? 0}%` }}
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div className="flex items-center justify-between gap-3">
                      <span className="truncate text-sm text-zinc-500">
                        {resume.fileUrl}
                      </span>
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
                            View
                          </a>
                        </Button>
                      ) : null}
                    </div>

                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-zinc-200">
                          Issues
                        </p>
                        <ul className="mt-2 space-y-2 text-sm leading-6 text-zinc-400">
                          {(issues.length
                            ? issues
                            : ["ATS analysis has not run for this resume yet."]
                          ).map((issue) => (
                            <li key={issue}>{issue}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-zinc-200">
                          Suggestions
                        </p>
                        <ul className="mt-2 space-y-2 text-sm leading-6 text-zinc-400">
                          {(suggestions.length
                            ? suggestions
                            : ["Upload again to generate ATS suggestions."]
                          ).map((suggestion) => (
                            <li key={suggestion}>{suggestion}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
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
