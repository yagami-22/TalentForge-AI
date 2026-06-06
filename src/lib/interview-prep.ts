import { analyzeATSOptimization } from "@/lib/ats-optimizer";
import { analyzeJobDescriptionMatch } from "@/lib/jd-match-analyzer";
import {
  countTermMatches,
  getTextLines,
  normalizeText,
  uniqueValues,
} from "@/lib/resume-analysis-shared";

export type InterviewMode =
  | "OA"
  | "Technical"
  | "ProjectDeepDive"
  | "BehavioralHR";

export type InterviewModeConfig = {
  title: string;
  description: string;
  iconPlaceholder: string;
  futureExpansionNotes: string[];
};

export type InterviewQuestion = {
  id: string;
  mode: InterviewMode;
  prompt: string;
  focus: string;
  difficulty: "Warm-up" | "Core" | "Deep Dive";
  expectedSignals: string[];
  resumeEvidence: string[];
  jdEvidence: string[];
};

export type InterviewAnswer = {
  questionId: string;
  answer: string;
  answeredAt: string;
};

export type InterviewSession = {
  id: string;
  resumeId: string;
  resumeTitle: string;
  jobDescription: string;
  mode: InterviewMode;
  targetRole: string;
  detectedDomain: string;
  questions: InterviewQuestion[];
  answers: InterviewAnswer[];
  createdAt: string;
  status: "ready" | "in_progress" | "completed";
};

export type InterviewAnswerEvaluation = {
  questionId: string;
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  missedSignals: string[];
};

export type InterviewEvaluation = {
  sessionId: string;
  overallScore: number;
  readiness: "Needs Practice" | "Developing" | "Interview Ready" | "Strong";
  summary: string;
  answerEvaluations: InterviewAnswerEvaluation[];
  topStrengths: string[];
  priorityImprovements: string[];
};

export type InterviewJobDescriptionValidation = {
  isValid: boolean;
  reason: string;
};

type GenerateInterviewSessionInput = {
  resumeId: string;
  resumeTitle: string;
  resumeText: string;
  jobDescription: string;
  mode: InterviewMode;
};

export const INTERVIEW_MODE_CONFIG = {
  OA: {
    title: "OA Assessment",
    description:
      "Coding, aptitude, MCQs, DSA, SQL, and role-specific assessments.",
    iconPlaceholder: "OA",
    futureExpansionNotes: [
      "DSA",
      "SQL",
      "JavaScript",
      "TypeScript",
      "React",
      "Coding challenges",
    ],
  },
  Technical: {
    title: "Technical Interview",
    description:
      "Conceptual and implementation-focused technical questions.",
    iconPlaceholder: "TI",
    futureExpansionNotes: [
      "Frontend",
      "Backend",
      "Full Stack",
      "APIs",
      "Databases",
      "System fundamentals",
    ],
  },
  ProjectDeepDive: {
    title: "Project Deep Dive",
    description:
      "Resume-driven questions about architecture, decisions, challenges, and impact.",
    iconPlaceholder: "PD",
    futureExpansionNotes: [
      "Resume projects",
      "Architecture decisions",
      "Tradeoffs",
      "Scaling",
      "Impact metrics",
    ],
  },
  BehavioralHR: {
    title: "Behavioral / HR",
    description:
      "Communication, teamwork, leadership, conflict resolution, and culture-fit questions.",
    iconPlaceholder: "HR",
    futureExpansionNotes: [
      "STAR answers",
      "Leadership",
      "Teamwork",
      "Conflict handling",
      "Communication",
    ],
  },
} satisfies Record<InterviewMode, InterviewModeConfig>;

export const INTERVIEW_MODE_OPTIONS = Object.entries(INTERVIEW_MODE_CONFIG).map(
  ([value, config]) => ({
    value: value as InterviewMode,
    ...config,
  })
);

const MODE_LABELS: Record<InterviewMode, string> = {
  OA: INTERVIEW_MODE_CONFIG.OA.title,
  Technical: INTERVIEW_MODE_CONFIG.Technical.title,
  ProjectDeepDive: INTERVIEW_MODE_CONFIG.ProjectDeepDive.title,
  BehavioralHR: INTERVIEW_MODE_CONFIG.BehavioralHR.title,
};

const SECTION_HEADING_REGEX =
  /^(?:summary|objective|education|skills|technical skills|projects|personal projects|academic projects|key projects|experience|work experience|professional experience|internships?|certifications?|achievements?|activities|leadership|portfolio)$/i;

const ACTION_TERMS = [
  "built",
  "developed",
  "implemented",
  "designed",
  "integrated",
  "optimized",
  "automated",
  "analyzed",
  "tested",
  "managed",
  "collaborated",
  "led",
  "created",
];

export function validateInterviewJobDescription(
  text: string
): InterviewJobDescriptionValidation {
  const normalized = normalizeText(text);

  if (normalized.length < 50) {
    return {
      isValid: false,
      reason: "Paste a job description of at least 50 characters.",
    };
  }

  return { isValid: true, reason: "Job description accepted." };
}

export function isInterviewMode(value: unknown): value is InterviewMode {
  return (
    value === "OA" ||
    value === "Technical" ||
    value === "ProjectDeepDive" ||
    value === "BehavioralHR"
  );
}

export function getInterviewModeTitle(mode: InterviewMode) {
  return INTERVIEW_MODE_CONFIG[mode].title;
}

function makeSessionId() {
  return `interview_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function cleanLine(line: string) {
  return line.replace(/^[•\-*–]\s*/, "").replace(/\s+/g, " ").trim();
}

function extractSectionLines(text: string, names: RegExp[]) {
  const lines = getTextLines(text);
  let active = false;

  return lines.flatMap((line) => {
    const cleaned = cleanLine(line).replace(/[:|]+$/g, "");

    if (SECTION_HEADING_REGEX.test(cleaned)) {
      active = names.some((name) => name.test(cleaned));
      return [];
    }

    return active ? [cleanLine(line)] : [];
  });
}

function extractProjectNames(text: string) {
  const projectLines = extractSectionLines(text, [
    /projects?/i,
    /personal projects?/i,
    /academic projects?/i,
    /key projects?/i,
  ]);

  return uniqueValues(
    projectLines
      .filter((line) => line.length >= 3 && line.length <= 85)
      .filter((line) => !/[.;]$/.test(line))
      .filter((line) => !countTermMatches(line, ACTION_TERMS).length)
      .filter((line) => !/\b(?:github|live|demo|link|technologies|tools)\b/i.test(line))
      .slice(0, 4)
  );
}

function evidenceLinesFor(text: string, terms: string[], limit = 4) {
  return getTextLines(text)
    .map(cleanLine)
    .filter((line) => countTermMatches(line, terms).length > 0)
    .slice(0, limit);
}

function jdEvidenceLinesFor(text: string, terms: string[], limit = 3) {
  return getTextLines(text)
    .map(cleanLine)
    .filter((line) => countTermMatches(line, terms).length > 0)
    .slice(0, limit);
}

function createQuestion(
  index: number,
  mode: InterviewMode,
  prompt: string,
  focus: string,
  expectedSignals: readonly string[],
  resumeText: string,
  jobDescription: string,
  difficulty: InterviewQuestion["difficulty"] = "Core"
): InterviewQuestion {
  const signals = uniqueValues([...expectedSignals]).slice(0, 6);

  return {
    id: `q${index + 1}`,
    mode,
    prompt,
    focus,
    difficulty,
    expectedSignals: signals,
    resumeEvidence: evidenceLinesFor(resumeText, signals),
    jdEvidence: jdEvidenceLinesFor(jobDescription, signals),
  };
}

function modeQuestions({
  mode,
  targetRole,
  matchedSkills,
  missingSkills,
  projects,
}: {
  mode: InterviewMode;
  targetRole: string;
  matchedSkills: string[];
  missingSkills: string[];
  projects: string[];
}) {
  const primarySkills = matchedSkills.slice(0, 5);
  const firstSkill = primarySkills[0] ?? "the core skill requirements";
  const secondSkill = primarySkills[1] ?? firstSkill;
  const firstGap = missingSkills[0] ?? "one missing or weaker JD requirement";
  const firstProject = projects[0] ?? "your strongest resume project";
  const secondProject = projects[1] ?? "another relevant project";

  if (mode === "OA") {
    return [
      [`Which coding or assessment topics from this JD should you prioritize first?`, "Assessment planning", primarySkills, "Warm-up"],
      [`Explain how you would solve a DSA-style problem related to ${firstSkill}.`, "DSA reasoning", [firstSkill, "algorithms", "dsa"], "Core"],
      [`What SQL or data-querying concepts might be tested for this role?`, "SQL readiness", ["sql", "database", ...primarySkills], "Core"],
      [`How would you approach a timed MCQ section without over-spending time on one question?`, "Test strategy", ["mcq", "aptitude"], "Core"],
      [`Describe one JavaScript or TypeScript concept you should revise for this assessment.`, "Language fundamentals", ["javascript", "typescript", ...primarySkills], "Core"],
      [`If the OA includes role-specific questions, which resume project would help you answer them?`, "Resume mapping", [firstProject, ...primarySkills], "Core"],
      [`What missing JD skill could appear in the OA, and how would you prepare for it?`, "Gap preparation", [firstGap], "Deep Dive"],
      [`Create a revision plan for the next 48 hours before this assessment.`, "Preparation plan", primarySkills, "Deep Dive"],
    ] as const;
  }

  if (mode === "BehavioralHR") {
    return [
      [`Walk me through your background for this ${targetRole} role.`, "Positioning", primarySkills, "Warm-up"],
      [`Why are you interested in this role, and how does your resume support that interest?`, "Motivation", primarySkills, "Warm-up"],
      [`Which project or experience best proves you are ready for this role?`, "Evidence selection", [firstProject, ...primarySkills], "Core"],
      [`Tell me about a skill gap from this JD and how you would close it.`, "Self-awareness", [firstGap], "Core"],
      [`Describe a time you had to learn something quickly for a project.`, "Learning agility", primarySkills, "Core"],
      [`What makes you a strong candidate compared with other applicants?`, "Differentiation", primarySkills, "Core"],
      [`How do you handle feedback when your work needs revision?`, "Coachability", ["feedback", "collaboration"], "Core"],
      [`What would you want to improve in your resume before applying to this role?`, "Reflection", [firstGap], "Deep Dive"],
    ] as const;
  }

  if (mode === "Technical") {
    return [
      [`Explain how you have used ${firstSkill} in your resume-backed work.`, "Skill depth", [firstSkill], "Warm-up"],
      [`How would you approach a technical task in this role that requires ${secondSkill}?`, "JD application", [secondSkill], "Core"],
      [`Describe the architecture or workflow behind ${firstProject}.`, "System thinking", [firstProject, ...primarySkills], "Deep Dive"],
      [`What trade-offs did you make in your implementation work?`, "Trade-offs", primarySkills, "Deep Dive"],
      [`How would you test or validate a solution for this JD?`, "Testing", ["testing", "quality", ...primarySkills], "Core"],
      [`What would you do if a feature works locally but fails after deployment?`, "Debugging", ["debug", "deployment", ...primarySkills], "Core"],
      [`Which missing JD skill would be riskiest for you today, and how would you handle it honestly?`, "Gap handling", [firstGap], "Core"],
      [`Compare two tools or approaches you could use for this role.`, "Technical judgment", primarySkills, "Deep Dive"],
    ] as const;
  }

  if (mode === "ProjectDeepDive") {
    return [
      [`Give a concise deep dive on ${firstProject}: problem, approach, and result.`, "Project narrative", [firstProject, ...primarySkills], "Warm-up"],
      [`What was your exact contribution to ${firstProject}?`, "Ownership", [firstProject], "Core"],
      [`What was technically or analytically complex about ${firstProject}?`, "Complexity", [firstProject, ...primarySkills], "Deep Dive"],
      [`How does ${firstProject} map to this JD's requirements?`, "JD mapping", [firstProject, ...primarySkills], "Core"],
      [`If you rebuilt ${firstProject}, what would you improve first?`, "Iteration", [firstProject], "Deep Dive"],
      [`Explain ${secondProject} to a non-technical stakeholder.`, "Communication", [secondProject], "Core"],
      [`What proof would make your project work more convincing to an interviewer?`, "Proof", ["github", "portfolio", "metrics"], "Core"],
      [`Which project question would be hardest for you, and how would you prepare?`, "Preparation", [firstGap], "Core"],
    ] as const;
  }

  return [
    [`Tell me about a time you handled ambiguity while building or improving something.`, "Ambiguity", primarySkills, "Warm-up"],
    [`A teammate disagrees with your technical approach. What do you do?`, "Collaboration", ["collaboration", ...primarySkills], "Core"],
    [`You are assigned a JD requirement you have limited experience with: ${firstGap}. How do you proceed?`, "Gap handling", [firstGap], "Core"],
    [`Describe a deadline pressure situation and how you prioritized.`, "Prioritization", ["deadline", "prioritize"], "Core"],
    [`A user reports a production issue. Walk through your response.`, "Incident thinking", ["debug", "testing", ...primarySkills], "Deep Dive"],
    [`How would you communicate technical progress to a non-technical stakeholder?`, "Communication", ["stakeholder", "communication"], "Core"],
    [`Tell me about a mistake or limitation in a project and what you learned.`, "Growth", [firstProject], "Core"],
    [`How would you balance speed and quality in this role?`, "Judgment", ["quality", "testing"], "Deep Dive"],
  ] as const;
}

export function generateInterviewSession({
  resumeId,
  resumeTitle,
  resumeText,
  jobDescription,
  mode,
}: GenerateInterviewSessionInput): InterviewSession {
  const jdMatch = analyzeJobDescriptionMatch({
    resumeTitle,
    resumeText,
    jobDescription,
  });
  const atsReport = analyzeATSOptimization({
    resumeTitle,
    resumeText,
    jobDescription,
  });
  const matchedSkills = uniqueValues([
    ...jdMatch.matchedSkills,
    ...jdMatch.matchedKeywords,
    ...atsReport.matchedATSKeywords,
  ]);
  const missingSkills = uniqueValues([
    ...jdMatch.missingSkills,
    ...jdMatch.missingKeywords,
    ...atsReport.missingATSKeywords.map((item) =>
      item.replace(/^(?:Required|Preferred|Tool\/platform):\s*/i, "")
    ),
  ]);
  const projects = extractProjectNames(resumeText);
  const prompts = modeQuestions({
    mode,
    targetRole: jdMatch.targetRole,
    matchedSkills,
    missingSkills,
    projects,
  });
  const questions = prompts.slice(0, 10).map(
    ([prompt, focus, expectedSignals, difficulty], index) =>
      createQuestion(
        index,
        mode,
        prompt,
        focus,
        expectedSignals,
        resumeText,
        jobDescription,
        difficulty
      )
  );

  return {
    id: makeSessionId(),
    resumeId,
    resumeTitle,
    jobDescription,
    mode,
    targetRole: jdMatch.targetRole,
    detectedDomain: jdMatch.detectedDomain,
    questions,
    answers: [],
    createdAt: new Date().toISOString(),
    status: "ready",
  };
}

function wordCount(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function scoreAnswer(answer: string, question: InterviewQuestion) {
  const answerWords = wordCount(answer);
  const matchedSignals = countTermMatches(answer, question.expectedSignals);
  const hasStructure = /\b(?:first|second|because|result|therefore|for example|in my project|i used|i built|i implemented)\b/i.test(
    answer
  );
  const hasEvidence = question.resumeEvidence.some((line) =>
    countTermMatches(answer, line.split(/\s+/).slice(0, 6)).length >= 2
  );
  const base = answerWords >= 80 ? 40 : answerWords >= 45 ? 30 : answerWords >= 20 ? 18 : 8;
  const signalScore = Math.min(35, matchedSignals.length * 8);
  const structureScore = hasStructure ? 15 : 0;
  const evidenceScore = hasEvidence ? 10 : 0;

  return {
    score: Math.max(0, Math.min(100, base + signalScore + structureScore + evidenceScore)),
    matchedSignals,
  };
}

export function evaluateInterviewSession(
  session: InterviewSession,
  answers: InterviewAnswer[]
): InterviewEvaluation {
  const answerEvaluations = session.questions.map((question) => {
    const answer = answers.find((item) => item.questionId === question.id);
    const text = answer?.answer.trim() ?? "";
    const { score, matchedSignals } = scoreAnswer(text, question);
    const missedSignals = question.expectedSignals.filter(
      (signal) => !matchedSignals.includes(signal)
    );
    const strengths = uniqueValues([
      text.length ? "Answer submitted with role-specific context." : "",
      matchedSignals.length ? `Mentioned relevant signal(s): ${matchedSignals.slice(0, 3).join(", ")}.` : "",
      score >= 70 ? "Response is specific enough for interview follow-up." : "",
    ]);
    const improvements = uniqueValues([
      wordCount(text) < 45 ? "Add a clearer situation, action, and result." : "",
      missedSignals[0] ? `Tie the answer to ${missedSignals[0]} if truthful.` : "",
      !question.resumeEvidence.length ? "Add stronger resume-backed evidence before interview day." : "",
    ]);

    return {
      questionId: question.id,
      score,
      feedback:
        score >= 75
          ? "Strong answer. Keep it concise and prepare one follow-up example."
          : score >= 50
            ? "Usable answer, but it needs sharper evidence and a clearer result."
            : "This answer needs more structure, resume evidence, and JD-specific detail.",
      strengths,
      improvements,
      missedSignals,
    };
  });
  const overallScore = Math.round(
    answerEvaluations.reduce((total, item) => total + item.score, 0) /
      Math.max(1, answerEvaluations.length)
  );
  const readiness =
    overallScore >= 82
      ? "Strong"
      : overallScore >= 68
        ? "Interview Ready"
        : overallScore >= 50
          ? "Developing"
          : "Needs Practice";

  return {
    sessionId: session.id,
    overallScore,
    readiness,
    summary: `${MODE_LABELS[session.mode]} practice for ${session.targetRole} is ${readiness.toLowerCase()} at ${overallScore}/100. Scores are based on answer completeness, JD signal coverage, structure, and resume-backed evidence.`,
    answerEvaluations,
    topStrengths: uniqueValues(answerEvaluations.flatMap((item) => item.strengths)).slice(0, 5),
    priorityImprovements: uniqueValues(
      answerEvaluations.flatMap((item) => item.improvements)
    ).slice(0, 6),
  };
}
