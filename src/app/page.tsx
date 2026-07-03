import { Show, SignUpButton, UserButton } from "@clerk/nextjs";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  CirclePlay,
  ShieldCheck,
  Sparkles,
  Star,
  Zap,
} from "lucide-react";
import Link from "next/link";

import { PremiumBackground } from "@/components/premium-background";
import { Button } from "@/components/ui/button";

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

export default function Home() {
  return (
    <PremiumBackground contentClassName="mx-auto min-h-screen w-full max-w-[1560px] overflow-x-hidden">
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
        className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#050914]/82 backdrop-blur-2xl"
      >
        <div className="mx-auto flex w-full max-w-[1360px] items-center justify-between gap-4 px-5 py-4 sm:px-6 lg:px-8">
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
            <a href="#pricing" className="transition hover:text-cyan-50">
              Pricing
            </a>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <Button
              asChild
              variant="outline"
              className="hidden h-10 rounded-xl border-white/[0.08] bg-[#080D1D]/70 px-4 text-sm font-semibold text-white shadow-[0_0_22px_rgba(139,92,246,0.1)] md:inline-flex"
            >
              <a href="#pricing">
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
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(0,229,255,0.14),transparent_24%),radial-gradient(circle_at_74%_34%,rgba(139,92,246,0.18),transparent_30%),linear-gradient(180deg,rgba(5,9,20,0.12),rgba(5,9,20,0.86))]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.04)_1px,transparent_1px)] bg-[size:56px_56px]" />
        <div className="pointer-events-none absolute left-[12%] top-24 h-80 w-80 rounded-full bg-[#00E5FF]/8 blur-3xl" />
        <div className="pointer-events-none absolute right-[16%] top-20 h-96 w-96 rounded-full bg-[#8B5CF6]/10 blur-3xl" />

        <div className="relative mx-auto grid min-w-0 w-full max-w-[1360px] gap-10 px-5 pb-12 pt-10 sm:px-6 lg:grid-cols-[minmax(0,0.88fr)_minmax(560px,1.12fr)] lg:px-8 lg:pb-14 lg:pt-12">
          <div className="relative flex min-w-0 flex-col justify-center">
            <p className="inline-flex max-w-full rounded-full border border-purple-300/24 bg-purple-300/10 px-3 py-1.5 text-center text-[0.64rem] font-semibold uppercase tracking-[0.18em] text-purple-100 shadow-[0_0_24px_rgba(139,92,246,0.18)] sm:w-fit sm:px-4 sm:text-xs sm:tracking-[0.35em]">
              AI-Powered Career Intelligence
            </p>
            <h1 className="mt-6 max-w-[620px] text-[3.1rem] font-semibold leading-[0.95] tracking-tight text-white sm:text-6xl lg:text-[4.7rem]">
              Your career.
              <span className="block bg-gradient-to-r from-[#39C8FF] via-[#6A5CFF] to-[#FF3DFE] bg-clip-text text-transparent">
                Upgraded
                <span className="block text-white sm:inline"> by AI.</span>
              </span>
            </h1>
            <p className="mt-6 max-w-[560px] text-base leading-8 text-slate-300 sm:text-lg">
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
                <a href="#pricing">
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

      <section id="pricing" className="mx-auto w-full max-w-[1360px] px-5 py-12 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[2rem] border border-[rgba(255,255,255,0.08)] bg-[linear-gradient(135deg,rgba(0,229,255,0.16),rgba(106,92,255,0.12)_50%,rgba(139,92,246,0.18))] p-6 shadow-[0_0_40px_rgba(0,229,255,0.14),0_0_70px_rgba(106,92,255,0.16)] backdrop-blur-2xl sm:p-8 lg:p-10">
          <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-[#00E5FF]/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 left-10 h-72 w-72 rounded-full bg-[#8B5CF6]/18 blur-3xl" />
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
                  Start Your Free Journey
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
        <div className="mx-auto flex w-full max-w-[1360px] flex-col gap-6 rounded-[1.75rem] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] p-5 shadow-[0_0_40px_rgba(0,229,255,0.08),0_0_60px_rgba(106,92,255,0.08)] backdrop-blur-xl md:flex-row md:items-center md:justify-between">
          <Link href="/" className="flex items-center gap-3">
            <TFMark size="sm" />
            <span>
              <span className="block font-semibold tracking-tight text-white">
                TalentForge AI
              </span>
              <span className="text-xs text-slate-500">Career Intelligence Platform</span>
            </span>
          </Link>
          <div className="flex flex-wrap gap-4">
            <a href="#pricing" className="transition hover:text-cyan-50">
              Get Started
            </a>
          </div>
        </div>
      </footer>
    </PremiumBackground>
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
    <div className="relative hidden min-h-[560px] lg:block" aria-label="TalentForge AI career intelligence preview">
      <div className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(0,229,255,0.12),transparent_60%)] blur-2xl" />
      <div className="landing-float absolute left-[20%] top-[8%] z-30">
        <FloatingMetric title="Resume Analysis" label="ATS Score" value="86%" delta="+18%" accent="cyan" />
      </div>
      <div className="landing-float-slow absolute left-[12%] top-[42%] z-30">
        <FloatingMetric title="JD Match" label="Match Score" value="92%" delta="+21%" accent="emerald" />
      </div>
      <div className="landing-float absolute right-[3%] top-[10%] z-30">
        <FloatingMetric title="Interview Prep" label="Mock Interviews" value="31K+" delta="Completed" accent="purple" />
      </div>
      <div className="landing-float-slow absolute right-[-2%] top-[36%] z-30">
        <FloatingStars />
      </div>
      <div className="landing-float absolute bottom-[8%] left-[40%] z-30">
        <FloatingChecklist />
      </div>
      <div className="landing-float-slow absolute bottom-[8%] right-[6%] z-30">
        <FloatingChart />
      </div>

      <div className="absolute left-1/2 top-[45%] h-[360px] w-[520px] -translate-x-1/2 -translate-y-1/2">
        <div className="landing-orbit absolute left-1/2 top-1/2 h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-300/16" />
        <div className="absolute left-1/2 top-1/2 h-[270px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-purple-300/18" />
        <div className="absolute left-1/2 top-1/2 h-[220px] w-[430px] -translate-x-1/2 -translate-y-1/2 rotate-12 rounded-[50%] border border-cyan-300/16" />
        <div className="absolute left-1/2 top-1/2 h-[220px] w-[430px] -translate-x-1/2 -translate-y-1/2 -rotate-12 rounded-[50%] border border-[#FF3DFE]/14" />
        <div className="absolute left-1/2 top-[54%] h-40 w-[360px] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(ellipse_at_center,rgba(0,229,255,0.22),rgba(139,92,246,0.22)_48%,transparent_74%)] blur-sm" />

        {[0, 1, 2, 3, 4, 5].map((item) => (
          <span
            key={item}
            className="landing-pulse absolute h-2 w-2 rounded-full bg-cyan-100 shadow-[0_0_14px_rgba(0,229,255,0.95)]"
            style={{
              left: `${14 + item * 14}%`,
              top: `${26 + ((item * 23) % 42)}%`,
              animationDelay: `${item * 0.28}s`,
            }}
          />
        ))}

        <div className="absolute left-1/2 top-[49%] z-10 h-[185px] w-[320px] -translate-x-1/2 -translate-y-1/2 rounded-[2.2rem] border border-cyan-200/22 bg-[linear-gradient(145deg,rgba(14,30,62,0.62),rgba(58,54,150,0.4),rgba(0,229,255,0.18))] shadow-[0_0_44px_rgba(0,229,255,0.34),0_0_70px_rgba(139,92,246,0.3),inset_0_1px_0_rgba(255,255,255,0.18)] [transform:perspective(900px)_rotateX(58deg)_rotateZ(45deg)]" />
        <div className="absolute left-1/2 top-[54%] z-10 h-[185px] w-[320px] -translate-x-1/2 -translate-y-1/2 rounded-[2.2rem] border border-purple-200/22 bg-[linear-gradient(145deg,rgba(20,25,66,0.62),rgba(106,92,255,0.34),rgba(255,61,254,0.15))] shadow-[0_0_40px_rgba(139,92,246,0.35)] [transform:perspective(900px)_rotateX(58deg)_rotateZ(45deg)]" />
        <div className="absolute left-1/2 top-[59%] z-10 h-[185px] w-[320px] -translate-x-1/2 -translate-y-1/2 rounded-[2.2rem] border border-purple-300/18 bg-[linear-gradient(145deg,rgba(7,12,32,0.7),rgba(75,51,164,0.34),rgba(0,229,255,0.1))] shadow-[0_0_46px_rgba(106,92,255,0.35)] [transform:perspective(900px)_rotateX(58deg)_rotateZ(45deg)]" />

        <div className="landing-shimmer absolute left-[52%] top-[35%] z-20 grid h-52 w-52 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-cyan-200/32 bg-[radial-gradient(circle_at_38%_28%,rgba(255,255,255,0.5),rgba(59,168,255,0.36)_24%,rgba(106,92,255,0.42)_56%,rgba(7,11,28,0.94))] shadow-[0_0_48px_rgba(0,229,255,0.62),0_0_92px_rgba(139,92,246,0.5),inset_0_0_46px_rgba(255,255,255,0.18)]">
          <span className="absolute inset-5 rounded-full border border-cyan-100/12" />
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
