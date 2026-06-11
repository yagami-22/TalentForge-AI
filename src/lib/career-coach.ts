import type { ATSOptimizationAnalysis } from "@/lib/ats-optimizer";
import type { InterviewEvaluation } from "@/lib/interview-prep";
import type { JobDescriptionMatchAnalysis } from "@/lib/jd-match-analyzer";
import type { OAReport } from "@/lib/oa-evaluation";
import type { ResumeDiagnostics } from "@/lib/resume-analyzer";

export type CareerCoachResumeSnapshot = {
  id: string;
  title: string;
  uploadedAt: string;
  updatedAt: string;
  atsScore: number | null;
  matchScore: number | null;
  analysis: ResumeDiagnostics | null;
  issues: string[];
  suggestions: string[];
};

export type CareerCoachInput = {
  resume: CareerCoachResumeSnapshot | null;
  atsAnalysis: ATSOptimizationAnalysis | null;
  jdMatchAnalysis: JobDescriptionMatchAnalysis | null;
  oaReport: OAReport | null;
  interviewEvaluation: InterviewEvaluation | null;
};

export type CareerCoachScoreCard = {
  name: string;
  score: number | null;
  status: "Missing" | "Needs Work" | "Developing" | "Strong" | "Excellent";
  reason: string;
};

export type CareerCoachRoadmapItem = {
  title: string;
  priority: "High" | "Medium" | "Low";
  source: string;
  action: string;
};

export type CareerCoachTimelineItem = {
  label: string;
  title: string;
  tasks: string[];
};

export type CareerCoachGap = {
  gapName: string;
  currentState: string;
  expectedState: string;
  impact: "High" | "Medium" | "Low";
  estimatedTimeToClose: string;
};

export type CareerCoachImpactRecommendation = {
  title: string;
  priority: "High Impact" | "Medium Impact" | "Low Impact";
  module: string;
  reason: string;
  expectedGain: number;
  action: string;
};

export type CareerCoachStrategicRecommendation = {
  id: string;
  title: string;
  priority: "High" | "Medium" | "Low";
  expectedReadinessGain: number;
  reason: string;
  evidence: string[];
  actions: string[];
  sourceModules: string[];
  lowestContributorScore: number;
};

export type CareerCoachRecruiterSimulation = {
  impressionScore: number;
  likelyOutcome:
    | "Reject"
    | "Borderline"
    | "Interview"
    | "Strong Interview"
    | "Fast Track";
  strengthsRecruitersNotice: string[];
  risksRecruitersNotice: string[];
};

export type CareerCoachSkillMaturity = {
  skill: string;
  maturity: "Beginner" | "Intermediate" | "Advanced" | "Senior Ready";
  evidence: string;
};

export type CareerCoachInterviewRootCause = {
  category: string;
  rootCause: string;
  evidence: string;
  fix: string;
};

export type CareerCoachTargetRoleMetric = {
  name: string;
  currentMatch: number;
  reason: string;
};

export type CareerCoachFormula = {
  overallReadiness: number;
  resumeContribution: number;
  atsContribution: number;
  jdContribution: number;
  interviewContribution: number;
  skillGapContribution: number;
};

export type CareerCoachProgressTracking = {
  previousReadiness: number | null;
  currentReadiness: number;
  readinessDelta: number | null;
  atsDelta: number | null;
  interviewDelta: number | null;
  jdMatchDelta: number | null;
  resumeDelta: number | null;
};

export type CareerCoachReport = {
  generatedAt: string;
  careerReadinessScore: number;
  readinessLabel: "Low" | "Moderate" | "Good" | "High";
  targetRole: string;
  detectedSeniority: string;
  targetRoleFit: string;
  dataCompleteness: number;
  missingData: string[];
  scores: {
    resumeReadiness: CareerCoachScoreCard;
    atsReadiness: CareerCoachScoreCard;
    jobMatchReadiness: CareerCoachScoreCard;
    interviewReadiness: CareerCoachScoreCard;
    overallCareerReadiness: CareerCoachScoreCard;
  };
  strongestAreas: string[];
  weakestAreas: string[];
  skillGapRoadmap: CareerCoachRoadmapItem[];
  resumeImprovementPlan: CareerCoachRoadmapItem[];
  interviewPracticePlan: CareerCoachRoadmapItem[];
  sevenDayActionPlan: CareerCoachTimelineItem[];
  thirtyDayRoadmap: CareerCoachTimelineItem[];
  recommendedNextSteps: string[];
  strategicRecommendations: {
    nextBestAction: CareerCoachStrategicRecommendation;
    recommendations: CareerCoachStrategicRecommendation[];
  };
  careerGapAnalysis: {
    currentRoleLevel: string;
    targetRoleLevel: string;
    targetCompanyTier: string;
    readiness: number;
    gaps: CareerCoachGap[];
  };
  impactRanking: {
    highImpact: CareerCoachImpactRecommendation[];
    mediumImpact: CareerCoachImpactRecommendation[];
    lowImpact: CareerCoachImpactRecommendation[];
    topThreeActions: CareerCoachImpactRecommendation[];
  };
  recruiterSimulation: CareerCoachRecruiterSimulation;
  skillMaturity: CareerCoachSkillMaturity[];
  interviewRootCauseAnalysis: CareerCoachInterviewRootCause[];
  targetRoleComparison: CareerCoachTargetRoleMetric[];
  readinessFormula: CareerCoachFormula;
  progressTracking: CareerCoachProgressTracking;
  nextBestAction: {
    label: string;
    href: string;
    reason: string;
    expectedGain: number;
  };
};

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function normalizeText(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.trim().toLowerCase();
}

function safeText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function safeStringArray(items: unknown): string[] {
  return Array.isArray(items)
    ? items
        .map((item) => safeText(item))
        .filter((item): item is string => item.length > 0)
    : [];
}

function displayText(value: unknown, fallback: string) {
  const text = safeText(value);
  return text || fallback;
}

function uniqueValues(values: unknown[], limit = 12) {
  return Array.from(
    new Set(values.map((value) => safeText(value)).filter(Boolean))
  ).slice(0, limit);
}

function scoreStatus(score: number | null): CareerCoachScoreCard["status"] {
  if (score === null) return "Missing";
  if (score >= 90) return "Excellent";
  if (score >= 75) return "Strong";
  if (score >= 55) return "Developing";
  return "Needs Work";
}

function readinessLabel(score: number): CareerCoachReport["readinessLabel"] {
  if (score >= 85) return "High";
  if (score >= 70) return "Good";
  if (score >= 55) return "Moderate";
  return "Low";
}

function scoreCard(name: string, score: number | null, reason: string): CareerCoachScoreCard {
  return {
    name,
    score,
    status: scoreStatus(score),
    reason,
  };
}

function getResumeAnalysis(input: CareerCoachInput) {
  return input.resume?.analysis ?? null;
}

function getResumeScore(input: CareerCoachInput) {
  const analysis = getResumeAnalysis(input);

  if (typeof analysis?.overallScore === "number") {
    return clampScore(analysis.overallScore);
  }

  if (typeof input.resume?.atsScore === "number") {
    return clampScore(input.resume.atsScore);
  }

  return null;
}

function getInterviewScore(input: CareerCoachInput) {
  if (typeof input.oaReport?.readinessScore === "number") {
    return clampScore(input.oaReport.readinessScore);
  }

  if (typeof input.oaReport?.overallScore === "number") {
    return clampScore(input.oaReport.overallScore);
  }

  if (typeof input.interviewEvaluation?.overallScore === "number") {
    return clampScore(input.interviewEvaluation.overallScore);
  }

  return null;
}

function weightedCareerFormula(scores: {
  resume: number | null;
  ats: number | null;
  jobMatch: number | null;
  interview: number | null;
  skillGap: number;
}) {
  const resumeContribution = ((scores.resume ?? 0) * 25) / 100;
  const atsContribution = ((scores.ats ?? 0) * 20) / 100;
  const jdContribution = ((scores.jobMatch ?? 0) * 20) / 100;
  const interviewContribution = ((scores.interview ?? 0) * 25) / 100;
  const skillGapContribution = (scores.skillGap * 10) / 100;

  return {
    overallReadiness: clampScore(
      resumeContribution +
        atsContribution +
        jdContribution +
        interviewContribution +
        skillGapContribution
    ),
    resumeContribution: clampScore(resumeContribution),
    atsContribution: clampScore(atsContribution),
    jdContribution: clampScore(jdContribution),
    interviewContribution: clampScore(interviewContribution),
    skillGapContribution: clampScore(skillGapContribution),
  };
}

function buildMissingData(input: CareerCoachInput) {
  return uniqueValues([
    input.resume ? "" : "No resume analysis found",
    input.atsAnalysis ? "" : "No ATS optimizer report found",
    input.jdMatchAnalysis ? "" : "No JD match report found",
    input.oaReport || input.interviewEvaluation
      ? ""
      : "No interview or OA evaluation report found",
  ]);
}

function lowResumeCategories(analysis: ResumeDiagnostics | null) {
  return (
    (Array.isArray(analysis?.categoryScores) ? analysis.categoryScores : [])
      .filter((category) => category.maxScore > 0)
      .filter((category) => category.score / category.maxScore < 0.62)
      .map((category) => `${category.name}: ${category.score}/${category.maxScore}`) ?? []
  );
}

function strongestResumeCategories(analysis: ResumeDiagnostics | null) {
  return (
    (Array.isArray(analysis?.categoryScores) ? analysis.categoryScores : [])
      .filter((category) => category.maxScore > 0)
      .filter((category) => category.score / category.maxScore >= 0.75)
      .map((category) => `${category.name}: ${category.score}/${category.maxScore}`) ?? []
  );
}

function roadmapItemsFromValues(
  values: unknown[],
  source: string,
  actionPrefix: string
): CareerCoachRoadmapItem[] {
  const counts = new Map<string, number>();

  safeStringArray(values).forEach((value) => {
    const cleaned = value.replace(/^Missing\s+/i, "").trim();
    if (!cleaned) return;
    counts.set(cleaned, (counts.get(cleaned) ?? 0) + 1);
  });

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([title, count]) => ({
      title,
      priority: count >= 2 ? "High" : "Medium",
      source,
      action: `${actionPrefix} ${title}.`,
    }));
}

function buildSkillGaps(input: CareerCoachInput): CareerCoachRoadmapItem[] {
  const atsMissing = safeStringArray(input.atsAnalysis?.missingATSKeywords);
  const jdMissing = [
    ...safeStringArray(input.jdMatchAnalysis?.missingSkills),
    ...safeStringArray(input.jdMatchAnalysis?.missingKeywords),
  ];
  const interviewMissing =
    Array.isArray(input.oaReport?.questionEvaluations)
      ? input.oaReport.questionEvaluations.flatMap((item) =>
          safeStringArray(item?.missingConcepts)
        )
      : [];

  return [
    ...roadmapItemsFromValues(
      jdMissing,
      "JD Match",
      "Build truthful resume evidence or focused practice around"
    ),
    ...roadmapItemsFromValues(
      atsMissing,
      "ATS",
      "Add this keyword only if you can support it with real project or work evidence:"
    ),
    ...roadmapItemsFromValues(
      interviewMissing,
      "Interview",
      "Practice explaining"
    ),
  ].slice(0, 10);
}

function buildResumePlan(input: CareerCoachInput): CareerCoachRoadmapItem[] {
  const analysis = getResumeAnalysis(input);
  const issues = uniqueValues([
    ...safeStringArray(analysis?.topIssues),
    ...safeStringArray(analysis?.redFlags),
    ...safeStringArray(input.resume?.issues),
    ...lowResumeCategories(analysis),
    ...(Array.isArray(input.atsAnalysis?.atsWarnings)
      ? input.atsAnalysis.atsWarnings.map((warning) => safeText(warning?.fix))
      : []),
    ...safeStringArray(input.atsAnalysis?.quickWins),
  ], 10);

  return issues.map((issue, index) => ({
    title: issue,
    priority: index < 3 ? "High" : "Medium",
    source: "Resume Intelligence",
    action: "Update the resume with direct, evidence-backed wording.",
  }));
}

function buildInterviewPlan(input: CareerCoachInput): CareerCoachRoadmapItem[] {
  const oaWeaknesses = [
    ...safeStringArray(input.oaReport?.weakestAreas),
    ...safeStringArray(input.oaReport?.recommendedPractice),
  ];
  const interviewWeaknesses = [
    ...safeStringArray(input.interviewEvaluation?.priorityImprovements),
  ];

  return uniqueValues([...oaWeaknesses, ...interviewWeaknesses], 8).map(
    (item, index) => ({
      title: item,
      priority: index < 3 ? "High" : "Medium",
      source: input.oaReport ? "OA Assessment" : "Interview Practice",
      action:
        "Practice a concise answer with approach, implementation detail, tradeoffs, and validation.",
    })
  );
}

function scoreFromCategory(
  analysis: ResumeDiagnostics | null,
  pattern: RegExp
) {
  const category = (Array.isArray(analysis?.categoryScores)
    ? analysis.categoryScores
    : []
  ).find((item) => pattern.test(item.name));

  if (!category || category.maxScore <= 0) {
    return null;
  }

  return clampScore((category.score / category.maxScore) * 100);
}

function scoreFromOACategory(report: OAReport | null, pattern: RegExp) {
  const category = (Array.isArray(report?.categoryBreakdown)
    ? report.categoryBreakdown
    : []
  ).find((item) => pattern.test(item.name));

  return typeof category?.percentage === "number"
    ? clampScore(category.percentage)
    : null;
}

function scoreLevel(score: number | null) {
  if (score === null) return "Unknown";
  if (score >= 78) return "Advanced";
  if (score >= 58) return "Intermediate";
  return "Basic";
}

function timeToClose(impact: CareerCoachGap["impact"], currentState: string) {
  if (currentState === "Unknown") return "Run the missing assessment first";
  if (impact === "High") return "4-6 weeks";
  if (impact === "Medium") return "2-4 weeks";
  return "1-2 weeks";
}

function gap(
  gapName: string,
  score: number | null,
  expectedState: string,
  impact: CareerCoachGap["impact"]
): CareerCoachGap {
  const currentState = scoreLevel(score);

  return {
    gapName,
    currentState,
    expectedState,
    impact,
    estimatedTimeToClose: timeToClose(impact, currentState),
  };
}

function skillGapScore(input: CareerCoachInput) {
  const missingCount =
    safeStringArray(input.atsAnalysis?.missingATSKeywords).length +
    safeStringArray(input.jdMatchAnalysis?.missingSkills).length +
    safeStringArray(input.jdMatchAnalysis?.missingKeywords).length +
    (Array.isArray(input.oaReport?.questionEvaluations)
      ? input.oaReport.questionEvaluations.reduce(
          (sum, item) => sum + safeStringArray(item?.missingConcepts).length,
          0
        )
      : 0);

  return clampScore(100 - Math.min(70, missingCount * 5));
}

function buildCareerGapAnalysis(
  input: CareerCoachInput,
  scores: {
    resume: number | null;
    ats: number | null;
    jd: number | null;
    interview: number | null;
  },
  targetRole: string,
  detectedSeniority: string,
  readiness: number
): CareerCoachReport["careerGapAnalysis"] {
  const analysis = getResumeAnalysis(input);
  const technicalSkillScore = Math.max(
    scoreFromCategory(analysis, /skills|keyword/i) ?? 0,
    input.atsAnalysis?.keywordCoverage ?? 0,
    scores.jd ?? 0
  );
  const projectsScore = scoreFromCategory(analysis, /project|portfolio/i);
  const evidenceScore = Math.max(
    scoreFromCategory(analysis, /impact|achievement|bullet/i) ?? 0,
    scores.resume ?? 0
  );
  const architectureScore = Math.max(
    scoreFromOACategory(input.oaReport, /technical depth|relevance/i) ?? 0,
    safeStringArray(input.oaReport?.strongestAreas).some((item) =>
      /architecture|system design/i.test(item)
    )
      ? 78
      : 0
  );
  const communicationScore = scoreFromOACategory(input.oaReport, /communication/i);

  return {
    currentRoleLevel: detectedSeniority === "Unknown" ? "Profile in progress" : detectedSeniority,
    targetRoleLevel: targetRole,
    targetCompanyTier:
      scores.jd !== null || scores.ats !== null
        ? "Product Company"
        : "Target company not selected",
    readiness,
    gaps: [
      gap("Technical Skills", technicalSkillScore || null, "Advanced", "High"),
      gap("Projects", projectsScore, "Advanced project proof", "High"),
      gap("Resume Evidence", evidenceScore || null, "Metric-backed evidence", "High"),
      gap("ATS Alignment", scores.ats, "80+ ATS readiness", "Medium"),
      gap("Interview Performance", scores.interview, "Strong interview readiness", "High"),
      gap("Leadership Signals", scoreFromCategory(analysis, /experience|practical/i), "Ownership and collaboration evidence", "Medium"),
      gap("Architecture Knowledge", architectureScore || null, "Advanced architecture tradeoffs", "High"),
      gap("System Design", architectureScore || null, "Scalable design reasoning", "Medium"),
      gap("Communication", communicationScore, "Structured, concise answers", "Medium"),
    ],
  };
}

function expectedGainForSource(
  title: string,
  source: string,
  priority: CareerCoachRoadmapItem["priority"]
) {
  const normalized = normalizeText(`${title} ${source}`);

  if (/resume evidence|impact|achievement|bullet|top issues|red flags/.test(normalized)) {
    return 8;
  }

  if (/oa|interview|accuracy|technical depth|communication/.test(normalized)) {
    return 6;
  }

  if (/jd match|required|missing skill|ats/.test(normalized)) {
    return 5;
  }

  if (/portfolio|link|github|leetcode/.test(normalized)) {
    return 3;
  }

  return priority === "High" ? 5 : priority === "Medium" ? 3 : 2;
}

function buildImpactRanking(
  items: CareerCoachRoadmapItem[]
): CareerCoachReport["impactRanking"] {
  const recommendations = items
    .map((item) => {
      const expectedGain = expectedGainForSource(
        item.title,
        item.source,
        item.priority
      );

      return {
        title: item.title,
        priority:
          expectedGain >= 6
            ? "High Impact"
            : expectedGain >= 4
              ? "Medium Impact"
              : "Low Impact",
        module: item.source,
        reason: item.action,
        expectedGain,
        action: item.action,
      } satisfies CareerCoachImpactRecommendation;
    })
    .sort((a, b) => b.expectedGain - a.expectedGain);

  return {
    highImpact: recommendations.filter((item) => item.priority === "High Impact"),
    mediumImpact: recommendations.filter((item) => item.priority === "Medium Impact"),
    lowImpact: recommendations.filter((item) => item.priority === "Low Impact"),
    topThreeActions: recommendations.slice(0, 3),
  };
}

function priorityFromGain(
  gain: number
): CareerCoachStrategicRecommendation["priority"] {
  if (gain >= 9) return "High";
  if (gain >= 5) return "Medium";
  return "Low";
}

function recommendation(
  input: Omit<CareerCoachStrategicRecommendation, "priority">
): CareerCoachStrategicRecommendation {
  return {
    ...input,
    priority: priorityFromGain(input.expectedReadinessGain),
    evidence: uniqueValues(input.evidence, 8),
    actions: uniqueValues(input.actions, 5),
    sourceModules: uniqueValues(input.sourceModules, 5),
  };
}

function lowOACategories(report: OAReport | null) {
  return (Array.isArray(report?.categoryBreakdown)
    ? report.categoryBreakdown
    : []
  )
    .filter((category) => category.percentage < 70)
    .map((category) => `${category.name}: ${category.percentage}%`);
}

function missingInterviewConcepts(report: OAReport | null) {
  return Array.isArray(report?.questionEvaluations)
    ? report.questionEvaluations.flatMap((item) =>
        safeStringArray(item?.missingConcepts)
      )
    : [];
}

function rawResumeFindings(input: CareerCoachInput) {
  const analysis = getResumeAnalysis(input);

  return uniqueValues(
    [
      ...safeStringArray(analysis?.topIssues),
      ...safeStringArray(analysis?.redFlags),
      ...safeStringArray(input.resume?.issues),
      ...safeStringArray(input.resume?.suggestions),
      ...lowResumeCategories(analysis),
      ...(Array.isArray(input.atsAnalysis?.atsWarnings)
        ? input.atsAnalysis.atsWarnings.map((warning) => warning?.fix)
        : []),
    ],
    40
  );
}

function matchesAny(value: string, patterns: RegExp[]) {
  const normalized = normalizeText(value);
  return patterns.some((pattern) => pattern.test(normalized));
}

function filteredEvidence(values: string[], patterns: RegExp[]) {
  return values.filter((value) => matchesAny(value, patterns));
}

export function generateStrategicRecommendations(input: {
  coachInput: CareerCoachInput;
  currentReadinessScore: number;
  scores: {
    resume: number | null;
    ats: number | null;
    jdMatch: number | null;
    interview: number | null;
  };
}): CareerCoachReport["strategicRecommendations"] {
  const rawResume = rawResumeFindings(input.coachInput);
  const lowOA = lowOACategories(input.coachInput.oaReport);
  const missingConcepts = missingInterviewConcepts(input.coachInput.oaReport);
  const interviewImprovements = safeStringArray(
    input.coachInput.interviewEvaluation?.priorityImprovements
  );
  const atsMissing = safeStringArray(input.coachInput.atsAnalysis?.missingATSKeywords);
  const jdMissing = [
    ...safeStringArray(input.coachInput.jdMatchAnalysis?.missingSkills),
    ...safeStringArray(input.coachInput.jdMatchAnalysis?.missingKeywords),
    ...safeStringArray(input.coachInput.jdMatchAnalysis?.missingResponsibilities),
  ];
  const keywordCoverage = input.coachInput.atsAnalysis?.keywordCoverage;
  const profileBasics = filteredEvidence(rawResume, [
    /location|contact|email|phone|linkedin|github|portfolio|professional links?/,
    /graduation|timeline|cgpa|percentage|class 10|class 12|education/,
  ]);
  const resumeEvidence = filteredEvidence(rawResume, [
    /bullet|achievement|impact|metric|measurable|project proof|proof|portfolio|github|link|weak project|red flag/,
  ]);
  const seniorSignals = uniqueValues(
    [
      ...filteredEvidence(rawResume, [
        /architecture|leadership|mentor|ownership|system design|production|scalable|senior/,
      ]),
      ...missingConcepts.filter((item) =>
        /architecture|system design|leadership|ownership|performance|production|tradeoff|failure/.test(
          normalizeText(item)
        )
      ),
    ],
    12
  );
  const recommendations = [
    recommendation({
      id: "improve-interview-performance",
      title: "Improve Interview Performance",
      expectedReadinessGain:
        input.scores.interview === null
          ? 6
          : input.scores.interview < 50
            ? 12
            : input.scores.interview < 70
              ? 9
              : 4,
      lowestContributorScore: input.scores.interview ?? 0,
      reason:
        input.scores.interview === null
          ? "Interview readiness is missing, so the coach cannot judge execution quality yet."
          : "Interview readiness is held back by low OA/interview categories and missing concepts.",
      evidence: [
        ...lowOA,
        ...missingConcepts.slice(0, 6).map((item) => `Missing concept: ${item}`),
        ...interviewImprovements.slice(0, 4),
      ],
      actions: [
        "Retry the latest OA session under a timer.",
        "Use structured answers: context, approach, tradeoffs, failure handling, validation.",
        "Add edge cases and constraints to every technical answer.",
        "Summarize the final solution in 2-3 lines.",
        "Review missing concepts before retrying.",
      ],
      sourceModules: ["OA Assessment", "Interview"],
    }),
    recommendation({
      id: "strengthen-resume-evidence",
      title: "Strengthen Resume Evidence",
      expectedReadinessGain:
        input.scores.resume === null
          ? 8
          : input.scores.resume < 55
            ? 10
            : input.scores.resume < 75
              ? 7
              : 3,
      lowestContributorScore: input.scores.resume ?? 0,
      reason:
        "Recruiters need clear proof of impact, project depth, and professional credibility before shortlisting.",
      evidence: resumeEvidence.length ? resumeEvidence : rawResume.slice(0, 6),
      actions: [
        "Rewrite weak bullets to show what you built, how you built it, and the result.",
        "Add measurable outcomes only when the resume truly supports them.",
        "Add project proof links such as GitHub, live demo, portfolio, or case study.",
        "Highlight the most relevant project evidence for the target role.",
      ],
      sourceModules: ["Resume Intelligence"],
    }),
    recommendation({
      id: "improve-ats-jd-alignment",
      title: "Improve ATS / JD Alignment",
      expectedReadinessGain:
        Math.min(input.scores.ats ?? 100, input.scores.jdMatch ?? 100) < 55
          ? 9
          : Math.min(input.scores.ats ?? 100, input.scores.jdMatch ?? 100) < 75
            ? 6
            : 3,
      lowestContributorScore: Math.min(input.scores.ats ?? 100, input.scores.jdMatch ?? 100),
      reason:
        "ATS and JD match scores improve when role-specific skills and required tools are backed by resume evidence.",
      evidence: uniqueValues(
        [
          typeof keywordCoverage === "number" ? `Keyword coverage: ${keywordCoverage}%` : "",
          ...atsMissing.slice(0, 6).map((item) => `ATS missing: ${item}`),
          ...jdMissing.slice(0, 6).map((item) => `JD missing: ${item}`),
        ],
        10
      ),
      actions: [
        "Add only truthful missing keywords that are supported by projects or work.",
        "Mirror important JD terminology in relevant project and skills bullets.",
        "Prioritize required tools before nice-to-have keywords.",
        "Re-run ATS and JD Match after each resume update.",
      ],
      sourceModules: ["ATS", "JD Match"],
    }),
    recommendation({
      id: "complete-profile-basics",
      title: "Complete Profile Basics",
      expectedReadinessGain: profileBasics.length >= 4 ? 5 : profileBasics.length ? 3 : 1,
      lowestContributorScore: input.scores.resume ?? 0,
      reason:
        "Basic profile gaps create avoidable screening friction even when project quality is strong.",
      evidence: profileBasics,
      actions: [
        "Add missing contact or professional profile links where available.",
        "Complete education timeline and academic details if relevant.",
        "Keep profile basics concise and easy for ATS parsing.",
      ],
      sourceModules: ["Resume Intelligence"],
    }),
    recommendation({
      id: "build-senior-level-signals",
      title: "Build Senior-Level Signals",
      expectedReadinessGain: seniorSignals.length >= 3 ? 8 : seniorSignals.length ? 6 : 3,
      lowestContributorScore: Math.min(input.scores.resume ?? 100, input.scores.interview ?? 100),
      reason:
        "Higher-level roles require evidence of architecture decisions, ownership, tradeoffs, and production impact.",
      evidence: seniorSignals,
      actions: [
        "Add architecture decisions and tradeoffs to flagship project bullets.",
        "Prepare one project deep-dive story covering failure handling and scaling.",
        "Show ownership, collaboration, or leadership where truthful.",
        "Practice system-design-style explanations for your strongest project.",
      ],
      sourceModules: ["Resume Intelligence", "OA Assessment", "Interview"],
    }),
  ].filter(
    (item) =>
      item.id === "improve-interview-performance" ||
      item.id === "strengthen-resume-evidence" ||
      item.evidence.length > 0 ||
      item.expectedReadinessGain >= 4
  );
  const priorityRank = { High: 0, Medium: 1, Low: 2 };
  const sorted = recommendations.sort(
    (a, b) =>
      priorityRank[a.priority] - priorityRank[b.priority] ||
      b.expectedReadinessGain - a.expectedReadinessGain ||
      a.lowestContributorScore - b.lowestContributorScore
  );
  const starterActions =
    sorted.length > 0
      ? sorted
      : [
          recommendation({
            id: "unlock-personalized-strategy",
            title: "Unlock Personalized Strategy",
            expectedReadinessGain: 10,
            lowestContributorScore: 0,
            reason:
              "Run Resume Intelligence, ATS, JD Match, and OA Assessment to unlock a personalized strategy.",
            evidence: ["Very little assessment data is available."],
            actions: [
              "Upload a resume.",
              "Run ATS analysis.",
              "Complete one OA session.",
            ],
            sourceModules: ["Career Coach"],
          }),
        ];

  return {
    nextBestAction: starterActions[0],
    recommendations: starterActions,
  };
}

function recruiterOutcome(score: number): CareerCoachRecruiterSimulation["likelyOutcome"] {
  if (score >= 88) return "Fast Track";
  if (score >= 78) return "Strong Interview";
  if (score >= 65) return "Interview";
  if (score >= 50) return "Borderline";
  return "Reject";
}

function buildRecruiterSimulation(
  readiness: number,
  strongestAreas: string[],
  weakestAreas: string[]
): CareerCoachRecruiterSimulation {
  const impressionScore = Math.max(1, Math.min(10, Number((readiness / 10).toFixed(1))));

  return {
    impressionScore,
    likelyOutcome: recruiterOutcome(readiness),
    strengthsRecruitersNotice: uniqueValues(
      [
        ...strongestAreas,
        readiness >= 70 ? "Clear alignment with target role signals." : "",
      ],
      6
    ),
    risksRecruitersNotice: uniqueValues(
      [
        ...weakestAreas,
        readiness < 70 ? "Recruiter may need stronger proof before shortlisting." : "",
      ],
      6
    ),
  };
}

function buildSkillMaturity(input: CareerCoachInput): CareerCoachSkillMaturity[] {
  const matchedSignals = uniqueValues([
    ...safeStringArray(input.atsAnalysis?.matchedATSKeywords),
    ...safeStringArray(input.jdMatchAnalysis?.matchedSkills),
    ...safeStringArray(input.jdMatchAnalysis?.matchedKeywords),
    ...safeStringArray(input.oaReport?.strongestAreas),
  ], 80).map(normalizeText);
  const missingSignals = uniqueValues([
    ...safeStringArray(input.atsAnalysis?.missingATSKeywords),
    ...safeStringArray(input.jdMatchAnalysis?.missingSkills),
    ...safeStringArray(input.jdMatchAnalysis?.missingKeywords),
    ...safeStringArray(input.oaReport?.weakestAreas),
  ], 80).map(normalizeText);
  const skills = [
    "React",
    "TypeScript",
    "JavaScript",
    "Next.js",
    "REST APIs",
    "System Design",
    "Testing",
    "Performance",
    "SQL",
  ];

  return skills.map((skill) => {
    const normalizedSkill = normalizeText(skill);
    const matched = matchedSignals.some((item) => item.includes(normalizedSkill));
    const missing = missingSignals.some((item) => item.includes(normalizedSkill));
    const maturity: CareerCoachSkillMaturity["maturity"] = matched && !missing
      ? "Advanced"
      : matched && missing
        ? "Intermediate"
        : missing
          ? "Beginner"
          : "Intermediate";

    return {
      skill,
      maturity:
        maturity === "Advanced" &&
        (input.jdMatchAnalysis?.matchScore ?? 0) >= 82 &&
        (input.oaReport?.readinessScore ?? 0) >= 82
          ? "Senior Ready"
          : maturity,
      evidence: matched
        ? "Detected in matched ATS/JD/interview signals."
        : missing
          ? "Detected as a missing or weak signal."
          : "Limited evidence; validate with projects or interview answers.",
    };
  });
}

function buildInterviewRootCauseAnalysis(
  input: CareerCoachInput
): CareerCoachInterviewRootCause[] {
  const categoryItems = Array.isArray(input.oaReport?.categoryBreakdown)
    ? input.oaReport.categoryBreakdown
    : [];
  const causes = categoryItems
    .filter((item) => item.percentage < 70)
    .map((item) => {
      const normalized = normalizeText(item.name);
      const rootCause = /accuracy/.test(normalized)
        ? "Missed validation, edge cases, or expected answer points."
        : /communication/.test(normalized)
          ? "Answer structure is inconsistent or hard to summarize."
          : /technical depth/.test(normalized)
            ? "Implementation was discussed, but tradeoffs and failure cases were thin."
            : /completeness/.test(normalized)
              ? "Answer did not cover enough of the expected scope."
              : "Answer needs tighter alignment with the question signals.";

      return {
        category: item.name,
        rootCause,
        evidence: `${item.percentage}% in ${item.name}.`,
        fix: "Practice with approach, implementation detail, tradeoffs, edge cases, and validation.",
      };
    });
  const interviewItems = safeStringArray(
    input.interviewEvaluation?.priorityImprovements
  ).map((item) => ({
    category: "Interview Practice",
    rootCause: item,
    evidence: "Detected in latest interview evaluation.",
    fix: "Rewrite the answer using STAR plus technical evidence.",
  }));

  return [...causes, ...interviewItems].slice(0, 6);
}

function buildTargetRoleComparison(
  input: CareerCoachInput,
  gapAnalysis: CareerCoachReport["careerGapAnalysis"]
): CareerCoachTargetRoleMetric[] {
  const maturity = buildSkillMaturity(input);
  const maturityScore = (skill: string) => {
    const item = maturity.find((entry) => entry.skill === skill);
    if (!item) return 45;
    if (item.maturity === "Senior Ready") return 92;
    if (item.maturity === "Advanced") return 82;
    if (item.maturity === "Intermediate") return 62;
    return 35;
  };
  const gapScore = (name: string) =>
    gapAnalysis.gaps.find((gapItem) => gapItem.gapName === name)
      ?.currentState === "Advanced"
      ? 82
      : gapAnalysis.gaps.find((gapItem) => gapItem.gapName === name)
          ?.currentState === "Intermediate"
        ? 62
        : 42;

  return [
    {
      name: "React",
      currentMatch: maturityScore("React"),
      reason: "Based on matched and missing JD/ATS signals.",
    },
    {
      name: "TypeScript",
      currentMatch: maturityScore("TypeScript"),
      reason: "Based on matched and missing JD/ATS signals.",
    },
    {
      name: "Architecture",
      currentMatch: gapScore("Architecture Knowledge"),
      reason: "Based on project evidence and interview technical depth.",
    },
    {
      name: "Testing",
      currentMatch: maturityScore("Testing"),
      reason: "Based on resume keywords and interview evidence.",
    },
    {
      name: "Leadership",
      currentMatch: gapScore("Leadership Signals"),
      reason: "Based on practical work, ownership, and collaboration evidence.",
    },
  ];
}

function buildSevenDayPlan(
  skillGaps: CareerCoachRoadmapItem[],
  resumePlan: CareerCoachRoadmapItem[],
  interviewPlan: CareerCoachRoadmapItem[]
): CareerCoachTimelineItem[] {
  const topSkill = skillGaps[0]?.title ?? "the highest-priority missing skill";
  const topResumeTask = resumePlan[0]?.title ?? "the weakest resume section";
  const topInterviewTask =
    interviewPlan[0]?.title ?? "one OA or interview weak area";

  return [
    {
      label: "Day 1",
      title: "Audit your evidence",
      tasks: [
        `Review ${topResumeTask}.`,
        "Collect real project, internship, coursework, or achievement proof.",
      ],
    },
    {
      label: "Day 2",
      title: "Fix resume positioning",
      tasks: [
        "Rewrite the professional summary for the target role.",
        "Add stronger action-result bullets without inventing metrics.",
      ],
    },
    {
      label: "Day 3",
      title: "Close the top skill gap",
      tasks: [
        `Study and build one small proof artifact for ${topSkill}.`,
        "Document what you built, tested, and learned.",
      ],
    },
    {
      label: "Day 4",
      title: "Re-run ATS and JD match",
      tasks: [
        "Run the ATS optimizer against the target JD.",
        "Update only truthful keywords backed by resume evidence.",
      ],
    },
    {
      label: "Day 5",
      title: "Interview drill",
      tasks: [
        `Practice ${topInterviewTask}.`,
        "Answer aloud using approach, tradeoffs, edge cases, and validation.",
      ],
    },
    {
      label: "Day 6",
      title: "Project story polish",
      tasks: [
        "Prepare one architecture/deep-dive story for your strongest project.",
        "Add failure cases, decisions, and testing details.",
      ],
    },
    {
      label: "Day 7",
      title: "Final readiness pass",
      tasks: [
        "Re-run Resume Intelligence, JD Match, and OA Assessment.",
        "Apply the highest-impact remaining quick wins.",
      ],
    },
  ];
}

function buildThirtyDayRoadmap(
  skillGaps: CareerCoachRoadmapItem[],
  resumePlan: CareerCoachRoadmapItem[],
  interviewPlan: CareerCoachRoadmapItem[]
): CareerCoachTimelineItem[] {
  return [
    {
      label: "Week 1",
      title: "Foundation cleanup",
      tasks: [
        "Complete the 7-day action plan.",
        "Fix resume gaps that block ATS or recruiter screening.",
      ],
    },
    {
      label: "Week 2",
      title: "Proof-building sprint",
      tasks: [
        `Create evidence for ${skillGaps[0]?.title ?? "your top skill gap"}.`,
        "Add one project bullet that explains what, how, and result.",
      ],
    },
    {
      label: "Week 3",
      title: "Interview depth",
      tasks: [
        `Practice ${interviewPlan[0]?.title ?? "technical and project deep-dive questions"}.`,
        "Repeat weak OA categories under a timer.",
      ],
    },
    {
      label: "Week 4",
      title: "Application readiness",
      tasks: [
        "Re-run all reports and compare scores.",
        `Finalize ${resumePlan[0]?.title ?? "the resume improvement plan"} before applying.`,
      ],
    },
  ];
}

function nextBestAction(input: CareerCoachInput, score: number) {
  if (!input.resume) {
    return {
      label: "Upload Resume",
      href: "/dashboard/resume",
      reason: "Career coaching needs a resume baseline first.",
      expectedGain: 12,
    };
  }

  if (!input.atsAnalysis) {
    return {
      label: "Run ATS Analysis",
      href: "/dashboard/resume/ats",
      reason: "ATS readiness is missing from the roadmap.",
      expectedGain: 8,
    };
  }

  if (!input.jdMatchAnalysis) {
    return {
      label: "Match Against a JD",
      href: "/dashboard/resume/match",
      reason: "A target job description makes the roadmap role-specific.",
      expectedGain: 8,
    };
  }

  if (!input.oaReport && !input.interviewEvaluation) {
    return {
      label: "Start Interview Practice",
      href: "/dashboard/interview",
      reason: "Interview readiness is the next missing signal.",
      expectedGain: 6,
    };
  }

  if (score < 70) {
    return {
      label: "Open Resume Intelligence",
      href: "/dashboard/resume",
      reason: "The fastest lift is improving evidence and positioning.",
      expectedGain: 8,
    };
  }

  return {
    label: "Practice Another OA",
    href: "/dashboard/interview",
    reason: "Your profile has enough evidence; keep sharpening interview execution.",
    expectedGain: 4,
  };
}

export function buildCareerCoachReport(input: CareerCoachInput): CareerCoachReport {
  const resumeScore = getResumeScore(input);
  const atsScore =
    typeof input.atsAnalysis?.atsScore === "number"
      ? clampScore(input.atsAnalysis.atsScore)
      : null;
  const jdScore =
    typeof input.jdMatchAnalysis?.matchScore === "number"
      ? clampScore(input.jdMatchAnalysis.matchScore)
      : null;
  const interviewScore = getInterviewScore(input);
  const analysis = getResumeAnalysis(input);
  const missingData = buildMissingData(input);
  const dataCompleteness = clampScore(((4 - missingData.length) / 4) * 100);
  const targetRole =
    displayText(input.jdMatchAnalysis?.targetRole, "") ||
    displayText(input.atsAnalysis?.targetRole, "") ||
    displayText(analysis?.detectedProfileType, "") ||
    "Target role not selected";
  const detectedSeniority = displayText(analysis?.detectedSeniority, "Unknown");
  const skillScore = skillGapScore(input);
  const readinessFormula = weightedCareerFormula({
    resume: resumeScore,
    ats: atsScore,
    jobMatch: jdScore,
    interview: interviewScore,
    skillGap: skillScore,
  });
  const careerReadinessScore = readinessFormula.overallReadiness;
  const skillGapRoadmap = buildSkillGaps(input);
  const resumeImprovementPlan = buildResumePlan(input);
  const interviewPracticePlan = buildInterviewPlan(input);
  const careerGapAnalysis = buildCareerGapAnalysis(
    input,
    {
      resume: resumeScore,
      ats: atsScore,
      jd: jdScore,
      interview: interviewScore,
    },
    targetRole,
    detectedSeniority,
    careerReadinessScore
  );
  const skillMaturity = buildSkillMaturity(input);
  const targetRoleComparison = buildTargetRoleComparison(
    input,
    careerGapAnalysis
  );
  const impactRanking = buildImpactRanking([
    ...skillGapRoadmap,
    ...resumeImprovementPlan,
    ...interviewPracticePlan,
  ]);
  const strategicRecommendations = generateStrategicRecommendations({
    coachInput: input,
    currentReadinessScore: careerReadinessScore,
    scores: {
      resume: resumeScore,
      ats: atsScore,
      jdMatch: jdScore,
      interview: interviewScore,
    },
  });
  const interviewRootCauseAnalysis = buildInterviewRootCauseAnalysis(input);
  const sevenDayActionPlan = buildSevenDayPlan(
    skillGapRoadmap,
    resumeImprovementPlan,
    interviewPracticePlan
  );
  const thirtyDayRoadmap = buildThirtyDayRoadmap(
    skillGapRoadmap,
    resumeImprovementPlan,
    interviewPracticePlan
  );
  const strongestAreas = uniqueValues([
    ...strongestResumeCategories(analysis).map((item) => `Resume: ${item}`),
    ...safeStringArray(input.atsAnalysis?.strengths).map((item) => `ATS: ${item}`),
    ...safeStringArray(input.jdMatchAnalysis?.strengths).map(
      (item) => `JD Match: ${item}`
    ),
    ...safeStringArray(input.oaReport?.strongestAreas).map(
      (item) => `Interview: ${item}`
    ),
    ...safeStringArray(input.interviewEvaluation?.topStrengths).map(
      (item) => `Interview: ${item}`
    ),
  ], 8);
  const weakestAreas = uniqueValues([
    ...lowResumeCategories(analysis).map((item) => `Resume: ${item}`),
    ...safeStringArray(analysis?.topIssues).map((item) => `Resume: ${item}`),
    ...(Array.isArray(input.atsAnalysis?.atsWarnings)
      ? input.atsAnalysis.atsWarnings.map((item) =>
          `ATS: ${displayText(item?.warning, "Review ATS warning")}`
        )
      : []),
    ...safeStringArray(input.jdMatchAnalysis?.gaps).map(
      (item) => `JD Match: ${item}`
    ),
    ...safeStringArray(input.oaReport?.weakestAreas).map(
      (item) => `Interview: ${item}`
    ),
    ...safeStringArray(input.interviewEvaluation?.priorityImprovements).map(
      (item) => `Interview: ${item}`
    ),
  ], 8);
  const recommendedNextSteps = uniqueValues([
    impactRanking.topThreeActions[0]
      ? `${impactRanking.topThreeActions[0].title}: +${impactRanking.topThreeActions[0].expectedGain} readiness.`
      : "",
    skillGapRoadmap[0]?.action ?? "",
    resumeImprovementPlan[0]?.action ?? "",
    interviewPracticePlan[0]?.action ?? "",
    missingData[0] ? `Complete missing data source: ${missingData[0]}.` : "",
    normalizeText(targetRole) === "target role not selected"
      ? "Upload a resume to unlock personalized coaching."
      : "",
    atsScore === null ? "Run ATS analysis to improve readiness accuracy." : "",
    interviewScore === null
      ? "Complete an OA session to unlock interview insights."
      : "",
    "Re-run the coach after each major resume, JD match, or interview update.",
  ], 6);

  return {
    generatedAt: new Date().toISOString(),
    careerReadinessScore,
    readinessLabel: readinessLabel(careerReadinessScore),
    targetRole,
    detectedSeniority,
    targetRoleFit:
      jdScore === null
        ? "Paste a job description in JD Match to calculate target-role fit."
        : `${jdScore}/100 match for ${targetRole}. ${
            jdScore >= 75
              ? "You have meaningful alignment; focus on proof and interview execution."
              : "Close the missing skills and evidence gaps before applying broadly."
          }`,
    dataCompleteness,
    missingData,
    scores: {
      resumeReadiness: scoreCard(
        "Resume Readiness",
        resumeScore,
        resumeScore === null
          ? "No resume analysis found."
          : "Based on the latest Resume Intelligence score."
      ),
      atsReadiness: scoreCard(
        "ATS Readiness",
        atsScore,
        atsScore === null
          ? "Run ATS Optimizer for a job-specific ATS score."
          : "Based on the latest ATS Optimizer report."
      ),
      jobMatchReadiness: scoreCard(
        "Job Match Readiness",
        jdScore,
        jdScore === null
          ? "Run JD Match against a target role."
          : "Based on the latest JD Match score."
      ),
      interviewReadiness: scoreCard(
        "Interview Readiness",
        interviewScore,
        interviewScore === null
          ? "Complete an OA or interview session."
          : "Based on the latest OA/interview evaluation."
      ),
      overallCareerReadiness: scoreCard(
        "Overall Career Readiness",
        careerReadinessScore,
        "Weighted from resume, ATS, JD match, and interview readiness. Missing sources reduce confidence."
      ),
    },
    strongestAreas: strongestAreas.length
      ? strongestAreas
      : ["Complete more TalentForge assessments to identify strengths."],
    weakestAreas: weakestAreas.length
      ? weakestAreas
      : ["No major weak area detected yet. Add more data sources for a sharper coach report."],
    skillGapRoadmap,
    resumeImprovementPlan,
    interviewPracticePlan,
    sevenDayActionPlan,
    thirtyDayRoadmap,
    recommendedNextSteps,
    strategicRecommendations,
    careerGapAnalysis,
    impactRanking,
    recruiterSimulation: buildRecruiterSimulation(
      careerReadinessScore,
      strongestAreas,
      weakestAreas
    ),
    skillMaturity,
    interviewRootCauseAnalysis,
    targetRoleComparison,
    readinessFormula,
    progressTracking: {
      previousReadiness: null,
      currentReadiness: careerReadinessScore,
      readinessDelta: null,
      atsDelta: null,
      interviewDelta: null,
      jdMatchDelta: null,
      resumeDelta: null,
    },
    nextBestAction:
      strategicRecommendations.nextBestAction && input.resume
        ? {
            label: strategicRecommendations.nextBestAction.title,
            href: nextBestAction(input, careerReadinessScore).href,
            reason: strategicRecommendations.nextBestAction.reason,
            expectedGain:
              strategicRecommendations.nextBestAction.expectedReadinessGain,
          }
        : nextBestAction(input, careerReadinessScore),
  };
}
