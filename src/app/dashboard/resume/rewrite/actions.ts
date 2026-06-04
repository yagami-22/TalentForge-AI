"use server";

import type { ResumeRewriteState } from "@/app/dashboard/resume/rewrite/state";
import { getCurrentDbUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import {
  generateResumeRewriteForJD,
  validateResumeRewriteJobDescription,
} from "@/lib/resume-rewriter";

export async function rewriteResumeForJD(
  _prevState: ResumeRewriteState,
  formData: FormData
): Promise<ResumeRewriteState> {
  try {
    const user = await getCurrentDbUser();

    if (!user.role) {
      return {
        message: "Complete onboarding before rewriting a resume.",
        status: "error",
        rewrite: null,
      };
    }

    const resumeId = formData.get("resumeId");
    const jobDescription = formData.get("jobDescription");

    if (typeof resumeId !== "string" || !resumeId.trim()) {
      return {
        message: "Choose a resume to rewrite.",
        status: "error",
        rewrite: null,
      };
    }

    if (typeof jobDescription !== "string") {
      return {
        message: "Please paste a job description before generating a rewrite.",
        status: "error",
        rewrite: null,
      };
    }

    const jdValidation = validateResumeRewriteJobDescription(jobDescription);

    if (!jdValidation.isValid) {
      return {
        message: jdValidation.reason,
        status: "error",
        rewrite: null,
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
        rewrite: null,
      };
    }

    if (!resume.extractedText || resume.extractedText.replace(/\s+/g, "").length < 120) {
      return {
        message: "This resume does not have enough readable text for rewriting.",
        status: "error",
        rewrite: null,
      };
    }

    return {
      message: "Resume rewrite generated.",
      status: "success",
      rewrite: generateResumeRewriteForJD({
        resumeTitle: resume.title,
        resumeText: resume.extractedText,
        jobDescription,
      }),
    };
  } catch (error) {
    console.error("Resume rewrite generation failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });

    return {
      message: "We could not generate the resume rewrite. Please try again.",
      status: "error",
      rewrite: null,
    };
  }
}
