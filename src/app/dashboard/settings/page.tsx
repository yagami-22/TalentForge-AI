import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import {
  Bell,
  Bot,
  KeyRound,
  LayoutDashboard,
  LockKeyhole,
  UserRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import {
  PreferenceSelect,
  SettingToggle,
  SignOutAction,
} from "@/app/dashboard/settings/settings-controls";
import { Button } from "@/components/ui/button";
import { getCurrentDbUser } from "@/lib/current-user";
import { forge } from "@/lib/talentforge-design";

export const runtime = "nodejs";

const notifications = [
  {
    label: "Interview reminders",
    storageKey: "talentforge.settings.notifications.interview-reminders",
    defaultChecked: true,
  },
  {
    label: "Job alerts",
    storageKey: "talentforge.settings.notifications.job-alerts",
    defaultChecked: false,
  },
  {
    label: "Weekly insights",
    storageKey: "talentforge.settings.notifications.weekly-insights",
    defaultChecked: true,
  },
  {
    label: "Product updates",
    storageKey: "talentforge.settings.notifications.product-updates",
    defaultChecked: false,
  },
];

export default async function DashboardSettingsPage() {
  const user = await getCurrentDbUser();

  if (!user.role) {
    redirect("/onboarding");
  }

  const profile = {
    name: user.name ?? "TalentForge User",
    email: user.email,
    plan: "Starter",
    imageUrl: user.imageUrl,
  };

  return (
    <main className={forge.page}>
      <div className="relative mx-auto w-full max-w-[860px] space-y-6 py-2">
        <header className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-500">TalentForge AI</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Settings
            </h1>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Button asChild variant="outline" size="sm" className={forge.secondaryButton}>
              <Link href="/dashboard">
                <LayoutDashboard className="h-3.5 w-3.5" />
                Dashboard
              </Link>
            </Button>
            <SignOutAction />
          </div>
        </header>

        <section className="relative overflow-hidden rounded-[1.65rem] border border-white/[0.08] bg-[linear-gradient(145deg,rgba(7,16,36,0.82),rgba(13,20,38,0.58)_56%,rgba(5,10,22,0.78))] shadow-[0_22px_80px_rgba(0,0,0,0.26),0_0_32px_rgba(0,229,255,0.035),inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-2xl">
          <SettingsGroup title="Profile" icon={UserRound}>
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-4">
                <Avatar name={profile.name} imageUrl={profile.imageUrl} />
                <div className="min-w-0">
                  <h2 className="truncate text-lg font-semibold text-white">{profile.name}</h2>
                  <p className="mt-1 truncate text-sm text-slate-400">{profile.email}</p>
                  <p className="mt-2 text-sm font-medium text-cyan-100">{profile.plan}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button asChild variant="outline" size="sm" className={forge.secondaryButton}>
                  <Link href="/dashboard/settings/account">Edit Profile</Link>
                </Button>
                <Button asChild variant="outline" size="sm" className={forge.secondaryButton}>
                  <Link href="/dashboard/settings/account#/security">Manage Account</Link>
                </Button>
              </div>
            </div>
          </SettingsGroup>

          <SettingsGroup title="Security" icon={LockKeyhole}>
            <div className="divide-y divide-white/[0.065]">
              <SimpleRow label="Password" value="Managed" />
              <SimpleRow label="Two-factor Authentication" value="Available" />
              <SimpleRow label="Active Sessions" value="Current device" />
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button asChild variant="outline" size="sm" className={forge.secondaryButton}>
                <Link href="/dashboard/settings/account#/security">
                  <KeyRound className="h-3.5 w-3.5" />
                  Change Password
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm" className={forge.secondaryButton}>
                <Link href="/dashboard/settings/account#/security">Manage Sessions</Link>
              </Button>
            </div>
          </SettingsGroup>

          <SettingsGroup title="Notifications" icon={Bell}>
            <div className="divide-y divide-white/[0.065]">
              {notifications.map((item) => (
                <SettingToggle key={item.label} {...item} />
              ))}
            </div>
          </SettingsGroup>

          <SettingsGroup title="AI Preferences" icon={Bot} last>
            <div className="divide-y divide-white/[0.065]">
              <PreferenceSelect
                label="Resume Style"
                storageKey="talentforge.settings.ai.resume-style"
                defaultValue="impact-focused"
                options={[
                  { label: "Impact-focused", value: "impact-focused" },
                  { label: "Concise", value: "concise" },
                  { label: "Technical", value: "technical" },
                ]}
              />
              <PreferenceSelect
                label="Interview Difficulty"
                storageKey="talentforge.settings.ai.interview-difficulty"
                defaultValue="adaptive"
                options={[
                  { label: "Adaptive", value: "adaptive" },
                  { label: "Beginner", value: "beginner" },
                  { label: "Advanced", value: "advanced" },
                ]}
              />
              <SettingToggle
                label="Auto ATS Suggestions"
                storageKey="talentforge.settings.ai.auto-ats-suggestions"
                defaultChecked
              />
            </div>
          </SettingsGroup>
        </section>
      </div>
    </main>
  );
}

function SettingsGroup({
  title,
  icon: Icon,
  children,
  last = false,
}: {
  title: string;
  icon: LucideIcon;
  children: ReactNode;
  last?: boolean;
}) {
  return (
    <section className={`px-5 py-5 sm:px-6 ${last ? "" : "border-b border-white/[0.07]"}`}>
      <div className="mb-4 flex items-center gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-2xl border border-cyan-300/16 bg-cyan-300/8 text-cyan-100">
          <Icon className="h-4 w-4" />
        </span>
        <h2 className="text-lg font-semibold tracking-tight text-white">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function SimpleRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-h-11 items-center justify-between gap-4 px-1 py-2 sm:px-2">
      <p className="text-sm font-semibold text-white">{label}</p>
      <p className="shrink-0 text-sm text-slate-400">{value}</p>
    </div>
  );
}

function Avatar({ name, imageUrl }: { name: string; imageUrl: string | null }) {
  const initial = name.trim().charAt(0).toUpperCase() || "T";

  return (
    <span className="relative grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-[1.25rem] border border-cyan-200/16 bg-gradient-to-br from-[#00E5FF]/24 via-[#6A5CFF]/18 to-[#8B5CF6]/22 text-xl font-bold text-white shadow-[0_0_24px_rgba(0,229,255,0.14),inset_0_1px_0_rgba(255,255,255,0.1)]">
      {imageUrl ? (
        <span
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${imageUrl})` }}
        />
      ) : null}
      <span className={imageUrl ? "sr-only" : "relative"}>{initial}</span>
    </span>
  );
}
