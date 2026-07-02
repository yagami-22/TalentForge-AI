"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BarChart3,
  BrainCircuit,
  BriefcaseBusiness,
  ClipboardList,
  FileSearch,
  Layers3,
  LineChart,
  SearchCheck,
  ShieldCheck,
  Sparkles,
  Target,
  Upload,
  UserCheck,
  Users,
  Workflow,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import {
  CandidateCard,
  ExecutiveSummaryCard,
  HiringScoreCard,
  InterviewQuestionCard,
  RecommendationCard,
  RecruiterHero,
  RecruiterSection,
  RiskCard,
  StrengthCard,
} from "@/app/dashboard/recruiter/recruiter-ui";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  evaluateRecruiterCandidates,
  RECRUITER_HISTORY_STORAGE_KEY,
  RECRUITER_REPORT_STORAGE_KEY,
  type RecruiterCandidateEvaluation,
  type RecruiterCandidateInput,
  type RecruiterReport,
} from "@/lib/recruiter-mode";
import { forge } from "@/lib/talentforge-design";

const RECRUITER_READABLE_EXTENSIONS = [".txt", ".md", ".csv", ".pdf"];
const RECRUITER_MAX_FILE_SIZE = 10 * 1024 * 1024;

function removeStoredRecruiterReport(key: string) {
  try {
    window.localStorage.removeItem(key);
  } catch {
    return;
  }
}

function readReport(key = RECRUITER_REPORT_STORAGE_KEY) {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as RecruiterReport) : null;
  } catch {
    removeStoredRecruiterReport(key);
    return null;
  }
}

function readHistory() {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(RECRUITER_HISTORY_STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed) ? (parsed as RecruiterReport[]) : [];
  } catch {
    removeStoredRecruiterReport(RECRUITER_HISTORY_STORAGE_KEY);
    return [];
  }
}

function storeReport(report: RecruiterReport) {
  const history = readHistory();

  try {
    window.localStorage.setItem(RECRUITER_REPORT_STORAGE_KEY, JSON.stringify(report));
    window.localStorage.setItem(
      RECRUITER_HISTORY_STORAGE_KEY,
      JSON.stringify([report, ...history.filter((item) => item.id !== report.id)].slice(0, 12))
    );
    return true;
  } catch {
    return false;
  }
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Just now";
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function RecruiterDashboardClient() {
  const [latest] = useState<RecruiterReport | null>(() => readReport());
  const [history] = useState<RecruiterReport[]>(() => readHistory());
  const allReports = latest
    ? [latest, ...history.filter((report) => report.id !== latest.id)]
    : history;
  const reports = allReports.slice(0, 4);
  const allCandidates = allReports.flatMap((report) => report.candidates);
  const latestCandidates = latest?.candidates ?? [];
  const averageHireScore = latestCandidates.length
    ? Math.round(
        latestCandidates.reduce(
          (sum, candidate) => sum + (candidate.overallHireScore.score ?? 0),
          0
        ) / latestCandidates.length
      )
    : 0;
  const pendingReviews = latestCandidates.filter((candidate) =>
    ["Interview Recommended", "Junior Role Recommended"].includes(candidate.recommendation)
  ).length;
  const topSkills = Array.from(
    new Set(
      latestCandidates.flatMap((candidate) =>
        candidate.recruiterInsights.topMatchingSkills.filter(
          (skill) => skill && !/no dominant|not available/i.test(skill)
        )
      )
    )
  ).slice(0, 3);

  return (
    <div className={forge.section}>
      <RecruiterWorkspaceHero />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <MetricCard
          label="Candidates analyzed"
          value={String(
            allReports.reduce((sum, report) => sum + report.metrics.candidatesReviewed, 0)
          )}
          icon={Users}
        />
        <MetricCard
          label="Strong hires"
          value={String(
            allCandidates.filter((candidate) => candidate.recommendation === "Strong Hire").length
          )}
          icon={ShieldCheck}
        />
        <MetricCard label="Average ATS" value={String(latest?.metrics.averageATS ?? 0)} icon={FileSearch} />
        <MetricCard label="Average Hire Score" value={String(averageHireScore)} icon={Target} />
        <MetricCard label="Top Skills" value={topSkills.length ? topSkills.join(", ") : "No data"} icon={BrainCircuit} compact />
        <MetricCard label="Pending Reviews" value={String(pendingReviews)} icon={ClipboardList} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {recruiterFeatures.map((feature) => (
          <RecruiterFeatureCard key={feature.title} {...feature} />
        ))}
      </div>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_390px]">
        <RecruiterSection
          title="Recent Recruiter Reports"
          description="Previously generated recruiter reports saved in this browser."
          action={
            <Button asChild variant="outline" className={forge.secondaryButton}>
              <Link href="/dashboard/recruiter/history">
                View Reports
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          }
        >
          {reports.length ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {reports.map((report) => (
                <article
                  key={report.id}
                  className="group rounded-[1.5rem] border border-white/[0.07] bg-[#101827]/60 p-4 shadow-[0_0_14px_rgba(0,229,255,0.032)] transition duration-300 hover:-translate-y-0.5 hover:border-cyan-300/16 hover:bg-white/[0.048]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-cyan-100">
                        {formatDate(report.createdAt)}
                      </p>
                      <h3 className="mt-2 text-lg font-semibold text-white">{report.role}</h3>
                    </div>
                    <span className="rounded-full border border-[#00E5FF]/18 bg-[#00E5FF]/10 px-3 py-1 text-xs text-cyan-100">
                      {report.metrics.candidatesReviewed} candidates
                    </span>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                    <ReportMiniMetric label="Strong" value={`${report.metrics.strongHirePercent}%`} />
                    <ReportMiniMetric label="ATS" value={String(report.metrics.averageATS)} />
                    <ReportMiniMetric label="Skills" value={String(report.metrics.averageSkillMatch)} />
                  </div>
                  <Link
                    href="/dashboard/recruiter/report"
                    className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-cyan-100 transition group-hover:text-white"
                  >
                    Open report
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </article>
              ))}
            </div>
          ) : (
            <EmptyRecruiterState
              title="No recruiter reports yet"
              description="Analyze your first candidate batch to create AI-ranked hiring reports and shortlist recommendations."
            />
          )}
        </RecruiterSection>

        <RecruiterSection title="Hiring Pipeline" description="Latest batch status distribution.">
          <div className="space-y-3">
            {pipelineStages.map((stage) => {
              const count = stage.match(latestCandidates);
              const percent = latest?.candidates.length ? Math.round((count / latest.candidates.length) * 100) : 0;

              return (
                <div key={stage.label} className="rounded-2xl border border-white/[0.08] bg-[#101827]/58 p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-zinc-300">{stage.label}</p>
                    <p className="text-sm font-semibold text-white">{count}</p>
                  </div>
                  <div className={`mt-3 h-1.5 ${forge.progressTrack}`}>
                    <div className={forge.progressFill} style={{ width: `${percent}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mt-4 text-xs text-zinc-500">
            {history.length} saved recruiter report{history.length === 1 ? "" : "s"} in this browser.
          </p>
        </RecruiterSection>
      </section>
    </div>
  );
}

const recruiterFeatures: Array<{
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
}> = [
  {
    title: "Upload Candidates",
    description: "Upload one or many resumes.",
    icon: Upload,
    href: "/dashboard/recruiter/upload",
  },
  {
    title: "Batch Resume Analysis",
    description: "Automatically analyze hundreds of resumes.",
    icon: Layers3,
    href: "/dashboard/recruiter/upload",
  },
  {
    title: "Candidate Ranking",
    description: "Rank applicants using AI Hire Score.",
    icon: SearchCheck,
    href: "/dashboard/recruiter/report",
  },
  {
    title: "Recruiter Reports",
    description: "Detailed evidence-based hiring reports.",
    icon: ClipboardList,
    href: "/dashboard/recruiter/report",
  },
  {
    title: "Hiring Pipeline",
    description: "Track Shortlisted, Interview, Offer and Rejected candidates.",
    icon: Workflow,
    href: "/dashboard/recruiter/history",
  },
  {
    title: "Recruiter Analytics",
    description: "Hiring trends, score distributions and insights.",
    icon: LineChart,
    href: "/dashboard/recruiter/history",
  },
];

const pipelineStages: Array<{
  label: string;
  match: (candidates: RecruiterCandidateEvaluation[]) => number;
}> = [
  {
    label: "Shortlisted",
    match: (candidates) =>
      candidates.filter((candidate) =>
        ["Strong Hire", "Hire"].includes(candidate.recommendation)
      ).length,
  },
  {
    label: "Interview",
    match: (candidates) =>
      candidates.filter((candidate) =>
        ["Interview Recommended", "Junior Role Recommended"].includes(candidate.recommendation)
      ).length,
  },
  {
    label: "Offer",
    match: (candidates) =>
      candidates.filter((candidate) => (candidate.overallHireScore.score ?? 0) >= 86).length,
  },
  {
    label: "Rejected",
    match: (candidates) =>
      candidates.filter(
        (candidate) => candidate.recommendation === "Not Recommended for This Senior Role"
      ).length,
  },
];

function RecruiterWorkspaceHero() {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-white/[0.07] bg-[linear-gradient(135deg,rgba(0,229,255,0.09),rgba(106,92,255,0.07)_48%,rgba(139,92,246,0.09))] p-6 shadow-[0_0_24px_rgba(0,229,255,0.055),0_0_34px_rgba(106,92,255,0.045)] backdrop-blur-2xl sm:p-8 lg:p-10">
      <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[#00E5FF]/9 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 left-10 h-80 w-80 rounded-full bg-[#8B5CF6]/8 blur-3xl" />

      <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-center">
        <div>
          <p className={forge.badge}>AI Recruiter Mode</p>
          <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Hire faster with AI.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-300 sm:text-base">
            Analyze resumes, rank candidates, compare applicants, generate recruiter reports, and shortlist top talent automatically.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button asChild className={forge.primaryButton}>
              <Link href="/dashboard/recruiter/upload">
                <Upload className="h-4 w-4" />
                Analyze Candidates
              </Link>
            </Button>
            <Button asChild variant="outline" className={forge.secondaryButton}>
              <Link href="/dashboard/recruiter/report">
                View Reports
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        <div className="relative hidden min-h-80 lg:block" aria-hidden="true">
          <div className="absolute inset-0 rounded-[2rem] border border-white/[0.07] bg-[#070B16]/45 shadow-[inset_0_0_24px_rgba(0,229,255,0.035)]" />
          <div className="absolute left-8 top-8 h-56 w-56 rounded-full border border-cyan-300/15 bg-[#00E5FF]/8 blur-[1px] motion-safe:animate-pulse" />
          <div className="absolute right-8 top-10 h-40 w-40 rounded-full border border-violet-300/15 bg-[#8B5CF6]/10 motion-safe:animate-pulse" />
          <div className="absolute left-10 top-10 w-52 rounded-[1.5rem] border border-white/[0.08] bg-white/[0.05] p-4 shadow-[0_0_18px_rgba(0,229,255,0.06)] backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#00E5FF]/12 text-cyan-100">
                <UserCheck className="h-5 w-5" />
              </div>
              <div>
                <div className="h-2 w-24 rounded-full bg-white/35" />
                <div className="mt-2 h-2 w-16 rounded-full bg-white/15" />
              </div>
            </div>
            <div className="mt-5 space-y-2">
              <div className={`h-2.5 ${forge.progressTrack}`}>
                <div className={forge.progressFill} style={{ width: "84%" }} />
              </div>
              <div className={`h-2.5 ${forge.progressTrack}`}>
                <div className={forge.progressFill} style={{ width: "67%" }} />
              </div>
              <div className={`h-2.5 ${forge.progressTrack}`}>
                <div className={forge.progressFill} style={{ width: "92%" }} />
              </div>
            </div>
          </div>
          <div className="absolute bottom-8 right-10 w-56 rounded-[1.5rem] border border-[#8B5CF6]/16 bg-[#101827]/76 p-4 shadow-[0_0_18px_rgba(139,92,246,0.08)] backdrop-blur-xl">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-cyan-100">
              <Sparkles className="h-4 w-4" />
              AI Shortlist
            </p>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-2">
                <p className="text-lg font-semibold text-white">92</p>
                <p className="text-[10px] text-zinc-500">Score</p>
              </div>
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-2">
                <p className="text-lg font-semibold text-white">18</p>
                <p className="text-[10px] text-zinc-500">Skills</p>
              </div>
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-2">
                <p className="text-lg font-semibold text-white">4</p>
                <p className="text-[10px] text-zinc-500">Risks</p>
              </div>
            </div>
          </div>
          <div className="absolute right-24 top-24 grid h-20 w-20 place-items-center rounded-full border border-cyan-300/16 bg-[#00E5FF]/8 shadow-[0_0_18px_rgba(0,229,255,0.09)] motion-safe:animate-pulse">
            <BrainCircuit className="h-8 w-8 text-cyan-100" />
          </div>
        </div>
      </div>
    </section>
  );
}

function RecruiterFeatureCard({
  title,
  description,
  icon: Icon,
  href,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-[1.5rem] border border-white/[0.07] bg-white/[0.035] p-5 shadow-[0_0_14px_rgba(0,229,255,0.032)] transition duration-300 hover:-translate-y-0.5 hover:border-[#00E5FF]/18 hover:bg-white/[0.05] hover:shadow-[0_0_22px_rgba(0,229,255,0.08)]"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="grid h-11 w-11 place-items-center rounded-2xl border border-[#00E5FF]/14 bg-[#00E5FF]/8 text-cyan-100 shadow-[0_0_12px_rgba(0,229,255,0.06)]">
          <Icon className="h-5 w-5" />
        </div>
        <ArrowRight className="h-4 w-4 text-zinc-600 transition group-hover:translate-x-0.5 group-hover:text-cyan-100" />
      </div>
      <h3 className="mt-5 text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-zinc-400">{description}</p>
    </Link>
  );
}

function ReportMiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-3">
      <p className="text-base font-semibold text-white">{value}</p>
      <p className="mt-1 text-[11px] uppercase tracking-wide text-zinc-500">{label}</p>
    </div>
  );
}

export function RecruiterUploadClient() {
  const router = useRouter();
  const [jobDescription, setJobDescription] = useState("");
  const [candidateFiles, setCandidateFiles] = useState<RecruiterCandidateInput[]>([]);
  const [error, setError] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    setError("");
    const rejectedFiles: string[] = [];
    const nextCandidates = (
      await Promise.all(
        Array.from(files).map(async (file) => {
          const fileName = file.name.toLowerCase();
          const isReadableType =
            file.type.startsWith("text/") ||
            RECRUITER_READABLE_EXTENSIONS.some((extension) => fileName.endsWith(extension));

          if (!isReadableType) {
            rejectedFiles.push(`${file.name}: unsupported file type`);
            return null;
          }

          if (file.size > RECRUITER_MAX_FILE_SIZE) {
            rejectedFiles.push(`${file.name}: file is over 10 MB`);
            return null;
          }

          const text = await file.text();

          if (text.replace(/\s+/g, "").length < 120) {
            rejectedFiles.push(`${file.name}: no readable resume text found`);
            return null;
          }

          return {
            id: `candidate_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            name: file.name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " "),
            fileName: file.name,
            resumeText: text,
          };
        })
      )
    ).filter((candidate): candidate is RecruiterCandidateInput => Boolean(candidate));

    if (nextCandidates.length) {
      setCandidateFiles((previous) => [...previous, ...nextCandidates]);
    }

    if (rejectedFiles.length) {
      setError(`Some files were skipped. ${rejectedFiles.join(" ")}`);
    }
  }

  function analyzeCandidates() {
    setError("");

    if (jobDescription.trim().length < 120) {
      setError("Paste a complete job description before generating recruiter analysis.");
      return;
    }

    const validCandidates = candidateFiles.filter(
      (candidate) => candidate.resumeText.replace(/\s+/g, "").length >= 120
    );

    if (!validCandidates.length) {
      setError("Upload at least one readable text-based resume.");
      return;
    }

    setIsAnalyzing(true);
    const report = evaluateRecruiterCandidates({
      jobDescription,
      candidates: validCandidates,
    });
    if (!storeReport(report)) {
      setIsAnalyzing(false);
      setError("Recruiter report could not be saved in this browser. Check storage permissions and try again.");
      return;
    }

    router.push("/dashboard/recruiter/report");
  }

  return (
    <div className={forge.section}>
      <RecruiterHero
        title="Review a candidate batch like an internal recruiting team."
        description="Paste one job description, upload multiple resumes, then generate ranked evidence-based hiring recommendations."
        primaryHref="/dashboard/recruiter/report"
        primaryLabel="Latest Report"
        secondaryHref="/dashboard/recruiter"
        secondaryLabel="Recruiter Dashboard"
      />

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
        <RecruiterSection
          title="Job Description"
          description="The recruiter engine uses this as the hiring bar for ATS, skill match, projects, and interview questions."
        >
          <Textarea
            value={jobDescription}
            onChange={(event) => setJobDescription(event.target.value)}
            rows={14}
            aria-label="Job description"
            className={`min-h-80 p-4 ${forge.input}`}
            placeholder="Paste the role description, responsibilities, requirements, must-have skills, and preferred qualifications..."
          />
        </RecruiterSection>

        <RecruiterSection title="Candidate Resumes" description="Upload one or more text-readable resumes.">
          <label className="block rounded-[1.4rem] border border-dashed border-cyan-300/22 bg-[#00E5FF]/8 p-5 text-center transition hover:bg-[#00E5FF]/12">
            <input
              type="file"
              multiple
              accept=".txt,.md,.csv,.pdf,text/plain,text/markdown,text/csv,application/pdf"
              aria-describedby="candidate-resume-upload-help"
              className="sr-only"
              onChange={(event) => void handleFiles(event.target.files)}
            />
            <FileSearch className="mx-auto h-8 w-8 text-cyan-100" />
            <span className="mt-3 block text-sm font-semibold text-white">
              Upload resumes
            </span>
            <span id="candidate-resume-upload-help" className="mt-1 block text-xs leading-5 text-zinc-500">
              Text, Markdown, CSV, and text-based PDFs up to 10 MB.
            </span>
          </label>
          <div className="mt-4 space-y-2">
            {candidateFiles.map((candidate) => (
              <div key={candidate.id} className="rounded-2xl border border-white/[0.08] bg-[#101827]/58 p-3">
                <p className="text-sm font-medium text-white">{candidate.name}</p>
                <p className="mt-1 text-xs text-zinc-500">
                  {candidate.resumeText.length.toLocaleString()} characters extracted
                </p>
              </div>
            ))}
          </div>
          {error ? (
            <p role="alert" className={`mt-4 ${forge.statusError}`}>
              {error}
            </p>
          ) : null}
          <Button
            type="button"
            onClick={analyzeCandidates}
            disabled={isAnalyzing}
            className={`mt-5 w-full ${forge.primaryButton}`}
          >
            {isAnalyzing ? "Analyzing..." : "Generate Recruiter Report"}
          </Button>
        </RecruiterSection>
      </section>
    </div>
  );
}

export function RecruiterReportClient() {
  const [report] = useState<RecruiterReport | null>(() => readReport());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedCandidate = useMemo(() => {
    if (!report) return null;
    return report.candidates.find((candidate) => candidate.id === selectedId) ?? report.candidates[0] ?? null;
  }, [report, selectedId]);
  const seniorityAssessment = selectedCandidate?.seniorityAssessment ?? {
    candidateSeniority: "Unknown",
    jobSeniority: "Unknown",
    mismatch: false,
    explanation: "Seniority evidence was not stored for this older recruiter report.",
    evidenceFound: [],
    evidenceMissing: ["Generate a new report to see seniority evidence."],
    suggestedBetterFitRoles: ["Generate a new report to see role-fit suggestions."],
  };

  if (!report || !selectedCandidate) {
    return (
      <div className={forge.section}>
        <RecruiterHero
          title="No recruiter report yet."
          description="Upload candidates and generate a recruiter analysis to view hiring recommendations."
          primaryHref="/dashboard/recruiter/upload"
          primaryLabel="Upload Candidates"
          secondaryHref="/dashboard/recruiter"
          secondaryLabel="Recruiter Dashboard"
        />
      </div>
    );
  }

  return (
    <div className={forge.section}>
      <RecruiterHero
        title={`Recruiter report for ${report.role}`}
        description={`Generated ${formatDate(report.createdAt)} · ${report.candidates.length} candidate${report.candidates.length === 1 ? "" : "s"} reviewed.`}
        primaryHref="/dashboard/recruiter/upload"
        primaryLabel="Analyze New Batch"
        secondaryHref="/dashboard/recruiter/history"
        secondaryLabel="History"
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Candidates" value={String(report.metrics.candidatesReviewed)} icon={Users} />
        <MetricCard label="Strong Hire" value={`${report.metrics.strongHirePercent}%`} icon={ShieldCheck} />
        <MetricCard label="Average ATS" value={String(report.metrics.averageATS)} icon={FileSearch} />
        <MetricCard label="Skill Match" value={String(report.metrics.averageSkillMatch)} icon={Target} />
        <MetricCard label="Projects" value={String(report.metrics.averageProjectScore)} icon={BriefcaseBusiness} />
      </div>

      <section className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <RecruiterSection title="Candidate Ranking">
          <div className="space-y-3">
            {report.candidates.map((candidate) => (
              <button
                key={candidate.id}
                type="button"
                onClick={() => setSelectedId(candidate.id)}
                className={`w-full rounded-[1.25rem] border p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00E5FF]/30 ${
                  selectedCandidate.id === candidate.id
                    ? "border-cyan-300/28 bg-[#00E5FF]/10"
                    : "border-white/[0.08] bg-[#101827]/54 hover:border-cyan-300/18"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">{candidate.name}</p>
                    <p className="mt-1 text-xs text-zinc-500">{candidate.recommendation}</p>
                  </div>
                  <span className="text-lg font-semibold text-cyan-100">
                    {candidate.overallHireScore.score ?? 0}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </RecruiterSection>

        <div className="space-y-6">
          <CandidateCard candidate={selectedCandidate} />
          <ExecutiveSummaryCard>{selectedCandidate.executiveSummary}</ExecutiveSummaryCard>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <HiringScoreCard score={selectedCandidate.overallHireScore} />
            {Object.values(selectedCandidate.scores).map((score) => (
              <HiringScoreCard key={score.label} score={score} />
            ))}
          </div>
          <section className="grid gap-4 lg:grid-cols-3">
            <StrengthCard title="Strengths" items={selectedCandidate.strengths} />
            <StrengthCard title="Weaknesses" items={selectedCandidate.weaknesses} icon={BarChart3} />
            <RecommendationCard
              recommendation={selectedCandidate.recommendation}
              reason={selectedCandidate.recommendationReason}
            />
          </section>
          <RecruiterSection
            title="Seniority Fit"
            description={seniorityAssessment.explanation}
          >
            <div className="grid gap-4 lg:grid-cols-3">
              <StrengthCard
                title="Evidence found"
                items={seniorityAssessment.evidenceFound}
              />
              <StrengthCard
                title="Evidence missing"
                items={seniorityAssessment.evidenceMissing}
                icon={BarChart3}
              />
              <StrengthCard
                title="Better-fit roles"
                items={seniorityAssessment.suggestedBetterFitRoles}
                icon={Target}
              />
            </div>
          </RecruiterSection>
          <RecruiterSection title="Hiring Risks" description="Concerns to verify before moving forward.">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {selectedCandidate.hiringRisks.map((risk) => (
                <RiskCard key={risk.title} risk={risk} />
              ))}
            </div>
          </RecruiterSection>
          <RecruiterSection title="Recruiter Insights">
            <div className="grid gap-4 lg:grid-cols-2">
              <StrengthCard title="Top technical strengths" items={selectedCandidate.recruiterInsights.topTechnicalStrengths} />
              <StrengthCard title="Most relevant projects" items={selectedCandidate.recruiterInsights.mostRelevantProjects} />
              <StrengthCard title="Top matching skills" items={selectedCandidate.recruiterInsights.topMatchingSkills} />
              <StrengthCard title="Areas to verify" items={selectedCandidate.recruiterInsights.areasToVerify} />
            </div>
          </RecruiterSection>
          <RecruiterSection title="AI Interview Recommendations">
            <div className="grid gap-4 lg:grid-cols-3">
              <InterviewQuestionCard title="5 Technical Questions" questions={selectedCandidate.interviewQuestions.technical} />
              <InterviewQuestionCard title="3 Project Questions" questions={selectedCandidate.interviewQuestions.project} />
              <InterviewQuestionCard title="2 Behavioral Questions" questions={selectedCandidate.interviewQuestions.behavioral} />
            </div>
          </RecruiterSection>
        </div>
      </section>
    </div>
  );
}

export function RecruiterHistoryClient() {
  const [history] = useState<RecruiterReport[]>(() => readHistory());

  return (
    <div className={forge.section}>
      <RecruiterHero
        title="Recruiter report history."
        description="Review previous candidate batches saved locally in this browser."
        primaryHref="/dashboard/recruiter/upload"
        primaryLabel="Analyze New Batch"
        secondaryHref="/dashboard/recruiter"
        secondaryLabel="Recruiter Dashboard"
      />
      <RecruiterSection title="Saved Reports">
        {history.length ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {history.map((report) => (
              <article key={report.id} className={forge.card}>
                <div className="p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-cyan-100">
                    {formatDate(report.createdAt)}
                  </p>
                  <h2 className="mt-2 text-xl font-semibold text-white">{report.role}</h2>
                  <p className="mt-2 text-sm text-zinc-500">
                    {report.metrics.candidatesReviewed} candidates · {report.metrics.strongHirePercent}% strong hire · Avg ATS {report.metrics.averageATS}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {report.candidates.slice(0, 3).map((candidate) => (
                      <span
                        key={candidate.id}
                        className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-zinc-300"
                      >
                        {candidate.name}: {candidate.overallHireScore.score ?? 0}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyRecruiterState />
        )}
      </RecruiterSection>
    </div>
  );
}

function MetricCard({
  label,
  value,
  icon: Icon,
  compact = false,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  compact?: boolean;
}) {
  return (
    <div className="rounded-[1.45rem] border border-white/[0.07] bg-white/[0.035] p-4 shadow-[0_0_14px_rgba(0,229,255,0.032)]">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{label}</p>
        <Icon className="h-4 w-4 text-cyan-100" />
      </div>
      <p className={`mt-3 font-semibold text-white ${compact ? "text-base leading-6" : "text-3xl"}`}>
        {value}
      </p>
    </div>
  );
}

function EmptyRecruiterState({
  title = "No candidates reviewed yet",
  description = "Start with a job description and one or more resumes to generate recruiter-grade hiring analysis.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="rounded-[1.5rem] border border-white/[0.08] bg-[#101827]/58 p-8 text-center">
      <FileSearch className="mx-auto h-8 w-8 text-cyan-100" />
      <h3 className="mt-4 text-lg font-semibold text-white">{title}</h3>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-zinc-400">
        {description}
      </p>
      <Button asChild className={`mt-5 ${forge.primaryButton}`}>
        <Link href="/dashboard/recruiter/upload">Upload Candidates</Link>
      </Button>
    </div>
  );
}
