# TalentForge AI Setup

## Prerequisites

- Node.js compatible with the project dependencies
- npm
- Clerk project
- Neon PostgreSQL database
- Optional GitHub Personal Access Token for higher GitHub API limits

## Install Dependencies

```bash
npm install
```

## Environment Variables

Create `.env.local` in the project root.

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
DATABASE_URL=
GITHUB_TOKEN=
```

Do not commit `.env.local`.

### Clerk

Create a Clerk application and copy the publishable and secret keys into `.env.local`.

Configure redirect URLs for local development and production deployment.

### Database

Create a Neon PostgreSQL database and add the connection string as `DATABASE_URL`.

After editing `prisma/schema.prisma`, sync the database:

```bash
npx prisma db push
```

## Optional GitHub Token

The GitHub Profile Analyzer works without a token, but unauthenticated GitHub API requests have low limits.

To enable higher limits:

1. Create a GitHub Personal Access Token in GitHub settings.
2. Public repository analysis does not require private repository access.
3. Add the token to `.env.local`:

```bash
GITHUB_TOKEN=your_github_token_here
```

4. Restart the app.

The token is used only in server-side GitHub API requests.

## Run Development Server

```bash
npm run dev
```

Open the local URL printed by Next.js, usually `http://localhost:3000`.

## Quality Checks

```bash
npm run lint
npm run build
```

## Deployment

TalentForge AI is designed for Vercel.

1. Push the repository to GitHub.
2. Import the repository into Vercel.
3. Add environment variables in Vercel Project Settings.
4. Configure Clerk production keys and redirect URLs.
5. Add the Neon `DATABASE_URL`.
6. Add `GITHUB_TOKEN` if using GitHub analysis at production scale.
7. Deploy.

## Troubleshooting

- **Clerk redirects fail**: verify Clerk keys and allowed redirect URLs.
- **Database connection fails**: verify `DATABASE_URL` and Neon database status.
- **GitHub API rate limit reached**: add `GITHUB_TOKEN` and restart the app.
- **GitHub token rejected**: check token value, expiration, permissions, and environment variable spelling.
- **PDF upload fails**: upload a text-based PDF under the documented file size limit.
- **Build fails after schema changes**: run `npx prisma db push` and regenerate any Prisma artifacts required by your local setup.
