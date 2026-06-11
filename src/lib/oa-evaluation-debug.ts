import {
  evaluateInterviewAnswer,
  type InterviewAnswerEvaluation,
} from "./oa-evaluation";
import type { OASessionQuestion } from "./oa-session";

type DebugQuestion = Pick<
  OASessionQuestion,
  | "id"
  | "title"
  | "prompt"
  | "skills"
  | "expectedAnswer"
  | "constraints"
  | "hints"
>;

export type OAEvaluationDebugSample = {
  name: string;
  question: DebugQuestion;
  userAnswer: string;
  questionCategory: string;
  difficulty: string;
  expectedTopics: string[];
  idealAnswerPoints: string[];
  scoreValue: number;
};

export type OAEvaluationDebugResult = {
  name: string;
  overallScore: number;
  metricScores: {
    accuracy: number;
    technicalDepth: number;
    relevance: number;
    communication: number;
    completeness: number;
    specificity: number;
  };
  matchedConcepts: string[];
  missingConcepts: string[];
  verdict: InterviewAnswerEvaluation["verdict"];
};

const queryCacheQuestion: DebugQuestion = {
  id: "debug-query-cache",
  title: "Implement Query Cache With Stale While Revalidate",
  prompt:
    "Implement a query cache for React screens with get, subscribe, invalidate, prefetch, staleTime, and background revalidation.",
  skills: [
    "React",
    "Frontend Architecture",
    "REST APIs",
    "Performance Optimization",
  ],
  expectedAnswer: "",
  constraints: [
    "Multiple components may subscribe to the same key",
    "Failed refresh should not erase usable stale data",
  ],
  hints: [],
};

const queryCacheTopics = [
  "cache key",
  "stale time",
  "subscription",
  "invalidation",
  "background revalidation",
  "React",
  "Frontend Architecture",
  "REST APIs",
  "Performance Optimization",
];

const queryCacheIdealPoints = [
  "Normalize cache keys",
  "Notify subscribers after updates",
  "Return stale data while refetching",
  "Deduplicate in-flight requests",
  "Expose explicit invalidation",
];

export const oaEvaluationDebugSamples: OAEvaluationDebugSample[] = [
  {
    name: "Strong query-cache answer",
    question: queryCacheQuestion,
    userAnswer: `
      I would model this as a small query store keyed by stable normalized query
      keys. Each cache entry stores data, error, status, staleTime metadata, the
      current in-flight promise, and subscribers/listeners. React screens use a
      useQuery hook backed by useSyncExternalStore so subscribers are notified
      after writes, invalidation, and background refreshes.

      Reads can return stale data immediately while a stale-while-revalidate
      fetcher refreshes API responses in the background. Prefetch warms entries
      before navigation, and multiple components share the same in-flight
      request to avoid duplicate requests.

      For failures I preserve the last good value, expose error state, retry
      with backoff, and cancel with AbortController on unmount. I would guard
      race conditions with request ids, clean up subscriptions, and track cache
      hits/misses, request dedupe rate, errors, and load-test behavior.
    `,
    questionCategory: "coding",
    difficulty: "Hard",
    expectedTopics: queryCacheTopics,
    idealAnswerPoints: queryCacheIdealPoints,
    scoreValue: 15,
  },
  {
    name: "Average query-cache answer",
    question: queryCacheQuestion,
    userAnswer:
      "I would store API results in a map by cache key, add a stale time, refetch stale data, and expose invalidate and prefetch functions. Errors should show an error state.",
    questionCategory: "coding",
    difficulty: "Hard",
    expectedTopics: queryCacheTopics,
    idealAnswerPoints: queryCacheIdealPoints,
    scoreValue: 15,
  },
  {
    name: "Poor query-cache answer",
    question: queryCacheQuestion,
    userAnswer: "Use a map and fetch again when needed.",
    questionCategory: "coding",
    difficulty: "Hard",
    expectedTopics: queryCacheTopics,
    idealAnswerPoints: queryCacheIdealPoints,
    scoreValue: 15,
  },
  {
    name: "Table rerender optimization",
    question: {
      id: "debug-table-rerender",
      title: "Optimize a Slow Data Table",
      prompt:
        "A React table with 5,000 rows rerenders on every filter and cell edit. Explain how you would diagnose and optimize it.",
      skills: ["React", "Performance Optimization", "Frontend Architecture"],
      expectedAnswer: "",
      constraints: ["Large table", "Keep interactions responsive"],
      hints: [],
    },
    userAnswer:
      "I would start with React Profiler and web-vitals-style measurements to identify hot rows and expensive cells. Then I would isolate state by row or cell, use selectors so unrelated rows do not rerender, memoize stable columns and callbacks, and virtualize the visible range with overscan. I would measure before and after, test filter/edit paths, and watch memory and p95 interaction latency.",
    questionCategory: "performance",
    difficulty: "Hard",
    expectedTopics: [
      "React Profiler",
      "rerender optimization",
      "memoization",
      "virtualization",
      "measurement",
      "large table",
    ],
    idealAnswerPoints: [
      "Measure render cost before optimizing",
      "Isolate row and cell rerenders",
      "Virtualize long lists",
      "Validate latency improvements",
    ],
    scoreValue: 15,
  },
  {
    name: "Infinite-scroll testing plan",
    question: {
      id: "debug-infinite-scroll-testing",
      title: "Test Infinite Scrolling",
      prompt:
        "Design a testing plan for an infinite-scroll feed with loading states, pagination, network errors, and duplicate prevention.",
      skills: ["Testing", "React", "REST APIs"],
      expectedAnswer: "",
      constraints: ["Avoid flaky tests", "Cover edge and failure cases"],
      hints: [],
    },
    userAnswer:
      "I would write React Testing Library tests around user behavior using an IntersectionObserver mock and MSW for paginated API responses. I would cover first load, loading skeletons, next page append, duplicate request prevention, empty state, retry after API failure, and cleanup on unmount. I would add a small Playwright E2E critical path for scrolling, network failure, recovery, and no duplicated items.",
    questionCategory: "testing",
    difficulty: "Medium",
    expectedTopics: [
      "React Testing Library",
      "mocking APIs",
      "loading state",
      "error state",
      "duplicate requests",
      "E2E critical path",
    ],
    idealAnswerPoints: [
      "Test user-visible behavior",
      "Mock network boundaries",
      "Cover loading, empty, error, and retry states",
      "Prevent flaky scroll tests",
    ],
    scoreValue: 12,
  },
  {
    name: "Checkout frontend architecture",
    question: {
      id: "debug-checkout-architecture",
      title: "Architect Checkout Frontend",
      prompt:
        "Design a checkout frontend used by multiple teams. Include state boundaries, API failure handling, performance, accessibility, and testing.",
      skills: ["Frontend Architecture", "REST APIs", "Accessibility", "Testing"],
      expectedAnswer: "",
      constraints: ["Payment flow must be resilient", "Multiple teams ship safely"],
      hints: [],
    },
    userAnswer:
      "I would split checkout into domain modules for cart, shipping, payment, promos, and review with clear contracts and ownership. Server state stays behind typed fetchers/query hooks with retries, timeouts, idempotency keys, and fallback states for partial API failures. Local form state is isolated per step, accessible errors use labels and focus management, and performance is protected with code splitting and metrics. I would test the critical path with RTL and Playwright, including declined payment, retry, and recovery.",
    questionCategory: "architecture",
    difficulty: "Hard",
    expectedTopics: [
      "Frontend Architecture",
      "ownership boundaries",
      "REST APIs",
      "failure handling",
      "accessibility",
      "testing",
      "performance",
    ],
    idealAnswerPoints: [
      "Define domain boundaries and contracts",
      "Handle API failures and recovery",
      "Protect accessibility in forms",
      "Test critical checkout paths",
    ],
    scoreValue: 15,
  },
  {
    name: "100-widget dashboard architecture",
    question: {
      id: "debug-widget-dashboard",
      title: "Architect 100-Widget Analytics Dashboard",
      prompt:
        "Design a dashboard with 100 configurable widgets, live data, team ownership, p95 latency targets, and partial outage handling.",
      skills: [
        "Frontend Architecture",
        "Performance Optimization",
        "REST APIs",
        "System Design",
      ],
      expectedAnswer: "",
      constraints: ["100 widgets", "p95 interaction latency under 200ms"],
      hints: [],
    },
    userAnswer:
      "I would model widgets as plugin-like modules with explicit contracts, ownership boundaries, and versioned data schemas. The shell manages layout, permissions, lazy loading, virtualization for offscreen widgets, and shared query caching with request dedupe. Each widget has loading, error, stale, and degraded states so partial outages do not break the dashboard. I would track p95 interaction latency, cache hit rate, bundle size, and widget error rates, then load test live updates and define rollback paths.",
    questionCategory: "architecture",
    difficulty: "Hard",
    expectedTopics: [
      "scale constraints",
      "ownership boundaries",
      "performance optimization",
      "failure modes",
      "query cache",
      "observability",
      "tradeoffs",
    ],
    idealAnswerPoints: [
      "Use modular widget ownership",
      "Protect performance at 100-widget scale",
      "Handle partial failures gracefully",
      "Measure and monitor latency and failures",
    ],
    scoreValue: 15,
  },
];

export function runOAEvaluationDebugSamples(): OAEvaluationDebugResult[] {
  return oaEvaluationDebugSamples.map((sample) => {
    const evaluation = evaluateInterviewAnswer({
      question: sample.question,
      userAnswer: sample.userAnswer,
      questionCategory: sample.questionCategory,
      difficulty: sample.difficulty,
      expectedTopics: sample.expectedTopics,
      idealAnswerPoints: sample.idealAnswerPoints,
      scoreValue: sample.scoreValue,
    });

    return {
      name: sample.name,
      overallScore: evaluation.score,
      metricScores: {
        accuracy: evaluation.accuracyScore,
        technicalDepth: evaluation.technicalDepthScore,
        relevance: evaluation.relevanceScore,
        communication: evaluation.communicationScore,
        completeness: evaluation.completenessScore,
        specificity: evaluation.answerSpecificityScore,
      },
      matchedConcepts: evaluation.matchedConcepts,
      missingConcepts: evaluation.missingConcepts,
      verdict: evaluation.verdict,
    };
  });
}

export function formatOAEvaluationDebugSamples() {
  return runOAEvaluationDebugSamples()
    .map(
      (result) =>
        [
          `${result.name}: ${result.overallScore}/100 (${result.verdict})`,
          `  metrics: ${JSON.stringify(result.metricScores)}`,
          `  matched: ${result.matchedConcepts.join(", ") || "none"}`,
          `  missing: ${result.missingConcepts.join(", ") || "none"}`,
        ].join("\n")
    )
    .join("\n\n");
}
