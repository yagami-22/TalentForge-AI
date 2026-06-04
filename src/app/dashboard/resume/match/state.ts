import type { JobDescriptionMatchAnalysis } from "@/lib/jd-match-analyzer";

export type MatchResumeState = {
  message: string;
  status: "idle" | "success" | "error";
  analysis: JobDescriptionMatchAnalysis | null;
};

export const initialMatchResumeState: MatchResumeState = {
  message: "",
  status: "idle",
  analysis: null,
};
