import { analyzeATSOptimization } from "@/lib/ats-optimizer";

export type ResumeRewriteResult = {
  professionalSummary: string;
  experienceBullets: string[];
  skillsSection: string[];
  atsKeywords: string[];
  missingSkills: string[];
};

type ResumeRewriteInput = {
  resumeTitle: string;
  resumeText: string;
  jobDescription: string;
};

export type ResumeRewriteValidation = {
  isValid: boolean;
  reason: string;
};

const ACTION_VERBS = [
  "built",
  "developed",
  "implemented",
  "designed",
  "optimized",
  "integrated",
  "created",
  "analyzed",
  "managed",
  "automated",
  "collaborated",
  "delivered",
  "improved",
  "tested",
  "documented",
];

const SKILL_SPLIT_REGEX = /[,|;•]/;

function normalize(text: string) {
  return text.replace(/\s+/g, " ").trim();
}

function unique(items: string[]) {
  const seen = new Set<string>();

  return items
    .map((item) => normalize(item))
    .filter(Boolean)
    .filter((item) => {
      const key = item.toLowerCase();

      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function getLines(text: string) {
  return text
    .split(/\r?\n/)
    .map((line) =>
      line
        .replace(/[–—]/g, "-")
        .replace(/^[•*]\s*/, "- ")
        .replace(/\s+/g, " ")
        .trim()
    )
    .filter(Boolean);
}

function isSectionHeading(line: string) {
  return /^(?:summary|professional summary|profile|objective|skills|technical skills|core skills|projects|experience|work experience|professional experience|internships?|education|certifications|achievements|leadership)\s*:?$/i.test(
    line
  );
}

function extractSection(text: string, names: string[], limit = 18) {
  const lines = getLines(text);
  const start = lines.findIndex((line) =>
    names.some((name) => new RegExp(`^${name}\\s*:?$`, "i").test(line))
  );

  if (start === -1) return "";

  const sectionLines: string[] = [];

  for (const line of lines.slice(start + 1, start + limit + 1)) {
    if (isSectionHeading(line)) break;
    sectionLines.push(line);
  }

  return sectionLines.join("\n");
}

function extractResumeSkills(text: string) {
  const skillsSection = extractSection(text, [
    "skills",
    "technical skills",
    "core skills",
  ]);
  const source = skillsSection || text;

  return unique(
    source
      .split(SKILL_SPLIT_REGEX)
      .map((item) => item.replace(/^[\-–]\s*/, "").trim())
      .filter((item) => item.length >= 2 && item.length <= 40)
      .filter((item) => !/\b(?:education|projects|experience|summary)\b/i.test(item))
  ).slice(0, 24);
}

function extractBulletCandidates(text: string) {
  const lines = getLines(text);
  let currentSection = "";

  return lines
    .flatMap((rawLine) => {
      if (isSectionHeading(rawLine)) {
        currentSection = rawLine.toLowerCase();
        return [];
      }

      const line = rawLine.replace(/^[\-–]\s*/, "").trim();
      const isPrioritySection = /\b(?:project|experience|internship|work|professional)\b/i.test(
        currentSection
      );

      if (
        line.length < 24 ||
        line.length > 220 ||
        /\b(?:cgpa|class x|class xii|percentage|github|linkedin|leetcode)\b/i.test(line)
      ) {
        return [];
      }

      if (
        isPrioritySection ||
        ACTION_VERBS.some((verb) => new RegExp(`\\b${verb}\\b`, "i").test(line)) ||
        /\b(?:workflow|database|dashboard|campaign|analysis|research|client|user|api|design|system|platform)\b/i.test(
          line
        )
      ) {
        return [line];
      }

      return [];
    })
    .slice(0, 10);
}

function pickKeywordContext(keywords: string[]) {
  const selected = unique(keywords).slice(0, 4);

  if (!selected.length) return "";
  if (selected.length === 1) return selected[0];

  return `${selected.slice(0, -1).join(", ")} and ${selected.at(-1)}`;
}

function startsWithActionVerb(line: string) {
  return ACTION_VERBS.some((verb) => new RegExp(`^${verb}\\b`, "i").test(line));
}

function rewriteBullet(line: string, keywordContext: string) {
  const cleaned = line.replace(/\s+/g, " ").replace(/[.;]\s*$/, "").trim();
  const base = startsWithActionVerb(cleaned)
    ? cleaned.replace(/^[A-Z]/, (letter) => letter.toUpperCase())
    : `Developed ${cleaned.replace(/^[A-Z]/, (letter) => letter.toLowerCase())}`;

  if (!keywordContext) {
    return `${base}.`;
  }

  if (new RegExp(keywordContext.split(/\s+|,/).filter(Boolean)[0] ?? "$^", "i").test(base)) {
    return `${base}.`;
  }

  return `${base}, aligning the work with ${keywordContext} expectations.`;
}

function buildProfessionalSummary(
  resumeTitle: string,
  targetRole: string,
  matchedKeywords: string[],
  resumeSkills: string[],
  fallbackBullets: string[]
) {
  const truthfulKeywords = unique([...matchedKeywords, ...resumeSkills]).slice(0, 6);
  const keywordText = pickKeywordContext(truthfulKeywords);
  const evidenceText =
    fallbackBullets[0]?.replace(/[.;]\s*$/, "") ??
    "resume-backed project and practical work";

  if (keywordText) {
    return `${resumeTitle} is positioned for ${targetRole} roles with resume-backed evidence in ${keywordText}. Brings hands-on experience through ${evidenceText}, with emphasis on clear execution, relevant tools, and job-aligned problem solving.`;
  }

  return `${resumeTitle} is positioned for ${targetRole} roles with resume-backed project and practical work. Brings hands-on execution, clear documentation, and adaptable problem solving without adding unsupported claims.`;
}

export function validateResumeRewriteJobDescription(
  text: string
): ResumeRewriteValidation {
  const normalized = normalize(text);

  if (normalized.length < 50) {
    return {
      isValid: false,
      reason: "Please paste a job description of at least 50 characters.",
    };
  }

  return { isValid: true, reason: "Job description accepted." };
}

export function generateResumeRewriteForJD({
  resumeTitle,
  resumeText,
  jobDescription,
}: ResumeRewriteInput): ResumeRewriteResult {
  const atsAnalysis = analyzeATSOptimization({
    resumeTitle,
    resumeText,
    jobDescription,
  });
  const resumeSkills = extractResumeSkills(resumeText);
  const bulletCandidates = extractBulletCandidates(resumeText);
  const matchedKeywords = unique([
    ...atsAnalysis.matchedATSKeywords,
    ...resumeSkills.filter((skill) =>
      new RegExp(`(^|[^a-z0-9+#.])${skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^a-z0-9+#.]|$)`, "i").test(
        jobDescription
      )
    ),
  ]);
  const missingSkills = unique(atsAnalysis.missingATSKeywords).slice(0, 12);
  const keywordContext = pickKeywordContext(matchedKeywords);
  const atsOptimizedBullets = atsAnalysis.optimizedBullets.map((item) => item.improved);
  const rewrittenBullets = unique([
    ...atsOptimizedBullets,
    ...bulletCandidates.map((line) => rewriteBullet(line, keywordContext)),
  ]).slice(0, 8);
  const skillsSection = unique([...matchedKeywords, ...resumeSkills]).slice(0, 18);
  const atsKeywords = unique([
    ...matchedKeywords,
    ...missingSkills,
    ...atsAnalysis.missingATSKeywords,
  ]).slice(0, 18);

  return {
    professionalSummary: buildProfessionalSummary(
      resumeTitle,
      atsAnalysis.targetRole,
      matchedKeywords,
      resumeSkills,
      bulletCandidates
    ),
    experienceBullets: rewrittenBullets.length
      ? rewrittenBullets
      : [
          "Add resume-backed project, internship, leadership, or work bullets that mirror the job description without inventing unsupported experience.",
        ],
    skillsSection: skillsSection.length
      ? skillsSection
      : ["Add a focused skills section using tools and methods you can support with resume evidence."],
    atsKeywords,
    missingSkills,
  };
}
