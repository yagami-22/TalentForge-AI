import assert from "node:assert/strict";
import test from "node:test";

import {
  oaEvaluationDebugSamples,
  runOAEvaluationDebugSamples,
} from "../oa-evaluation-debug";
import { evaluateInterviewAnswer } from "../oa-evaluation";

function getResult(name: string) {
  const result = runOAEvaluationDebugSamples().find(
    (sample) => sample.name === name
  );

  assert.ok(result, `missing debug sample result for ${name}`);
  return result;
}

test("debug helper prints score, metrics, matched concepts, missing concepts, and verdict", () => {
  const result = getResult("Strong query-cache answer");

  assert.equal(typeof result.overallScore, "number");
  assert.equal(typeof result.metricScores.accuracy, "number");
  assert.ok(Array.isArray(result.matchedConcepts));
  assert.ok(Array.isArray(result.missingConcepts));
  assert.ok(["Poor", "Needs Work", "Good", "Strong", "Excellent"].includes(result.verdict));
});

test("scores query-cache fixtures with senior-aware calibration", () => {
  const strong = getResult("Strong query-cache answer");
  const average = getResult("Average query-cache answer");
  const poor = getResult("Poor query-cache answer");

  assert.ok(
    strong.overallScore >= 88 && strong.overallScore <= 95,
    `expected strong answer 88-95, got ${strong.overallScore}`
  );
  assert.ok(
    average.overallScore >= 60 && average.overallScore <= 75,
    `expected average answer 60-75, got ${average.overallScore}`
  );
  assert.ok(
    poor.overallScore < 40,
    `expected poor answer below 40, got ${poor.overallScore}`
  );
});

test("recognizes senior table rerender optimization concepts", () => {
  const result = getResult("Table rerender optimization");

  assert.ok(result.overallScore >= 80, `expected 80+, got ${result.overallScore}`);
  assert.ok(result.matchedConcepts.includes("render isolation"));
  assert.ok(result.matchedConcepts.includes("virtualization/windowing"));
  assert.ok(result.matchedConcepts.includes("profiling/measurement"));
});

test("recognizes infinite-scroll testing concepts", () => {
  const result = getResult("Infinite-scroll testing plan");

  assert.ok(result.overallScore >= 78, `expected 78+, got ${result.overallScore}`);
  assert.ok(result.matchedConcepts.includes("user-behavior testing"));
  assert.ok(result.matchedConcepts.includes("mocking strategy"));
  assert.ok(result.matchedConcepts.includes("e2e critical path"));
});

test("recognizes checkout frontend architecture concepts", () => {
  const result = getResult("Checkout frontend architecture");

  assert.ok(result.overallScore >= 80, `expected 80+, got ${result.overallScore}`);
  assert.ok(result.matchedConcepts.includes("ownership boundaries"));
  assert.ok(result.matchedConcepts.includes("failure modes"));
  assert.ok(result.matchedConcepts.includes("keyboard/focus accessibility"));
  assert.ok(result.matchedConcepts.includes("user-behavior testing"));
});

test("recognizes 100-widget dashboard architecture concepts", () => {
  const result = getResult("100-widget dashboard architecture");

  assert.ok(result.overallScore >= 80, `expected 80+, got ${result.overallScore}`);
  assert.ok(result.matchedConcepts.includes("scale constraints"));
  assert.ok(result.matchedConcepts.includes("ownership boundaries"));
  assert.ok(result.matchedConcepts.includes("virtualization/windowing"));
  assert.ok(result.matchedConcepts.includes("observability"));
});

test("keeps broad skill tags out of missing points when semantically covered", () => {
  const sample = oaEvaluationDebugSamples.find(
    (item) => item.name === "Strong query-cache answer"
  );

  assert.ok(sample, "missing strong query-cache sample");

  const result = evaluateInterviewAnswer({
    question: sample.question,
    userAnswer: sample.userAnswer,
    questionCategory: sample.questionCategory,
    difficulty: sample.difficulty,
    expectedTopics: sample.expectedTopics,
    idealAnswerPoints: sample.idealAnswerPoints,
    scoreValue: sample.scoreValue,
  });

  assert.ok(!result.missingPoints.includes("Frontend Architecture"));
  assert.ok(!result.missingPoints.includes("REST APIs"));
  assert.ok(!result.missingPoints.includes("Performance Optimization"));
});
