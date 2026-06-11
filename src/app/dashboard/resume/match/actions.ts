"use server";

import { revalidatePath } from "next/cache";

import type { MatchResumeState } from "@/app/dashboard/resume/match/state";
import { getCurrentDbUser } from "@/lib/current-user";
import {
  analyzeJobDescriptionMatch,
  validateJobDescription,
} from "@/lib/jd-match-analyzer";
import { prisma } from "@/lib/prisma";
import { ensureOriginalResumeVersion } from "@/lib/resume-versioning";

export async function analyzeResumeMatch(
  _prevState: MatchResumeState,
  formData: FormData
): Promise<MatchResumeState> {
  const user = await getCurrentDbUser();

  if (!user.role) {
    return {
      message: "Complete onboarding before analyzing a JD match.",
      status: "error",
      analysis: null,
    };
  }

  const resumeId = formData.get("resumeId");
  const jobDescription = formData.get("jobDescription");

  if (typeof resumeId !== "string" || !resumeId.trim()) {
    return {
      message: "Choose a resume to match.",
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

  const jdValidation = validateJobDescription(jobDescription);

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
      id: true,
      title: true,
      extractedText: true,
      atsScore: true,
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
      message: "This resume does not have enough readable text for JD matching.",
      status: "error",
      analysis: null,
    };
  }

  const analysis = analyzeJobDescriptionMatch({
    resumeTitle: resume.title,
    resumeText: resume.extractedText,
    jobDescription,
  });
  const latestVersion = await prisma.resumeVersion.findFirst({
    where: { resumeId: resume.id },
    orderBy: { versionNumber: "desc" },
    select: { id: true },
  });

  await prisma.resume.update({
    where: { id: resume.id },
    data: {
      matchScore: analysis.matchScore,
    },
  });

  if (latestVersion) {
    await prisma.resumeVersion.update({
      where: { id: latestVersion.id },
      data: {
        jobMatchScore: analysis.matchScore,
      },
    });
  } else {
    await ensureOriginalResumeVersion({
      resumeId: resume.id,
      content: resume.extractedText,
      atsScore: resume.atsScore,
      jobMatchScore: analysis.matchScore,
    });
  }

  revalidatePath("/dashboard/resume/history");

  return {
    message: "JD match analysis complete.",
    status: "success",
    analysis,
  };
}
