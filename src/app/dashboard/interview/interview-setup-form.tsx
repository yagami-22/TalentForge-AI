"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  BrainCircuit,
  BriefcaseBusiness,
  Code2,
  Database,
  GitBranch,
  Layers3,
  MessageSquareText,
  Network,
  Shuffle,
} from "lucide-react";

import { generateMockInterview } from "@/app/dashboard/interview/actions";
import {
  initialInterviewSetupState,
} from "@/app/dashboard/interview/state";
import {
  INTERVIEW_ANSWERS_STORAGE_KEY,
  INTERVIEW_EVALUATION_STORAGE_KEY,
  INTERVIEW_SESSION_STORAGE_KEY,
  INTERVIEW_SIMULATOR_CONFIG_STORAGE_KEY,
  OA_ANSWERS_STORAGE_KEY,
  OA_REPORT_STORAGE_KEY,
  OA_SESSION_STORAGE_KEY,
  type StoredInterviewSimulatorConfig,
} from "@/app/dashboard/interview/interview-storage";
import {
  CompanySelector,
  DifficultySelector,
  InterviewModeCard,
  type SimulatorMode,
} from "@/app/dashboard/interview/interview-simulator-ui";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { InterviewMode } from "@/lib/interview-prep";
import { forge } from "@/lib/talentforge-design";

type ResumeOption = {
  id: string;
  title: string;
  createdAtLabel: string;
};

const SIMULATOR_MODES: SimulatorMode[] = [
  {
    value: "Technical Interview",
    title: "Technical Interview",
    description: "Concepts, implementation, debugging, and tradeoffs.",
    icon: Code2,
    mappedMode: "Technical",
  },
  {
    value: "DSA Interview",
    title: "DSA Interview",
    description: "Algorithms, complexity, edge cases, and dry runs.",
    icon: GitBranch,
    mappedMode: "Technical",
  },
  {
    value: "Frontend Interview",
    title: "Frontend Interview",
    description: "React, browser APIs, performance, UX, and state.",
    icon: Layers3,
    mappedMode: "Technical",
  },
  {
    value: "Backend Interview",
    title: "Backend Interview",
    description: "APIs, databases, reliability, auth, and queues.",
    icon: Database,
    mappedMode: "Technical",
  },
  {
    value: "System Design Interview",
    title: "System Design",
    description: "Architecture, scalability, data flows, and tradeoffs.",
    icon: Network,
    mappedMode: "Technical",
  },
  {
    value: "Project Deep Dive",
    title: "Project Deep Dive",
    description: "Architecture, stack, bugs, deployment, and decisions.",
    icon: BriefcaseBusiness,
    mappedMode: "ProjectDeepDive",
  },
  {
    value: "Behavioral / HR",
    title: "Behavioral / HR",
    description: "STAR stories, ownership, conflict, and collaboration.",
    icon: MessageSquareText,
    mappedMode: "BehavioralHR",
  },
  {
    value: "Mixed Interview",
    title: "Mixed Interview",
    description: "Balanced company-style round across multiple areas.",
    icon: Shuffle,
    mappedMode: "Technical",
  },
];

const COMPANIES = [
  "Google",
  "Amazon",
  "Microsoft",
  "Atlassian",
  "Uber",
  "Netflix",
  "Oracle",
  "Goldman Sachs",
  "Startup",
  "Custom",
];

const DIFFICULTIES = ["Beginner", "Intermediate", "Advanced", "Senior-level"];
const COACH_STORAGE_KEY = "talentforge.careerCoach.latest";

function readJSON(key: string) {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as unknown) : null;
  } catch {
    window.localStorage.removeItem(key);
    return null;
  }
}

function stringsFrom(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function smartSignalsFromStorage() {
  const coach = readJSON(COACH_STORAGE_KEY);
  const evaluation = readJSON(INTERVIEW_EVALUATION_STORAGE_KEY);
  const signals: string[] = [];

  if (coach && typeof coach === "object") {
    const record = coach as Record<string, unknown>;
    signals.push(...stringsFrom(record.weakestAreas).slice(0, 4));

    const recommendations = (record.strategicRecommendations as {
      recommendations?: Array<{ title?: unknown }>;
    } | null)?.recommendations;

    if (Array.isArray(recommendations)) {
      signals.push(
        ...recommendations
          .map((item) => item.title)
          .filter((item): item is string => typeof item === "string")
          .slice(0, 3)
      );
    }
  }

  if (evaluation && typeof evaluation === "object") {
    const record = evaluation as Record<string, unknown>;
    signals.push(...stringsFrom(record.priorityImprovements).slice(0, 4));
  }

  return Array.from(new Set(signals)).slice(0, 8);
}

export function InterviewSetupForm({ resumes }: { resumes: ResumeOption[] }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    generateMockInterview,
    initialInterviewSetupState
  );
  const [selectedMode, setSelectedMode] = useState(SIMULATOR_MODES[0].value);
  const [company, setCompany] = useState("Google");
  const [customCompany, setCustomCompany] = useState("");
  const [difficulty, setDifficulty] = useState("Intermediate");
  const [targetRole, setTargetRole] = useState("Software Engineer");
  const [jobDescription, setJobDescription] = useState("");
  const [smartSignals] = useState<string[]>(() => smartSignalsFromStorage());

  const selectedModeConfig = useMemo(
    () => SIMULATOR_MODES.find((mode) => mode.value === selectedMode) ?? SIMULATOR_MODES[0],
    [selectedMode]
  );
  const resolvedCompany = company === "Custom" && customCompany.trim()
    ? customCompany.trim()
    : company;
  const enrichedJobDescription = useMemo(() => {
    return [
      `Target role: ${targetRole}`,
      `Company style: ${resolvedCompany}`,
      `Interview mode: ${selectedMode}`,
      `Difficulty: ${difficulty}`,
      smartSignals.length
        ? `Adapt to weak areas and previous results: ${smartSignals.join("; ")}`
        : "No previous weak-area data available yet.",
      "Project deep dive focus: architecture, tech stack, scalability, database, authentication, deployment, tradeoffs, bugs fixed, and future improvements.",
      "Behavioral focus: evaluate STAR structure: Situation, Task, Action, Result.",
      jobDescription,
    ].join("\n\n");
  }, [difficulty, jobDescription, resolvedCompany, selectedMode, smartSignals, targetRole]);

  useEffect(() => {
    if (state.status !== "success") {
      return;
    }

    if (state.oaSession) {
      window.localStorage.setItem(
        OA_SESSION_STORAGE_KEY,
        JSON.stringify(state.oaSession)
      );
      window.localStorage.removeItem(OA_ANSWERS_STORAGE_KEY);
      window.localStorage.removeItem(OA_REPORT_STORAGE_KEY);
      router.push("/dashboard/interview/oa/session");
      return;
    }

    if (!state.session) {
      return;
    }

    window.localStorage.setItem(
      INTERVIEW_SESSION_STORAGE_KEY,
      JSON.stringify(state.session)
    );
    window.localStorage.removeItem(INTERVIEW_ANSWERS_STORAGE_KEY);
    window.localStorage.removeItem(INTERVIEW_EVALUATION_STORAGE_KEY);
    router.push("/dashboard/interview/session");
  }, [router, state.oaSession, state.session, state.status]);

  function persistConfig() {
    const config: StoredInterviewSimulatorConfig = {
      mode: selectedMode,
      mappedMode: selectedModeConfig.mappedMode as InterviewMode,
      company: resolvedCompany,
      customCompany,
      difficulty,
      targetRole,
      smartSignals,
    };

    window.localStorage.setItem(
      INTERVIEW_SIMULATOR_CONFIG_STORAGE_KEY,
      JSON.stringify(config)
    );
  }

  return (
    <CardShell title="Advanced Interview Simulator" badge="Company-style session">
      <form action={formAction} onSubmit={persistConfig} className="space-y-5 pt-5">
        <input type="hidden" name="mode" value={selectedModeConfig.mappedMode} />
        <input type="hidden" name="jobDescription" value={enrichedJobDescription} />

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.25fr)_360px]">
          <section className="rounded-3xl border border-[#00E5FF]/15 bg-[linear-gradient(135deg,rgba(0,229,255,0.08),rgba(255,255,255,0.035)_48%,rgba(106,92,255,0.08))] p-4 shadow-[0_0_30px_rgba(0,229,255,0.08)]">
            <div className="flex flex-col gap-2 border-b border-white/10 pb-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-medium uppercase text-cyan-100">
                  Interview Mode
                </p>
                <h3 className="text-lg font-semibold text-white">
                  Choose the round you want to simulate
                </h3>
              </div>
              <p className="text-xs text-zinc-500">
                Adapts to role, company, difficulty, resume, and prior weak areas.
              </p>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {SIMULATOR_MODES.map((mode) => (
                <InterviewModeCard
                  key={mode.value}
                  mode={mode}
                  selected={selectedMode === mode.value}
                  onSelect={setSelectedMode}
                />
              ))}
            </div>
          </section>

          <aside className="space-y-4">
            <div className={forge.metric}>
              <p className="text-xs font-semibold uppercase tracking-wide text-cyan-100">
                Selected Resume
              </p>
              <label htmlFor="resumeId" className="mt-3 block text-sm font-medium text-zinc-200">
                Resume
              </label>
              <select
                id="resumeId"
                name="resumeId"
                required
                aria-invalid={state.status === "error"}
                className={`mt-2 ${forge.select}`}
              >
                <option value="">Select a resume</option>
                {resumes.map((resume) => (
                  <option key={resume.id} value={resume.id} className="bg-slate-950">
                    {resume.title} - {resume.createdAtLabel}
                  </option>
                ))}
              </select>
            </div>
            <CompanySelector
              companies={COMPANIES}
              value={company}
              customValue={customCompany}
              onChange={setCompany}
              onCustomChange={setCustomCompany}
            />
            <DifficultySelector
              options={DIFFICULTIES}
              value={difficulty}
              onChange={setDifficulty}
            />
          </aside>
        </div>

        <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
          <div className={forge.metric}>
            <div className="flex items-center gap-2">
              <BrainCircuit className="h-4 w-4 text-cyan-100" />
              <p className="text-xs font-semibold uppercase tracking-wide text-cyan-100">
                Smart Selection
              </p>
            </div>
            <label htmlFor="targetRole" className="mt-4 block text-sm font-medium text-zinc-200">
              Target role
            </label>
            <input
              id="targetRole"
              value={targetRole}
              onChange={(event) => setTargetRole(event.target.value)}
              className="mt-2 h-11 w-full rounded-2xl border border-white/10 bg-[rgba(5,8,22,0.75)] px-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-[#00E5FF]/50 focus:ring-2 focus:ring-[#00E5FF]/20"
              placeholder="Backend Engineer"
            />
            <div className="mt-4 flex flex-wrap gap-2">
              {(smartSignals.length
                ? smartSignals
                : ["Resume skills", "Career Coach gaps", "Previous interview results"]
              ).map((signal) => (
                <span
                  key={signal}
                  className="rounded-full border border-[#00E5FF]/15 bg-[#00E5FF]/10 px-2.5 py-1 text-xs text-cyan-50"
                >
                  {signal}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20 p-4 shadow-inner">
            <div className="flex flex-col gap-1 border-b border-white/10 pb-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-medium uppercase text-cyan-100">
                  Input
                </p>
                <label
                  htmlFor="jobDescriptionText"
                  className="text-sm font-medium text-zinc-200"
                >
                  Job description or interview target
                </label>
              </div>
              <p className="text-xs leading-5 text-zinc-500">
                The simulator adds company, difficulty, and weak-area context automatically.
              </p>
            </div>
            <Textarea
              id="jobDescriptionText"
              value={jobDescription}
              onChange={(event) => setJobDescription(event.target.value)}
              required
              minLength={80}
              rows={9}
              aria-invalid={state.status === "error"}
              placeholder="Paste the job description or describe the role you want to practice for..."
              className={`mt-3 max-h-[52vh] min-h-60 resize-y overflow-y-auto p-4 ${forge.input}`}
            />
          </div>
        </div>

        {state.message ? (
          <p
            aria-live="polite"
            className={
              state.status === "error"
                ? forge.statusError
                : forge.statusSuccess
            }
          >
            {state.message}
          </p>
        ) : null}

        <div className={`${forge.panel} flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between`}>
          <div>
            <p className="text-sm font-semibold text-white">
              {selectedMode} · {resolvedCompany} · {difficulty}
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              Generates a realistic company-style session with adaptive follow-ups.
            </p>
          </div>
          <Button
            type="submit"
            disabled={pending || resumes.length === 0}
            className={`h-12 px-6 ${forge.primaryButton}`}
          >
            {pending ? "Generating..." : "Start Interview Simulator"}
          </Button>
        </div>
      </form>
    </CardShell>
  );
}

function CardShell({
  title,
  badge,
  children,
}: {
  title: string;
  badge: string;
  children: ReactNode;
}) {
  return (
    <div className={forge.cardStrong}>
      <div className="border-b border-white/10 bg-[#070B1F]/60 px-4 py-4 sm:px-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-400">
              Simulate company-style rounds with role, difficulty, resume, and weak-area targeting.
            </p>
          </div>
          <p className="text-xs font-medium uppercase text-cyan-100">{badge}</p>
        </div>
      </div>
      <div className="px-4 pb-5 sm:px-6">{children}</div>
    </div>
  );
}
