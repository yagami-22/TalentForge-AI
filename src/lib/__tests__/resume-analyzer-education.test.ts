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
Planora AI ↗
Apr 2026 - May 2026
Developed productivity platform with responsive and interactive frontend interfaces.
Implemented AI-powered recommendations, planning workflows, timer module, and workflow automation.
Built data-driven recommendations to support productivity planning.

Smart Complaint Management System ↗
Mar 2026 - Apr 2026
Developed a full-stack complaint system for registration, tracking, and resolution workflows.
Implemented role-based functionality, database integration, and responsive UI.
Prepared SRS, UML, DFD, testing, and documentation artifacts.
`;

  const analysis = analyzeResume(resumeText);
  const education = analysis.categoryScores.find(
    (category) => category.name === "Education Strength"
  );
  const contact = analysis.categoryScores.find(
    (category) => category.name === "Contact & Professional Links"
  );
  const projects = analysis.categoryScores.find(
    (category) => category.name === "Projects / Portfolio Work Quality"
  );

  assert.ok(education, "Education category should exist");
  assert.ok(contact, "Contact category should exist");
  assert.ok(projects, "Projects category should exist");
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
  assert.ok(
    projects.evidenceFound.some((item) => /Planora AI/i.test(item)),
    "Planora AI should be detected as a project title"
  );
  assert.ok(
    projects.evidenceFound.some((item) =>
      /Smart Complaint Management System/i.test(item)
    ),
    "Smart Complaint Management System should be detected as a project title"
  );
  assert.ok(
    projects.evidenceFound.some((item) => /Estimated project count: [2-9]/i.test(item)),
    "Project count should be at least 2"
  );
  assert.ok(
    projects.score >= 11 && projects.score <= 15,
    `Projects score should be calibrated to 11-15, received ${projects.score}`
  );
});

test("detects structurally positioned institution without a college-name database", () => {
  const resumeText = `
Candidate Name
Delhi
candidate@example.com
+91 9876543210

EDUCATION
B.Tech, Computer Science & Engineering 2024 - 2028
Ramsarup College of Engineering

SKILLS
JavaScript, SQL, Git

PROJECTS
Student Portal
Developed a responsive student portal with registration workflows and database integration.
`;

  const analysis = analyzeResume(resumeText);
  const education = analysis.categoryScores.find(
    (category) => category.name === "Education Strength"
  );

  assert.ok(education, "Education category should exist");
  assert.ok(education.score >= 7, "Education score should be at least 7/10");
  assert.ok(
    education.evidenceFound.some((item) =>
      /B\.Tech, Computer Science & Engineering 2024 - 2028/i.test(item)
    ),
    "Degree and timeline should be detected from the combined education line"
  );
  assert.ok(
    education.evidenceFound.some((item) =>
      /Ramsarup College of Engineering/i.test(item)
    ),
    "Institution should be detected structurally from the nearby education line"
  );
  assert.ok(
    !education.missingEvidence.includes("Institution missing"),
    "Institution should not be marked missing"
  );
});

test("detects original combined degree timeline education format", () => {
  const resumeText = `
Candidate Name
Delhi
candidate@example.com
+91 9876543210

EDUCATION
B.Tech, Computer Science & Engineering 2024 - 2028
Punjab Engineering College(Deemed To Be University)

SKILLS
C++ Programming, SQL, Git

PROJECTS
Planora AI ↗
Apr 2026 - May 2026
Developed productivity platform with responsive frontend interfaces and AI-powered recommendations.
Implemented planning workflows, timer module, and workflow automation.

Smart Complaint Management System ↗
Mar 2026 - Apr 2026
Developed a full-stack complaint system for registration, tracking, and resolution workflows.
Implemented role-based functionality, database integration, responsive UI, SRS, UML, DFD, testing, and documentation.
`;

  const analysis = analyzeResume(resumeText);
  const education = analysis.categoryScores.find(
    (category) => category.name === "Education Strength"
  );
  const projects = analysis.categoryScores.find(
    (category) => category.name === "Projects / Portfolio Work Quality"
  );

  assert.ok(education, "Education category should exist");
  assert.ok(projects, "Projects category should exist");
  assert.ok(education.score >= 7, "Education score should be at least 7/10");
  assert.ok(
    education.evidenceFound.some((item) => /B\.Tech/i.test(item)),
    "Degree should be detected"
  );
  assert.ok(
    education.evidenceFound.some((item) => /Punjab Engineering College/i.test(item)),
    "Institution should be detected"
  );
  assert.ok(
    education.evidenceFound.some((item) => /2024 - 2028/i.test(item)),
    "Timeline should be detected"
  );
  assert.ok(
    projects.evidenceFound.some((item) => /Estimated project count: [2-9]/i.test(item)),
    "Project count should be at least 2"
  );
  assert.ok(
    projects.score >= 11 && projects.score <= 15,
    `Projects score should be calibrated to 11-15, received ${projects.score}`
  );
});

test("detects inline pipe-separated education format with CGPA", () => {
  const resumeText = `
Candidate Name
Delhi
candidate@example.com
+91 9876543210

EDUCATION
Bachelor of Technology (B.Tech) in Computer Science | Punjab Engineering College | 2020 - 2024 | CGPA: 8.9/10

SKILLS
React, Next.js, TypeScript, REST APIs

PROJECTS
Frontend Platform
Developed reusable UI components with responsive design and REST API integration.
`;

  const analysis = analyzeResume(resumeText);
  const education = analysis.categoryScores.find(
    (category) => category.name === "Education Strength"
  );

  assert.ok(education, "Education category should exist");
  assert.ok(education.score >= 8, "Education score should be at least 8/10");
  assert.ok(
    education.evidenceFound.some((item) => /Bachelor of Technology/i.test(item)),
    "Degree should be detected from inline segment"
  );
  assert.ok(
    education.evidenceFound.some((item) => /Punjab Engineering College/i.test(item)),
    "Institution should be detected from inline segment"
  );
  assert.ok(
    education.evidenceFound.some((item) => /2020 - 2024/i.test(item)),
    "Timeline should be detected from inline segment"
  );
  assert.ok(
    education.evidenceFound.some((item) => /8\.9\/10/i.test(item)),
    "CGPA should be detected from inline segment"
  );
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
    "Timeline should not be marked missing"
  );
  assert.ok(
    !education.missingEvidence.includes("CGPA, percentage, or academic performance missing"),
    "CGPA should not be marked missing"
  );
});
