"use server";

import type { ATSOptimizerState } from "@/app/dashboard/resume/ats/state";
import {
  analyzeATSOptimization,
  validateATSJobDescription,
} from "@/lib/ats-optimizer";
import { getCurrentDbUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";

export async function optimizeResumeForATS(
  _prevState: ATSOptimizerState,
  formData: FormData
): Promise<ATSOptimizerState> {
  const user = await getCurrentDbUser();

  if (!user.role) {
    return {
      message: "Complete onboarding before optimizing a resume for ATS.",
      status: "error",
      analysis: null,
    };
  }

  const resumeId = formData.get("resumeId");
  const jobDescription = formData.get("jobDescription");

  if (typeof resumeId !== "string" || !resumeId.trim()) {
    return {
      message: "Choose a resume to optimize.",
      status: "error",
      analysis: null,
    };
  }

  if (typeof jobDescription !== "string") {
    return {
      message: "Please paste a complete job description with responsibilities and requirements.",
      status: "error",
      analysis: null,
    };
  }

  const jdValidation = validateATSJobDescription(jobDescription);

  if (!jdValidation.isValid) {
    return {
      message: jdValidation.reason,
      status: "error",
      analysis: null,
    };
  }

  const resume = await prisma.resume.findFirst({
    where: {
      id: resumeId,
      userId: user.id,
    },
    select: {
      title: true,
      extractedText: true,
    },
  });

  if (!resume) {
    return {
      message: "Resume not found or you do not have permission to use it.",
      status: "error",
      analysis: null,
    };
  }

  if (!resume.extractedText || resume.extractedText.replace(/\s+/g, "").length < 120) {
    return {
      message: "This resume does not have enough readable text for ATS optimization.",
      status: "error",
      analysis: null,
    };
  }

  return {
    message: "ATS optimization report complete.",
    status: "success",
    analysis: analyzeATSOptimization({
      resumeTitle: resume.title,
      resumeText: resume.extractedText,
      jobDescription,
    }),
  };
}
