import type { ATSOptimizationAnalysis } from "@/lib/ats-optimizer";

export type ATSOptimizerState = {
  message: string;
  status: "idle" | "success" | "error";
  analysis: ATSOptimizationAnalysis | null;
};

export const initialATSOptimizerState: ATSOptimizerState = {
  message: "",
  status: "idle",
  analysis: null,
};
