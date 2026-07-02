import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Bell,
  LockKeyhole,
  Palette,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { getCurrentDbUser } from "@/lib/current-user";
import { forge } from "@/lib/talentforge-design";

export const runtime = "nodejs";

const settingsSections = [
  {
    title: "Profile",
    description: "Your TalentForge identity is synced securely from your authenticated account.",
    icon: UserRound,
    items: ["Account identity", "Career role", "Workspace access"],
  },
  {
    title: "Security",
    description: "Authentication, sessions, and account security remain managed by Clerk.",
    icon: ShieldCheck,
    items: ["Secure sessions", "Protected routes", "Account controls"],
  },
  {
    title: "Notifications",
    description: "Readiness alerts and career progress nudges will appear here as the workspace grows.",
    icon: Bell,
    items: ["Roadmap reminders", "Report updates", "Interview prompts"],
  },
  {
    title: "Experience",
    description: "The dashboard uses the unified premium TalentForge dark neon interface.",
    icon: Palette,
    items: ["Unified theme", "Accessible focus states", "Responsive layout"],
  },
];

export default async function DashboardSettingsPage() {
  const user = await getCurrentDbUser();

  if (!user.role) {
    redirect("/onboarding");
  }

  return (
    <main className={forge.page}>
      <div className={forge.topNav}>
        <Link href="/" className="text-lg font-semibold tracking-tight">
          TalentForge AI
        </Link>
        <Button asChild variant="outline" className={forge.secondaryButton}>
          <Link href="/dashboard">Dashboard</Link>
        </Button>
      </div>

      <section className="relative overflow-hidden rounded-[2rem] border border-white/[0.08] bg-[linear-gradient(135deg,rgba(0,229,255,0.12),rgba(106,92,255,0.09)_48%,rgba(139,92,246,0.12))] p-6 shadow-[0_0_38px_rgba(0,229,255,0.11),0_0_54px_rgba(106,92,255,0.1)] backdrop-blur-2xl sm:p-7">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#00E5FF]/14 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 left-20 h-64 w-64 rounded-full bg-[#8B5CF6]/14 blur-3xl" />
        <div className="relative max-w-3xl">
          <p className={forge.badge}>Settings</p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Workspace preferences.
          </h1>
          <p className="mt-3 text-sm leading-6 text-zinc-300 sm:text-base">
            Manage the account, security, and product experience surfaces connected to your TalentForge AI workspace.
          </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {settingsSections.map((section) => {
          const Icon = section.icon;

          return (
            <article
              key={section.title}
              className="rounded-[1.5rem] border border-white/[0.08] bg-white/[0.04] p-5 shadow-[0_0_26px_rgba(0,229,255,0.06)] backdrop-blur-2xl"
            >
              <div className="flex items-start gap-4">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-cyan-300/20 bg-[#00E5FF]/10 text-cyan-100 shadow-[0_0_22px_rgba(0,229,255,0.14)]">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-lg font-semibold text-white">{section.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">
                    {section.description}
                  </p>
                </div>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {section.items.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-white/[0.08] bg-[#070B1F]/70 px-3 py-1.5 text-xs text-zinc-300"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </article>
          );
        })}
      </section>

      <section className="rounded-[1.5rem] border border-white/[0.08] bg-[#070B1F]/58 p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-purple-300/20 bg-purple-300/10 text-purple-100">
              <LockKeyhole className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-base font-semibold text-white">Authentication settings</h2>
              <p className="mt-1 text-sm leading-6 text-zinc-400">
                Sign-in methods, password changes, and connected accounts are handled through the secure account menu.
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1.5 text-xs font-medium text-emerald-100">
            <Sparkles className="h-3.5 w-3.5" />
            Protected
          </span>
        </div>
      </section>
    </main>
  );
}
