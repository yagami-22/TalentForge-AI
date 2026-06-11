# TalentForge OA Question Bank

This folder contains the TalentForge OA question-bank architecture:

- typed question schema
- 300 original seed OA questions
- skill extraction from resume text and job descriptions
- smart selector engine
- validation and smoke-test helpers

It intentionally does not include OA session UI, AI evaluation, reports, career coach integration, recruiter mode, or voice interviews.

## Structure

```text
src/data/question-bank/
  index.ts
  types.ts
  skills.ts
  select-questions.ts
  test-helpers.ts
  seed/
    oa-questions.ts
```

## Add A New Question

Add a new `q({...})` entry in `seed/oa-questions.ts`.

Required fields:

- `id`
- `type`
- `difficulty`
- `title`
- `prompt`
- `skills`

Recommended fields:

- `roleTags`
- `companyStyleTags`
- `seniorityTags`
- `expectedAnswer`
- `expectedTopics`
- `idealAnswerPoints`
- `examples`
- `testCases`
- `edgeCases`
- `expectedComplexity`
- `constraints`
- `hints`

Keep IDs stable and unique. Use prefixes such as:

- `oa-coding-`
- `oa-fe-coding-`
- `oa-fe-debug-`
- `oa-fe-arch-`
- `oa-fe-perf-`
- `oa-fe-a11y-`
- `oa-fe-test-`

Senior frontend questions should feel like realistic implementation,
debugging, architecture, performance, accessibility, or testing assessments.
Avoid generic discussion prompts unless they are framed as concrete production
engineering scenarios with constraints and expected answer points.

## Selector Usage

```ts
import { selectQuestions } from "@/data/question-bank";

const result = selectQuestions({
  count: 10,
  resumeText,
  jobDescription,
  targetRole: "Frontend Engineer Intern",
  companyStyleTags: ["startup", "product", "campus"],
  seniority: "student",
});
```

The selector returns:

- selected questions
- detected resume/JD skills
- difficulty distribution diagnostics
- type distribution diagnostics
- company-style tags used
- selection reasons per question

## Local Validation

The helper functions are exported from `index.ts`:

```ts
import { runQuestionBankSmokeTest, validateQuestionBank } from "@/data/question-bank";
```

`validateQuestionBank()` checks:

- at least 300 seed questions
- duplicate IDs
- missing required fields
- type distribution
- difficulty distribution

`runQuestionBankSmokeTest()` validates the bank and runs a sample frontend-intern selection.
