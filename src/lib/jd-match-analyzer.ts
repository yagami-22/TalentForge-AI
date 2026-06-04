export type MatchGrade = "Poor" | "Fair" | "Good" | "Strong" | "Excellent";

export type EvidenceStatus = "Matched" | "Partial" | "Missing";

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

type DomainDefinition = {
  name: string;
  keywords: string[];
  tools: string[];
  responsibilities: string[];
};

type ParsedJobDescription = {
  targetRole: string;
  domain: DomainDefinition;
  coreSkills: string[];
  tools: string[];
  responsibilities: string[];
  domainKeywords: string[];
  mustHave: string[];
  niceToHave: string[];
  senioritySignals: string[];
};

const GENERIC_TERMS = [
  "communication",
  "teamwork",
  "leadership",
  "motivated",
  "hardworking",
  "passionate",
  "self starter",
  "problem solving",
  "detail oriented",
];

const DOMAIN_DEFINITIONS: DomainDefinition[] = [
  {
    name: "Software",
    keywords: ["software", "frontend", "backend", "full stack", "web", "application"],
    tools: ["react", "next.js", "node.js", "typescript", "javascript", "java", "python", "api", "apis", "sql", "git", "docker", "postgresql", "mongodb"],
    responsibilities: ["build", "develop", "implement", "debug", "test", "deploy", "integrate", "maintain"],
  },
  {
    name: "Data",
    keywords: ["data", "analytics", "dashboard", "statistics", "insights", "etl"],
    tools: ["sql", "python", "excel", "power bi", "tableau", "pandas", "statistics", "dashboard", "etl", "analytics"],
    responsibilities: ["analyze", "visualize", "report", "model", "forecast", "clean", "dashboard"],
  },
  {
    name: "Design",
    keywords: ["design", "ux", "ui", "user experience", "product design"],
    tools: ["figma", "ux research", "wireframes", "prototypes", "design systems", "user flows"],
    responsibilities: ["design", "prototype", "research", "wireframe", "test", "iterate"],
  },
  {
    name: "Marketing",
    keywords: ["marketing", "growth", "brand", "campaign", "content"],
    tools: ["seo", "ga4", "google analytics", "campaigns", "conversion", "content", "social media", "email marketing"],
    responsibilities: ["campaign", "optimize", "content", "convert", "engage", "analyze"],
  },
  {
    name: "Finance",
    keywords: ["finance", "accounting", "investment", "valuation", "budget"],
    tools: ["valuation", "financial modeling", "accounting", "excel", "budgeting", "forecasting"],
    responsibilities: ["model", "budget", "forecast", "audit", "analyze", "report"],
  },
  {
    name: "Sales",
    keywords: ["sales", "revenue", "client", "lead", "pipeline"],
    tools: ["crm", "leads", "pipeline", "clients", "revenue", "negotiation", "cold outreach"],
    responsibilities: ["prospect", "sell", "negotiate", "close", "manage", "outreach"],
  },
  {
    name: "Operations",
    keywords: ["operations", "process", "logistics", "supply chain"],
    tools: ["process improvement", "logistics", "inventory", "vendor", "supply chain", "optimization"],
    responsibilities: ["coordinate", "optimize", "improve", "manage", "track", "operate"],
  },
  {
    name: "Product",
    keywords: ["product", "roadmap", "requirements", "user research"],
    tools: ["roadmap", "prd", "user research", "metrics", "requirements", "prioritization"],
    responsibilities: ["prioritize", "define", "research", "measure", "roadmap", "launch"],
  },
  {
    name: "Consulting",
    keywords: ["consulting", "strategy", "business", "case", "stakeholder"],
    tools: ["market research", "strategy", "analysis", "stakeholder", "presentation", "business case"],
    responsibilities: ["analyze", "recommend", "present", "research", "stakeholder", "strategy"],
  },
  {
    name: "HR",
    keywords: ["hr", "human resources", "talent", "employee", "recruitment"],
    tools: ["recruitment", "onboarding", "payroll", "employee engagement", "hrms"],
    responsibilities: ["recruit", "onboard", "screen", "engage", "coordinate", "manage"],
  },
  {
    name: "Research",
    keywords: ["research", "publication", "methodology", "experiment"],
    tools: ["publication", "methodology", "experiment", "literature review", "data analysis"],
    responsibilities: ["research", "experiment", "review", "analyze", "publish", "document"],
  },
  {
    name: "General",
    keywords: ["business", "project", "coordination", "analysis"],
    tools: ["excel", "presentation", "documentation", "reporting"],
    responsibilities: ["coordinate", "manage", "analyze", "support", "document"],
  },
];

function normalize(text: string) {
  return text.replace(/\s+/g, " ").trim();
}

function unique(items: string[]) {
  return Array.from(new Set(items.filter(Boolean)));
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function countMatches(text: string, terms: string[]) {
  const lower = text.toLowerCase();

  return unique(terms).filter((term) =>
    new RegExp(`(^|[^a-z0-9+#.])${escapeRegExp(term.toLowerCase())}([^a-z0-9+#.]|$)`, "i").test(
      lower
    )
  );
}

function getLines(text: string) {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
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

  return {
    targetRole: detectTargetRole(text, domain),
    domain,
    coreSkills: countMatches(text, domain.tools).filter(
      (term) => !GENERIC_TERMS.includes(term)
    ),
    tools: countMatches(text, allTools),
    responsibilities: countMatches(text, allResponsibilities),
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
  const matchedSkills = countMatches(resume, parsed.coreSkills);
  const missingSkills = parsed.coreSkills.filter((term) => !matchedSkills.includes(term));
  const matchedTools = countMatches(resume, parsed.tools);
  const missingTools = parsed.tools.filter((term) => !matchedTools.includes(term));
  const matchedResponsibilities = countMatches(resume, parsed.responsibilities);
  const missingResponsibilities = parsed.responsibilities.filter(
    (term) => !matchedResponsibilities.includes(term)
  );
  const matchedKeywords = countMatches(resume, parsed.domainKeywords);
  const missingKeywords = parsed.domainKeywords.filter(
    (term) => !matchedKeywords.includes(term)
  );
  const seniorityMatched =
    parsed.senioritySignals.length === 0 ||
    countMatches(resume, parsed.senioritySignals).length > 0 ||
    /\b(?:intern|project|experience|work|freelance|client|years)\b/i.test(resumeText);
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
  const categoryScores = [
    scoreCategory("Core skill match", matchedSkills, parsed.coreSkills, 30, "core skill(s)"),
    scoreCategory("Tool/platform match", matchedTools, parsed.tools, 20, "tool/platform term(s)"),
    scoreCategory(
      "Responsibility/project relevance",
      matchedResponsibilities,
      parsed.responsibilities,
      20,
      "responsibility signal(s)"
    ),
    scoreCategory(
      "Domain keyword relevance",
      matchedKeywords,
      parsed.domainKeywords,
      15,
      "domain keyword(s)"
    ),
    {
      name: "Seniority/experience alignment",
      score: seniorityMatched ? 8 : 3,
      maxScore: 10,
      reason: seniorityMatched
        ? "Resume has seniority or practical-work evidence that can support this JD."
        : "JD seniority signals were not clearly supported by the resume.",
      evidenceFound: seniorityMatched ? ["Practical or seniority evidence found"] : [],
      missingEvidence: seniorityMatched ? [] : parsed.senioritySignals,
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
  const hasStrongCore = matchedSkills.length >= Math.min(4, parsed.coreSkills.length || 4);
  const hasStrongTools = matchedTools.length >= Math.min(3, parsed.tools.length || 3);
  const cappedScore =
    rawScore >= 85 && (!hasStrongCore || !hasStrongTools || proofSignals.length < 3)
      ? 84
      : rawScore;
  const matchScore = Math.max(0, Math.min(100, cappedScore));
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
    missingSkills.length ? `Missing core skills: ${missingSkills.slice(0, 5).join(", ")}` : "",
    missingTools.length ? `Missing tools/platforms: ${missingTools.slice(0, 5).join(", ")}` : "",
    missingResponsibilities.length ? "Responsibilities from the JD are not fully reflected." : "",
    proofSignals.length < 3 ? "Proof or measurable impact is thin for this JD." : "",
  ]);
  const quickWins = unique([
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
