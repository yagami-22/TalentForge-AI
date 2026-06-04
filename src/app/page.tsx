import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const features = [
  {
    title: "Resume ATS Analysis",
    description:
      "Score your resume against hiring systems and surface the exact gaps recruiters miss.",
    metric: "92%",
  },
  {
    title: "Job Match Analysis",
    description:
      "Compare any role to your profile with skill gaps, keyword overlap, and fit signals.",
    metric: "4.8x",
  },
  {
    title: "AI Mock Interviews",
    description:
      "Practice role-specific interviews with adaptive follow-ups and instant coaching notes.",
    metric: "24/7",
  },
  {
    title: "Career Roadmap Generator",
    description:
      "Turn target roles into a clear plan with projects, milestones, and weekly priorities.",
    metric: "30d",
  },
];

const stats = [
  ["18K+", "career plans generated"],
  ["76%", "average resume score lift"],
  ["3.2M", "job signals analyzed"],
  ["9/10", "users feel interview-ready"],
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#05070d] text-white">
      <section className="relative isolate border-b border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.28),transparent_34%),linear-gradient(135deg,#06111f_0%,#071018_44%,#04130f_100%)]">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:linear-gradient(to_bottom,black,transparent_82%)]" />

        <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            TalentForge AI
          </Link>
          <div className="hidden items-center gap-8 text-sm text-zinc-300 md:flex">
            <a href="#features" className="transition hover:text-white">
              Features
            </a>
            <a href="#pricing" className="transition hover:text-white">
              Pricing
            </a>
          </div>
          <div className="flex items-center gap-3">
            <Show when="signed-out">
              <SignInButton fallbackRedirectUrl="/dashboard">
                <Button
                  variant="outline"
                  className="border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white"
                >
                  Sign In
                </Button>
              </SignInButton>
              <SignUpButton fallbackRedirectUrl="/dashboard">
                <Button className="hidden bg-cyan-300 text-slate-950 hover:bg-cyan-200 sm:inline-flex">
                  Sign Up
                </Button>
              </SignUpButton>
            </Show>
            <Show when="signed-in">
              <Button
                asChild
                variant="outline"
                className="border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white"
              >
                <Link href="/dashboard" prefetch={false}>
                  Dashboard
                </Link>
              </Button>
              <UserButton />
            </Show>
          </div>
        </nav>

        <div className="mx-auto grid w-full max-w-7xl gap-12 px-6 pb-24 pt-16 lg:grid-cols-[1.02fr_0.98fr] lg:px-8 lg:pb-32 lg:pt-24">
          <div className="flex flex-col justify-center">
            <p className="mb-5 inline-flex w-fit rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-sm font-medium text-cyan-100">
              Analyze. Prepare. Get Hired.
            </p>
            <h1 className="max-w-4xl text-5xl font-semibold leading-[1.04] tracking-tight text-white sm:text-6xl lg:text-7xl">
              Turn every application into a smarter career move.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-300 sm:text-xl">
              AI-powered platform that analyzes resumes, matches job
              descriptions, conducts mock interviews, and generates personalized
              career roadmaps.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Show when="signed-out">
                <SignUpButton fallbackRedirectUrl="/dashboard">
                  <Button
                    size="lg"
                    className="h-12 bg-cyan-300 px-6 text-base font-semibold text-slate-950 hover:bg-cyan-200"
                  >
                    Start Free Analysis
                  </Button>
                </SignUpButton>
              </Show>
              <Show when="signed-in">
                <Button
                  asChild
                  size="lg"
                  className="h-12 bg-cyan-300 px-6 text-base font-semibold text-slate-950 hover:bg-cyan-200"
                >
                  <Link href="/dashboard" prefetch={false}>
                    Open Dashboard
                  </Link>
                </Button>
              </Show>
              <Button
                size="lg"
                variant="outline"
                className="h-12 border-white/15 bg-white/5 px-6 text-base text-white hover:bg-white/10 hover:text-white"
              >
                View Demo
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-4 shadow-2xl shadow-cyan-950/40 backdrop-blur">
              <div className="rounded-3xl border border-white/10 bg-[#08111e] p-5">
                <div className="mb-5 flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <p className="text-sm text-zinc-400">Candidate Fit</p>
                    <p className="text-2xl font-semibold text-white">94%</p>
                  </div>
                  <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-sm font-medium text-emerald-200">
                    Interview-ready
                  </span>
                </div>
                <div className="space-y-4">
                  {["Resume ATS", "Job Match", "Interview Prep"].map(
                    (label, index) => (
                      <div key={label}>
                        <div className="mb-2 flex items-center justify-between text-sm">
                          <span className="text-zinc-300">{label}</span>
                          <span className="text-zinc-500">
                            {[96, 88, 91][index]}%
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-white/10">
                          <div
                            className="h-2 rounded-full bg-gradient-to-r from-cyan-300 to-emerald-300"
                            style={{ width: `${[96, 88, 91][index]}%` }}
                          />
                        </div>
                      </div>
                    )
                  )}
                </div>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-white/[0.06] p-4">
                    <p className="text-sm text-zinc-400">Top gap</p>
                    <p className="mt-1 font-medium text-white">
                      System design examples
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white/[0.06] p-4">
                    <p className="text-sm text-zinc-400">Next action</p>
                    <p className="mt-1 font-medium text-white">
                      Practice 3 prompts
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="features"
        className="mx-auto w-full max-w-7xl px-6 py-20 lg:px-8"
      >
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase text-cyan-200">
            Platform
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Everything you need before the recruiter call.
          </h2>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="border-white/10 bg-white/[0.055] text-white ring-white/10"
            >
              <CardHeader>
                <div className="mb-4 text-3xl font-semibold text-cyan-200">
                  {feature.metric}
                </div>
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription className="leading-6 text-zinc-400">
                  {feature.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[0.035]">
        <div className="mx-auto grid w-full max-w-7xl gap-6 px-6 py-14 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
          {stats.map(([value, label]) => (
            <div key={label}>
              <p className="text-4xl font-semibold tracking-tight text-white">
                {value}
              </p>
              <p className="mt-2 text-sm text-zinc-400">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section
        id="pricing"
        className="mx-auto w-full max-w-7xl px-6 py-20 lg:px-8"
      >
        <Card className="border-cyan-300/20 bg-gradient-to-br from-cyan-300/15 via-white/[0.06] to-emerald-300/10 p-4 text-white ring-cyan-300/20 md:p-8">
          <CardContent className="flex flex-col items-start justify-between gap-8 p-0 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-semibold uppercase text-cyan-100">
                Ready when you are
              </p>
              <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
                Build the proof, practice the pitch, and walk in prepared.
              </h2>
            </div>
            <Show when="signed-out">
              <SignUpButton fallbackRedirectUrl="/dashboard">
                <Button
                  size="lg"
                  className="h-12 bg-white px-6 text-base font-semibold text-slate-950 hover:bg-cyan-100"
                >
                  Get Started
                </Button>
              </SignUpButton>
            </Show>
            <Show when="signed-in">
              <Button
                asChild
                size="lg"
                className="h-12 bg-white px-6 text-base font-semibold text-slate-950 hover:bg-cyan-100"
              >
                <Link href="/dashboard" prefetch={false}>
                  Go to Dashboard
                </Link>
              </Button>
            </Show>
          </CardContent>
        </Card>
      </section>

      <footer className="border-t border-white/10 px-6 py-8 text-sm text-zinc-500 lg:px-8">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-medium text-zinc-300">TalentForge AI</p>
          <p>Analyze. Prepare. Get Hired.</p>
        </div>
      </footer>
    </main>
  );
}
