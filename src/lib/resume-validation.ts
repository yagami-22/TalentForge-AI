export type ResumeValidationConfidence = "Low" | "Medium" | "High";

export type ResumeValidationResult = {
  isValid: boolean;
  reason: string;
  confidence: ResumeValidationConfidence;
  signalsFound: string[];
  warnings: string[];
  extractionQuality: "Unreadable" | "Poor" | "Fair" | "Good";
  fileType: "PDF" | "Image" | "Unsupported" | "Unknown";
};

const MAX_RESUME_FILE_SIZE = 10 * 1024 * 1024;

const EMAIL_REGEX = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
const PHONE_REGEX =
  /(?:\+?\d{1,3}[\s.-]?)?(?:\(?\d{3,5}\)?[\s.-]?)\d{3,5}[\s.-]?\d{3,5}/;
const BULLET_REGEX = /(^|\n)\s*(?:[-*•]|\d+\.)\s+/;

function createResult(
  overrides: Partial<ResumeValidationResult>
): ResumeValidationResult {
  return {
    isValid: false,
    reason: "This PDF does not look like a resume. Please upload a resume/CV PDF.",
    confidence: "Low",
    signalsFound: [],
    warnings: [],
    extractionQuality: "Unreadable",
    fileType: "Unknown",
    ...overrides,
  };
}

function normalize(text: string) {
  return text.replace(/\s+/g, " ").trim();
}

function getLines(text: string) {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
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

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function detectFileType(file: File): ResumeValidationResult["fileType"] {
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();

  if (type === "application/pdf" || name.endsWith(".pdf")) return "PDF";
  if (
    type.startsWith("image/") ||
    /\.(?:jpg|jpeg|png|webp|heic)$/i.test(name)
  ) {
    return "Image";
  }
  if (/\.(?:doc|docx)$/i.test(name)) return "Unsupported";
  return "Unknown";
}

function getExtractionQuality(
  meaningfulCharacterCount: number,
  meaningfulWordCount: number,
  garbageRatio: number
): ResumeValidationResult["extractionQuality"] {
  if (
    meaningfulCharacterCount < 120 ||
    meaningfulWordCount < 30 ||
    garbageRatio > 0.18
  ) {
    return "Unreadable";
  }

  if (meaningfulCharacterCount < 350 || meaningfulWordCount < 70 || garbageRatio > 0.1) {
    return "Poor";
  }

  if (meaningfulCharacterCount < 700 || meaningfulWordCount < 130) {
    return "Fair";
  }

  return "Good";
}

export function validateResumeFile(file: File): ResumeValidationResult {
  const fileType = detectFileType(file);

  if (file.size === 0) {
    return createResult({
      reason: "Choose a PDF resume to upload.",
      fileType,
    });
  }

  if (fileType === "Image") {
    return createResult({
      reason:
        "Images are not supported yet. Please upload a text-based PDF resume.",
      fileType,
    });
  }

  if (fileType !== "PDF") {
    return createResult({
      reason: "Only PDF resumes are supported right now.",
      fileType,
    });
  }

  if (file.size > MAX_RESUME_FILE_SIZE) {
    return createResult({
      reason: "This file is too large. Please upload a resume under 10 MB.",
      fileType,
    });
  }

  return createResult({
    isValid: true,
    reason: "PDF file type accepted.",
    confidence: "High",
    extractionQuality: "Good",
    fileType,
  });
}

export function validateResumeText(text: string): ResumeValidationResult {
  const normalized = normalize(text);
  const meaningfulText = normalized.replace(/[^a-zA-Z0-9@.+#/\s|,-]/g, "");
  const meaningfulWords = meaningfulText.match(/[a-zA-Z][a-zA-Z0-9+#.-]{1,}/g) ?? [];
  const lines = getLines(text);
  const replacementCount = (text.match(/\uFFFD|�/g) ?? []).length;
  const symbolCount = (text.match(/[^a-zA-Z0-9\s@.+#,/|:;()&%'-]/g) ?? []).length;
  const garbageRatio =
    text.length > 0 ? (replacementCount * 4 + symbolCount) / text.length : 1;
  const extractionQuality = getExtractionQuality(
    meaningfulText.length,
    meaningfulWords.length,
    garbageRatio
  );
  const signalsFound: string[] = [];
  const warnings: string[] = [];

  if (extractionQuality === "Unreadable") {
    return createResult({
      reason:
        "This PDF does not contain enough readable text. It may be scanned or image-based. Please upload a text-based PDF resume.",
      confidence: "Low",
      extractionQuality,
      fileType: "PDF",
    });
  }

  if (extractionQuality === "Poor" || extractionQuality === "Fair") {
    warnings.push(
      "We analyzed this resume, but text extraction quality may affect scoring."
    );
  }

  const contactSignals = [
    EMAIL_REGEX.test(text) ? "email" : "",
    PHONE_REGEX.test(text) ? "phone" : "",
    /\blinkedin\b/i.test(text) ? "LinkedIn" : "",
    /\bgithub\b/i.test(text) ? "GitHub" : "",
    /\bportfolio|website\b/i.test(text) ? "portfolio/website" : "",
  ].filter(Boolean);
  const sectionSignals = countMatches(text, [
    "education",
    "skills",
    "experience",
    "work experience",
    "internship",
    "internships",
    "projects",
    "certifications",
    "achievements",
    "summary",
    "objective",
    "profile",
    "publications",
    "research",
    "leadership",
    "volunteering",
  ]);
  const educationSignals = countMatches(text, [
    "b.tech",
    "b.e.",
    "bachelor",
    "master",
    "mba",
    "mca",
    "bca",
    "bsc",
    "msc",
    "phd",
    "diploma",
    "university",
    "college",
    "institute",
    "cgpa",
    "gpa",
    "percentage",
    "class 10",
    "class x",
    "class 12",
    "class xii",
    "cbse",
    "icse",
    "isc",
    "hsc",
    "ssc",
  ]);
  const practicalSignals = countMatches(text, [
    "intern",
    "internship",
    "developer",
    "engineer",
    "analyst",
    "designer",
    "manager",
    "consultant",
    "associate",
    "executive",
    "volunteer",
    "open source",
    "hackathon",
    "freelance",
    "client",
    "project",
    "research assistant",
    "teaching assistant",
  ]);
  const hasBullets =
    BULLET_REGEX.test(text) ||
    lines.filter((line) => /^(?:[-*•]|\d+\.)\s+/.test(line)).length >= 2;
  const shortSectionLikeLines = lines.filter(
    (line) => line.length >= 3 && line.length <= 80
  ).length;
  const hasSkillList = /(?:skills|tools|technologies)\s*[:|-]|[,|•]/i.test(text);
  const hasDateRange = /\b(?:19|20)\d{2}\s*(?:-|–|—|to)\s*(?:present|current|(?:19|20)\d{2})\b/i.test(
    text
  );
  const structureSignals = [
    hasBullets ? "bullet points" : "",
    shortSectionLikeLines >= 5 ? "multiple short sections" : "",
    hasDateRange ? "date ranges" : "",
    hasSkillList ? "skill list formatting" : "",
  ].filter(Boolean);

  if (contactSignals.length) {
    signalsFound.push(`Contact signal(s): ${contactSignals.join(", ")}`);
  }
  if (sectionSignals.length) {
    signalsFound.push(`Section heading(s): ${sectionSignals.join(", ")}`);
  }
  if (educationSignals.length) {
    signalsFound.push(`Education signal(s): ${educationSignals.join(", ")}`);
  }
  if (practicalSignals.length) {
    signalsFound.push(`Work/practical signal(s): ${practicalSignals.join(", ")}`);
  }
  if (structureSignals.length) {
    signalsFound.push(`Structure signal(s): ${structureSignals.join(", ")}`);
  }

  const negativeSignals = countMatches(text, [
    "invoice",
    "receipt",
    "bill",
    "tax invoice",
    "certificate of",
    "marksheet",
    "mark sheet",
    "assignment",
    "project report",
    "chapter",
    "abstract",
    "offer letter",
    "appointment letter",
    "bank statement",
    "medical",
    "prescription",
    "legal notice",
  ]);
  const signalGroupsMatched = [
    contactSignals.length > 0,
    sectionSignals.length > 0,
    educationSignals.length > 0,
    practicalSignals.length > 0,
    structureSignals.length > 0,
  ].filter(Boolean).length;
  const paragraphHeavy =
    lines.length <= 4 ||
    lines.filter((line) => line.length > 180).length >= Math.max(3, lines.length - 1);
  const onlyContactInfo =
    contactSignals.length > 0 &&
    sectionSignals.length === 0 &&
    educationSignals.length === 0 &&
    practicalSignals.length === 0 &&
    structureSignals.length <= 1;

  if (onlyContactInfo) {
    return createResult({
      reason: "This PDF does not look like a complete resume. Please upload a resume/CV PDF.",
      confidence: "Low",
      signalsFound,
      warnings,
      extractionQuality,
      fileType: "PDF",
    });
  }

  if (!contactSignals.length && !sectionSignals.length) {
    return createResult({
      reason: "This PDF does not look like a resume. Please upload a resume/CV PDF.",
      confidence: "Low",
      signalsFound,
      warnings,
      extractionQuality,
      fileType: "PDF",
    });
  }

  if (
    negativeSignals.length >= 1 &&
    signalGroupsMatched <= 2 &&
    sectionSignals.length <= 1
  ) {
    return createResult({
      reason: "This PDF does not look like a resume. Please upload a resume/CV PDF.",
      confidence: "Low",
      signalsFound: [...signalsFound, `Non-resume signal(s): ${negativeSignals.join(", ")}`],
      warnings,
      extractionQuality,
      fileType: "PDF",
    });
  }

  if (paragraphHeavy && signalGroupsMatched < 3) {
    return createResult({
      reason: "This PDF does not look like a resume. Please upload a resume/CV PDF.",
      confidence: "Low",
      signalsFound,
      warnings,
      extractionQuality,
      fileType: "PDF",
    });
  }

  if (signalGroupsMatched >= 3) {
    return createResult({
      isValid: true,
      reason: "Resume-like PDF text detected.",
      confidence: "High",
      signalsFound,
      warnings,
      extractionQuality,
      fileType: "PDF",
    });
  }

  if (signalGroupsMatched === 2 && structureSignals.length > 0) {
    return createResult({
      isValid: true,
      reason: "Resume-like PDF text detected.",
      confidence: "Medium",
      signalsFound,
      warnings,
      extractionQuality,
      fileType: "PDF",
    });
  }

  return createResult({
    reason: "This PDF does not look like a resume. Please upload a resume/CV PDF.",
    confidence: "Low",
    signalsFound,
    warnings,
    extractionQuality,
    fileType: "PDF",
  });
}
