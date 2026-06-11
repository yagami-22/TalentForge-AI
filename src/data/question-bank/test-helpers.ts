import { oaQuestionBank, OA_QUESTION_BANK_SIZE } from "./seed/oa-questions";
import { selectQuestions } from "./select-questions";
import type { OAQuestion, SelectQuestionsOptions } from "./types";

export type QuestionBankValidationResult = {
  isValid: boolean;
  totalQuestions: number;
  minimumExpectedQuestions: number;
  duplicateIds: string[];
  missingRequiredFields: string[];
  typeCounts: Record<string, number>;
  difficultyCounts: Record<string, number>;
};

const MINIMUM_EXPECTED_QUESTIONS = 300;

function findDuplicateIds(questions: OAQuestion[]) {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  questions.forEach((question) => {
    if (seen.has(question.id)) {
      duplicates.add(question.id);
      return;
    }

    seen.add(question.id);
  });

  return Array.from(duplicates);
}

function countBy<T extends string>(values: T[]) {
  return values.reduce<Record<string, number>>((counts, value) => {
    counts[value] = (counts[value] ?? 0) + 1;
    return counts;
  }, {});
}

export function validateQuestionBank(
  questions: OAQuestion[] = oaQuestionBank
): QuestionBankValidationResult {
  const duplicateIds = findDuplicateIds(questions);
  const missingRequiredFields = questions.flatMap((question) => {
    const missing: string[] = [];

    if (!question.id) missing.push(`${question.id || "unknown"}: id`);
    if (!question.title) missing.push(`${question.id}: title`);
    if (!question.prompt) missing.push(`${question.id}: prompt`);
    if (!question.skills.length) missing.push(`${question.id}: skills`);
    if (!question.companyStyleTags.length) missing.push(`${question.id}: companyStyleTags`);
    if (!question.seniorityTags.length) missing.push(`${question.id}: seniorityTags`);

    return missing;
  });

  return {
    isValid:
      questions.length >= MINIMUM_EXPECTED_QUESTIONS &&
      OA_QUESTION_BANK_SIZE >= MINIMUM_EXPECTED_QUESTIONS &&
      duplicateIds.length === 0 &&
      missingRequiredFields.length === 0,
    totalQuestions: questions.length,
    minimumExpectedQuestions: MINIMUM_EXPECTED_QUESTIONS,
    duplicateIds,
    missingRequiredFields,
    typeCounts: countBy(questions.map((question) => question.type)),
    difficultyCounts: countBy(questions.map((question) => question.difficulty)),
  };
}

export function createSampleOASelectionOptions(
  overrides: SelectQuestionsOptions = {}
): SelectQuestionsOptions {
  return {
    count: 10,
    resumeText: `
      Computer Science student with React, Next.js, TypeScript, SQL, MySQL,
      REST APIs, GitHub, DSA, OOP, Machine Learning, and software testing.
      Built Planora AI and Smart Complaint Management System projects.
    `,
    jobDescription: `
      Frontend engineering internship requiring React, TypeScript, JavaScript,
      REST API integration, SQL fundamentals, testing, DSA problem solving,
      and ability to work in a product-focused startup environment.
    `,
    targetRole: "Frontend Engineer Intern",
    companyStyleTags: ["startup", "product", "campus"],
    seniority: "student",
    seed: "sample-frontend-intern",
    ...overrides,
  };
}

export function runQuestionBankSmokeTest(options: SelectQuestionsOptions = {}) {
  const validation = validateQuestionBank();
  const selection = selectQuestions(createSampleOASelectionOptions(options));

  return {
    validation,
    selectionSummary: {
      selectedCount: selection.questions.length,
      selectedIds: selection.questions.map((question) => question.id),
      selectedByDifficulty: selection.diagnostics.selectedByDifficulty,
      selectedByType: selection.diagnostics.selectedByType,
      detectedSkills: selection.diagnostics.detectedSkills.map((signal) => signal.skill),
      companyStyleTagsUsed: selection.diagnostics.companyStyleTagsUsed,
    },
  };
}
