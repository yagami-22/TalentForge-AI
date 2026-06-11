import type {
  InterviewAnswer,
  InterviewEvaluation,
  InterviewMode,
  InterviewSession,
} from "@/lib/interview-prep";
import { getInterviewModeTitle } from "@/lib/interview-prep";
import type { OAReport } from "@/lib/oa-evaluation";
import type { OAAnswer, OASession } from "@/lib/oa-session";

export type InterviewHistoryCategoryScore = {
  name: string;
  score: number;
  maxScore: number;
};

export type InterviewHistoryAttempt = {
  id: string;
  attemptDate: string;
  assessmentType: string;
  overallScore: number;
  accuracy: number;
  technicalDepth: number;
  relevance: number;
  completeness: number;
  communication: number;
  categoryScores: InterviewHistoryCategoryScore[];
  strengths: string[];
  weaknesses: string[];
  timeSpent: number;
  questionsAnswered: number;
};

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function average(values: number[]) {
  return values.length
    ? clampScore(values.reduce((sum, value) => sum + value, 0) / values.length)
    : 0;
}

function safeList(values: unknown, fallback: string[]) {
  return Array.isArray(values)
    ? values.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    : fallback;
}

function makeAttemptId(prefix: string, sessionId: string, generatedAt: string) {
  return `${prefix}_${sessionId}_${generatedAt}`;
}

function latestInterviewAnswerTime(answers: InterviewAnswer[], fallback: string) {
  const latestTimestamp = answers
    .map((answer) => new Date(answer.answeredAt).getTime())
    .filter((time) => Number.isFinite(time))
    .sort((a, b) => b - a)[0];

  return latestTimestamp ? new Date(latestTimestamp).toISOString() : fallback;
}

export function createOAHistoryAttempt({
  report,
  session,
  answers,
}: {
  report: OAReport;
  session: OASession;
  answers: OAAnswer[];
}): InterviewHistoryAttempt {
  const answeredQuestions = answers.filter((answer) => answer.answer.trim().length > 0);
  const generatedAt = report.generatedAt || new Date().toISOString();

  return {
    id: makeAttemptId("oa", session.id, generatedAt),
    attemptDate: generatedAt,
    assessmentType: "OA Assessment",
    overallScore: report.overallScore,
    accuracy: average(report.answerEvaluations.map((item) => item.accuracyScore)),
    technicalDepth: average(
      report.answerEvaluations.map((item) => item.technicalDepthScore)
    ),
    relevance: average(report.answerEvaluations.map((item) => item.relevanceScore)),
    completeness: average(
      report.answerEvaluations.map((item) => item.completenessScore)
    ),
    communication: average(
      report.answerEvaluations.map((item) => item.communicationScore)
    ),
    categoryScores: report.categoryBreakdown.map((category) => ({
      name: category.name,
      score: category.percentage,
      maxScore: 100,
    })),
    strengths: safeList(report.strongestAreas, report.strengths).slice(0, 8),
    weaknesses: safeList(report.weakestAreas, report.weaknesses).slice(0, 8),
    timeSpent: answers.reduce((sum, answer) => sum + answer.elapsedSeconds, 0),
    questionsAnswered: answeredQuestions.length,
  };
}

export function createMockInterviewHistoryAttempt({
  evaluation,
  session,
  answers,
}: {
  evaluation: InterviewEvaluation;
  session: InterviewSession;
  answers: InterviewAnswer[];
}): InterviewHistoryAttempt {
  const generatedAt = latestInterviewAnswerTime(answers, session.createdAt);
  const answeredQuestions = answers.filter((answer) => answer.answer.trim().length > 0);
  const answerScores = evaluation.answerEvaluations.map((item) => item.score);
  const averageAnswerScore = average(answerScores);
  const technicalWeight = session.mode === "Technical" || session.mode === "ProjectDeepDive"
    ? 1
    : 0.86;
  const communicationWeight = session.mode === "BehavioralHR" ? 1 : 0.9;

  return {
    id: makeAttemptId("interview", session.id, generatedAt),
    attemptDate: generatedAt,
    assessmentType: getInterviewModeTitle(session.mode as InterviewMode),
    overallScore: evaluation.overallScore,
    accuracy: averageAnswerScore || evaluation.overallScore,
    technicalDepth: clampScore((averageAnswerScore || evaluation.overallScore) * technicalWeight),
    relevance: evaluation.overallScore,
    completeness: clampScore(
      session.questions.length
        ? (answeredQuestions.length / session.questions.length) * 100
        : evaluation.overallScore
    ),
    communication: clampScore(evaluation.overallScore * communicationWeight),
    categoryScores: [
      {
        name: "Overall",
        score: evaluation.overallScore,
        maxScore: 100,
      },
      {
        name: "Answer Coverage",
        score: clampScore(
          session.questions.length
            ? (answeredQuestions.length / session.questions.length) * 100
            : 0
        ),
        maxScore: 100,
      },
    ],
    strengths: safeList(evaluation.topStrengths, []).slice(0, 8),
    weaknesses: safeList(evaluation.priorityImprovements, []).slice(0, 8),
    timeSpent: 0,
    questionsAnswered: answeredQuestions.length,
  };
}

export function mergeHistoryAttempts(
  attempts: InterviewHistoryAttempt[],
  nextAttempt: InterviewHistoryAttempt
) {
  const withoutDuplicate = attempts.filter((attempt) => attempt.id !== nextAttempt.id);

  return [...withoutDuplicate, nextAttempt].sort(
    (a, b) => new Date(a.attemptDate).getTime() - new Date(b.attemptDate).getTime()
  );
}
