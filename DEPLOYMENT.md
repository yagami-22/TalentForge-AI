# TalentForge AI Deployment Checklist

Use this checklist to deploy TalentForge AI to Vercel and prepare the GitHub repository for presentation.

## Production Readiness

- Next.js App Router project builds with `npm run build`.
- Linting passes with `npm run lint`.
- `.env.local` is ignored by `.gitignore`.
- No real API keys or database URLs are documented in the repository.
- Prisma Client generation runs during `npm install` through `postinstall`.
- Resume PDF file persistence is local-development only; production stores parsed resume content and analysis data in the database.

## Required Services

- Vercel project connected to the GitHub repository.
- Clerk application configured for production.
- Neon PostgreSQL database.
- Optional GitHub personal access token for higher GitHub API limits.

## Required Environment Variables

Set these in Vercel Project Settings for Production, Preview, and Development as appropriate.

| Variable | Required | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes | Public Clerk browser key. |
| `CLERK_SECRET_KEY` | Yes | Secret Clerk server key. |
| `DATABASE_URL` | Yes | Neon PostgreSQL pooled connection string used by Prisma at runtime and by `prisma db push`. |
| `GITHUB_TOKEN` | Optional | Server-side only; improves GitHub API rate limits. |

`DIRECT_URL` is not required for the current project. The Prisma schema does not define `directUrl`, and `prisma.config.ts` reads only `DATABASE_URL`. Add `DIRECT_URL` only if the project later switches to a Prisma setup that explicitly uses `directUrl` for migrations.

Never paste real secret values into README files, issues, screenshots, commits, or pull requests.

## Neon Database Setup

1. Create or open the Neon project for TalentForge AI.
2. Open **Connection Details** in Neon.
3. Select the production branch and database.
4. Copy the pooled PostgreSQL connection string for serverless usage.
5. The value should start with `postgresql://` or `postgres://` and include the database name, username, password, host, and SSL settings.
6. Do not commit this value and do not paste it into project documentation.
7. Add the value to Vercel as `DATABASE_URL`.

Recommended Vercel variable scopes:

- Production: required for the live deployment from `main`.
- Preview: required if you test preview deployments from branches.
- Development: optional, only if you use Vercel-linked local development.

After adding or changing Vercel environment variables, redeploy the project. Existing deployments do not automatically receive changed environment variables until redeployed.

## Vercel Settings

- Framework preset: `Next.js`
- Install command: `npm install`
- Build command: `npm run build`
- Output directory: Vercel default for Next.js
- Development command: `npm run dev`
- Node.js version: Vercel default compatible with the project dependencies

No custom `vercel.json` is required for the current setup.

## Deployment Steps

1. Push the latest code to GitHub.
2. Create or confirm the Neon production database.
3. Add the Neon pooled connection string as `DATABASE_URL` in Vercel environment variables.
4. Add Clerk production keys to Vercel environment variables.
5. In Clerk, add the Vercel production domain to allowed origins and redirect URLs.
6. Add `GITHUB_TOKEN` only if you want higher GitHub API limits.
7. Sync the Prisma schema against the production database. Use the same `DATABASE_URL` value that is configured in Vercel:

```bash
npx prisma db push
```

8. Import or redeploy the project in Vercel.
9. Confirm the build uses `npm install` and `npm run build`.
10. Open the deployed site and complete the post-deployment checks below.

## Database Error Troubleshooting

If `/dashboard` shows `Dashboard database connection failed`, the app was able to render and authenticate, but a Prisma query could not reach Neon.

Check these in order:

1. `DATABASE_URL` exists in Vercel for the deployment environment you are opening.
2. The deployed URL is a Production deployment if the variable was added only to Production scope.
3. The Neon project and branch are active.
4. The connection string was copied completely and has no surrounding quotes or extra spaces.
5. The schema has been pushed to that exact database with `npx prisma db push`.
6. Redeploy after changing environment variables.

If `/dashboard` shows `Dashboard database is not configured`, `DATABASE_URL` is missing or malformed in the runtime environment. If it shows `Dashboard database schema is not ready`, the connection works but the tables/columns do not match `prisma/schema.prisma`.

## Post-Deployment Checks

- Landing page loads without console errors.
- Sign up and sign in work through Clerk.
- Onboarding redirects correctly.
- Dashboard loads for an authenticated user.
- Resume upload accepts a text-based PDF and stores analysis output.
- ATS Optimizer, JD Matcher, AI Rewriter, and Resume History load correctly.
- GitHub Analyzer can scan a public username.
- Interview Prep, OA Practice, Recruiter, Career Coach, and Analytics routes render.
- Vercel build logs do not show missing environment variables.
- No secret values appear in browser source, client logs, or GitHub documentation.

## GitHub Repository About Section

After Vercel deployment, update GitHub repository About:

- Website: paste the live Vercel URL.
- Description: `AI-powered career intelligence platform for resumes, ATS optimization, GitHub analysis, recruiter workflows, interviews, and career coaching.`
- Topics: `nextjs`, `typescript`, `career`, `ai`, `resume`, `ats`, `clerk`, `prisma`, `neon`, `vercel`.

## Production Storage Note

Vercel serverless functions should not be used as persistent file storage. TalentForge AI avoids production writes to `public/uploads/resumes`; only parsed resume text, analysis data, and version history are persisted in Neon PostgreSQL. If the product later needs original PDF retrieval in production, add Vercel Blob, S3, or another object storage provider.
