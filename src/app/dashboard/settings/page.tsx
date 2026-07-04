import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import {
  Bell,
  Bot,
  CreditCard,
  KeyRound,
  LayoutDashboard,
  LockKeyhole,
  Palette,
  ShieldAlert,
  UserRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { ConfirmActionButton, SettingToggle } from "@/app/dashboard/settings/settings-controls";
import { Button } from "@/components/ui/button";
import { getCurrentDbUser } from "@/lib/current-user";
import { forge } from "@/lib/talentforge-design";

export const runtime = "nodejs";

const notifications = [
  { label: "Interview reminders", defaultChecked: true },
  { label: "Job alerts", defaultChecked: false },
  { label: "Weekly insights", defaultChecked: true },
  { label: "Product updates", defaultChecked: false },
];

const appearance = [
  { label: "Theme", defaultChecked: true, disabled: true },
  { label: "Animations", defaultChecked: true },
  { label: "Reduced Motion", defaultChecked: false },
  { label: "Compact Mode", defaultChecked: false },
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
      <div className="relative mx-auto w-full max-w-[1040px] space-y-8">
        <header className="flex items-center justify-between gap-4 py-2">
          <div>
            <p className="text-sm font-medium text-slate-500">TalentForge AI</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Settings
            </h1>
          </div>
          <Button asChild variant="outline" size="sm" className={forge.secondaryButton}>
            <Link href="/dashboard">
              <LayoutDashboard className="h-3.5 w-3.5" />
              Dashboard
            </Link>
          </Button>
        </header>

        <Section title="Profile" icon={UserRound}>
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <Avatar name={profile.name} imageUrl={profile.imageUrl} />
              <div className="min-w-0">
                <h2 className="truncate text-xl font-semibold text-white">{profile.name}</h2>
                <p className="mt-1 truncate text-sm text-slate-400">{profile.email}</p>
                <p className="mt-3 text-sm font-medium text-cyan-100">{profile.plan}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" className={forge.secondaryButton}>
                Edit Profile
              </Button>
              <Button variant="outline" size="sm" className={forge.secondaryButton}>
                Manage Account
              </Button>
            </div>
          </div>
        </Section>

        <div className="grid gap-6 lg:grid-cols-2">
          <Section title="Security" icon={LockKeyhole}>
            <div className="divide-y divide-white/[0.07]">
              <SimpleRow label="Password" value="Managed" />
              <SimpleRow label="Two-factor Authentication" value="Available" />
              <SimpleRow label="Active Sessions" value="Current device" />
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button variant="outline" size="sm" className={forge.secondaryButton}>
                <KeyRound className="h-3.5 w-3.5" />
                Change Password
              </Button>
              <Button variant="outline" size="sm" className={forge.secondaryButton}>
                Manage Sessions
              </Button>
            </div>
          </Section>

          <Section title="Notifications" icon={Bell}>
            <div className="divide-y divide-white/[0.07]">
              {notifications.map((item) => (
                <SettingToggle key={item.label} {...item} />
              ))}
            </div>
          </Section>

          <Section title="Appearance" icon={Palette}>
            <div className="divide-y divide-white/[0.07]">
              {appearance.map((item) => (
                <SettingToggle key={item.label} {...item} />
              ))}
            </div>
          </Section>

          <Section title="AI Preferences" icon={Bot}>
            <div className="divide-y divide-white/[0.07]">
              <SimpleRow label="Resume Style" value="Impact-focused" />
              <SimpleRow label="Interview Difficulty" value="Adaptive" />
              <SettingToggle label="Auto ATS Suggestions" defaultChecked />
            </div>
          </Section>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.8fr)]">
          <Section title="Billing" icon={CreditCard}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-slate-500">Current Plan</p>
                <p className="mt-1 text-xl font-semibold text-white">{profile.plan}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm">Upgrade</Button>
                <Button variant="outline" size="sm" className={forge.secondaryButton}>
                  Manage Billing
                </Button>
              </div>
            </div>
          </Section>

          <section className="relative overflow-hidden rounded-[1.5rem] border border-red-300/18 bg-[linear-gradient(145deg,rgba(38,9,18,0.44),rgba(8,13,29,0.76))] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.2),0_0_24px_rgba(248,113,113,0.045)] backdrop-blur-2xl">
            <div className="mb-4 flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-2xl border border-red-300/20 bg-red-400/10 text-red-100">
                <ShieldAlert className="h-4 w-4" />
              </span>
              <h2 className="text-xl font-semibold tracking-tight text-white">Danger Zone</h2>
            </div>
            <div className="space-y-3">
              <DangerRow
                label="Delete Account"
                confirmation="Delete your account? This action cannot be undone once account deletion is enabled."
              />
              <DangerRow
                label="Delete Uploaded Resumes"
                confirmation="Delete uploaded resumes? This action cannot be undone once resume deletion is enabled."
              />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: LucideIcon;
  children: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden rounded-[1.5rem] border border-white/[0.075] bg-[linear-gradient(145deg,rgba(7,16,36,0.76),rgba(16,24,39,0.5)_55%,rgba(5,10,22,0.7))] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.2),0_0_24px_rgba(0,229,255,0.035),inset_0_1px_0_rgba(255,255,255,0.045)] backdrop-blur-2xl">
      <div className="mb-4 flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-2xl border border-cyan-300/16 bg-cyan-300/8 text-cyan-100">
          <Icon className="h-4 w-4" />
        </span>
        <h2 className="text-xl font-semibold tracking-tight text-white">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function SimpleRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-h-12 items-center justify-between gap-4 px-1 py-2 sm:px-2">
      <p className="text-sm font-semibold text-white">{label}</p>
      <p className="shrink-0 text-sm text-slate-400">{value}</p>
    </div>
  );
}

function DangerRow({
  label,
  confirmation,
}: {
  label: string;
  confirmation: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-[1rem] px-1 py-2 transition duration-300 hover:bg-red-400/[0.045] sm:px-2">
      <p className="text-sm font-semibold text-white">{label}</p>
      <ConfirmActionButton label="Delete" confirmation={confirmation} tone="danger" />
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
