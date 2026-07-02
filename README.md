# TalentForge AI

AI-powered career intelligence platform for resumes, ATS optimization, job matching, GitHub analysis, recruiter mode, and interview preparation.

## Live Demo

Live Demo: add deployed URL here

## Screenshots

Add screenshots before publishing:

- Landing Page: add screenshot here
- Dashboard: add screenshot here
- Resume Analyzer: add screenshot here
- ATS Optimizer: add screenshot here
- JD Match: add screenshot here
- Resume Rewriter: add screenshot here
- GitHub Analyzer: add screenshot here
- AI Recruiter Mode: add screenshot here
- Mock Interview: add screenshot here

## Features

- **Resume Intelligence**: Upload text-based PDF resumes, parse content, detect evidence, score resume quality, and surface actionable improvements.
- **ATS Optimization**: Compare a resume against a target job description and identify keyword, formatting, and relevance gaps.
- **JD Match**: Analyze job description fit with skill overlap, missing requirements, and match evidence.
- **Resume Rewriter**: Generate recruiter-ready resume sections tailored to a selected job description and export rewritten content as PDF.
- **Resume Version History**: Track resume changes, compare versions, review ATS/JD score trends, and restore saved versions.
- **GitHub Profile Analyzer**: Inspect public GitHub repositories for project quality, modern stack evidence, documentation, deployment, and recruiter visibility.
- **AI Recruiter Mode**: Review candidate batches against a job description, rank applicants, and generate evidence-based recruiter reports.
- **Mock Interviews**: Run company-style technical, DSA, frontend, backend, system design, project deep dive, behavioral, and mixed interview sessions.
- **Career Coach**: Combine resume, ATS, JD match, interview, project, skill, and GitHub signals into personalized readiness and roadmap guidance.
- **Premium Dashboard**: Unified dark SaaS workspace with analytics, quick actions, module navigation, and consistent product UI.

## Tech Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- Shadcn UI
- Clerk
- Prisma
- Neon PostgreSQL
- GitHub API
- PDF parsing/export
- Vercel

## Architecture Overview

TalentForge AI is a modular Next.js application organized around authenticated dashboard workflows.

- **Frontend**: App Router pages and client components live under `src/app`, with shared UI in `src/components` and design tokens in `src/lib/talentforge-design.ts`.
- **Auth**: Clerk handles sign-in, sign-up, sessions, and protected dashboard access.
- **Database**: Prisma models persist users, resumes, analysis outputs, and version history in Neon PostgreSQL.
- **AI analysis layer**: Domain logic in `src/lib` scores resumes, JD matches, ATS evidence, recruiter reports, interview answers, and career readiness.
- **Resume parsing**: Text-based PDFs are validated and parsed server-side before analysis and storage.
- **GitHub API integration**: Public repository data is fetched through a server-side API proxy with optional `GITHUB_TOKEN` support.
- **Recruiter intelligence**: Candidate evidence is ranked against job descriptions with seniority, skills, project quality, portfolio, and recommendation signals.
- **Dashboard modules**: Resume, ATS, JD Match, Rewriter, History, GitHub, Recruiter, Interview, Career Coach, Analytics, and Settings are separate route modules sharing the same visual system.

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for more detail.

## Folder Structure

```text
src/app/                         Next.js App Router routes and route modules
src/app/api/github/fetch/        Server-side GitHub API proxy
src/app/dashboard/               Authenticated dashboard shell and modules
src/app/dashboard/resume/        Resume intelligence, ATS, JD match, rewrite, history
src/app/dashboard/github/        GitHub Profile Analyzer
src/app/dashboard/recruiter/     AI Recruiter Mode workspace
src/app/dashboard/interview/     Interview and OA simulator flows
src/app/dashboard/coach/         AI Career Coach
src/components/                  Shared application components
src/components/ui/               Shadcn-style UI primitives
src/components/dashboard/        Dashboard-specific shared components
src/lib/                         Domain logic, analyzers, API clients, utilities
src/data/question-bank/          Interview and OA question data
prisma/                          Prisma schema and database scripts
public/uploads/resumes/          Local uploaded resume storage in development
docs/                            Product, setup, architecture, and feature docs
```

## Environment Variables

Create `.env.local` and provide the values needed for your environment. Do not commit real secrets.

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
DATABASE_URL=
GITHUB_TOKEN=
```

`GITHUB_TOKEN` is optional but recommended for higher GitHub API limits. It is read only on the server and must never be exposed to the browser.

## Local Setup

```bash
npm install
npm run dev
npm run lint
npm run build
```

Open the local development URL printed by Next.js, usually `http://localhost:3000`.

For full setup details, see [docs/SETUP.md](docs/SETUP.md).

## Deployment Guide

TalentForge AI is designed to deploy on Vercel.

1. Push the repository to GitHub.
2. Import the project in Vercel.
3. Add required environment variables in Vercel Project Settings.
4. Connect the Neon PostgreSQL database using `DATABASE_URL`.
5. Configure Clerk production keys and allowed redirect URLs.
6. Add `GITHUB_TOKEN` as a server-side environment variable if using GitHub analysis at production scale.
7. Deploy with the default Next.js build command: `npm run build`.

## Security Notes

- Store secrets only in environment variables.
- Keep `.env.local` out of version control.
- The GitHub token is server-side only and is not sent to client bundles.
- Clerk handles authentication and session state.
- Resume uploads should be treated as sensitive user data.
- Public GitHub analysis should only request public repository data unless the product explicitly adds private repository support later.

## Performance Notes

- Dashboard modules are route-isolated to keep workflows focused.
- Heavy GitHub API calls are proxied server-side and cached briefly.
- PDF parsing and analysis run server-side where possible.
- UI motion respects `prefers-reduced-motion`.
- Static and dynamic routes are validated through `npm run build`.

## Accessibility Notes

- Dashboard routes include visible focus states and keyboard-accessible controls.
- Forms use labels or ARIA labels with live feedback for errors and status updates.
- Charts include screen-reader summaries where visual-only graphics are used.
- Interactive cards are implemented as links or buttons.
- Motion is reduced when users enable reduced-motion preferences.

## Future Improvements

- Add production screenshots and a deployed demo URL.
- Add automated accessibility testing to CI.
- Add deeper recruiter pipeline persistence.
- Add optional cloud file storage for uploaded resumes.
- Add richer observability for API failures and analysis latency.

## License

MIT or placeholder.
