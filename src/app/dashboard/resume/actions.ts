"use server";

import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

import { revalidatePath } from "next/cache";

import type { UploadResumeState } from "@/app/dashboard/resume/state";
import { getCurrentDbUser } from "@/lib/current-user";
import { extractPdfText } from "@/lib/pdf-text";
import { prisma } from "@/lib/prisma";
import { analyzeResume } from "@/lib/resume-analyzer";

const MAX_FILE_SIZE = 8 * 1024 * 1024;
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

  const isPdf =
    file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

  if (!isPdf) {
    return {
      message: "Only PDF resumes are supported.",
      status: "error",
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      message: "Resume uploads must be 8 MB or smaller.",
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
  const buffer = Buffer.from(await file.arrayBuffer());
  let extractedText = "";
  let extractionSource = "";

  try {
    const extraction = await extractPdfText(buffer);
    extractedText = extraction.text;
    extractionSource = extraction.source;
  } catch (error) {
    const errorMessage = getErrorMessage(error);

    if (isDevelopment) {
      console.error("[resume-upload] PDF extraction failed", {
        fileSize: buffer.length,
        error: errorMessage,
      });
    }

    return {
      message: isDevelopment
        ? `We could not read this PDF: ${errorMessage}`
        : "We could not read this PDF. Try uploading a clearer PDF or exporting it again.",
      status: "error",
    };
  }

  if (isDevelopment) {
    console.log("[resume-upload] PDF extraction result", {
      fileSize: buffer.length,
      extractedTextLength: extractedText.length,
      extractionSource,
    });
  }

  if (!extractedText) {
    return {
      message:
        "We could not find readable text in this PDF. Try exporting it as a text-based PDF and upload again.",
      status: "error",
    };
  }

  const atsAnalysis = analyzeResume(extractedText);

  if (isDevelopment) {
    console.log("[resume-upload] Resume Analyzer v3 result", {
      overallScore: atsAnalysis.overallScore,
      grade: atsAnalysis.grade,
      hiringReadiness: atsAnalysis.hiringReadiness,
      detectedProfileType: atsAnalysis.detectedProfileType,
      detectedSeniority: atsAnalysis.detectedSeniority,
      categoryScores: atsAnalysis.categoryScores.map((category) => ({
        name: category.name,
        score: category.score,
        maxScore: category.maxScore,
        evidenceFound: category.evidenceFound,
        missingEvidence: category.missingEvidence,
      })),
      redFlags: atsAnalysis.redFlags,
    });
  }

  await mkdir(userUploadDir, { recursive: true });
  await writeFile(storedPath, buffer);

  await prisma.resume.create({
    data: {
      title,
      fileUrl,
      extractedText,
      extractionSource,
      atsScore: atsAnalysis.overallScore,
      atsAnalysis,
      atsIssues: atsAnalysis.topIssues,
      atsSuggestions: atsAnalysis.quickWins,
      userId: user.id,
    },
  });

  revalidatePath("/dashboard/resume");

  return {
    message: `Resume uploaded and analyzed from ${extractionSource}. ATS score: ${atsAnalysis.overallScore}.`,
    status: "success",
  };
}
