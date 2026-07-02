"use client";

import Link from "next/link";
import { useEffect, useMemo, useSyncExternalStore } from "react";
import {
  BriefcaseBusiness,
  ClipboardCheck,
  Code2,
  Compass,
  Database,
  FileText,
  GitBranch,
  Layers3,
  MessageSquareText,
  Rocket,
  SearchCheck,
  Server,
  ShieldCheck,
  Target,
  Trophy,
} from "lucide-react";

import {
  INTERVIEW_EVALUATION_STORAGE_KEY,
  OA_REPORT_STORAGE_KEY,
} from "@/app/dashboard/interview/interview-storage";
import {
  AchievementBadge,
  CareerHero,
  CoachSection,
  LearningCard,
  ProgressChart,
  ReadinessCard,
  RecommendationCard,
  RoadmapCard,
  SourcePill,
  TimelineCard,
  type Achievement,
  type CoachRecommendation,
  type CoachTimelineEvent,
  type LearningTopic,
  type ReadinessCategory,
  type RoadmapWeek,
} from "@/app/dashboard/coach/career-coach-ui";
import { Button } from "@/components/ui/button";
import {
  buildCareerCoachReport,
  type CareerCoachReport,
  type CareerCoachResumeSnapshot,
  type CareerCoachStrategicRecommendation,
} from "@/lib/career-coach";
import type { ATSOptimizationAnalysis } from "@/lib/ats-optimizer";
import type { InterviewEvaluation } from "@/lib/interview-prep";
import type { JobDescriptionMatchAnalysis } from "@/lib/jd-match-analyzer";
import type { OAReport } from "@/lib/oa-evaluation";
import { LOCAL_RESUME_HISTORY_KEY } from "@/lib/resume-versioning-client";
import { forge } from "@/lib/talentforge-design";

const ATS_STORAGE_KEY = "talentforge.atsOptimizer.latest";
const JD_MATCH_STORAGE_KEY = "talentforge.jdMatch.latest";
const COACH_STORAGE_KEY = "talentforge.careerCoach.latest";
const COACH_SNAPSHOTS_KEY = "talentforge.careerCoach.snapshots";
const COACH_GOAL_KEY = "talentforge.careerCoach.goal";
const COACH_ROADMAP_PROGRESS_KEY = "talentforge.careerCoach.roadmapProgress";
const COACH_STORAGE_EVENT = "talentforge.careerCoach.storage";

const GOALS = [
  "Google SDE",
  "Amazon SDE",
  "Microsoft",
  "Atlassian",
  "Uber",
  "Netflix",
  "Frontend",
  "Backend",
  "Full Stack",
  "AI Engineer",
  "ML Engineer",
  "Data Scientist",
  "Custom Goal",
];

type CareerGoalPreference = {
  goal: string;
  customGoal: string;
};

type CareerCoachSnapshot = {
  generatedAt: string;
  readiness: number;
  resume: number | null;
  ats: number | null;
  jdMatch: number | null;
  interview: number | null;
};

type SourceState = {
  ats: boolean;
  jdMatch: boolean;
  oa: boolean;
  interview: boolean;
  versionCount: number;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readJSON<T>(key: string): T | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    window.localStorage.removeItem(key);
    return null;
  }
}

function readStoredAnalysis<T>(key: string): T | null {
  const parsed = readJSON<unknown>(key);

  if (!isRecord(parsed) || !("analysis" in parsed) || !isRecord(parsed.analysis)) {
    return null;
  }

  return parsed.analysis as T;
}

function isCareerCoachReport(value: unknown): value is CareerCoachReport {
  return (
    isRecord(value) &&
    typeof value.generatedAt === "string" &&
    typeof value.careerReadinessScore === "number" &&
    typeof value.targetRole === "string" &&
    isRecord(value.scores) &&
    Array.isArray(value.missingData) &&
    Array.isArray(value.strongestAreas) &&
    Array.isArray(value.weakestAreas) &&
    Array.isArray(value.sevenDayActionPlan) &&
    Array.isArray(value.thirtyDayRoadmap) &&
    isRecord(value.strategicRecommendations) &&
    isRecord(value.careerGapAnalysis) &&
    isRecord(value.impactRanking) &&
    isRecord(value.recruiterSimulation) &&
    Array.isArray(value.skillMaturity) &&
    Array.isArray(value.targetRoleComparison) &&
    isRecord(value.readinessFormula)
  );
}

function readLatestATSReport() {
  return readStoredAnalysis<ATSOptimizationAnalysis>(ATS_STORAGE_KEY);
}

function readLatestJDMatchReport() {
  return readStoredAnalysis<JobDescriptionMatchAnalysis>(JD_MATCH_STORAGE_KEY);
}

function readLatestOAReport() {
  return readJSON<OAReport>(OA_REPORT_STORAGE_KEY);
}

function readLatestInterviewReport() {
  return readJSON<InterviewEvaluation>(INTERVIEW_EVALUATION_STORAGE_KEY);
}

function readSavedCoachReport() {
  const saved = readJSON<unknown>(COACH_STORAGE_KEY);

  if (!saved) {
    return null;
  }

  if (!isCareerCoachReport(saved)) {
    window.localStorage.removeItem(COACH_STORAGE_KEY);
    return null;
  }

  return saved;
}

function readCoachSnapshots() {
  const saved = readJSON<unknown>(COACH_SNAPSHOTS_KEY);

  if (!Array.isArray(saved)) {
    return [];
  }

  return saved.filter((item): item is CareerCoachSnapshot => {
    return (
      isRecord(item) &&
      typeof item.generatedAt === "string" &&
      typeof item.readiness === "number"
    );
  });
}

function readGoalPreference(): CareerGoalPreference {
  const saved = readJSON<unknown>(COACH_GOAL_KEY);

  if (!isRecord(saved)) {
    return { goal: "Google SDE", customGoal: "" };
  }

  return {
    goal: typeof saved.goal === "string" ? saved.goal : "Google SDE",
    customGoal: typeof saved.customGoal === "string" ? saved.customGoal : "",
  };
}

function saveGoalPreference(goal: CareerGoalPreference) {
  window.localStorage.setItem(COACH_GOAL_KEY, JSON.stringify(goal));
  window.dispatchEvent(new Event(COACH_STORAGE_EVENT));
}

function readRoadmapProgress() {
  const saved = readJSON<unknown>(COACH_ROADMAP_PROGRESS_KEY);

  return isRecord(saved)
    ? Object.fromEntries(
        Object.entries(saved).filter((entry): entry is [string, boolean] => {
          return typeof entry[0] === "string" && typeof entry[1] === "boolean";
        })
      )
    : {};
}

function saveRoadmapProgress(progress: Record<string, boolean>) {
  window.localStorage.setItem(COACH_ROADMAP_PROGRESS_KEY, JSON.stringify(progress));
  window.dispatchEvent(new Event(COACH_STORAGE_EVENT));
}

function readVersionCount() {
  const saved = readJSON<unknown>(LOCAL_RESUME_HISTORY_KEY);

  if (!Array.isArray(saved)) {
    return 0;
  }

  return saved.reduce((total, resume) => {
    if (!isRecord(resume) || !Array.isArray(resume.versions)) {
      return total;
    }

    return total + resume.versions.length;
  }, 0);
}

function scoreValue(score: number | null | undefined) {
  return typeof score === "number" ? score : null;
}

function delta(current: number | null, previous: number | null) {
  if (current === null || previous === null) return null;
  return current - previous;
}

function withProgressTracking(report: CareerCoachReport) {
  const snapshots = readCoachSnapshots();
  const previous = snapshots.at(-1) ?? null;

  return {
    ...report,
    progressTracking: {
      previousReadiness: previous?.readiness ?? null,
      currentReadiness: report.careerReadinessScore,
      readinessDelta: previous
        ? report.careerReadinessScore - previous.readiness
        : null,
      atsDelta: delta(report.scores.atsReadiness.score, previous?.ats ?? null),
      interviewDelta: delta(
        report.scores.interviewReadiness.score,
        previous?.interview ?? null
      ),
      jdMatchDelta: delta(
        report.scores.jobMatchReadiness.score,
        previous?.jdMatch ?? null
      ),
      resumeDelta: delta(
        report.scores.resumeReadiness.score,
        previous?.resume ?? null
      ),
    },
  };
}

function storeCoachReport(report: CareerCoachReport) {
  const reportWithProgress = withProgressTracking(report);
  const snapshots = readCoachSnapshots();
  const nextSnapshot: CareerCoachSnapshot = {
    generatedAt: reportWithProgress.generatedAt,
    readiness: reportWithProgress.careerReadinessScore,
    resume: scoreValue(reportWithProgress.scores.resumeReadiness.score),
    ats: scoreValue(reportWithProgress.scores.atsReadiness.score),
    jdMatch: scoreValue(reportWithProgress.scores.jobMatchReadiness.score),
    interview: scoreValue(reportWithProgress.scores.interviewReadiness.score),
  };
  const nextSnapshots = [...snapshots, nextSnapshot].slice(-12);

  window.localStorage.setItem(COACH_STORAGE_KEY, JSON.stringify(reportWithProgress));
  window.localStorage.setItem(COACH_SNAPSHOTS_KEY, JSON.stringify(nextSnapshots));
  window.dispatchEvent(new Event(COACH_STORAGE_EVENT));
}

function subscribeToCoachSources(callback: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  window.addEventListener("storage", callback);
  window.addEventListener(COACH_STORAGE_EVENT, callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(COACH_STORAGE_EVENT, callback);
  };
}

function getCoachSnapshot() {
  if (typeof window === "undefined") {
    return "server";
  }

  return JSON.stringify({
    ats: window.localStorage.getItem(ATS_STORAGE_KEY),
    jdMatch: window.localStorage.getItem(JD_MATCH_STORAGE_KEY),
    oa: window.localStorage.getItem(OA_REPORT_STORAGE_KEY),
    interview: window.localStorage.getItem(INTERVIEW_EVALUATION_STORAGE_KEY),
    coach: window.localStorage.getItem(COACH_STORAGE_KEY),
    snapshots: window.localStorage.getItem(COACH_SNAPSHOTS_KEY),
    goal: window.localStorage.getItem(COACH_GOAL_KEY),
    roadmap: window.localStorage.getItem(COACH_ROADMAP_PROGRESS_KEY),
    versions: window.localStorage.getItem(LOCAL_RESUME_HISTORY_KEY),
  });
}

function getServerCoachSnapshot() {
  return "server";
}

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function scoreFromState(state: string | undefined) {
  if (state === "Advanced") return 84;
  if (state === "Intermediate") return 62;
  if (state === "Basic") return 38;
  return 18;
}

function scoreFromGap(report: CareerCoachReport, gapName: string) {
  return scoreFromState(
    report.careerGapAnalysis.gaps.find((gap) => gap.gapName === gapName)
      ?.currentState
  );
}

function scoreFromMaturity(report: CareerCoachReport) {
  if (!report.skillMaturity.length) {
    return 20;
  }

  const total = report.skillMaturity.reduce((sum, item) => {
    if (item.maturity === "Senior Ready") return sum + 94;
    if (item.maturity === "Advanced") return sum + 82;
    if (item.maturity === "Intermediate") return sum + 60;
    return sum + 34;
  }, 0);

  return clampScore(total / report.skillMaturity.length);
}

function getTargetGoal(goal: CareerGoalPreference) {
  return goal.goal === "Custom Goal" && goal.customGoal.trim()
    ? goal.customGoal.trim()
    : goal.goal;
}

function getTargetCompany(goal: string) {
  const company = goal.split(/\s+/)[0] ?? "";
  const knownCompanies = ["Google", "Amazon", "Microsoft", "Atlassian", "Uber", "Netflix"];

  return knownCompanies.includes(company) ? company : "Open market";
}

function estimateTimeline(score: number) {
  if (score >= 85) return "2-3 weeks";
  if (score >= 70) return "4-6 weeks";
  if (score >= 55) return "6-8 weeks";
  return "8-12 weeks";
}

function formatProgressDelta(value: number | null) {
  if (value === null) return "No previous trend";
  if (value === 0) return "No change";
  return `${value > 0 ? "+" : ""}${value} this cycle`;
}

function difficultyFromPriority(priority: CareerCoachStrategicRecommendation["priority"]) {
  if (priority === "High") return "Hard";
  if (priority === "Medium") return "Medium";
  return "Easy";
}

function buildSourceState(): SourceState {
  return {
    ats: Boolean(readLatestATSReport()),
    jdMatch: Boolean(readLatestJDMatchReport()),
    oa: Boolean(readLatestOAReport()),
    interview: Boolean(readLatestInterviewReport()),
    versionCount: readVersionCount(),
  };
}

function buildReadinessCategories(
  report: CareerCoachReport,
  sourceState: SourceState
): ReadinessCategory[] {
  const versionScore =
    sourceState.versionCount === 0
      ? 0
      : clampScore(38 + Math.min(56, sourceState.versionCount * 7));

  return [
    {
      label: "Resume",
      value: report.scores.resumeReadiness.score,
      description: report.scores.resumeReadiness.reason,
      icon: FileText,
    },
    {
      label: "ATS",
      value: report.scores.atsReadiness.score,
      description: report.scores.atsReadiness.reason,
      icon: ClipboardCheck,
    },
    {
      label: "JD Match",
      value: report.scores.jobMatchReadiness.score,
      description: report.scores.jobMatchReadiness.reason,
      icon: SearchCheck,
    },
    {
      label: "Interview",
      value: report.scores.interviewReadiness.score,
      description: report.scores.interviewReadiness.reason,
      icon: MessageSquareText,
    },
    {
      label: "Projects",
      value: scoreFromGap(report, "Projects"),
      description: "Project proof, depth, and portfolio evidence.",
      icon: Layers3,
    },
    {
      label: "Skills",
      value: scoreFromMaturity(report),
      description: "Skill maturity from ATS, JD, and interview signals.",
      icon: Code2,
    },
    {
      label: "Experience",
      value: Math.max(
        scoreFromGap(report, "Resume Evidence"),
        scoreFromGap(report, "Leadership Signals")
      ),
      description: "Ownership, impact, and practical work signals.",
      icon: BriefcaseBusiness,
    },
    {
      label: "Version History",
      value: versionScore,
      description: `${sourceState.versionCount} saved resume version${sourceState.versionCount === 1 ? "" : "s"}.`,
      icon: GitBranch,
    },
  ];
}

function getStrongestArea(categories: ReadinessCategory[]) {
  return [...categories]
    .filter((category) => category.value !== null)
    .sort((a, b) => (b.value ?? 0) - (a.value ?? 0))[0];
}

function getWeakestArea(categories: ReadinessCategory[]) {
  return [...categories]
    .filter((category) => category.value !== null)
    .sort((a, b) => (a.value ?? 0) - (b.value ?? 0))[0];
}

function buildWeeklyRoadmap(
  report: CareerCoachReport,
  targetGoal: string
): RoadmapWeek[] {
  const topRecommendation = report.strategicRecommendations.nextBestAction;
  const firstSkill =
    report.skillGapRoadmap[0]?.title ??
    report.skillMaturity.find((item) => item.maturity === "Beginner")?.skill ??
    "target-role fundamentals";
  const resumeTask =
    report.resumeImprovementPlan[0]?.title ?? "tighten resume evidence";
  const interviewTask =
    report.interviewPracticePlan[0]?.title ?? "complete one mock interview";

  return [
    {
      id: "week-1",
      title: "Week 1",
      focus: "Fix the highest leverage gap",
      items: [
        topRecommendation.title,
        "Improve ATS signal toward 90+.",
        `Rewrite resume evidence around ${resumeTask}.`,
        "Complete one interview or OA session.",
        `Study ${firstSkill}.`,
      ],
    },
    {
      id: "week-2",
      title: "Week 2",
      focus: "Build target-role proof",
      items: [
        `Build or refine one ${targetGoal} proof project.`,
        "Solve 20 focused DSA or role-specific problems.",
        "Run JD Match against a real target posting.",
        "Practice one project deep dive.",
        "Document tradeoffs, tests, and performance decisions.",
      ],
    },
    {
      id: "week-3",
      title: "Week 3",
      focus: "Raise interview confidence",
      items: [
        `Practice ${interviewTask}.`,
        "Complete one system-design style explanation.",
        "Review weak concepts from OA/interview feedback.",
        "Record one behavioral answer using STAR.",
        "Re-run resume analyzer after edits.",
      ],
    },
    {
      id: "week-4",
      title: "Week 4",
      focus: "Application readiness sprint",
      items: [
        "Create final resume version for the target role.",
        "Confirm ATS and JD Match improvements.",
        "Complete one full mock interview.",
        "Prepare recruiter summary and project stories.",
        "Apply to a shortlist of aligned roles.",
      ],
    },
  ];
}

function buildRecommendations(
  report: CareerCoachReport
): CoachRecommendation[] {
  return report.strategicRecommendations.recommendations.slice(0, 6).map((item) => ({
    id: item.id,
    title: item.title,
    priority: item.priority,
    reason: item.reason,
    impact: `+${item.expectedReadinessGain} readiness`,
    difficulty: difficultyFromPriority(item.priority),
  }));
}

function buildLearningTopics(report: CareerCoachReport): LearningTopic[] {
  const weakSkills = report.skillMaturity
    .filter((item) => item.maturity === "Beginner" || item.maturity === "Intermediate")
    .map((item) => item.skill);
  const fallback = [
    "Graphs",
    "DP",
    "React",
    "Node",
    "Docker",
    "AWS",
    "System Design",
    "SQL",
    "Behavioral",
  ];
  const topics = Array.from(new Set([...weakSkills, ...fallback])).slice(0, 9);

  return topics.map((title, index) => ({
    title,
    difficulty:
      /System Design|AWS|DP/i.test(title)
        ? "Advanced"
        : /Docker|Node|SQL|Graphs/i.test(title)
          ? "Intermediate"
          : "Beginner",
    hours: index < 3 ? 6 : index < 6 ? 4 : 3,
    priority: index < 3 ? "High" : index < 6 ? "Medium" : "Low",
  }));
}

function buildTimeline(
  report: CareerCoachReport,
  resume: CareerCoachResumeSnapshot | null,
  sourceState: SourceState
): CoachTimelineEvent[] {
  return [
    {
      id: "resume-uploaded",
      title: "Resume uploaded",
      detail: resume ? resume.title : "Upload a resume to start the operating system.",
      time: resume ? "Active" : "Pending",
      active: Boolean(resume),
    },
    {
      id: "ats-improved",
      title: "ATS improved",
      detail: report.scores.atsReadiness.score
        ? `Current ATS readiness is ${report.scores.atsReadiness.score}.`
        : "Run ATS Optimizer to create this milestone.",
      time: sourceState.ats ? "Latest" : "Pending",
      active: sourceState.ats,
    },
    {
      id: "jd-matched",
      title: "JD matched",
      detail: report.scores.jobMatchReadiness.score
        ? `Current JD fit is ${report.scores.jobMatchReadiness.score}.`
        : "Analyze a job description to unlock role fit.",
      time: sourceState.jdMatch ? "Latest" : "Pending",
      active: sourceState.jdMatch,
    },
    {
      id: "interview-completed",
      title: "Interview completed",
      detail: report.scores.interviewReadiness.score
        ? `Interview readiness is ${report.scores.interviewReadiness.score}.`
        : "Complete one mock interview or OA session.",
      time: sourceState.oa || sourceState.interview ? "Latest" : "Pending",
      active: sourceState.oa || sourceState.interview,
    },
    {
      id: "resume-rewritten",
      title: "Resume rewritten",
      detail: "Resume Rewriter and Version History signals are tracked here.",
      time: sourceState.versionCount ? `${sourceState.versionCount} versions` : "Pending",
      active: sourceState.versionCount > 0,
    },
    {
      id: "milestone-unlocked",
      title: "Milestone unlocked",
      detail: report.careerReadinessScore >= 80
        ? "You are approaching application readiness."
        : "Complete the next weekly checklist to unlock readiness milestones.",
      time: report.careerReadinessScore >= 80 ? "Unlocked" : "Next",
      active: report.careerReadinessScore >= 80,
    },
  ];
}

function buildAchievements(
  report: CareerCoachReport,
  resume: CareerCoachResumeSnapshot | null,
  sourceState: SourceState
): Achievement[] {
  return [
    {
      id: "first-resume",
      title: "First Resume",
      description: "Uploaded a resume baseline.",
      unlocked: Boolean(resume),
    },
    {
      id: "ats-90",
      title: "ATS 90+",
      description: "Reached elite ATS readiness.",
      unlocked: (report.scores.atsReadiness.score ?? 0) >= 90,
    },
    {
      id: "five-interviews",
      title: "5 Interviews",
      description: "Built interview repetition.",
      unlocked: Boolean(sourceState.oa || sourceState.interview) && (report.scores.interviewReadiness.score ?? 0) >= 75,
    },
    {
      id: "ten-versions",
      title: "10 Resume Versions",
      description: "Iterated with version history.",
      unlocked: sourceState.versionCount >= 10,
    },
    {
      id: "dsa-100",
      title: "100 DSA Problems",
      description: "Manual milestone from roadmap practice.",
      unlocked: false,
    },
    {
      id: "career-ready",
      title: "Career Ready",
      description: "Overall readiness reached 85+.",
      unlocked: report.careerReadinessScore >= 85,
    },
  ];
}

function buildProgressPoints(
  snapshots: CareerCoachSnapshot[],
  key: keyof Pick<CareerCoachSnapshot, "readiness" | "resume" | "ats" | "jdMatch" | "interview">,
  fallback: number
) {
  const points = snapshots
    .map((snapshot) => snapshot[key])
    .filter((value): value is number => typeof value === "number");

  return points.length ? points : [Math.max(0, fallback - 18), Math.max(0, fallback - 9), fallback];
}

function completionPercent(roadmap: RoadmapWeek[], progress: Record<string, boolean>) {
  const total = roadmap.reduce((sum, week) => sum + week.items.length, 0);
  const complete = roadmap.reduce((sum, week) => {
    return sum + week.items.filter((_, index) => progress[`${week.id}-${index}`]).length;
  }, 0);

  return total ? clampScore((complete / total) * 100) : 0;
}

function GoalSelector({
  value,
  onChange,
}: {
  value: CareerGoalPreference;
  onChange: (next: CareerGoalPreference) => void;
}) {
  return (
    <div className="rounded-[1.55rem] border border-white/[0.08] bg-[#070B1F]/62 p-4">
      <label className="text-xs font-semibold uppercase tracking-wide text-cyan-100">
        Career Goal
        <select
          value={value.goal}
          onChange={(event) =>
            onChange({ ...value, goal: event.target.value })
          }
          className="mt-3 h-11 w-full rounded-2xl border border-white/10 bg-[rgba(5,8,22,0.75)] px-3 text-sm normal-case tracking-normal text-white outline-none transition duration-300 focus:border-[#00E5FF]/50 focus:ring-2 focus:ring-[#00E5FF]/20"
        >
          {GOALS.map((goal) => (
            <option key={goal} value={goal}>
              {goal}
            </option>
          ))}
        </select>
      </label>
      {value.goal === "Custom Goal" ? (
        <label className="mt-3 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
          Custom Goal
          <input
            value={value.customGoal}
            onChange={(event) =>
              onChange({ ...value, customGoal: event.target.value })
            }
            placeholder="Senior Backend Engineer"
            className="mt-2 h-11 w-full rounded-2xl border border-white/10 bg-[rgba(5,8,22,0.75)] px-3 text-sm normal-case tracking-normal text-white outline-none placeholder:text-zinc-600 focus:border-[#00E5FF]/50 focus:ring-2 focus:ring-[#00E5FF]/20"
          />
        </label>
      ) : null}
    </div>
  );
}

export function CareerCoachClient({
  resume,
}: {
  resume: CareerCoachResumeSnapshot | null;
}) {
  const coachSnapshot = useSyncExternalStore(
    subscribeToCoachSources,
    getCoachSnapshot,
    getServerCoachSnapshot
  );
  const isHydrated = coachSnapshot !== "server";
  const goalPreference = isHydrated
    ? readGoalPreference()
    : { goal: "Google SDE", customGoal: "" };
  const roadmapProgress = isHydrated ? readRoadmapProgress() : {};

  const sourceState = useMemo(() => {
    if (!isHydrated || coachSnapshot === "server") {
      return {
        ats: false,
        jdMatch: false,
        oa: false,
        interview: false,
        versionCount: 0,
      };
    }

    return buildSourceState();
  }, [isHydrated, coachSnapshot]);
  const report = useMemo(() => {
    if (!isHydrated || coachSnapshot === "server") {
      return null;
    }

    return (
      readSavedCoachReport() ??
      buildCareerCoachReport({
        resume,
        atsAnalysis: readLatestATSReport(),
        jdMatchAnalysis: readLatestJDMatchReport(),
        oaReport: readLatestOAReport(),
        interviewEvaluation: readLatestInterviewReport(),
      })
    );
  }, [isHydrated, coachSnapshot, resume]);

  function generateReport() {
    const nextReport = buildCareerCoachReport({
      resume,
      atsAnalysis: readLatestATSReport(),
      jdMatchAnalysis: readLatestJDMatchReport(),
      oaReport: readLatestOAReport(),
      interviewEvaluation: readLatestInterviewReport(),
    });

    storeCoachReport(nextReport);
  }

  function updateGoal(nextGoal: CareerGoalPreference) {
    saveGoalPreference(nextGoal);
  }

  function toggleRoadmapItem(id: string) {
    const nextProgress = {
      ...roadmapProgress,
      [id]: !roadmapProgress[id],
    };

    saveRoadmapProgress(nextProgress);
  }

  useEffect(() => {
    if (isHydrated && report && !readSavedCoachReport()) {
      storeCoachReport(report);
    }
  }, [isHydrated, report]);

  if (!report) {
    return (
      <div className={forge.section}>
        <div className="rounded-[2rem] border border-white/[0.08] bg-white/[0.04] p-10 text-center shadow-[0_0_30px_rgba(0,229,255,0.08)] backdrop-blur-2xl">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-[#00E5FF]/20 bg-[#00E5FF]/10 text-cyan-100">
            <Compass className="h-7 w-7" />
          </div>
          <p className="mt-5 text-sm font-semibold uppercase text-cyan-100">
            AI Career Coach
          </p>
          <h1 className="mt-2 text-2xl font-semibold">Preparing your operating system...</h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
            Reading your latest TalentForge signals from this browser.
          </p>
        </div>
      </div>
    );
  }

  const targetGoal = getTargetGoal(goalPreference);
  const targetCompany = getTargetCompany(targetGoal);
  const categories = buildReadinessCategories(report, sourceState);
  const weakestArea = getWeakestArea(categories);
  const strongestArea = getStrongestArea(categories);
  const roadmap = buildWeeklyRoadmap(report, targetGoal);
  const recommendations = buildRecommendations(report);
  const learningTopics = buildLearningTopics(report);
  const timeline = buildTimeline(report, resume, sourceState);
  const achievements = buildAchievements(report, resume, sourceState);
  const snapshots = readCoachSnapshots();
  const completion = completionPercent(roadmap, roadmapProgress);
  const progress = report.progressTracking;
  const hasAnyLocalReport =
    sourceState.ats || sourceState.jdMatch || sourceState.oa || sourceState.interview;

  return (
    <div className={forge.section}>
      <CareerHero
        goal={targetGoal}
        readiness={report.careerReadinessScore}
        timeline={estimateTimeline(report.careerReadinessScore)}
        nextMilestone={report.strategicRecommendations.nextBestAction.title}
        recommendation={report.strategicRecommendations.nextBestAction.reason}
        recentProgress={formatProgressDelta(progress.readinessDelta)}
        targetCompany={targetCompany}
        onRefresh={generateReport}
        goalControl={
          <GoalSelector value={goalPreference} onChange={updateGoal} />
        }
      />

      <div className="flex flex-wrap gap-2">
        <SourcePill label="Resume" available={Boolean(resume)} />
        <SourcePill label="ATS" available={sourceState.ats} />
        <SourcePill label="JD Match" available={sourceState.jdMatch} />
        <SourcePill label="Interview/OA" available={sourceState.oa || sourceState.interview} />
        <SourcePill label="Version History" available={sourceState.versionCount > 0} />
      </div>

      {!hasAnyLocalReport || report.missingData.length ? (
        <div className="rounded-[1.5rem] border border-amber-300/18 bg-amber-300/8 p-4">
          <p className="text-sm font-semibold text-amber-100">Some career signals are missing</p>
          <p className="mt-1 text-sm leading-6 text-zinc-400">
            {report.missingData.length
              ? report.missingData.join(" · ")
              : "Run more TalentForge modules to sharpen the operating plan."}
          </p>
        </div>
      ) : null}

      <CoachSection
        eyebrow="Readiness Engine"
        title="Where you are right now"
        description="Overall readiness combines resume, ATS, JD match, interview, projects, skills, experience, and version history."
      >
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {categories.map((category) => (
            <ReadinessCard key={category.label} category={category} />
          ))}
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <InsightMetric
            icon={ShieldCheck}
            label="Weakest Area"
            value={weakestArea?.label ?? "Unknown"}
            detail={`${weakestArea?.value ?? 0}% readiness`}
          />
          <InsightMetric
            icon={Trophy}
            label="Strongest Area"
            value={strongestArea?.label ?? "Unknown"}
            detail={`${strongestArea?.value ?? 0}% readiness`}
          />
          <InsightMetric
            icon={Target}
            label="Completion"
            value={`${completion}%`}
            detail="Weekly roadmap progress"
          />
        </div>
      </CoachSection>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
        <CoachSection
          id="weekly-roadmap"
          eyebrow="Weekly AI Roadmap"
          title="How to reach the goal"
          description="A four-week execution plan generated from the weakest signals."
        >
          <div className="grid gap-4 md:grid-cols-2">
            {roadmap.map((week) => (
              <RoadmapCard
                key={week.id}
                week={week}
                checked={roadmapProgress}
                onToggle={toggleRoadmapItem}
              />
            ))}
          </div>
        </CoachSection>

        <CoachSection
          eyebrow="AI Recommendations"
          title="Highest-impact moves"
          description="Prioritized by readiness gain, reason, impact, and difficulty."
        >
          <div className="grid gap-3">
            {recommendations.map((item) => (
              <RecommendationCard key={item.id} item={item} />
            ))}
          </div>
        </CoachSection>
      </section>

      <CoachSection
        eyebrow="Progress Tracking"
        title="Career readiness trend"
        description="Local trend snapshots from the coach, ATS, JD match, interview, and resume signals."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <ProgressChart
            title="Career readiness"
            points={buildProgressPoints(snapshots, "readiness", report.careerReadinessScore)}
          />
          <ProgressChart
            title="ATS trend"
            points={buildProgressPoints(snapshots, "ats", report.scores.atsReadiness.score ?? 0)}
            accent="#34D399"
          />
          <ProgressChart
            title="Interview trend"
            points={buildProgressPoints(
              snapshots,
              "interview",
              report.scores.interviewReadiness.score ?? 0
            )}
            accent="#8B5CF6"
          />
          <ProgressChart
            title="Resume trend"
            points={buildProgressPoints(
              snapshots,
              "resume",
              report.scores.resumeReadiness.score ?? 0
            )}
            accent="#FBBF24"
          />
        </div>
      </CoachSection>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <CoachSection
          eyebrow="Career Timeline"
          title="Milestones unlocked"
          description="A compact path through the TalentForge operating system."
        >
          <div className="space-y-4">
            {timeline.map((event) => (
              <TimelineCard key={event.id} event={event} />
            ))}
          </div>
        </CoachSection>

        <CoachSection
          eyebrow="Learning Recommendations"
          title="What to study next"
          description="Topics are inferred from missing role, skill, and interview evidence."
        >
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {learningTopics.map((topic) => (
              <LearningCard key={topic.title} topic={topic} />
            ))}
          </div>
        </CoachSection>
      </section>

      <CoachSection
        eyebrow="Achievements"
        title="Career milestones"
        description="Badges unlock as TalentForge detects stronger evidence across modules."
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {achievements.map((achievement) => (
            <AchievementBadge key={achievement.id} achievement={achievement} />
          ))}
        </div>
      </CoachSection>

      <CoachSection
        eyebrow="Operating Context"
        title="Where the plan is coming from"
        description="The coach remains deterministic and module-driven. It is not a chatbot."
        action={
          <Button asChild variant="outline" className={forge.secondaryButton}>
            <Link href="/dashboard/resume">Update source data</Link>
          </Button>
        }
      >
        <div className="grid gap-4 md:grid-cols-3">
          <InsightMetric
            icon={Rocket}
            label="Current Goal"
            value={targetGoal}
            detail={`Target: ${targetCompany}`}
          />
          <InsightMetric
            icon={Server}
            label="Next Milestone"
            value={report.nextBestAction.label}
            detail={report.nextBestAction.reason}
          />
          <InsightMetric
            icon={Database}
            label="Data Completeness"
            value={`${report.dataCompleteness}%`}
            detail={`${report.missingData.length} missing source${report.missingData.length === 1 ? "" : "s"}`}
          />
        </div>
      </CoachSection>
    </div>
  );
}

function InsightMetric({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: typeof Compass;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-[1.45rem] border border-white/[0.08] bg-[#070B1F]/58 p-4">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-2xl border border-cyan-300/16 bg-[#00E5FF]/8 text-cyan-100">
          <Icon className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {label}
          </p>
          <p className="mt-1 truncate text-base font-semibold text-white">{value}</p>
        </div>
      </div>
      <p className="mt-3 text-xs leading-5 text-zinc-500">{detail}</p>
    </div>
  );
}
