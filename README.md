This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Database Changes

After editing `prisma/schema.prisma`, sync the Neon database and refresh the
local Prisma Client:

```bash
npx prisma db push
npx prisma generate
```

## GitHub Profile Analyzer

The GitHub Profile Analyzer uses GitHub's public API to inspect repositories,
README files, package metadata, languages, and repository structure. It works
without a token, but unauthenticated GitHub API requests have low rate limits.

### Optional GitHub token

Codex cannot create a GitHub Personal Access Token for you because token
creation requires your own GitHub account permissions. To unlock higher request
limits:

1. Open GitHub's Personal Access Token settings.
2. Create a fine-grained or classic token.
3. Public repository analysis does not require private repository access.
4. Add the token to `.env.local`:

```bash
GITHUB_TOKEN=your_github_token_here
```

5. Restart the app:

```bash
npm run dev
```

The token is read only on the server. It is never exposed to the browser and is
never logged by the application.

### Troubleshooting GitHub analysis

- `GitHub API Rate Limit Reached`: add `GITHUB_TOKEN` to `.env.local`, then
  restart the app.
- `GitHub token needs attention`: check that the token was pasted correctly,
  has not expired, and starts with a valid GitHub token prefix such as
  `github_pat_` or `ghp_`.
- `GitHub profile not found`: verify the username and remove any extra spaces.
- `GitHub request timed out`: retry after a moment; GitHub may be slow or
  temporarily unavailable.
- `No public repositories found`: the profile may not have public repositories
  available for analysis.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
