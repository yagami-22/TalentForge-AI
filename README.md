# TalentForge AI

TalentForge AI is a production-ready career intelligence platform for resume analysis, ATS optimization, job matching, GitHub portfolio review, recruiter workflows, interview preparation, and career coaching.

## Live Demo

Live Demo: _Coming soon - add the Vercel URL here after deployment._

## Tech Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Clerk authentication
- Prisma 7
- Neon PostgreSQL
- GitHub API
- Recharts
- PDF parsing and PDF export
- Vercel

## Features

- Resume Hub for text-based PDF upload, parsing, scoring, and improvement suggestions.
- ATS Optimizer for job-description-specific resume gaps and keyword coverage.
- JD Matcher for role fit, missing requirements, and evidence-based match scoring.
- AI Rewriter for recruiter-ready resume section rewrites and PDF export.
- GitHub Analyzer for public repository quality, stack evidence, deployment signals, and recruiter visibility.
- Interview Prep and OA Practice for mock interviews, DSA practice, scoring, and reports.
- AI Recruiter Mode for candidate ranking and recruiter-facing evidence reports.
- Career Coach and Analytics for readiness signals, progress summaries, and career roadmap guidance.
- Resume History for saved versions, comparisons, score trends, and restoration.

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` in the project root and add the required variables listed below.

3. Sync the database schema when using a fresh Neon database:

```bash
npx prisma db push
```

4. Start the development server:

```bash
npm run dev
```

5. Verify production readiness locally:

```bash
npm run lint
npm run build
```

## Environment Variables

Do not commit real secret values. `.env.local` is ignored by this repository.

| Variable | Required | Where it is used |
| --- | --- | --- |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes | Clerk browser authentication |
| `CLERK_SECRET_KEY` | Yes | Clerk server authentication |
| `DATABASE_URL` | Yes | Prisma + Neon PostgreSQL |
| `GITHUB_TOKEN` | Optional | Server-side GitHub API requests with higher rate limits |

`DIRECT_URL` is not required in this project because the Prisma schema/config only use `DATABASE_URL`.

Example shape only:

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
DATABASE_URL=
GITHUB_TOKEN=
```

## Vercel Deployment

TalentForge AI is ready to deploy on Vercel with the default Next.js framework preset.

- Framework preset: `Next.js`
- Install command: `npm install`
- Build command: `npm run build`
- Output directory: Vercel default for Next.js
- Development command: `npm run dev`

Deployment steps:

1. Push the repository to GitHub.
2. Import the GitHub repository into Vercel.
3. Add the required environment variables in Vercel Project Settings.
4. Create or connect a Neon PostgreSQL database and set `DATABASE_URL` to the Neon pooled connection string.
5. Configure Clerk production keys and allowed redirect URLs for the Vercel domain.
6. Run `npx prisma db push` against the production database before first use.
7. Deploy the project.
8. After deployment, add the live Vercel URL to the GitHub repository About section.

See [DEPLOYMENT.md](DEPLOYMENT.md) for the full production checklist.

## Production Notes

- Uploaded resume PDFs are persisted to `public/uploads/resumes` only in local development.
- In production, TalentForge AI stores extracted resume text, analysis output, and version history in the database. Add Vercel Blob, S3, or another object store later if persistent original-PDF storage is required.
- `GITHUB_TOKEN` is server-side only and must not be exposed to client code.
- Prisma Client is generated during install through the `postinstall` script for fresh Vercel builds.

## GitHub Repository Presentation

After deployment, update the repository About section:

- Description: `AI-powered career intelligence platform for resumes, ATS optimization, GitHub analysis, recruiter workflows, interviews, and career coaching.`
- Website: add the live Vercel URL.
- Suggested topics: `nextjs`, `typescript`, `career`, `ai`, `resume`, `ats`, `clerk`, `prisma`, `neon`, `vercel`.

## License

MIT or project-specific license.
