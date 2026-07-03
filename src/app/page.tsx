import { Show, SignUpButton, UserButton } from "@clerk/nextjs";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  ChevronDown,
  CirclePlay,
  Code2,
  Compass,
  FileSearch,
  GitBranch,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  WandSparkles,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";

import { PremiumBackground } from "@/components/premium-background";
import { Button } from "@/components/ui/button";

type ModuleTone = "cyan" | "blue" | "emerald" | "amber" | "purple";

type ModuleCard = {
  icon: LucideIcon;
  title: string;
  description: string;
  tone: ModuleTone;
};

const heroHighlights = [
  {
    icon: Sparkles,
    title: "AI-Powered Insights",
    description: "Smart analysis. Actionable recommendations.",
  },
  {
    icon: ShieldCheck,
    title: "End-to-End Preparation",
    description: "Covers every step of your hiring journey.",
  },
  {
    icon: Zap,
    title: "Real Career Impact",
    description: "Improve scores, build skills, land better roles.",
  },
];

const moduleCards: ModuleCard[] = [
  {
    icon: FileSearch,
    title: "Resume Analyzer",
    description: "Deep resume insights & scoring",
    tone: "cyan",
  },
  {
    icon: Zap,
    title: "ATS Optimizer",
    description: "Improve ATS score instantly",
    tone: "blue",
  },
  {
    icon: Target,
    title: "JD Matcher",
    description: "Match jobs with perfect fit",
    tone: "emerald",
  },
  {
    icon: WandSparkles,
    title: "AI Rewriter",
    description: "Rewrite & strengthen your resume",
    tone: "amber",
  },
  {
    icon: MessageSquareText,
    title: "Interview Prep",
    description: "Mock interviews with AI feedback",
    tone: "purple",
  },
  {
    icon: Code2,
    title: "OA Practice",
    description: "Coding, SQL & aptitude practice",
    tone: "blue",
  },
  {
    icon: GitBranch,
    title: "GitHub Analyzer",
    description: "Insights on your developer profile",
    tone: "cyan",
  },
  {
    icon: Compass,
    title: "Career Coach",
    description: "Personalized career guidance",
    tone: "purple",
  },
  {
    icon: Sparkles,
    title: "And More",
    description: "New tools coming soon",
    tone: "amber",
  },
];

const trustedBrands = ["Google", "Microsoft", "Amazon", "Adobe", "Infosys", "TCS", "Deloitte"];

export default function Home() {
  return (
    <PremiumBackground contentClassName="mx-auto min-h-screen w-full overflow-x-hidden">
      <style>
        {`
          @keyframes landing-float {
            0%, 100% { transform: translate3d(0, 0, 0); }
            50% { transform: translate3d(0, -10px, 0); }
          }

          @keyframes landing-pulse {
            0%, 100% { opacity: .55; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.18); }
          }

          @keyframes landing-orbit {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }

          @keyframes landing-shimmer {
            0%, 100% { opacity: .52; }
            50% { opacity: .92; }
          }

          .landing-float { animation: landing-float 6s ease-in-out infinite; }
          .landing-float-slow { animation: landing-float 8s ease-in-out infinite; }
          .landing-pulse { animation: landing-pulse 2.8s ease-in-out infinite; }
          .landing-orbit { animation: landing-orbit 24s linear infinite; }
          .landing-shimmer { animation: landing-shimmer 4s ease-in-out infinite; }
        `}
      </style>

      <nav
        aria-label="Main navigation"
        className="sticky top-0 z-40 border-b border-white/[0.07] bg-[#030713]/88 backdrop-blur-2xl"
      >
        <div className="mx-auto flex w-full max-w-[1410px] items-center justify-between gap-5 px-5 py-3 sm:px-7 lg:px-8">
          <Link href="/" className="flex min-w-0 items-center gap-3 rounded-2xl">
            <TFMark size="md" />
            <span className="min-w-0">
              <span className="block truncate text-base font-semibold tracking-tight">
                TalentForge AI
              </span>
              <span className="hidden truncate text-xs text-slate-500 sm:block">
                Career Intelligence Platform
              </span>
            </span>
          </Link>

          <div className="hidden items-center gap-8 text-sm font-medium text-slate-300 lg:flex">
            <NavLink href="#features">Platform</NavLink>
            <NavLink href="#features">Solutions</NavLink>
            <NavLink href="#features">Resources</NavLink>
            <a href="#features" className="transition hover:text-cyan-50">
              Pricing
            </a>
            <a href="#features" className="transition hover:text-cyan-50">
              Trust
            </a>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <Button
              asChild
              variant="outline"
              className="hidden h-10 rounded-xl border-white/[0.08] bg-[#080D1D]/70 px-4 text-sm font-semibold text-white shadow-[0_0_22px_rgba(139,92,246,0.1)] md:inline-flex"
            >
              <a href="#features">
                <Bot className="h-4 w-4 text-amber-300" />
                AI Assistant
              </a>
            </Button>
            <Show when="signed-out">
              <SignUpButton fallbackRedirectUrl="/dashboard">
                <Button className="hidden h-10 rounded-xl px-4 text-sm font-semibold shadow-[0_0_34px_rgba(139,92,246,0.32)] sm:inline-flex sm:px-5">
                  Dashboard
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </SignUpButton>
            </Show>
            <Show when="signed-in">
              <Button
                asChild
                className="hidden h-10 rounded-xl px-4 text-sm font-semibold shadow-[0_0_34px_rgba(139,92,246,0.32)] sm:inline-flex"
              >
                <Link href="/dashboard" prefetch={false}>
                  Dashboard
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <UserButton />
            </Show>
          </div>
        </div>
      </nav>

      <section className="relative isolate overflow-hidden border-b border-white/[0.06]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_22%_15%,rgba(0,229,255,0.13),transparent_25%),radial-gradient(circle_at_70%_30%,rgba(139,92,246,0.2),transparent_32%),linear-gradient(180deg,rgba(5,9,20,0.08),rgba(5,9,20,0.92))]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.04)_1px,transparent_1px)] bg-[size:56px_56px]" />
        <div className="pointer-events-none absolute left-[12%] top-24 h-80 w-80 rounded-full bg-[#00E5FF]/8 blur-3xl" />
        <div className="pointer-events-none absolute right-[16%] top-20 h-96 w-96 rounded-full bg-[#8B5CF6]/10 blur-3xl" />

        <div className="relative mx-auto grid min-w-0 w-full max-w-[1410px] gap-8 px-5 pb-8 pt-10 sm:px-7 lg:grid-cols-[minmax(0,0.86fr)_minmax(580px,1.14fr)] lg:px-8 lg:pb-8 lg:pt-10">
          <div className="relative flex min-w-0 flex-col justify-center">
            <p className="inline-flex max-w-full rounded-full border border-purple-300/24 bg-purple-300/10 px-3 py-1.5 text-center text-[0.64rem] font-semibold uppercase tracking-[0.18em] text-purple-100 shadow-[0_0_24px_rgba(139,92,246,0.18)] sm:w-fit sm:px-4 sm:text-xs sm:tracking-[0.35em]">
              AI-Powered Career Intelligence
            </p>
            <h1 className="mt-5 max-w-[640px] text-[3.5rem] font-semibold leading-[0.92] tracking-tight text-white sm:text-7xl lg:text-[5.05rem]">
              Your career.
              <span className="block bg-gradient-to-r from-[#39C8FF] via-[#6A5CFF] to-[#FF3DFE] bg-clip-text text-transparent">
                Upgraded
                <span className="block text-white sm:inline"> by AI.</span>
              </span>
            </h1>
            <p className="mt-5 max-w-[560px] text-base leading-8 text-slate-300 sm:text-lg">
              From resume analysis to interview mastery, TalentForge AI gives you everything you need to stand out and get hired faster.
            </p>

            <div className="mt-7 grid gap-5 sm:grid-cols-3">
              {heroHighlights.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="relative border-l border-white/[0.08] pl-5 first:border-l-0 first:pl-0"
                  >
                    <span className="mb-4 grid h-10 w-10 place-items-center rounded-full border border-white/[0.08] bg-white/[0.055] text-cyan-100 shadow-[0_0_22px_rgba(139,92,246,0.18)]">
                      <Icon className="h-5 w-5" />
                    </span>
                    <h3 className="text-sm font-semibold text-white">{item.title}</h3>
                    <p className="mt-2 text-xs leading-5 text-slate-400">{item.description}</p>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 flex min-w-0 flex-col gap-3 sm:flex-row">
              <Show when="signed-out">
                <SignUpButton fallbackRedirectUrl="/dashboard">
                  <Button
                    size="lg"
                    className="group h-12 w-full max-w-sm rounded-[1.15rem] px-7 text-base font-semibold shadow-[0_0_44px_rgba(0,229,255,0.34),0_0_50px_rgba(139,92,246,0.25)] sm:w-auto"
                  >
                    Start Your Free Journey
                    <ArrowRight className="h-4 w-4 transition duration-300 group-hover:translate-x-0.5" />
                  </Button>
                </SignUpButton>
              </Show>
              <Show when="signed-in">
                <Button
                  asChild
                  size="lg"
                  className="group h-12 w-full max-w-sm rounded-[1.15rem] px-7 text-base font-semibold shadow-[0_0_44px_rgba(0,229,255,0.34),0_0_50px_rgba(139,92,246,0.25)] sm:w-auto"
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
                className="h-12 w-full max-w-sm rounded-[1.15rem] border-white/[0.08] bg-[#080D1D]/66 px-7 text-base text-white shadow-[0_0_24px_rgba(0,0,0,0.22)] sm:w-auto"
              >
                <a href="#features">
                  <CirclePlay className="h-4 w-4" />
                  See How It Works
                </a>
              </Button>
            </div>

            <div className="mt-6 flex flex-wrap gap-x-8 gap-y-3 text-xs font-medium text-slate-500">
              {["No credit card required", "Secure & Private", "Loved by 10,000+ users"].map((item) => (
                <span key={item} className="inline-flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-slate-500" />
                  {item}
                </span>
              ))}
            </div>
          </div>

          <CareerIntelligenceVisual />
        </div>
      </section>

      <section
        id="features"
        className="relative mx-auto w-full max-w-[1410px] px-5 py-5 sm:px-7 lg:px-8"
      >
        <div className="pointer-events-none absolute left-1/2 top-4 h-56 w-56 -translate-x-1/2 rounded-full bg-[#00E5FF]/8 blur-3xl" />
        <div className="pointer-events-none absolute right-[12%] top-8 h-64 w-64 rounded-full bg-[#8B5CF6]/8 blur-3xl" />

        <div className="relative mx-auto max-w-3xl text-center">
          <p className="mx-auto inline-flex rounded-full border border-cyan-300/18 bg-cyan-300/8 px-4 py-1 text-xs font-semibold uppercase tracking-[0.32em] text-cyan-200 shadow-[0_0_24px_rgba(0,229,255,0.12)]">
            All-In-One Career Intelligence Suite
          </p>
          <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl">
            Everything you need. In one{" "}
            <span className="bg-gradient-to-r from-[#39C8FF] via-[#6A5CFF] to-[#8B5CF6] bg-clip-text text-transparent">
              intelligent
            </span>{" "}
            platform.
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Powerful AI tools to analyze, optimize, and accelerate your career growth.
          </p>
        </div>

        <div className="relative mt-6 grid grid-cols-1 gap-4 min-[460px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-9">
          {moduleCards.map((module) => (
            <ModuleCardView key={module.title} module={module} />
          ))}
        </div>

        <div className="relative mt-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.36em] text-slate-600 sm:tracking-[0.5em]">
            Trusted by aspiring professionals from
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-xl font-semibold text-slate-500/72 sm:gap-x-10 sm:text-2xl">
            {trustedBrands.map((brand) => (
              <span key={brand}>{brand}</span>
            ))}
          </div>
        </div>
      </section>
    </PremiumBackground>
  );
}

function NavLink({ href, children }: { href: string; children: string }) {
  return (
    <a href={href} className="inline-flex items-center gap-1 transition hover:text-cyan-50">
      {children}
      <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
    </a>
  );
}

function TFMark({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const dimensions = {
    sm: "h-10 w-12 text-xs",
    md: "h-11 w-14 text-sm",
    lg: "h-20 w-24 text-2xl",
  }[size];

  return (
    <span className={`relative grid shrink-0 place-items-center ${dimensions}`}>
      <span className="absolute inset-x-0 top-1/2 h-[54%] -translate-y-1/2 rounded-[0.7rem] bg-gradient-to-br from-[#00E5FF] via-[#6A5CFF] to-[#FF3DFE] opacity-95 shadow-[0_0_28px_rgba(0,229,255,0.32),0_0_34px_rgba(139,92,246,0.28)] [clip-path:polygon(8%_10%,100%_10%,78%_38%,59%_38%,45%_90%,27%_90%,43%_38%,0_38%)]" />
      <span className="relative font-black tracking-tighter text-white drop-shadow-[0_0_14px_rgba(0,229,255,0.9)]">
        TF
      </span>
    </span>
  );
}

function CareerIntelligenceVisual() {
  return (
    <div className="relative hidden min-h-[520px] lg:block" aria-label="TalentForge AI career intelligence preview">
      <div className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle_at_48%_42%,rgba(0,229,255,0.18),transparent_58%)] blur-2xl" />
      <div className="landing-float absolute left-[10%] top-[4%] z-30">
        <FloatingMetric title="Resume Analysis" label="ATS Score" value="86%" delta="+18%" accent="cyan" />
      </div>
      <div className="landing-float-slow absolute left-[2%] top-[34%] z-30">
        <FloatingMetric title="JD Match" label="Match Score" value="92%" delta="+21%" accent="emerald" />
      </div>
      <div className="landing-float absolute right-[4%] top-[6%] z-30">
        <FloatingMetric title="Interview Prep" label="Mock Interviews" value="31K+" delta="Completed" accent="purple" />
      </div>
      <div className="landing-float-slow absolute right-[2%] top-[33%] z-30">
        <FloatingStars />
      </div>
      <div className="landing-float absolute bottom-[8%] left-[18%] z-30">
        <FloatingChecklist />
      </div>
      <div className="landing-float-slow absolute bottom-[8%] right-[8%] z-30">
        <FloatingChart />
      </div>

      <div className="absolute left-1/2 top-[43%] h-[430px] w-[580px] -translate-x-1/2 -translate-y-1/2">
        <div className="landing-orbit absolute left-1/2 top-[43%] h-[340px] w-[340px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-300/20 shadow-[0_0_36px_rgba(0,229,255,0.18)]" />
        <div className="absolute left-1/2 top-[43%] h-[255px] w-[455px] -translate-x-1/2 -translate-y-1/2 rotate-12 rounded-[50%] border border-cyan-300/24" />
        <div className="absolute left-1/2 top-[43%] h-[255px] w-[455px] -translate-x-1/2 -translate-y-1/2 -rotate-12 rounded-[50%] border border-purple-300/22" />
        <div className="absolute left-1/2 top-[43%] h-[330px] w-[330px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(0,229,255,0.16),transparent_63%)] blur-xl" />

        {[0, 1, 2, 3, 4, 5, 6].map((item) => (
          <span
            key={item}
            className="landing-pulse absolute h-3 w-3 rounded-full bg-cyan-300 shadow-[0_0_18px_rgba(0,229,255,1)]"
            style={{
              left: `${20 + item * 10}%`,
              top: `${18 + ((item * 29) % 46)}%`,
              animationDelay: `${item * 0.28}s`,
            }}
          />
        ))}

        <div className="absolute left-1/2 top-[63%] h-28 w-[330px] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(ellipse_at_center,rgba(0,229,255,0.44),rgba(106,92,255,0.34)_42%,transparent_72%)] blur-md" />
        <div className="absolute left-1/2 top-[63%] z-10 h-16 w-[280px] -translate-x-1/2 rounded-[50%] border border-cyan-300/28 bg-[linear-gradient(90deg,rgba(0,229,255,0.28),rgba(139,92,246,0.35),rgba(255,61,254,0.22))] shadow-[0_0_36px_rgba(0,229,255,0.34),0_0_60px_rgba(139,92,246,0.32)]" />
        <div className="absolute left-1/2 top-[68%] z-0 h-16 w-[350px] -translate-x-1/2 rounded-[50%] border border-purple-300/22 bg-[linear-gradient(90deg,rgba(9,16,42,0.82),rgba(65,51,154,0.72),rgba(7,12,32,0.84))] shadow-[0_0_36px_rgba(106,92,255,0.42)]" />
        <div className="absolute left-1/2 top-[73%] z-0 h-16 w-[300px] -translate-x-1/2 rounded-[50%] border border-cyan-300/16 bg-[linear-gradient(90deg,rgba(5,10,27,0.86),rgba(0,229,255,0.18),rgba(139,92,246,0.24))]" />

        <div className="landing-shimmer absolute left-1/2 top-[42%] z-20 grid h-56 w-56 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-cyan-100/36 bg-[radial-gradient(circle_at_32%_24%,rgba(255,255,255,0.68),rgba(74,184,255,0.42)_18%,rgba(55,116,255,0.42)_42%,rgba(139,92,246,0.45)_62%,rgba(5,9,26,0.94)_86%)] shadow-[0_0_54px_rgba(0,229,255,0.78),0_0_110px_rgba(139,92,246,0.58),inset_0_0_36px_rgba(255,255,255,0.18)]">
          <span className="absolute inset-4 rounded-full border border-cyan-100/16" />
          <span className="absolute left-8 top-8 h-12 w-24 rounded-full bg-white/20 blur-xl" />
          <TFMark size="lg" />
        </div>
      </div>
    </div>
  );
}

function FloatingMetric({
  title,
  label,
  value,
  delta,
  accent,
}: {
  title: string;
  label: string;
  value: string;
  delta: string;
  accent: "cyan" | "emerald" | "purple";
}) {
  const accentClass = {
    cyan: "border-cyan-300/30 shadow-[0_0_32px_rgba(0,229,255,0.18)]",
    emerald: "border-emerald-300/30 shadow-[0_0_32px_rgba(52,211,153,0.16)]",
    purple: "border-purple-300/30 shadow-[0_0_32px_rgba(139,92,246,0.18)]",
  }[accent];

  return (
    <div className={`w-40 rounded-[1rem] border bg-[#071024]/76 p-4 backdrop-blur-xl ${accentClass}`}>
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      <p className="mt-3 text-xs text-slate-500">{label}</p>
      <div className="mt-1 flex items-end justify-between">
        <p className="text-2xl font-semibold text-white">{value}</p>
        <span className="grid h-10 w-10 place-items-center rounded-full border border-cyan-300/20 bg-cyan-300/8 text-xs font-semibold text-cyan-100">
          {value.replace("+", "")}
        </span>
      </div>
      <p className="mt-2 text-xs font-semibold text-emerald-300">
        {delta.startsWith("+") ? "▲ " : ""}
        {delta}
      </p>
    </div>
  );
}

function FloatingStars() {
  return (
    <div className="w-44 rounded-[1rem] border border-purple-300/28 bg-[#071024]/74 p-4 shadow-[0_0_32px_rgba(139,92,246,0.2)] backdrop-blur-xl">
      <h3 className="text-sm font-semibold text-white">Career Readiness</h3>
      <p className="mt-3 text-xs text-slate-500">Overall Score</p>
      <p className="mt-1 text-xl font-semibold text-white">Excellent</p>
      <div className="mt-3 flex gap-2 text-[#8B5CF6]">
        {[0, 1, 2, 3, 4].map((item) => (
          <Star key={item} className="h-4 w-4 fill-current" />
        ))}
      </div>
    </div>
  );
}

function FloatingChecklist() {
  return (
    <div className="w-48 rounded-[1rem] border border-cyan-300/26 bg-[#071024]/78 p-4 shadow-[0_0_34px_rgba(0,229,255,0.18)] backdrop-blur-xl">
      <h3 className="text-sm font-semibold text-white">AI Recommendations</h3>
      <div className="mt-3 space-y-2 text-xs text-slate-300">
        {["Improve Impact", "Add Keywords", "Strengthen Skills"].map((item) => (
          <p key={item} className="flex items-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />
            {item}
          </p>
        ))}
      </div>
      <p className="mt-2 text-xs text-slate-500">+12 more</p>
    </div>
  );
}

function FloatingChart() {
  return (
    <div className="w-52 rounded-[1rem] border border-purple-300/28 bg-[#071024]/76 p-4 shadow-[0_0_32px_rgba(139,92,246,0.2)] backdrop-blur-xl">
      <h3 className="text-sm font-semibold text-white">Hiring Probability</h3>
      <p className="mt-3 text-lg font-semibold text-emerald-300">High</p>
      <p className="text-xs text-slate-400">Top 20% Candidates</p>
      <div className="mt-3 h-12 rounded-xl bg-[linear-gradient(135deg,rgba(0,229,255,0.12),rgba(139,92,246,0.2))] p-2">
        <div className="h-full rounded-lg border-b border-l border-cyan-300/18 bg-[linear-gradient(135deg,transparent_10%,rgba(59,168,255,0.26)_11%,transparent_18%,rgba(139,92,246,0.3)_36%,transparent_42%,rgba(255,61,254,0.38)_70%,transparent_76%)]" />
      </div>
    </div>
  );
}

function ModuleCardView({ module }: { module: ModuleCard }) {
  const Icon = module.icon;
  const tone = getModuleTone(module.tone);

  return (
    <article
      className={`group relative min-h-[150px] overflow-hidden rounded-[1.05rem] border bg-[#071024]/72 p-4 shadow-[0_0_34px_rgba(0,0,0,0.18)] ring-1 ring-white/[0.04] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:bg-white/[0.05] ${tone.border}`}
    >
      <span
        className={`absolute -left-12 -top-12 h-28 w-28 rounded-full opacity-55 blur-2xl transition duration-300 group-hover:opacity-90 ${tone.glow}`}
      />
      <span
        className={`relative grid h-11 w-11 place-items-center rounded-2xl border shadow-[0_0_24px_rgba(0,229,255,0.12)] ${tone.icon}`}
      >
        <Icon className="h-5 w-5" />
      </span>
      <h3 className="relative mt-4 text-sm font-semibold tracking-tight text-white">
        {module.title}
      </h3>
      <p className="relative mt-2 text-xs leading-5 text-slate-400">
        {module.description}
      </p>
    </article>
  );
}

function getModuleTone(tone: ModuleTone) {
  const tones = {
    cyan: {
      border: "border-cyan-300/20 hover:border-cyan-200/45 hover:shadow-[0_0_42px_rgba(0,229,255,0.16)]",
      icon: "border-cyan-300/24 bg-cyan-300/12 text-cyan-100",
      glow: "bg-cyan-300/22",
    },
    blue: {
      border: "border-blue-300/20 hover:border-blue-200/45 hover:shadow-[0_0_42px_rgba(59,130,246,0.16)]",
      icon: "border-blue-300/24 bg-blue-300/12 text-blue-100",
      glow: "bg-blue-300/22",
    },
    emerald: {
      border: "border-emerald-300/20 hover:border-emerald-200/45 hover:shadow-[0_0_42px_rgba(52,211,153,0.14)]",
      icon: "border-emerald-300/24 bg-emerald-300/12 text-emerald-100",
      glow: "bg-emerald-300/20",
    },
    amber: {
      border: "border-amber-300/20 hover:border-amber-200/45 hover:shadow-[0_0_42px_rgba(245,158,11,0.14)]",
      icon: "border-amber-300/24 bg-amber-300/12 text-amber-100",
      glow: "bg-amber-300/20",
    },
    purple: {
      border: "border-purple-300/20 hover:border-purple-200/45 hover:shadow-[0_0_42px_rgba(139,92,246,0.16)]",
      icon: "border-purple-300/24 bg-purple-300/12 text-purple-100",
      glow: "bg-purple-300/22",
    },
  };

  return tones[tone];
}
