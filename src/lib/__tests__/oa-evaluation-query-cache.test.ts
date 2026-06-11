import assert from "node:assert/strict";
import test from "node:test";

import { evaluateInterviewAnswer } from "../oa-evaluation";

const queryCacheQuestion = {
  id: "query-cache-fixture",
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

const expectedTopics = [
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

const idealAnswerPoints = [
  "Normalize cache keys",
  "Notify subscribers after updates",
  "Return stale data while refetching",
  "Deduplicate in-flight requests",
  "Expose explicit invalidation",
];

function evaluate(userAnswer: string) {
  return evaluateInterviewAnswer({
    question: queryCacheQuestion,
    userAnswer,
    questionCategory: "coding",
    difficulty: "Hard",
    expectedTopics,
    idealAnswerPoints,
    scoreValue: 15,
  });
}

test("scores strong senior query-cache answer as excellent", () => {
  const result = evaluate(`
    I would model this as a small query store keyed by stable normalized query keys
    such as ['orders', tenantId, filters]. Each cache entry stores data, error,
    status, updatedAt/staleTime metadata, the current in-flight promise, and a set
    of subscribers/listeners. React screens would consume it through a useQuery hook
    backed by useSyncExternalStore so listeners are notified after writes,
    invalidation, and background refreshes.

    Reads can return the stale value immediately while a stale-while-revalidate
    fetcher refreshes API responses in the background. Prefetch warms entries
    before navigation. Multiple components requesting the same key share the
    in-flight request to avoid duplicate requests. Invalidation marks matching keys
    stale and triggers subscribers.

    For failures I would preserve the last good value, expose error state, and use
    retries with backoff plus AbortController cancellation for unmounted consumers.
    I would guard race conditions with request ids/version checks, clean up
    subscriptions on unmount, and add observability for cache hits/misses, request
    deduplication rate, errors, and load testing under concurrent screens.
  `);

  assert.ok(
    result.score >= 88 && result.score <= 95,
    `expected strong answer to score 88-95, got ${result.score}`
  );
  assert.ok(!result.missingPoints.includes("Notify subscribers after updates"));
  assert.ok(!result.missingPoints.includes("Frontend Architecture"));
  assert.ok(!result.missingPoints.includes("REST APIs"));
  assert.ok(!result.missingPoints.includes("Performance Optimization"));
  assert.ok(!result.missingPoints.includes("render isolation"));
  assert.ok(!result.missingPoints.includes("virtualization/windowing"));
});

test("scores average query-cache answer in the average band", () => {
  const result = evaluate(`
    I would store API results in a map using a cache key and a stale time.
    Components can read from the cache and refetch when data is stale.
    I would add invalidate and prefetch functions and handle errors by showing
    an error state instead of crashing.
  `);

  assert.ok(
    result.score >= 60 && result.score <= 75,
    `expected average answer to score 60-75, got ${result.score}`
  );
});

test("scores poor query-cache answer below 40", () => {
  const result = evaluate("Use a map and fetch data again when needed.");

  assert.ok(
    result.score < 40,
    `expected poor answer below 40, got ${result.score}`
  );
});
