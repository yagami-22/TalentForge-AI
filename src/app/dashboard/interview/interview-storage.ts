import type {
  InterviewAnswer,
  InterviewEvaluation,
  InterviewSession,
} from "@/lib/interview-prep";

export const INTERVIEW_SESSION_STORAGE_KEY = "talentforge.interview.session";
export const INTERVIEW_ANSWERS_STORAGE_KEY = "talentforge.interview.answers";
export const INTERVIEW_EVALUATION_STORAGE_KEY = "talentforge.interview.evaluation";

export type StoredInterviewSession = InterviewSession;
export type StoredInterviewAnswers = InterviewAnswer[];
export type StoredInterviewEvaluation = InterviewEvaluation;
