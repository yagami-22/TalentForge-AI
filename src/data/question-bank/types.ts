export type OAQuestionType =
  | "coding"
  | "mcq"
  | "sql"
  | "aptitude"
  | "debugging"
  | "architecture"
  | "performance"
  | "accessibility"
  | "testing"
  | "role-specific";

export type OAQuestionDifficulty = "Easy" | "Medium" | "Hard" | "VeryHard";

export type OACompanyStyleTag =
  | "faang"
  | "startup"
  | "product"
  | "service"
  | "fintech"
  | "consulting"
  | "campus"
  | "enterprise";

export type OASeniorityTag = "student" | "fresher" | "early-career" | "experienced";

export type OATestCase = {
  input: string;
  expectedOutput: string;
  explanation?: string;
};

export type OAExample = {
  input: string;
  output: string;
  explanation?: string;
};

export type OAMultipleChoiceOption = {
  label: "A" | "B" | "C" | "D";
  text: string;
};

export type OAQuestion = {
  id: string;
  type: OAQuestionType;
  difficulty: OAQuestionDifficulty;
  title: string;
  prompt: string;
  questionText?: string;
  skills: string[];
  roleTags: string[];
  companyStyleTags: OACompanyStyleTag[];
  seniorityTags: OASeniorityTag[];
  timeLimitMinutes: number;
  points: number;
  options?: OAMultipleChoiceOption[];
  correctOption?: OAMultipleChoiceOption["label"];
  expectedAnswer?: string;
  expectedTopics?: string[];
  idealAnswerPoints?: string[];
  examples?: OAExample[];
  edgeCases?: string[];
  expectedComplexity?: string;
  constraints?: string[];
  testCases?: OATestCase[];
  hints?: string[];
};

export type SkillSignal = {
  skill: string;
  source: "resume" | "jd";
  matchedTerms: string[];
};

export type QuestionSelectionContext = {
  resumeText?: string;
  jobDescription?: string;
  targetRole?: string;
  companyStyleTags?: OACompanyStyleTag[];
  preferredTypes?: OAQuestionType[];
  seniority?: OASeniorityTag;
};

export type DifficultyDistribution = Partial<Record<OAQuestionDifficulty, number>>;

export type SelectQuestionsOptions = QuestionSelectionContext & {
  count?: number;
  difficultyDistribution?: DifficultyDistribution;
  excludeQuestionIds?: string[];
  seed?: string;
};

export type SelectedQuestion = OAQuestion & {
  selectionScore: number;
  selectionReasons: string[];
};

export type QuestionSelectionDiagnostics = {
  requestedCount: number;
  selectedCount: number;
  detectedSkills: SkillSignal[];
  normalizedDifficultyDistribution: Record<OAQuestionDifficulty, number>;
  selectedByDifficulty: Record<OAQuestionDifficulty, number>;
  selectedByType: Partial<Record<OAQuestionType, number>>;
  companyStyleTagsUsed: OACompanyStyleTag[];
  fallbackUsed: boolean;
};

export type QuestionSelectionResult = {
  questions: SelectedQuestion[];
  diagnostics: QuestionSelectionDiagnostics;
};
