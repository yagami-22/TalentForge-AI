import type {
  InterviewAnswer,
  InterviewEvaluation,
  InterviewSession,
} from "@/lib/interview-prep";
import type { OAReport } from "@/lib/oa-evaluation";
import type { OAAnswer, OASession } from "@/lib/oa-session";

export const INTERVIEW_SESSION_STORAGE_KEY = "talentforge.interview.session";
export const INTERVIEW_ANSWERS_STORAGE_KEY = "talentforge.interview.answers";
export const INTERVIEW_EVALUATION_STORAGE_KEY = "talentforge.interview.evaluation";
export const OA_SESSION_STORAGE_KEY = "talentforge.oa.session";
export const OA_ANSWERS_STORAGE_KEY = "talentforge.oa.answers";
export const OA_REPORT_STORAGE_KEY = "talentforge.oa.report";
export const INTERVIEW_HISTORY_STORAGE_KEY = "talentforge.interview.history";

export type StoredInterviewSession = InterviewSession;
export type StoredInterviewAnswers = InterviewAnswer[];
export type StoredInterviewEvaluation = InterviewEvaluation;
export type StoredOASession = OASession;
export type StoredOAAnswers = OAAnswer[];
export type StoredOAReport = OAReport;
