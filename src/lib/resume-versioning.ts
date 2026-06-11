import type { ATSOptimizationAnalysis } from "@/lib/ats-optimizer";
import { prisma } from "@/lib/prisma";
import type { ResumeRewriteResult } from "@/lib/resume-rewriter";
import { COMMON_DOMAIN_DEFINITIONS, uniqueValues } from "@/lib/resume-analysis-shared";

export type ResumeVersionSourceType =
  | "original"
  | "ats_optimizer"
  | "resume_rewriter"
  | "manual";

export const RESUME_VERSION_SOURCE_LABELS: Record<ResumeVersionSourceType, string> = {
  original: "Original upload",
  ats_optimizer: "ATS optimizer",
  resume_rewriter: "Resume rewriter",
  manual: "Manual restore",
};

type CreateResumeVersionInput = {
  resumeId: string;
  sourceType: ResumeVersionSourceType;
  content: string;
  atsScore?: number | null;
  jobMatchScore?: number | null;
};

type EnsureOriginalResumeVersionInput = {
  resumeId: string;
  content: string | null;
  atsScore?: number | null;
  jobMatchScore?: number | null;
};

const EXTRA_VERSION_KEYWORDS = [
  "authentication",
  "authorization",
  "dashboard",
  "deployment",
  "database",
  "automation",
  "analytics",
  "machine learning",
  "test automation",
  "software testing",
  "rest api",
  "rest apis",
  "responsive design",
  "role based",
  "role-based",
  "workflow",
  "workflows",
];

function normalizeText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function sentenceCase(value: string) {
  if (!value) return value;

  if (/^(?:api|apis|sql|ui|ux|dsa|oop|ci\/cd)$/i.test(value)) {
    return value.toUpperCase();
  }

  if (/^(?:next\.js|react|typescript|javascript|github|mysql)$/i.test(value)) {
    const canonical: Record<string, string> = {
      "next.js": "Next.js",
      react: "React",
      typescript: "TypeScript",
      javascript: "JavaScript",
      github: "GitHub",
      mysql: "MySQL",
    };

    return canonical[value.toLowerCase()] ?? value;
  }

  return value
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

export function extractResumeVersionKeywords(content: string) {
  const normalized = normalizeText(content).toLowerCase();
  const keywordPool = uniqueValues([
    ...COMMON_DOMAIN_DEFINITIONS.flatMap((domain) => [
      ...domain.keywords,
      ...domain.tools,
      ...domain.responsibilities,
    ]),
    ...EXTRA_VERSION_KEYWORDS,
  ]);

  return uniqueValues(
    keywordPool
      .filter((keyword) => {
        const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

        return new RegExp(`(^|[^a-z0-9+#.])${escaped}([^a-z0-9+#.]|$)`, "i").test(
          normalized
        );
      })
      .map(sentenceCase)
  ).slice(0, 40);
}

export function diffResumeVersionKeywords(previousContent: string, nextContent: string) {
  const previous = extractResumeVersionKeywords(previousContent);
  const next = extractResumeVersionKeywords(nextContent);
  const previousKeys = new Set(previous.map((item) => item.toLowerCase()));
  const nextKeys = new Set(next.map((item) => item.toLowerCase()));

  return {
    addedKeywords: next.filter((item) => !previousKeys.has(item.toLowerCase())),
    removedKeywords: previous.filter((item) => !nextKeys.has(item.toLowerCase())),
  };
}

export async function createResumeVersion({
  resumeId,
  sourceType,
  content,
  atsScore = null,
  jobMatchScore = null,
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
      content: true,
    },
  });
  const { addedKeywords, removedKeywords } = latestVersion
    ? diffResumeVersionKeywords(latestVersion.content, normalizedContent)
    : {
        addedKeywords: extractResumeVersionKeywords(normalizedContent),
        removedKeywords: [],
      };

  return prisma.resumeVersion.create({
    data: {
      resumeId,
      versionNumber: (latestVersion?.versionNumber ?? 0) + 1,
      sourceType,
      atsScore,
      jobMatchScore,
      addedKeywords,
      removedKeywords,
      content: normalizedContent,
    },
  });
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

export function formatATSOptimizedVersionContent(
  resumeText: string,
  analysis: ATSOptimizationAnalysis
) {
  const optimizedBullets = analysis.optimizedBullets
    .map((bullet) => `- ${bullet.improved}`)
    .join("\n");
  const quickWins = analysis.quickWins.map((item) => `- ${item}`).join("\n");
  const missingKeywords = analysis.missingATSKeywords.map((item) => `- ${item}`).join("\n");

  return [
    "ATS Optimized Resume Snapshot",
    "",
    `Target Role: ${analysis.targetRole}`,
    `ATS Score: ${analysis.atsScore}`,
    "",
    "Optimized Bullets",
    optimizedBullets || "- No optimized bullets generated.",
    "",
    "Quick Wins",
    quickWins || "- No quick wins generated.",
    "",
    "Keywords To Add",
    missingKeywords || "- No missing keywords detected.",
    "",
    "Original Resume Text",
    resumeText,
  ]
    .filter(Boolean)
    .join("\n");
}

export function formatResumeRewriteVersionContent(rewrite: ResumeRewriteResult) {
  const education = rewrite.education
    .map((item) =>
      [item.degree, item.institution, item.duration, ...item.details]
        .filter(Boolean)
        .join(" | ")
    )
    .filter(Boolean)
    .map((item) => `- ${item}`)
    .join("\n");
  const experience = rewrite.workExperience
    .flatMap((item) => [
      [item.title, item.organization, item.duration].filter(Boolean).join(" | "),
      ...item.bullets.map((bullet) => `- ${bullet}`),
    ])
    .filter(Boolean)
    .join("\n");
  const projects = rewrite.projects
    .flatMap((project) => [
      [project.title, project.duration].filter(Boolean).join(" | "),
      ...project.bullets.map((bullet) => `- ${bullet}`),
    ])
    .filter(Boolean)
    .join("\n");
  const skills = rewrite.skillsSection.map((skill) => `- ${skill}`).join("\n");
  const portfolio = Object.values(rewrite.portfolio)
    .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
    .map((value) => `- ${value}`)
    .join("\n");

  return [
    "Resume Rewriter Snapshot",
    "",
    "Professional Summary",
    rewrite.professionalSummary,
    "",
    "Education",
    education,
    "",
    "Work Experience",
    experience,
    "",
    "Projects",
    projects,
    "",
    "Technical Skills",
    skills,
    "",
    "Portfolio",
    portfolio,
  ]
    .filter((item) => item !== "")
    .join("\n");
}

export function jsonArrayToStrings(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    : [];
}
