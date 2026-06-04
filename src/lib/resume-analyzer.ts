export type ResumeAnalysisGrade =
  | "Weak"
  | "Average"
  | "Good"
  | "Strong"
  | "Excellent";

export type HiringReadiness = "Low" | "Moderate" | "Good" | "High";

export type ResumeSeniority =
  | "Student"
  | "Fresher"
  | "Early Career"
  | "Mid Level"
  | "Senior"
  | "Unknown";

export type ResumeCategoryScore = {
  name: string;
  score: number;
  maxScore: number;
  evidenceFound: string[];
  missingEvidence: string[];
  reason: string;
  suggestions: string[];
  breakdown?: ResumeScoreBreakdownItem[];
};

export type ResumeScoreBreakdownItem = {
  name: string;
  score: number;
  maxScore: number;
  reason: string;
};

export type ResumeRewriteSuggestion = {
  originalProblem: string;
  suggestedRewrite: string;
  whyBetter: string;
  before?: string;
  after?: string;
};

export type ResumeDiagnostics = {
  overallScore: number;
  grade: ResumeAnalysisGrade;
  hiringReadiness: HiringReadiness;
  detectedProfileType: string;
  detectedSeniority: ResumeSeniority;
  summary: string;
  categoryScores: ResumeCategoryScore[];
  topIssues: string[];
  quickWins: string[];
  redFlags: string[];
  rewriteSuggestions: ResumeRewriteSuggestion[];
};

type ResumeContext = {
  text: string;
  normalized: string;
  lower: string;
  lines: string[];
  bulletLines: string[];
  headerText: string;
  profileType: string;
  seniority: ResumeSeniority;
};

type ProfileDefinition = {
  name: string;
  keywords: string[];
  tools: string[];
  methods: string[];
};

const PROFILE_DEFINITIONS: ProfileDefinition[] = [
  {
    name: "Software",
    keywords: [
      "software",
      "developer",
      "frontend",
      "backend",
      "full stack",
      "api",
      "database",
      "algorithm",
      "web app",
    ],
    tools: [
      "react",
      "next.js",
      "node.js",
      "typescript",
      "javascript",
      "java",
      "python",
      "sql",
      "mongodb",
      "postgresql",
      "git",
      "docker",
    ],
    methods: ["rest", "graphql", "testing", "authentication", "deployment"],
  },
  {
    name: "Data",
    keywords: [
      "data",
      "analytics",
      "dashboard",
      "statistics",
      "model",
      "insights",
      "analysis",
    ],
    tools: [
      "excel",
      "sql",
      "python",
      "power bi",
      "tableau",
      "pandas",
      "numpy",
      "r",
      "spark",
    ],
    methods: ["forecasting", "regression", "visualization", "etl", "reporting"],
  },
  {
    name: "Design",
    keywords: ["design", "ux", "ui", "product design", "case study", "prototype"],
    tools: ["figma", "adobe xd", "photoshop", "illustrator", "framer", "sketch"],
    methods: ["wireframe", "user research", "journey map", "usability", "prototype"],
  },
  {
    name: "Marketing",
    keywords: ["marketing", "campaign", "content", "seo", "brand", "growth"],
    tools: ["google analytics", "meta ads", "hubspot", "semrush", "mailchimp"],
    methods: ["conversion", "engagement", "copywriting", "a/b testing", "social media"],
  },
  {
    name: "Finance",
    keywords: ["finance", "valuation", "accounting", "investment", "audit"],
    tools: ["excel", "power bi", "quickbooks", "tally", "bloomberg"],
    methods: ["financial modeling", "dcf", "budgeting", "forecasting", "variance"],
  },
  {
    name: "Sales",
    keywords: ["sales", "revenue", "client", "lead", "pipeline", "quota"],
    tools: ["salesforce", "hubspot", "crm", "zoho"],
    methods: ["prospecting", "negotiation", "account management", "cold calling"],
  },
  {
    name: "Operations",
    keywords: ["operations", "process", "logistics", "vendor", "inventory"],
    tools: ["excel", "sap", "erp", "power bi", "jira"],
    methods: ["optimization", "sop", "supply chain", "process improvement"],
  },
  {
    name: "Product",
    keywords: ["product", "roadmap", "requirements", "user research", "metrics"],
    tools: ["jira", "figma", "notion", "mixpanel", "analytics"],
    methods: ["prd", "prioritization", "user stories", "experimentation"],
  },
  {
    name: "Consulting",
    keywords: ["consulting", "strategy", "case", "market research", "analysis"],
    tools: ["excel", "powerpoint", "tableau", "power bi"],
    methods: ["framework", "benchmarking", "stakeholder", "recommendation"],
  },
  {
    name: "HR",
    keywords: ["human resources", "hr", "recruitment", "talent", "employee"],
    tools: ["ats", "workday", "linkedin recruiter", "excel"],
    methods: ["sourcing", "onboarding", "screening", "engagement"],
  },
  {
    name: "Research",
    keywords: ["research", "publication", "experiment", "methodology", "paper"],
    tools: ["python", "r", "spss", "matlab", "latex"],
    methods: ["literature review", "hypothesis", "survey", "analysis", "experiment"],
  },
  {
    name: "General",
    keywords: [
      "project",
      "internship",
      "leadership",
      "operations",
      "analysis",
      "client",
      "research",
      "presentation",
    ],
    tools: ["excel", "powerpoint", "notion", "canva", "google workspace"],
    methods: [
      "reporting",
      "documentation",
      "stakeholder",
      "coordination",
      "process improvement",
    ],
  },
];

const GENERAL_HARD_SKILLS = [
  "excel",
  "powerpoint",
  "presentation",
  "analysis",
  "research",
  "communication",
  "writing",
  "reporting",
  "project management",
  "stakeholder",
  "leadership",
  "strategy",
  "documentation",
  "problem solving",
  "negotiation",
  "customer",
  "client",
];

const LIGHT_SKILL_TERMS = [
  "software",
  "frontend",
  "backend",
  "database",
  "testing",
  "documentation",
  "communication",
  "leadership",
  "presentation",
  "analysis",
  "research",
  "writing",
  "stakeholder",
  "problem solving",
  "customer",
  "client",
];

const SPECIFIC_SKILL_TERMS = [
  ...PROFILE_DEFINITIONS.flatMap((profile) => profile.tools),
  ...PROFILE_DEFINITIONS.flatMap((profile) => profile.methods),
  "rest api",
  "rest apis",
  "prisma",
  "postgres",
  "postgresql",
  "mongodb",
  "node",
  "node.js",
  "next.js",
  "typescript",
  "power bi",
  "tableau",
  "pandas",
  "ga4",
  "figma",
  "wireframes",
  "prototypes",
  "ux research",
  "financial modeling",
  "valuation",
  "seo",
  "conversion",
  "content strategy",
];

const VAGUE_SKILLS = [
  "hardworking",
  "quick learner",
  "team player",
  "punctual",
  "self motivated",
  "dedicated",
  "honest",
];

const ACTION_VERBS = [
  "achieved",
  "analyzed",
  "architected",
  "automated",
  "built",
  "collaborated",
  "created",
  "designed",
  "developed",
  "delivered",
  "drove",
  "executed",
  "implemented",
  "improved",
  "increased",
  "launched",
  "led",
  "managed",
  "optimized",
  "planned",
  "reduced",
  "researched",
  "shipped",
  "streamlined",
  "tested",
  "validated",
];

const EXPERIENCE_SECTION_NAMES = [
  "experience",
  "work experience",
  "professional experience",
  "internship",
  "internships",
  "employment",
  "freelance",
  "client work",
  "volunteer experience",
  "volunteering",
  "open source",
  "hackathon",
  "leadership",
  "positions of responsibility",
  "campus involvement",
];

const PROJECT_SECTION_NAMES = [
  "projects",
  "personal projects",
  "portfolio",
  "case studies",
  "case study",
  "academic projects",
  "research projects",
  "selected work",
  "work samples",
];

const SECTION_HEADING_REGEX =
  /^(summary|profile|objective|education|skills|technical skills|core skills|projects|personal projects|portfolio|case studies|experience|work experience|professional experience|internship|internships|employment|freelance|client work|volunteer experience|volunteering|open source|hackathon|leadership|positions of responsibility|achievements|awards|certifications|publications|research|coursework|interests|activities)\s*:?$/i;

const RESUME_SECTION_HEADINGS = [
  "summary",
  "profile",
  "objective",
  "career objective",
  "professional summary",
  "education",
  "academics",
  "skills",
  "technical skills",
  "core skills",
  "portfolio",
  "projects",
  "personal projects",
  "academic projects",
  "research projects",
  "case studies",
  "experience",
  "work experience",
  "professional experience",
  "internship",
  "internships",
  "certifications",
  "certifications & achievements",
  "achievements",
  "awards",
  "extra curricular activities",
  "extracurricular activities",
  "leadership",
  "positions of responsibility",
  "publications",
  "research",
  "coursework",
  "interests",
  "activities",
];

const EDUCATION_STOP_HEADINGS = [
  "portfolio",
  "projects",
  "skills",
  "technical skills",
  "core skills",
  "experience",
  "professional experience",
  "certifications",
  "certifications & achievements",
  "extra curricular activities",
  "extracurricular activities",
  "achievements",
  "career objective",
  "professional summary",
];

const EMAIL_REGEX = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
const PHONE_REGEX =
  /(?:\+?\d{1,3}[\s.-]?)?(?:\(?\d{3,5}\)?[\s.-]?)\d{3,5}[\s.-]?\d{3,5}/;
const DATE_REGEX =
  /\b(?:20\d{2}|19\d{2}|jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec|present|current)\b/i;
const YEAR_RANGE_REGEX =
  /\b(?:19|20)\d{2}\s*(?:-|–|—|to)\s*(?:19|20)\d{2}\b/i;
const FLEXIBLE_YEAR_RANGE_REGEX =
  /\b(?:19|20)\d{2}\s*(?:-|–|—|to)\s*(?:(?:19|20)\d{2}|present|current|ongoing)\b/i;
const BULLET_REGEX = /(^|\n)\s*(?:[-*•]|\d+\.)\s+/;
const OUTCOME_WORD_REGEX =
  /\b(?:achieved|boosted|cut|decreased|delivered|grew|improved|increased|launched|optimized|processed|reduced|saved|served|shipped|supported|won|ranked|published|certified)\b/i;
const SCALE_WORD_REGEX =
  /\b(?:users|customers|clients|students|revenue|growth|accuracy|conversion|engagement|campaign|records|requests|transactions|hours|days|cost|latency|performance|retention|ranking|award|publication|certification|research result)\b/i;

function normalize(text: string) {
  return text.replace(/\s+/g, " ").trim();
}

function normalizeResumeLines(text: string): string[] {
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

function getLines(text: string) {
  return normalizeResumeLines(text);
}

function unique(items: string[]) {
  return Array.from(new Set(items.filter(Boolean)));
}

function countMatches(text: string, terms: string[]) {
  const lower = text.toLowerCase();
  return unique(terms).filter((term) =>
    new RegExp(`(^|[^a-z0-9+#.])${escapeRegExp(term.toLowerCase())}([^a-z0-9+#.]|$)`, "i").test(
      lower
    )
  );
}

function hasSection(text: string, names: string[]) {
  const lines = normalizeResumeLines(text);

  return lines.some((line) => isSectionHeadingLine(line, names));
}

function normalizeHeading(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function matchSectionHeadingLine(line: string, headings: string[]) {
  const raw = line.replace(/^[\-–—]\s*/, "").trim();
  const cleaned = normalizeHeading(raw);

  for (const heading of headings) {
    const normalizedHeading = normalizeHeading(heading);

    if (
      cleaned === normalizedHeading ||
      cleaned === `${normalizedHeading} section` ||
      cleaned === `${normalizedHeading} details`
    ) {
      return { matches: true, trailingText: "" };
    }

    if (cleaned.startsWith(`${normalizedHeading} `)) {
      const headingPattern = heading
        .trim()
        .split(/\s+/)
        .map(escapeRegExp)
        .join("\\s+");
      const trailingText = raw
        .replace(new RegExp(`^${headingPattern}\\s*(?::|-)?\\s*`, "i"), "")
        .trim();

      if (trailingText && trailingText !== raw) {
        return { matches: true, trailingText };
      }
    }
  }

  return { matches: false, trailingText: "" };
}

function isSectionHeadingLine(line: string, headings: string[]) {
  return matchSectionHeadingLine(line, headings).matches;
}

function extractSection(lines: string[], heading: string, stopHeadings: string[]): string[];
function extractSection(text: string, names: string[]): string;
function extractSection(
  source: string | string[],
  headingOrNames: string | string[],
  stopHeadings: string[] = RESUME_SECTION_HEADINGS
) {
  if (Array.isArray(source)) {
    const names = Array.isArray(headingOrNames) ? headingOrNames : [headingOrNames];
    const start = source.findIndex((line) => isSectionHeadingLine(line, names));

    if (start === -1) return [];

    const startMatch = matchSectionHeadingLine(source[start], names);
    const sectionLines: string[] = [];

    if (startMatch.trailingText) {
      sectionLines.push(startMatch.trailingText);
    }

    for (const line of source.slice(start + 1)) {
      if (isSectionHeadingLine(line, stopHeadings)) break;
      sectionLines.push(line);
    }

    return sectionLines;
  }

  const lines = normalizeResumeLines(source);
  const names = Array.isArray(headingOrNames) ? headingOrNames : [headingOrNames];
  const start = lines.findIndex((line) => isSectionHeadingLine(line, names));

  if (start === -1) return "";

  const startMatch = matchSectionHeadingLine(lines[start], names);
  const sectionLines: string[] = [];

  if (startMatch.trailingText) {
    sectionLines.push(startMatch.trailingText);
  }

  for (const line of lines.slice(start + 1)) {
    if (isSectionHeadingLine(line, stopHeadings)) break;
    sectionLines.push(line);
  }

  return sectionLines.join("\n");
}

function extractNearbySection(text: string, names: string[], lineLimit = 10) {
  const lines = normalizeResumeLines(text);
  const start = lines.findIndex((line) => isSectionHeadingLine(line, names));

  if (start === -1) return "";

  const sectionLines: string[] = [];

  for (const line of lines.slice(start + 1, start + lineLimit)) {
    if (isSectionHeadingLine(line, RESUME_SECTION_HEADINGS)) break;
    sectionLines.push(line);
  }

  return sectionLines.join("\n");
}

function extractFlexibleSection(text: string, names: string[], lineLimit = 80) {
  return (
    extractSection(text, names) ||
    extractNearbySection(text, names, lineLimit)
  );
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function hasDateSignal(text: string) {
  return YEAR_RANGE_REGEX.test(text) || DATE_REGEX.test(text);
}

const DEGREE_REGEX =
  /\b(?:b\s*\.?\s*tech|btech|bachelor\s+of\s+technology|bachelor\s+of\s+engineering|b\s*\.?\s*sc|bsc\b|bachelor\s+of\s+science|b\s*\.?\s*s\b|bs\b|m\s*\.?\s*tech|mtech\b|master\s+of\s+technology|master\s+of\s+engineering|m\s*\.?\s*sc|msc\b|master\s+of\s+science|mca|mba|bba|b\s*\.?\s*com|m\s*\.?\s*com|ph\s*\.?\s*d|diploma|degree)\b/i;

const DEGREE_ABBREVIATION_REGEX =
  /\b(?:B\s*\.?\s*E\s*\.?|M\s*\.?\s*E\s*\.?|B\s*\.?\s*Tech|BTech|B\s*\.?\s*Sc|BSc|B\s*\.?\s*S\b|BS\b|M\s*\.?\s*Tech|MTech|M\s*\.?\s*Sc|MSc|MCA|MBA)\b/;

const INSTITUTION_REGEX =
  /\b(?:university|college|institute|polytechnic|school|academy|campus|engineering|technology|business school|vidyalaya|public school)\b/i;

const EDUCATION_TIMELINE_REGEX =
  /\b(?:19|20)\d{2}\s*(?:-|–|—|to)\s*(?:(?:19|20)\d{2}|present|current|ongoing)\b|\b(?:expected|anticipated)\s+(?:graduation|completion)?\s*:?\s*(?:19|20)\d{2}\b|\b(?:graduat(?:e|ion|ing)|passing|passout)\s*(?:year)?\s*:?\s*(?:19|20)\d{2}\b/i;

const EDUCATION_CGPA_REGEX =
  /\b(?:(?:cgpa|gpa|sgpa|percentage|percent|marks)\s*:?\s*)?(?:\d+(?:\.\d+)?\s*\/\s*10|\d+(?:\.\d+)?\s*%|(?:cgpa|gpa|sgpa)\s*:?\s*\d+(?:\.\d+)?|percentage\s*:?\s*\d+(?:\.\d+)?)\b/i;

const FIELD_REGEX =
  /\b(?:computer science|cse|ai\/?ml|artificial intelligence|machine learning|information technology|\bit\b|engineering|design|marketing|finance|commerce|economics|business|management|data science|statistics|psychology|operations|human resources|research|biology|physics|mathematics|law)\b/i;

function findEvidenceLine(lines: string[], regex: RegExp) {
  return lines.find((line) => regex.test(line));
}

function splitEducationSegments(line: string) {
  return line
    .split(/\s*\|\s*|\s{2,}/)
    .map((segment) => segment.trim())
    .filter(Boolean);
}

function findEducationSegment(lines: string[], regex: RegExp) {
  for (const line of lines) {
    const segment = splitEducationSegments(line).find((item) => regex.test(item));

    if (segment) return segment;
  }

  return undefined;
}

function findEducationSegmentBy(
  lines: string[],
  predicate: (segment: string) => boolean
) {
  for (const line of lines) {
    const segment = splitEducationSegments(line).find(predicate);

    if (segment) return segment;
  }

  return undefined;
}

function flattenedEducationSegments(lines: string[]) {
  return lines.flatMap((line) => {
    const segments = splitEducationSegments(line);

    return segments.length > 1 ? segments : [line];
  });
}

function hasDegreeSignal(segment: string) {
  return DEGREE_REGEX.test(segment) || DEGREE_ABBREVIATION_REGEX.test(segment);
}

function isDegreeCandidate(segment: string) {
  return (
    hasDegreeSignal(segment) ||
    (FIELD_REGEX.test(segment) &&
      !/\b(?:university|college|institute|polytechnic|school|academy|campus|business school|vidyalaya|public school)\b/i.test(
        segment
      ) &&
      !EDUCATION_TIMELINE_REGEX.test(segment) &&
      !EDUCATION_CGPA_REGEX.test(segment))
  );
}

function isCgpaOnlyLine(line: string) {
  return EDUCATION_CGPA_REGEX.test(line) && !lineWithoutEducationSignals(line);
}

function lineWithoutEducationSignals(line: string) {
  return line
    .replace(DEGREE_REGEX, " ")
    .replace(DEGREE_ABBREVIATION_REGEX, " ")
    .replace(EDUCATION_TIMELINE_REGEX, " ")
    .replace(FIELD_REGEX, " ")
    .replace(/\b(?:cgpa|gpa|sgpa|percentage|percent|marks|grade|aggregate)\b\s*:?\s*\d+(?:\.\d+)?(?:\s*(?:\/\s*10|%|percent))?/gi, " ")
    .replace(/[,:|/()&-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isTimelineOnlyLine(line: string) {
  return EDUCATION_TIMELINE_REGEX.test(line) && !lineWithoutEducationSignals(line);
}

function isEducationInstitutionCandidate(line: string) {
  const cleaned = line.trim();

  if (
    !cleaned ||
    SECTION_HEADING_REGEX.test(cleaned) ||
    EMAIL_REGEX.test(cleaned) ||
    PHONE_REGEX.test(cleaned) ||
    isTimelineOnlyLine(cleaned) ||
    isCgpaOnlyLine(cleaned) ||
    isDegreeCandidate(cleaned) ||
    hasDegreeSignal(cleaned) ||
    /\b(?:cgpa|gpa|sgpa|percentage|percent|marks|grade|aggregate|class 10|class 12|class x|class xii|10th|12th)\b/i.test(
      cleaned
    )
  ) {
    return false;
  }

  return /[a-z]/i.test(cleaned) && cleaned.length >= 3 && cleaned.length <= 120;
}

function findStructuralInstitutionLine(lines: string[]) {
  const degreeIndex = lines.findIndex((line) => hasDegreeSignal(line));
  const timelineIndex = lines.findIndex((line) => EDUCATION_TIMELINE_REGEX.test(line));
  const hasEducationAnchor = degreeIndex !== -1 || timelineIndex !== -1;

  if (!hasEducationAnchor) {
    return findEvidenceLine(lines, INSTITUTION_REGEX);
  }

  const institutionWordLine = lines.find(
    (line) => INSTITUTION_REGEX.test(line) && isEducationInstitutionCandidate(line)
  );

  if (institutionWordLine) {
    return institutionWordLine;
  }

  const anchorIndexes = [degreeIndex, timelineIndex].filter((index) => index >= 0);
  const firstAnchor = Math.min(...anchorIndexes);
  const lastAnchor = Math.max(...anchorIndexes);

  return lines.find((line, index) => {
    if (!isEducationInstitutionCandidate(line)) {
      return false;
    }

    return index >= Math.max(0, firstAnchor - 3) && index <= lastAnchor + 4;
  });
}

function findInlineInstitutionSegment(lines: string[]) {
  for (const line of lines) {
    const segments = splitEducationSegments(line);

    if (segments.length < 2) continue;

    const institutionSegment =
      segments.find(
        (segment) =>
          INSTITUTION_REGEX.test(segment) &&
          isEducationInstitutionCandidate(segment)
      ) ??
      segments.find(
        (segment) =>
          isEducationInstitutionCandidate(segment) &&
          !isDegreeCandidate(segment) &&
          !EDUCATION_TIMELINE_REGEX.test(segment) &&
          !EDUCATION_CGPA_REGEX.test(segment)
      );

    if (institutionSegment) {
      return institutionSegment;
    }
  }

  return undefined;
}

function parseInlineEducationSegments(lines: string[]) {
  for (const line of lines) {
    const segments = splitEducationSegments(line);

    if (segments.length < 3) continue;

    const degreeLine = segments.find(isDegreeCandidate);
    const timelineLine = segments.find((segment) =>
      EDUCATION_TIMELINE_REGEX.test(segment)
    );
    const academicPerformanceLine = segments.find((segment) =>
      EDUCATION_CGPA_REGEX.test(segment)
    );
    const institutionLine =
      segments.find(
        (segment) =>
          segment !== degreeLine &&
          segment !== timelineLine &&
          segment !== academicPerformanceLine &&
          INSTITUTION_REGEX.test(segment) &&
          isEducationInstitutionCandidate(segment)
      ) ??
      segments.find(
        (segment) =>
          segment !== degreeLine &&
          segment !== timelineLine &&
          segment !== academicPerformanceLine &&
          isEducationInstitutionCandidate(segment)
      );

    if (degreeLine || institutionLine || timelineLine || academicPerformanceLine) {
      return {
        degreeLine,
        institutionLine,
        timelineLine,
        academicPerformanceLine,
      };
    }
  }

  return {};
}

function extractEducationEvidence(context: ResumeContext) {
  const normalizedLines = normalizeResumeLines(context.text);
  const educationSectionLines = extractSection(
    normalizedLines,
    "education",
    EDUCATION_STOP_HEADINGS
  );
  const educationLines = educationSectionLines.length
    ? educationSectionLines
    : extractSection(normalizedLines, "academics", EDUCATION_STOP_HEADINGS);
  const education = educationLines.length
    ? educationLines.join("\n")
    : extractFlexibleSection(context.text, ["education", "academics"], 18);
  const scope = education || context.text;
  const scopeLines = normalizeResumeLines(scope);
  const allLines = education ? scopeLines : context.lines;
  const educationSegments = flattenedEducationSegments(allLines);
  const inlineEducation = parseInlineEducationSegments(allLines);
  const degreeLine =
    inlineEducation.degreeLine ??
    educationSegments.find(isDegreeCandidate) ??
    findEducationSegmentBy(allLines, hasDegreeSignal) ??
    findEvidenceLine(allLines, DEGREE_REGEX) ??
    findEvidenceLine(allLines, DEGREE_ABBREVIATION_REGEX);
  const timelineLine =
    inlineEducation.timelineLine ??
    findEducationSegment(allLines, EDUCATION_TIMELINE_REGEX) ??
    findEvidenceLine(allLines, EDUCATION_TIMELINE_REGEX);
  const institutionLine =
    inlineEducation.institutionLine ??
    findInlineInstitutionSegment(allLines) ??
    findStructuralInstitutionLine(allLines);
  const academicPerformanceLine =
    inlineEducation.academicPerformanceLine ??
    findEducationSegment(allLines, EDUCATION_CGPA_REGEX) ??
    findEvidenceLine(allLines, EDUCATION_CGPA_REGEX);
  const fieldLine = findEvidenceLine(allLines, FIELD_REGEX);

  return {
    education,
    scope,
    degreeLine,
    institutionLine,
    timelineLine,
    academicPerformanceLine,
    fieldLine,
  };
}

type ProjectEntry = {
  title: string;
  lines: string[];
  hasTimeline: boolean;
  hasProofMarker: boolean;
};

function isTimelineLine(line: string) {
  return FLEXIBLE_YEAR_RANGE_REGEX.test(line) || /\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)\b.{0,20}\b(?:19|20)\d{2}\b/i.test(line);
}

function isProjectProofLine(line: string) {
  return (
    extractUrlEvidence(line).length > 0 ||
    hasVisibleLabel(line, [
      "github",
      "git hub",
      "repository",
      "repo",
      "source code",
      "live",
      "demo",
      "project link",
      "app link",
      "website",
    ]) ||
    hasArrowLinkMarker(line)
  );
}

function isLikelyProjectTitle(line: string, previousLine = "", nextLine = "") {
  const cleaned = line.replace(/^[•\-*–]\s*/, "").trim();

  if (
    !cleaned ||
    cleaned.length > 95 ||
    SECTION_HEADING_REGEX.test(cleaned) ||
    isTimelineLine(cleaned) ||
    isProjectProofLine(cleaned) ||
    /[.;]$/.test(cleaned) ||
    /\b(?:developed|built|created|designed|implemented|integrated|supports|allows|enables|using|with|through|by|for users|responsible)\b/i.test(cleaned)
  ) {
    return false;
  }

  const hasProjectNameSignal =
    /\b(?:planora|complaint|management system|system|platform|dashboard|app|application|website|portal|tracker|ai|ml|assistant|case study|analysis|model|automation)\b/i.test(
      cleaned
    );
  const hasAdjacentStructure =
    isTimelineLine(previousLine) ||
    isTimelineLine(nextLine) ||
    isProjectProofLine(previousLine) ||
    isProjectProofLine(nextLine);
  const titleCaseWords = cleaned
    .split(/\s+/)
    .filter((word) => /^[A-Z][A-Za-z0-9&()/-]*$/.test(word)).length;

  return hasProjectNameSignal || hasAdjacentStructure || titleCaseWords >= 2;
}

function extractProjectEntries(scope: string) {
  const lines = getLines(scope);
  const entries: ProjectEntry[] = [];
  let current: ProjectEntry | null = null;

  lines.forEach((line, index) => {
    const previousLine = lines[index - 1] ?? "";
    const nextLine = lines[index + 1] ?? "";

    if (SECTION_HEADING_REGEX.test(line)) {
      return;
    }

    if (isLikelyProjectTitle(line, previousLine, nextLine)) {
      if (current) entries.push(current);
      current = {
        title: line.replace(/[↗→➜➡›»]+.*/, "").trim(),
        lines: [line],
        hasTimeline: isTimelineLine(previousLine) || isTimelineLine(nextLine),
        hasProofMarker: isProjectProofLine(previousLine) || isProjectProofLine(nextLine),
      };
      return;
    }

    if (!current) return;

    current.lines.push(line);

    if (isTimelineLine(line)) {
      current.hasTimeline = true;
    }

    if (isProjectProofLine(line)) {
      current.hasProofMarker = true;
    }
  });

  if (current) entries.push(current);

  return entries.filter((entry) =>
    entry.lines.some((line) =>
      /\b(?:developed|built|created|designed|implemented|integrated|supports|allows|enables|workflow|feature|module|database|testing|documentation|responsive|frontend|full-stack|ai|recommendation|automation|srs|uml|dfd)\b/i.test(
        line
      )
    )
  );
}

function stripNonAchievementNumbers(line: string) {
  return line
    .replace(EMAIL_REGEX, " ")
    .replace(PHONE_REGEX, " ")
    .replace(YEAR_RANGE_REGEX, " ")
    .replace(/\b(?:19|20)\d{2}\b/g, " ")
    .replace(/\b(?:class|grade|standard|std\.?)\s*(?:10|12|x|xii)\b/gi, " ")
    .replace(/\b(?:10th|12th)\b/gi, " ")
    .replace(/\b(?:cgpa|gpa|sgpa)\s*:?\s*\d+(?:\.\d+)?(?:\s*\/\s*10)?\b/gi, " ")
    .replace(/\b\d+(?:\.\d+)?\s*\/\s*10\b/g, " ")
    .replace(/\bpage\s+\d+\b/gi, " ");
}

function hasMeaningfulAchievementNumber(line: string) {
  const cleaned = stripNonAchievementNumbers(line);

  return /\b(?:\d+(?:\.\d+)?%|\$?\d+(?:\.\d+)?\s?(?:k|m|million|billion|users|customers|clients|students|records|requests|transactions|revenue|hours|days|ms|seconds)|\d+\+)\b/i.test(
    cleaned
  );
}

function isQuantifiedAchievementLine(line: string) {
  return (
    hasMeaningfulAchievementNumber(line) &&
    (OUTCOME_WORD_REGEX.test(line) || SCALE_WORD_REGEX.test(line))
  );
}

function hasActualUrl(text: string, domains: string[]) {
  return domains.some((domain) =>
    new RegExp(`(?:https?:\\/\\/)?(?:www\\.)?${escapeRegExp(domain)}`, "i").test(
      text
    )
  );
}

function extractUrlEvidence(text: string) {
  const urlMatches = text.match(
    /\b(?:https?:\/\/|www\.)[^\s)]+|\b(?:github|gitlab)\.com\/[^\s)]+|\b[a-z0-9-]+\.(?:vercel\.app|netlify\.app|dev|app|io)\/?[^\s)]*/gi
  );

  return unique(urlMatches ?? []);
}

function hasVisibleLabel(text: string, labels: string[]) {
  return labels.some((label) =>
    new RegExp(`\\b${escapeRegExp(label)}(?:\\s*(?:link|profile|portfolio|repo))?\\b`, "i").test(
      text
    )
  );
}

function hasArrowLinkMarker(text: string) {
  return /[A-Za-z0-9][A-Za-z0-9 ._/-]{2,}\s*(?:->|→|↗|➜|➡|›|»)/i.test(text);
}

function makeCategory(
  name: string,
  score: number,
  maxScore: number,
  evidenceFound: string[],
  missingEvidence: string[],
  reason: string,
  suggestions: string[],
  breakdown?: ResumeScoreBreakdownItem[]
): ResumeCategoryScore {
  return {
    name,
    score: Math.max(0, Math.min(maxScore, score)),
    maxScore,
    evidenceFound: unique(evidenceFound),
    missingEvidence: unique(missingEvidence),
    reason,
    suggestions: unique(suggestions),
    breakdown,
  };
}

function gradeFor(score: number): ResumeAnalysisGrade {
  if (score >= 90) return "Excellent";
  if (score >= 80) return "Strong";
  if (score >= 70) return "Good";
  if (score >= 55) return "Average";
  return "Weak";
}

function readinessFor(score: number, redFlagCount: number): HiringReadiness {
  if (score >= 82 && redFlagCount <= 1) return "High";
  if (score >= 70 && redFlagCount <= 3) return "Good";
  if (score >= 55) return "Moderate";
  return "Low";
}

function detectProfileType(text: string) {
  const ranked = PROFILE_DEFINITIONS.map((profile) => ({
    profile,
    score:
      countMatches(text, profile.keywords).length * 2 +
      countMatches(text, profile.tools).length +
      countMatches(text, profile.methods).length,
  })).sort((a, b) => b.score - a.score);

  return ranked[0]?.score ? ranked[0].profile.name : "General";
}

function detectSeniority(text: string): ResumeSeniority {
  const lower = text.toLowerCase();
  const hasExperienceSection = hasSection(text, EXPERIENCE_SECTION_NAMES);
  const hasFullTimeSignal =
    hasExperienceSection ||
    /\b(?:full-time|professional experience|employment|work experience|company|associate|analyst|engineer|developer|designer|manager|consultant)\b/i.test(
      text
    );
  const hasInternshipSignal =
    /\b(?:intern|internship|trainee|apprentice)\b/i.test(text);
  const hasOtherPracticalSignal =
    /\b(?:freelance|client work|volunteer|open source|hackathon|competition|leadership)\b/i.test(
      text
    );
  const hasCurrentEducationSignal =
    /\b(?:student|undergraduate|currently pursuing|pursuing|expected|expected graduation|graduating|graduation|b\.?\s?tech|b\.?\s?e\.?|bachelor(?:\s+of\s+(?:technology|engineering))?|cse|computer science|engineering|college|university|institute|class 12|class xii|class 10|class x|cgpa|campus|college student)\b/i.test(
      text
    );
  const hasRecentGraduateSignal =
    /\b(?:fresher|entry level|new graduate|recent graduate|graduate trainee|recently graduated)\b/i.test(
      text
    );
  const hasProjectHeavyStudentSignal =
    hasSection(text, PROJECT_SECTION_NAMES) &&
    hasCurrentEducationSignal &&
    !hasFullTimeSignal;

  const experienceMatch = lower.match(/\b(\d{1,2})\+?\s*(?:years|yrs)\b/);
  const years = experienceMatch ? Number(experienceMatch[1]) : null;

  if (years !== null && years >= 8) return "Senior";
  if (years !== null && years >= 4) return "Mid Level";
  if (years !== null && years >= 1) return "Early Career";

  if (hasFullTimeSignal) return "Early Career";

  if (hasInternshipSignal && !hasCurrentEducationSignal) {
    return "Early Career";
  }

  if (hasRecentGraduateSignal && !hasFullTimeSignal) {
    return "Fresher";
  }

  if (hasInternshipSignal && hasCurrentEducationSignal) {
    return "Fresher";
  }

  if (hasCurrentEducationSignal || hasProjectHeavyStudentSignal) {
    return "Student";
  }

  if (hasOtherPracticalSignal) {
    return "Fresher";
  }

  return "Unknown";
}

function getProfileDefinition(name: string) {
  return (
    PROFILE_DEFINITIONS.find((profile) => profile.name === name) ??
    PROFILE_DEFINITIONS.find((profile) => profile.name === "General") ??
    PROFILE_DEFINITIONS[0]
  );
}

function buildContext(text: string): ResumeContext {
  const normalized = normalize(text);
  const lines = getLines(text);
  const bulletLines = lines.filter((line) => /^(?:[-*•]|\d+\.)\s+/.test(line));
  const profileType = detectProfileType(text);

  return {
    text,
    normalized,
    lower: text.toLowerCase(),
    lines,
    bulletLines,
    headerText: lines.slice(0, 20).join(" "),
    profileType,
    seniority: detectSeniority(text),
  };
}

function analyzeContact(context: ResumeContext) {
  const contactScope = `${context.headerText} ${extractNearbySection(context.text, [
    "contact",
    "links",
    "profiles",
  ], 8)}`;
  const hasEmail = EMAIL_REGEX.test(context.text);
  const hasPhone = PHONE_REGEX.test(context.text);
  const hasLocation =
    /\b(?:remote|india|usa|canada|uk|delhi|new delhi|mumbai|pune|bengaluru|bangalore|hyderabad|chennai|kolkata|noida|gurgaon|gurugram|ahmedabad|jaipur|chandigarh|lucknow|indore|bhopal|kochi|new york|london|toronto|san francisco)\b(?:\s*,\s*[a-z][a-z .-]+)?/i.test(
      contactScope
    );
  const actualLinkedIn = hasActualUrl(contactScope, ["linkedin.com"]);
  const visibleLinkedIn = hasVisibleLabel(contactScope, ["linkedin"]);
  const actualProfessionalProfile = hasActualUrl(contactScope, [
    "github.com",
    "gitlab.com",
    "leetcode.com",
    "behance.net",
    "dribbble.com",
    "medium.com",
    "kaggle.com",
    "scholar.google.com",
  ]);
  const visibleProfessionalProfile =
    hasVisibleLabel(contactScope, [
      "github",
      "git hub",
      "leetcode",
      "leet code",
      "portfolio",
      "behance",
      "dribbble",
      "medium",
      "kaggle",
      "google scholar",
    ]) || hasArrowLinkMarker(contactScope);
  const actualRelevantWebsite = hasActualUrl(contactScope, [
    "leetcode.com",
    "behance.net",
    "dribbble.com",
    "medium.com",
    "kaggle.com",
    "scholar.google.com",
    "notion.site",
    "vercel.app",
    "netlify.app",
  ]);
  const score =
    (hasEmail ? 2 : 0) +
    (hasPhone ? 2 : 0) +
    (hasLocation ? 1 : 0) +
    (actualLinkedIn ? 2 : visibleLinkedIn ? 1 : 0) +
    (actualProfessionalProfile ? 2 : visibleProfessionalProfile ? 1 : 0) +
    (actualRelevantWebsite ? 1 : 0);

  return makeCategory(
    "Contact & Professional Links",
    score,
    10,
    [
      hasEmail ? "Email found" : "",
      hasPhone ? "Phone found" : "",
      hasLocation ? "Location found in header" : "",
      actualLinkedIn
        ? "LinkedIn URL found"
        : visibleLinkedIn
          ? "LinkedIn label found without extracted URL"
          : "",
      actualProfessionalProfile
        ? "Professional profile URL found"
        : visibleProfessionalProfile
          ? "Professional profile label found without extracted URL"
          : "",
      actualRelevantWebsite ? "Relevant website or portfolio URL found" : "",
    ],
    [
      !hasEmail ? "Email missing" : "",
      !hasPhone ? "Phone missing" : "",
      !hasLocation ? "Location missing from header" : "",
      !visibleLinkedIn ? "LinkedIn URL or label missing" : "",
      !actualProfessionalProfile && !visibleProfessionalProfile
        ? "GitHub, portfolio, or relevant professional profile missing"
        : "",
      !actualRelevantWebsite
        ? "Personal website, Behance, Dribbble, Medium, Kaggle, Google Scholar, or similar URL missing"
        : "",
    ],
    `Awarded ${score}/10 from contact evidence in the header. Visible labels receive partial credit; project links outside the header are not counted.`,
    [
      "Put email, phone, location, LinkedIn, and the most relevant professional profile in the header.",
      !actualLinkedIn && visibleLinkedIn
        ? "Use the full LinkedIn URL so parsers preserve the destination."
        : "",
      visibleProfessionalProfile && !actualProfessionalProfile
        ? "Replace visible profile labels with full URLs."
        : "",
    ]
  );
}

function analyzeEducation(context: ResumeContext) {
  const {
    education,
    scope,
    degreeLine,
    institutionLine,
    timelineLine,
    academicPerformanceLine,
    fieldLine,
  } = extractEducationEvidence(context);
  const hasDegree = Boolean(degreeLine);
  const hasInstitution = Boolean(institutionLine);
  const hasTimeline = Boolean(timelineLine) || hasDateSignal(scope);
  const hasField = Boolean(fieldLine);
  const hasAcademicPerformance =
    Boolean(academicPerformanceLine) || EDUCATION_CGPA_REGEX.test(scope);
  const hasClass12 =
    /\b(?:class|grade|standard|std\.?|xii|12th|senior secondary|higher secondary|intermediate|cbse|isc|hsc)\b/i.test(
      scope
    ) && /\b(?:xii|12th|12|senior secondary|higher secondary|intermediate|cbse|isc|hsc)\b/i.test(scope);
  const hasClass10 =
    /\b(?:class|grade|standard|std\.?|x|10th|secondary|matriculation|cbse|icse|ssc)\b/i.test(
      scope
    ) && /\b(?:x|10th|10|secondary|matriculation|cbse|icse|ssc)\b/i.test(scope);
  const rawScore =
    (hasDegree ? 3 : 0) +
    (hasInstitution ? 2 : 0) +
    (hasTimeline ? 2 : 0) +
    (hasAcademicPerformance ? 1 : 0) +
    (hasClass12 ? 1 : 0) +
    (hasClass10 ? 1 : 0);
  const score =
    hasDegree && hasInstitution && hasTimeline && hasAcademicPerformance
      ? Math.max(8, rawScore)
      : hasDegree && hasInstitution && hasTimeline
        ? Math.max(7, rawScore)
        : rawScore;

  return makeCategory(
    "Education Strength",
    score,
    10,
    [
      hasDegree ? `Degree or program found${degreeLine ? `: ${degreeLine}` : ""}` : "",
      hasInstitution ? `Institution found${institutionLine ? `: ${institutionLine}` : ""}` : "",
      hasTimeline ? `Graduation timeline found${timelineLine ? `: ${timelineLine}` : ""}` : "",
      hasField ? `Relevant field or specialization found${fieldLine ? `: ${fieldLine}` : ""}` : "",
      hasAcademicPerformance ? `Academic performance found${academicPerformanceLine ? `: ${academicPerformanceLine}` : ""}` : "",
      hasClass12 ? "Class 12 or equivalent found" : "",
      hasClass10 ? "Class 10 or equivalent found" : "",
    ],
    [
      !hasDegree ? "Degree or program missing" : "",
      !hasInstitution ? "Institution missing" : "",
      !hasTimeline ? "Graduation timeline missing" : "",
      !hasField ? "Relevant specialization, major, or field missing" : "",
      !hasAcademicPerformance ? "CGPA, percentage, or academic performance missing" : "",
      !hasClass12 ? "Class 12 or equivalent missing" : "",
      !hasClass10 ? "Class 10 or equivalent missing" : "",
    ],
    `Awarded ${score}/10 from ${education ? "the education area" : "resume-wide education evidence"}. Degree, institution, and timeline evidence create a 7/10 floor; adding CGPA or percentage creates an 8/10 floor.`,
    [
      !hasAcademicPerformance ? "Add CGPA, percentage, honors, or another credible academic performance signal." : "",
      !hasClass12 && context.seniority !== "Senior" ? "Add Class 12 or equivalent if it strengthens a student/fresher resume." : "",
      !hasClass10 && context.seniority !== "Senior" ? "Add Class 10 or equivalent if space allows." : "",
    ]
  );
}

function analyzeSkills(context: ResumeContext) {
  const profile = getProfileDefinition(context.profileType);
  const skillsSection = extractSection(context.text, [
    "skills",
    "technical skills",
    "core skills",
  ]);
  const scope = skillsSection || context.text;
  const profileSpecificSkills = countMatches(scope, [
    ...profile.tools,
    ...profile.methods,
  ]);
  const profileKeywordSkills = countMatches(scope, profile.keywords);
  const specificToolSkills = countMatches(scope, SPECIFIC_SKILL_TERMS);
  const lightSkills = countMatches(scope, LIGHT_SKILL_TERMS);
  const generalSkills = countMatches(scope, GENERAL_HARD_SKILLS);
  const vagueSkills = countMatches(scope, VAGUE_SKILLS);
  const hasSkillsSection = Boolean(skillsSection) || hasSection(context.text, ["skills", "technical skills", "core skills"]);
  const organized =
    /(?:tools|languages|methods|platforms|frameworks|certifications|software|design|analytics|business)\s*[:|-]/i.test(
      scope
    ) || (scope.match(/[,|•]/g)?.length ?? 0) >= 4;
  const specificSkillCount = unique([
    ...profileSpecificSkills,
    ...specificToolSkills,
  ]).length;
  const roleRelevantCount = unique([
    ...profileSpecificSkills,
    ...profileKeywordSkills.filter((skill) => !lightSkills.includes(skill)),
  ]).length;
  const genericSignalCount = unique([...lightSkills, ...generalSkills]).length;
  const mostlyGeneric =
    genericSignalCount >= Math.max(4, specificSkillCount * 2) ||
    (specificSkillCount < 5 && genericSignalCount >= specificSkillCount);
  const hasStrongBreadth = specificToolSkills.length >= 7 && specificSkillCount >= 8;
  const hasClearRoleRelevance = roleRelevantCount >= 5;
  const hasExcellentSkillEvidence =
    hasSkillsSection && organized && hasStrongBreadth && hasClearRoleRelevance;
  const incompleteSpecificEvidence =
    specificSkillCount < 8 || specificToolSkills.length < 6 || roleRelevantCount < 5;
  const rawScore =
    (hasSkillsSection ? 3 : 0) +
    (roleRelevantCount >= 6 ? 4 : roleRelevantCount >= 4 ? 3 : roleRelevantCount >= 2 ? 2 : roleRelevantCount >= 1 ? 1 : 0) +
    (specificToolSkills.length >= 5 ? 3 : specificToolSkills.length >= 3 ? 2 : specificToolSkills.length >= 1 ? 1 : 0) +
    (specificSkillCount >= 7 && vagueSkills.length === 0 ? 3 : specificSkillCount >= 4 ? 2 : specificSkillCount >= 2 ? 1 : 0) +
    (organized ? 2 : 0);
  let scoreCap = 15;

  if (mostlyGeneric) {
    scoreCap = 10;
  } else if (!hasExcellentSkillEvidence && specificSkillCount >= 3) {
    scoreCap = 12;
  }

  if (!organized || incompleteSpecificEvidence) {
    scoreCap = Math.min(scoreCap, 12);
  }

  const score = Math.min(rawScore, scoreCap);

  return makeCategory(
    "Skills Quality",
    score,
    15,
    [
      hasSkillsSection ? "Skills section found" : "",
      roleRelevantCount ? `Role-relevant specific skills: ${unique([...profileSpecificSkills, ...profileKeywordSkills]).slice(0, 8).join(", ")}` : "",
      specificToolSkills.length ? `Specific tools/methods: ${specificToolSkills.slice(0, 10).join(", ")}` : "",
      lightSkills.length ? `Light/generic skill signals: ${lightSkills.slice(0, 8).join(", ")}` : "",
      generalSkills.length ? `General hard skills: ${generalSkills.slice(0, 6).join(", ")}` : "",
      organized ? "Skills are organized or readable" : "",
    ],
    [
      !hasSkillsSection ? "Dedicated skills section missing" : "",
      roleRelevantCount < 3 ? "Role-relevant specific hard skills are thin" : "",
      specificToolSkills.length < 3 ? "Specific tools, platforms, frameworks, or domain methods are limited" : "",
      mostlyGeneric ? "Most detected skills are generic or light signals" : "",
      !hasStrongBreadth ? "Specific tools/frameworks/methods do not show enough breadth for an excellent score" : "",
      !hasClearRoleRelevance ? "Clear role relevance is incomplete" : "",
      vagueSkills.length ? `Vague skills detected: ${vagueSkills.join(", ")}` : "",
      !organized ? "Skills are not grouped or easy to scan" : "",
    ],
    `Awarded ${score}/15 for ${context.profileType} skill evidence. Generic terms count lightly; 14-15 requires organized skills, broad specific tools/methods, and clear role relevance.`,
    [
      "Group skills by domain, tools, methods, and platforms.",
      roleRelevantCount < 3 ? `Add more ${context.profileType}-relevant hard skills backed by projects or work.` : "",
      vagueSkills.length ? "Replace vague soft skills with concrete tools, methods, or evidence-backed capabilities." : "",
    ]
  );
}

function analyzeProjects(context: ResumeContext) {
  const projectSection = extractFlexibleSection(context.text, PROJECT_SECTION_NAMES, 90);
  const scope = projectSection || context.text;
  const lines = getLines(scope);
  const projectEntries = extractProjectEntries(scope);
  const projectTerms = [
    "project",
    "case study",
    "portfolio",
    "campaign",
    "analysis",
    "research",
    "model",
    "dashboard",
    "app",
    "system",
    "study",
    "prototype",
    "publication",
    "presentation",
  ];
  const projectSignals = countMatches(scope, projectTerms).length;
  const hasProjectSection = Boolean(projectSection) || hasSection(context.text, PROJECT_SECTION_NAMES);
  const projectTitleLines = unique([
    ...projectEntries.map((entry) => entry.title),
    ...lines.filter(
    (line) =>
      line.length <= 90 &&
      /\b(?:project|system|app|platform|dashboard|case study|portfolio|analysis|model|planora|management)\b/i.test(
        line
      )
    ),
  ]);
  const descriptionLines = lines.filter(
    (line) =>
      line.length > 30 &&
      /\b(?:built|created|designed|analyzed|researched|implemented|developed|conducted|launched|planned|optimized|managed|allows|enables|provides|tracks|generates|uses|integrates|supports|workflow|feature|module|dashboard|system|application|platform|complaint|management|frontend|full-stack|full stack|database|testing|documentation|recommendation|automation|timer|planning|srs|uml|dfd|responsive|role-based|role based)\b/i.test(
        line
      )
  );
  const estimatedProjectCount = Math.max(
    projectEntries.length,
    projectTitleLines.length,
    Math.min(3, descriptionLines.length),
    hasProjectSection && descriptionLines.length ? 1 : 0
  );
  const profile = getProfileDefinition(context.profileType);
  const tools = countMatches(scope, [
    ...profile.tools,
    ...profile.methods,
    ...SPECIFIC_SKILL_TERMS,
    ...GENERAL_HARD_SKILLS,
    "api",
    "apis",
    "database",
    "database integration",
    "schema",
    "authentication",
    "authorization",
    "role-based",
    "role based",
    "ai",
    "ml",
    "llm",
    "ui",
    "frontend",
    "full-stack",
    "full stack",
    "srs",
    "uml",
    "dfd",
    "testing",
    "documentation",
    "workflow",
    "workflows",
    "automation",
    "recommendation",
    "recommendations",
  ]);
  const proofScope = projectSection
    ? scope
    : lines
        .filter((line) =>
          /\b(?:project|system|app|platform|dashboard|case study|portfolio|analysis|model|github|gitlab|repository|repo|source code|live|demo|deployed|website|project link|planora|management)\b/i.test(
            line
          )
        )
        .join("\n");
  const proofUrls = extractUrlEvidence(proofScope);
  const actualProof =
    proofUrls.length > 0 ||
    hasActualUrl(proofScope, [
      "github.com",
      "gitlab.com",
      "behance.net",
      "dribbble.com",
      "medium.com",
      "kaggle.com",
      "scholar.google.com",
      "vercel.app",
      "netlify.app",
    ]);
  const proofLabels = countMatches(proofScope, [
    "github",
    "gitlab",
    "repository",
    "repo",
    "source code",
    "portfolio",
    "demo",
    "live",
    "live project",
    "deployed",
    "website",
    "app link",
    "project link",
    "case study",
    "publication",
    "kaggle",
    "behance",
    "dribbble",
    "medium",
    "scholar",
  ]);
  const visibleProof =
    proofLabels.length > 0 ||
    hasArrowLinkMarker(proofScope) ||
    projectEntries.some((entry) => entry.hasProofMarker);
  const complexitySignals = countMatches(scope, [
    "feature",
    "features",
    "module",
    "modules",
    "integration",
    "integrations",
    "authentication",
    "authorization",
    "login",
    "database",
    "database design",
    "schema",
    "api",
    "apis",
    "research",
    "methodology",
    "campaign",
    "valuation",
    "dashboard",
    "dashboards",
    "ui",
    "frontend",
    "full-stack",
    "full stack",
    "prototype",
    "user research",
    "financial modeling",
    "optimization",
    "automation",
    "experiment",
    "analysis",
    "analytical",
    "strategy",
    "workflow",
    "workflows",
    "registration",
    "tracking",
    "resolution",
    "testing",
    "documentation",
    "srs",
    "uml",
    "dfd",
    "client",
    "ai",
    "ml",
    "machine learning",
    "llm",
    "recommendation",
    "recommendations",
    "timer",
    "planning",
    "productivity",
    "real-time",
    "role based",
    "role-based",
    "business process",
    "ux process",
    "wireframe",
    "analytics",
  ]);
  const impactLines = lines.filter(isQuantifiedAchievementLine);
  const actionLines = lines.filter((line) =>
    ACTION_VERBS.some((verb) => new RegExp(`\\b${verb}\\b`, "i").test(line))
  );
  const projectExistenceScore =
    projectEntries.length >= 2
      ? 3
      : hasProjectSection && descriptionLines.length >= 1
      ? 3
      : hasProjectSection || projectTitleLines.length >= 1 || projectSignals >= 2
        ? 2
        : projectSignals === 1
          ? 1
          : 0;
  const rawScore =
    projectExistenceScore +
    (descriptionLines.length >= 3 ? 3 : descriptionLines.length >= 1 ? 2 : 0) +
    (tools.length >= 4 ? 3 : tools.length >= 2 ? 2 : tools.length >= 1 ? 1 : 0) +
    (actualProof ? 3 : visibleProof ? 2 : 0) +
    (complexitySignals.length >= 6 ? 4 : complexitySignals.length >= 3 ? 3 : complexitySignals.length >= 1 ? 2 : 0) +
    (impactLines.length >= 2 ? 2 : impactLines.length === 1 ? 1 : 0) +
    (actionLines.length >= 3 ? 2 : actionLines.length >= 1 ? 1 : 0);
  const basicStudentProject =
    projectExistenceScore >= 2 && (descriptionLines.length >= 1 || tools.length >= 1);
  const goodStudentProject =
    projectExistenceScore >= 3 &&
    descriptionLines.length >= 1 &&
    tools.length >= 2 &&
    complexitySignals.length >= 2;
  const substantialStudentProject =
    projectExistenceScore >= 3 &&
    descriptionLines.length >= 2 &&
    tools.length >= 3 &&
    complexitySignals.length >= 3;
  const detailedStudentProjects =
    estimatedProjectCount >= 2 &&
    descriptionLines.length >= 3 &&
    complexitySignals.length >= 5 &&
    (visibleProof || actualProof || projectEntries.some((entry) => entry.hasTimeline));
  const projectWithProof =
    projectExistenceScore >= 2 &&
    descriptionLines.length >= 1 &&
    (tools.length >= 2 || complexitySignals.length >= 4) &&
    (actualProof || visibleProof);
  const strongProjectEvidence =
    substantialStudentProject && (actualProof || visibleProof);
  const exceptionalProjectEvidence =
    strongProjectEvidence && actualProof && impactLines.length >= 2;
  let projectCap = 20;

  if (!actualProof && !visibleProof) {
    projectCap = Math.min(projectCap, 17);
  }

  if (complexitySignals.length < 3) {
    projectCap = Math.min(projectCap, 16);
  }

  if (impactLines.length === 0 && !strongProjectEvidence) {
    projectCap = Math.min(projectCap, 16);
  }

  if (!actualProof && !visibleProof && impactLines.length === 0) {
    projectCap = Math.min(projectCap, 14);
  }

  if (!actualProof && !visibleProof && complexitySignals.length < 3) {
    projectCap = Math.min(projectCap, 12);
  }

  const calibratedFloor = exceptionalProjectEvidence
    ? 18
    : strongProjectEvidence && impactLines.length >= 1
      ? 14
      : strongProjectEvidence
        ? 13
        : detailedStudentProjects
          ? 11
        : projectWithProof
          ? 10
          : goodStudentProject
            ? 8
            : basicStudentProject
              ? 6
              : 0;
  const score = Math.min(
    Math.max(rawScore, calibratedFloor),
    projectCap
  );

  return makeCategory(
    "Projects / Portfolio Work Quality",
    score,
    20,
    [
      hasProjectSection ? "Projects, portfolio, case studies, or selected work section found" : "",
      estimatedProjectCount ? `Estimated project count: ${estimatedProjectCount}` : "",
      projectEntries.length ? `Detected project titles: ${projectEntries.map((entry) => entry.title).slice(0, 4).join(", ")}` : "",
      projectEntries.length ? `Project bullet/detail counts: ${projectEntries.map((entry) => `${entry.title}: ${Math.max(0, entry.lines.length - 1)}`).slice(0, 4).join("; ")}` : "",
      projectEntries.some((entry) => entry.hasTimeline) ? "Structured project timeline(s) found" : "",
      projectTitleLines.length ? `${projectTitleLines.length} project title/name signal(s)` : "",
      descriptionLines.length ? `${descriptionLines.length} clear project/work sample description line(s)` : "",
      tools.length ? `Tools/methods used: ${tools.slice(0, 8).join(", ")}` : "",
      actualProof ? `Project proof URL(s): ${proofUrls.slice(0, 3).join(", ") || "URL detected"}` : visibleProof ? `Project proof label(s): ${proofLabels.slice(0, 6).join(", ") || "visible proof marker"}` : "",
      complexitySignals.length ? `Complexity signals: ${complexitySignals.slice(0, 8).join(", ")}` : "",
      impactLines.length ? `${impactLines.length} quantified project outcome line(s)` : "",
      actionLines.length ? `${actionLines.length} project/action line(s) use strong verbs` : "",
    ],
    [
      projectExistenceScore < 2 ? "Meaningful projects, case studies, or work samples not clearly found" : "",
      descriptionLines.length < 1 ? "Project purpose, functionality, or workflow is not clearly described" : "",
      tools.length < 2 ? "Tools, methods, or process are not clear enough" : "",
      !actualProof && !visibleProof ? "Project proof links or proof labels missing near project text" : "",
      complexitySignals.length < 2 ? "Depth or complexity is not strongly evidenced" : "",
      impactLines.length === 0 ? "Measurable project outcomes are missing" : "",
      actionLines.length < 2 ? "Project bullets need stronger action verbs" : "",
    ],
    `Awarded ${score}/20 for ${context.profileType} projects/portfolio evidence. Detected about ${estimatedProjectCount} project(s), ${tools.length} tool/method signal(s), ${actualProof ? proofUrls.length || 1 : visibleProof ? proofLabels.length || 1 : 0} proof signal(s), ${complexitySignals.length} complexity signal(s), and ${impactLines.length} quantified outcome line(s).`,
    [
      "For each project or case study, include problem, role, tools/methods, process, result, and proof link.",
      !actualProof && visibleProof ? "Use full URLs for proof links where possible." : "",
      impactLines.length === 0 ? "Add measurable outcomes when credible, but do not invent metrics." : "",
    ]
  );
}

function analyzeExperience(context: ResumeContext) {
  const experience = extractSection(context.text, EXPERIENCE_SECTION_NAMES);
  const hasExplicitSection = Boolean(experience) || hasSection(context.text, EXPERIENCE_SECTION_NAMES);

  if (!hasExplicitSection) {
    const looseSignal = /\b(?:intern|freelance|volunteer|open source|hackathon|client|competition|leadership)\b/i.test(
      context.text
    );
    const score = looseSignal ? 4 : 0;

    return makeCategory(
      "Experience / Practical Work",
      score,
      15,
      looseSignal ? ["Loose practical-work signals found outside an explicit section"] : [],
      ["Explicit practical-work section missing"],
      "No explicit Experience, Internship, Work, Freelance, Volunteer, Open Source, Hackathon, Leadership, or Client Work section was detected; this category is capped at 4/15 so Projects are not counted as Experience.",
      ["Add a clearly labeled practical-work section for internships, volunteering, competitions, open source, leadership, freelance, or client responsibilities."]
    );
  }

  const scope = experience || context.text;
  const hasRoleOrg =
    /\b(?:intern|associate|analyst|designer|developer|engineer|manager|lead|volunteer|coordinator|consultant|researcher|assistant|freelancer)\b/i.test(
      scope
    ) && /\b(?:at|@|company|labs|technologies|foundation|club|cell|organization|university|college|client)\b/i.test(scope);
  const hasDates = hasDateSignal(scope);
  const responsibilityLines = getLines(scope).filter((line) =>
    /\b(?:managed|built|analyzed|designed|created|coordinated|led|conducted|supported|implemented|researched|delivered)\b/i.test(
      line
    )
  );
  const outcomeLines = getLines(scope).filter(
    (line) => isQuantifiedAchievementLine(line) || OUTCOME_WORD_REGEX.test(line)
  );
  const score =
    5 +
    (hasRoleOrg ? 3 : 0) +
    (hasDates ? 2 : 0) +
    (responsibilityLines.length ? 2 : 0) +
    (outcomeLines.length >= 2 ? 3 : outcomeLines.length === 1 ? 2 : 0);

  return makeCategory(
    "Experience / Practical Work",
    score,
    15,
    [
      "Explicit practical-work section found",
      hasRoleOrg ? "Role/title and organization found" : "",
      hasDates ? "Dates or duration found" : "",
      responsibilityLines.length ? `${responsibilityLines.length} responsibility line(s) found` : "",
      outcomeLines.length ? `${outcomeLines.length} outcome line(s) found` : "",
    ],
    [
      !hasRoleOrg ? "Organization/title/role unclear" : "",
      !hasDates ? "Dates or duration missing" : "",
      !responsibilityLines.length ? "Responsibilities are unclear" : "",
      !outcomeLines.length ? "Outcomes or impact missing" : "",
    ],
    `Awarded ${score}/15 from explicit practical-work evidence. Projects are not counted here unless they are clearly labeled as practical responsibility.`,
    ["Write each role with title, organization, dates, responsibilities, and outcomes."]
  );
}

function analyzeImpact(context: ResumeContext) {
  const quantifiedLines = context.lines.filter(isQuantifiedAchievementLine);
  const qualitativeLines = context.lines.filter(
    (line) => OUTCOME_WORD_REGEX.test(line) && !isQuantifiedAchievementLine(line)
  );
  const recognitionLines = context.lines.filter((line) =>
    /\b(?:award|rank|winner|won|publication|published|certification|certified|scholarship|honor|selected|finalist)\b/i.test(
      line
    )
  );
  const genericLines = context.lines.filter((line) =>
    /\b(?:worked on|responsible for|helped with|good understanding|made a project|developed responsive|team player|quick learner)\b/i.test(
      line
    )
  );
  const score =
    (quantifiedLines.length >= 3 ? 4 : quantifiedLines.length >= 1 ? 2 : 0) +
    (qualitativeLines.length >= 3 ? 3 : qualitativeLines.length >= 1 ? 2 : 0) +
    (recognitionLines.length >= 2 ? 2 : recognitionLines.length === 1 ? 1 : 0) +
    (genericLines.length === 0 ? 1 : 0);

  return makeCategory(
    "Impact & Achievements",
    score,
    10,
    [
      quantifiedLines.length ? `${quantifiedLines.length} quantified achievement line(s)` : "",
      qualitativeLines.length ? `${qualitativeLines.length} qualitative outcome line(s)` : "",
      recognitionLines.length ? `${recognitionLines.length} recognition/certification/publication line(s)` : "",
      genericLines.length === 0 ? "Generic claims are limited" : "",
    ],
    [
      quantifiedLines.length === 0 ? "No quantified achievements tied to outcomes" : "",
      qualitativeLines.length === 0 ? "Qualitative outcomes are not clear" : "",
      recognitionLines.length === 0 ? "Awards, rankings, publications, certifications, or recognition missing" : "",
      genericLines.length > 0 ? "Generic claims detected" : "",
    ],
    `Awarded ${score}/10. Dates, graduation years, phone numbers, page numbers, CGPA, and isolated percentages are ignored as achievement metrics.`,
    ["Convert task statements into outcome statements with scale, quality, speed, customer, research, campaign, or business results."]
  );
}

function analyzeFormatting(context: ResumeContext) {
  const wordCount = context.normalized.split(/\s+/).filter(Boolean).length;
  const sectionCount = [
    "education",
    "skills",
    "projects",
    "experience",
    "achievements",
    "certifications",
    "summary",
  ].filter((sectionName) => hasSection(context.text, [sectionName])).length;
  const hasBullets = BULLET_REGEX.test(context.text) || context.bulletLines.length >= 2;
  const hasTextExtraction = context.text.length > 150;
  const appropriateLength =
    context.seniority === "Student" || context.seniority === "Fresher"
      ? wordCount >= 220 && wordCount <= 900
      : wordCount >= 300 && wordCount <= 1400;
  const spacingRiskCount = context.lines.filter((line) => /\s{12,}/.test(line)).length;
  const longLineRisk = context.lines.some((line) => line.length > 160);
  const parsingRisk = /[│┌┬┐└┴┘]/.test(context.text) || spacingRiskCount >= 2 || longLineRisk;
  const dateLines = context.lines.filter((line) => hasDateSignal(line));
  const consistentSpacingDates = dateLines.length > 0 && spacingRiskCount <= 1;
  const score =
    (hasTextExtraction ? 3 : 0) +
    (sectionCount >= 4 ? 2 : sectionCount >= 2 ? 1 : 0) +
    (hasBullets ? 2 : 0) +
    (appropriateLength ? 1 : 0) +
    (!parsingRisk ? 1 : 0) +
    (consistentSpacingDates ? 1 : 0);

  return makeCategory(
    "ATS Formatting",
    score,
    10,
    [
      hasTextExtraction ? "Text extraction successful" : "",
      sectionCount ? `${sectionCount} clear section heading(s) detected` : "",
      hasBullets ? "Bullet/list structure detected" : "",
      appropriateLength ? `Appropriate length at about ${wordCount} words` : "",
      !parsingRisk ? "No major parsing-risk layout detected" : "",
      consistentSpacingDates ? "Dates and spacing look reasonably consistent" : "",
    ],
    [
      !hasTextExtraction ? "Text extraction failed or produced too little text" : "",
      sectionCount < 2 ? "Clear section headings missing" : "",
      !hasBullets ? "Bullet/list readability is weak" : "",
      !appropriateLength ? `Length may be off for this seniority at about ${wordCount} words` : "",
      parsingRisk ? "Two-column/table/spacing parsing risk detected" : "",
      !consistentSpacingDates ? "Dates or spacing appear inconsistent" : "",
    ],
    `Awarded ${score}/10: text extraction, headings, bullets, length, parsing risk, and date/spacing consistency are scored separately.`,
    ["Use standard headings, simple bullets, consistent dates, and a single-column ATS-friendly layout."]
  );
}

function analyzeKeywords(context: ResumeContext) {
  const profile = getProfileDefinition(context.profileType);
  const domainKeywords = countMatches(context.text, profile.keywords);
  const tools = countMatches(context.text, profile.tools);
  const methods = countMatches(context.text, profile.methods);
  const repeatedKeywordCount = profile.keywords.reduce((total, keyword) => {
    const matches = context.lower.match(new RegExp(`\\b${escapeRegExp(keyword.toLowerCase())}\\b`, "g"));
    return total + (matches && matches.length > 8 ? 1 : 0);
  }, 0);
  const stuffingFree = repeatedKeywordCount === 0;
  const score =
    (domainKeywords.length >= 5 ? 4 : domainKeywords.length >= 3 ? 3 : domainKeywords.length >= 1 ? 1 : 0) +
    (tools.length >= 4 ? 3 : tools.length >= 2 ? 2 : tools.length === 1 ? 1 : 0) +
    (methods.length >= 3 ? 2 : methods.length >= 1 ? 1 : 0) +
    (stuffingFree ? 1 : 0);

  return makeCategory(
    "General Keyword Relevance",
    score,
    10,
    [
      `Detected profile: ${context.profileType}`,
      domainKeywords.length ? `Domain keywords: ${domainKeywords.slice(0, 8).join(", ")}` : "",
      tools.length ? `Relevant tools/platforms: ${tools.slice(0, 8).join(", ")}` : "",
      methods.length ? `Methods/terminology: ${methods.slice(0, 8).join(", ")}` : "",
      stuffingFree ? "No obvious keyword stuffing" : "",
    ],
    [
      domainKeywords.length < 3 ? "Role/domain keywords are limited" : "",
      tools.length < 2 ? "Relevant tools or platforms are limited" : "",
      methods.length < 1 ? "Domain-specific methods or terminology are limited" : "",
      !stuffingFree ? "Possible keyword stuffing detected" : "",
    ],
    `Awarded ${score}/10 for ${context.profileType} keyword relevance without defaulting to software-only terms.`,
    [`Tailor keywords toward the target ${context.profileType} role while keeping them evidence-backed.`]
  );
}

function analyzeBulletQuality(context: ResumeContext) {
  const candidateLines = context.bulletLines.length
    ? context.bulletLines
    : context.lines.filter((line) => line.length > 35);
  const actionLines = candidateLines.filter((line) =>
    ACTION_VERBS.some((verb) => new RegExp(`\\b${verb}\\b`, "i").test(line))
  );
  const whatLines = candidateLines.filter((line) =>
    /\b(?:built|created|designed|managed|analyzed|researched|implemented|developed|conducted|led|planned|delivered|supported)\b/i.test(
      line
    )
  );
  const howLines = candidateLines.filter((line) =>
    /\b(?:using|with|through|by|via|leveraging|based on|including)\b/i.test(line)
  );
  const resultLines = candidateLines.filter(
    (line) => isQuantifiedAchievementLine(line) || OUTCOME_WORD_REGEX.test(line)
  );
  const completeLines = candidateLines.filter(
    (line) =>
      ACTION_VERBS.some((verb) => new RegExp(`\\b${verb}\\b`, "i").test(line)) &&
      /\b(?:using|with|through|by|via|leveraging|based on|including)\b/i.test(line) &&
      (isQuantifiedAchievementLine(line) || OUTCOME_WORD_REGEX.test(line))
  );
  const meaningfulBulletCount = Math.max(candidateLines.length, 1);
  const weakResultEvidence =
    resultLines.length < Math.ceil(meaningfulBulletCount * 0.4);
  const consistentCompleteEvidence =
    completeLines.length >= Math.ceil(meaningfulBulletCount * 0.6) &&
    resultLines.length >= Math.ceil(meaningfulBulletCount * 0.6);
  const rawScore =
    (actionLines.length >= 4 ? 3 : actionLines.length >= 2 ? 2 : actionLines.length === 1 ? 1 : 0) +
    (whatLines.length >= 4 ? 3 : whatLines.length >= 2 ? 2 : whatLines.length === 1 ? 1 : 0) +
    (howLines.length >= 3 ? 2 : howLines.length >= 1 ? 1 : 0) +
    (resultLines.length >= 2 ? 2 : resultLines.length === 1 ? 1 : 0);
  const taskOnlyBullets = actionLines.length >= 2 && resultLines.length === 0;
  let scoreCap = 10;

  if (resultLines.length === 0) {
    scoreCap = 6;
  } else if (weakResultEvidence) {
    scoreCap = 7;
  } else if (!consistentCompleteEvidence) {
    scoreCap = 8;
  }

  const score = Math.min(rawScore, scoreCap);

  return makeCategory(
    "Bullet Quality",
    score,
    10,
    [
      actionLines.length ? `${actionLines.length} bullet/line(s) use action verbs` : "",
      whatLines.length ? `${whatLines.length} bullet/line(s) explain what was done` : "",
      howLines.length ? `${howLines.length} bullet/line(s) explain how it was done` : "",
      resultLines.length ? `${resultLines.length} bullet/line(s) explain result or impact` : "",
      completeLines.length ? `${completeLines.length} bullet/line(s) combine action, method, and result` : "",
      consistentCompleteEvidence ? "Most bullets combine what, how, and result/impact" : "",
    ],
    [
      actionLines.length < 2 ? "Action verbs are limited" : "",
      whatLines.length < 2 ? "Bullets do not consistently explain what was done" : "",
      howLines.length < 1 ? "Bullets rarely explain tools, methods, or process" : "",
      resultLines.length < 1 ? "Bullets rarely explain result or impact" : "",
      taskOnlyBullets ? "Bullets mostly describe tasks without measurable or qualitative results" : "",
      weakResultEvidence ? "Result/impact evidence appears in too few bullets" : "",
      !consistentCompleteEvidence ? "Most bullets do not yet combine what, how, and result/impact" : "",
    ],
    `Awarded ${score}/10 across action verbs, what/how/result clarity, and impact framing. Scores of 9-10 require most bullets to show what was done, how it was done, and the result/impact.`,
    ["Rewrite bullets in action + scope + method + result form."]
  );
}

function buildRedFlags(categories: ResumeCategoryScore[], context: ResumeContext) {
  const byName = (name: string) => categories.find((item) => item.name === name);
  const flags = [
    (byName("Contact & Professional Links")?.score ?? 0) < 7
      ? "Missing professional links"
      : "",
    (byName("Experience / Practical Work")?.score ?? 0) <= 4
      ? "No explicit practical experience"
      : "",
    (byName("Bullet Quality")?.score ?? 0) < 5
      ? "Generic or underdeveloped bullets"
      : "",
    (byName("Impact & Achievements")?.score ?? 0) < 4
      ? "No quantified impact"
      : "",
    (byName("Skills Quality")?.score ?? 0) < 8
      ? "Weak or vague skills section"
      : "",
    (byName("Projects / Portfolio Work Quality")?.missingEvidence ?? []).some((item) =>
      item.toLowerCase().includes("proof")
    )
      ? "Missing proof links"
      : "",
    (byName("General Keyword Relevance")?.score ?? 0) < 5
      ? "Unclear target direction"
      : "",
    /\b(?:manger|recieve|acheive|responsiblity|experiance|collage)\b/i.test(context.text)
      ? "Obvious spelling or grammar issues"
      : "",
    (byName("ATS Formatting")?.score ?? 0) < 7
      ? "Inconsistent dates or formatting"
      : "",
  ];

  return unique(flags);
}

function buildSummary(
  score: number,
  grade: ResumeAnalysisGrade,
  readiness: HiringReadiness,
  context: ResumeContext
) {
  return `This ${context.seniority.toLowerCase()} resume appears closest to a ${context.profileType} profile. It is currently ${grade.toLowerCase()} with ${readiness.toLowerCase()} hiring readiness based on evidence quality, practical proof, achievements, formatting, and keyword relevance.`;
}

function buildRewriteSuggestions(context: ResumeContext): ResumeRewriteSuggestion[] {
  const genericLine =
    context.lines.find((line) =>
      /\b(?:worked on|responsible for|helped with|made a project|developed responsive|good understanding)\b/i.test(
        line
      )
    ) ?? "Worked on a project related to my field.";

  return [
    {
      originalProblem: genericLine,
      suggestedRewrite:
        "Built a role-relevant project using specific tools and methods, explaining the problem, my contribution, and the measurable or observable result.",
      whyBetter:
        "The rewrite forces evidence: scope, tools, ownership, and outcome instead of a generic task claim.",
      before: genericLine,
      after:
        "Built a role-relevant project using specific tools and methods, explaining the problem, my contribution, and the measurable or observable result.",
    },
    {
      originalProblem: "Skills listed without proof.",
      suggestedRewrite:
        "Connect each major skill to a project, internship, campaign, case study, research output, or responsibility.",
      whyBetter:
        "Recruiters trust skills more when the resume shows where they were applied.",
      before: "Skills listed without proof.",
      after:
        "Connect each major skill to a project, internship, campaign, case study, research output, or responsibility.",
    },
  ];
}

function capEvidenceInflation(
  score: number,
  categories: ResumeCategoryScore[],
  redFlags: string[]
) {
  const byName = (name: string) => categories.find((item) => item.name === name);
  const impact = byName("Impact & Achievements");
  const projects = byName("Projects / Portfolio Work Quality");
  const experience = byName("Experience / Practical Work");
  const contact = byName("Contact & Professional Links");
  let cappedScore = score;

  const hasQuantifiedImpact = !impact?.missingEvidence.some((item) =>
    item.toLowerCase().includes("no quantified achievements")
  );
  const hasProofLinks = !projects?.missingEvidence.some((item) =>
    item.toLowerCase().includes("proof")
  );
  const hasPracticalEvidence = (experience?.score ?? 0) > 4;
  const hasClearPositioning = (byName("General Keyword Relevance")?.score ?? 0) >= 7;

  if (!hasQuantifiedImpact || !hasProofLinks || !hasPracticalEvidence || !hasClearPositioning) {
    cappedScore = Math.min(cappedScore, 84);
  }

  if (!hasQuantifiedImpact && !hasProofLinks) {
    cappedScore = Math.min(cappedScore, 78);
  }

  if ((contact?.score ?? 0) <= 5 || redFlags.length >= 5) {
    cappedScore = Math.min(cappedScore, 74);
  }

  if ((byName("ATS Formatting")?.score ?? 0) < 5) {
    cappedScore = Math.min(cappedScore, 69);
  }

  return cappedScore;
}

export function analyzeResume(text: string): ResumeDiagnostics {
  const context = buildContext(text);
  const categoryScores = [
    analyzeContact(context),
    analyzeEducation(context),
    analyzeSkills(context),
    analyzeProjects(context),
    analyzeExperience(context),
    analyzeImpact(context),
    analyzeFormatting(context),
    analyzeKeywords(context),
    analyzeBulletQuality(context),
  ];
  const rawScore = categoryScores.reduce((total, item) => total + item.score, 0);
  const maxScore = categoryScores.reduce((total, item) => total + item.maxScore, 0);
  const initialScore = Math.round((rawScore / maxScore) * 100);
  const redFlags = buildRedFlags(categoryScores, context);
  const severePenalty = Math.min(
    8,
    redFlags.filter((flag) =>
      /no quantified impact|no explicit practical experience|missing proof links|unclear target/i.test(
        flag
      )
    ).length * 2
  );
  const overallScore = Math.max(
    0,
    capEvidenceInflation(initialScore - severePenalty, categoryScores, redFlags)
  );
  const grade = gradeFor(overallScore);
  const hiringReadiness = readinessFor(overallScore, redFlags.length);
  const topIssues = categoryScores
    .flatMap((item) => item.missingEvidence)
    .slice(0, 8);
  const quickWins = unique(
    categoryScores.flatMap((item) => item.suggestions)
  ).slice(0, 8);

  return {
    overallScore,
    grade,
    hiringReadiness,
    detectedProfileType: context.profileType,
    detectedSeniority: context.seniority,
    summary: buildSummary(overallScore, grade, hiringReadiness, context),
    categoryScores,
    topIssues,
    quickWins,
    redFlags,
    rewriteSuggestions: buildRewriteSuggestions(context),
  };
}
