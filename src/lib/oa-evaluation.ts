import type {
  OAAnswer,
  OASession,
  OASessionQuestion,
} from "@/lib/oa-session";

export type InterviewAnswerVerdict =
  | "Poor"
  | "Needs Work"
  | "Good"
  | "Strong"
  | "Excellent";

export type InterviewReadinessLevel =
  | "Needs Practice"
  | "Developing"
  | "Interview Ready"
  | "Strong Interview Readiness";

export type InterviewAnswerScoreCategory =
  | "Accuracy"
  | "Technical Depth"
  | "Relevance"
  | "Communication"
  | "Completeness";

export type InterviewAnswerCategoryScore = {
  name: InterviewAnswerScoreCategory;
  score: number;
  maxScore: number;
  reason: string;
};

export type InterviewAnswerEvaluationInput = {
  question: Pick<
    OASessionQuestion,
    | "id"
    | "title"
    | "prompt"
    | "skills"
    | "expectedAnswer"
    | "constraints"
    | "hints"
  >;
  userAnswer: string;
  questionCategory: string;
  difficulty: string;
  expectedTopics: string[];
  idealAnswerPoints: string[];
  scoreValue: number;
};

export type InterviewAnswerEvaluation = {
  questionId: string;
  questionTitle: string;
  questionCategory: string;
  difficulty: string;
  score: number;
  accuracyScore: number;
  technicalDepthScore: number;
  relevanceScore: number;
  communicationScore: number;
  completenessScore: number;
  pointsEarned: number;
  maxScore: number;
  percentage: number;
  categoryBreakdown: InterviewAnswerCategoryScore[];
  matchedTopics: string[];
  missingTopics: string[];
  matchedConcepts: string[];
  missingConcepts: string[];
  matchedIdealAnswerPoints: string[];
  expectedConceptCoverage: number;
  idealPointCoverage: number;
  semanticTopicCoverage: number;
  answerSpecificityScore: number;
  strengths: string[];
  weaknesses: string[];
  missingPoints: string[];
  improvementSuggestions: string[];
  idealAnswerSummary: string;
  scoreReasoning: string[];
  verdict: InterviewAnswerVerdict;
  feedback: string;
  recommendations: string[];
};

export type InterviewSessionCategoryBreakdown = {
  name: string;
  score: number;
  maxScore: number;
  percentage: number;
  summary: string;
};

export type InterviewSessionEvaluation = {
  sessionId: string;
  generatedAt: string;
  overallScore: number;
  readinessLevel: InterviewReadinessLevel;
  categoryBreakdown: InterviewSessionCategoryBreakdown[];
  strongestAreas: string[];
  weakestAreas: string[];
  recommendedPractice: string[];
  questionEvaluations: InterviewAnswerEvaluation[];
  totalScore: number;
  maxScore: number;
  summary: string;
  readinessScore: number;
  readiness: InterviewReadinessLevel;
  answerEvaluations: InterviewAnswerEvaluation[];
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
};

export type OAAnswerEvaluation = InterviewAnswerEvaluation;
export type OAReportCategory = InterviewSessionCategoryBreakdown;
export type OAReport = InterviewSessionEvaluation;

const STOP_WORDS = new Set([
  "the",
  "and",
  "or",
  "to",
  "of",
  "in",
  "a",
  "an",
  "for",
  "with",
  "by",
  "on",
  "from",
  "is",
  "are",
  "was",
  "were",
  "it",
  "this",
  "that",
  "as",
  "be",
  "can",
  "will",
  "should",
]);

const TECHNICAL_SIGNAL_TERMS = [
  "complexity",
  "edge case",
  "tradeoff",
  "latency",
  "cache",
  "invalidation",
  "cleanup",
  "abort",
  "dedupe",
  "idempotent",
  "race",
  "stale",
  "rerender",
  "hydration",
  "accessibility",
  "test",
  "rollback",
  "monitoring",
  "observability",
  "security",
  "permission",
  "error",
  "retry",
  "performance",
  "memory",
  "focus",
  "aria",
  "keyboard",
  "typescript",
  "react",
  "next.js",
  "api",
  "request",
  "fetcher",
  "subscriber",
  "listener",
  "useSyncExternalStore",
  "staleTime",
  "stale-while-revalidate",
  "prefetch",
  "single-flight",
  "backoff",
  "AbortController",
  "load testing",
  "cache hit",
  "cache miss",
];

type SemanticConcept = {
  id: string;
  categories: string[];
  topicPatterns: RegExp[];
  answerPatterns: RegExp[];
};

const SEMANTIC_CONCEPTS: SemanticConcept[] = [
  {
    id: "cache identity",
    categories: ["query cache"],
    topicPatterns: [
      /\b(?:query cache|cache key|normalize cache keys?|stable query keys?|query key|normalized key)\b/i,
    ],
    answerPatterns: [
      /\b(?:stable|normalized?|canonical)\s+(?:query\s+)?keys?\b/i,
      /\b(?:query|cache)\s+keys?\b/i,
      /\bkey(?:ed)?\s+by\b/i,
    ],
  },
  {
    id: "cache entry model",
    categories: ["query cache"],
    topicPatterns: [
      /\b(?:cache entr(?:y|ies)|entry eviction|cache storage|store stale data|stale data)\b/i,
    ],
    answerPatterns: [
      /\bcache\s+entr(?:y|ies)\b/i,
      /\b(?:data|value|status|error|timestamp|expiresAt|updatedAt|promise)\s+(?:inside|in|on)\s+(?:the\s+)?(?:entry|cache)\b/i,
      /\b(?:ttl|expiry|eviction|metadata)\b/i,
    ],
  },
  {
    id: "subscription/update notification",
    categories: ["query cache", "react performance", "frontend architecture"],
    topicPatterns: [
      /\b(?:subscription|subscribe|subscribers?|notify subscribers?|subscriber notification|two subscribers updated|state subscription)\b/i,
    ],
    answerPatterns: [
      /\b(?:subscribe|subscribers?|listeners?|callbacks?|notify|publish|broadcast)\b/i,
      /\buseSyncExternalStore\b/i,
      /\bstate subscription\b/i,
      /\btrigger(?:ing)?\s+(?:updates?|rerenders?)\b/i,
    ],
  },
  {
    id: "staleTime/revalidation",
    categories: ["query cache", "next.js rendering", "api reliability"],
    topicPatterns: [
      /\b(?:stale\s*time|staleTime|background revalidation|stale data|return stale data while refetching|stale while refetching|stale-while-revalidate)\b/i,
    ],
    answerPatterns: [
      /\bstale\s*-?\s*while\s*-?\s*revalidate\b/i,
      /\bstaleTime\b/i,
      /\bstale\s+(?:time|value|read|data)\b/i,
      /\bbackground\s+revalidation\b/i,
      /\b(?:return|serve)\s+stale\b/i,
      /\brefetch(?:ing)?\s+in\s+the\s+background\b/i,
    ],
  },
  {
    id: "invalidation",
    categories: ["query cache", "next.js rendering", "api reliability"],
    topicPatterns: [/\b(?:invalidate|invalidation|explicit invalidation|marks stale)\b/i],
    answerPatterns: [
      /\binvalidat(?:e|es|ed|ion)\b/i,
      /\bmark(?:ing)?\s+(?:a\s+)?(?:key|entry|query)\s+stale\b/i,
      /\bclear(?:ing)?\s+(?:a\s+)?(?:cache|entry|key)\b/i,
    ],
  },
  {
    id: "prefetching",
    categories: ["query cache", "next.js rendering"],
    topicPatterns: [/\b(?:prefetch|preload|warm cache)\b/i],
    answerPatterns: [/\b(?:prefetch|preload|warm(?:ing)?\s+the\s+cache)\b/i],
  },
  {
    id: "request deduplication",
    categories: ["query cache", "api reliability"],
    topicPatterns: [
      /\b(?:deduplicate|dedupe|duplicate requests?|in-flight requests?|avoid duplicate requests?|single flight|single-flight|one network request)\b/i,
    ],
    answerPatterns: [
      /\b(?:deduplicate|dedupe|coalesce|share)\s+(?:in\s*-?\s*flight\s+)?(?:requests?|promises?)\b/i,
      /\bin\s*-?\s*flight\s+(?:request|promise)\b/i,
      /\bsingle\s*-?\s*flight\b/i,
      /\bone\s+(?:network\s+)?request\b/i,
    ],
  },
  {
    id: "error handling",
    categories: ["query cache", "debugging", "api reliability", "system design"],
    topicPatterns: [/\b(?:error handling|failed refresh|failure handling|failures?|errors?)\b/i],
    answerPatterns: [
      /\b(?:failure|error|failed|reject(?:ion)?|fallback)\b/i,
      /\bdo\s+not\s+(?:erase|drop|lose)\b/i,
      /\bpreserve\s+(?:stale|previous|last good)\b/i,
    ],
  },
  {
    id: "retry/backoff/cancellation",
    categories: ["query cache", "api reliability", "debugging"],
    topicPatterns: [/\b(?:retry|backoff|cancel|cancellation|abort|AbortController)\b/i],
    answerPatterns: [
      /\bretr(?:y|ies|ied)\b/i,
      /\bbackoff\b/i,
      /\bAbortController\b/i,
      /\babort(?:ing|s|ed)?\b/i,
      /\bcancel(?:lation|s|ed|ing)?\b/i,
    ],
  },
  {
    id: "observability",
    categories: ["query cache", "react performance", "system design", "api reliability"],
    topicPatterns: [/\b(?:observability|monitoring|metrics|load behavior|under load|performance under load)\b/i],
    answerPatterns: [
      /\b(?:observability|monitoring|metrics?|instrumentation|tracing|logs?)\b/i,
      /\b(?:cache\s+)?hits?\b/i,
      /\b(?:cache\s+)?miss(?:es)?\b/i,
      /\bload\s+testing\b/i,
      /\bperformance\s+under\s+load\b/i,
    ],
  },
  {
    id: "react integration",
    categories: ["query cache", "react performance", "frontend architecture"],
    topicPatterns: [
      /\b(?:React|React screens?|custom hook|useQuery hook|frontend architecture|state subscription)\b/i,
    ],
    answerPatterns: [
      /\bReact\b/i,
      /\b(?:custom\s+)?hooks?\b/i,
      /\buseQuery\b/i,
      /\buseSyncExternalStore\b/i,
      /\bstate subscription\b/i,
      /\b(?:components?|screens?)\s+(?:subscribe|read|consume)\b/i,
    ],
  },
  {
    id: "rest api data",
    categories: ["query cache", "api reliability"],
    topicPatterns: [/\b(?:REST APIs?|API responses?|fetcher|requests?|REST API data)\b/i],
    answerPatterns: [
      /\b(?:REST\s*)?APIs?\b/i,
      /\bfetch(?:er|ing)?\b/i,
      /\brequests?\b/i,
      /\bresponses?\b/i,
      /\bserver\s+data\b/i,
      /\bHTTP\b/i,
    ],
  },
  {
    id: "performance optimization",
    categories: ["react performance", "query cache"],
    topicPatterns: [/\b(?:Performance Optimization|performance|latency|load behavior)\b/i],
    answerPatterns: [
      /\bperformance\b/i,
      /\blatency\b/i,
      /\bavoid(?:ing)?\s+unnecessary\s+requests?\b/i,
      /\b(?:dedupe|deduplication|cache hit|cache miss|stale read|load testing)\b/i,
      /\breduce(?:s|d)?\s+(?:network|render|load)\b/i,
    ],
  },
  {
    id: "concurrency/race conditions",
    categories: ["query cache", "debugging", "api reliability", "system design"],
    topicPatterns: [/\b(?:race|out-of-order|concurrency|latest response|stale response)\b/i],
    answerPatterns: [
      /\brace\b/i,
      /\bout\s+of\s+order\b/i,
      /\bconcurren(?:t|cy)\b/i,
      /\bstale\s+responses?\b/i,
      /\brequest\s+id\b/i,
      /\bversion(?:ing)?\b/i,
    ],
  },
  {
    id: "cleanup/memory safety",
    categories: ["query cache", "react performance", "debugging"],
    topicPatterns: [/\b(?:cleanup|memory|unmount|unsubscribe|leak)\b/i],
    answerPatterns: [
      /\bcleanup\b/i,
      /\bunmount\b/i,
      /\bunsubscribe\b/i,
      /\bmemory\s+(?:safety|leak)\b/i,
      /\b(?:remove|dispose|clear)\s+(?:listener|subscription|timer)\b/i,
    ],
  },
  {
    id: "render isolation",
    categories: ["react performance", "frontend architecture"],
    topicPatterns: [/\b(?:rerender|render optimization|memoization|render isolation|table rerenders?)\b/i],
    answerPatterns: [
      /\b(?:memo|memoization|useMemo|useCallback|React\.memo)\b/i,
      /\b(?:selector|slice|fine grained|row level|cell level)\b/i,
      /\bavoid(?:ing)?\s+(?:unnecessary\s+)?rerenders?\b/i,
      /\b(?:do\s+not|don't|prevent)\s+(?:unrelated\s+)?(?:rows?|cells?)\s+(?:from\s+)?rerender(?:ing)?\b/i,
      /\bunrelated\s+(?:rows?|cells?)\s+(?:do\s+not|don't)\s+rerender\b/i,
    ],
  },
  {
    id: "virtualization/windowing",
    categories: ["react performance", "frontend architecture"],
    topicPatterns: [/\b(?:virtualization|virtualized|windowing|5000 cards|large table|large list)\b/i],
    answerPatterns: [
      /\b(?:virtualiz(?:e|ed|ation)|windowing|visible range|overscan)\b/i,
      /\b(?:react-window|react-virtual|tanstack virtual)\b/i,
    ],
  },
  {
    id: "profiling/measurement",
    categories: ["react performance", "system design", "debugging"],
    topicPatterns: [/\b(?:profiler|measurement|diagnose|metrics|tti|lcp|latency|slow)\b/i],
    answerPatterns: [
      /\b(?:React Profiler|profile|flamegraph|measure|metrics?|web vitals|TTI|LCP|INP|p95)\b/i,
      /\bbefore\s+(?:and|\/)\s+after\b/i,
    ],
  },
  {
    id: "scale constraints",
    categories: ["frontend architecture", "system design"],
    topicPatterns: [/\b(?:scale constraints?|100 widgets?|250k|daily active|traffic|large scale)\b/i],
    answerPatterns: [
      /\b(?:scale|traffic|DAU|concurrent|p95|latency|throughput|load)\b/i,
      /\b(?:100|hundreds?|thousands?)\s+(?:widgets?|components?|users?|events?)\b/i,
    ],
  },
  {
    id: "ownership boundaries",
    categories: ["frontend architecture", "system design"],
    topicPatterns: [/\b(?:ownership|boundaries|teams|modules|micro frontend|domain)\b/i],
    answerPatterns: [
      /\b(?:ownership|boundary|boundaries|domain|module|micro-?frontend|contract)\b/i,
      /\b(?:team|squad)\s+(?:owns|ownership)\b/i,
    ],
  },
  {
    id: "failure modes",
    categories: [
      "frontend architecture",
      "system design",
      "api reliability",
      "debugging",
    ],
    topicPatterns: [/\b(?:failure|fallback|partial outage|degraded|resilience|recovery)\b/i],
    answerPatterns: [
      /\b(?:failures?|fallback|degraded|resilien(?:t|ce)|partial outage|offline|recovery)\b/i,
      /\b(?:retry|rollback|circuit breaker|graceful)\b/i,
    ],
  },
  {
    id: "tradeoffs",
    categories: ["frontend architecture", "system design"],
    topicPatterns: [/\b(?:tradeoffs?|cost|latency|memory|complexity|maintainability)\b/i],
    answerPatterns: [
      /\btrade-?offs?\b/i,
      /\b(?:latency|memory|complexity|maintainability|cost|consistency|freshness)\b/i,
    ],
  },
  {
    id: "keyboard/focus accessibility",
    categories: ["accessibility"],
    topicPatterns: [/\b(?:keyboard|focus|tab|focus trap|focus management)\b/i],
    answerPatterns: [
      /\b(?:keyboard|tab order|focus|focus trap|return focus|roving tabindex|escape key)\b/i,
    ],
  },
  {
    id: "screen reader semantics",
    categories: ["accessibility"],
    topicPatterns: [/\b(?:screen reader|aria|semantics|label|WCAG)\b/i],
    answerPatterns: [
      /\b(?:screen reader|ARIA|aria-|role=|labelledby|describedby|semantic HTML|WCAG)\b/i,
    ],
  },
  {
    id: "accessible validation",
    categories: ["accessibility", "testing"],
    topicPatterns: [/\b(?:error message|validation|forms?|color contrast|contrast)\b/i],
    answerPatterns: [
      /\b(?:aria-invalid|error message|live region|contrast|not rely only on color|validation)\b/i,
    ],
  },
  {
    id: "user-behavior testing",
    categories: ["testing"],
    topicPatterns: [/\b(?:React Testing Library|user behavior|integration tests?|checkout|testing plan)\b/i],
    answerPatterns: [
      /\b(?:React Testing Library|RTL|userEvent|screen\.|role queries?|user behavior)\b/i,
      /\b(?:integration|happy path|failure path|loading state|error state)\b/i,
    ],
  },
  {
    id: "mocking strategy",
    categories: ["testing"],
    topicPatterns: [/\b(?:mock|mocking APIs?|network mocks?|MSW|test doubles)\b/i],
    answerPatterns: [
      /\b(?:mock|MSW|fake server|network boundary|stub|test double)\b/i,
      /\b(?:do not mock|avoid mocking)\s+(?:implementation|user behavior)\b/i,
    ],
  },
  {
    id: "e2e critical path",
    categories: ["testing"],
    topicPatterns: [/\b(?:E2E|end to end|critical workflow|checkout flow|flakiness)\b/i],
    answerPatterns: [
      /\b(?:E2E|end-to-end|Playwright|Cypress|critical path|flaky|flakiness)\b/i,
    ],
  },
  {
    id: "rsc/server-client boundaries",
    categories: ["next.js rendering", "frontend architecture"],
    topicPatterns: [/\b(?:RSC|server component|client component|server client boundary|hydration)\b/i],
    answerPatterns: [
      /\b(?:RSC|server components?|client components?|use client|server-client boundary|hydration)\b/i,
    ],
  },
  {
    id: "streaming/suspense",
    categories: ["next.js rendering", "react performance"],
    topicPatterns: [/\b(?:streaming|Suspense|loading boundary|partial rendering)\b/i],
    answerPatterns: [
      /\b(?:streaming|Suspense|loading boundary|skeleton|partial render|progressive)\b/i,
    ],
  },
  {
    id: "route handlers/server actions",
    categories: ["next.js rendering"],
    topicPatterns: [/\b(?:route handlers?|server actions?|middleware|ISR|cache tags?)\b/i],
    answerPatterns: [
      /\b(?:route handlers?|server actions?|middleware|ISR|revalidat(?:e|ion)|cache tags?)\b/i,
    ],
  },
];

function normalize(value: string) {
  return value
    .toLowerCase()
    .replace(/[^\w+#.]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(value: string) {
  return normalize(value)
    .split(" ")
    .filter((token) => token.length > 2 && !STOP_WORDS.has(token));
}

function uniqueValues(values: string[]) {
  return Array.from(
    new Set(values.map((value) => value.trim()).filter(Boolean))
  );
}

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function includesTopic(answer: string, topic: string) {
  const normalizedAnswer = normalize(answer);
  const normalizedTopic = normalize(topic);

  if (!normalizedTopic) {
    return false;
  }

  if (normalizedAnswer.includes(normalizedTopic)) {
    return true;
  }

  const matchingConcepts = SEMANTIC_CONCEPTS.filter((concept) =>
    concept.topicPatterns.some((pattern) => pattern.test(topic))
  );

  if (
    matchingConcepts.some((concept) =>
      concept.answerPatterns.some((pattern) => pattern.test(answer))
    )
  ) {
    return true;
  }

  const topicTokens = tokenize(topic);
  if (!topicTokens.length) {
    return false;
  }

  const matchedTokens = topicTokens.filter((token) =>
    normalizedAnswer.includes(token)
  );

  return matchedTokens.length / topicTokens.length >= 0.6;
}

function conceptMatchesTopic(concept: SemanticConcept, topic: string) {
  return concept.topicPatterns.some((pattern) => pattern.test(topic));
}

function conceptMatchesAnswer(concept: SemanticConcept, answer: string) {
  return concept.answerPatterns.some((pattern) => pattern.test(answer));
}

function inferConceptCategories({
  questionCategory,
  questionText,
  expectedTopics,
  idealAnswerPoints,
}: {
  questionCategory: string;
  questionText: string;
  expectedTopics: string[];
  idealAnswerPoints: string[];
}) {
  const evidence = `${questionCategory} ${questionText} ${expectedTopics.join(" ")} ${idealAnswerPoints.join(" ")}`;
  const categories = new Set<string>([questionCategory]);

  if (/\b(?:query cache|cache key|staleTime|stale-while-revalidate|in-flight|prefetch)\b/i.test(evidence)) {
    categories.add("query cache");
  }

  if (/\b(?:rerender|render optimization|profiler|memo|virtualiz|table|cards)\b/i.test(evidence)) {
    categories.add("react performance");
  }

  if (/\b(?:dashboard|widgets|checkout|ownership|boundaries|system design|scale|micro-?frontend)\b/i.test(evidence)) {
    categories.add("frontend architecture");
    categories.add("system design");
  }

  if (/\b(?:accessibility|WCAG|ARIA|keyboard|focus|screen reader|modal)\b/i.test(evidence)) {
    categories.add("accessibility");
  }

  if (/\b(?:testing|test|React Testing Library|E2E|mock|checkout flow)\b/i.test(evidence)) {
    categories.add("testing");
  }

  if (/\b(?:Next\.js|RSC|server action|route handler|ISR|streaming|middleware|hydration)\b/i.test(evidence)) {
    categories.add("next.js rendering");
  }

  if (/\b(?:debug|bug|root cause|race|stale closure|memory leak|hydration mismatch)\b/i.test(evidence)) {
    categories.add("debugging");
  }

  if (/\b(?:API|REST|fetch|request|retry|backoff|timeout|AbortController|reliability)\b/i.test(evidence)) {
    categories.add("api reliability");
  }

  return categories;
}

function relevantConceptsFor({
  question,
  questionCategory,
  expectedTopics,
  idealAnswerPoints,
}: {
  question: Pick<OASessionQuestion, "title" | "prompt" | "skills" | "constraints">;
  questionCategory: string;
  expectedTopics: string[];
  idealAnswerPoints: string[];
}) {
  const categories = inferConceptCategories({
    questionCategory,
    questionText: `${question.title} ${question.prompt} ${question.skills.join(" ")} ${question.constraints.join(" ")}`,
    expectedTopics,
    idealAnswerPoints,
  });
  const topicEvidence = [...expectedTopics, ...idealAnswerPoints, ...question.skills, ...question.constraints];
  const relevant = SEMANTIC_CONCEPTS.filter(
    (concept) =>
      concept.categories.some((category) => categories.has(category)) ||
      topicEvidence.some((topic) => conceptMatchesTopic(concept, topic))
  );

  return Array.from(new Map(relevant.map((concept) => [concept.id, concept])).values());
}

function conceptCoverage(answer: string, concepts: SemanticConcept[]) {
  const matchedConcepts = concepts.filter((concept) =>
    conceptMatchesAnswer(concept, answer)
  );
  const missingConcepts = concepts.filter(
    (concept) => !matchedConcepts.includes(concept)
  );

  return {
    matchedConcepts: matchedConcepts.map((concept) => concept.id),
    missingConcepts: missingConcepts.map((concept) => concept.id),
    coverage: concepts.length ? matchedConcepts.length / concepts.length : 0,
  };
}

function buildExpectedTopics(question: OASessionQuestion) {
  return uniqueValues([
    ...question.expectedTopics,
    ...question.skills,
    ...question.constraints,
  ]).slice(0, 12);
}

function buildIdealAnswerPoints(question: OASessionQuestion) {
  return uniqueValues([
    ...question.idealAnswerPoints,
    question.expectedAnswer,
    ...question.hints,
  ]).slice(0, 12);
}

function scoreDirectAnswer(expectedAnswer: string | undefined, answer: string) {
  if (!expectedAnswer) {
    return null;
  }

  const normalizedAnswer = normalize(answer);
  const normalizedExpected = normalize(expectedAnswer);

  if (!normalizedAnswer || !normalizedExpected) {
    return null;
  }

  if (normalizedAnswer === normalizedExpected) {
    return 100;
  }

  if (
    normalizedAnswer.includes(normalizedExpected) ||
    normalizedExpected.includes(normalizedAnswer)
  ) {
    return 88;
  }

  const expectedTokens = tokenize(expectedAnswer);
  const matchedTokens = expectedTokens.filter((token) =>
    normalizedAnswer.includes(token)
  );

  return expectedTokens.length
    ? clampScore((matchedTokens.length / expectedTokens.length) * 90)
    : null;
}

function countMatchedSignals(answer: string, signals: string[]) {
  return uniqueValues(signals).filter((signal) => includesTopic(answer, signal));
}

function scoreCategory(
  name: InterviewAnswerScoreCategory,
  score: number,
  reason: string
): InterviewAnswerCategoryScore {
  return {
    name,
    score: clampScore(score),
    maxScore: 100,
    reason,
  };
}

function verdictFor(score: number): InterviewAnswerVerdict {
  if (score >= 90) return "Excellent";
  if (score >= 80) return "Strong";
  if (score >= 65) return "Good";
  if (score >= 45) return "Needs Work";
  return "Poor";
}

function readinessFor(score: number): InterviewReadinessLevel {
  if (score >= 85) return "Strong Interview Readiness";
  if (score >= 70) return "Interview Ready";
  if (score >= 50) return "Developing";
  return "Needs Practice";
}

function idealSummary(points: string[], expectedAnswer?: string) {
  const summaryPoints = uniqueValues([
    ...points,
    expectedAnswer ?? "",
  ]).slice(0, 4);

  if (!summaryPoints.length) {
    return "A strong answer should explain the approach, cover edge cases, and connect the solution to the question requirements.";
  }

  return `A strong answer should cover: ${summaryPoints.join("; ")}.`;
}

function categoryLengthTarget(category: string) {
  if (category === "coding" || category === "sql") return 65;
  if (category === "architecture" || category === "performance") return 75;
  if (category === "debugging") return 45;
  return 35;
}

export function evaluateInterviewAnswer({
  question,
  userAnswer,
  questionCategory,
  difficulty,
  expectedTopics,
  idealAnswerPoints,
  scoreValue,
}: InterviewAnswerEvaluationInput): InterviewAnswerEvaluation {
  const cleanAnswer = userAnswer.trim();
  const words = tokenize(cleanAnswer);
  const relevantConcepts = relevantConceptsFor({
    question,
    questionCategory,
    expectedTopics,
    idealAnswerPoints,
  });
  const conceptResult = conceptCoverage(cleanAnswer, relevantConcepts);
  const matchedTopics = countMatchedSignals(cleanAnswer, expectedTopics);
  const matchedIdealAnswerPoints = countMatchedSignals(
    cleanAnswer,
    idealAnswerPoints
  );
  const missingTopics = expectedTopics.filter(
    (topic) => !matchedTopics.includes(topic)
  );
  const missingIdealPoints = idealAnswerPoints.filter(
    (point) => !matchedIdealAnswerPoints.includes(point)
  );
  const topicCoverage = expectedTopics.length
    ? matchedTopics.length / expectedTopics.length
    : cleanAnswer
      ? 0.45
      : 0;
  const idealCoverage = idealAnswerPoints.length
    ? matchedIdealAnswerPoints.length / idealAnswerPoints.length
    : topicCoverage;
  const conceptBreadthCoverage =
    conceptResult.matchedConcepts.length >= 8 && words.length >= 45
      ? Math.min(0.95, conceptResult.matchedConcepts.length / 10)
      : 0;
  const semanticTopicCoverage = Math.max(
    topicCoverage,
    conceptResult.coverage,
    conceptBreadthCoverage
  );
  const directAnswerScore = scoreDirectAnswer(question.expectedAnswer, cleanAnswer);
  const technicalSignals = countMatchedSignals(cleanAnswer, [
    ...TECHNICAL_SIGNAL_TERMS,
    ...question.skills,
    ...expectedTopics,
    ...conceptResult.matchedConcepts,
  ]);
  const lengthTarget = categoryLengthTarget(questionCategory);
  const lengthRatio = cleanAnswer ? Math.min(1, words.length / lengthTarget) : 0;
  const structureSignals =
    (/[.;:]/.test(cleanAnswer) ? 1 : 0) +
    (/\n|- /.test(cleanAnswer) ? 1 : 0) +
    (/\b(?:because|therefore|first|then|finally|tradeoff|test|edge case)\b/i.test(cleanAnswer)
      ? 1
      : 0);
  const communicationScore = cleanAnswer
    ? clampScore(35 + Math.min(35, words.length) + structureSignals * 10)
    : 0;
  const answerSpecificityScore = clampScore(
    Math.min(35, technicalSignals.length * 4) +
      Math.min(25, conceptResult.matchedConcepts.length * 3) +
      (/\b(?:because|therefore|so that|tradeoff|edge case|failure|test|metric|p95|load)\b/i.test(cleanAnswer)
        ? 20
        : 0) +
      (words.length >= 45 ? 20 : words.length >= 25 ? 12 : 0)
  );
  const completenessScore = clampScore(
    lengthRatio * 45 + semanticTopicCoverage * 30 + idealCoverage * 25
  );
  const accuracyScore = clampScore(
    directAnswerScore ?? semanticTopicCoverage * 52 + idealCoverage * 43
  );
  const technicalDepthScore = clampScore(
    idealCoverage * 35 +
      conceptResult.coverage * 30 +
      Math.min(20, technicalSignals.length * 4) +
      (/\b(?:complexity|o\(|edge|tradeoff|failure|test|monitor|rollback|cache|race)\b/i.test(cleanAnswer)
        ? 15
        : 0)
  );
  const relevanceScore = clampScore(
    semanticTopicCoverage * 68 +
      (includesTopic(cleanAnswer, questionCategory) ? 10 : 0) +
      Math.min(22, conceptResult.matchedConcepts.length * 3)
  );
  const rawScore = clampScore(
    accuracyScore * 0.3 +
      technicalDepthScore * 0.25 +
      relevanceScore * 0.2 +
      completenessScore * 0.15 +
      communicationScore * 0.05 +
      answerSpecificityScore * 0.05
  );
  const score =
    directAnswerScore === 100 ? rawScore : Math.min(rawScore, 94);
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const improvementSuggestions: string[] = [];
  const semanticallyCoveredMissingTopics = missingTopics.filter((topic) =>
    relevantConcepts.some(
      (concept) => conceptMatchesTopic(concept, topic) && conceptMatchesAnswer(concept, cleanAnswer)
    )
  );
  const filteredMissingTopics = missingTopics.filter(
    (topic) => !semanticallyCoveredMissingTopics.includes(topic)
  );
  const semanticallyCoveredMissingIdealPoints = missingIdealPoints.filter((point) =>
    relevantConcepts.some(
      (concept) => conceptMatchesTopic(concept, point) && conceptMatchesAnswer(concept, cleanAnswer)
    )
  );
  const filteredMissingIdealPoints = missingIdealPoints.filter(
    (point) => !semanticallyCoveredMissingIdealPoints.includes(point)
  );
  const missingPoints = uniqueValues([
    ...filteredMissingIdealPoints,
    ...filteredMissingTopics.slice(0, 5),
    ...conceptResult.missingConcepts.slice(0, 4),
  ]).slice(0, 8);

  if (matchedTopics.length) {
    strengths.push(`Covered expected topics: ${matchedTopics.slice(0, 4).join(", ")}.`);
  }

  if (matchedIdealAnswerPoints.length) {
    strengths.push(
      `Included ideal answer signals: ${matchedIdealAnswerPoints.slice(0, 3).join(", ")}.`
    );
  }

  if (conceptResult.matchedConcepts.length) {
    strengths.push(
      `Covered concepts: ${conceptResult.matchedConcepts.slice(0, 4).join(", ")}.`
    );
  }

  if (technicalSignals.length >= 4) {
    strengths.push("Used relevant technical vocabulary and implementation signals.");
  }

  if (!cleanAnswer) {
    weaknesses.push("No answer was submitted.");
    improvementSuggestions.push("Attempt every question, even with a partial approach.");
  }

  if (missingPoints.length) {
    weaknesses.push(`Missed key points: ${missingPoints.slice(0, 3).join(", ")}.`);
    improvementSuggestions.push(
      `Add coverage for ${missingPoints.slice(0, 3).join(", ")}.`
    );
  }

  if (technicalDepthScore < 55 && cleanAnswer) {
    weaknesses.push("Technical depth is thin for the question difficulty.");
    improvementSuggestions.push(
      "Mention implementation details, edge cases, complexity, failure handling, and tests."
    );
  }

  if (communicationScore < 65 && cleanAnswer) {
    weaknesses.push("Answer structure could be clearer.");
    improvementSuggestions.push(
      "Use a concise structure: approach, implementation detail, edge cases, and validation."
    );
  }

  if (completenessScore < 60 && cleanAnswer) {
    improvementSuggestions.push("Make the answer more complete before moving to the next question.");
  }

  const verdict = verdictFor(score);

  return {
    questionId: question.id,
    questionTitle: question.title,
    questionCategory,
    difficulty,
    score,
    accuracyScore,
    technicalDepthScore,
    relevanceScore,
    communicationScore,
    completenessScore,
    pointsEarned: Number(((score / 100) * scoreValue).toFixed(2)),
    maxScore: scoreValue,
    percentage: score,
    categoryBreakdown: [
      scoreCategory(
        "Accuracy",
        accuracyScore,
        directAnswerScore !== null
          ? "Compared against the expected answer and supporting answer signals."
          : "Estimated from topic and ideal-point coverage."
      ),
      scoreCategory(
        "Technical Depth",
        technicalDepthScore,
        "Checked for ideal answer points, technical terminology, edge cases, and implementation depth."
      ),
      scoreCategory(
        "Relevance",
        relevanceScore,
        `Matched ${matchedTopics.length}/${expectedTopics.length} expected topics.`
      ),
      scoreCategory(
        "Communication",
        communicationScore,
        "Checked for readable structure, concise explanation, and signal clarity."
      ),
      scoreCategory(
        "Completeness",
        completenessScore,
        "Checked answer length, topic coverage, and ideal-point coverage."
      ),
    ],
    matchedTopics,
    missingTopics: filteredMissingTopics,
    matchedConcepts: conceptResult.matchedConcepts,
    missingConcepts: conceptResult.missingConcepts,
    matchedIdealAnswerPoints,
    expectedConceptCoverage: clampScore(conceptResult.coverage * 100),
    idealPointCoverage: clampScore(idealCoverage * 100),
    semanticTopicCoverage: clampScore(semanticTopicCoverage * 100),
    answerSpecificityScore,
    strengths: strengths.length ? strengths : ["Some attempt was recorded."],
    weaknesses: weaknesses.length ? weaknesses : ["No major weakness detected."],
    missingPoints,
    improvementSuggestions: improvementSuggestions.length
      ? uniqueValues(improvementSuggestions)
      : ["Keep practicing similar questions to improve speed and consistency."],
    idealAnswerSummary: idealSummary(idealAnswerPoints, question.expectedAnswer),
    scoreReasoning: [
      `Semantic topic coverage: ${clampScore(semanticTopicCoverage * 100)}%.`,
      `Expected concept coverage: ${clampScore(conceptResult.coverage * 100)}%.`,
      `Concept breadth coverage: ${clampScore(conceptBreadthCoverage * 100)}%.`,
      `Ideal point coverage: ${clampScore(idealCoverage * 100)}%.`,
      `Specificity score: ${answerSpecificityScore}%.`,
    ],
    verdict,
    feedback:
      verdict === "Excellent" || verdict === "Strong"
        ? "Strong answer with clear alignment to expected signals."
        : verdict === "Good"
          ? "Good foundation. Add more depth and missing points to make it stronger."
          : verdict === "Needs Work"
            ? "Partial answer. Improve relevance, technical depth, and completeness."
            : "Weak or missing answer. Rebuild it around the expected topics and ideal answer points.",
    recommendations: improvementSuggestions.length
      ? uniqueValues(improvementSuggestions)
      : ["Keep practicing similar questions to improve speed and consistency."],
  };
}

function buildReportCategories(evaluations: InterviewAnswerEvaluation[]) {
  const categories: InterviewAnswerScoreCategory[] = [
    "Accuracy",
    "Technical Depth",
    "Relevance",
    "Communication",
    "Completeness",
  ];

  return categories.map((name) => {
    const scores = evaluations.flatMap((evaluation) =>
      evaluation.categoryBreakdown
        .filter((category) => category.name === name)
        .map((category) => category.score)
    );
    const percentage = scores.length
      ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
      : 0;

    return {
      name,
      score: percentage,
      maxScore: 100,
      percentage,
      summary:
        percentage >= 78
          ? `${name} is a relative strength.`
          : percentage >= 60
            ? `${name} is developing but inconsistent.`
            : `${name} needs focused practice.`,
    };
  });
}

function aggregateTopValues(values: string[], limit: number) {
  const counts = new Map<string, number>();
  values.forEach((value) => {
    const cleaned = value.trim();
    if (!cleaned) return;
    counts.set(cleaned, (counts.get(cleaned) ?? 0) + 1);
  });

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([value]) => value);
}

export function evaluateInterviewSession(
  session: Pick<OASession, "id" | "questions">,
  answers: OAAnswer[]
): InterviewSessionEvaluation {
  const answerMap = new Map(
    answers.map((answer) => [answer.questionId, answer.answer])
  );
  const questionEvaluations = session.questions.map((question) =>
    evaluateInterviewAnswer({
      question,
      userAnswer: answerMap.get(question.id) ?? "",
      questionCategory: question.type,
      difficulty: question.difficulty,
      expectedTopics: buildExpectedTopics(question),
      idealAnswerPoints: buildIdealAnswerPoints(question),
      scoreValue: question.scoreValue,
    })
  );
  const totalWeight = session.questions.reduce(
    (sum, question) => sum + question.scoreValue,
    0
  );
  const weightedScore = totalWeight
    ? Math.round(
        questionEvaluations.reduce(
          (sum, evaluation) => sum + evaluation.score * evaluation.maxScore,
          0
        ) / totalWeight
      )
    : 0;
  const totalScore = Number(
    questionEvaluations
      .reduce((sum, evaluation) => sum + evaluation.pointsEarned, 0)
      .toFixed(2)
  );
  const categoryBreakdown = buildReportCategories(questionEvaluations);
  const strongestAreas = [
    ...categoryBreakdown
      .filter((category) => category.percentage >= 75)
      .sort((a, b) => b.percentage - a.percentage)
      .map((category) => `${category.name}: ${category.percentage}%`),
    ...aggregateTopValues(
      questionEvaluations.flatMap((evaluation) => evaluation.matchedTopics),
      4
    ).map((topic) => `Covered ${topic}`),
  ].slice(0, 6);
  const weakestAreas = [
    ...categoryBreakdown
      .filter((category) => category.percentage < 65)
      .sort((a, b) => a.percentage - b.percentage)
      .map((category) => `${category.name}: ${category.percentage}%`),
    ...aggregateTopValues(
      questionEvaluations.flatMap((evaluation) => evaluation.missingPoints),
      5
    ).map((point) => `Missing ${point}`),
  ].slice(0, 6);
  const recommendedPractice = uniqueValues([
    ...aggregateTopValues(
      questionEvaluations.flatMap((evaluation) => evaluation.missingPoints),
      4
    ).map((point) => `Practice questions involving ${point}.`),
    "For each answer, state the approach, implementation details, edge cases, and validation strategy.",
    "Redo low-scoring questions under a timer and compare against the ideal answer summary.",
  ]).slice(0, 6);
  const readinessLevel = readinessFor(weightedScore);

  return {
    sessionId: session.id,
    generatedAt: new Date().toISOString(),
    overallScore: weightedScore,
    readinessLevel,
    categoryBreakdown,
    strongestAreas: strongestAreas.length
      ? strongestAreas
      : ["Completed the interview attempt flow."],
    weakestAreas: weakestAreas.length
      ? weakestAreas
      : ["No major weak area detected from submitted answers."],
    recommendedPractice,
    questionEvaluations,
    totalScore,
    maxScore: totalWeight,
    summary: `${readinessLevel} with ${weightedScore}/100 overall score across ${session.questions.length} questions.`,
    readinessScore: weightedScore,
    readiness: readinessLevel,
    answerEvaluations: questionEvaluations,
    strengths: strongestAreas.length
      ? strongestAreas
      : ["Completed the interview attempt flow."],
    weaknesses: weakestAreas.length
      ? weakestAreas
      : ["No major weak area detected from submitted answers."],
    recommendations: recommendedPractice,
  };
}

export function evaluateAnswer(
  question: OASessionQuestion,
  answer: string
): OAAnswerEvaluation {
  return evaluateInterviewAnswer({
    question,
    userAnswer: answer,
    questionCategory: question.type,
    difficulty: question.difficulty,
    expectedTopics: buildExpectedTopics(question),
    idealAnswerPoints: buildIdealAnswerPoints(question),
    scoreValue: question.scoreValue,
  });
}

export function generateOAReport(
  session: OASession,
  answers: OAAnswer[]
): OAReport {
  return evaluateInterviewSession(session, answers);
}
