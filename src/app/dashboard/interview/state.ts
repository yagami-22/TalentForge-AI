import type {
  InterviewEvaluation,
  InterviewSession,
} from "@/lib/interview-prep";

export type InterviewSetupState = {
  message: string;
  status: "idle" | "success" | "error";
  session: InterviewSession | null;
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
};

export const initialInterviewEvaluationState: InterviewEvaluationState = {
  message: "",
  status: "idle",
  evaluation: null,
};
