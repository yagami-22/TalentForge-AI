const ACTION_VERBS = [
  "achieved",
  "built",
  "created",
  "delivered",
  "designed",
  "developed",
  "drove",
  "improved",
  "increased",
  "launched",
  "led",
  "managed",
  "optimized",
  "reduced",
  "shipped",
  "streamlined",
];

const SKILL_SECTION_REGEX =
  /(^|\n)\s*(technical\s+skills|core\s+skills|skills|technologies)\s*[:\n]/i;
const EXPERIENCE_SECTION_REGEX =
  /(^|\n)\s*(work\s+experience|professional\s+experience|experience|employment)\s*[:\n]/i;
const EMAIL_REGEX = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
const PHONE_REGEX =
  /(?:\+?\d{1,3}[\s.-]?)?(?:\(?\d{3}\)?[\s.-]?)\d{3}[\s.-]?\d{4}/;
const METRIC_REGEX = /\b(?:\d+%|\$?\d+(?:\.\d+)?\s?(?:k|m|million|billion)?|\d+\+)\b/i;

export type AtsAnalysis = {
  score: number;
  issues: string[];
  suggestions: string[];
};

export function analyzeResumeForAts(text: string): AtsAnalysis {
  const normalizedText = text.replace(/\s+/g, " ").trim();
  const lowerText = normalizedText.toLowerCase();
  const words = normalizedText.match(/\b[\w'-]+\b/g) ?? [];
  const wordCount = words.length;
  const hasSkillsSection = SKILL_SECTION_REGEX.test(text);
  const hasExperienceSection = EXPERIENCE_SECTION_REGEX.test(text);
  const hasMetrics = METRIC_REGEX.test(normalizedText);
  const actionVerbMatches = ACTION_VERBS.filter((verb) =>
    new RegExp(`\\b${verb}\\b`, "i").test(lowerText)
  );
  const hasContactInfo =
    EMAIL_REGEX.test(normalizedText) || PHONE_REGEX.test(normalizedText);

  let score = 20;
  const issues: string[] = [];
  const suggestions: string[] = [];

  if (wordCount >= 350 && wordCount <= 900) {
    score += 20;
  } else if (wordCount >= 250 && wordCount <= 1100) {
    score += 12;
    suggestions.push(
      "Tune the resume length toward a focused one-to-two page range."
    );
  } else {
    issues.push(
      wordCount < 250
        ? "Resume text is very short for ATS screening."
        : "Resume text may be too long for quick ATS and recruiter review."
    );
    suggestions.push(
      "Aim for roughly 350-900 words with concise role bullets and relevant keywords."
    );
  }

  if (hasSkillsSection) {
    score += 15;
  } else {
    issues.push("No clear skills section was detected.");
    suggestions.push(
      "Add a dedicated Skills section with role-specific tools, languages, and platforms."
    );
  }

  if (hasExperienceSection) {
    score += 15;
  } else {
    issues.push("No clear experience section was detected.");
    suggestions.push(
      "Add an Experience section with company, title, dates, and outcome-focused bullets."
    );
  }

  if (hasMetrics) {
    score += 15;
  } else {
    issues.push("Few measurable numbers or metrics were detected.");
    suggestions.push(
      "Include metrics such as percentages, revenue, time saved, scale, or volume handled."
    );
  }

  if (actionVerbMatches.length >= 4) {
    score += 15;
  } else if (actionVerbMatches.length >= 2) {
    score += 8;
    suggestions.push(
      "Use more varied action verbs at the start of achievement bullets."
    );
  } else {
    issues.push("Not enough strong action verbs were detected.");
    suggestions.push(
      "Start bullets with verbs like built, led, improved, shipped, optimized, or reduced."
    );
  }

  if (hasContactInfo) {
    score += 20;
  } else {
    issues.push("No email address or phone number was detected.");
    suggestions.push(
      "Add clear contact information near the top of the resume."
    );
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    issues:
      issues.length > 0
        ? issues
        : ["No major ATS issues detected by the rule-based scan."],
    suggestions:
      suggestions.length > 0
        ? suggestions
        : ["Keep tailoring keywords and accomplishments to each target role."],
  };
}
