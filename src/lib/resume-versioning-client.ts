import type { ATSOptimizationAnalysis } from "@/lib/ats-optimizer";
import type { ResumeRewriteResult } from "@/lib/resume-rewriter";
import { COMMON_DOMAIN_DEFINITIONS, uniqueValues } from "@/lib/resume-analysis-shared";

export type ResumeVersionSourceType =
  | "original"
  | "ats_optimizer"
  | "resume_rewriter"
  | "manual";

export type ResumeSkillCategory =
  | "Frontend"
  | "Backend"
  | "Testing"
  | "Architecture"
  | "DevOps"
  | "Databases"
  | "Cloud"
  | "AI/ML";

export type CanonicalResumeSkill = {
  skill: string;
  category: ResumeSkillCategory;
  confidence: number;
};

export const RESUME_VERSION_SOURCE_LABELS: Record<ResumeVersionSourceType, string> = {
  original: "Original upload",
  ats_optimizer: "ATS optimizer",
  resume_rewriter: "Resume rewriter",
  manual: "Manual restore",
};
export const LOCAL_RESUME_HISTORY_KEY = "talentforge.resumeVersions.local";

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

const CANONICAL_SKILLS: Array<{
  skill: string;
  category: ResumeSkillCategory;
  aliases: string[];
  sectionBoost?: RegExp;
}> = [
  {
    skill: "React",
    category: "Frontend",
    aliases: ["react", "react.js", "reactjs"],
    sectionBoost: /\b(?:skills|technical skills|projects|frontend)\b/i,
  },
  {
    skill: "Next.js",
    category: "Frontend",
    aliases: ["next.js", "nextjs", "next js"],
    sectionBoost: /\b(?:skills|technical skills|projects|frontend)\b/i,
  },
  {
    skill: "TypeScript",
    category: "Frontend",
    aliases: ["typescript", "ts"],
    sectionBoost: /\b(?:skills|technical skills|projects|frontend)\b/i,
  },
  {
    skill: "JavaScript",
    category: "Frontend",
    aliases: ["javascript", "java script", "js"],
    sectionBoost: /\b(?:skills|technical skills|projects|frontend)\b/i,
  },
  {
    skill: "REST API",
    category: "Backend",
    aliases: ["rest api", "rest apis", "restful api", "restful apis", "api integration"],
    sectionBoost: /\b(?:skills|technical skills|projects|backend|api)\b/i,
  },
  {
    skill: "Frontend Development",
    category: "Frontend",
    aliases: ["frontend development", "front-end development", "frontend", "front end"],
    sectionBoost: /\b(?:skills|technical skills|projects|frontend)\b/i,
  },
  {
    skill: "Backend Development",
    category: "Backend",
    aliases: ["backend development", "back-end development", "backend", "back end"],
    sectionBoost: /\b(?:skills|technical skills|projects|backend)\b/i,
  },
  {
    skill: "CI/CD",
    category: "DevOps",
    aliases: [
      "ci/cd",
      "continuous integration",
      "continuous delivery",
      "continuous deployment",
      "github actions",
    ],
    sectionBoost: /\b(?:skills|technical skills|projects|devops|deployment)\b/i,
  },
  {
    skill: "Testing",
    category: "Testing",
    aliases: ["testing", "software testing", "test automation", "unit testing", "integration testing"],
    sectionBoost: /\b(?:skills|technical skills|projects|testing)\b/i,
  },
  {
    skill: "System Design",
    category: "Architecture",
    aliases: ["system design", "architecture", "frontend architecture", "software architecture"],
    sectionBoost: /\b(?:skills|technical skills|projects|architecture)\b/i,
  },
  {
    skill: "SQL",
    category: "Databases",
    aliases: ["sql", "mysql", "postgresql", "postgres", "database"],
    sectionBoost: /\b(?:skills|technical skills|projects|database|databases)\b/i,
  },
  {
    skill: "Cloud",
    category: "Cloud",
    aliases: ["cloud", "aws", "azure", "gcp", "vercel", "netlify"],
    sectionBoost: /\b(?:skills|technical skills|projects|cloud|deployment)\b/i,
  },
  {
    skill: "AI/ML",
    category: "AI/ML",
    aliases: ["ai", "ml", "machine learning", "artificial intelligence", "generative ai"],
    sectionBoost: /\b(?:skills|technical skills|projects|machine learning|ai)\b/i,
  },
];

const REMOVED_SKILL_CONFIDENCE_THRESHOLD = 70;

function normalizeText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function resumeContentForKeywordDiff(content: string) {
  return content
    .replace(
      /(?:^|\n)Keywords To Add\n[\s\S]*?(?=\n(?:Original Resume Text|Professional Summary|Education|Work Experience|Projects|Technical Skills|Portfolio|ATS Optimized Resume Snapshot|Resume Rewriter Snapshot)\n|$)/gi,
      "\n"
    )
    .replace(
      /(?:^|\n)(?:Quick Wins|Optimized Bullets)\n[\s\S]*?(?=\n(?:Keywords To Add|Original Resume Text|Professional Summary|Education|Work Experience|Projects|Technical Skills|Portfolio)\n|$)/gi,
      "\n"
    )
    .replace(/(?:^|\n)Target Role:.*(?:\n|$)/gi, "\n")
    .replace(/(?:^|\n)ATS Score:.*(?:\n|$)/gi, "\n");
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function aliasPattern(alias: string) {
  const escaped = escapeRegex(alias).replace(/\\ /g, "\\s+");

  if (/^(?:js|ts|ai|ml)$/i.test(alias)) {
    return new RegExp(`(^|[^a-z0-9+#.])${escaped}([^a-z0-9+#.]|$)`, "i");
  }

  return new RegExp(`(^|[^a-z0-9+#.])${escaped}s?([^a-z0-9+#.]|$)`, "i");
}

export function extractCanonicalResumeSkills(content: string) {
  const semanticContent = resumeContentForKeywordDiff(content);
  const normalized = normalizeText(semanticContent).toLowerCase();

  return CANONICAL_SKILLS.flatMap<CanonicalResumeSkill>((definition) => {
    const matchedAliases = definition.aliases.filter((alias) =>
      aliasPattern(alias).test(normalized)
    );

    if (!matchedAliases.length) return [];

    const explicitNameMatch = definition.aliases
      .slice(0, Math.min(3, definition.aliases.length))
      .some((alias) => aliasPattern(alias).test(normalized));
    const inEvidenceSection = definition.sectionBoost?.test(semanticContent) ?? false;
    const aliasCoverage = Math.min(12, (matchedAliases.length - 1) * 4);
    const confidence = Math.min(
      99,
      78 + (explicitNameMatch ? 10 : 0) + (inEvidenceSection ? 7 : 0) + aliasCoverage
    );

    return [
      {
        skill: definition.skill,
        category: definition.category,
        confidence,
      },
    ];
  }).sort((a, b) => b.confidence - a.confidence || a.skill.localeCompare(b.skill));
}

export function diffResumeVersionSkills(
  previousContent: string,
  nextContent: string,
  confidenceThreshold = REMOVED_SKILL_CONFIDENCE_THRESHOLD
) {
  const previousSkills = extractCanonicalResumeSkills(previousContent);
  const nextSkills = extractCanonicalResumeSkills(nextContent);
  const previousKeys = new Map(previousSkills.map((skill) => [skill.skill.toLowerCase(), skill]));
  const nextKeys = new Map(nextSkills.map((skill) => [skill.skill.toLowerCase(), skill]));

  return {
    previousSkills,
    currentSkills: nextSkills,
    addedSkills: nextSkills.filter((skill) => !previousKeys.has(skill.skill.toLowerCase())),
    removedSkills: previousSkills.filter(
      (skill) =>
        skill.confidence >= confidenceThreshold &&
        !nextKeys.has(skill.skill.toLowerCase())
    ),
  };
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
  const normalized = normalizeText(resumeContentForKeywordDiff(content)).toLowerCase();
  const canonicalSkills = extractCanonicalResumeSkills(content).map((skill) => skill.skill);
  const keywordPool = uniqueValues([
    ...COMMON_DOMAIN_DEFINITIONS.flatMap((domain) => [
      ...domain.keywords,
      ...domain.tools,
      ...domain.responsibilities,
    ]),
    ...EXTRA_VERSION_KEYWORDS,
  ]);

  return uniqueValues([
    ...canonicalSkills,
    ...keywordPool
      .filter((keyword) => {
        const escaped = escapeRegex(keyword);

        return new RegExp(`(^|[^a-z0-9+#.])${escaped}([^a-z0-9+#.]|$)`, "i").test(
          normalized
        );
      })
      .map(sentenceCase),
  ]).slice(0, 40);
}

export function diffResumeVersionKeywords(previousContent: string, nextContent: string) {
  const skillDiff = diffResumeVersionSkills(previousContent, nextContent);
  const previous = extractResumeVersionKeywords(previousContent);
  const next = extractResumeVersionKeywords(nextContent);
  const previousKeys = new Set(previous.map((item) => item.toLowerCase()));
  const nextKeys = new Set(next.map((item) => item.toLowerCase()));
  const removedSkillKeys = new Set(
    skillDiff.removedSkills.map((item) => item.skill.toLowerCase())
  );

  return {
    addedKeywords: uniqueValues([
      ...skillDiff.addedSkills.map((item) => item.skill),
      ...next.filter((item) => !previousKeys.has(item.toLowerCase())),
    ]),
    removedKeywords: previous.filter(
      (item) =>
        !nextKeys.has(item.toLowerCase()) &&
        (!CANONICAL_SKILLS.some(
          (skill) => skill.skill.toLowerCase() === item.toLowerCase()
        ) ||
          removedSkillKeys.has(item.toLowerCase()))
    ),
  };
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

export function inferVersionTargetLabel(jobDescription: string, fallbackRole?: string) {
  const lines = jobDescription
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const companyLine = lines.find((line) =>
    /\b(?:company|organization|employer)\b\s*[:|-]/i.test(line)
  );
  const roleLine = lines.find((line) =>
    /\b(?:job title|title|role|position|hiring for|job)\b\s*[:|-]/i.test(line)
  );
  const company = companyLine
    ?.replace(/\b(?:company|organization|employer)\b\s*[:|-]\s*/i, "")
    .trim();
  const role = roleLine
    ?.replace(/\b(?:job title|title|role|position|hiring for|job)\b\s*[:|-]\s*/i, "")
    .trim();

  return [company, role ?? fallbackRole]
    .filter((value): value is string => Boolean(value && value.trim()))
    .join(" ")
    .replace(/\s+/g, " ")
    .slice(0, 80) || fallbackRole || null;
}

export function readLocalResumeHistory<T>(
  isResumeHistory: (value: unknown) => value is T
) {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(LOCAL_RESUME_HISTORY_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : null;

    return Array.isArray(parsed) ? parsed.filter(isResumeHistory) : [];
  } catch {
    window.localStorage.removeItem(LOCAL_RESUME_HISTORY_KEY);
    return [];
  }
}
