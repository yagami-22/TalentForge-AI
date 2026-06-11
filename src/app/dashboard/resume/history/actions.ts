"use server";

import { revalidatePath } from "next/cache";

import { getCurrentDbUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { analyzeResume } from "@/lib/resume-analyzer";
import { createResumeVersion } from "@/lib/resume-versioning";

export type RestoreResumeVersionState = {
  message: string;
  status: "idle" | "success" | "error";
};

export const initialRestoreResumeVersionState: RestoreResumeVersionState = {
  message: "",
  status: "idle",
};

export async function restoreResumeVersion(
  _prevState: RestoreResumeVersionState,
  formData: FormData
): Promise<RestoreResumeVersionState> {
  const user = await getCurrentDbUser();

  if (!user.role) {
    return {
      message: "Complete onboarding before restoring a resume version.",
      status: "error",
    };
  }

  const versionId = formData.get("versionId");

  if (typeof versionId !== "string" || !versionId.trim()) {
    return {
      message: "Version id is missing.",
      status: "error",
    };
  }

  const version = await prisma.resumeVersion.findFirst({
    where: {
      id: versionId,
      resume: {
        userId: user.id,
      },
    },
    include: {
      resume: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });

  if (!version) {
    return {
      message: "Version not found or you do not have permission to restore it.",
      status: "error",
    };
  }

  const hasReadableContent = version.content.replace(/\s+/g, "").length >= 120;
  const analysis = hasReadableContent ? analyzeResume(version.content) : null;

  await prisma.resume.update({
    where: {
      id: version.resumeId,
    },
    data: {
      extractedText: version.content,
      atsScore: analysis?.overallScore ?? version.atsScore,
      atsAnalysis: analysis ?? undefined,
      atsIssues: analysis?.topIssues ?? undefined,
      atsSuggestions: analysis?.quickWins ?? undefined,
      matchScore: version.jobMatchScore,
    },
  });

  await createResumeVersion({
    resumeId: version.resumeId,
    sourceType: "manual",
    content: version.content,
    atsScore: analysis?.overallScore ?? version.atsScore,
    jobMatchScore: version.jobMatchScore,
  });

  revalidatePath("/dashboard/resume");
  revalidatePath("/dashboard/resume/history");

  return {
    message: `${version.resume.title} restored from Version ${version.versionNumber}.`,
    status: "success",
  };
}
