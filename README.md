<div align="center">

# TalentForge AI

AI-powered career intelligence platform that helps candidates analyze resumes, optimize ATS score, match job descriptions, practice interviews, complete online assessments, analyze GitHub profiles, and improve hiring readiness.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=nextdotjs)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=06141F)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Neon](https://img.shields.io/badge/Neon-PostgreSQL-00E599?style=for-the-badge&logo=neon&logoColor=06141F)](https://neon.tech/)
[![Clerk](https://img.shields.io/badge/Clerk-Auth-6C47FF?style=for-the-badge&logo=clerk&logoColor=white)](https://clerk.com/)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-black?style=for-the-badge&logo=vercel)](https://vercel.com/)

**Live Demo:** [https://talent-forge-ai-5r4k-nu.vercel.app](https://talent-forge-ai-5r4k-nu.vercel.app)

</div>

---

## Overview

TalentForge AI is a full-stack career readiness workspace built for candidates who want a single place to improve resume quality, understand ATS performance, compare against job descriptions, practice interviews, complete online assessments, analyze public GitHub evidence, and track hiring readiness over time.

The product combines resume parsing, structured scoring, authenticated dashboards, version history, recruiter-style evaluation, GitHub profile analysis, and interview/OA workflows in one modern SaaS experience.

---

## Features

| Feature | Description |
| --- | --- |
| Resume Analyzer | Upload and analyze text-based PDF resumes with evidence-based feedback. |
| ATS Score Analyzer | Review ATS score, missing signals, keyword coverage, and improvement areas. |
| JD Match Analyzer | Compare a resume against a job description and identify match gaps. |
| Resume Rewriter | Generate improved resume sections and recruiter-ready wording. |
| ATS Optimizer | Optimize resume content for target roles and applicant tracking systems. |
| GitHub Profile Analyzer | Analyze public repositories for project quality, stack evidence, deployment, and recruiter visibility. |
| AI Recruiter | Rank candidate evidence and generate recruiter-facing reports. |
| Technical Interview Preparation | Practice technical, project, backend, frontend, and system-design style interviews. |
| Behavioral Interview Preparation | Prepare structured answers for behavioral interview prompts. |
| Online Assessments | Practice OA/DSA-style questions and review performance. |
| Career Coach | Receive career readiness guidance and roadmap suggestions. |
| Hiring Readiness Dashboard | Track profile strength, recommendations, progress, and key career signals. |
| Resume Version History | Compare resume versions, score changes, and restored snapshots. |
| Analytics Dashboard | Review resume, skill, progress, and readiness trends. |

---

## Tech Stack

| Area | Technologies |
| --- | --- |
| Frontend | Next.js, React, TypeScript, Tailwind CSS, Shadcn UI-style components |
| Backend | Next.js App Router, Next.js API Routes, Server Actions, Prisma ORM |
| Database | Neon PostgreSQL |
| Authentication | Clerk |
| Deployment | Vercel |
| AI & Analysis | Resume parsing, rule-based scoring, GitHub API analysis, interview and assessment evaluation logic |

---

## Screenshots

Screenshots can be added after final production QA.

### Landing Page

![Landing Page Screenshot](docs/screenshots/landing-page.png)

### Dashboard

![Dashboard Screenshot](docs/screenshots/dashboard.png)

### Resume Analyzer

![Resume Analyzer Screenshot](docs/screenshots/resume-analyzer.png)

### JD Match

![JD Match Screenshot](docs/screenshots/jd-match.png)

### ATS Optimizer

![ATS Optimizer Screenshot](docs/screenshots/ats-optimizer.png)

### Interview Module

![Interview Module Screenshot](docs/screenshots/interview-module.png)

### GitHub Analyzer

![GitHub Analyzer Screenshot](docs/screenshots/github-analyzer.png)

### OA Module

![OA Module Screenshot](docs/screenshots/oa-module.png)

---

## Project Structure

```text
talentforge-ai/
├── prisma/
│   └── schema.prisma
├── public/
│   └── uploads/
├── src/
│   ├── app/
│   │   ├── api/
│   │   ├── dashboard/
│   │   ├── onboarding/
│   │   ├── sign-in/
│   │   └── sign-up/
│   ├── components/
│   │   ├── dashboard/
│   │   └── ui/
│   ├── data/
│   │   └── question-bank/
│   └── lib/
├── DEPLOYMENT.md
├── README.md
├── package.json
└── prisma.config.ts
```

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/yagami-22/TalentForge-AI.git
cd TalentForge-AI
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create `.env.local` in the project root:

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
DATABASE_URL=
GITHUB_TOKEN=
```

`GITHUB_TOKEN` is optional, but recommended for higher GitHub API limits.

`DIRECT_URL` is not required in the current Prisma setup because the schema and Prisma config only use `DATABASE_URL`.

### 4. Sync the database schema

```bash
npx prisma db push
```

### 5. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

| Variable | Required | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes | Public Clerk key for browser authentication. |
| `CLERK_SECRET_KEY` | Yes | Server-side Clerk secret key. |
| `DATABASE_URL` | Yes | Neon PostgreSQL pooled connection string used by Prisma. |
| `GITHUB_TOKEN` | Optional | Server-side GitHub token for higher API rate limits. |

Never commit real secret values. `.env.local` is ignored by Git.

---

## Deployment

TalentForge AI is deployed on Vercel:

[https://talent-forge-ai-5r4k-nu.vercel.app](https://talent-forge-ai-5r4k-nu.vercel.app)

### Vercel setup

1. Import the GitHub repository into Vercel.
2. Select the Next.js framework preset.
3. Set the install command to `npm install`.
4. Set the build command to `npm run build`.
5. Add the required environment variables in Vercel Project Settings.
6. Use the Neon pooled PostgreSQL connection string for `DATABASE_URL`.
7. Run `npx prisma db push` against the production database before first use.
8. Redeploy after changing environment variables.

For a detailed production checklist, see [DEPLOYMENT.md](DEPLOYMENT.md).

---

## GitHub Repository About

Suggested repository description:

```text
AI-powered career platform featuring ATS Resume Analysis, JD Matching, Resume Optimization, GitHub Analysis, AI Recruiter, Mock Interviews, Online Assessments, and Career Coaching.
```

Suggested repository website:

```text
https://talent-forge-ai-5r4k-nu.vercel.app
```

Suggested topics:

```text
nextjs typescript react tailwindcss prisma neon clerk vercel resume ats career ai interview-prep
```

---

## Contributing

Contributions are welcome.

1. Fork the repository.
2. Create a feature branch:

```bash
git checkout -b feature/your-feature-name
```

3. Install dependencies and run the project locally.
4. Make a focused change.
5. Run linting before opening a pull request:

```bash
npm run lint
```

6. Open a pull request with a clear description, screenshots for UI changes, and notes about any environment or database impact.

Please keep contributions scoped, typed, and consistent with the existing Next.js App Router structure.

---

## License

No license file is currently included in this repository.
