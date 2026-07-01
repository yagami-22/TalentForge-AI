import "server-only";

import { createHash } from "crypto";

import { prisma } from "@/lib/prisma";
import {
  diffResumeVersionKeywords,
  diffResumeVersionSkills,
  extractResumeVersionKeywords,
  type ResumeVersionSourceType,
} from "@/lib/resume-versioning-client";

type CreateResumeVersionInput = {
  resumeId: string;
  sourceType: ResumeVersionSourceType;
  content: string;
  atsScore?: number | null;
  jobMatchScore?: number | null;
  sourceLabel?: string | null;
  targetLabel?: string | null;
};

type EnsureOriginalResumeVersionInput = {
  resumeId: string;
  content: string | null;
  atsScore?: number | null;
  jobMatchScore?: number | null;
};

function normalizeText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function stableHash(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function normalizedStringSetHash(values: string[]) {
  return stableHash(
    [...new Set(values.map((value) => value.trim().toLowerCase()).filter(Boolean))]
      .sort()
      .join("|")
  );
}

function versionFingerprint({
  contentHash,
  atsScore,
  jobMatchScore,
  keywords,
  skills,
}: {
  contentHash: string;
  atsScore: number | null;
  jobMatchScore: number | null;
  keywords: string[];
  skills: string[];
}) {
  return stableHash(
    JSON.stringify({
      contentHash,
      atsScore,
      jobMatchScore,
      keywords: normalizedStringSetHash(keywords),
      skills: normalizedStringSetHash(skills),
    })
  );
}

export async function createResumeVersion({
  resumeId,
  sourceType,
  content,
  atsScore = null,
  jobMatchScore = null,
  sourceLabel = null,
  targetLabel = null,
}: CreateResumeVersionInput) {
  const normalizedContent = normalizeText(content);

  if (!normalizedContent) {
    return null;
  }

  const latestVersion = await prisma.resumeVersion.findFirst({
    where: { resumeId },
    orderBy: { versionNumber: "desc" },
    select: {
      versionNumber: true,
      id: true,
      sourceLabel: true,
      targetLabel: true,
      contentHash: true,
      content: true,
      atsScore: true,
      jobMatchScore: true,
      addedKeywords: true,
      removedKeywords: true,
      createdAt: true,
    },
  });
  const { addedKeywords, removedKeywords } = latestVersion
    ? diffResumeVersionKeywords(latestVersion.content, normalizedContent)
    : {
        addedKeywords: extractResumeVersionKeywords(normalizedContent),
        removedKeywords: [],
      };
  const contentHash = stableHash(normalizedContent);
  const currentSkills = diffResumeVersionSkills("", normalizedContent).currentSkills;
  const latestFingerprint = latestVersion
    ? versionFingerprint({
        contentHash: latestVersion.contentHash ?? stableHash(latestVersion.content),
        atsScore: latestVersion.atsScore,
        jobMatchScore: latestVersion.jobMatchScore,
        keywords: extractResumeVersionKeywords(latestVersion.content),
        skills: diffResumeVersionSkills("", latestVersion.content).currentSkills.map(
          (skill) => skill.skill
        ),
      })
    : null;
  const nextFingerprint = versionFingerprint({
    contentHash,
    atsScore,
    jobMatchScore,
    keywords: extractResumeVersionKeywords(normalizedContent),
    skills: currentSkills.map((skill) => skill.skill),
  });

  if (latestVersion && latestFingerprint === nextFingerprint) {
    return {
      version: await prisma.resumeVersion.update({
        where: {
          id: latestVersion.id,
        },
        data: {
          sourceLabel: sourceLabel ?? latestVersion.sourceLabel,
          targetLabel: targetLabel ?? latestVersion.targetLabel,
          contentHash: latestVersion.contentHash ?? contentHash,
        },
      }),
      created: false,
      message: "No significant changes detected. Version history not updated.",
    };
  }

  return {
    version: await prisma.resumeVersion.create({
      data: {
        resumeId,
        versionNumber: (latestVersion?.versionNumber ?? 0) + 1,
        sourceType,
        sourceLabel,
        targetLabel,
        contentHash,
        atsScore,
        jobMatchScore,
        addedKeywords,
        removedKeywords,
        content: normalizedContent,
      },
    }),
    created: true,
    message: "Resume version saved.",
  };
}

export async function ensureOriginalResumeVersion({
  resumeId,
  content,
  atsScore = null,
  jobMatchScore = null,
}: EnsureOriginalResumeVersionInput) {
  if (!content || !normalizeText(content)) {
    return null;
  }

  const existingVersion = await prisma.resumeVersion.findFirst({
    where: { resumeId },
    select: { id: true },
  });

  if (existingVersion) {
    return existingVersion;
  }

  return createResumeVersion({
    resumeId,
    sourceType: "original",
    content,
    atsScore,
    jobMatchScore,
  });
}
