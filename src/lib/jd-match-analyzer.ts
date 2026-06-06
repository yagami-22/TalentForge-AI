import {
  COMMON_DOMAIN_DEFINITIONS as DOMAIN_DEFINITIONS,
  COMMON_GENERIC_TERMS as GENERIC_TERMS,
  type EvidenceStatus,
  type SharedDomainDefinition as DomainDefinition,
  countTermMatches as countMatches,
  escapeRegExp,
  getTextLines as getLines,
  normalizeText as normalize,
  uniqueValues as unique,
} from "@/lib/resume-analysis-shared";

export type MatchGrade = "Poor" | "Fair" | "Good" | "Strong" | "Excellent";

export type JobDescriptionMatchAnalysis = {
  matchScore: number;
  matchGrade: MatchGrade;
  resumeTitle: string;
  targetRole: string;
  detectedDomain: string;
  summary: string;
  matchedKeywords: string[];
  missingKeywords: string[];
  matchedSkills: string[];
  missingSkills: string[];
  matchedResponsibilities: string[];
  missingResponsibilities: string[];
  strengths: string[];
  gaps: string[];
  quickWins: string[];
  rewriteSuggestions: {
    resumeIssue: string;
    suggestedRewrite: string;
    whyBetter: string;
  }[];
  evidence: {
    jdRequirement: string;
    resumeEvidence: string;
    status: EvidenceStatus;
  }[];
  categoryScores: {
    name: string;
    score: number;
    maxScore: number;
    reason: string;
    evidenceFound: string[];
    missingEvidence: string[];
  }[];
};

export type JobDescriptionValidation = {
  isValid: boolean;
  reason: string;
};

type ParsedJobDescription = {
  targetRole: string;
  domain: DomainDefinition;
  coreSkills: string[];
  tools: string[];
  responsibilities: string[];
  responsibilityFamilies: ResponsibilityFamily[];
  domainKeywords: string[];
  mustHave: string[];
  niceToHave: string[];
  senioritySignals: string[];
};

type ResponsibilityFamily = {
  name: string;
  jdPatterns: RegExp[];
  strongResumePatterns: RegExp[];
  partialResumePatterns: RegExp[];
};

const RESPONSIBILITY_FAMILIES: ResponsibilityFamily[] = [
  {
    name: "Build and maintain frontend applications",
    jdPatterns: [
      /\b(?:build|develop|maintain|create|implement).{0,60}\b(?:frontend|front-end|web|react|next\.?js|applications?)\b/i,
      /\b(?:frontend|front-end|web|react|next\.?js).{0,60}\b(?:applications?|features?)\b/i,
    ],
    strongResumePatterns: [
      /\b(?:built|developed|created|implemented|maintained).{0,80}\b(?:react|next\.?js|typescript|javascript).{0,80}\b(?:applications?|features?|frontend|front-end)\b/i,
      /\b(?:built|developed|created|implemented|maintained).{0,80}\b(?:frontend|front-end|web).{0,80}\b(?:applications?|production features?)\b/i,
    ],
    partialResumePatterns: [
      /\b(?:developed|built|created).{0,80}\b(?:responsive|interactive).{0,80}\b(?:frontend|front-end|interfaces?)\b/i,
      /\bmodern web technologies\b/i,
    ],
  },
  {
    name: "Develop reusable UI components",
    jdPatterns: [
      /\b(?:reusable|shared|modular).{0,40}\b(?:ui|interface|frontend)?\s*components?\b/i,
      /\bcomponent (?:libraries|library|systems?)\b/i,
    ],
    strongResumePatterns: [
      /\b(?:built|developed|created|implemented|maintained).{0,80}\b(?:reusable|shared|modular).{0,40}\b(?:ui|interface|frontend)?\s*components?\b/i,
      /\bcomponent (?:libraries|library|systems?)\b/i,
    ],
    partialResumePatterns: [/\b(?:ui|frontend|front-end).{0,40}\bcomponents?\b/i],
  },
  {
    name: "Design systems",
    jdPatterns: [/\bdesign systems?\b/i, /\bui systems?\b/i],
    strongResumePatterns: [
      /\bdesign systems?\b/i,
      /\b(?:built|created|maintained|contributed).{0,80}\b(?:ui|component).{0,40}\b(?:system|library)\b/i,
    ],
    partialResumePatterns: [/\b(?:consistent|reusable).{0,40}\b(?:ui|components?)\b/i],
  },
  {
    name: "Collaborate with product, design, and backend teams",
    jdPatterns: [
      /\bcollaborat(?:e|ed|ion).{0,80}\b(?:product|design|backend|cross-functional|stakeholders?|teams?)\b/i,
      /\b(?:product|design|backend).{0,80}\bcollaborat(?:e|ed|ion)\b/i,
    ],
    strongResumePatterns: [
      /\bcollaborat(?:ed|e|ion).{0,80}\b(?:product|design|backend|cross-functional|stakeholders?|teams?)\b/i,
      /\bworked with.{0,80}\b(?:product|design|backend|teams?)\b/i,
    ],
    partialResumePatterns: [/\bteam(?:s|work)?\b/i, /\bcollaborat(?:ed|e|ion)\b/i],
  },
  {
    name: "Optimize frontend performance",
    jdPatterns: [
      /\b(?:optimize|improve).{0,60}\bperformance\b/i,
      /\bperformance optimization\b/i,
    ],
    strongResumePatterns: [
      /\b(?:optimized|improved|reduced|increased).{0,80}\b(?:performance|latency|load time|speed|core web vitals)\b/i,
      /\bperformance optimization\b/i,
    ],
    partialResumePatterns: [/\boptimized\b/i, /\bperformance\b/i],
  },
  {
    name: "Improve accessibility",
    jdPatterns: [/\baccessibility\b/i, /\ba11y\b/i, /\bwcag\b/i],
    strongResumePatterns: [
      /\b(?:improved|implemented|enhanced|audited).{0,80}\b(?:accessibility|a11y|wcag)\b/i,
      /\baccessibility improvements?\b/i,
    ],
    partialResumePatterns: [/\baccessibility\b/i, /\ba11y\b/i],
  },
  {
    name: "Improve SEO",
    jdPatterns: [/\bseo\b/i, /\bsearch engine optimization\b/i],
    strongResumePatterns: [
      /\b(?:improved|optimized|implemented|enhanced).{0,80}\b(?:seo|search engine optimization)\b/i,
      /\bseo optimization\b/i,
    ],
    partialResumePatterns: [/\bseo\b/i],
  },
  {
    name: "Integrate REST APIs or third-party services",
    jdPatterns: [
      /\b(?:integrate|integration).{0,80}\b(?:rest api|rest apis|apis?|third-party|services?)\b/i,
      /\b(?:rest api|rest apis|apis?|third-party services?)\b/i,
    ],
    strongResumePatterns: [
      /\b(?:integrated|connected|implemented).{0,80}\b(?:rest api|rest apis|apis?|third-party|services?)\b/i,
      /\b(?:rest api|rest apis|api integration|third-party integration)\b/i,
    ],
    partialResumePatterns: [/\bapi(?:s)?\b/i, /\bintegrated\b/i],
  },
  {
    name: "Participate in code reviews",
    jdPatterns: [/\bcode reviews?\b/i, /\breview.{0,30}\bcode\b/i],
    strongResumePatterns: [
      /\b(?:conducted|participated in|led|performed).{0,50}\bcode reviews?\b/i,
      /\bcode reviews?\b/i,
    ],
    partialResumePatterns: [/\breviewed\b/i],
  },
  {
    name: "Agile and sprint collaboration",
    jdPatterns: [/\bagile\b/i, /\bsprints?\b/i, /\bscrum\b/i],
    strongResumePatterns: [
      /\b(?:agile|sprints?|scrum)\b/i,
      /\b(?:collaborated|delivered).{0,80}\b(?:sprints?|agile|scrum)\b/i,
    ],
    partialResumePatterns: [/\biteration\b/i, /\bstandups?\b/i],
  },
  {
    name: "Deploy production features",
    jdPatterns: [
      /\b(?:deploy|deployment|ship|production).{0,80}\b(?:features?|applications?|code)\b/i,
      /\bproduction features?\b/i,
    ],
    strongResumePatterns: [
      /\b(?:deployed|shipped|launched|delivered).{0,80}\b(?:production|features?|applications?)\b/i,
      /\bproduction features?\b/i,
      /\bautomated deployment\b/i,
    ],
    partialResumePatterns: [/\bdeployed\b/i, /\blaunched\b/i],
  },
];

function matchesAnyPattern(text: string, patterns: RegExp[]) {
  return patterns.some((pattern) => pattern.test(text));
}

export function validateJobDescription(text: string): JobDescriptionValidation {
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
  ]);

  if (meaningfulCharacters < 200 || jdSignals.length < 2) {
    return {
      isValid: false,
      reason: "Please paste a complete job description with responsibilities and requirements.",
    };
  }

  return { isValid: true, reason: "Job description accepted." };
}

function gradeFor(score: number): MatchGrade {
  if (score >= 90) return "Excellent";
  if (score >= 78) return "Strong";
  if (score >= 65) return "Good";
  if (score >= 45) return "Fair";
  return "Poor";
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
  const titleLine =
    lines.find((line) =>
      /\b(?:title|role|position|hiring for|job)\b\s*[:|-]/i.test(line)
    ) ?? lines.find((line) => line.length <= 90 && /engineer|developer|analyst|designer|manager|consultant|associate|specialist|intern|executive|researcher/i.test(line));

  if (!titleLine) return `${domain.name} Role`;

  return titleLine
    .replace(/\b(?:job title|title|role|position|hiring for|job)\b\s*[:|-]\s*/i, "")
    .slice(0, 80);
}

function getMustNiceTerms(text: string, candidates: string[]) {
  const lines = getLines(text);
  const mustLines = lines.filter((line) =>
    /\b(?:required|must have|mandatory|minimum qualifications|essential|should have)\b/i.test(line)
  );
  const niceLines = lines.filter((line) =>
    /\b(?:preferred|nice to have|bonus|plus|good to have)\b/i.test(line)
  );

  return {
    mustHave: countMatches(mustLines.join(" "), candidates),
    niceToHave: countMatches(niceLines.join(" "), candidates),
  };
}

function parseJobDescription(text: string): ParsedJobDescription {
  const domain = detectDomain(text);
  const allTools = unique(DOMAIN_DEFINITIONS.flatMap((item) => item.tools));
  const allResponsibilities = unique(
    DOMAIN_DEFINITIONS.flatMap((item) => item.responsibilities)
  );
  const allKeywords = unique(DOMAIN_DEFINITIONS.flatMap((item) => item.keywords));
  const candidates = unique([
    ...domain.tools,
    ...domain.keywords,
    ...domain.responsibilities,
    ...allTools,
  ]);
  const mustNice = getMustNiceTerms(text, candidates);
  const responsibilityFamilies = RESPONSIBILITY_FAMILIES.filter((family) =>
    matchesAnyPattern(text, family.jdPatterns)
  );
  const responsibilityNames = responsibilityFamilies.map((family) => family.name);

  return {
    targetRole: detectTargetRole(text, domain),
    domain,
    coreSkills: countMatches(text, domain.tools).filter(
      (term) => !GENERIC_TERMS.includes(term)
    ),
    tools: countMatches(text, allTools),
    responsibilities: unique([
      ...countMatches(text, allResponsibilities),
      ...responsibilityNames,
    ]),
    responsibilityFamilies,
    domainKeywords: countMatches(text, allKeywords).filter(
      (term) => !GENERIC_TERMS.includes(term)
    ),
    mustHave: mustNice.mustHave,
    niceToHave: mustNice.niceToHave,
    senioritySignals: countMatches(text, [
      "intern",
      "entry level",
      "junior",
      "associate",
      "mid level",
      "senior",
      "lead",
      "manager",
      "years",
    ]),
  };
}

function evidenceFor(term: string, resumeText: string) {
  const line = getLines(resumeText).find((item) =>
    new RegExp(`\\b${escapeRegExp(term)}\\b`, "i").test(item)
  );

  return line?.slice(0, 180) ?? "";
}

function scoreCategory(
  name: string,
  matched: string[],
  required: string[],
  maxScore: number,
  reasonLabel: string
) {
  const score = required.length
    ? Math.round((matched.length / required.length) * maxScore)
    : Math.round(maxScore * 0.6);

  return {
    name,
    score: Math.max(0, Math.min(maxScore, score)),
    maxScore,
    reason: required.length
      ? `${matched.length}/${required.length} ${reasonLabel} matched from resume evidence.`
      : `The JD had limited explicit ${reasonLabel}; partial neutral credit applied.`,
    evidenceFound: matched,
    missingEvidence: required.filter((term) => !matched.includes(term)),
  };
}

function scoreWeightedCategory(
  name: string,
  matchedRequired: string[],
  required: string[],
  matchedPreferred: string[],
  preferred: string[],
  maxScore: number
) {
  const requiredWeight = 3;
  const denominator = required.length * requiredWeight + preferred.length;
  const numerator = matchedRequired.length * requiredWeight + matchedPreferred.length;
  const score = denominator
    ? Math.round((numerator / denominator) * maxScore)
    : Math.round(maxScore * 0.55);

  return {
    name,
    score: Math.max(0, Math.min(maxScore, score)),
    maxScore,
    reason: `${matchedRequired.length}/${required.length} required term(s) and ${matchedPreferred.length}/${preferred.length} preferred term(s) matched from resume evidence. Required terms carry 3x weight.`,
    evidenceFound: unique([...matchedRequired, ...matchedPreferred]),
    missingEvidence: unique([
      ...required.filter((term) => !matchedRequired.includes(term)).map((term) => `Required: ${term}`),
      ...preferred.filter((term) => !matchedPreferred.includes(term)).map((term) => `Preferred: ${term}`),
    ]),
  };
}

function findEvidenceForPatterns(resumeText: string, patterns: RegExp[]) {
  return getLines(resumeText).find((line) =>
    patterns.some((pattern) => pattern.test(line))
  );
}

function scoreResponsibilityRelevance(
  parsed: ParsedJobDescription,
  resumeText: string
) {
  const legacyResponsibilities = parsed.responsibilities.filter(
    (responsibility) =>
      !parsed.responsibilityFamilies.some((family) => family.name === responsibility)
  );
  const legacyMatched = countMatches(resumeText, legacyResponsibilities);
  const familyRows = parsed.responsibilityFamilies.map((family) => {
    const strongEvidence = findEvidenceForPatterns(
      resumeText,
      family.strongResumePatterns
    );
    const partialEvidence = strongEvidence
      ? undefined
      : findEvidenceForPatterns(resumeText, family.partialResumePatterns);

    return {
      family,
      strongEvidence,
      partialEvidence,
      points: strongEvidence ? 1 : partialEvidence ? 0.45 : 0,
    };
  });
  const familyPoints = familyRows.reduce((total, row) => total + row.points, 0);
  const totalResponsibilities =
    parsed.responsibilityFamilies.length + legacyResponsibilities.length;
  const matchedEquivalent = familyPoints + legacyMatched.length * 0.7;
  const score = totalResponsibilities
    ? Math.round((matchedEquivalent / totalResponsibilities) * 20)
    : 12;
  const evidenceFound = unique([
    ...familyRows.flatMap((row) => [
      row.strongEvidence ? `${row.family.name}: ${row.strongEvidence}` : "",
      row.partialEvidence ? `${row.family.name} (partial): ${row.partialEvidence}` : "",
    ]),
    ...legacyMatched.map((item) => `General responsibility signal: ${item}`),
  ]);
  const missingEvidence = unique([
    ...familyRows
      .filter((row) => !row.strongEvidence && !row.partialEvidence)
      .map((row) => row.family.name),
    ...legacyResponsibilities.filter((term) => !legacyMatched.includes(term)),
  ]);
  const strongMatches = familyRows.filter((row) => row.strongEvidence).length;
  const partialMatches = familyRows.filter((row) => row.partialEvidence).length;

  return {
    name: "Responsibility/project relevance",
    score: Math.max(0, Math.min(20, score)),
    maxScore: 20,
    reason: `${strongMatches} strong responsibility family match(es), ${partialMatches} partial match(es), and ${legacyMatched.length}/${legacyResponsibilities.length} general action signal(s) matched from resume evidence. Generic frontend/project wording receives partial credit only.`,
    evidenceFound,
    missingEvidence,
    matchedResponsibilities: unique([
      ...familyRows
        .filter((row) => row.strongEvidence || row.partialEvidence)
        .map((row) => row.family.name),
      ...legacyMatched,
    ]),
    missingResponsibilities: missingEvidence,
  };
}

function getSeniorityAlignment(jobDescription: string, resumeText: string) {
  const requiresSenior = /\b(?:senior|lead|staff|principal|[3-9]\+?\s*(?:years|yrs)|[1-9][0-9]\+?\s*(?:years|yrs))\b/i.test(
    jobDescription
  );
  const requiresExplicitYears = /\b(?:[3-9]|[1-9][0-9])\+?\s*(?:years|yrs)\b/i.test(
    jobDescription
  );
  const resumeHasExplicitYears = /\b(?:[3-9]|[1-9][0-9])\+?\s*(?:years|yrs)\b/i.test(
    resumeText
  );
  const resumeHasRoleWithDate =
    /\b(?:engineer|developer|analyst|consultant|manager|designer|specialist)\b.{0,80}\b(?:20\d{2}|present)\b/i.test(
      resumeText
    ) ||
    /\b(?:20\d{2}|present)\b.{0,80}\b(?:engineer|developer|analyst|consultant|manager|designer|specialist)\b/i.test(
      resumeText
    );
  const resumeHasSeniorSignal = /\b(?:senior|lead|staff|principal|managed|mentored|owned|architected)\b/i.test(
    resumeText
  );
  const resumeHasPracticalSignal =
    resumeHasRoleWithDate ||
    /\b(?:internship|intern|freelance|client work|open source|volunteer|work experience|professional experience)\b/i.test(
      resumeText
    );

  if (requiresSenior) {
    const matched =
      (requiresExplicitYears ? resumeHasExplicitYears : resumeHasPracticalSignal) &&
      (resumeHasSeniorSignal || resumeHasExplicitYears);

    return {
      matched,
      score: matched ? 9 : resumeHasPracticalSignal ? 4 : 2,
      evidenceFound: matched
        ? [
            resumeHasExplicitYears
              ? "Explicit years-of-experience evidence found"
              : "Senior/practical role evidence found",
          ]
        : resumeHasPracticalSignal
          ? ["Some practical evidence found, but seniority is not fully supported"]
          : [],
      missingEvidence: matched
        ? []
        : ["Direct seniority evidence such as years, senior role scope, ownership, or leadership"],
      reason: matched
        ? "The resume supports the seniority level requested by the JD."
        : "The JD has senior/years-of-experience requirements that are not directly supported by the resume.",
    };
  }

  return {
    matched: resumeHasPracticalSignal || !/\b(?:experience|years|intern|junior|entry level)\b/i.test(jobDescription),
    score: resumeHasPracticalSignal ? 8 : 5,
    evidenceFound: resumeHasPracticalSignal ? ["Practical work or internship evidence found"] : [],
    missingEvidence: resumeHasPracticalSignal ? [] : ["Clear practical work, internship, or project responsibility evidence"],
    reason: resumeHasPracticalSignal
      ? "The resume contains practical work evidence for this JD level."
      : "The JD seniority level is not strict, but practical-work evidence is limited.",
  };
}

export function analyzeJobDescriptionMatch({
  resumeTitle,
  resumeText,
  jobDescription,
}: {
  resumeTitle: string;
  resumeText: string;
  jobDescription: string;
}): JobDescriptionMatchAnalysis {
  const parsed = parseJobDescription(jobDescription);
  const resume = resumeText.toLowerCase();
  const matchedMustHave = countMatches(resume, parsed.mustHave);
  const missingMustHave = parsed.mustHave.filter((term) => !matchedMustHave.includes(term));
  const matchedNiceToHave = countMatches(resume, parsed.niceToHave);
  const matchedSkills = countMatches(resume, parsed.coreSkills);
  const missingSkills = parsed.coreSkills.filter((term) => !matchedSkills.includes(term));
  const matchedTools = countMatches(resume, parsed.tools);
  const missingTools = parsed.tools.filter((term) => !matchedTools.includes(term));
  const responsibilityScore = scoreResponsibilityRelevance(parsed, resumeText);
  const matchedResponsibilities = responsibilityScore.matchedResponsibilities;
  const missingResponsibilities = responsibilityScore.missingResponsibilities;
  const domainKeywordMatches = countMatches(resume, parsed.domainKeywords);
  const domainKeywordMissing = parsed.domainKeywords.filter(
    (term) => !domainKeywordMatches.includes(term)
  );
  const matchedKeywords = unique([...matchedMustHave, ...matchedNiceToHave, ...domainKeywordMatches]);
  const missingKeywords = unique([...missingMustHave, ...domainKeywordMissing]);
  const seniorityAlignment = getSeniorityAlignment(jobDescription, resumeText);
  const proofSignals = countMatches(resume, [
    "reduced",
    "increased",
    "improved",
    "built",
    "launched",
    "users",
    "revenue",
    "accuracy",
    "saved",
    "github",
    "portfolio",
  ]);
  const weightedKeywordScore = scoreWeightedCategory(
    "Required/preferred JD keyword match",
    matchedMustHave,
    parsed.mustHave,
    matchedNiceToHave,
    parsed.niceToHave,
    20
  );
  const categoryScores = [
    scoreCategory("Core skill match", matchedSkills, parsed.coreSkills, 25, "core skill(s)"),
    scoreCategory("Tool/platform match", matchedTools, parsed.tools, 15, "tool/platform term(s)"),
    responsibilityScore,
    weightedKeywordScore,
    scoreCategory(
      "Domain keyword relevance",
      domainKeywordMatches,
      parsed.domainKeywords,
      10,
      "domain keyword(s)"
    ),
    {
      name: "Seniority/experience alignment",
      score: Math.min(5, Math.round(seniorityAlignment.score / 2)),
      maxScore: 5,
      reason: seniorityAlignment.reason,
      evidenceFound: seniorityAlignment.evidenceFound,
      missingEvidence: seniorityAlignment.missingEvidence,
    },
    {
      name: "Proof/impact alignment",
      score: proofSignals.length >= 3 ? 5 : proofSignals.length >= 1 ? 3 : 1,
      maxScore: 5,
      reason: `${proofSignals.length} proof/impact signal(s) found in resume.`,
      evidenceFound: proofSignals,
      missingEvidence:
        proofSignals.length >= 3
          ? []
          : ["More quantified impact, proof links, or outcome evidence"],
    },
  ];
  const rawScore = categoryScores.reduce((total, item) => total + item.score, 0);
  const requiredCoverage = parsed.mustHave.length
    ? matchedMustHave.length / parsed.mustHave.length
    : 1;
  const hasStrongCore = matchedSkills.length >= Math.min(4, parsed.coreSkills.length || 4);
  const hasStrongTools = matchedTools.length >= Math.min(3, parsed.tools.length || 3);
  const cappedScore =
    rawScore >= 85 && (!hasStrongCore || !hasStrongTools || proofSignals.length < 3)
      ? 84
      : rawScore;
  const requiredCoverageCap = requiredCoverage < 0.35 ? 54 : requiredCoverage < 0.55 ? 68 : 100;
  const seniorityCap = seniorityAlignment.score <= 4 ? 70 : 100;
  const matchScore = Math.max(0, Math.min(100, cappedScore, requiredCoverageCap, seniorityCap));
  const evidenceTerms = unique([
    ...parsed.mustHave,
    ...parsed.coreSkills,
    ...parsed.tools,
    ...parsed.responsibilities,
  ]).slice(0, 14);
  const evidence = evidenceTerms.map((term) => {
    const resumeEvidence = evidenceFor(term, resumeText);

    return {
      jdRequirement: term,
      resumeEvidence: resumeEvidence || "No direct resume evidence found.",
      status: resumeEvidence ? "Matched" : "Missing",
    } satisfies JobDescriptionMatchAnalysis["evidence"][number];
  });
  const strengths = unique([
    matchedSkills.length ? `Matches core skills: ${matchedSkills.slice(0, 5).join(", ")}` : "",
    matchedTools.length ? `Matches tools/platforms: ${matchedTools.slice(0, 5).join(", ")}` : "",
    matchedResponsibilities.length ? "Shows relevant responsibilities or project work." : "",
    proofSignals.length ? "Includes some proof, project, or impact evidence." : "",
  ]);
  const gaps = unique([
    missingMustHave.length ? `Missing required JD terms: ${missingMustHave.slice(0, 5).join(", ")}` : "",
    missingSkills.length ? `Missing core skills: ${missingSkills.slice(0, 5).join(", ")}` : "",
    missingTools.length ? `Missing tools/platforms: ${missingTools.slice(0, 5).join(", ")}` : "",
    missingResponsibilities.length ? "Responsibilities from the JD are not fully reflected." : "",
    seniorityAlignment.score <= 4 ? "Seniority or years-of-experience evidence is weak for this JD." : "",
    proofSignals.length < 3 ? "Proof or measurable impact is thin for this JD." : "",
  ]);
  const quickWins = unique([
    missingMustHave[0] ? `Add honest evidence for required JD term: ${missingMustHave[0]}.` : "",
    missingSkills[0] ? `Add honest evidence for ${missingSkills[0]} if you have used it.` : "",
    missingTools[0] ? `Mention where you used ${missingTools[0]} in a project or role.` : "",
    missingResponsibilities[0] ? `Rewrite one bullet to reflect ${missingResponsibilities[0]} work.` : "",
    "Tailor the summary to the target role using evidence-backed keywords.",
  ]).slice(0, 5);

  return {
    matchScore,
    matchGrade: gradeFor(matchScore),
    resumeTitle,
    targetRole: parsed.targetRole,
    detectedDomain: parsed.domain.name,
    summary: `${resumeTitle} is a ${gradeFor(matchScore).toLowerCase()} match for ${parsed.targetRole}. The score is based on direct evidence for JD skills, tools, responsibilities, seniority, and proof/impact.`,
    matchedKeywords,
    missingKeywords,
    matchedSkills,
    missingSkills,
    matchedResponsibilities,
    missingResponsibilities,
    strengths,
    gaps,
    quickWins,
    rewriteSuggestions: [
      {
        resumeIssue: missingSkills[0]
          ? `Missing direct evidence for ${missingSkills[0]}.`
          : "Some JD requirements are not explicitly tied to resume evidence.",
        suggestedRewrite: missingSkills[0]
          ? `Add a bullet showing how you used ${missingSkills[0]} with a project, tool, and result.`
          : "Add one role or project bullet that connects a JD requirement to a concrete outcome.",
        whyBetter:
          "Recruiters trust keyword matches more when they are tied to specific work and outcomes.",
      },
    ],
    evidence,
    categoryScores,
  };
}
