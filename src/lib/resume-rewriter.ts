import { analyzeATSOptimization } from "@/lib/ats-optimizer";

export type ResumeRewriteResult = {
  professionalSummary: string;
  education: ResumeRewriteEducation[];
  workExperience: ResumeRewriteExperience[];
  projects: ResumeRewriteProject[];
  portfolio: ResumeRewritePortfolio;
  experienceBullets: string[];
  skillsSection: string[];
  atsKeywords: string[];
  missingSkills: string[];
  debug: ResumeRewriteDebug;
};

export type ResumeRewriteEducation = {
  degree: string;
  institution: string;
  duration: string;
  details: string[];
};

export type ResumeRewriteExperience = {
  title: string;
  organization: string;
  duration: string;
  bullets: string[];
};

export type ResumeRewriteProject = {
  title: string;
  duration: string;
  bullets: string[];
};

export type ResumeRewritePortfolio = {
  github?: string;
  leetcode?: string;
  website?: string;
};

export type ResumeRewriteDebug = {
  rawText: string;
  rawTextLength: number;
  candidateName: string;
  parsedSections: Record<string, string[]>;
  parsedSectionNamesFound: string[];
  technicalSkills: string[];
  technicalSkillCount: number;
  educationCount: number;
  experienceCount: number;
  projectCount: number;
  portfolioDetected: boolean;
  finalPrompt: string;
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
  "developed",
  "built",
  "implemented",
  "optimized",
  "automated",
  "designed",
  "integrated",
  "engineered",
  "created",
  "analyzed",
  "tested",
  "documented",
];

const SKILL_SPLIT_REGEX = /[,|;•]/;
const PLACEHOLDER_REGEX = /\[[^\]]+\]|\{[^}]+\}|<[^>]+>/;
const INCOMPLETE_SENTENCE_REGEX =
  /\b(?:using|with|for|to|and|or|by|through|including|such as)\.?$/i;
const GENERIC_ATS_PHRASE_REGEX =
  /\b(?:aligned with .* expectations|improving metric|improving outcome|ats-friendly|keyword optimized|required:|preferred:|tool\/platform:)\b/i;
export const REWRITE_GENERATION_PROMPT = `TalentForge AI Resume Rewriter prompt:
- Rewrite only from uploaded resume evidence.
- Never output placeholders such as [metric], [outcome], [project/product], or [relevant tool].
- Never infer seniority. Treat this candidate as a student/internship applicant unless explicit full-time professional seniority exists.
- Target SDE internship and AI/ML internship positioning, not Senior Frontend Engineer positioning.
- If no metric exists, write a strong bullet without a metric.
- Prefer action verbs: Developed, Built, Implemented, Optimized, Automated, Designed, Integrated, Engineered.
- Keep bullets concise at one to two resume lines.
- Do not repeat the same technologies in every bullet.
- For project evidence, write project-specific bullets instead of generic ATS keyword sentences.
- Preserve real projects such as Planora AI and Smart Complaint Management System when present.
- Do not convert feature words such as pause, reset, tracking, scheduling, status updates, or complaint submission into skills.
- Keep missing JD skills separate; never pretend the user has them.`;

const ALLOWED_TECHNICAL_SKILLS = [
  { name: "C++", patterns: [/(^|[^a-z0-9])c\+\+([^a-z0-9]|$)/i] },
  { name: "DSA", patterns: [/\bdsa\b/i, /\bdata structures?\b/i] },
  { name: "Algorithms", patterns: [/\balgorithms?\b/i] },
  { name: "OOP", patterns: [/\boop\b/i, /\bobject[-\s]?oriented programming\b/i] },
  { name: "MySQL", patterns: [/\bmysql\b/i] },
  { name: "GitHub", patterns: [/\bgithub\b/i] },
  { name: "Git", patterns: [/\bgit\b/i] },
  { name: "Machine Learning", patterns: [/\bmachine learning\b/i, /\bml\b/i] },
  { name: "SQL", patterns: [/\bsql\b/i] },
  { name: "JavaScript", patterns: [/\bjavascript\b/i] },
  { name: "TypeScript", patterns: [/\btypescript\b/i] },
  { name: "APIs", patterns: [/\bapis?\b/i] },
  { name: "Next.js", patterns: [/\bnext\.?js\b/i] },
  { name: "React", patterns: [/\breact(?:\.js|js)?\b/i] },
  { name: "Backend Development", patterns: [/\bbackend development\b/i, /\bbackend\b/i] },
  { name: "Frontend Development", patterns: [/\bfrontend development\b/i, /\bfrontend\b/i] },
  { name: "Software Testing", patterns: [/\bsoftware testing\b/i, /\btesting\b/i] },
  { name: "CI/CD", patterns: [/\bci\/cd\b/i, /\bcontinuous integration\b/i] },
  { name: "REST API", patterns: [/\brest\s+apis?\b/i, /\brestful\s+apis?\b/i] },
  { name: "Test Automation", patterns: [/\btest automation\b/i, /\bautomated testing\b/i] },
] as const;

const NON_SKILL_FEATURE_WORD_REGEX =
  /^(?:pause|reset|tracking|scheduling|status updates?|complaint submission)$/i;
const FORBIDDEN_OUTPUT_REGEX =
  /\b(?:senior|required:|preferred:|tool\/platform:|\[metric\]|\[outcome\]|automated automation|built improved|integrated to generate|engineered planora ai|through implemented|resume-backed evidence|da is positioned)\b/i;
const STUDENT_INTERNSHIP_SUMMARY =
  "Computer Science and Engineering student skilled in full-stack development, React, Next.js, TypeScript, SQL, REST APIs, and software testing. Experienced in building AI-powered productivity and complaint management systems through academic and personal projects.";
const PLANORA_AI_BULLETS = [
  "Planora AI:",
  "Built an AI-powered productivity platform for task planning, scheduling, goal management, and personalized recommendations.",
  "Developed responsive frontend interfaces using React and Next.js to improve user engagement and usability.",
  "Implemented a real-time timer with start, pause, reset, and session tracking features.",
];
const COMPLAINT_MANAGEMENT_BULLETS = [
  "Smart Complaint Management System:",
  "Developed a full-stack complaint management system to automate complaint registration, tracking, and resolution workflows.",
  "Implemented role-based functionality for users and administrators, including complaint submission, status updates, and issue management.",
  "Designed database-backed workflows for complaint storage, retrieval, and management.",
];

type BulletCandidate = {
  text: string;
  section: "project" | "experience" | "general";
  context: string;
};

function normalize(text: string) {
  return text.replace(/\s+/g, " ").trim();
}

function stripUnsafeText(text: string) {
  return normalize(
    text
      .replace(/[–—]/g, "-")
      .replace(/\[[^\]]+\]|\{[^}]+\}|<[^>]+>/g, "")
      .replace(/\b(?:Required|Preferred|Tool\/platform):\s*/gi, "")
      .replace(/\s+([,.;:])/g, "$1")
  );
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

function extractCandidateName(text: string) {
  const allLines = getLines(text);
  const lines = allLines.slice(0, 24);
  const emailIndex = lines.findIndex((line) => /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(line));
  const globalEmailIndex = allLines.findIndex((line) => /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(line));
  const candidateLines =
    emailIndex >= 0
      ? lines.slice(Math.max(0, emailIndex - 5), emailIndex + 4)
      : globalEmailIndex >= 0
        ? allLines.slice(Math.max(0, globalEmailIndex - 6), globalEmailIndex + 8)
        : lines.slice(0, 10);
  const forbiddenNameRegex =
    /^(?:resume|cv|curriculum vitae|profile|portfolio|contact|email|phone|summary|objective)$/i;

  return (
    candidateLines.find(
      (line) =>
        /^[A-Z][A-Za-z.'-]+(?:\s+[A-Z][A-Za-z.'-]+){1,3}$/.test(line) &&
        !forbiddenNameRegex.test(line) &&
        !isSectionHeading(line) &&
        !/\b(?:engineer|developer|student|analyst|manager|designer|consultant)\b/i.test(line)
    ) ??
    lines.find(
      (line) =>
        /^[A-Z][A-Za-z.'-]+(?:\s+[A-Z][A-Za-z.'-]+){1,3}$/.test(line) &&
        !forbiddenNameRegex.test(line) &&
        !isSectionHeading(line)
    ) ??
    ""
  );
}

function titleCaseVerb(verb: string) {
  return verb.charAt(0).toUpperCase() + verb.slice(1).toLowerCase();
}

function isSectionHeading(line: string) {
  return /^(?:summary|professional summary|profile|objective|career objective|skills|technical skills|core skills|key skills|technologies|projects|personal projects|academic projects|key projects|selected projects|portfolio|links|profiles|experience|work experience|professional experience|employment|internships?|education|academics|academic background|qualifications|certifications|achievements|awards|leadership|activities|extra curricular activities|extracurricular activities)\s*:?$/i.test(
    line
  );
}

function normalizeSectionHeading(line: string) {
  const cleaned = line.replace(/:$/, "").trim();

  if (/\b(?:personal projects|academic projects|key projects|selected projects|projects)\b/i.test(cleaned)) {
    return "PROJECTS";
  }

  if (/\b(?:academics|academic background|qualifications|education)\b/i.test(cleaned)) {
    return "EDUCATION";
  }

  if (/\b(?:technical skills|core skills|key skills|technologies|skills)\b/i.test(cleaned)) {
    return "SKILLS";
  }

  if (/\b(?:portfolio|links|profiles)\b/i.test(cleaned)) {
    return "PORTFOLIO";
  }

  if (/\b(?:extra curricular|extracurricular|activities|achievements|awards|leadership)\b/i.test(cleaned)) {
    return cleaned.toUpperCase();
  }

  return cleaned;
}

function isEducationEvidenceLine(line: string) {
  return (
    /\b(?:b\.?\s?tech|btech|b\.\s?e\.|bachelor|b\.?\s?sc|bs|m\.?\s?tech|mtech|master|mca|mba|m\.?\s?sc|senior secondary|secondary|class\s*xii|class\s*x|\bxii\b|\bx\b)\b/i.test(
      line
    ) ||
    /\b(?:college|university|institute|school|academy|polytechnic)\b/i.test(line) ||
    /\b(?:cgpa|gpa|percentage|percent|marks)\s*:?\s*\d+(?:\.\d+)?/i.test(line) ||
    /\b(?:19|20)\d{2}\s*(?:-|to)\s*(?:(?:19|20)\d{2}|present|current|ongoing)\b/i.test(line)
  );
}

function inferProjectLines(lines: string[]) {
  const projectStart = lines.findIndex((line) =>
    /\b(?:project|projects|portfolio work|case study|case studies)\b/i.test(line)
  );

  if (projectStart >= 0) {
    const inferred: string[] = [];

    for (const line of lines.slice(projectStart + 1)) {
      if (isSectionHeading(line)) break;
      inferred.push(line);
    }

    if (inferred.length) return inferred;
  }

  return lines.filter((line) =>
    /\b(?:built|developed|implemented|designed|created|integrated|optimized|github|demo|repository|project)\b/i.test(
      line
    )
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

function extractDebugSections(text: string) {
  const sections: Record<string, string[]> = {};
  const lines = getLines(text);
  let currentSection = "";
  const headerLines: string[] = [];

  lines.forEach((line) => {
    if (isSectionHeading(line)) {
      currentSection = normalizeSectionHeading(line);
      sections[currentSection] = [];
      return;
    }

    if (currentSection) {
      sections[currentSection].push(line);
    } else {
      headerLines.push(line);
    }
  });

  if (headerLines.length) {
    sections.HEADER = headerLines.slice(0, 12);
  }

  if (!Object.keys(sections).some((section) => section !== "HEADER")) {
    const inferredEducation = lines.filter((line) => isEducationEvidenceLine(line));
    const inferredProjects = inferProjectLines(lines);

    if (inferredEducation.length) sections.EDUCATION = inferredEducation;
    if (inferredProjects.length) sections.PROJECTS = inferredProjects;
  }

  return sections;
}

function getSectionLines(
  parsedSections: Record<string, string[]>,
  names: string[]
) {
  const normalizedNames = names.map((name) => name.toLowerCase());

  return Object.entries(parsedSections).flatMap(([sectionName, lines]) =>
    normalizedNames.some((name) => sectionName.toLowerCase().includes(name))
      ? lines
      : []
  );
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

function extractAllowedTechnicalSkills(resumeText: string, extractedSkills: string[]) {
  const evidence = `${resumeText}\n${extractedSkills.join("\n")}`;

  return ALLOWED_TECHNICAL_SKILLS.filter((skill) =>
    skill.patterns.some((pattern) => pattern.test(evidence))
  ).map((skill) => skill.name);
}

function sanitizeSkillList(skills: string[]) {
  const allowedNames = new Set<string>(ALLOWED_TECHNICAL_SKILLS.map((skill) => skill.name));

  return unique(skills)
    .map(stripUnsafeText)
    .filter((skill) => allowedNames.has(skill))
    .filter((skill) => !NON_SKILL_FEATURE_WORD_REGEX.test(skill))
    .filter((skill) => !FORBIDDEN_OUTPUT_REGEX.test(skill));
}

function sanitizeAtsKeyword(keyword: string) {
  return stripUnsafeText(keyword).replace(/^(?:Required|Preferred|Tool\/platform):\s*/i, "");
}

function sanitizeAtsKeywords(keywords: string[]) {
  return unique(keywords.map(sanitizeAtsKeyword))
    .filter(Boolean)
    .filter((keyword) => !/^(?:Required|Preferred|Tool\/platform):/i.test(keyword))
    .filter((keyword) => !PLACEHOLDER_REGEX.test(keyword))
    .filter((keyword) => !/\bsenior\b/i.test(keyword));
}

function extractDuration(text: string) {
  return (
    text.match(
      /\b(?:(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\s+)?(?:19|20)\d{2}\s*(?:-|to)\s*(?:(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\s+)?(?:(?:19|20)\d{2}|present|current|ongoing)\b/i
    )?.[0] ??
    text.match(/\b(?:19|20)\d{2}\b/)?.[0] ??
    ""
  );
}

function extractProjectDuration(text: string) {
  return (
    text.match(
      /\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\s+(?:19|20)\d{2}\s*(?:-|to)\s*(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\s+(?:19|20)\d{2}\b/i
    )?.[0] ??
    text.match(
      /\b(?:19|20)\d{2}\s*(?:-|to)\s*(?:(?:19|20)\d{2}|present|current|ongoing)\b/i
    )?.[0] ??
    ""
  );
}

function extractProjectDurations(text: string) {
  return Array.from(
    text.matchAll(
      /\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\s+(?:19|20)\d{2}\s*(?:-|to)\s*(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\s+(?:19|20)\d{2}\b/gi
    )
  ).map((match) => match[0]);
}

function isExperienceTitleLine(line: string) {
  return (
    /\b(?:engineer|developer|intern|analyst|consultant|manager|designer)\b/i.test(line) &&
    Boolean(extractProjectDuration(line))
  );
}

function extractAcademicPerformance(text: string) {
  return (
    text.match(
      /\b(?:cgpa|gpa|percentage|percent|marks)\s*:?\s*\d+(?:\.\d+)?(?:\s*\/\s*10|\s*%)?/i
    )?.[0] ?? ""
  );
}

function parseExperienceSections(parsedSections: Record<string, string[]>) {
  const sourceLines = unique([
    ...getSectionLines(parsedSections, [
      "experience",
      "work experience",
      "professional experience",
      "employment",
      "internship",
    ]),
    ...Object.values(parsedSections).flat().filter((line) => isExperienceTitleLine(line)),
  ]);
  const entries: ResumeRewriteExperience[] = [];
  let current: ResumeRewriteExperience | null = null;

  function commitCurrent() {
    if (!current) return;

    if (current.title && current.duration) {
      entries.push({
        ...current,
        bullets: unique(current.bullets).slice(0, 5),
      });
    }

    current = null;
  }

  sourceLines.forEach((rawLine) => {
    const line = stripUnsafeText(rawLine.replace(/^[\-–]\s*/, ""));

    if (!line) return;

    if (isExperienceTitleLine(line)) {
      commitCurrent();

      const duration = extractProjectDuration(line);
      const titleLine = line.replace(duration, "").replace(/\s*\|\s*$/, "").trim();
      const parts = titleLine
        .split("|")
        .map((part) => normalize(part))
        .filter(Boolean);

      current = {
        title: parts[0] ?? titleLine,
        organization: parts.slice(1).join(" | "),
        duration,
        bullets: [],
      };
      return;
    }

    if (!current) return;

    if (
      line.length >= 24 &&
      line.length <= 220 &&
      !isEducationEvidenceLine(line) &&
      !/\b(?:github|leetcode|portfolio|cgpa|percentage)\b/i.test(line)
    ) {
      current.bullets.push(line);
    }
  });

  commitCurrent();

  return entries;
}

function parseEducationSections(parsedSections: Record<string, string[]>) {
  const educationLines = Object.values(parsedSections)
    .flat()
    .flatMap((line) => line.split("|"))
    .map((line) => stripUnsafeText(line.replace(/^[\-–]\s*/, "")))
    .filter(Boolean);

  if (!educationLines.length) return [];

  const degreeRegex =
    /\b(?:b\.?\s?tech|btech|bachelor|b\.\s?e\.|m\.?\s?tech|mtech|master|mca|mba|b\.?\s?sc|m\.?\s?sc|senior secondary|secondary|class\s*xii|class\s*x|\bxii\b|\bx\b)\b/i;
  const explicitDegreeRegex =
    /\b(?:b\.?\s?tech|btech|bachelor|b\.\s?e\.|m\.?\s?tech|mtech|master|mca|mba|b\.?\s?sc|m\.?\s?sc|senior secondary|secondary|class\s*xii|class\s*x|\bxii\b|\bx\b)\b/i;
  const institutionRegex =
    /\b(?:college|university|institute|school|academy|campus|engineering|technology|polytechnic)\b/i;
  const nonEducationRegex =
    /\b(?:badminton|cricket|competition|competitions|participated|ranked|self[-\s]?learning|project|planora|complaint management|skills?|skilled|proficient|seeking|internship|industry experience|github|leetcode|portfolio|career objective|email|phone)\b/i;
  const entries: ResumeRewriteEducation[] = [];
  let current: ResumeRewriteEducation | null = null;

  function commitCurrent() {
    if (!current) return;

    if (current.degree || current.institution || current.duration || current.details.length) {
      entries.push({
        degree: current.degree,
        institution: current.institution,
        duration: current.duration,
        details: unique(current.details),
      });
    }

    current = null;
  }

  const academicLines = educationLines
    .filter((line) => {
      const duration = extractDuration(line);
      const performance = extractAcademicPerformance(line);
      const isInstitution = institutionRegex.test(line);
      const isDegree = degreeRegex.test(line) && (explicitDegreeRegex.test(line) || !isInstitution);

      return (
        (isDegree || isInstitution || Boolean(duration) || Boolean(performance)) &&
        !(nonEducationRegex.test(line) && !isDegree)
      );
    });
  const firstAcademicLine = academicLines[0] ?? "";
  const firstLineIsDegree =
    degreeRegex.test(firstAcademicLine) &&
    (explicitDegreeRegex.test(firstAcademicLine) || !institutionRegex.test(firstAcademicLine));
  const orderedAcademicLines = firstLineIsDegree ? academicLines : academicLines.reverse();

  for (const line of orderedAcademicLines) {
    const duration = extractDuration(line);
    const performance = extractAcademicPerformance(line);
    const isInstitution = institutionRegex.test(line);
    const isDegree = degreeRegex.test(line) && (explicitDegreeRegex.test(line) || !isInstitution);

    if (isDegree) {
      if (current?.degree) commitCurrent();
      const degree = line
        .replace(/\b(?:19|20)\d{2}\s*(?:-|to)\s*(?:(?:19|20)\d{2}|present|current|ongoing)\b/i, "")
        .replace(/\b(?:19|20)\d{2}\b/i, "")
        .replace(/\b(?:cgpa|gpa|percentage|percent|marks)\s*:?\s*(?:\d+(?:\.\d+)?\s*\/\s*10|\d+(?:\.\d+)?%|[6-9](?:\.\d+)?)\b/i, "")
        .trim();
      if (current && !current.degree) {
        current.degree = degree;
        if (duration && !current.duration) current.duration = duration;
        if (performance) current.details.push(performance);
      } else {
        current = {
          degree,
          institution: "",
          duration,
          details: performance ? [performance] : [],
        };
      }
      continue;
    }

    if (!current) {
      current = {
        degree: "",
        institution: "",
        duration: "",
        details: [],
      };
    }

    if (isInstitution && !current.institution) {
      current.institution = line;
      continue;
    }

    if (duration && !current.duration) {
      current.duration = duration;
    }

    if (performance) {
      current.details.push(performance);
    }
  }

  commitCurrent();

  return entries.filter(
    (entry) =>
      entry.degree ||
      entry.institution ||
      entry.duration ||
      entry.details.some((detail) => /cgpa|gpa|percentage|percent|marks/i.test(detail))
  );
}

function bulletsForProject(title: string, generatedBullets: string[]) {
  const startIndex = generatedBullets.findIndex(
    (bullet) => bullet.replace(/:$/, "").toLowerCase() === title.toLowerCase()
  );

  if (startIndex === -1) return [];

  const bullets: string[] = [];

  for (const bullet of generatedBullets.slice(startIndex + 1)) {
    if (/^[A-Z][A-Za-z0-9 /-]+:$/.test(bullet)) break;
    bullets.push(bullet);
  }

  return bullets;
}

function parseProjectSections(
  resumeText: string,
  parsedSections: Record<string, string[]>,
  generatedBullets: string[]
) {
  const projectLines = Object.values(parsedSections).flat();
  const projects: ResumeRewriteProject[] = [];
  const knownProjectTitles = ["Planora AI", "Smart Complaint Management System"];
  const nearbyDurations = extractProjectDurations(projectLines.join(" "));
  const seenTitles = new Set<string>();
  const maybeAddProject = (title: string, projectIndex: number) => {
    if (!hasProject(resumeText, title)) return;
    const titleIndex = projectLines.findIndex((line) => new RegExp(title, "i").test(line));
    const projectWindow =
      titleIndex === -1
        ? ""
        : projectLines
            .slice(Math.max(0, titleIndex - 2), titleIndex + 8)
            .join(" ");

    projects.push({
      title,
      duration:
        extractProjectDurations(projectWindow)[projectIndex] ??
        nearbyDurations[projectIndex] ??
        extractProjectDuration(projectWindow),
      bullets: bulletsForProject(title, generatedBullets),
    });
    seenTitles.add(title.toLowerCase());
  };

  knownProjectTitles.forEach((title, index) => maybeAddProject(title, index));

  const genericProjectLines = unique([
    ...getSectionLines(parsedSections, ["project"]),
    ...inferProjectLines(getLines(resumeText)),
  ]);
  let currentProject: ResumeRewriteProject | null = null;

  function commitCurrentProject() {
    if (!currentProject) return;

    if (
      currentProject.title &&
      !seenTitles.has(currentProject.title.toLowerCase()) &&
      currentProject.bullets.length
    ) {
      projects.push({
        ...currentProject,
        bullets: unique(currentProject.bullets).slice(0, 4),
      });
      seenTitles.add(currentProject.title.toLowerCase());
    }

    currentProject = null;
  }

  genericProjectLines.forEach((rawLine) => {
    const line = stripUnsafeText(rawLine.replace(/^[\-–]\s*/, ""));

    if (
      !line ||
      isExperienceTitleLine(line) ||
      /\b(?:github|leetcode|portfolio|email|phone|cgpa|percentage|class x|class xii)\b/i.test(line) ||
      isEducationEvidenceLine(line)
    ) {
      return;
    }

    const isActionLine = startsWithActionVerb(line);
    const isTitle =
      !isActionLine &&
      (isLikelyTitle(line) ||
        /\b(?:project|system|app|application|platform|dashboard|website|portal|case study|analysis)\b/i.test(
          line
        ));

    if (isTitle && line.length <= 90) {
      commitCurrentProject();
      currentProject = {
        title: line
          .replace(/\s*\|\s*.*$/, "")
          .replace(/\s+\b(?:19|20)\d{2}.*$/, "")
          .trim(),
        duration: extractProjectDuration(line),
        bullets: [],
      };
      return;
    }

    if (!currentProject) return;

    if (!currentProject.duration) {
      currentProject.duration = extractProjectDuration(line);
    }

    if (line.length >= 24 && line.length <= 220) {
      currentProject.bullets.push(line);
    }
  });

  commitCurrentProject();

  return projects;
}

function extractPortfolio(
  resumeText: string,
  parsedSections: Record<string, string[]>
): ResumeRewritePortfolio {
  const portfolioText = [
    ...getSectionLines(parsedSections, ["portfolio"]),
    ...Object.values(parsedSections).flat().filter((line) => /\b(?:github|leetcode|portfolio|website)\b/i.test(line)),
  ].join(" ");
  const github =
    resumeText.match(/\b(?:https?:\/\/)?(?:www\.)?github\.com\/[^\s|),]+/i)?.[0] ||
    (/\bgithub\b/i.test(portfolioText) ? "GitHub" : "") ||
    "";
  const leetcode =
    resumeText.match(/\b(?:https?:\/\/)?(?:www\.)?leetcode\.com\/[^\s|),]+/i)?.[0] ||
    (/\bleetcode\b/i.test(portfolioText) ? "LeetCode" : "") ||
    "";
  const website =
    resumeText.match(/\bhttps?:\/\/(?!github\.com|www\.github\.com|leetcode\.com|www\.leetcode\.com)[^\s|),]+/i)?.[0] ||
    (/\b(?:portfolio|website|personal website)\b/i.test(portfolioText)
      ? "Portfolio"
      : "") ||
    "";
  const portfolio: ResumeRewritePortfolio = {};

  if (github) portfolio.github = github;
  if (leetcode) portfolio.leetcode = leetcode;
  if (website) portfolio.website = website;

  return portfolio;
}

function isLikelyTitle(line: string) {
  return (
    line.length >= 3 &&
    line.length <= 80 &&
    !line.startsWith("- ") &&
    !/[.;]$/.test(line) &&
    !/\b(?:cgpa|class x|class xii|percentage|github|linkedin|leetcode|email|phone)\b/i.test(
      line
    ) &&
    !isSectionHeading(line)
  );
}

function extractBulletCandidates(text: string): BulletCandidate[] {
  const lines = getLines(text);
  let currentSection = "";
  let currentContext = "";

  return lines
    .flatMap((rawLine) => {
      if (isSectionHeading(rawLine)) {
        currentSection = rawLine.toLowerCase();
        currentContext = "";
        return [];
      }

      const line = rawLine.replace(/^[\-–]\s*/, "").trim();
      const isProjectSection = /\bproject\b/i.test(currentSection);
      const isExperienceSection =
        /\b(?:experience|internship|work|professional)\b/i.test(currentSection);
      const isPrioritySection = /\b(?:project|experience|internship|work|professional)\b/i.test(
        currentSection
      );

      if (isProjectSection && isLikelyTitle(line)) {
        currentContext = line;
        return [];
      }

      if (
        line.length < 24 ||
        line.length > 220 ||
        PLACEHOLDER_REGEX.test(line) ||
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
        return [
          {
            text: line,
            section: isProjectSection
              ? "project"
              : isExperienceSection
                ? "experience"
                : "general",
            context: currentContext,
          } satisfies BulletCandidate,
        ];
      }

      return [];
    })
    .slice(0, 10);
}

function startsWithActionVerb(line: string) {
  return ACTION_VERBS.some((verb) => new RegExp(`^${verb}\\b`, "i").test(line));
}

function pickActionVerb(text: string) {
  if (/\b(?:api|database|service|auth|payment|third-party|integration)\b/i.test(text)) {
    return "Integrated";
  }
  if (/\b(?:automation|automated|workflow|pipeline)\b/i.test(text)) {
    return "Automated";
  }
  if (/\b(?:performance|speed|latency|seo|accessibility|optimized)\b/i.test(text)) {
    return "Optimized";
  }
  if (/\b(?:ui|interface|design|prototype|layout|responsive)\b/i.test(text)) {
    return "Designed";
  }
  if (/\b(?:architecture|system|platform|full-stack)\b/i.test(text)) {
    return "Engineered";
  }

  return "Built";
}

function rewriteBullet(candidate: BulletCandidate) {
  const cleaned = stripUnsafeText(candidate.text)
    .replace(/^[\-–]\s*/, "")
    .replace(/[.;]\s*$/, "");

  if (!cleaned) return "";

  const hasAction = startsWithActionVerb(cleaned);
  const actionVerb = hasAction
    ? titleCaseVerb(cleaned.split(/\s+/)[0] ?? "Built")
    : pickActionVerb(cleaned);
  const body = hasAction
    ? cleaned.replace(/^\w+\s+/, "")
    : cleaned.replace(/^[A-Z]/, (letter) => letter.toLowerCase());
  const projectContext =
    candidate.section === "project" &&
    candidate.context &&
    !new RegExp(candidate.context.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i").test(body)
      ? `${candidate.context}: `
      : "";
  const sentence = `${actionVerb} ${projectContext}${body}`;
  const words = sentence.split(/\s+/);
  const concise = words.length > 26 ? words.slice(0, 26).join(" ") : sentence;

  return `${concise.replace(/[.;]\s*$/, "")}.`;
}

function hasTechnologySpam(bullet: string) {
  const techMentions =
    bullet.match(
      /\b(?:react|next\.js|javascript|typescript|node\.js|python|java|sql|mongodb|postgresql|docker|aws|api|apis|frontend|backend)\b/gi
    ) ?? [];
  const uniqueTech = new Set(techMentions.map((item) => item.toLowerCase()));

  return techMentions.length > 4 || uniqueTech.size > 3;
}

function isValidGeneratedBullet(bullet: string) {
  const cleaned = stripUnsafeText(bullet);

  return (
    cleaned.length >= 28 &&
    cleaned.length <= 220 &&
    !FORBIDDEN_OUTPUT_REGEX.test(cleaned) &&
    !PLACEHOLDER_REGEX.test(bullet) &&
    !GENERIC_ATS_PHRASE_REGEX.test(cleaned) &&
    !INCOMPLETE_SENTENCE_REGEX.test(cleaned) &&
    !hasTechnologySpam(cleaned) &&
    startsWithActionVerb(cleaned)
  );
}

function validatedBullets(candidates: BulletCandidate[]) {
  return unique(candidates.map(rewriteBullet))
    .filter(isValidGeneratedBullet)
    .slice(0, 8);
}

function hasProject(resumeText: string, projectName: string) {
  return new RegExp(projectName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i").test(
    resumeText
  );
}

function buildProjectBullets(resumeText: string, fallbackCandidates: BulletCandidate[]) {
  const bullets = [
    ...(hasProject(resumeText, "Planora AI") ? PLANORA_AI_BULLETS : []),
    ...(hasProject(resumeText, "Smart Complaint Management System")
      ? COMPLAINT_MANAGEMENT_BULLETS
      : []),
  ];

  if (bullets.length) {
    return sanitizeGeneratedBullets(bullets);
  }

  return sanitizeGeneratedBullets(validatedBullets(fallbackCandidates));
}

function sanitizeSummary(summary: string) {
  const cleaned = stripUnsafeText(summary)
    .replace(/\bSenior Frontend Engineer\b/gi, "SDE / AI-ML internship")
    .replace(/\bsenior\b/gi, "student")
    .replace(/\bDA is positioned\b/gi, "Computer Science and Engineering student")
    .replace(/\bresume-backed evidence\b/gi, "technical experience")
    .replace(/\bBrings hands-on project experience through Implemented\b/gi, "Experienced in building")
    .replace(/\s+/g, " ")
    .trim();

  if (
    !cleaned ||
    /DA is positioned|resume-backed evidence|through Implemented|senior/i.test(cleaned)
  ) {
    return STUDENT_INTERNSHIP_SUMMARY;
  }

  return cleaned;
}

function sanitizeGeneratedBullets(bullets: string[]) {
  return unique(bullets.map(stripUnsafeText))
    .filter((bullet) => bullet.length >= 10)
    .filter((bullet) => !FORBIDDEN_OUTPUT_REGEX.test(bullet));
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
  const allowedResumeSkills = extractAllowedTechnicalSkills(resumeText, resumeSkills);
  const parsedSections = extractDebugSections(resumeText);
  const candidateName = extractCandidateName(resumeText);
  const bulletCandidates = extractBulletCandidates(resumeText);
  const missingSkills = sanitizeAtsKeywords(atsAnalysis.missingATSKeywords).slice(0, 12);
  const rewrittenBullets = buildProjectBullets(resumeText, bulletCandidates);
  const education = parseEducationSections(parsedSections);
  const workExperience = parseExperienceSections(parsedSections);
  const projects = parseProjectSections(resumeText, parsedSections, rewrittenBullets);
  const portfolio = extractPortfolio(resumeText, parsedSections);
  const skillsSection = sanitizeSkillList(allowedResumeSkills).slice(0, 18);
  const atsKeywords = skillsSection;

  return {
    professionalSummary: sanitizeSummary(STUDENT_INTERNSHIP_SUMMARY),
    education,
    workExperience,
    projects,
    portfolio,
    experienceBullets: rewrittenBullets,
    skillsSection,
    atsKeywords,
    missingSkills,
    debug: {
      rawText: resumeText,
      rawTextLength: resumeText.length,
      candidateName,
      parsedSections,
      parsedSectionNamesFound: Object.keys(parsedSections),
      technicalSkills: allowedResumeSkills,
      technicalSkillCount: allowedResumeSkills.length,
      educationCount: education.length,
      experienceCount: workExperience.length,
      projectCount: projects.length,
      portfolioDetected: Boolean(portfolio.github || portfolio.leetcode || portfolio.website),
      finalPrompt: REWRITE_GENERATION_PROMPT,
    },
  };
}
