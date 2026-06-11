import {
  selectQuestions,
  type OACompanyStyleTag,
  type OAQuestionDifficulty,
  type OAQuestionType,
  type QuestionSelectionDiagnostics,
} from "@/data/question-bank";

export type OAAnswer = {
  questionId: string;
  answer: string;
  savedAt: string;
  elapsedSeconds: number;
};

export type OASessionQuestion = {
  id: string;
  type: OAQuestionType;
  difficulty: OAQuestionDifficulty;
  title: string;
  prompt: string;
  skills: string[];
  companyStyleTags: OACompanyStyleTag[];
  timeLimitMinutes: number;
  scoreValue: number;
  selectionScore: number;
  selectionReasons: string[];
  expectedAnswer: string;
  expectedTopics: string[];
  idealAnswerPoints: string[];
  constraints: string[];
  hints: string[];
  options: Array<{
    label: "A" | "B" | "C" | "D";
    text: string;
  }>;
};

export type OASession = {
  id: string;
  resumeId: string;
  resumeTitle: string;
  jobDescription: string;
  targetRole: string;
  questions: OASessionQuestion[];
  diagnostics: QuestionSelectionDiagnostics;
  currentQuestionIndex: number;
  createdAt: string;
  status: "ready" | "in_progress" | "completed";
};

type GenerateOASessionInput = {
  resumeId: string;
  resumeTitle: string;
  resumeText: string;
  jobDescription: string;
};

function makeOASessionId() {
  return `oa_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function inferTargetRole(jobDescription: string) {
  const titleMatch = jobDescription
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find((line) =>
      /\b(?:engineer|developer|analyst|designer|manager|intern|trainee|associate)\b/i.test(
        line
      )
    );

  return titleMatch?.replace(/\s+/g, " ").slice(0, 90) || "OA Assessment";
}

export function generateOASession({
  resumeId,
  resumeTitle,
  resumeText,
  jobDescription,
}: GenerateOASessionInput): OASession {
  const targetRole = inferTargetRole(jobDescription);
  const selection = selectQuestions({
    count: 10,
    resumeText,
    jobDescription,
    targetRole,
  });

  return {
    id: makeOASessionId(),
    resumeId,
    resumeTitle,
    jobDescription,
    targetRole,
    questions: selection.questions.map((question) => ({
      id: question.id,
      type: question.type,
      difficulty: question.difficulty,
      title: question.title,
      prompt: question.prompt,
      skills: question.skills,
      companyStyleTags: question.companyStyleTags,
      timeLimitMinutes: question.timeLimitMinutes,
      scoreValue: question.points,
      selectionScore: question.selectionScore,
      selectionReasons: question.selectionReasons,
      expectedAnswer: question.expectedAnswer ?? "",
      expectedTopics: question.expectedTopics ?? question.skills,
      idealAnswerPoints: question.idealAnswerPoints ?? [
        question.expectedAnswer,
        ...(question.hints ?? []),
      ].filter((point): point is string => Boolean(point)),
      constraints: question.constraints ?? [],
      hints: question.hints ?? [],
      options: question.options ?? [],
    })),
    diagnostics: selection.diagnostics,
    currentQuestionIndex: 0,
    createdAt: new Date().toISOString(),
    status: "ready",
  };
}
