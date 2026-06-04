"use server";

import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

import { revalidatePath } from "next/cache";

import type { UploadResumeState } from "@/app/dashboard/resume/state";
import { analyzeResumeForAts } from "@/lib/ats-analysis";
import { getCurrentDbUser } from "@/lib/current-user";
import { extractPdfText } from "@/lib/pdf-text";
import { prisma } from "@/lib/prisma";

const MAX_FILE_SIZE = 8 * 1024 * 1024;
const UPLOAD_ROOT = path.join(process.cwd(), "public", "uploads", "resumes");

function sanitizeFileName(fileName: string) {
  return fileName
    .replace(/\.pdf$/i, "")
    .replace(/[^a-zA-Z0-9-_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
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

  try {
    extractedText = await extractPdfText(buffer);
  } catch {
    return {
      message:
        "We could not read text from this PDF. Try exporting it as a text-based PDF and upload again.",
      status: "error",
    };
  }

  if (!extractedText) {
    return {
      message:
        "We could not find readable text in this PDF. Scanned image PDFs are not supported yet.",
      status: "error",
    };
  }

  const atsAnalysis = analyzeResumeForAts(extractedText);

  await mkdir(userUploadDir, { recursive: true });
  await writeFile(storedPath, buffer);

  await prisma.resume.create({
    data: {
      title,
      fileUrl,
      extractedText,
      atsScore: atsAnalysis.score,
      atsIssues: atsAnalysis.issues,
      atsSuggestions: atsAnalysis.suggestions,
      userId: user.id,
    },
  });

  revalidatePath("/dashboard/resume");

  return {
    message: `Resume uploaded and analyzed. ATS score: ${atsAnalysis.score}.`,
    status: "success",
  };
}
