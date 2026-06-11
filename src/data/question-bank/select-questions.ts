import { extractSkillSignals, uniqueDetectedSkills } from "./skills";
import { oaQuestionBank } from "./seed/oa-questions";
import type {
  DifficultyDistribution,
  OACompanyStyleTag,
  OAQuestion,
  OAQuestionDifficulty,
  OAQuestionType,
  QuestionSelectionDiagnostics,
  QuestionSelectionResult,
  SelectQuestionsOptions,
  SelectedQuestion,
} from "./types";

const DIFFICULTIES: OAQuestionDifficulty[] = ["Easy", "Medium", "Hard", "VeryHard"];
const DEFAULT_DIFFICULTY_DISTRIBUTION: Record<OAQuestionDifficulty, number> = {
  Easy: 0,
  Medium: 0.2,
  Hard: 0.6,
  VeryHard: 0.2,
};

const DEFAULT_COMPANY_STYLE_TAGS: OACompanyStyleTag[] = ["campus", "product"];
const DEFAULT_TYPE_DISTRIBUTION: Partial<Record<OAQuestionType, number>> = {
  coding: 0.35,
  debugging: 0.25,
  architecture: 0.2,
  performance: 0.1,
  accessibility: 0.05,
  testing: 0.05,
};

function normalizeTerm(value: string) {
  return value.toLowerCase().replace(/[^\w+#.]+/g, " ").replace(/\s+/g, " ").trim();
}

function stableHash(value: string) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash;
}

function seededTieBreaker(questionId: string, seed: string) {
  return stableHash(`${seed}:${questionId}`) / 0xffffffff;
}

function normalizeDistribution(
  distribution: DifficultyDistribution | undefined
): Record<OAQuestionDifficulty, number> {
  const merged = {
    ...DEFAULT_DIFFICULTY_DISTRIBUTION,
    ...distribution,
  };
  const total = DIFFICULTIES.reduce(
    (sum, difficulty) => sum + Math.max(0, merged[difficulty] ?? 0),
    0
  );

  if (!total) {
    return DEFAULT_DIFFICULTY_DISTRIBUTION;
  }

  return {
    Easy: Math.max(0, merged.Easy ?? 0) / total,
    Medium: Math.max(0, merged.Medium ?? 0) / total,
    Hard: Math.max(0, merged.Hard ?? 0) / total,
    VeryHard: Math.max(0, merged.VeryHard ?? 0) / total,
  };
}

function buildDifficultyQuotas(
  count: number,
  distribution: Record<OAQuestionDifficulty, number>
) {
  const quotas = {
    Easy: Math.floor(count * distribution.Easy),
    Medium: Math.floor(count * distribution.Medium),
    Hard: Math.floor(count * distribution.Hard),
    VeryHard: Math.floor(count * distribution.VeryHard),
  };
  let remaining = count - DIFFICULTIES.reduce((sum, difficulty) => sum + quotas[difficulty], 0);
  const rankedRemainders = DIFFICULTIES.map((difficulty) => ({
    difficulty,
    remainder: count * distribution[difficulty] - quotas[difficulty],
  })).sort((a, b) => b.remainder - a.remainder);

  for (const item of rankedRemainders) {
    if (remaining <= 0) break;
    quotas[item.difficulty] += 1;
    remaining -= 1;
  }

  return quotas;
}

function buildTypeQuotas(count: number, preferredTypes: OAQuestionType[]) {
  const coreFrontendTypes: OAQuestionType[] = [
    "coding",
    "debugging",
    "architecture",
    "performance",
    "accessibility",
    "testing",
  ];

  if (
    count === 10 &&
    coreFrontendTypes.every((type) => preferredTypes.includes(type))
  ) {
    return {
      coding: 3,
      debugging: 2,
      architecture: 2,
      performance: 1,
      accessibility: 1,
      testing: 1,
    } satisfies Partial<Record<OAQuestionType, number>>;
  }

  const baseDistribution = preferredTypes.reduce<Partial<Record<OAQuestionType, number>>>(
    (distribution, type) => {
      distribution[type] = DEFAULT_TYPE_DISTRIBUTION[type] ?? 0;
      return distribution;
    },
    {}
  );
  const distributionTotal = preferredTypes.reduce(
    (sum, type) => sum + (baseDistribution[type] ?? 0),
    0
  );
  const normalizedDistribution = preferredTypes.reduce<Record<string, number>>(
    (distribution, type) => {
      distribution[type] = distributionTotal
        ? (baseDistribution[type] ?? 0) / distributionTotal
        : 1 / preferredTypes.length;
      return distribution;
    },
    {}
  );
  const positiveTypes = preferredTypes.filter(
    (type) => (baseDistribution[type] ?? 0) > 0
  );
  const initialQuota = count >= positiveTypes.length ? 1 : 0;
  const quotas = preferredTypes.reduce<Partial<Record<OAQuestionType, number>>>(
    (counts, type) => {
      counts[type] = (baseDistribution[type] ?? 0) > 0 ? initialQuota : 0;
      return counts;
    },
    {}
  );
  let remaining =
    count - preferredTypes.reduce((sum, type) => sum + (quotas[type] ?? 0), 0);
  const rankedRemainders = preferredTypes
    .map((type) => ({
      type,
      remainder:
        remaining * normalizedDistribution[type] -
        Math.floor(remaining * normalizedDistribution[type]),
    }))
    .sort((a, b) => b.remainder - a.remainder);

  for (const type of preferredTypes) {
    if (remaining <= 0) break;
    const extra = Math.floor(remaining * normalizedDistribution[type]);
    quotas[type] = (quotas[type] ?? 0) + extra;
  }

  remaining =
    count - preferredTypes.reduce((sum, type) => sum + (quotas[type] ?? 0), 0);

  for (const item of rankedRemainders) {
    if (remaining <= 0) break;
    quotas[item.type] = (quotas[item.type] ?? 0) + 1;
    remaining -= 1;
  }

  return quotas;
}

function inferCompanyStyleTags(jobDescription = ""): OACompanyStyleTag[] {
  const normalized = normalizeTerm(jobDescription);
  const tags = new Set<OACompanyStyleTag>();

  if (/\b(?:startup|founding|0 to 1|fast paced|early stage)\b/.test(normalized)) {
    tags.add("startup");
  }

  if (/\b(?:product|saas|platform|user experience|customer|meta|airbnb|netflix|atlassian)\b/.test(normalized)) {
    tags.add("product");
  }

  if (/\b(?:bank|payment|payments|trading|risk|fraud|finance|fintech|stripe|jpmorgan|goldman|arcesium|low latency)\b/.test(normalized)) {
    tags.add("fintech");
  }

  if (/\b(?:consulting|client|stakeholder|strategy|case)\b/.test(normalized)) {
    tags.add("consulting");
  }

  if (/\b(?:enterprise|scale|security|compliance|audit|oracle|microsoft|reliability)\b/.test(normalized)) {
    tags.add("enterprise");
  }

  if (/\b(?:google|meta|amazon|microsoft|uber|netflix|faang|algorithm|optimization|scalability)\b/.test(normalized)) {
    tags.add("faang");
  }

  if (/\b(?:campus|graduate|fresher|intern|internship|entry level)\b/.test(normalized)) {
    tags.add("campus");
  }

  if (!tags.size) {
    DEFAULT_COMPANY_STYLE_TAGS.forEach((tag) => tags.add(tag));
  }

  return Array.from(tags);
}

function scoreQuestion({
  question,
  detectedSkills,
  jdSkills,
  resumeSkills,
  companyStyleTags,
  preferredTypes,
  targetRole,
  seed,
}: {
  question: OAQuestion;
  detectedSkills: string[];
  jdSkills: string[];
  resumeSkills: string[];
  companyStyleTags: OACompanyStyleTag[];
  preferredTypes: OAQuestionType[];
  targetRole?: string;
  seed: string;
}): SelectedQuestion {
  const questionSkills = question.skills.map(normalizeTerm);
  const normalizedDetectedSkills = detectedSkills.map(normalizeTerm);
  const normalizedJdSkills = jdSkills.map(normalizeTerm);
  const normalizedResumeSkills = resumeSkills.map(normalizeTerm);
  const normalizedTargetRole = normalizeTerm(targetRole ?? "");
  const reasons: string[] = [];
  let score = 0;

  const jdMatches = questionSkills.filter((skill) => normalizedJdSkills.includes(skill));
  const resumeMatches = questionSkills.filter((skill) => normalizedResumeSkills.includes(skill));
  const detectedMatches = questionSkills.filter((skill) =>
    normalizedDetectedSkills.includes(skill)
  );
  const companyMatches = question.companyStyleTags.filter((tag) =>
    companyStyleTags.includes(tag)
  );
  const roleMatches = question.roleTags.filter((tag) =>
    normalizedTargetRole.includes(normalizeTerm(tag))
  );

  if (jdMatches.length) {
    score += jdMatches.length * 18;
    reasons.push(`JD skill match: ${jdMatches.join(", ")}`);
  }

  if (resumeMatches.length) {
    score += resumeMatches.length * 12;
    reasons.push(`Resume skill match: ${resumeMatches.join(", ")}`);
  }

  if (!jdMatches.length && detectedMatches.length) {
    score += detectedMatches.length * 6;
    reasons.push(`Related detected skill: ${detectedMatches.join(", ")}`);
  }

  if (companyMatches.length) {
    score += companyMatches.length * 5;
    reasons.push(`Company-style fit: ${companyMatches.join(", ")}`);
  }

  if (preferredTypes.includes(question.type)) {
    score += 8;
    reasons.push(`Preferred type: ${question.type}`);
  }

  if (roleMatches.length) {
    score += roleMatches.length * 4;
    reasons.push(`Role tag fit: ${roleMatches.join(", ")}`);
  }

  score += (1 - seededTieBreaker(question.id, seed)) * 0.01;

  return {
    ...question,
    selectionScore: Number(score.toFixed(4)),
    selectionReasons: reasons.length ? reasons : ["Balanced fallback coverage"],
  };
}

function countByDifficulty(questions: SelectedQuestion[]) {
  return questions.reduce<Record<OAQuestionDifficulty, number>>(
    (counts, question) => ({
      ...counts,
      [question.difficulty]: counts[question.difficulty] + 1,
    }),
    { Easy: 0, Medium: 0, Hard: 0, VeryHard: 0 }
  );
}

function countByType(questions: SelectedQuestion[]) {
  return questions.reduce<Partial<Record<OAQuestionType, number>>>((counts, question) => {
    counts[question.type] = (counts[question.type] ?? 0) + 1;
    return counts;
  }, {});
}

export function selectQuestions(options: SelectQuestionsOptions = {}): QuestionSelectionResult {
  const count = Math.max(1, Math.min(options.count ?? 10, oaQuestionBank.length));
  const difficultyDistribution = normalizeDistribution(options.difficultyDistribution);
  const quotas = buildDifficultyQuotas(count, difficultyDistribution);
  const excludedIds = new Set(options.excludeQuestionIds ?? []);
  const skillSignals = extractSkillSignals({
    resumeText: options.resumeText,
    jobDescription: options.jobDescription,
  });
  const detectedSkills = uniqueDetectedSkills(skillSignals);
  const jdSkills = uniqueDetectedSkills(skillSignals.filter((signal) => signal.source === "jd"));
  const resumeSkills = uniqueDetectedSkills(
    skillSignals.filter((signal) => signal.source === "resume")
  );
  const companyStyleTags = Array.from(
    new Set([
      ...(options.companyStyleTags ?? []),
      ...inferCompanyStyleTags(options.jobDescription),
    ])
  );
  const preferredTypes = options.preferredTypes?.length
    ? options.preferredTypes
    : ([
        "coding",
        "debugging",
        "architecture",
        "performance",
        "accessibility",
        "testing",
        "sql",
        "mcq",
        "role-specific",
        "aptitude",
      ] satisfies OAQuestionType[]);
  const typeQuotas = buildTypeQuotas(count, preferredTypes);
  const seed = options.seed ?? `${options.resumeText ?? ""}:${options.jobDescription ?? ""}`;
  const candidates = oaQuestionBank
    .filter((question) => !excludedIds.has(question.id))
    .filter((question) => !options.seniority || question.seniorityTags.includes(options.seniority))
    .map((question) =>
      scoreQuestion({
        question,
        detectedSkills,
        jdSkills,
        resumeSkills,
        companyStyleTags,
        preferredTypes,
        targetRole: options.targetRole,
        seed,
      })
    )
    .sort((a, b) => b.selectionScore - a.selectionScore);
  const selected: SelectedQuestion[] = [];
  const selectedTypeCount = (type: OAQuestionType) =>
    selected.filter((item) => item.type === type).length;
  const selectedDifficultyCount = (difficulty: OAQuestionDifficulty) =>
    selected.filter((item) => item.difficulty === difficulty).length;
  const isSelected = (question: SelectedQuestion) =>
    selected.some((item) => item.id === question.id);

  for (const type of preferredTypes) {
    const typeQuota = typeQuotas[type] ?? 0;
    const byType = candidates.filter((question) => question.type === type);

    for (const question of byType) {
      if (selected.length >= count || selectedTypeCount(type) >= typeQuota) {
        break;
      }

      if (
        isSelected(question) ||
        selectedDifficultyCount(question.difficulty) >= quotas[question.difficulty]
      ) {
        continue;
      }

      selected.push(question);
    }
  }

  for (const type of preferredTypes) {
    const typeQuota = typeQuotas[type] ?? 0;
    const byType = candidates.filter((question) => question.type === type);

    for (const question of byType) {
      if (selected.length >= count || selectedTypeCount(type) >= typeQuota) {
        break;
      }

      if (!isSelected(question)) {
        selected.push(question);
      }
    }
  }

  for (const question of candidates) {
    if (selected.length >= count) break;
    if (!isSelected(question)) {
      selected.push(question);
    }
  }

  const finalQuestions = selected
    .sort((a, b) => {
      const difficultyOrder = DIFFICULTIES.indexOf(a.difficulty) - DIFFICULTIES.indexOf(b.difficulty);
      return difficultyOrder || b.selectionScore - a.selectionScore;
    })
    .slice(0, count);
  const diagnostics: QuestionSelectionDiagnostics = {
    requestedCount: count,
    selectedCount: finalQuestions.length,
    detectedSkills: skillSignals,
    normalizedDifficultyDistribution: difficultyDistribution,
    selectedByDifficulty: countByDifficulty(finalQuestions),
    selectedByType: countByType(finalQuestions),
    companyStyleTagsUsed: companyStyleTags,
    fallbackUsed: finalQuestions.some((question) =>
      question.selectionReasons.includes("Balanced fallback coverage")
    ),
  };

  return {
    questions: finalQuestions,
    diagnostics,
  };
}
