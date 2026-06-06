"use server";

import type {
  InterviewEvaluationState,
  InterviewSetupState,
} from "@/app/dashboard/interview/state";
import { getCurrentDbUser } from "@/lib/current-user";
import {
  evaluateInterviewSession,
  generateInterviewSession,
  isInterviewMode,
  type InterviewAnswer,
  type InterviewSession,
  validateInterviewJobDescription,
} from "@/lib/interview-prep";
import { prisma } from "@/lib/prisma";

export async function generateMockInterview(
  _prevState: InterviewSetupState,
  formData: FormData
): Promise<InterviewSetupState> {
  const user = await getCurrentDbUser();

  if (!user.role) {
    return {
      message: "Complete onboarding before starting interview practice.",
      status: "error",
      session: null,
    };
  }

  const resumeId = formData.get("resumeId");
  const jobDescription = formData.get("jobDescription");
  const mode = formData.get("mode");

  if (typeof resumeId !== "string" || !resumeId.trim()) {
    return {
      message: "Choose a resume for the mock interview.",
      status: "error",
      session: null,
    };
  }

  if (typeof jobDescription !== "string") {
    return {
      message: "Paste a job description before generating questions.",
      status: "error",
      session: null,
    };
  }

  const jdValidation = validateInterviewJobDescription(jobDescription);

  if (!jdValidation.isValid) {
    return {
      message: jdValidation.reason,
      status: "error",
      session: null,
    };
  }

  if (!isInterviewMode(mode)) {
    return {
      message: "Choose a valid interview mode.",
      status: "error",
      session: null,
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
      session: null,
    };
  }

  if (!resume.extractedText || resume.extractedText.replace(/\s+/g, "").length < 120) {
    return {
      message: "This resume does not have enough readable text for interview practice.",
      status: "error",
      session: null,
    };
  }

  return {
    message: "Mock interview generated.",
    status: "success",
    session: generateInterviewSession({
      resumeId,
      resumeTitle: resume.title,
      resumeText: resume.extractedText,
      jobDescription,
      mode,
    }),
  };
}

export async function evaluateMockInterview(
  _prevState: InterviewEvaluationState,
  formData: FormData
): Promise<InterviewEvaluationState> {
  const user = await getCurrentDbUser();

  if (!user.role) {
    return {
      message: "Complete onboarding before evaluating interview practice.",
      status: "error",
      evaluation: null,
    };
  }

  const sessionJson = formData.get("session");
  const answersJson = formData.get("answers");

  if (typeof sessionJson !== "string" || typeof answersJson !== "string") {
    return {
      message: "Interview session data is missing.",
      status: "error",
      evaluation: null,
    };
  }

  try {
    const session = JSON.parse(sessionJson) as InterviewSession;
    const answers = JSON.parse(answersJson) as InterviewAnswer[];

    if (!session.resumeId || !Array.isArray(session.questions) || !Array.isArray(answers)) {
      return {
        message: "Interview session data is invalid.",
        status: "error",
        evaluation: null,
      };
    }

    const resume = await prisma.resume.findFirst({
      where: {
        id: session.resumeId,
        userId: user.id,
      },
      select: {
        id: true,
      },
    });

    if (!resume) {
      return {
        message: "Resume not found or you do not have permission to evaluate this session.",
        status: "error",
        evaluation: null,
      };
    }

    return {
      message: "Interview evaluation complete.",
      status: "success",
      evaluation: evaluateInterviewSession(session, answers),
    };
  } catch (error) {
    console.error("Mock interview evaluation failed", error);

    return {
      message: "Could not evaluate this interview session.",
      status: "error",
      evaluation: null,
    };
  }
}
