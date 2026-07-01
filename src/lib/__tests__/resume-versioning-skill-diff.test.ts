import assert from "node:assert/strict";
import test from "node:test";

import {
  diffResumeVersionSkills,
  extractCanonicalResumeSkills,
} from "../resume-versioning-client";

const originalResume = `
Technical Skills
- React
- Next.js
- TypeScript
- JavaScript
- REST API
- CI/CD

Projects
- Built frontend development workflows with React and Next.js.
- Integrated REST APIs from backend development services.
`;

test("canonical skill extraction normalizes aliases with confidence", () => {
  const skills = extractCanonicalResumeSkills(`
    Skills: React, Next.js, TS, JS, REST APIs, GitHub Actions.
    Projects: frontend development with API integration.
  `);
  const skillNames = skills.map((skill) => skill.skill);

  assert.ok(skillNames.includes("React"));
  assert.ok(skillNames.includes("Next.js"));
  assert.ok(skillNames.includes("TypeScript"));
  assert.ok(skillNames.includes("JavaScript"));
  assert.ok(skillNames.includes("REST API"));
  assert.ok(skillNames.includes("CI/CD"));
  assert.ok(skills.every((skill) => skill.confidence >= 70));
});

test("semantic diff does not remove retained skills that appear through aliases", () => {
  const rewrittenResume = `
  Professional Summary
  Frontend engineer building React and Next.js interfaces with TypeScript.

  Technical Skills
  - React
  - Next.js
  - TS
  - JS
  - REST APIs
  - GitHub Actions

  Projects
  - Delivered frontend development and backend development integrations.
  `;
  const diff = diffResumeVersionSkills(originalResume, rewrittenResume);
  const removed = diff.removedSkills.map((skill) => skill.skill);

  assert.deepEqual(
    removed.filter((skill) =>
      ["React", "Next.js", "TypeScript", "JavaScript", "REST API", "CI/CD"].includes(skill)
    ),
    []
  );
});

test("semantic diff only marks skills removed when actually absent", () => {
  const reducedResume = `
  Technical Skills
  - React
  - TypeScript

  Projects
  - Built frontend development workflows.
  `;
  const diff = diffResumeVersionSkills(originalResume, reducedResume);
  const removed = diff.removedSkills.map((skill) => skill.skill);

  assert.ok(removed.includes("Next.js"));
  assert.ok(removed.includes("JavaScript"));
  assert.ok(removed.includes("REST API"));
  assert.ok(removed.includes("CI/CD"));
  assert.ok(!removed.includes("React"));
  assert.ok(!removed.includes("TypeScript"));
});
