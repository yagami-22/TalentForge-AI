"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  BarChart3,
  BookOpen,
  ClipboardCheck,
  Code2,
  FileText,
  GitBranch,
  LinkIcon,
  SearchCheck,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  Upload,
} from "lucide-react";

import {
  AnalyzerEmptyState,
  ActivityTimeline,
  ExternalProfileButton,
  GitHubHero,
  GitHubInsightCard,
  GitHubRecommendationCard,
  GitHubScoreCard,
  GitHubSection,
  LanguageDonut,
  RadarChart,
  RepositoryCard,
  RepositoryQualityComparison,
  TechStackChart,
  TopProjectsTable,
  type GitHubRecommendation,
  type GitHubRepositoryView,
  type GitHubScoreMetric,
} from "@/app/dashboard/github/github-analyzer-ui";
import { Button } from "@/components/ui/button";
import { forge } from "@/lib/talentforge-design";

type ResumeContext = {
  title: string | null;
  skills: string[];
};

type GitHubUser = {
  login: string;
  name: string | null;
  bio: string | null;
  blog: string | null;
  html_url: string;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
};

type GitHubRepo = {
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  default_branch: string;
  fork: boolean;
  archived: boolean;
  homepage: string | null;
  language: string | null;
  size: number;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  pushed_at: string | null;
  topics?: string[];
};

type GitHubEvent = {
  type: string;
  created_at: string;
};

type GitHubContentFile = {
  content?: string;
  encoding?: string;
};

type GitHubTreeResponse = {
  tree: Array<{
    path: string;
    type: "blob" | "tree" | "commit";
  }>;
  truncated: boolean;
};

type GitHubCommit = {
  sha: string;
  commit: {
    message: string;
    author?: {
      date?: string;
    };
  };
};

type RepoEvidence = {
  hasReadme: boolean;
  readmeText: string;
  packageJson: Record<string, unknown> | null;
  treePaths: string[];
  commitCountSample: number;
};

type RepoQualityScores = {
  architecture: number;
  codebaseQuality: number;
  productionReadiness: number;
  deployment: number;
  documentation: number;
  maintainability: number;
  realWorldImpact: number;
};

type ScoredRepository = GitHubRepositoryView & {
  categoryScores: RepoQualityScores;
  weightMultiplier: number;
};

type AnalyzerResult = {
  profile: GitHubUser;
  repos: GitHubRepositoryView[];
  languages: Array<{ language: string; bytes: number; percent: number }>;
  technologies: Array<{ technology: string; count: number; percent: number }>;
  hero: {
    recruiterReadiness: number;
    productionProjects: number;
    liveDeployments: number;
    languagesUsed: number;
    recruiterSummary: string;
  };
  timeline: Array<{ label: string; detail: string; tone: "cyan" | "purple" | "emerald" | "amber" }>;
  scores: {
    github: number;
    architecture: number;
    codebaseQuality: number;
    productionReadiness: number;
    deployment: number;
    documentation: number;
    maintainability: number;
    realWorldImpact: number;
  };
  insights: {
    strongestLanguages: string[];
    bestRepositories: GitHubRepositoryView[];
    weakRepositories: GitHubRepositoryView[];
    missingReadme: string[];
    missingLiveDemo: string[];
    missingDescription: string[];
    missingTopics: string[];
    inactiveProjects: string[];
    missingProof: string[];
  };
  recommendations: GitHubRecommendation[];
  resumeConnection: {
    detectedSkills: string[];
    resumeProjects: string[];
    resumeKeywords: string[];
    resumeMismatch: string[];
    githubOnlyEvidence: string[];
    verifiedSkills: string[];
    strongestRepository: string | null;
    bestPortfolioProject: string | null;
  };
  recentActivity: string;
};

type GitHubApiErrorKind =
  | "invalid"
  | "rate-limit"
  | "empty"
  | "network"
  | "unauthorized"
  | "not-found"
  | "timeout"
  | "service-unavailable"
  | "missing-token"
  | "invalid-token";

class GitHubApiError extends Error {
  kind: GitHubApiErrorKind;

  constructor(kind: GitHubApiErrorKind, message: string) {
    super(message);
    this.kind = kind;
  }
}

const headers = {
  "Content-Type": "application/json",
};

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function daysSince(value: string | null) {
  if (!value) return 9999;
  const time = new Date(value).getTime();
  if (!Number.isFinite(time)) return 9999;
  return Math.max(0, Math.round((Date.now() - time) / 86400000));
}

function normalizeSkill(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9+#.]+/g, " ").trim();
}

function isPresent(value: string | null | undefined) {
  return typeof value === "string" && value.trim().length > 0;
}

async function fetchGitHubJSON<T>(url: string, options: { paginate?: boolean } = {}): Promise<T> {
  const response = await fetch("/api/github/fetch", {
    method: "POST",
    headers,
    body: JSON.stringify({ url, paginate: options.paginate === true }),
  });
  const payload = (await response.json().catch(() => null)) as
    | { data?: T; error?: { kind?: GitHubApiErrorKind; message?: string } }
    | null;

  if (!response.ok || !payload || "error" in payload) {
    const kind = payload?.error?.kind ?? "network";
    const message = payload?.error?.message ?? "GitHub API failed to return profile data.";
    throw new GitHubApiError(kind, message);
  }

  return payload.data as T;
}

async function fetchOptionalJSON<T>(url: string): Promise<T | null> {
  const response = await fetch("/api/github/fetch", {
    method: "POST",
    headers,
    body: JSON.stringify({ url, optional: true }),
  });
  const payload = (await response.json().catch(() => null)) as
    | { data?: T | null; error?: { kind?: GitHubApiErrorKind; message?: string } }
    | null;

  if (!response.ok || !payload || "error" in payload) {
    const kind = payload?.error?.kind ?? "network";
    const message = payload?.error?.message ?? "GitHub API failed to return repository evidence.";
    throw new GitHubApiError(kind, message);
  }

  return payload.data ?? null;
}

function decodeGitHubContent(file: GitHubContentFile | null) {
  if (!file?.content) return "";

  try {
    return atob(file.content.replace(/\n/g, ""));
  } catch {
    return "";
  }
}

function parsePackageJson(file: GitHubContentFile | null) {
  const decoded = decodeGitHubContent(file);
  if (!decoded) return null;

  try {
    const parsed = JSON.parse(decoded) as unknown;
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

function packageRecord(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function packageScripts(packageJson: Record<string, unknown> | null) {
  return Object.keys(packageRecord(packageJson?.scripts));
}

function packageDependencies(packageJson: Record<string, unknown> | null) {
  return new Set(
    [
      ...Object.keys(packageRecord(packageJson?.dependencies)),
      ...Object.keys(packageRecord(packageJson?.devDependencies)),
      ...Object.keys(packageRecord(packageJson?.peerDependencies)),
    ].map((dependency) => dependency.toLowerCase())
  );
}

function textIncludes(text: string, patterns: Array<string | RegExp>) {
  return patterns.some((pattern) =>
    typeof pattern === "string"
      ? text.includes(pattern.toLowerCase())
      : pattern.test(text)
  );
}

function hasPath(paths: string[], patterns: Array<string | RegExp>) {
  const normalizedPaths = paths.map((path) => path.toLowerCase());
  return normalizedPaths.some((path) =>
    patterns.some((pattern) =>
      typeof pattern === "string" ? path.includes(pattern.toLowerCase()) : pattern.test(path)
    )
  );
}

function hasDeployment(repo: GitHubRepo, readmeText: string) {
  const deploymentText = [repo.homepage, readmeText].filter(Boolean).join(" ").toLowerCase();
  return textIncludes(deploymentText, [
    "vercel.app",
    "netlify.app",
    "github.io",
    "render.com",
    "railway.app",
    "fly.dev",
    "firebaseapp.com",
    "web.app",
    "cloudfront.net",
  ]);
}

function hasLicense(paths: string[]) {
  return hasPath(paths, [/^license(\.|$)/, /^licence(\.|$)/, "copying"]);
}

function hasArchitectureDocs(paths: string[], readmeText: string) {
  return (
    textIncludes(readmeText.toLowerCase(), ["architecture", "system design", "data flow", "tradeoff"]) ||
    hasPath(paths, ["architecture", "docs", "adr", "system-design"])
  );
}

function hasScreenshots(readmeText: string) {
  return textIncludes(readmeText.toLowerCase(), ["screenshot", "![", "<img", "demo.gif", ".png", ".webp"]);
}

function recruiterGrade(score: number): GitHubRepositoryView["recruiterGrade"] {
  if (score >= 92) return "A+";
  if (score >= 82) return "A";
  if (score >= 70) return "B";
  if (score >= 55) return "C";
  return "Needs Proof";
}

function productionStatus(
  score: number,
  deployed: boolean,
  hasSubstantialCodebase: boolean
): GitHubRepositoryView["productionStatus"] {
  if (score >= 78 && (deployed || hasSubstantialCodebase)) return "Production-grade";
  if (score >= 66) return "Portfolio-ready";
  if (score >= 50) return "Promising";
  return "Low signal";
}

function repoSummary({
  repo,
  technologies,
  deployed,
  hasBackend,
  hasDatabase,
  hasAuth,
}: {
  repo: GitHubRepo;
  technologies: string[];
  deployed: boolean;
  hasBackend: boolean;
  hasDatabase: boolean;
  hasAuth: boolean;
}) {
  const stack = technologies.slice(0, 3).join(", ");
  const proof = [
    deployed ? "live deployment" : "",
    hasAuth ? "auth" : "",
    hasDatabase ? "database" : "",
    hasBackend ? "backend/API" : "",
  ].filter(Boolean);

  if (stack && proof.length) {
    return `${stack} project with ${proof.slice(0, 3).join(", ")} evidence.`;
  }

  if (stack) {
    return `${stack} repository with recruiter-visible stack evidence.`;
  }

  return repo.description ?? "Repository needs clearer stack, documentation, and production proof.";
}

function detectModernStack(repo: GitHubRepo, evidence: RepoEvidence) {
  const deps = packageDependencies(evidence.packageJson);
  const pathText = evidence.treePaths.join(" ").toLowerCase();
  const readmeText = evidence.readmeText.toLowerCase();
  const metadataText = [repo.name, repo.description ?? "", repo.language ?? "", ...(repo.topics ?? [])]
    .join(" ")
    .toLowerCase();
  const allText = `${metadataText} ${readmeText} ${pathText}`;
  const technologies = new Set<string>();

  if (deps.has("next") || hasPath(evidence.treePaths, ["next.config", /^app\//])) technologies.add("Next.js");
  if (deps.has("react") || textIncludes(allText, ["react"])) technologies.add("React");
  if (deps.has("typescript") || repo.language === "TypeScript" || hasPath(evidence.treePaths, ["tsconfig.json", ".tsx"])) technologies.add("TypeScript");
  if (repo.language === "JavaScript" || deps.has("@types/node") || hasPath(evidence.treePaths, [".js", ".jsx"])) technologies.add("JavaScript");
  if (deps.has("express") || textIncludes(allText, ["express"])) technologies.add("Express");
  if (deps.has("@prisma/client") || deps.has("prisma") || hasPath(evidence.treePaths, ["prisma/schema.prisma"])) technologies.add("Prisma");
  if (textIncludes(allText, ["mongodb", "mongoose"])) technologies.add("MongoDB");
  if (textIncludes(allText, ["postgres", "postgresql", "supabase"])) technologies.add("Postgres");
  if (deps.has("tailwindcss") || hasPath(evidence.treePaths, ["tailwind.config"])) technologies.add("Tailwind");
  if (hasPath(evidence.treePaths, ["dockerfile", "docker-compose"])) technologies.add("Docker");
  if (textIncludes(allText, ["redis"])) technologies.add("Redis");
  if (textIncludes(allText, ["openai", "anthropic", "gemini", "llm", "ai "])) technologies.add("AI Integration");
  if (textIncludes(allText, ["clerk", "next-auth", "auth.js", "firebase auth", "authentication"])) technologies.add("Authentication");
  if (textIncludes(allText, ["firebase"])) technologies.add("Firebase");
  if (textIncludes(allText, ["aws", "s3", "lambda", "amplify", "ec2"])) technologies.add("AWS");
  if (hasPath(evidence.treePaths, [".github/workflows", "gitlab-ci", "circleci", "vercel.json"])) technologies.add("CI/CD");
  if (textIncludes(allText, ["jest", "vitest", "cypress", "playwright", "testing-library"]) || hasPath(evidence.treePaths, ["__tests__", ".test.", ".spec."])) technologies.add("Testing");
  if (textIncludes(allText, ["socket.io", "websocket", "ws"])) technologies.add("WebSockets");
  if (deps.has("node") || deps.has("@types/node") || hasPath(evidence.treePaths, ["server", "api", "route.ts"])) technologies.add("Node");
  if (textIncludes(allText, ["sql", "mysql", "sqlite", "drizzle"])) technologies.add("SQL");

  return Array.from(technologies);
}

function readmeDocumentationScore(readmeText: string) {
  const text = readmeText.toLowerCase();
  const lengthScore = Math.min(30, readmeText.length / 120);
  const sections = [
    textIncludes(text, ["install", "setup", "getting started"]),
    textIncludes(text, ["feature", "capabilities"]),
    textIncludes(text, ["tech stack", "technologies", "built with"]),
    textIncludes(text, ["architecture", "system design", "data flow"]),
    textIncludes(text, ["deploy", "live demo", "production"]),
    textIncludes(text, ["screenshot", "![", "<img"]),
    textIncludes(text, [".env", "environment variable", "configuration"]),
    textIncludes(text, ["api", "database", "schema"]),
  ].filter(Boolean).length;

  return clampScore(lengthScore + sections * 8.5);
}

function buildRepoEvidenceLabels(
  repo: GitHubRepo,
  evidence: RepoEvidence,
  technologies: string[]
) {
  const labels = [];
  const pathCount = evidence.treePaths.length;

  if (technologies.length >= 3) labels.push(`Modern stack: ${technologies.slice(0, 4).join(", ")}`);
  if (hasDeployment(repo, evidence.readmeText)) labels.push("Live deployment link found");
  if (pathCount >= 80) labels.push(`${pathCount}+ files/folders indicate a substantial codebase`);
  if (readmeDocumentationScore(evidence.readmeText) >= 70) labels.push("README includes strong setup, stack, architecture, or demo proof");
  if (hasScreenshots(evidence.readmeText)) labels.push("README includes screenshot or visual demo proof");
  if (hasArchitectureDocs(evidence.treePaths, evidence.readmeText)) labels.push("Architecture or system design documentation detected");
  if (hasPath(evidence.treePaths, ["prisma", "schema.prisma", "models", "db", "database"])) labels.push("Database or schema layer detected");
  if (hasPath(evidence.treePaths, ["api", "server", "route.ts", "controller"])) labels.push("Backend/API structure detected");
  if (hasPath(evidence.treePaths, [".github/workflows", "dockerfile", "docker-compose", "vercel.json"])) labels.push("Production workflow, Docker, or deployment config detected");
  if (evidence.commitCountSample >= 20) labels.push("Consistent contribution sample found");

  return labels.slice(0, 6);
}

function scoreRepository(
  repo: GitHubRepo,
  evidence: RepoEvidence
): ScoredRepository {
  const technologies = detectModernStack(repo, evidence);
  const treePaths = evidence.treePaths;
  const scripts = packageScripts(evidence.packageJson);
  const readmeText = evidence.readmeText.toLowerCase();
  const isPracticeRepo = textIncludes(`${repo.name} ${repo.description ?? ""}`.toLowerCase(), [
    "hello-world",
    "practice",
    "dsa",
    "leetcode",
    "algorithm",
    "assignment",
    "tutorial",
  ]);
  const productNameSignal = textIncludes(repo.name.toLowerCase(), [
    "talentforge",
    "planora",
    "forge",
    "platform",
    "saas",
    "ai",
  ]);
  const deployed = hasDeployment(repo, evidence.readmeText);
  const hasTesting = technologies.includes("Testing");
  const hasBackend = hasPath(treePaths, ["api", "server", "route.ts", "controller", "db", "database", "prisma"]);
  const hasAuth = technologies.includes("Authentication");
  const hasDatabase = technologies.includes("Prisma") || technologies.includes("MongoDB") || technologies.includes("Postgres");
  const hasProductionConfig = technologies.includes("Docker") || technologies.includes("CI/CD") || hasPath(treePaths, ["vercel.json", ".env.example"]);
  const hasDocsArchitecture = hasArchitectureDocs(treePaths, evidence.readmeText);
  const hasVisualProof = hasScreenshots(evidence.readmeText);
  const hasOpenSourceLicense = hasLicense(treePaths);
  const hasSubstantialCodebase = treePaths.length >= 80 || repo.size >= 700;
  const hasLargeCodebase = treePaths.length >= 180 || repo.size >= 1800;
  const docs = readmeDocumentationScore(evidence.readmeText);
  const stackDepth = Math.min(28, technologies.length * 4);

  const categoryScores: RepoQualityScores = {
    architecture: clampScore(
      (hasPath(treePaths, ["src", "app", "pages", "components"]) ? 16 : 0) +
        (hasBackend ? 16 : 0) +
        (hasDatabase ? 14 : 0) +
        (hasAuth ? 10 : 0) +
        (hasDocsArchitecture ? 16 : 0) +
        (hasSubstantialCodebase ? 16 : 0) +
        (productNameSignal && hasSubstantialCodebase ? 8 : 0) +
        stackDepth
    ),
    codebaseQuality: clampScore(
      (technologies.includes("TypeScript") ? 18 : 0) +
        (technologies.includes("Next.js") || technologies.includes("React") ? 14 : 0) +
        (scripts.some((script) => ["lint", "test", "build", "typecheck"].includes(script)) ? 16 : 0) +
        (hasTesting ? 14 : 0) +
        (hasPath(treePaths, ["components", "lib", "hooks", "utils"]) ? 12 : 0) +
        (hasLargeCodebase ? 14 : hasSubstantialCodebase ? 9 : 0) +
        (productNameSignal && technologies.length >= 4 ? 6 : 0) +
        Math.min(12, evidence.commitCountSample / 2) +
        Math.min(12, technologies.length * 2)
    ),
    productionReadiness: clampScore(
      (deployed ? 24 : 0) +
        (hasAuth ? 14 : 0) +
        (hasDatabase ? 14 : 0) +
        (hasBackend ? 12 : 0) +
        (hasProductionConfig ? 14 : 0) +
        (scripts.includes("build") ? 10 : 0) +
        (textIncludes(readmeText, [".env", "deployment", "production"]) ? 8 : 0) +
        (productNameSignal && hasBackend && hasDatabase ? 8 : 0) +
        (hasTesting ? 4 : 0)
    ),
    deployment: clampScore(
      (deployed ? 62 : 0) +
        (isPresent(repo.homepage) ? 18 : 0) +
        (textIncludes(readmeText, ["live demo", "deployed", "vercel", "netlify"]) ? 12 : 0) +
        (hasProductionConfig ? 8 : 0)
    ),
    documentation: clampScore(
      docs +
        (isPresent(repo.description) ? 8 : 0) +
        (repo.topics?.length ? 8 : 0) +
        (hasVisualProof ? 8 : 0) +
        (hasDocsArchitecture ? 8 : 0) +
        (deployed ? 6 : 0)
    ),
    maintainability: clampScore(
      (technologies.includes("TypeScript") ? 18 : 0) +
        (hasTesting ? 16 : 0) +
        (technologies.includes("CI/CD") ? 14 : 0) +
        (scripts.includes("lint") ? 12 : 0) +
        (hasPath(treePaths, ["eslint", "prettier", "tsconfig.json"]) ? 10 : 0) +
        (hasPath(treePaths, ["components", "lib", "hooks", "services"]) ? 14 : 0) +
        (hasOpenSourceLicense ? 4 : 0) +
        (docs >= 65 ? 10 : 0) +
        Math.min(6, evidence.commitCountSample / 5)
    ),
    realWorldImpact: clampScore(
      (isPresent(repo.description) ? 14 : 0) +
        (deployed ? 18 : 0) +
        (hasLargeCodebase ? 18 : hasSubstantialCodebase ? 12 : 0) +
        (technologies.includes("AI Integration") ? 14 : 0) +
        (hasAuth ? 8 : 0) +
        (hasDatabase ? 8 : 0) +
        (hasBackend ? 8 : 0) +
        (productNameSignal ? 8 : 0) +
        (repo.topics?.length ? 6 : 0) +
        Math.min(6, repo.stargazers_count + repo.forks_count)
    ),
  };

  const score = clampScore(
    categoryScores.architecture * 0.16 +
      categoryScores.codebaseQuality * 0.18 +
      categoryScores.productionReadiness * 0.18 +
      categoryScores.deployment * 0.11 +
      categoryScores.documentation * 0.14 +
      categoryScores.maintainability * 0.12 +
      categoryScores.realWorldImpact * 0.11
  );

  const flagshipSignals = [
    deployed,
    hasSubstantialCodebase,
    technologies.includes("Next.js") || technologies.includes("React"),
    technologies.includes("TypeScript"),
    hasAuth,
    hasDatabase,
    technologies.includes("AI Integration"),
    docs >= 65,
    productNameSignal,
    hasDocsArchitecture,
  ].filter(Boolean).length;
  const weight =
    isPracticeRepo && score < 60
      ? "Low"
      : score >= 76 || flagshipSignals >= 5
        ? "High"
        : score >= 60 || flagshipSignals >= 3
          ? "Medium"
          : repo.size < 60 && !repo.description && !evidence.hasReadme
            ? "Ignore"
            : "Low";
  const weightMultiplier = weight === "High" ? 5.5 : weight === "Medium" ? 2.2 : weight === "Low" ? 0.6 : 0.08;
  const issues = [
    !isPresent(repo.description) ? "missing repo description" : "",
    !evidence.hasReadme ? "missing README" : "",
    !deployed ? "missing live demo" : "",
    !repo.topics?.length ? "missing topics" : "",
    !hasVisualProof ? "missing README screenshots or visual demo" : "",
    !hasDocsArchitecture ? "missing architecture docs" : "",
    !hasOpenSourceLicense ? "missing license" : "",
    docs < 55 && evidence.hasReadme ? "README needs screenshots, setup, stack, or architecture proof" : "",
    !hasTesting && score >= 60 ? "testing evidence not found" : "",
    daysSince(repo.pushed_at ?? repo.updated_at) > 365 ? "inactive project" : "",
  ].filter(Boolean);

  return {
    name: repo.name,
    url: repo.html_url,
    liveDemoUrl: repo.homepage,
    description: repo.description,
    language: repo.language,
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    topics: repo.topics ?? [],
    homepage: repo.homepage ?? (deployed ? "README deployment link" : null),
    updatedAt: repo.updated_at,
    hasReadme: evidence.hasReadme,
    score,
    weight,
    recruiterGrade: recruiterGrade(score),
    productionStatus: productionStatus(score, deployed, hasSubstantialCodebase),
    aiSummary: repoSummary({ repo, technologies, deployed, hasBackend, hasDatabase, hasAuth }),
    technologies,
    evidence: buildRepoEvidenceLabels(repo, evidence, technologies),
    quality: [
      { label: "Architecture", value: categoryScores.architecture },
      { label: "Production", value: categoryScores.productionReadiness },
      { label: "Docs", value: categoryScores.documentation },
      { label: "Maintainability", value: categoryScores.maintainability },
    ],
    signals: {
      architecture: hasDocsArchitecture || categoryScores.architecture >= 72,
      deployment: deployed,
      testing: hasTesting,
      readme: evidence.hasReadme,
    },
    issues,
    categoryScores,
    weightMultiplier,
  };
}

function weightedCategoryAverage(repos: ScoredRepository[], key: keyof RepoQualityScores) {
  const usefulRepos = repos.filter((repo) => repo.weight !== "Ignore");
  const totalWeight = usefulRepos.reduce((sum, repo) => sum + repo.weightMultiplier, 0);
  if (!totalWeight) return 0;

  return clampScore(
    usefulRepos.reduce(
      (sum, repo) => sum + repo.categoryScores[key] * repo.weightMultiplier,
      0
    ) / totalWeight
  );
}

function weightedRepoScore(repos: ScoredRepository[]) {
  const usefulRepos = repos.filter((repo) => repo.weight !== "Ignore");
  const totalWeight = usefulRepos.reduce((sum, repo) => sum + repo.weightMultiplier, 0);
  if (!totalWeight) return 0;

  return clampScore(
    usefulRepos.reduce((sum, repo) => sum + repo.score * repo.weightMultiplier, 0) / totalWeight
  );
}

function buildLanguages(
  repos: GitHubRepo[],
  languageResponses: Array<Record<string, number> | null>
) {
  const languageTotals = new Map<string, number>();

  repos.forEach((repo) => {
    if (repo.language) {
      languageTotals.set(repo.language, (languageTotals.get(repo.language) ?? 0) + 1);
    }
  });

  languageResponses.forEach((languages) => {
    if (!languages) return;
    Object.entries(languages).forEach(([language, bytes]) => {
      languageTotals.set(language, (languageTotals.get(language) ?? 0) + bytes);
    });
  });

  const total = Array.from(languageTotals.values()).reduce((sum, value) => sum + value, 0);

  return Array.from(languageTotals.entries())
    .map(([language, bytes]) => ({
      language,
      bytes,
      percent: total ? clampScore((bytes / total) * 100) : 0,
    }))
    .sort((a, b) => b.bytes - a.bytes)
    .slice(0, 8);
}

function detectSkills(
  repos: GitHubRepo[],
  languages: Array<{ language: string }>,
  scoredRepos: ScoredRepository[]
) {
  const topicSkills = repos.flatMap((repo) => repo.topics ?? []);
  const evidenceSkills = scoredRepos.flatMap((repo) => repo.technologies);
  const descriptionSkills = repos.flatMap((repo) =>
    [repo.name, repo.description ?? ""].join(" ").match(/\b(?:react|next|node|python|typescript|javascript|docker|aws|sql|postgres|mongodb|prisma|tailwind|jest|cypress|graphql|api|ai|ml|openai|clerk|firebase|redis|websocket)\b/gi) ?? []
  );

  return Array.from(
    new Set([...languages.map((item) => item.language), ...topicSkills, ...evidenceSkills, ...descriptionSkills])
  )
    .filter((item) => item.trim().length > 1)
    .slice(0, 24);
}

function buildTechnologyInsights(scoredRepos: ScoredRepository[]) {
  const technologyCounts = new Map<string, number>();
  const usefulRepos = scoredRepos.filter((repo) => repo.weight !== "Ignore");

  usefulRepos.forEach((repo) => {
    repo.technologies.forEach((technology) => {
      technologyCounts.set(technology, (technologyCounts.get(technology) ?? 0) + 1);
    });
  });

  const maxCount = Math.max(1, ...technologyCounts.values());

  return Array.from(technologyCounts.entries())
    .map(([technology, count]) => ({
      technology,
      count,
      percent: clampScore((count / maxCount) * 100),
    }))
    .sort((a, b) => b.count - a.count || a.technology.localeCompare(b.technology))
    .slice(0, 10);
}

function buildMissingProof(repos: GitHubRepositoryView[]) {
  const importantRepos = repos.filter((repo) => repo.weight === "High" || repo.weight === "Medium");
  const scopedRepos = importantRepos.length ? importantRepos : repos.slice(0, 6);
  const proofItems = scopedRepos.flatMap((repo) =>
    repo.issues
      .filter((issue) =>
        [
          "missing README",
          "missing live demo",
          "missing README screenshots or visual demo",
          "missing architecture docs",
          "testing evidence not found",
          "missing license",
        ].includes(issue)
      )
      .map((issue) => `${repo.name}: ${issue}`)
  );

  return Array.from(new Set(proofItems)).slice(0, 10);
}

function buildRecruiterSummary({
  github,
  productionProjects,
  liveDeployments,
  topRepo,
  technologies,
}: {
  github: number;
  productionProjects: number;
  liveDeployments: number;
  topRepo: GitHubRepositoryView | undefined;
  technologies: Array<{ technology: string; count: number; percent: number }>;
}) {
  const stack = technologies.slice(0, 4).map((item) => item.technology).join(", ");

  if (!topRepo) {
    return "No recruiter-ready repositories were available for analysis yet.";
  }

  if (github >= 82) {
    return `${topRepo.name} anchors a strong GitHub profile with ${productionProjects} production-grade project${productionProjects === 1 ? "" : "s"}, ${liveDeployments} live deployment${liveDeployments === 1 ? "" : "s"}, and clear ${stack || "modern stack"} evidence.`;
  }

  if (github >= 68) {
    return `${topRepo.name} shows promising project quality. Adding more deployment, testing, and architecture proof would make the profile easier for recruiters to trust quickly.`;
  }

  return `${topRepo.name} is the strongest current signal, but the profile needs stronger README proof, deployment links, testing, and architecture notes to read as recruiter-ready.`;
}

function buildActivityTimeline({
  repos,
  events,
  productionProjects,
  liveDeployments,
}: {
  repos: GitHubRepositoryView[];
  events: GitHubEvent[];
  productionProjects: number;
  liveDeployments: number;
}) {
  const latestRepo = repos[0];

  return [
    {
      label: latestRepo ? `${latestRepo.name} ranked strongest` : "Repository scan ready",
      detail: latestRepo
        ? `${latestRepo.productionStatus} with ${latestRepo.score}/100 recruiter value.`
        : "Analyze a GitHub profile to populate recruiter evidence.",
      tone: "cyan" as const,
    },
    {
      label: `${productionProjects} production project${productionProjects === 1 ? "" : "s"} detected`,
      detail: "Weighted higher than popularity metrics like followers, forks, or stars.",
      tone: "emerald" as const,
    },
    {
      label: `${liveDeployments} live deployment${liveDeployments === 1 ? "" : "s"} found`,
      detail: "Deployment proof improves recruiter confidence and portfolio readiness.",
      tone: "purple" as const,
    },
    {
      label: `${events.length} recent public event${events.length === 1 ? "" : "s"}`,
      detail: events.length ? "Recent GitHub activity was visible through the public API." : "Recent public activity was unavailable or empty.",
      tone: "amber" as const,
    },
  ];
}

function recommendationList(result: {
  repos: ScoredRepository[];
  scores: AnalyzerResult["scores"];
}) {
  const missingReadmeCount = result.repos.filter((repo) => !repo.hasReadme).length;
  const missingDemoCount = result.repos.filter((repo) => !repo.homepage).length;
  const missingTopicsCount = result.repos.filter((repo) => !repo.topics.length).length;
  const weakRepoCount = result.repos.filter((repo) => repo.score < 55).length;
  const topRepos = result.repos
    .filter((repo) => repo.weight === "High" || repo.weight === "Medium")
    .slice(0, 3)
    .map((repo) => repo.name);

  return [
    {
      title: "Pin the top recruiter-facing repositories",
      reason: topRepos.length
        ? `Feature ${topRepos.join(", ")} first so recruiters open production-grade work before small practice repos.`
        : "Feature your strongest 3 production-grade repositories first so recruiters see proof before noise.",
      priority: "High",
      impact: "+visibility",
    },
    missingReadmeCount
      ? {
          title: "Improve README quality",
          reason: `${missingReadmeCount} repos are missing README proof. Add setup, screenshots, architecture, and outcomes.`,
          priority: "High",
          impact: "+documentation",
        }
      : null,
    missingDemoCount
      ? {
          title: "Add live demo links",
          reason: `${missingDemoCount} repos do not expose a live demo or homepage URL.`,
          priority: "Medium",
          impact: "+recruiter trust",
        }
      : null,
    missingTopicsCount
      ? {
          title: "Add repository topics",
          reason: "Topics make your tech stack machine-readable for recruiters and search.",
          priority: "Medium",
          impact: "+discoverability",
        }
      : null,
    {
      title: "Add tech stack and architecture sections",
      reason: "Recruiter-ready projects explain stack choices, data flow, tradeoffs, and deployment.",
      priority: result.scores.architecture < 70 ? "High" : "Medium",
      impact: "+architecture",
    },
    result.scores.maintainability < 70
      ? {
          title: "Add CI, lint, and testing proof",
          reason: "Maintainability now affects GitHub quality. Add tests, lint scripts, CI workflows, or deployment checks to flagship repos.",
          priority: "Medium",
          impact: "+maintainability",
        }
      : null,
    result.scores.productionReadiness < 70
      ? {
          title: "Show production readiness",
          reason: "Recruiters respond to projects with auth, database, deployment, environment setup, and clear tradeoffs.",
          priority: "High",
          impact: "+production",
        }
      : null,
    result.repos.some((repo) => repo.weight === "Ignore")
      ? {
          title: "Hide low-signal repositories",
          reason: "Tiny hello-world, tutorial, or abandoned repos dilute the profile. Archive or unpin anything that does not support your target role.",
          priority: "Low",
          impact: "+signal",
        }
      : null,
    {
      title: "Add screenshots and live demo links",
      reason: "A README with screenshots, architecture, and a demo helps reviewers understand quality in under 60 seconds.",
      priority: result.scores.documentation < 75 || result.scores.deployment < 65 ? "High" : "Medium",
      impact: "+proof",
    },
    weakRepoCount
      ? {
          title: "Clean weak repositories",
          reason: `${weakRepoCount} repos have weak recruiter signal. Archive, rewrite, or hide low-signal work.`,
          priority: "Low",
          impact: "+profile polish",
        }
      : null,
  ].filter((item): item is GitHubRecommendation => Boolean(item));
}

async function analyzeGitHubProfile(
  username: string,
  portfolioUrl: string,
  resumeContext: ResumeContext
): Promise<AnalyzerResult> {
  const cleanedUsername = username.trim().replace(/^@/, "");
  const encodedUsername = encodeURIComponent(cleanedUsername);
  const [profile, repos, events] = await Promise.all([
    fetchGitHubJSON<GitHubUser>(`https://api.github.com/users/${encodedUsername}`),
    fetchGitHubJSON<GitHubRepo[]>(`https://api.github.com/users/${encodedUsername}/repos?per_page=100&sort=updated`, { paginate: true }),
    fetchGitHubJSON<GitHubEvent[]>(`https://api.github.com/users/${encodedUsername}/events/public?per_page=30`).catch(() => []),
  ]);

  if (!repos.length) {
    throw new GitHubApiError("empty", "This GitHub profile has no public repositories.");
  }

  const analysisRepos = repos
    .filter((repo) => !repo.archived)
    .sort((a, b) => {
      const bSignal =
        b.stargazers_count * 2 +
        b.forks_count +
        Math.min(18, b.size / 250) +
        (isPresent(b.description) ? 6 : 0) +
        (isPresent(b.homepage) ? 8 : 0) +
        (b.topics?.length ? 5 : 0);
      const aSignal =
        a.stargazers_count * 2 +
        a.forks_count +
        Math.min(18, a.size / 250) +
        (isPresent(a.description) ? 6 : 0) +
        (isPresent(a.homepage) ? 8 : 0) +
        (a.topics?.length ? 5 : 0);
      return bSignal - aSignal || new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });
  const detailRepos = analysisRepos.slice(0, 16);
  const [repoEvidenceResults, languageResults] = await Promise.all([
    Promise.all(
      detailRepos.map(async (repo): Promise<[string, RepoEvidence]> => {
        const branch = encodeURIComponent(repo.default_branch);
        const [readmeFile, packageFile, treeResponse, commits] = await Promise.all([
          fetchOptionalJSON<GitHubContentFile>(`https://api.github.com/repos/${repo.full_name}/readme`).catch((error) => {
            if (error instanceof GitHubApiError) throw error;
            return null;
          }),
          fetchOptionalJSON<GitHubContentFile>(`https://api.github.com/repos/${repo.full_name}/contents/package.json?ref=${branch}`).catch((error) => {
            if (error instanceof GitHubApiError) throw error;
            return null;
          }),
          fetchOptionalJSON<GitHubTreeResponse>(`https://api.github.com/repos/${repo.full_name}/git/trees/${branch}?recursive=1`).catch((error) => {
            if (error instanceof GitHubApiError) throw error;
            return null;
          }),
          fetchOptionalJSON<GitHubCommit[]>(`https://api.github.com/repos/${repo.full_name}/commits?per_page=30`).catch((error) => {
            if (error instanceof GitHubApiError) throw error;
            return [];
          }),
        ]);

        return [
          repo.full_name,
          {
            hasReadme: Boolean(readmeFile),
            readmeText: decodeGitHubContent(readmeFile),
            packageJson: parsePackageJson(packageFile),
            treePaths: treeResponse?.tree.map((item) => item.path) ?? [],
            commitCountSample: commits?.length ?? 0,
          },
        ];
      })
    ),
    Promise.all(
      detailRepos.map((repo) =>
        fetchGitHubJSON<Record<string, number>>(`https://api.github.com/repos/${repo.full_name}/languages`).catch((error) => {
          if (error instanceof GitHubApiError) throw error;
          return null;
        })
      )
    ),
  ]);
  const evidenceMap = new Map(repoEvidenceResults);
  const fallbackEvidence: RepoEvidence = {
    hasReadme: false,
    readmeText: "",
    packageJson: null,
    treePaths: [],
    commitCountSample: 0,
  };
  const languages = buildLanguages(repos, languageResults);
  const scoredRepos = analysisRepos
    .slice(0, 24)
    .map((repo) => scoreRepository(repo, evidenceMap.get(repo.full_name) ?? fallbackEvidence))
    .sort((a, b) => b.score * b.weightMultiplier - a.score * a.weightMultiplier);
  const viewRepos: GitHubRepositoryView[] = scoredRepos;
  const activeRepos = scoredRepos.filter((repo) => daysSince(repo.updatedAt) <= 365);
  const architecture = weightedCategoryAverage(scoredRepos, "architecture");
  const codebaseQuality = weightedCategoryAverage(scoredRepos, "codebaseQuality");
  const productionReadiness = weightedCategoryAverage(scoredRepos, "productionReadiness");
  const deployment = weightedCategoryAverage(scoredRepos, "deployment");
  const documentation = weightedCategoryAverage(scoredRepos, "documentation");
  const maintainability = weightedCategoryAverage(scoredRepos, "maintainability");
  const realWorldImpact = weightedCategoryAverage(scoredRepos, "realWorldImpact");
  const repositoryQuality = weightedRepoScore(scoredRepos);
  const profileCompleteness = clampScore(
    (profile.bio ? 10 : 0) +
      (profile.blog || portfolioUrl ? 10 : 0) +
      Math.min(8, profile.followers) +
      Math.min(8, activeRepos.length * 2) +
      Math.min(4, events.length)
  );
  const flagshipLift = Math.min(
    10,
    scoredRepos
      .filter((repo) => repo.weight === "High" && repo.score >= 72)
      .slice(0, 2)
      .reduce((sum, repo) => sum + 4 + Math.max(0, repo.score - 74) / 3.5, 0)
  );
  const github = clampScore(
    repositoryQuality * 0.72 +
      architecture * 0.07 +
      productionReadiness * 0.07 +
      documentation * 0.05 +
      maintainability * 0.04 +
      realWorldImpact * 0.04 +
      profileCompleteness * 0.01 +
      flagshipLift
  );
  const technologies = buildTechnologyInsights(scoredRepos);
  const productionProjects = scoredRepos.filter((repo) => repo.productionStatus === "Production-grade").length;
  const liveDeployments = scoredRepos.filter((repo) => repo.liveDemoUrl).length;
  const recruiterReadiness = clampScore(
    github * 0.55 +
      productionReadiness * 0.16 +
      deployment * 0.1 +
      documentation * 0.1 +
      maintainability * 0.09
  );
  const recruiterSummary = buildRecruiterSummary({
    github,
    productionProjects,
    liveDeployments,
    topRepo: scoredRepos[0],
    technologies,
  });
  const detectedSkills = detectSkills(repos, languages, scoredRepos);
  const detectedSkillKeys = new Set(detectedSkills.map(normalizeSkill));
  const resumeSkillKeys = new Set(resumeContext.skills.map(normalizeSkill));
  const verifiedSkills = resumeContext.skills.filter((skill) => detectedSkillKeys.has(normalizeSkill(skill)));
  const resumeMismatch = resumeContext.skills.filter(
    (skill) => !detectedSkillKeys.has(normalizeSkill(skill))
  );
  const githubOnlyEvidence = detectedSkills.filter(
    (skill) => !resumeSkillKeys.has(normalizeSkill(skill))
  );
  const strongestRepository = scoredRepos[0]?.name ?? null;
  const bestPortfolioProject =
    scoredRepos.find((repo) => repo.homepage)?.name ??
    scoredRepos.find((repo) => repo.weight === "High")?.name ??
    strongestRepository;
  const result: AnalyzerResult = {
    profile,
    repos: viewRepos,
    languages,
    technologies,
    hero: {
      recruiterReadiness,
      productionProjects,
      liveDeployments,
      languagesUsed: languages.length,
      recruiterSummary,
    },
    timeline: buildActivityTimeline({
      repos: viewRepos,
      events,
      productionProjects,
      liveDeployments,
    }),
    scores: {
      github,
      architecture,
      codebaseQuality,
      productionReadiness,
      deployment,
      documentation,
      maintainability,
      realWorldImpact,
    },
    insights: {
      strongestLanguages: languages.slice(0, 5).map((item) => item.language),
      bestRepositories: scoredRepos.slice(0, 5),
      weakRepositories: scoredRepos.filter((repo) => repo.score < 55 || repo.weight === "Ignore").slice(0, 6),
      missingReadme: viewRepos.filter((repo) => !repo.hasReadme).map((repo) => repo.name).slice(0, 8),
      missingLiveDemo: viewRepos.filter((repo) => !repo.homepage).map((repo) => repo.name).slice(0, 8),
      missingDescription: viewRepos.filter((repo) => !repo.description).map((repo) => repo.name).slice(0, 8),
      missingTopics: viewRepos.filter((repo) => !repo.topics.length).map((repo) => repo.name).slice(0, 8),
      inactiveProjects: viewRepos.filter((repo) => daysSince(repo.updatedAt) > 365).map((repo) => repo.name).slice(0, 8),
      missingProof: buildMissingProof(viewRepos),
    },
    recommendations: [] as GitHubRecommendation[],
    resumeConnection: {
      detectedSkills,
      resumeProjects: scoredRepos.filter((repo) => repo.score >= 65).slice(0, 5).map((repo) => repo.name),
      resumeKeywords: detectedSkills.slice(0, 12),
      resumeMismatch: resumeMismatch.slice(0, 10),
      githubOnlyEvidence: githubOnlyEvidence.slice(0, 10),
      verifiedSkills: verifiedSkills.slice(0, 12),
      strongestRepository,
      bestPortfolioProject,
    },
    recentActivity: events.length
      ? `${events.length} public event${events.length === 1 ? "" : "s"} in recent GitHub activity`
      : "Recent public activity was unavailable or empty.",
  };

  return {
    ...result,
    recommendations: recommendationList({ repos: scoredRepos, scores: result.scores }),
  };
}

function errorMessage(error: unknown) {
  if (error instanceof GitHubApiError) {
    return error.message;
  }

  return "Unable to analyze this GitHub profile right now.";
}

function errorKind(error: unknown): GitHubApiErrorKind {
  return error instanceof GitHubApiError ? error.kind : "network";
}

function analyzerErrorContent(kind: GitHubApiErrorKind, message: string) {
  if (kind === "rate-limit") {
    return {
      title: "GitHub API rate limit reached",
      description:
        "You have reached GitHub's public API limit. Try again later, or create a GitHub Personal Access Token, add it to .env.local as GITHUB_TOKEN, and restart the application. The token stays server-side and is never exposed to the browser.",
      showTokenHelp: true,
      details: [
        "Create a GitHub Personal Access Token",
        "Add it to .env.local as GITHUB_TOKEN",
        "Restart the application",
        "Retry the analysis",
      ],
    };
  }

  if (kind === "invalid" || kind === "not-found") {
    return {
      title: "GitHub profile not found",
      description: message,
      showTokenHelp: false,
      details: ["Check spelling", "Remove @ or extra spaces"],
    };
  }

  if (kind === "empty") {
    return {
      title: "No public repositories found",
      description: message,
      showTokenHelp: false,
      details: ["Private repositories are not analyzed", "Public repository evidence is required"],
    };
  }

  if (kind === "unauthorized") {
    return {
      title: "Sign in required",
      description: message,
      showTokenHelp: false,
      details: ["Sign in again", "Return to GitHub Analyzer"],
    };
  }

  if (kind === "invalid-token") {
    return {
      title: "GitHub token needs attention",
      description:
        "GitHub rejected GITHUB_TOKEN. Check the token value, permissions, expiration date, and .env.local formatting, then restart the application.",
      showTokenHelp: true,
      details: [
        "Verify the token was pasted correctly",
        "Check token expiration",
        "Use a GitHub token prefix like github_pat_ or ghp_",
        "Restart the application",
      ],
    };
  }

  if (kind === "timeout") {
    return {
      title: "GitHub request timed out",
      description:
        "GitHub took too long to respond. Retry in a moment; if this keeps happening, GitHub may be degraded or your network may be unstable.",
      showTokenHelp: false,
      details: ["Retry the request", "Check GitHub status if it repeats"],
    };
  }

  if (kind === "service-unavailable") {
    return {
      title: "GitHub is temporarily unavailable",
      description:
        "GitHub's API is not responding reliably right now. Retry shortly.",
      showTokenHelp: false,
      details: ["GitHub service may be degraded", "Retry shortly"],
    };
  }

  if (kind === "missing-token") {
    return {
      title: "GitHub token not configured",
      description:
        "The analyzer can run without a token, but authenticated requests have much higher limits. Add GITHUB_TOKEN to .env.local and restart the application.",
      showTokenHelp: true,
      details: [
        "Create a GitHub Personal Access Token",
        "Add GITHUB_TOKEN to .env.local",
        "Restart the application",
      ],
    };
  }

  return {
    title: "GitHub analysis unavailable",
    description: message,
    showTokenHelp: false,
    details: ["Retry analysis", "Check network connection"],
  };
}

function metricCards(result: AnalyzerResult): GitHubScoreMetric[] {
  return [
    {
      label: "GitHub Score",
      value: result.scores.github,
      description: "Evidence-weighted score driven primarily by production-grade repository quality.",
      icon: GitBranch,
      tone: "cyan",
    },
    {
      label: "Architecture",
      value: result.scores.architecture,
      description: "Structure, data flow, backend/API layers, database proof, and architectural README evidence.",
      icon: BarChart3,
      tone: "emerald",
    },
    {
      label: "Codebase Quality",
      value: result.scores.codebaseQuality,
      description: "Modern stack, TypeScript, scripts, tests, project size, and organized source structure.",
      icon: Code2,
      tone: "purple",
    },
    {
      label: "Production",
      value: result.scores.productionReadiness,
      description: "Deployment readiness, auth, database, backend, Docker/CI, build scripts, and env setup.",
      icon: ShieldCheck,
      tone: "amber",
    },
    {
      label: "Deployment",
      value: result.scores.deployment,
      description: "Live demo, Vercel/Netlify/GitHub Pages links, and deployment configuration proof.",
      icon: LinkIcon,
      tone: "cyan",
    },
    {
      label: "Documentation",
      value: result.scores.documentation,
      description: "README quality, screenshots, setup, stack, architecture, and project metadata.",
      icon: BookOpen,
      tone: "purple",
    },
    {
      label: "Maintainability",
      value: result.scores.maintainability,
      description: "Testing, linting, CI/CD, TypeScript, reusable folders, and clear maintenance signals.",
      icon: Activity,
      tone: "amber",
    },
    {
      label: "Real-world Impact",
      value: result.scores.realWorldImpact,
      description: "Product scope, production features, AI/auth/database proof, deployment, and usage signal.",
      icon: Target,
      tone: "emerald",
    },
  ];
}

function heroMetrics(result: AnalyzerResult) {
  return [
    { label: "Overall GitHub Score", value: `${result.scores.github}`, tone: "cyan" as const },
    { label: "Recruiter Readiness", value: `${result.hero.recruiterReadiness}%`, tone: "emerald" as const },
    { label: "Production Projects", value: `${result.hero.productionProjects}`, tone: "purple" as const },
    { label: "Public Repositories", value: `${result.profile.public_repos}`, tone: "amber" as const },
    { label: "Live Deployments", value: `${result.hero.liveDeployments}`, tone: "cyan" as const },
    { label: "Languages Used", value: `${result.hero.languagesUsed}`, tone: "purple" as const },
  ];
}

function recruiterRadar(result: AnalyzerResult) {
  return [
    { label: "Readiness", value: result.hero.recruiterReadiness },
    { label: "Production", value: result.scores.productionReadiness },
    { label: "Documentation", value: result.scores.documentation },
    { label: "Deployment", value: result.scores.deployment },
    { label: "Maintainability", value: result.scores.maintainability },
  ];
}

function architectureRadar(result: AnalyzerResult) {
  return [
    { label: "Architecture", value: result.scores.architecture },
    { label: "Codebase", value: result.scores.codebaseQuality },
    { label: "Impact", value: result.scores.realWorldImpact },
    { label: "Docs", value: result.scores.documentation },
    { label: "Production", value: result.scores.productionReadiness },
  ];
}

export function GitHubAnalyzerClient({ resumeContext }: { resumeContext: ResumeContext }) {
  const [username, setUsername] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [result, setResult] = useState<AnalyzerResult | null>(null);
  const [error, setError] = useState<{ kind: GitHubApiErrorKind; message: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const metrics = useMemo(() => (result ? metricCards(result) : []), [result]);

  async function runAnalysis() {
    setError(null);

    if (!username.trim()) {
      setError({ kind: "invalid", message: "Enter a GitHub username to analyze." });
      return;
    }

    setIsLoading(true);

    try {
      const nextResult = await analyzeGitHubProfile(username, portfolioUrl, resumeContext);
      setResult(nextResult);
    } catch (caughtError) {
      setResult(null);
      setError({ kind: errorKind(caughtError), message: errorMessage(caughtError) });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAnalyze(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await runAnalysis();
  }

  const fallbackError = error ? analyzerErrorContent(error.kind, error.message) : null;

  return (
    <div className={forge.section}>
      <GitHubHero
        isLoading={isLoading}
        metrics={result ? heroMetrics(result) : undefined}
        summary={result?.hero.recruiterSummary}
      >
        <form onSubmit={handleAnalyze} className="mt-6 grid gap-3 lg:grid-cols-[1fr_1fr_auto]">
          <label className="sr-only" htmlFor="github-username">
            GitHub username
          </label>
          <div className="relative">
            <GitBranch className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-cyan-100" />
            <input
              id="github-username"
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="GitHub username"
              required
              autoCapitalize="none"
              autoComplete="username"
              spellCheck={false}
              className={`h-12 w-full pl-11 ${forge.input}`}
            />
          </div>
          <label className="sr-only" htmlFor="portfolio-url">
            Portfolio URL
          </label>
          <div className="relative">
            <LinkIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-purple-100" />
            <input
              id="portfolio-url"
              type="url"
              value={portfolioUrl}
              onChange={(event) => setPortfolioUrl(event.target.value)}
              placeholder="Portfolio URL (optional)"
              autoCapitalize="none"
              autoComplete="url"
              spellCheck={false}
              className={`h-12 w-full pl-11 ${forge.input}`}
            />
          </div>
          <Button type="submit" disabled={isLoading} className={`h-12 ${forge.primaryButton}`}>
            {isLoading ? "Analyzing..." : "Analyze Profile"}
          </Button>
        </form>
      </GitHubHero>

      {isLoading ? (
        <AnalyzerEmptyState
          title="Scanning repository evidence"
          description="Fetching README content, package.json, folder structure, language data, deployment links, and recent public activity from GitHub's public API."
          statusRole="status"
        />
      ) : null}

      {!isLoading && !result && fallbackError ? (
        <AnalyzerEmptyState
          title={fallbackError.title}
          description={fallbackError.description}
          details={fallbackError.details}
          statusRole="alert"
          action={
            <div className="flex flex-wrap justify-center gap-3">
              <Button
                type="button"
                onClick={() => {
                  void runAnalysis();
                }}
                className={forge.primaryButton}
              >
                Retry
              </Button>
              {fallbackError.showTokenHelp ? (
                <Button asChild variant="outline" className={forge.secondaryButton}>
                  <a
                    href="https://docs.github.com/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Token docs
                  </a>
                </Button>
              ) : null}
            </div>
          }
        />
      ) : null}

      {!isLoading && !result && !fallbackError ? (
        <AnalyzerEmptyState
          title="No GitHub profile analyzed yet"
          description="Enter a public GitHub username to generate evidence-based project quality, production readiness, recruiter visibility, and resume-alignment insights."
        />
      ) : null}

      {result ? (
        <>
          <section className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
            <GitHubSection
              title="Top Projects Comparison"
              description="Ranked by recruiter value, production evidence, modern stack, and project depth."
            >
              <TopProjectsTable repos={result.insights.bestRepositories} />
            </GitHubSection>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
              {metrics.slice(0, 4).map((metric) => (
                <GitHubScoreCard key={metric.label} metric={metric} />
              ))}
            </div>
          </section>

          <GitHubSection
            title={`${result.profile.name ?? result.profile.login}'s evidence dashboard`}
            description={`${result.profile.public_repos} public repositories · ${result.profile.followers} followers · ${result.recentActivity}`}
            action={<ExternalProfileButton href={result.profile.html_url} />}
          >
            <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
              <LanguageDonut languages={result.languages} />
              <RepositoryQualityComparison repos={result.insights.bestRepositories} />
              <RadarChart title="Recruiter readiness radar" items={recruiterRadar(result)} />
              <RadarChart title="Architecture radar" items={architectureRadar(result)} />
            </div>
          </GitHubSection>

          <section className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
            <GitHubSection
              title="Top Recruiter Projects"
              description="The first repositories a technical recruiter should open."
            >
              <div className="grid gap-4 lg:grid-cols-3 xl:grid-cols-1 2xl:grid-cols-3">
                {result.insights.bestRepositories.slice(0, 3).map((repo) => (
                  <RepositoryCard key={repo.url} repo={repo} />
                ))}
              </div>
            </GitHubSection>

            <GitHubSection
              title="Signals & Recommendations"
              description="Compact recruiter-facing proof and the highest-impact fixes."
            >
              <div className="grid gap-4">
                <TechStackChart technologies={result.technologies} />
                <ActivityTimeline items={result.timeline} />
                {result.recommendations.slice(0, 3).map((recommendation) => (
                  <GitHubRecommendationCard
                    key={recommendation.title}
                    recommendation={recommendation}
                  />
                ))}
              </div>
            </GitHubSection>
          </section>

          <section className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
            <GitHubSection
              title="Missing GitHub Proof"
              description="Specific evidence gaps that weaken otherwise strong projects during recruiter or hiring-manager review."
            >
              <div className="grid gap-4 md:grid-cols-2">
                <GitHubInsightCard title="Priority proof gaps" items={result.insights.missingProof} icon={ShieldCheck} />
                <GitHubInsightCard title="Missing metadata" items={[
                    ...result.insights.missingReadme.map((repo) => `${repo}: README`),
                    ...result.insights.missingDescription.map((repo) => `${repo}: description`),
                    ...result.insights.missingTopics.map((repo) => `${repo}: topics`),
                  ].slice(0, 8)} icon={FileText} />
              </div>
            </GitHubSection>

            <GitHubSection
              title="Resume connection"
              description={resumeContext.title ? `Compared against ${resumeContext.title}.` : "No uploaded resume skills found yet."}
              action={
                <Button asChild variant="outline" className={forge.secondaryButton}>
                  <Link href="/dashboard/resume">
                    Update Resume
                    <Upload className="h-4 w-4" />
                  </Link>
                </Button>
              }
            >
              <div className="grid gap-4 md:grid-cols-2">
                <GitHubInsightCard
                  title="Verified Skills from GitHub"
                  items={result.resumeConnection.detectedSkills.slice(0, 10)}
                  icon={Sparkles}
                />
                <GitHubInsightCard
                  title="Verified resume skills"
                  items={result.resumeConnection.verifiedSkills}
                  icon={ShieldCheck}
                />
                <GitHubInsightCard
                  title="Projects worth adding"
                  items={result.resumeConnection.resumeProjects}
                  icon={ClipboardCheck}
                />
                <GitHubInsightCard
                  title="Strongest project proof"
                  items={[
                    result.resumeConnection.strongestRepository
                      ? `Strongest repository: ${result.resumeConnection.strongestRepository}`
                      : "",
                    result.resumeConnection.bestPortfolioProject
                      ? `Best portfolio project: ${result.resumeConnection.bestPortfolioProject}`
                      : "",
                  ].filter(Boolean)}
                  icon={Star}
                />
                <GitHubInsightCard
                  title="GitHub keywords for resume"
                  items={result.resumeConnection.resumeKeywords.slice(0, 8)}
                  icon={SearchCheck}
                />
                <GitHubInsightCard
                  title="Resume vs GitHub mismatch"
                  items={[
                    ...result.resumeConnection.resumeMismatch.map((skill) => `${skill}: resume skill needs GitHub evidence`),
                    ...result.resumeConnection.githubOnlyEvidence.map((skill) => `${skill}: GitHub evidence not emphasized in resume`),
                  ].slice(0, 10)}
                  icon={BarChart3}
                />
              </div>
            </GitHubSection>
          </section>
        </>
      ) : null}
    </div>
  );
}
