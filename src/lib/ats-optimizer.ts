import {
  COMMON_DOMAIN_DEFINITIONS as DOMAIN_DEFINITIONS,
  COMMON_GENERIC_TERMS as GENERIC_TERMS,
  type SharedDomainDefinition as DomainDefinition,
  countTermMatches as countMatches,
  getTextLines as getLines,
  normalizeText as normalize,
  scoreRatio,
  uniqueValues as unique,
} from "@/lib/resume-analysis-shared";

export type ATSWarningSeverity = "Low" | "Medium" | "High";

export type ATSOptimizationAnalysis = {
  atsScore: number;
  keywordCoverage: number;
  resumeTitle: string;
  targetRole: string;
  detectedDomain: string;
  summary: string;
  missingATSKeywords: string[];
  matchedATSKeywords: string[];
  weakBullets: string[];
  optimizedBullets: {
    original: string;
    improved: string;
    reason: string;
  }[];
  atsWarnings: {
    warning: string;
    severity: ATSWarningSeverity;
    fix: string;
  }[];
  strengths: string[];
  quickWins: string[];
  categoryScores: {
    name: string;
    score: number;
    maxScore: number;
    reason: string;
  }[];
};

export type ATSJobDescriptionValidation = {
  isValid: boolean;
  reason: string;
};

type ParsedATSJobDescription = {
  targetRole: string;
  domain: DomainDefinition;
  requiredKeywords: string[];
  preferredKeywords: string[];
  tools: string[];
  skills: string[];
  responsibilities: string[];
  allKeywords: string[];
};

const FRONTEND_REQUIRED_KEYWORDS = [
  "react",
  "next.js",
  "typescript",
  "javascript",
  "rest api",
  "rest apis",
  "responsive design",
  "accessibility",
  "performance optimization",
  "reusable ui components",
];

const FRONTEND_PREFERRED_KEYWORDS = [
  "docker",
  "ci/cd",
  "ci cd",
  "testing frameworks",
  "jest",
  "cypress",
  "cloud platforms",
  "cloud",
  "aws",
  "vercel",
];

const ACTION_VERBS = [
  "built",
  "developed",
  "implemented",
  "designed",
  "analyzed",
  "optimized",
  "managed",
  "launched",
  "created",
  "improved",
  "automated",
  "led",
  "delivered",
  "researched",
  "coordinated",
  "executed",
  "modeled",
  "reported",
];

const IMPACT_TERMS = [
  "increased",
  "reduced",
  "improved",
  "saved",
  "grew",
  "revenue",
  "users",
  "customers",
  "accuracy",
  "conversion",
  "engagement",
  "cost",
  "time",
  "efficiency",
  "rank",
  "award",
  "published",
  "certified",
];

function isGenericKeyword(term: string) {
  return GENERIC_TERMS.includes(term.toLowerCase());
}

function isSeniorFrontendJob(text: string) {
  return (
    /\bfrontend\b/i.test(text) &&
    /\b(?:senior|3\+?\s*years|3\s+years|lead)\b/i.test(text)
  );
}

export function validateATSJobDescription(text: string): ATSJobDescriptionValidation {
  const normalized = normalize(text);
  const meaningfulCharacters = normalized.replace(/[^a-zA-Z0-9\s.,:;()/-]/g, "").length;
  const jdSignals = countMatches(normalized, [
    "responsibilities",
    "requirements",
    "qualifications",
    "required",
    "must have",
    "preferred",
    "experience",
    "skills",
    "role",
    "job description",
    "what you will do",
  ]);

  if (meaningfulCharacters < 200 || jdSignals.length < 2) {
    return {
      isValid: false,
      reason: "Please paste a complete job description with responsibilities and requirements.",
    };
  }

  return { isValid: true, reason: "Job description accepted." };
}

function detectDomain(text: string) {
  const ranked = DOMAIN_DEFINITIONS.map((domain) => ({
    domain,
    score:
      countMatches(text, domain.keywords).length * 2 +
      countMatches(text, domain.tools).length +
      countMatches(text, domain.responsibilities).length,
  })).sort((a, b) => b.score - a.score);

  return ranked[0]?.score ? ranked[0].domain : DOMAIN_DEFINITIONS.at(-1)!;
}

function detectTargetRole(text: string, domain: DomainDefinition) {
  const lines = getLines(text);
  const roleLine =
    lines.find((line) =>
      /\b(?:job title|title|role|position|hiring for|job)\b\s*[:|-]/i.test(line)
    ) ??
    lines.find((line) =>
      line.length <= 90 &&
      /engineer|developer|analyst|designer|manager|consultant|associate|specialist|intern|executive|researcher|product|marketing|sales|finance|operations|hr/i.test(
        line
      )
    );

  if (!roleLine) return `${domain.name} Role`;

  return roleLine
    .replace(/\b(?:job title|title|role|position|hiring for|job)\b\s*[:|-]\s*/i, "")
    .slice(0, 80);
}

function extractPhraseCandidates(text: string) {
  const phrases = text
    .match(/\b[A-Za-z][A-Za-z0-9+#.]*(?:\s+[A-Za-z][A-Za-z0-9+#.]*){1,3}\b/g)
    ?.map((item) => item.toLowerCase())
    .filter((item) =>
      /\b(?:analysis|analytics|management|research|design|development|testing|marketing|sales|finance|operations|product|customer|data|software|experience|modeling|reporting|strategy|optimization|automation|dashboard|api|platform|project|stakeholder)\b/i.test(
        item
      )
    ) ?? [];

  return unique(phrases).slice(0, 30);
}

function parseATSJobDescription(text: string): ParsedATSJobDescription {
  const domain = detectDomain(text);
  const seniorFrontendJD = isSeniorFrontendJob(text);
  const allDomainTools = unique(DOMAIN_DEFINITIONS.flatMap((item) => item.tools));
  const allDomainKeywords = unique(DOMAIN_DEFINITIONS.flatMap((item) => item.keywords));
  const allResponsibilities = unique(
    DOMAIN_DEFINITIONS.flatMap((item) => item.responsibilities)
  );
  const lines = getLines(text);
  const requiredText = lines
    .filter((line) =>
      /\b(?:required|requirements|must have|mandatory|minimum|essential|should have)\b/i.test(
        line
      )
    )
    .join(" ");
  const preferredText = lines
    .filter((line) =>
      /\b(?:preferred|nice to have|bonus|plus|good to have)\b/i.test(line)
    )
    .join(" ");
  const tools = countMatches(text, allDomainTools);
  const skills = countMatches(text, unique([...domain.tools, ...domain.keywords]));
  const responsibilities = countMatches(text, allResponsibilities);
  const domainKeywords = countMatches(text, allDomainKeywords);
  const phraseCandidates = extractPhraseCandidates(text);
  const meaningfulPhrases = phraseCandidates.filter(
    (term) => !GENERIC_TERMS.includes(term)
  );
  const keywordPool = unique([
    ...domainKeywords,
    ...skills,
    ...tools,
    ...responsibilities,
    ...meaningfulPhrases,
  ]).filter((term) => !isGenericKeyword(term));
  const requiredKeywordPool = seniorFrontendJD
    ? unique([...keywordPool, ...countMatches(text, FRONTEND_REQUIRED_KEYWORDS)])
    : keywordPool;
  const preferredKeywordPool = seniorFrontendJD
    ? unique([...keywordPool, ...countMatches(text, FRONTEND_PREFERRED_KEYWORDS)])
    : keywordPool;
  const requiredKeywords = countMatches(requiredText || text, requiredKeywordPool);
  const preferredKeywords = countMatches(preferredText, preferredKeywordPool);
  const seniorFrontendRequired = seniorFrontendJD
    ? countMatches(text, FRONTEND_REQUIRED_KEYWORDS)
    : [];
  const seniorFrontendPreferred = seniorFrontendJD
    ? countMatches(text, FRONTEND_PREFERRED_KEYWORDS)
    : [];

  return {
    targetRole: detectTargetRole(text, domain),
    domain,
    requiredKeywords: unique([
      ...(requiredKeywords.length ? requiredKeywords : keywordPool.slice(0, 8)),
      ...seniorFrontendRequired,
    ]).filter((term) => !isGenericKeyword(term)),
    preferredKeywords: unique([
      ...preferredKeywords,
      ...seniorFrontendPreferred,
    ]).filter((term) => !isGenericKeyword(term)),
    tools,
    skills,
    responsibilities,
    allKeywords: keywordPool.slice(0, 28),
  };
}

function getResumeBullets(text: string) {
  return getLines(text)
    .map((line) => line.replace(/^[•\-*–]\s*/, "").trim())
    .filter((line) => line.length >= 18 && line.length <= 240)
    .filter((line) => /^(?:[A-Z][a-z]+|[A-Z]{2,})/.test(line) || /[.;]$/.test(line));
}

function hasMetric(text: string) {
  return /\b(?:\d+(?:\.\d+)?%?|\d+\+|[1-9][0-9]{2,})\b/.test(text) && /\b(?:increased|reduced|improved|saved|users|customers|revenue|cost|time|accuracy|conversion|engagement|processed|rank|score|cgpa|marks|percentage)\b/i.test(text);
}

function hasSection(text: string, section: string) {
  return new RegExp(`(^|\\n)\\s*(?:${section})\\s*(?:\\n|:|$)`, "i").test(text);
}

function isMeaningfulATSKeyword(term: string) {
  const normalized = term.toLowerCase();

  return !isGenericKeyword(normalized) && normalized !== "git" && normalized !== "github";
}

function isLikelySectionHeading(line: string) {
  const cleaned = line.replace(/[:|]/g, "").trim();

  return (
    cleaned.length <= 40 &&
    /^(?:summary|objective|skills|technical skills|education|projects|experience|work experience|internship|internships|professional experience|certifications|achievements|awards|leadership|activities|extracurricular|extra curricular|positions of responsibility|volunteer|publications)$/i.test(
      cleaned
    )
  );
}

function sectionNameFor(line: string) {
  return line.replace(/[:|]/g, "").trim().toLowerCase();
}

function isProjectOrExperienceSection(section: string) {
  return /\b(?:projects?|experience|work experience|internships?|professional experience)\b/i.test(
    section
  );
}

function isLowPrioritySection(section: string) {
  return /\b(?:skills?|education|activities|extracurricular|extra curricular|leadership|volunteer|certifications?|achievements?|awards?)\b/i.test(
    section
  );
}

function isSkillListItem(line: string) {
  const cleaned = line.replace(/^[•\-*–]\s*/, "").trim();
  const words = cleaned.split(/\s+/);

  return (
    cleaned.length <= 55 &&
    words.length <= 5 &&
    !/[.;]/.test(cleaned) &&
    !countMatches(cleaned, ACTION_VERBS).length
  );
}

function getResumeBulletCandidates(text: string) {
  const lines = getLines(text);
  let currentSection = "unknown";

  return lines.flatMap((rawLine) => {
    if (isLikelySectionHeading(rawLine)) {
      currentSection = sectionNameFor(rawLine);
      return [];
    }

    const line = rawLine.replace(/^[•\-*–]\s*/, "").trim();

    if (
      line.length < 18 ||
      line.length > 240 ||
      isSkillListItem(line) ||
      /\b(?:class x|class xii|cgpa|percentage|higher secondary|secondary school)\b/i.test(
        line
      )
    ) {
      return [];
    }

    return [
      {
        line,
        section: currentSection,
        priority: isProjectOrExperienceSection(currentSection)
          ? 0
          : isLowPrioritySection(currentSection)
            ? 2
            : 1,
      },
    ];
  });
}

function directEvidenceLines(resumeText: string, primaryTerms: string[], contextTerms: string[]) {
  return getLines(resumeText)
    .filter((line) => {
      const primaryMatches = countMatches(line, primaryTerms);
      const contextMatches = countMatches(line, contextTerms);
      const actionMatches = countMatches(line, ACTION_VERBS);

      return primaryMatches.length > 0 && (contextMatches.length > 0 || actionMatches.length > 0);
    })
    .slice(0, 8);
}

function genericExperienceSignals(text: string) {
  return countMatches(text, [
    "frontend interfaces",
    "modern web technologies",
    "project development",
    "software development",
    "web development",
    "application development",
    "usability",
    "web",
  ]);
}

function requiredSkillCoverage(matched: string[], required: string[]) {
  if (!required.length) return 0.5;

  return matched.length / required.length;
}

function detectWeakBullets(resumeText: string, jdTerms: string[]) {
  const candidates = getResumeBulletCandidates(resumeText);
  const preferredCandidates = candidates.filter((candidate) => candidate.priority === 0);
  const usableCandidates =
    preferredCandidates.length >= 2
      ? preferredCandidates
      : candidates.filter((candidate) => candidate.priority <= 1).length
        ? candidates.filter((candidate) => candidate.priority <= 1)
        : candidates;

  return usableCandidates
    .sort((a, b) => a.priority - b.priority)
    .map((candidate) => candidate.line)
    .filter((bullet) => {
      const lower = bullet.toLowerCase();
      const hasAction = countMatches(lower, ACTION_VERBS).length > 0;
      const hasJDTerm = countMatches(lower, jdTerms).length > 0;
      const hasSpecificTool = countMatches(lower, jdTerms.filter(isMeaningfulATSKeyword)).length > 0;
      const vague =
        /\b(?:worked on|responsible for|helped|participated|handled|good knowledge|basic knowledge|modern web technologies|frontend interfaces|project development|software development)\b/i.test(
          bullet
        ) || bullet.split(/\s+/).length < 9;

      return vague || !hasAction || !hasJDTerm || !hasSpecificTool || !hasMetric(bullet);
    })
    .slice(0, 6);
}

function projectContextForBullet(resumeText: string, original: string) {
  const lines = getLines(resumeText);
  const targetIndex = lines.findIndex((line) => line.includes(original));
  const fallback = "";

  if (targetIndex < 0) return fallback;

  for (let index = targetIndex - 1; index >= 0 && index >= targetIndex - 5; index -= 1) {
    const candidate = lines[index].replace(/^[•\-*–]\s*/, "").trim();

    if (
      candidate.length >= 3 &&
      candidate.length <= 70 &&
      !isLikelySectionHeading(candidate) &&
      !isSkillListItem(candidate)
    ) {
      return candidate;
    }
  }

  return fallback;
}

function improveBullet(original: string, jdTerms: string[], resumeText: string) {
  const meaningfulTerms = jdTerms.filter(isMeaningfulATSKeyword);
  const matchedTerms = countMatches(original, meaningfulTerms);
  const hasFrontendContext = /\b(?:frontend|interface|ui|responsive|web)\b/i.test(original);
  const toolPhrase = matchedTerms.slice(0, 2).join("/") || "";
  const projectContext = projectContextForBullet(resumeText, original);
  const cleaned = original.replace(/^[•\-*–]\s*/, "").replace(/\.$/, "");
  const contextClause = projectContext ? ` for ${projectContext}` : "";
  const toolClause = toolPhrase
    ? ` using ${toolPhrase}`
    : hasFrontendContext
      ? " with clearer frontend implementation context"
      : "";
  const outcomeClause = hasMetric(original)
    ? ", preserving the measured outcome already stated"
    : "";

  return {
    original,
    improved: `${cleaned.replace(/\.$/, "")}${contextClause}${toolClause}${outcomeClause}.`,
    reason:
      "Preserves the original evidence while adding only resume-backed context and JD terms already present in the bullet.",
  };
}

function warning(
  condition: boolean,
  warningText: string,
  severity: ATSWarningSeverity,
  fix: string
) {
  return condition ? [{ warning: warningText, severity, fix }] : [];
}

export function analyzeATSOptimization({
  resumeTitle,
  resumeText,
  jobDescription,
}: {
  resumeTitle: string;
  resumeText: string;
  jobDescription: string;
}): ATSOptimizationAnalysis {
  const parsed = parseATSJobDescription(jobDescription);
  const resume = resumeText.toLowerCase();
  const matchedRequired = countMatches(resume, parsed.requiredKeywords);
  const matchedPreferred = countMatches(resume, parsed.preferredKeywords);
  const matchedTools = countMatches(resume, parsed.tools);
  const matchedSkills = countMatches(resume, parsed.skills);
  const matchedResponsibilities = countMatches(resume, parsed.responsibilities);
  const matchedRequiredForScore = matchedRequired.filter(isMeaningfulATSKeyword);
  const matchedPreferredForScore = matchedPreferred.filter(isMeaningfulATSKeyword);
  const matchedToolsForScore = matchedTools.filter(isMeaningfulATSKeyword);
  const matchedSkillsForScore = matchedSkills.filter(isMeaningfulATSKeyword);
  const requiredForScore = parsed.requiredKeywords.filter(isMeaningfulATSKeyword);
  const preferredForScore = parsed.preferredKeywords.filter(isMeaningfulATSKeyword);
  const toolsForScore = parsed.tools.filter(isMeaningfulATSKeyword);
  const skillsForScore = parsed.skills.filter(isMeaningfulATSKeyword);
  const coreRequiredSkills = unique([
    ...requiredForScore,
    ...toolsForScore,
    ...skillsForScore,
  ]).filter(isMeaningfulATSKeyword);
  const matchedCoreRequiredSkills = countMatches(resume, coreRequiredSkills);
  const coreRequiredCoverage = requiredSkillCoverage(
    matchedCoreRequiredSkills,
    coreRequiredSkills
  );
  const directRequiredEvidence = directEvidenceLines(
    resumeText,
    coreRequiredSkills,
    parsed.responsibilities
  );
  const directResponsibilityEvidence = directEvidenceLines(
    resumeText,
    parsed.responsibilities,
    coreRequiredSkills
  );
  const genericExperienceMatches = genericExperienceSignals(resumeText);
  const seniorFrontendJD = isSeniorFrontendJob(jobDescription);
  const frontendJD = /\bfrontend\b/i.test(jobDescription);
  const seniorFrontendRequiredTerms = countMatches(jobDescription, [
    "react",
    "next.js",
    "typescript",
    "javascript",
    "rest api",
    "rest apis",
    "responsive design",
    "accessibility",
    "performance optimization",
    "reusable ui components",
  ]);
  const seniorFrontendMatchedTerms = countMatches(resumeText, seniorFrontendRequiredTerms);
  const frontendFoundationTerms = countMatches(resumeText, [
    "react",
    "next.js",
    "typescript",
  ]);
  const hasExplicitSeniorYears = /\b(?:[3-9]|[1-9][0-9])\+?\s*(?:years|yrs)\b/i.test(
    resumeText
  );
  const matchedATSKeywords = unique([
    ...matchedRequiredForScore,
    ...matchedPreferredForScore,
    ...matchedToolsForScore,
    ...matchedSkillsForScore,
    ...matchedResponsibilities,
  ]).filter(isMeaningfulATSKeyword);
  const missingRequired = parsed.requiredKeywords.filter(
    (term) => !matchedRequired.includes(term)
  );
  const missingPreferred = parsed.preferredKeywords.filter(
    (term) => !matchedPreferred.includes(term)
  );
  const missingTools = parsed.tools
    .filter(isMeaningfulATSKeyword)
    .filter((term) => !matchedTools.includes(term))
    .filter(
      (term) => !missingRequired.includes(term) && !missingPreferred.includes(term)
    );
  const missingATSKeywords = unique([
    ...missingRequired.filter(isMeaningfulATSKeyword).map((term) => `Required: ${term}`),
    ...missingTools.map((term) => `Tool/platform: ${term}`),
    ...missingPreferred.filter(isMeaningfulATSKeyword).map((term) => `Preferred: ${term}`),
  ]).slice(0, 16);
  const totalKeywords = unique([
    ...requiredForScore,
    ...preferredForScore,
    ...toolsForScore,
    ...skillsForScore,
  ]);
  const keywordCoverage = totalKeywords.length
    ? Math.round((matchedATSKeywords.length / totalKeywords.length) * 100)
    : 45;
  const practicalContextSignals = countMatches(resume, [
    "experience",
    "internship",
    "intern",
    "freelance",
    "client",
    "volunteer",
    "leadership",
    "research",
  ]);
  const impactSignals = countMatches(resume, IMPACT_TERMS);
  const metricLines = getLines(resumeText).filter(hasMetric);
  const weakBullets = detectWeakBullets(resumeText, parsed.allKeywords);
  const hasKeywordStuffingRisk =
    matchedATSKeywords.length >= 12 && getResumeBullets(resumeText).length < 4;
  const formattingSignals = [
    resumeText.length >= 600 ? "Readable extracted text" : "",
    getLines(resumeText).length >= 12 ? "Line-based structure" : "",
    hasSection(resumeText, "skills") ? "Skills section" : "",
    hasSection(resumeText, "education") ? "Education section" : "",
    hasSection(resumeText, "experience|work experience|internship|projects")
      ? "Practical work section"
      : "",
  ].filter(Boolean);
  const sectionSignals = [
    hasSection(resumeText, "skills") ? "Skills" : "",
    hasSection(resumeText, "education") ? "Education" : "",
    hasSection(resumeText, "projects") ? "Projects" : "",
    hasSection(resumeText, "experience|work experience|internship") ? "Experience" : "",
    /\b(?:email|linkedin|github|portfolio|phone)\b|[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(
      resumeText
    )
      ? "Contact"
      : "",
  ].filter(Boolean);
  const rawExperienceScore = Math.round(
    directRequiredEvidence.length * 3 +
      directResponsibilityEvidence.length * 2 +
      Math.min(1, practicalContextSignals.length) +
      Math.min(1, genericExperienceMatches.length)
  );
  const weakCoreRequiredCoverage = coreRequiredCoverage < 0.4;
  const seniorFrontendCoverageWeak =
    seniorFrontendJD &&
    seniorFrontendRequiredTerms.length >= 5 &&
    seniorFrontendMatchedTerms.length / seniorFrontendRequiredTerms.length < 0.45;
  const missingFrontendFoundation =
    frontendJD && frontendFoundationTerms.length === 0;
  const genericEvidenceHeavy =
    genericExperienceMatches.length >= 2 &&
    directRequiredEvidence.length + directResponsibilityEvidence.length <= 1;
  const experienceCap =
    weakCoreRequiredCoverage || seniorFrontendCoverageWeak
      ? 6
      : coreRequiredCoverage < 0.6
        ? 10
        : 15;
  const experienceScore = Math.min(15, experienceCap, rawExperienceScore);
  const categoryScores = [
    {
      name: "Keyword coverage",
      score: scoreRatio(
        matchedRequiredForScore.length * 3 + matchedPreferredForScore.length,
        requiredForScore.length * 3 + preferredForScore.length,
        30
      ),
      maxScore: 30,
      reason: `${matchedRequiredForScore.length}/${requiredForScore.length} required keyword(s) and ${matchedPreferredForScore.length}/${preferredForScore.length} preferred keyword(s) matched. Required misses are weighted more heavily.`,
    },
    {
      name: "Skills alignment",
      score: scoreRatio(
        matchedSkillsForScore.length + matchedToolsForScore.length,
        skillsForScore.length + toolsForScore.length,
        20
      ),
      maxScore: 20,
      reason: `${matchedSkillsForScore.length} meaningful skill signal(s) and ${matchedToolsForScore.length} meaningful tool/platform signal(s) matched from resume text. Generic words and Git alone do not materially lift this score.`,
    },
    {
      name: "Experience evidence",
      score: experienceScore,
      maxScore: 15,
      reason: `${directRequiredEvidence.length} direct required-skill evidence line(s), ${directResponsibilityEvidence.length} JD responsibility evidence line(s), and ${genericExperienceMatches.length} generic experience phrase(s) found. Score is capped at ${experienceCap}/15 when core required-skill coverage is incomplete.`,
    },
    {
      name: "Impact metrics",
      score: Math.min(15, Math.round(impactSignals.length * 2 + metricLines.length * 3)),
      maxScore: 15,
      reason: `${impactSignals.length} impact term(s) and ${metricLines.length} metric-backed line(s) found. Dates and isolated numbers are not enough.`,
    },
    {
      name: "Formatting/ATS readability signals",
      score: Math.min(10, formattingSignals.length * 2),
      maxScore: 10,
      reason: formattingSignals.length
        ? `Readable structure signals found: ${formattingSignals.join(", ")}.`
        : "Few ATS readability signals were visible in the extracted text.",
    },
    {
      name: "Section completeness",
      score: Math.min(10, sectionSignals.length * 2),
      maxScore: 10,
      reason: sectionSignals.length
        ? `Detected resume sections/signals: ${sectionSignals.join(", ")}.`
        : "Core resume sections were not clearly detected.",
    },
  ];
  const rawScore = categoryScores.reduce((total, item) => total + item.score, 0);
  const calibratedScore =
    rawScore >= 85 &&
    (keywordCoverage < 75 || metricLines.length < 2 || weakBullets.length > 3)
      ? 84
      : rawScore;
  const seniorWithoutYearsCap = seniorFrontendJD && !hasExplicitSeniorYears ? 60 : 100;
  const weakCoreCap = weakCoreRequiredCoverage ? 55 : 100;
  const frontendFoundationCap = missingFrontendFoundation ? 50 : 100;
  const seniorFrontendCap = seniorFrontendCoverageWeak ? 55 : 100;
  const genericEvidenceCap = genericEvidenceHeavy ? 58 : 100;
  const atsScore = Math.min(
    calibratedScore,
    seniorWithoutYearsCap,
    weakCoreCap,
    frontendFoundationCap,
    seniorFrontendCap,
    genericEvidenceCap
  );
  const capReasons = unique([
    seniorFrontendJD && !hasExplicitSeniorYears
      ? "the JD is senior-level but the resume does not show explicit years of frontend experience"
      : "",
    weakCoreRequiredCoverage
      ? "core required keyword coverage is below 40%"
      : "",
    missingFrontendFoundation
      ? "React, Next.js, and TypeScript are not explicitly present for this frontend JD"
      : "",
    seniorFrontendCoverageWeak
      ? "Senior Frontend required terms are mostly missing"
      : "",
    genericEvidenceHeavy
      ? "most experience evidence comes from generic project wording"
      : "",
  ]);
  const summaryDetail = capReasons.length
    ? ` The resume is directionally relevant through software/project work, but the score is capped because ${capReasons.join(", ")}.`
    : " The score reflects direct keyword, skill, responsibility, impact, and formatting evidence.";
  const strengths = unique([
    matchedSkillsForScore.length ? `Matches role skills such as ${matchedSkillsForScore.slice(0, 5).join(", ")}.` : "",
    matchedToolsForScore.length ? `Includes JD tools/platforms such as ${matchedToolsForScore.slice(0, 5).join(", ")}.` : "",
    matchedResponsibilities.length ? "Shows some responsibility alignment with the JD." : "",
    metricLines.length ? "Has at least some measurable impact evidence." : "",
    formattingSignals.length >= 4 ? "Readable sections support ATS parsing." : "",
  ]).slice(0, 6);
  const quickWins = unique([
    missingRequired.find(isMeaningfulATSKeyword) ? `Add honest resume evidence for required keyword: ${missingRequired.find(isMeaningfulATSKeyword)}.` : "",
    missingTools[0] ? `Mention where you used ${missingTools[0]} if it is true.` : "",
    weakBullets[0] ? "Rewrite weak bullets to include action, tool/skill, and outcome." : "",
    metricLines.length < 2 ? "Add measurable outcomes or honest placeholders where metrics are not yet known." : "",
    "Tailor the summary and skills section to the target role without keyword stuffing.",
  ]).slice(0, 6);
  const atsWarnings = [
    ...warning(
      missingRequired.length > 3,
      "Several required JD keywords are missing from the resume.",
      "High",
      "Add only the required skills you genuinely have, tied to projects or experience bullets."
    ),
    ...warning(
      weakCoreRequiredCoverage || seniorFrontendCoverageWeak,
      "Core required-skill coverage is weak for this JD.",
      "High",
      "Add direct, truthful evidence for required skills in Skills, Projects, or Experience bullets before relying on generic frontend/project wording."
    ),
    ...warning(
      seniorFrontendJD && !hasExplicitSeniorYears,
      "The JD is senior-level, but explicit years of frontend experience were not detected.",
      "High",
      "If accurate, add a clear years-of-experience signal tied to frontend work; otherwise target fresher or junior frontend roles."
    ),
    ...warning(
      missingFrontendFoundation,
      "React, Next.js, and TypeScript are not explicitly visible for this frontend JD.",
      "High",
      "Add these only if actually used, preferably in Skills and project bullets with context."
    ),
    ...warning(
      genericEvidenceHeavy,
      "Most experience evidence is generic project wording.",
      "Medium",
      "Replace phrases like modern web technologies with specific tools, responsibilities, and outcomes."
    ),
    ...warning(
      missingTools.length > 2,
      "Important tools/platforms from the JD are not visible.",
      "Medium",
      "Add tools under Skills and in relevant project/work bullets where truthful."
    ),
    ...warning(
      weakBullets.length > 3,
      "Multiple bullets are vague, task-only, or missing outcomes.",
      "Medium",
      "Rewrite bullets with action + skill/tool + context + result."
    ),
    ...warning(
      metricLines.length === 0,
      "No metric-backed achievements were detected.",
      "High",
      "Add quantified outcomes such as users, accuracy, time saved, cost reduced, ranking, or project results."
    ),
    ...warning(
      hasKeywordStuffingRisk,
      "Keyword stuffing risk detected.",
      "Medium",
      "Distribute keywords naturally across Skills, Experience, and Projects with evidence."
    ),
    ...warning(
      formattingSignals.length < 3,
      "ATS readability signals are limited in the extracted text.",
      "Low",
      "Use clear headings, readable bullets, and a simple one-column PDF layout."
    ),
  ];

  return {
    atsScore: Math.max(0, Math.min(100, atsScore)),
    keywordCoverage: Math.max(0, Math.min(100, keywordCoverage)),
    resumeTitle,
    targetRole: parsed.targetRole,
    detectedDomain: parsed.domain.name,
    summary: `${resumeTitle} has an ATS score of ${Math.max(0, Math.min(100, atsScore))}/100 for ${parsed.targetRole}.${summaryDetail}`,
    missingATSKeywords,
    matchedATSKeywords: matchedATSKeywords.slice(0, 18),
    weakBullets,
    optimizedBullets: weakBullets
      .slice(0, 4)
      .map((bullet) => improveBullet(bullet, parsed.allKeywords, resumeText)),
    atsWarnings,
    strengths,
    quickWins,
    categoryScores,
  };
}
