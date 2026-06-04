import assert from "node:assert/strict";
import test from "node:test";

import { analyzeResume } from "../resume-analyzer";

test("detects Indian student education, location, and portfolio header signals", () => {
  const resumeText = `
Shitansh Pratap Singh
Delhi
shitansh@example.com
+91 9876543210
GitHub link
LeetCode

Education
B.Tech, Computer Science & Engineering
Punjab Engineering College (Deemed To Be University)
2024 - 2028

Skills
C++ Programming, DSA, OOP, MySQL, GitHub, Git, Machine Learning, SQL, NoSQL

Projects
Planora AI
Developed responsive and interactive frontend interfaces using modern web technologies to enhance user engagement and usability.
Smart Complaint Management System
Designed project workflows and database-backed complaint tracking features.
`;

  const analysis = analyzeResume(resumeText);
  const education = analysis.categoryScores.find(
    (category) => category.name === "Education Strength"
  );
  const contact = analysis.categoryScores.find(
    (category) => category.name === "Contact & Professional Links"
  );

  assert.ok(education, "Education category should exist");
  assert.ok(contact, "Contact category should exist");
  assert.ok(education.score >= 7, "Education score should be at least 7/10");
  assert.ok(
    !education.missingEvidence.includes("Degree or program missing"),
    "Degree should not be marked missing"
  );
  assert.ok(
    !education.missingEvidence.includes("Institution missing"),
    "Institution should not be marked missing"
  );
  assert.ok(
    !education.missingEvidence.includes("Graduation timeline missing"),
    "Graduation timeline should not be marked missing"
  );
  assert.ok(
    !contact.missingEvidence.includes("Location missing from header"),
    "Delhi should be detected as a header location"
  );
  assert.ok(
    contact.evidenceFound.some((item) =>
      /professional profile label found/i.test(item)
    ),
    "GitHub or LeetCode labels should be detected as portfolio/profile evidence"
  );
});
