export type EvidenceStatus = "Matched" | "Partial" | "Missing";

export type AnalysisCategoryScore = {
  name: string;
  score: number;
  maxScore: number;
  reason: string;
  evidenceFound?: string[];
  missingEvidence?: string[];
};

export type SharedDomainDefinition = {
  name: string;
  keywords: string[];
  tools: string[];
  responsibilities: string[];
};

export const COMMON_GENERIC_TERMS = [
  "communication",
  "teamwork",
  "leadership",
  "motivated",
  "hardworking",
  "passionate",
  "self starter",
  "problem solving",
  "detail oriented",
  "fast paced",
  "collaborative",
  "excellent",
  "strong",
  "good",
  "frontend",
  "web",
  "design",
  "application",
  "applications",
  "requirements",
  "product",
  "project",
  "projects",
  "usability",
];

export const COMMON_DOMAIN_DEFINITIONS: SharedDomainDefinition[] = [
  {
    name: "Software",
    keywords: ["software", "frontend", "backend", "full stack", "web", "application", "engineering"],
    tools: ["react", "next.js", "node.js", "typescript", "javascript", "java", "python", "api", "apis", "rest api", "rest apis", "graphql", "sql", "git", "docker", "ci/cd", "ci cd", "jest", "cypress", "testing", "testing frameworks", "accessibility", "seo", "cloud", "cloud platforms", "deployment", "postgresql", "mongodb", "firebase", "aws", "vercel"],
    responsibilities: ["build", "develop", "implement", "debug", "test", "deploy", "integrate", "maintain", "architecture", "optimize", "accessibility", "seo", "responsive design", "performance optimization", "reusable ui components"],
  },
  {
    name: "Data",
    keywords: ["data", "analytics", "dashboard", "statistics", "insights", "etl", "analysis"],
    tools: ["sql", "python", "excel", "power bi", "tableau", "pandas", "statistics", "dashboard", "etl", "analytics", "r"],
    responsibilities: ["analyze", "visualize", "report", "model", "forecast", "clean", "dashboard", "derive insights"],
  },
  {
    name: "Design",
    keywords: ["design", "ux", "ui", "user experience", "product design", "visual"],
    tools: ["figma", "ux research", "wireframes", "prototypes", "design systems", "user flows", "adobe"],
    responsibilities: ["design", "prototype", "research", "wireframe", "test", "iterate", "usability"],
  },
  {
    name: "Marketing",
    keywords: ["marketing", "growth", "brand", "campaign", "content", "seo"],
    tools: ["seo", "ga4", "google analytics", "campaigns", "conversion", "content", "social media", "email marketing", "crm"],
    responsibilities: ["campaign", "optimize", "content", "convert", "engage", "analyze", "segment"],
  },
  {
    name: "Finance",
    keywords: ["finance", "accounting", "investment", "valuation", "budget", "financial"],
    tools: ["valuation", "financial modeling", "accounting", "excel", "budgeting", "forecasting", "audit"],
    responsibilities: ["model", "budget", "forecast", "audit", "analyze", "report", "reconcile"],
  },
  {
    name: "Sales",
    keywords: ["sales", "revenue", "client", "lead", "pipeline", "account"],
    tools: ["crm", "leads", "pipeline", "clients", "revenue", "negotiation", "cold outreach", "salesforce"],
    responsibilities: ["prospect", "sell", "negotiate", "close", "manage", "outreach", "qualify"],
  },
  {
    name: "Operations",
    keywords: ["operations", "process", "logistics", "supply chain", "vendor"],
    tools: ["process improvement", "logistics", "inventory", "vendor", "supply chain", "optimization", "erp"],
    responsibilities: ["coordinate", "optimize", "improve", "manage", "track", "operate", "standardize"],
  },
  {
    name: "Product",
    keywords: ["product", "roadmap", "requirements", "user research", "metrics"],
    tools: ["roadmap", "prd", "user research", "metrics", "requirements", "prioritization", "jira"],
    responsibilities: ["prioritize", "define", "research", "measure", "roadmap", "launch", "stakeholder"],
  },
  {
    name: "Consulting",
    keywords: ["consulting", "strategy", "business", "case", "stakeholder"],
    tools: ["market research", "strategy", "analysis", "stakeholder", "presentation", "business case", "excel"],
    responsibilities: ["analyze", "recommend", "present", "research", "stakeholder", "strategy", "diagnose"],
  },
  {
    name: "HR",
    keywords: ["hr", "human resources", "talent", "employee", "recruitment"],
    tools: ["recruitment", "onboarding", "payroll", "employee engagement", "hrms", "ats"],
    responsibilities: ["recruit", "onboard", "screen", "engage", "coordinate", "manage", "interview"],
  },
  {
    name: "Research",
    keywords: ["research", "publication", "methodology", "experiment", "study"],
    tools: ["publication", "methodology", "experiment", "literature review", "data analysis", "spss", "matlab"],
    responsibilities: ["research", "experiment", "review", "analyze", "publish", "document", "evaluate"],
  },
  {
    name: "General",
    keywords: ["business", "project", "coordination", "analysis", "operations"],
    tools: ["excel", "presentation", "documentation", "reporting", "crm"],
    responsibilities: ["coordinate", "manage", "analyze", "support", "document", "communicate"],
  },
];

export function normalizeText(text: string) {
  return text.replace(/\s+/g, " ").trim();
}

export function uniqueValues(items: string[]) {
  return Array.from(new Set(items.map((item) => item.trim()).filter(Boolean)));
}

export function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function getTextLines(text: string) {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export function countTermMatches(text: string, terms: string[]) {
  const lower = text.toLowerCase();

  return uniqueValues(terms).filter((term) =>
    new RegExp(
      `(^|[^a-z0-9+#.])${escapeRegExp(term.toLowerCase())}([^a-z0-9+#.]|$)`,
      "i"
    ).test(lower)
  );
}

export function scoreRatio(matched: number, required: number, maxScore: number) {
  if (required <= 0) return Math.round(maxScore * 0.55);

  return Math.max(0, Math.min(maxScore, Math.round((matched / required) * maxScore)));
}

export function clampScore(score: number, maxScore = 100) {
  return Math.max(0, Math.min(maxScore, score));
}
