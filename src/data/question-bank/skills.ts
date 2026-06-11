import type { SkillSignal } from "./types";

type SkillDefinition = {
  skill: string;
  terms: string[];
};

export const OA_SKILL_DEFINITIONS: SkillDefinition[] = [
  { skill: "DSA", terms: ["dsa", "data structures", "algorithms"] },
  { skill: "Arrays", terms: ["array", "arrays", "prefix sum", "two pointer"] },
  { skill: "Strings", terms: ["string", "strings", "substring", "palindrome"] },
  { skill: "Hash Maps", terms: ["hash map", "hashmap", "map", "dictionary"] },
  { skill: "Linked Lists", terms: ["linked list", "linkedlist"] },
  { skill: "Stacks", terms: ["stack", "stacks"] },
  { skill: "Queues", terms: ["queue", "queues"] },
  { skill: "Trees", terms: ["tree", "binary tree", "bst"] },
  { skill: "Graphs", terms: ["graph", "graphs", "bfs", "dfs"] },
  { skill: "Dynamic Programming", terms: ["dynamic programming", "dp"] },
  { skill: "Greedy", terms: ["greedy"] },
  { skill: "SQL", terms: ["sql", "mysql", "postgresql", "database query"] },
  { skill: "Databases", terms: ["database", "dbms", "mysql", "postgresql", "mongodb"] },
  { skill: "JavaScript", terms: ["javascript", "js", "ecmascript"] },
  { skill: "TypeScript", terms: ["typescript", "ts"] },
  { skill: "React", terms: ["react", "react.js", "reactjs"] },
  { skill: "Next.js", terms: ["next.js", "nextjs", "next js"] },
  { skill: "REST APIs", terms: ["rest api", "rest apis", "api integration", "apis"] },
  { skill: "Node.js", terms: ["node.js", "nodejs", "node js", "express"] },
  { skill: "Frontend Development", terms: ["frontend", "front-end", "ui", "responsive"] },
  { skill: "Backend Development", terms: ["backend", "back-end", "server side"] },
  { skill: "Testing", terms: ["testing", "unit test", "test automation", "qa"] },
  { skill: "CI/CD", terms: ["ci/cd", "cicd", "deployment pipeline"] },
  { skill: "Git", terms: ["git", "github", "version control"] },
  { skill: "Machine Learning", terms: ["machine learning", "ml", "ai", "model"] },
  { skill: "Aptitude", terms: ["aptitude", "logical reasoning", "quantitative"] },
  { skill: "OOP", terms: ["oop", "object oriented", "object-oriented"] },
  { skill: "System Design Basics", terms: ["scalability", "architecture", "system design"] },
  { skill: "Data Analysis", terms: ["data analysis", "analytics", "dashboard", "statistics"] },
  { skill: "Frontend Architecture", terms: ["frontend architecture", "component architecture", "design system", "micro frontend", "micro-frontend"] },
  { skill: "Performance Optimization", terms: ["performance", "web vitals", "tti", "lcp", "bundle optimization", "render optimization", "virtualization"] },
  { skill: "Accessibility", terms: ["accessibility", "a11y", "wcag", "aria", "screen reader", "keyboard navigation"] },
  { skill: "React Testing Library", terms: ["react testing library", "rtl", "component testing"] },
  { skill: "Jest", terms: ["jest", "unit testing"] },
  { skill: "E2E Testing", terms: ["e2e", "playwright", "cypress", "end to end"] },
  { skill: "Next.js Caching", terms: ["next.js cache", "server component", "client component", "hydration", "revalidation"] },
];

function normalizeForSearch(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w+#./ -]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function findMatchedTerms(text: string, terms: string[]) {
  const normalized = normalizeForSearch(text);

  return terms.filter((term) => {
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`(^|\\W)${escaped}(\\W|$)`, "i").test(normalized);
  });
}

export function extractSkillSignals({
  resumeText = "",
  jobDescription = "",
}: {
  resumeText?: string;
  jobDescription?: string;
}): SkillSignal[] {
  return OA_SKILL_DEFINITIONS.flatMap((definition) => {
    const resumeMatches = findMatchedTerms(resumeText, definition.terms);
    const jdMatches = findMatchedTerms(jobDescription, definition.terms);
    const signals: SkillSignal[] = [];

    if (resumeMatches.length) {
      signals.push({
        skill: definition.skill,
        source: "resume",
        matchedTerms: resumeMatches,
      });
    }

    if (jdMatches.length) {
      signals.push({
        skill: definition.skill,
        source: "jd",
        matchedTerms: jdMatches,
      });
    }

    return signals;
  });
}

export function uniqueDetectedSkills(signals: SkillSignal[]) {
  return Array.from(new Set(signals.map((signal) => signal.skill)));
}
