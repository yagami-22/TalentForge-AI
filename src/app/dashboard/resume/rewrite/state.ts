import type { ResumeRewriteResult } from "@/lib/resume-rewriter";

export type ResumeRewriteState = {
  message: string;
  status: "idle" | "success" | "error";
  rewrite: ResumeRewriteResult | null;
};

export const initialResumeRewriteState: ResumeRewriteState = {
  message: "",
  status: "idle",
  rewrite: null,
};
