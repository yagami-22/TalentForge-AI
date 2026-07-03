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
import Image from "next/image";
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
            50% { transform: translate3d(0, -8px, 0); }
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
            0%, 100% { opacity: .82; }
            50% { opacity: 1; }
          }

          @keyframes landing-aurora {
            0%, 100% { opacity: .28; transform: translate3d(-2%, 0, 0) rotate(-2deg); }
            50% { opacity: .46; transform: translate3d(2%, -2%, 0) rotate(2deg); }
          }

          @keyframes landing-spark {
            0%, 100% { opacity: .22; transform: translate3d(0, 0, 0) scale(.85); }
            50% { opacity: .8; transform: translate3d(0, -7px, 0) scale(1.05); }
          }

          @keyframes landing-ring {
            0%, 100% { opacity: .34; transform: translate3d(-50%, -50%, 0) scale(.96); }
            50% { opacity: .72; transform: translate3d(-50%, -50%, 0) scale(1.04); }
          }

          .landing-float { animation: landing-float 6s ease-in-out infinite; }
          .landing-float-slow { animation: landing-float 8s ease-in-out infinite; }
          .landing-pulse { animation: landing-pulse 2.8s ease-in-out infinite; }
          .landing-orbit { animation: landing-orbit 24s linear infinite; }
          .landing-shimmer { animation: landing-shimmer 4s ease-in-out infinite; }
          .landing-aurora { animation: landing-aurora 14s ease-in-out infinite; }
          .landing-spark { animation: landing-spark 5.5s ease-in-out infinite; }
          .landing-ring { animation: landing-ring 4.8s ease-in-out infinite; }
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
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_19%_16%,rgba(0,229,255,0.15),transparent_26%),radial-gradient(circle_at_72%_28%,rgba(139,92,246,0.2),transparent_34%),radial-gradient(circle_at_50%_86%,rgba(59,168,255,0.07),transparent_30%),linear-gradient(180deg,rgba(5,9,20,0.08),rgba(5,9,20,0.94))]" />
        <div className="pointer-events-none absolute inset-0 opacity-70 [background-image:linear-gradient(rgba(148,163,184,0.026)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.026)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_at_center,black_30%,rgba(0,0,0,0.72)_58%,transparent_88%)]" />
        <div className="landing-aurora pointer-events-none absolute left-[28%] top-12 h-56 w-[48rem] -translate-x-1/2 rotate-[-8deg] rounded-full bg-[linear-gradient(90deg,transparent,rgba(0,229,255,0.1),rgba(139,92,246,0.1),transparent)] blur-3xl" />
        <div className="landing-aurora pointer-events-none absolute right-[-5%] top-24 h-72 w-[44rem] rotate-[-14deg] rounded-full bg-[linear-gradient(90deg,transparent,rgba(59,168,255,0.09),rgba(255,61,254,0.08),transparent)] blur-3xl [animation-delay:-5s]" />
        <div className="pointer-events-none absolute left-[12%] top-24 h-80 w-80 rounded-full bg-[#00E5FF]/9 blur-3xl" />
        <div className="pointer-events-none absolute right-[16%] top-20 h-96 w-96 rounded-full bg-[#8B5CF6]/11 blur-3xl" />
        {[11, 23, 37, 49, 61, 74, 86].map((left, index) => (
          <span
            key={left}
            className="landing-spark pointer-events-none absolute h-1 w-1 rounded-full bg-cyan-100/70 shadow-[0_0_12px_rgba(0,229,255,0.65)]"
            style={{
              left: `${left}%`,
              top: `${18 + ((index * 11) % 43)}%`,
              animationDelay: `${index * -0.7}s`,
            }}
          />
        ))}

        <div className="relative mx-auto grid min-w-0 w-full max-w-[1410px] gap-8 px-5 pb-8 pt-10 sm:px-7 lg:grid-cols-[minmax(0,0.86fr)_minmax(580px,1.14fr)] lg:items-center lg:px-8 lg:pb-8 lg:pt-10">
          <div className="relative flex min-w-0 flex-col justify-center">
            <p className="inline-flex max-w-full rounded-full border border-purple-200/30 bg-purple-300/10 px-3 py-1.5 text-center text-[0.64rem] font-semibold uppercase tracking-[0.18em] text-purple-50 shadow-[0_0_26px_rgba(139,92,246,0.22),inset_0_1px_0_rgba(255,255,255,0.12)] sm:w-fit sm:px-4 sm:text-xs sm:tracking-[0.35em]">
              AI-Powered Career Intelligence
            </p>
            <h1 className="mt-5 max-w-[640px] text-[3.5rem] font-semibold leading-[0.91] tracking-tight text-white drop-shadow-[0_0_22px_rgba(255,255,255,0.08)] sm:text-7xl lg:text-[5.05rem]">
              Your career.
              <span className="block bg-gradient-to-r from-[#39C8FF] via-[#6A5CFF] to-[#FF3DFE] bg-clip-text text-transparent drop-shadow-[0_0_22px_rgba(0,229,255,0.14)]">
                Upgraded
                <span className="block text-white sm:inline"> by AI.</span>
              </span>
            </h1>
            <p className="mt-5 max-w-[560px] text-base leading-8 text-slate-300/95 sm:text-lg">
              From resume analysis to interview mastery, TalentForge AI gives you everything you need to stand out and get hired faster.
            </p>

            <div className="mt-7 grid gap-5 sm:grid-cols-3">
              {heroHighlights.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="relative border-l border-white/[0.07] pl-5 first:border-l-0 first:pl-0"
                  >
                    <span className="mb-4 grid h-10 w-10 place-items-center rounded-full border border-cyan-200/14 bg-white/[0.06] text-cyan-100 shadow-[0_0_22px_rgba(0,229,255,0.14),inset_0_1px_0_rgba(255,255,255,0.12)]">
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
                    className="group h-12 w-full max-w-sm rounded-[1.15rem] bg-[linear-gradient(100deg,#22D3EE_0%,#3BA8FF_32%,#7C3AED_72%,#A855F7_100%)] px-7 text-base font-semibold shadow-[0_0_42px_rgba(0,229,255,0.36),0_0_52px_rgba(139,92,246,0.28),inset_0_1px_0_rgba(255,255,255,0.22)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_54px_rgba(0,229,255,0.46),0_0_70px_rgba(139,92,246,0.34),inset_0_1px_0_rgba(255,255,255,0.28)] active:translate-y-0 sm:w-auto"
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
                  className="group h-12 w-full max-w-sm rounded-[1.15rem] bg-[linear-gradient(100deg,#22D3EE_0%,#3BA8FF_32%,#7C3AED_72%,#A855F7_100%)] px-7 text-base font-semibold shadow-[0_0_42px_rgba(0,229,255,0.36),0_0_52px_rgba(139,92,246,0.28),inset_0_1px_0_rgba(255,255,255,0.22)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_54px_rgba(0,229,255,0.46),0_0_70px_rgba(139,92,246,0.34),inset_0_1px_0_rgba(255,255,255,0.28)] active:translate-y-0 sm:w-auto"
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
                className="h-12 w-full max-w-sm rounded-[1.15rem] border-white/[0.11] bg-[#080D1D]/72 px-7 text-base text-white shadow-[0_0_26px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.07)] backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:border-cyan-200/26 hover:bg-cyan-300/[0.06] hover:shadow-[0_0_30px_rgba(0,229,255,0.12)] active:translate-y-0 sm:w-auto"
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
        className="relative mx-auto w-full max-w-[1410px] overflow-hidden border-t border-white/[0.06] px-5 py-8 sm:px-7 lg:px-8"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/18 to-transparent" />
        <div className="pointer-events-none absolute left-1/2 top-6 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(0,229,255,0.12),rgba(139,92,246,0.1)_42%,transparent_72%)] blur-3xl" />
        <div className="pointer-events-none absolute left-[10%] top-16 h-56 w-56 rounded-full bg-[#00E5FF]/8 blur-3xl" />
        <div className="pointer-events-none absolute right-[8%] top-14 h-64 w-64 rounded-full bg-[#8B5CF6]/10 blur-3xl" />

        <div className="relative mx-auto max-w-3xl text-center">
          <p className="mx-auto inline-flex rounded-full border border-cyan-200/28 bg-cyan-300/10 px-5 py-1.5 text-xs font-semibold uppercase tracking-[0.34em] text-cyan-100 shadow-[0_0_30px_rgba(0,229,255,0.2),inset_0_1px_0_rgba(255,255,255,0.12)]">
            All-In-One Career Intelligence Suite
          </p>
          <h2 className="mt-5 text-3xl font-semibold leading-tight tracking-tight text-white drop-shadow-[0_0_24px_rgba(255,255,255,0.08)] sm:text-4xl lg:text-[2.8rem]">
            Everything you need. In one{" "}
            <span className="bg-gradient-to-r from-[#39C8FF] via-[#6A5CFF] to-[#A855F7] bg-clip-text text-transparent drop-shadow-[0_0_18px_rgba(0,229,255,0.18)]">
              intelligent
            </span>{" "}
            platform.
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Powerful AI tools to analyze, optimize, and accelerate your career growth.
          </p>
        </div>

        <div className="relative mt-8 grid grid-cols-1 gap-4 min-[460px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-9">
          {moduleCards.map((module) => (
            <ModuleCardView key={module.title} module={module} />
          ))}
        </div>

        <div className="relative mt-9 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.36em] text-slate-500/80 sm:tracking-[0.5em]">
            Trusted by aspiring professionals from
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-xl font-semibold text-slate-400/80 sm:gap-x-11 sm:text-2xl">
            {trustedBrands.map((brand) => (
              <span
                key={brand}
                className="transition duration-300 hover:text-cyan-100 hover:drop-shadow-[0_0_16px_rgba(0,229,255,0.32)]"
              >
                {brand}
              </span>
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
      <div className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle_at_50%_42%,rgba(0,229,255,0.22),transparent_46%),radial-gradient(circle_at_60%_36%,rgba(139,92,246,0.2),transparent_42%),radial-gradient(circle_at_42%_62%,rgba(59,168,255,0.12),transparent_42%)] blur-2xl" />
      <div className="pointer-events-none absolute left-1/2 top-[45%] h-[360px] w-[640px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(0,229,255,0.16),rgba(139,92,246,0.12)_44%,transparent_72%)] blur-3xl" />
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

      <div className="absolute left-1/2 top-[45%] h-[460px] w-[720px] -translate-x-1/2 -translate-y-1/2 overflow-visible">
        <div className="pointer-events-none absolute left-1/2 top-[54%] h-36 w-[28rem] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(ellipse_at_center,rgba(0,229,255,0.26),rgba(139,92,246,0.18)_46%,transparent_74%)] blur-xl" />
        <div className="landing-ring pointer-events-none absolute left-1/2 top-[53%] h-56 w-[34rem] rounded-[50%] border border-cyan-200/12 shadow-[0_0_34px_rgba(0,229,255,0.24)]" />
        <div className="landing-ring pointer-events-none absolute left-1/2 top-[53%] h-40 w-[29rem] rounded-[50%] border border-purple-300/12 shadow-[0_0_34px_rgba(139,92,246,0.2)] [animation-delay:-2.4s]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,229,255,0.2),transparent_58%)] blur-2xl" />
        <Image
          src="/landing/talentforge-ai-core.png"
          alt=""
          width={1586}
          height={992}
          priority
          className="landing-shimmer relative h-full w-full object-contain drop-shadow-[0_0_52px_rgba(0,229,255,0.62)] [mask-image:radial-gradient(ellipse_at_center,black_38%,rgba(0,0,0,0.9)_55%,rgba(0,0,0,0.48)_68%,transparent_82%)]"
        />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_49%_38%,rgba(255,255,255,0.14),transparent_12%),radial-gradient(circle_at_49%_55%,rgba(0,229,255,0.12),transparent_22%),radial-gradient(circle_at_50%_70%,rgba(139,92,246,0.12),transparent_22%)] mix-blend-screen" />
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
    cyan: "border-cyan-300/38 shadow-[0_0_34px_rgba(0,229,255,0.22),0_18px_42px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.1)] hover:border-cyan-100/54 hover:shadow-[0_0_46px_rgba(0,229,255,0.3),0_22px_52px_rgba(0,0,0,0.34),inset_0_1px_0_rgba(255,255,255,0.14)]",
    emerald: "border-emerald-300/38 shadow-[0_0_34px_rgba(45,212,191,0.2),0_18px_42px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.1)] hover:border-emerald-100/54 hover:shadow-[0_0_46px_rgba(45,212,191,0.28),0_22px_52px_rgba(0,0,0,0.34),inset_0_1px_0_rgba(255,255,255,0.14)]",
    purple: "border-purple-300/38 shadow-[0_0_34px_rgba(139,92,246,0.22),0_18px_42px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.1)] hover:border-purple-100/54 hover:shadow-[0_0_46px_rgba(139,92,246,0.3),0_22px_52px_rgba(0,0,0,0.34),inset_0_1px_0_rgba(255,255,255,0.14)]",
  }[accent];

  return (
    <div className={`group relative w-40 overflow-hidden rounded-[1rem] border bg-[linear-gradient(145deg,rgba(8,16,38,0.88),rgba(8,13,31,0.68)_54%,rgba(14,26,56,0.78))] p-4 ring-1 ring-white/[0.045] backdrop-blur-2xl transition duration-300 hover:-translate-y-1 ${accentClass}`}>
      <span className="pointer-events-none absolute inset-x-3 top-0 h-px bg-gradient-to-r from-transparent via-white/36 to-transparent" />
      <span className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-cyan-300/12 blur-2xl transition duration-300 group-hover:bg-cyan-300/18" />
      <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.08),transparent_28%,rgba(255,255,255,0.035)_54%,transparent_78%)] opacity-70" />
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      <p className="mt-3 text-xs text-slate-500">{label}</p>
      <div className="mt-1 flex items-end justify-between">
        <p className="text-2xl font-semibold text-white">{value}</p>
        <span className="grid h-10 w-10 place-items-center rounded-full border border-cyan-300/30 bg-cyan-300/12 text-xs font-semibold text-cyan-100 shadow-[0_0_18px_rgba(0,229,255,0.22)]">
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
    <div className="group relative w-44 overflow-hidden rounded-[1rem] border border-purple-300/38 bg-[linear-gradient(145deg,rgba(13,15,36,0.88),rgba(9,12,31,0.68)_55%,rgba(35,20,70,0.74))] p-4 shadow-[0_0_34px_rgba(139,92,246,0.24),0_18px_42px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.1)] ring-1 ring-white/[0.045] backdrop-blur-2xl transition duration-300 hover:-translate-y-1 hover:border-purple-100/54 hover:shadow-[0_0_46px_rgba(139,92,246,0.32),0_22px_52px_rgba(0,0,0,0.34),inset_0_1px_0_rgba(255,255,255,0.14)]">
      <span className="pointer-events-none absolute inset-x-3 top-0 h-px bg-gradient-to-r from-transparent via-white/36 to-transparent" />
      <span className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-purple-300/12 blur-2xl transition duration-300 group-hover:bg-purple-300/18" />
      <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.08),transparent_28%,rgba(255,255,255,0.035)_54%,transparent_78%)] opacity-70" />
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
    <div className="group relative w-48 overflow-hidden rounded-[1rem] border border-cyan-300/38 bg-[linear-gradient(145deg,rgba(8,16,38,0.88),rgba(7,12,31,0.68)_55%,rgba(8,38,51,0.72))] p-4 shadow-[0_0_34px_rgba(0,229,255,0.23),0_18px_42px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.1)] ring-1 ring-white/[0.045] backdrop-blur-2xl transition duration-300 hover:-translate-y-1 hover:border-cyan-100/54 hover:shadow-[0_0_46px_rgba(0,229,255,0.3),0_22px_52px_rgba(0,0,0,0.34),inset_0_1px_0_rgba(255,255,255,0.14)]">
      <span className="pointer-events-none absolute inset-x-3 top-0 h-px bg-gradient-to-r from-transparent via-white/36 to-transparent" />
      <span className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-cyan-300/12 blur-2xl transition duration-300 group-hover:bg-cyan-300/18" />
      <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.08),transparent_28%,rgba(255,255,255,0.035)_54%,transparent_78%)] opacity-70" />
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
    <div className="group relative w-52 overflow-hidden rounded-[1rem] border border-cyan-300/38 bg-[linear-gradient(145deg,rgba(8,16,38,0.88),rgba(7,12,31,0.68)_55%,rgba(15,43,50,0.72))] p-4 shadow-[0_0_34px_rgba(0,229,255,0.23),0_18px_42px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.1)] ring-1 ring-white/[0.045] backdrop-blur-2xl transition duration-300 hover:-translate-y-1 hover:border-cyan-100/54 hover:shadow-[0_0_46px_rgba(0,229,255,0.3),0_22px_52px_rgba(0,0,0,0.34),inset_0_1px_0_rgba(255,255,255,0.14)]">
      <span className="pointer-events-none absolute inset-x-3 top-0 h-px bg-gradient-to-r from-transparent via-white/36 to-transparent" />
      <span className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-cyan-300/12 blur-2xl transition duration-300 group-hover:bg-cyan-300/18" />
      <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.08),transparent_28%,rgba(255,255,255,0.035)_54%,transparent_78%)] opacity-70" />
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
      className={`group relative min-h-[176px] overflow-hidden rounded-[1.25rem] border bg-[linear-gradient(180deg,rgba(13,25,55,0.82),rgba(5,10,27,0.88)_55%,rgba(3,7,20,0.95))] p-5 shadow-[0_0_34px_rgba(0,0,0,0.32),inset_0_1px_0_rgba(255,255,255,0.08)] ring-1 ring-white/[0.045] backdrop-blur-2xl transition duration-300 hover:-translate-y-1.5 hover:bg-white/[0.055] ${tone.border}`}
    >
      <span
        className={`absolute -left-12 -top-12 h-32 w-32 rounded-full opacity-70 blur-2xl transition duration-300 group-hover:opacity-100 ${tone.glow}`}
      />
      <span className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent" />
      <span className={`pointer-events-none absolute inset-x-6 bottom-0 h-px opacity-70 ${tone.beam}`} />
      <span className="pointer-events-none absolute right-3 top-3 h-1.5 w-1.5 rounded-full bg-white/55 shadow-[0_0_12px_rgba(255,255,255,0.6)]" />
      <span
        className={`relative grid h-14 w-14 place-items-center rounded-[1.15rem] border shadow-[0_0_28px_rgba(0,229,255,0.18),inset_0_1px_0_rgba(255,255,255,0.14)] transition duration-300 group-hover:scale-105 ${tone.icon}`}
      >
        <span className={`absolute inset-1 rounded-[0.95rem] blur-sm ${tone.iconGlow}`} />
        <Icon className="h-5 w-5" />
      </span>
      <h3 className="relative mt-5 text-base font-semibold leading-tight tracking-tight text-white">
        {module.title}
      </h3>
      <p className="relative mt-3 text-sm leading-6 text-slate-400">
        {module.description}
      </p>
    </article>
  );
}

function getModuleTone(tone: ModuleTone) {
  const tones = {
    cyan: {
      border: "border-cyan-300/26 hover:border-cyan-100/58 hover:shadow-[0_0_52px_rgba(0,229,255,0.24),inset_0_1px_0_rgba(255,255,255,0.12)]",
      icon: "border-cyan-200/36 bg-cyan-300/14 text-cyan-100",
      iconGlow: "bg-cyan-300/18",
      glow: "bg-cyan-300/26",
      beam: "bg-gradient-to-r from-transparent via-cyan-200/70 to-transparent",
    },
    blue: {
      border: "border-blue-300/26 hover:border-blue-100/58 hover:shadow-[0_0_52px_rgba(59,130,246,0.24),inset_0_1px_0_rgba(255,255,255,0.12)]",
      icon: "border-blue-200/36 bg-blue-300/14 text-blue-100",
      iconGlow: "bg-blue-300/18",
      glow: "bg-blue-300/26",
      beam: "bg-gradient-to-r from-transparent via-blue-200/70 to-transparent",
    },
    emerald: {
      border: "border-emerald-300/26 hover:border-emerald-100/58 hover:shadow-[0_0_52px_rgba(52,211,153,0.22),inset_0_1px_0_rgba(255,255,255,0.12)]",
      icon: "border-emerald-200/36 bg-emerald-300/14 text-emerald-100",
      iconGlow: "bg-emerald-300/18",
      glow: "bg-emerald-300/24",
      beam: "bg-gradient-to-r from-transparent via-emerald-200/70 to-transparent",
    },
    amber: {
      border: "border-amber-300/26 hover:border-amber-100/58 hover:shadow-[0_0_52px_rgba(245,158,11,0.22),inset_0_1px_0_rgba(255,255,255,0.12)]",
      icon: "border-amber-200/36 bg-amber-300/14 text-amber-100",
      iconGlow: "bg-amber-300/18",
      glow: "bg-amber-300/24",
      beam: "bg-gradient-to-r from-transparent via-amber-200/70 to-transparent",
    },
    purple: {
      border: "border-purple-300/26 hover:border-purple-100/58 hover:shadow-[0_0_52px_rgba(139,92,246,0.25),inset_0_1px_0_rgba(255,255,255,0.12)]",
      icon: "border-purple-200/36 bg-purple-300/14 text-purple-100",
      iconGlow: "bg-purple-300/18",
      glow: "bg-purple-300/26",
      beam: "bg-gradient-to-r from-transparent via-purple-200/70 to-transparent",
    },
  };

  return tones[tone];
}
