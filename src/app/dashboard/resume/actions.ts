"use server";

import { createHash, randomUUID } from "crypto";
import { mkdir, readFile, unlink, writeFile } from "fs/promises";
import path from "path";

import { revalidatePath } from "next/cache";

import type {
  DeleteResumeState,
  ReanalyzeResumeState,
  UploadResumeState,
} from "@/app/dashboard/resume/state";
import { getCurrentDbUser } from "@/lib/current-user";
import { extractPdfText } from "@/lib/pdf-text";
import { prisma } from "@/lib/prisma";
import { analyzeResume } from "@/lib/resume-analyzer";
import {
  validateResumeFile,
  validateResumeText,
} from "@/lib/resume-validation";
import { createResumeVersion } from "@/lib/resume-versioning-server";

const UPLOAD_ROOT = path.join(process.cwd(), "public", "uploads", "resumes");
const isDevelopment = process.env.NODE_ENV !== "production";

function sanitizeFileName(fileName: string) {
  return fileName
    .replace(/\.pdf$/i, "")
    .replace(/[^a-zA-Z0-9-_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown PDF extraction error";
}

function hashBuffer(buffer: Buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

function getSafeStoredResumePath(fileUrl: string | null, userId: string) {
  if (!fileUrl || !fileUrl.startsWith(`/uploads/resumes/${userId}/`)) {
    return null;
  }

  const relativePath = fileUrl.replace(/^\/+/, "");
  const storedPath = path.resolve(process.cwd(), "public", relativePath);
  const userUploadRoot = path.resolve(UPLOAD_ROOT, userId);

  if (
    storedPath !== userUploadRoot &&
    !storedPath.startsWith(`${userUploadRoot}${path.sep}`)
  ) {
    return null;
  }

  return storedPath;
}

async function findDuplicateResumeForUser(userId: string, fileHash: string) {
  const existingHashedResume = await prisma.resume.findFirst({
    where: {
      userId,
      fileHash,
    },
    select: {
      id: true,
    },
  });

  if (existingHashedResume) {
    return existingHashedResume;
  }

  const legacyResumes = await prisma.resume.findMany({
    where: {
      userId,
      fileHash: null,
      fileUrl: {
        not: null,
      },
    },
    select: {
      id: true,
      fileUrl: true,
    },
  });

  for (const resume of legacyResumes) {
    const storedPath = getSafeStoredResumePath(resume.fileUrl, userId);

    if (!storedPath) continue;

    try {
      const existingBuffer = await readFile(storedPath);
      const existingHash = hashBuffer(existingBuffer);

      await prisma.resume.update({
        where: {
          id: resume.id,
        },
        data: {
          fileHash: existingHash,
        },
      });

      if (existingHash === fileHash) {
        return { id: resume.id };
      }
    } catch {
      continue;
    }
  }

  return null;
}

export async function uploadResume(
  _prevState: UploadResumeState,
  formData: FormData
): Promise<UploadResumeState> {
  const user = await getCurrentDbUser();

  if (!user.role) {
    return {
      message: "Complete onboarding before uploading a resume.",
      status: "error",
    };
  }

  const file = formData.get("resume");

  if (!(file instanceof File) || file.size === 0) {
    return {
      message: "Choose a PDF resume to upload.",
      status: "error",
    };
  }

  const fileValidation = validateResumeFile(file);

  if (!fileValidation.isValid) {
    return {
      message: fileValidation.reason,
      status: "error",
    };
  }

  const rawTitle = formData.get("title");
  const title =
    typeof rawTitle === "string" && rawTitle.trim()
      ? rawTitle.trim().slice(0, 120)
      : file.name.replace(/\.pdf$/i, "").slice(0, 120);

  const userUploadDir = path.join(UPLOAD_ROOT, user.id);
  const safeName = sanitizeFileName(file.name) || "resume";
  const storedFileName = `${randomUUID()}-${safeName}.pdf`;
  const storedPath = path.join(userUploadDir, storedFileName);
  const fileUrl = `/uploads/resumes/${user.id}/${storedFileName}`;
  const storedFileUrl = isDevelopment ? fileUrl : null;
  const buffer = Buffer.from(await file.arrayBuffer());
  const fileHash = hashBuffer(buffer);
  let extractedText = "";
  let extractionSource = "";

  const existingResume = await findDuplicateResumeForUser(user.id, fileHash);

  if (existingResume) {
    return {
      message: "This resume has already been uploaded.",
      status: "error",
    };
  }

  try {
    const extraction = await extractPdfText(buffer);
    extractedText = extraction.text;
    extractionSource = extraction.source;
  } catch (error) {
    const errorMessage = getErrorMessage(error);

    return {
      message: isDevelopment
        ? `We could not read this PDF: ${errorMessage}`
        : "We could not read this PDF. It may be password-protected or corrupted. Please upload a text-based resume PDF.",
      status: "error",
    };
  }

  if (!extractedText) {
    return {
      message:
        "This PDF does not contain enough readable text. It may be scanned or image-based. Please upload a text-based PDF resume.",
      status: "error",
    };
  }

  const validation = validateResumeText(extractedText);

  if (!validation.isValid) {
    return {
      message: validation.reason,
      status: "error",
    };
  }

  const atsAnalysis = analyzeResume(extractedText);

  if (isDevelopment) {
    await mkdir(userUploadDir, { recursive: true });
    await writeFile(storedPath, buffer);
  }

  const createdResume = await prisma.resume.create({
    data: {
      title,
      fileUrl: storedFileUrl,
      extractedText,
      extractionSource,
      fileHash,
      atsScore: atsAnalysis.overallScore,
      atsAnalysis,
      atsIssues: atsAnalysis.topIssues,
      atsSuggestions: atsAnalysis.quickWins,
      userId: user.id,
    },
  });

  await createResumeVersion({
    resumeId: createdResume.id,
    sourceType: "original",
    content: extractedText,
    atsScore: atsAnalysis.overallScore,
    jobMatchScore: null,
  });

  revalidatePath("/dashboard/resume");
  revalidatePath("/dashboard/resume/history");

  return {
    message: `Resume uploaded and analyzed from ${extractionSource}. ATS score: ${atsAnalysis.overallScore}.`,
    status: "success",
    warning: validation.warnings[0],
  };
}

export async function deleteResume(
  _prevState: DeleteResumeState,
  formData: FormData
): Promise<DeleteResumeState> {
  const user = await getCurrentDbUser();

  if (!user.role) {
    return {
      message: "Complete onboarding before deleting a resume.",
      status: "error",
    };
  }

  const resumeId = formData.get("resumeId");

  if (typeof resumeId !== "string" || !resumeId.trim()) {
    return {
      message: "Resume id is missing.",
      status: "error",
    };
  }

  const resume = await prisma.resume.findFirst({
    where: {
      id: resumeId,
      userId: user.id,
    },
    select: {
      id: true,
      fileUrl: true,
      title: true,
    },
  });

  if (!resume) {
    return {
      message: "Resume not found or you do not have permission to delete it.",
      status: "error",
    };
  }

  const storedPath = getSafeStoredResumePath(resume.fileUrl, user.id);

  if (storedPath) {
    try {
      await unlink(storedPath);
    } catch (error) {
      const isMissingFile =
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "ENOENT";

      if (!isMissingFile) {
        return {
          message: "We could not delete the uploaded PDF. Try again.",
          status: "error",
        };
      }
    }
  }

  await prisma.resume.delete({
    where: {
      id: resume.id,
    },
  });

  revalidatePath("/dashboard/resume");
  revalidatePath("/dashboard/resume/history");

  return {
    message: `${resume.title} deleted.`,
    status: "success",
  };
}

export async function reanalyzeResume(
  _prevState: ReanalyzeResumeState,
  formData: FormData
): Promise<ReanalyzeResumeState> {
  const user = await getCurrentDbUser();

  if (!user.role) {
    return {
      message: "Complete onboarding before re-analyzing a resume.",
      status: "error",
    };
  }

  const resumeId = formData.get("resumeId");

  if (typeof resumeId !== "string" || !resumeId.trim()) {
    return {
      message: "Resume id is missing.",
      status: "error",
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
    },
  });

  if (!resume) {
    return {
      message: "Resume not found or you do not have permission to re-analyze it.",
      status: "error",
    };
  }

  if (!resume.extractedText || resume.extractedText.replace(/\s+/g, "").length < 120) {
    return {
      message: "This resume does not have enough readable text to re-analyze.",
      status: "error",
    };
  }

  const atsAnalysis = analyzeResume(resume.extractedText);

  await prisma.resume.update({
    where: {
      id: resume.id,
    },
    data: {
      atsScore: atsAnalysis.overallScore,
      atsAnalysis,
      atsIssues: atsAnalysis.topIssues,
      atsSuggestions: atsAnalysis.quickWins,
    },
  });

  revalidatePath("/dashboard/resume");
  revalidatePath("/dashboard/resume/history");

  return {
    message: `${resume.title} re-analyzed. Updated score: ${atsAnalysis.overallScore}.`,
    status: "success",
  };
}
