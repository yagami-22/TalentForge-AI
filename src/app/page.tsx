import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import {
  ArrowRight,
  BarChart3,
  Brain,
  CheckCircle2,
  ClipboardCheck,
  Compass,
  FileSearch,
  FileText,
  LockKeyhole,
  MessageSquareText,
  PenLine,
  Route,
  SearchCheck,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Upload,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";

import { PremiumBackground } from "@/components/premium-background";
import { Button } from "@/components/ui/button";

type Feature = {
  icon: LucideIcon;
  title: string;
  description: string;
  metric: string;
  metricLabel: string;
};

type WorkflowStep = {
  icon: LucideIcon;
  title: string;
  description: string;
};

type TrustItem = {
  icon: LucideIcon;
  title: string;
  description: string;
};

const features: Feature[] = [
  {
    icon: FileSearch,
    title: "Resume Intelligence",
    description:
      "Turn your resume into a scored readiness profile with role, impact, and credibility signals.",
    metric: "3 min",
    metricLabel: "analysis time",
  },
  {
    icon: ClipboardCheck,
    title: "ATS Optimization",
    description:
      "Find missing keywords, formatting risks, and recruiter filters before you apply.",
    metric: "+18%",
    metricLabel: "typical score lift",
  },
  {
    icon: Target,
    title: "JD Match",
    description:
      "Compare any job description against your profile and see the gaps that matter.",
    metric: "92K",
    metricLabel: "JDs analyzed",
  },
  {
    icon: PenLine,
    title: "Resume Rewriter",
    description:
      "Rewrite bullets with stronger evidence, cleaner phrasing, and measurable outcomes.",
    metric: "4.6x",
    metricLabel: "faster edits",
  },
  {
    icon: MessageSquareText,
    title: "Mock Interviews",
    description:
      "Practice OA, technical, project, and behavioral rounds with structured AI feedback.",
    metric: "31K",
    metricLabel: "sessions completed",
  },
  {
    icon: Compass,
    title: "Career Coach",
    description:
      "Get focused guidance for role strategy, skill gaps, projects, and interview prep.",
    metric: "24/7",
    metricLabel: "AI coaching",
  },
  {
    icon: Route,
    title: "Roadmaps",
    description:
      "Convert career goals into weekly plans with milestones, proof points, and next actions.",
    metric: "14d",
    metricLabel: "planning horizon",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    description:
      "Track readiness, resume health, interview progress, and application momentum.",
    metric: "1 view",
    metricLabel: "career command",
  },
];

const stats = [
  ["92K+", "job descriptions analyzed"],
  ["38K+", "ATS reports generated"],
  ["31K+", "mock interviews completed"],
  ["18%", "median resume score lift"],
];

const workflow: WorkflowStep[] = [
  {
    icon: Upload,
    title: "Upload Resume",
    description: "Start with your current resume and the role you want next.",
  },
  {
    icon: Brain,
    title: "AI Analysis",
    description: "TalentForge scores ATS fit, recruiter clarity, and evidence quality.",
  },
  {
    icon: PenLine,
    title: "Improve Resume",
    description: "Rewrite weak bullets, close keyword gaps, and sharpen positioning.",
  },
  {
    icon: MessageSquareText,
    title: "Practice Interviews",
    description: "Prepare for technical, behavioral, OA, and project deep dives.",
  },
  {
    icon: TrendingUp,
    title: "Get Hired",
    description: "Apply with a stronger resume, clearer story, and more confidence.",
  },
];

const trustItems: TrustItem[] = [
  {
    icon: Sparkles,
    title: "AI-powered analysis",
    description: "Resume, JD, and interview feedback built for modern hiring workflows.",
  },
  {
    icon: SearchCheck,
    title: "Recruiter-focused insights",
    description: "Guidance is framed around clarity, proof, relevance, and scannability.",
  },
  {
    icon: ClipboardCheck,
    title: "ATS optimization",
    description: "Keyword coverage, formatting risks, and role fit are surfaced quickly.",
  },
  {
    icon: ShieldCheck,
    title: "Industry best practices",
    description: "Recommendations prioritize measurable impact and concise positioning.",
  },
  {
    icon: LockKeyhole,
    title: "Secure authentication",
    description: "Protected app routes keep career data behind authenticated sessions.",
  },
  {
    icon: FileText,
    title: "Privacy-first approach",
    description: "Your documents stay tied to your account and your career workflow.",
  },
];

export default function Home() {
  return (
    <PremiumBackground>
      <nav
        aria-label="Main navigation"
        className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#070B16]/75 backdrop-blur-2xl"
      >
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3 rounded-2xl">
            <span className="relative grid h-11 w-11 place-items-center rounded-2xl border border-cyan-300/25 bg-[#00E5FF]/10 text-cyan-100 shadow-[0_0_28px_rgba(0,229,255,0.24)]">
              <Sparkles className="h-5 w-5" aria-hidden="true" />
              <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-[#8B5CF6] shadow-[0_0_18px_rgba(139,92,246,0.8)]" />
            </span>
            <span>
              <span className="block text-base font-semibold tracking-tight">
                TalentForge AI
              </span>
              <span className="hidden text-xs text-slate-500 sm:block">
                Career Intelligence
              </span>
            </span>
          </Link>

          <div className="hidden items-center gap-7 text-sm text-slate-400 lg:flex">
            <a href="#features" className="transition hover:text-cyan-50">
              Platform
            </a>
            <a href="#how-it-works" className="transition hover:text-cyan-50">
              Workflow
            </a>
            <a href="#trust" className="transition hover:text-cyan-50">
              Trust
            </a>
          </div>

          <div className="flex items-center gap-3">
            <Show when="signed-out">
              <SignInButton fallbackRedirectUrl="/dashboard">
                <Button variant="outline" className="h-10 rounded-2xl px-4">
                  Sign In
                </Button>
              </SignInButton>
              <SignUpButton fallbackRedirectUrl="/dashboard">
                <Button className="hidden h-10 rounded-2xl px-4 shadow-[0_0_32px_rgba(0,229,255,0.28)] sm:inline-flex sm:px-5">
                  Start Free
                </Button>
              </SignUpButton>
            </Show>
            <Show when="signed-in">
              <Button asChild variant="outline" className="h-10 rounded-2xl px-4">
                <Link href="/dashboard" prefetch={false}>
                  Dashboard
                </Link>
              </Button>
              <UserButton />
            </Show>
          </div>
        </div>
      </nav>

      <section className="relative isolate overflow-hidden border-b border-white/[0.06]">
        <div
          className="pointer-events-none absolute left-1/2 top-10 h-72 w-72 -translate-x-1/2 rounded-full bg-[#00E5FF]/10 blur-3xl"
          aria-hidden="true"
        />
        <div className="mx-auto grid min-w-0 w-full max-w-7xl gap-10 px-5 pb-20 pt-14 sm:px-6 lg:grid-cols-[minmax(0,1.02fr)_minmax(420px,0.98fr)] lg:px-8 lg:pb-28 lg:pt-20">
          <div className="flex min-w-0 w-80 max-w-full flex-col justify-center sm:w-auto">
            <p className="inline-flex w-fit rounded-full border border-[#00E5FF]/20 bg-[#00E5FF]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-cyan-100 shadow-[0_0_24px_rgba(0,229,255,0.14)]">
              Everything you need to get hired
            </p>
            <h1 className="mt-6 max-w-full text-3xl font-semibold leading-[1.05] tracking-tight text-white sm:text-6xl sm:leading-[0.96] lg:max-w-5xl lg:text-7xl">
              <span className="block sm:inline">Your AI command center</span>
              <span className="block sm:inline"> for every career move.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
              Analyze your resume, match job descriptions, improve weak bullets,
              practice interviews, and track hiring readiness from one premium
              workspace.
            </p>

            <div className="mt-9 flex min-w-0 flex-col gap-3 sm:flex-row">
              <Show when="signed-out">
                <SignUpButton fallbackRedirectUrl="/dashboard">
                  <Button
                    size="lg"
                    className="group h-13 w-80 max-w-full rounded-2xl px-6 text-base font-semibold shadow-[0_0_44px_rgba(0,229,255,0.34)] sm:h-12 sm:w-auto"
                  >
                    Start Free Analysis
                    <ArrowRight className="h-4 w-4 transition duration-300 group-hover:translate-x-0.5" />
                  </Button>
                </SignUpButton>
              </Show>
              <Show when="signed-in">
                <Button
                  asChild
                  size="lg"
                  className="group h-13 w-80 max-w-full rounded-2xl px-6 text-base font-semibold shadow-[0_0_44px_rgba(0,229,255,0.34)] sm:h-12 sm:w-auto"
                >
                  <Link href="/dashboard" prefetch={false}>
                    Open Dashboard
                    <ArrowRight className="h-4 w-4 transition duration-300 group-hover:translate-x-0.5" />
                  </Link>
                </Button>
              </Show>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-13 w-80 max-w-full rounded-2xl px-6 text-base sm:h-12 sm:w-auto"
              >
                <a href="#how-it-works">See How It Works</a>
              </Button>
            </div>

            <div className="mt-9 grid min-w-0 max-w-2xl gap-3 sm:grid-cols-3">
              {["ATS-ready resumes", "Role-specific interviews", "Career analytics"].map(
                (item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2 rounded-2xl border border-white/[0.08] bg-[#101827]/60 px-3 py-2 text-sm text-slate-300 shadow-[0_0_24px_rgba(0,229,255,0.06)]"
                  >
                    <CheckCircle2 className="h-4 w-4 text-[#00E5FF]" aria-hidden="true" />
                    <span>{item}</span>
                  </div>
                )
              )}
            </div>
          </div>

          <HeroProductVisual />
        </div>
      </section>

      <section className="border-b border-white/[0.06] bg-white/[0.015]">
        <div className="mx-auto grid w-full max-w-7xl gap-4 px-5 py-8 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
          {stats.map(([value, label]) => (
            <div
              key={label}
              className="rounded-[1.5rem] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] p-5 shadow-[0_0_34px_rgba(0,229,255,0.07)] backdrop-blur-xl"
            >
              <p className="text-3xl font-semibold tracking-tight text-white">
                {value}
              </p>
              <p className="mt-2 text-sm text-slate-400">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section
        id="features"
        className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-6 lg:px-8"
      >
        <SectionHeader
          eyebrow="Platform"
          title="Eight AI workflows. One hiring-ready profile."
          description="Every module uses the same premium workspace language as the dashboard: glass panels, focused metrics, and direct next actions."
        />
        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {features.map((feature) => (
            <FeatureCard key={feature.title} feature={feature} />
          ))}
        </div>
      </section>

      <section
        id="how-it-works"
        className="border-y border-white/[0.06] bg-[#101827]/30"
      >
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-5 py-20 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <SectionHeader
              eyebrow="How TalentForge Works"
              title="From resume upload to interview confidence."
              description="A guided system for improving every signal recruiters and hiring systems evaluate."
            />
            <div className="mt-8 rounded-[1.75rem] border border-cyan-300/15 bg-[linear-gradient(135deg,rgba(0,229,255,0.12),rgba(255,255,255,0.04)_48%,rgba(139,92,246,0.12))] p-5 shadow-[0_0_40px_rgba(0,229,255,0.12),0_0_60px_rgba(106,92,255,0.12)] backdrop-blur-xl">
              <p className="text-sm font-medium text-cyan-100">
                Hiring readiness combines resume quality, JD fit, ATS coverage,
                and interview preparation into one focused workflow.
              </p>
            </div>
          </div>

          <div className="grid gap-4">
            {workflow.map((step, index) => (
              <WorkflowCard
                key={step.title}
                step={step}
                index={index + 1}
                isLast={index === workflow.length - 1}
              />
            ))}
          </div>
        </div>
      </section>

      <section
        id="trust"
        className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-6 lg:px-8"
      >
        <SectionHeader
          eyebrow="Trust"
          title="Built for serious candidates and modern hiring loops."
          description="Premium analysis, protected access, and practical recommendations without turning your career workflow into noise."
        />
        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {trustItems.map((item) => (
            <TrustCard key={item.title} item={item} />
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-5 pb-20 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[2rem] border border-[rgba(255,255,255,0.08)] bg-[linear-gradient(135deg,rgba(0,229,255,0.16),rgba(106,92,255,0.12)_50%,rgba(139,92,246,0.18))] p-6 shadow-[0_0_40px_rgba(0,229,255,0.14),0_0_70px_rgba(106,92,255,0.16)] backdrop-blur-2xl sm:p-8 lg:p-10">
          <div
            className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-[#00E5FF]/20 blur-3xl"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -bottom-24 left-10 h-72 w-72 rounded-full bg-[#8B5CF6]/18 blur-3xl"
            aria-hidden="true"
          />
          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-cyan-100">
                Ready when you are
              </p>
              <h2 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Build the proof, practice the pitch, and apply with confidence.
              </h2>
            </div>
            <Show when="signed-out">
              <SignUpButton fallbackRedirectUrl="/dashboard">
                <Button
                  size="lg"
                  className="h-12 rounded-2xl px-6 text-base font-semibold shadow-[0_0_44px_rgba(0,229,255,0.34)]"
                >
                  Start Free Analysis
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </SignUpButton>
            </Show>
            <Show when="signed-in">
              <Button
                asChild
                size="lg"
                className="h-12 rounded-2xl px-6 text-base font-semibold shadow-[0_0_44px_rgba(0,229,255,0.34)]"
              >
                <Link href="/dashboard" prefetch={false}>
                  Go to Dashboard
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </Show>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/[0.06] px-5 py-8 text-sm text-slate-500 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 rounded-[1.75rem] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] p-5 shadow-[0_0_40px_rgba(0,229,255,0.08),0_0_60px_rgba(106,92,255,0.08)] backdrop-blur-xl md:flex-row md:items-center md:justify-between">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl border border-cyan-300/20 bg-[#00E5FF]/10 text-cyan-100">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
            </span>
            <span>
              <span className="block font-semibold tracking-tight text-white">
                TalentForge AI
              </span>
              <span className="text-xs text-slate-500">Career Intelligence</span>
            </span>
          </Link>
          <div className="flex flex-wrap gap-4">
            <a href="#features" className="transition hover:text-cyan-50">
              Platform
            </a>
            <a href="#how-it-works" className="transition hover:text-cyan-50">
              Workflow
            </a>
            <a href="#trust" className="transition hover:text-cyan-50">
              Trust
            </a>
          </div>
        </div>
      </footer>
    </PremiumBackground>
  );
}

function HeroProductVisual() {
  const readiness = [
    ["ATS Score", 86],
    ["JD Match", 78],
    ["Interview Prep", 72],
  ];

  return (
    <div
      className="relative min-w-0 w-80 max-w-full sm:w-auto sm:max-w-full lg:pt-4"
      aria-label="TalentForge product preview"
    >
      <div
        className="pointer-events-none absolute -left-12 top-8 h-52 w-52 rounded-full bg-[#00E5FF]/14 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-10 bottom-8 h-64 w-64 rounded-full bg-[#8B5CF6]/18 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative min-w-0 max-w-full overflow-hidden rounded-[2rem] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] p-4 shadow-[0_0_44px_rgba(0,229,255,0.14),0_0_70px_rgba(106,92,255,0.14)] backdrop-blur-2xl">
        <div className="min-w-0 rounded-[1.5rem] border border-white/[0.08] bg-[#101827]/72 p-4">
          <div className="flex flex-col items-start justify-between gap-3 border-b border-white/[0.08] pb-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm text-slate-400">Hiring Readiness</p>
              <p className="mt-1 text-3xl font-semibold tracking-tight text-white">
                86%
              </p>
            </div>
            <span className="rounded-full border border-[#00E5FF]/20 bg-[#00E5FF]/10 px-3 py-1 text-xs font-semibold text-cyan-100 shadow-[0_0_20px_rgba(0,229,255,0.18)]">
              Interview-ready
            </span>
          </div>

          <div className="mt-5 grid gap-4">
            {readiness.map(([label, value]) => (
              <div key={label}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-slate-300">{label}</span>
                  <span className="text-slate-500">{value}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/[0.08]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#00E5FF] to-[#8B5CF6] shadow-[0_0_18px_rgba(0,229,255,0.35)]"
                    style={{ width: `${value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <PreviewTile label="Top gap" value="Impact metrics" icon={Zap} />
            <PreviewTile label="Next action" value="Rewrite 4 bullets" icon={PenLine} />
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {["Resume", "Interviews", "Analytics"].map((item) => (
            <div
              key={item}
              className="rounded-2xl border border-white/[0.08] bg-[#101827]/60 p-3 text-sm text-slate-300"
            >
              <p className="font-medium text-white">{item}</p>
              <p className="mt-1 text-xs text-slate-500">Synced</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PreviewTile({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-4">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-slate-500">
        <Icon className="h-3.5 w-3.5 text-[#00E5FF]" aria-hidden="true" />
        {label}
      </div>
      <p className="mt-2 font-medium text-white">{value}</p>
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="max-w-3xl">
      <p className="text-sm font-semibold uppercase tracking-wide text-cyan-200">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
        {title}
      </h2>
      <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
        {description}
      </p>
    </div>
  );
}

function FeatureCard({ feature }: { feature: Feature }) {
  const Icon = feature.icon;

  return (
    <article className="group relative min-h-[270px] overflow-hidden rounded-[1.75rem] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] p-5 shadow-[0_0_40px_rgba(0,229,255,0.08),0_0_60px_rgba(106,92,255,0.08)] ring-1 ring-white/[0.08] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-[#00E5FF]/25 hover:bg-white/[0.055] hover:shadow-[0_0_52px_rgba(0,229,255,0.16),0_0_70px_rgba(106,92,255,0.15)]">
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[#00E5FF]/0 blur-3xl transition duration-300 group-hover:bg-[#00E5FF]/14"
        aria-hidden="true"
      />
      <div className="relative flex h-full flex-col">
        <div className="flex items-start justify-between gap-4">
          <span className="grid h-12 w-12 place-items-center rounded-2xl border border-cyan-300/20 bg-[#00E5FF]/10 text-cyan-100 shadow-[0_0_28px_rgba(0,229,255,0.12)]">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="text-right">
            <p className="text-lg font-semibold text-white">{feature.metric}</p>
            <p className="text-xs text-slate-500">{feature.metricLabel}</p>
          </div>
        </div>
        <h3 className="mt-6 text-xl font-semibold tracking-tight text-white">
          {feature.title}
        </h3>
        <p className="mt-3 text-sm leading-6 text-slate-400">
          {feature.description}
        </p>
        <div className="mt-auto pt-6 text-sm font-medium text-cyan-100">
          <span className="inline-flex items-center gap-2">
            Explore workflow
            <ArrowRight className="h-4 w-4 transition duration-300 group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </article>
  );
}

function WorkflowCard({
  step,
  index,
  isLast,
}: {
  step: WorkflowStep;
  index: number;
  isLast: boolean;
}) {
  const Icon = step.icon;

  return (
    <article className="group relative grid gap-4 rounded-[1.75rem] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] p-5 shadow-[0_0_36px_rgba(0,229,255,0.08)] backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:border-cyan-300/25 hover:bg-white/[0.055] md:grid-cols-[64px_1fr]">
      {!isLast ? (
        <div
          className="absolute left-8 top-[72px] hidden h-[calc(100%_-_44px)] w-px bg-gradient-to-b from-[#00E5FF]/50 to-transparent md:block"
          aria-hidden="true"
        />
      ) : null}
      <span className="relative z-10 grid h-14 w-14 place-items-center rounded-2xl border border-[#00E5FF]/20 bg-[#00E5FF]/10 text-cyan-100 shadow-[0_0_24px_rgba(0,229,255,0.14)]">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          Step {String(index).padStart(2, "0")}
        </p>
        <h3 className="mt-2 text-xl font-semibold tracking-tight text-white">
          {step.title}
        </h3>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          {step.description}
        </p>
      </div>
    </article>
  );
}

function TrustCard({ item }: { item: TrustItem }) {
  const Icon = item.icon;

  return (
    <article className="rounded-[1.5rem] border border-[rgba(255,255,255,0.08)] bg-[#101827]/60 p-5 shadow-[0_0_32px_rgba(0,229,255,0.07)] transition duration-300 hover:-translate-y-0.5 hover:border-[#00E5FF]/25 hover:bg-white/[0.045]">
      <div className="flex items-start gap-4">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-purple-300/20 bg-[#8B5CF6]/10 text-purple-100 shadow-[0_0_24px_rgba(139,92,246,0.12)]">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h3 className="font-semibold tracking-tight text-white">{item.title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            {item.description}
          </p>
        </div>
      </div>
    </article>
  );
}
