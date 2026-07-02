# TalentForge AI Architecture

TalentForge AI is a Next.js career intelligence platform built around protected dashboard modules and evidence-based analysis workflows.

## System Overview

```text
User
  -> Clerk authentication
  -> Next.js App Router
  -> Dashboard modules
  -> Domain analysis layer
  -> Prisma
  -> Neon PostgreSQL

GitHub Analyzer
  -> Client form
  -> /api/github/fetch
  -> Server-side GitHub API client
  -> Public GitHub API
```

## Frontend

The frontend uses the Next.js App Router under `src/app`.

- Public landing page: `src/app/page.tsx`
- Authentication pages: `src/app/sign-in`, `src/app/sign-up`
- Authenticated dashboard shell: `src/app/dashboard`
- Module routes:
  - `src/app/dashboard/resume`
  - `src/app/dashboard/github`
  - `src/app/dashboard/recruiter`
  - `src/app/dashboard/interview`
  - `src/app/dashboard/coach`
  - `src/app/dashboard/analytics`
  - `src/app/dashboard/settings`

Shared UI primitives live in `src/components/ui`. Dashboard-specific reusable components live in `src/components/dashboard`.

## Authentication

Clerk manages user identity, sessions, sign-in, sign-up, redirects, and signed-in user UI.

Dashboard routes depend on authenticated users. Onboarding assigns the user role before entering the main dashboard experience.

## Database

Prisma is the application database layer. Neon PostgreSQL stores persistent user and resume data.

Important files:

- `prisma/schema.prisma`
- `src/lib/prisma.ts`
- `src/lib/current-user.ts`

## AI Analysis Layer

Core product intelligence lives in `src/lib`. The app keeps analysis logic separate from route components so UI modules can reuse the same evidence-driven scoring primitives.

Examples:

- Resume analysis
- ATS scoring
- JD match analysis
- Resume rewriting
- Resume versioning
- Recruiter mode scoring
- Interview and OA evaluation
- Career Coach readiness
- GitHub repository scoring

## Resume Parsing

Resume uploads accept text-based PDFs. The app validates file type, size, extracted text quality, and resume-like evidence before analysis.

Important areas:

- Upload actions in `src/app/dashboard/resume/actions.ts`
- PDF extraction in `src/lib/pdf-text.ts`
- Resume validation in `src/lib/resume-validation.ts`

## GitHub API Integration

The GitHub Analyzer fetches public profile and repository data through a server-side proxy.

Important files:

- `src/app/api/github/fetch/route.ts`
- `src/lib/github-api.ts`
- `src/app/dashboard/github/github-analyzer-client.tsx`

`GITHUB_TOKEN` is optional and used only on the server. The client never receives the token.

## Recruiter Intelligence

AI Recruiter Mode evaluates candidates against a job description with evidence-based scoring. It considers resume evidence, skills, project quality, seniority alignment, portfolio/GitHub signals, risks, strengths, and hiring recommendations.

Important files:

- `src/app/dashboard/recruiter`
- `src/lib/recruiter-mode.ts`

## Dashboard Modules

Each dashboard module owns its route-level UI and uses shared components/tokens for consistency:

- Resume Intelligence
- ATS Optimizer
- JD Match
- Resume Rewriter
- Resume Version History
- GitHub Analyzer
- AI Recruiter Mode
- Mock Interviews
- Career Coach
- Analytics
- Settings

## Error And Loading States

Dashboard routes use loading skeletons and error boundaries where appropriate. Form actions return controlled status objects so users receive readable errors instead of raw exceptions.

## Security Boundary

- Secrets stay in environment variables.
- `GITHUB_TOKEN` is server-side only.
- Clerk protects authenticated routes.
- Resume files and parsed resume text should be handled as sensitive data.
