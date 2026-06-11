import type {
  InterviewEvaluation,
  InterviewSession,
} from "@/lib/interview-prep";
import type { OASession } from "@/lib/oa-session";

export type InterviewSetupState = {
  message: string;
  status: "idle" | "success" | "error";
  session: InterviewSession | null;
  oaSession?: OASession | null;
};

export type InterviewEvaluationState = {
  message: string;
  status: "idle" | "success" | "error";
  evaluation: InterviewEvaluation | null;
};

export const initialInterviewSetupState: InterviewSetupState = {
  message: "",
  status: "idle",
  session: null,
  oaSession: null,
};

export const initialInterviewEvaluationState: InterviewEvaluationState = {
  message: "",
  status: "idle",
  evaluation: null,
};
