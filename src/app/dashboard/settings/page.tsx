import { SignOutButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import {
  Activity,
  Bell,
  BookOpen,
  Bot,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronRight,
  Clock3,
  CreditCard,
  Database,
  Download,
  Eye,
  FileText,
  GitBranch,
  Globe2,
  KeyRound,
  Laptop,
  LayoutDashboard,
  LifeBuoy,
  Link2,
  LockKeyhole,
  LogOut,
  Mail,
  Monitor,
  Palette,
  ShieldAlert,
  ShieldCheck,
  UserCog,
  UserRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { ConfirmActionButton, SettingToggle } from "@/app/dashboard/settings/settings-controls";
import { Button } from "@/components/ui/button";
import { getCurrentDbUser } from "@/lib/current-user";
import { forge } from "@/lib/talentforge-design";

export const runtime = "nodejs";

type BadgeTone = "cyan" | "emerald" | "purple" | "amber" | "red" | "slate";

type DetailItem = {
  label: string;
  value: string;
  helper?: string;
  badge?: string;
  tone?: BadgeTone;
};

type ProviderStatus = {
  name: string;
  status: "Connected" | "Not Connected" | "Coming Soon";
  helper: string;
  icon: LucideIcon;
};

const notificationSettings = [
  {
    label: "Interview reminders",
    description: "Nudge me before mock interviews and practice sessions.",
    defaultChecked: true,
  },
  {
    label: "Weekly insights",
    description: "Send a weekly summary of readiness, resume health, and next actions.",
    defaultChecked: true,
  },
  {
    label: "Resume analysis completed",
    description: "Notify me when resume scoring or optimization results are ready.",
    defaultChecked: true,
  },
  {
    label: "Job match alerts",
    description: "Surface high-fit job description matches and role gaps.",
    defaultChecked: false,
  },
  {
    label: "Product updates",
    description: "Occasional updates about new TalentForge AI capabilities.",
    defaultChecked: false,
  },
  {
    label: "Email notifications",
    description: "Use my authenticated email for important workspace notifications.",
    defaultChecked: true,
  },
  {
    label: "Browser notifications",
    description: "Real-time browser notifications will be available after permission setup.",
    defaultChecked: false,
    badge: "Soon",
  },
];

const appearanceSettings = [
  {
    label: "Unified Theme",
    description: "TalentForge dark neon interface is active across the workspace.",
    defaultChecked: true,
    disabled: true,
  },
  {
    label: "Accent Color",
    description: "Custom accent colors are planned after theme presets are finalized.",
    defaultChecked: false,
    disabled: true,
    badge: "Disabled",
  },
  {
    label: "Animations",
    description: "Use smooth motion for panels, cards, and feedback states.",
    defaultChecked: true,
  },
  {
    label: "Reduced Motion",
    description: "Prefer calmer motion for accessibility-sensitive workflows.",
    defaultChecked: false,
  },
];

const aiPreferenceSettings = [
  {
    label: "Auto ATS Suggestions",
    description: "Suggest stronger keywords and impact metrics when analysis is available.",
    defaultChecked: true,
  },
  {
    label: "Recruiter-focused feedback",
    description: "Frame recommendations around hiring signal, clarity, and evidence.",
    defaultChecked: true,
  },
  {
    label: "Strict interview grading",
    description: "Use a high bar for mock interview and OA feedback.",
    defaultChecked: false,
  },
];

export default async function DashboardSettingsPage() {
  const [user, clerkUser] = await Promise.all([getCurrentDbUser(), currentUser()]);

  if (!user.role) {
    redirect("/onboarding");
  }

  if (!clerkUser) {
    redirect("/sign-in");
  }

  const profile = {
    name: user.name ?? clerkUser.fullName ?? clerkUser.username ?? "TalentForge User",
    email: user.email,
    username: clerkUser.username ?? "Not configured",
    role: formatRole(user.role),
    plan: "Starter",
    workspace: `${formatRole(user.role)} Workspace`,
    memberSince: formatDate(user.createdAt),
    imageUrl: user.imageUrl ?? clerkUser.imageUrl,
  };

  const twoFactorEnabled = getBooleanProperty(clerkUser, "twoFactorEnabled");
  const connectedProviders = new Set(
    clerkUser.externalAccounts.map((account) => formatProvider(account.provider))
  );
  const providers: ProviderStatus[] = [
    {
      name: "Google",
      status: connectedProviders.has("Google") ? "Connected" : "Not Connected",
      helper: "Single sign-on and account recovery.",
      icon: Globe2,
    },
    {
      name: "GitHub",
      status: connectedProviders.has("GitHub") ? "Connected" : "Not Connected",
      helper: "Repository analysis and developer profile context.",
      icon: GitBranch,
    },
    {
      name: "LinkedIn",
      status: "Coming Soon",
      helper: "Professional network import is planned.",
      icon: BriefcaseBusiness,
    },
  ];

  const accountItems: DetailItem[] = [
    { label: "Display Name", value: profile.name, helper: "Synced from Clerk profile." },
    { label: "Username", value: profile.username, helper: "Managed in Clerk account settings." },
    { label: "Country", value: "Not configured", badge: "Soon", tone: "purple" },
    { label: "Timezone", value: "Not configured", badge: "Soon", tone: "purple" },
    { label: "Language", value: "English", helper: "Default interface language." },
    { label: "Resume Privacy", value: "Private to account", badge: "Protected", tone: "emerald" },
    { label: "Auto Save", value: "Enabled for workspace drafts", badge: "Active", tone: "cyan" },
  ];

  const securityItems: DetailItem[] = [
    { label: "Password", value: "Managed by Clerk", badge: "Protected", tone: "emerald" },
    {
      label: "Two-factor Authentication",
      value: twoFactorEnabled === null ? "Check Clerk account" : twoFactorEnabled ? "Enabled" : "Not enabled",
      badge: twoFactorEnabled ? "Strong" : "Review",
      tone: twoFactorEnabled ? "emerald" : "amber",
    },
    { label: "Active Sessions", value: "Managed by Clerk", helper: "Review sessions in account controls." },
    { label: "Trusted Devices", value: "Managed by Clerk", helper: "Device trust is handled by authentication provider." },
    { label: "Recent Login Activity", value: "Available in Clerk", badge: "Secure", tone: "cyan" },
    { label: "Recovery Options", value: "Primary email verified", badge: "Ready", tone: "emerald" },
  ];

  const sessionItems: DetailItem[] = [
    { label: "Current Device", value: "This browser session", helper: "Protected by Clerk." },
    { label: "Browser", value: "Detected by account session", badge: "Current", tone: "cyan" },
    { label: "Location", value: "Managed by Clerk", helper: "Precise location is not stored by TalentForge." },
    { label: "Last Active", value: "Now", badge: "Live", tone: "emerald" },
  ];

  return (
    <main className={forge.page}>
      <div className="relative mx-auto w-full max-w-[1536px] space-y-6">
        <div className={forge.topNav}>
          <Link href="/" className="text-lg font-semibold tracking-tight">
            TalentForge AI
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild variant="outline" size="sm" className={forge.secondaryButton}>
              <Link href="/dashboard">
                <LayoutDashboard className="h-3.5 w-3.5" />
                Dashboard
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className={forge.secondaryButton}>
              <a href="mailto:support@talentforge.ai">
                <LifeBuoy className="h-3.5 w-3.5" />
                Support
              </a>
            </Button>
            <Button asChild variant="outline" size="sm" className={forge.secondaryButton}>
              <Link href="/README.md">
                <BookOpen className="h-3.5 w-3.5" />
                Documentation
              </Link>
            </Button>
            <SignOutButton redirectUrl="/">
              <Button size="sm" className="rounded-2xl bg-white text-slate-950 shadow-[0_0_24px_rgba(255,255,255,0.14)] hover:-translate-y-0.5 hover:bg-cyan-50">
                <LogOut className="h-3.5 w-3.5" />
                Sign Out
              </Button>
            </SignOutButton>
          </div>
        </div>

        <section className="relative overflow-hidden rounded-[2rem] border border-white/[0.08] bg-[radial-gradient(circle_at_12%_0%,rgba(0,229,255,0.16),transparent_34%),radial-gradient(circle_at_88%_10%,rgba(139,92,246,0.2),transparent_34%),linear-gradient(135deg,rgba(7,16,36,0.9),rgba(16,24,39,0.66)_55%,rgba(5,10,22,0.84))] p-5 shadow-[0_28px_100px_rgba(0,0,0,0.28),0_0_58px_rgba(0,229,255,0.07),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-2xl sm:p-7">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#00E5FF]/12 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 left-20 h-64 w-64 rounded-full bg-[#8B5CF6]/12 blur-3xl" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <Avatar name={profile.name} imageUrl={profile.imageUrl} />
              <div>
                <p className={forge.badge}>Settings</p>
                <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                  {profile.name}
                </h1>
                <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-400">
                  <Mail className="h-4 w-4 text-cyan-100" />
                  {profile.email}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <StatusBadge tone="cyan">{profile.plan} Plan</StatusBadge>
                  <StatusBadge tone="purple">{profile.workspace}</StatusBadge>
                  <StatusBadge tone="emerald">Protected Account</StatusBadge>
                </div>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:w-[25rem]">
              <QuickAction title="Edit Profile" detail="Update Clerk identity" icon={UserCog} />
              <QuickAction title="Manage Account" detail="Security and sessions" icon={KeyRound} />
              <QuickAction title="Member Since" detail={profile.memberSince} icon={Clock3} />
              <QuickAction title="Role" detail={profile.role} icon={BriefcaseBusiness} />
            </div>
          </div>
        </section>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.42fr)]">
          <div className="space-y-5">
            <SettingsSection
              title="Profile"
              description="Your public TalentForge identity and workspace membership."
              icon={UserRound}
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <InfoTile label="Profile Picture" value={profile.imageUrl ? "Synced from Clerk" : "Initials avatar"} badge="Real Data" tone="cyan" />
                <InfoTile label="Name" value={profile.name} badge="Clerk" tone="emerald" />
                <InfoTile label="Email" value={profile.email} badge="Verified" tone="emerald" />
                <InfoTile label="Role" value={profile.role} />
                <InfoTile label="Plan" value={profile.plan} badge="Placeholder" tone="purple" />
                <InfoTile label="Workspace" value={profile.workspace} />
                <InfoTile label="Member Since" value={profile.memberSince} />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="outline" size="sm" className={forge.secondaryButton}>Edit Profile</Button>
                <Button variant="outline" size="sm" className={forge.secondaryButton}>Manage Account</Button>
              </div>
            </SettingsSection>

            <SettingsSection
              title="Account"
              description="Personal workspace preferences and resume handling defaults."
              icon={UserCog}
            >
              <DetailGrid items={accountItems} />
            </SettingsSection>

            <SettingsSection
              title="Security"
              description="Authentication status, recovery controls, and account protection."
              icon={ShieldCheck}
            >
              <div className="grid gap-3 md:grid-cols-2">
                {securityItems.map((item) => (
                  <InfoTile key={item.label} {...item} />
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="outline" size="sm" className={forge.secondaryButton}>
                  <LockKeyhole className="h-3.5 w-3.5" />
                  Change Password
                </Button>
                <Button variant="outline" size="sm" className={forge.secondaryButton}>
                  <Activity className="h-3.5 w-3.5" />
                  Review Activity
                </Button>
              </div>
            </SettingsSection>

            <SettingsSection
              title="Notifications"
              description="Choose which career readiness events should reach you."
              icon={Bell}
            >
              <div className="grid gap-3">
                {notificationSettings.map((setting) => (
                  <SettingToggle key={setting.label} {...setting} />
                ))}
              </div>
            </SettingsSection>

            <SettingsSection
              title="Appearance"
              description="Future-ready interface controls for theme, motion, and density."
              icon={Palette}
            >
              <div className="grid gap-3">
                {appearanceSettings.map((setting) => (
                  <SettingToggle key={setting.label} {...setting} />
                ))}
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <InfoTile label="Density" value="Comfortable" helper="Optimized for dashboard scanning." />
                <InfoTile label="Accent Color" value="TalentForge Neon" badge="Locked" tone="purple" />
              </div>
            </SettingsSection>

            <SettingsSection
              title="AI Preferences"
              description="Personalization controls for resume, interview, and coaching output."
              icon={Bot}
            >
              <div className="grid gap-3 sm:grid-cols-3">
                <InfoTile label="Preferred Resume Style" value="Impact-focused" />
                <InfoTile label="Preferred Interview Difficulty" value="Adaptive" />
                <InfoTile label="AI Tone" value="Direct and coaching-led" />
                <InfoTile label="Career Goal" value="Not configured" badge="Soon" tone="purple" />
              </div>
              <div className="mt-3 grid gap-3">
                {aiPreferenceSettings.map((setting) => (
                  <SettingToggle key={setting.label} {...setting} />
                ))}
              </div>
            </SettingsSection>
          </div>

          <aside className="space-y-5">
            <SettingsSection
              title="Connected Accounts"
              description="Provider connections used for sign-in and enrichment."
              icon={Link2}
            >
              <div className="grid gap-3">
                {providers.map((provider) => (
                  <ProviderRow key={provider.name} provider={provider} />
                ))}
              </div>
            </SettingsSection>

            <SettingsSection
              title="Privacy"
              description="Data controls for resumes, analysis output, and local workspace state."
              icon={Eye}
            >
              <div className="grid gap-2">
                <PrivacyAction icon={Download} title="Download My Data" detail="Export support will be available with account data APIs." />
                <PrivacyAction icon={FileText} title="Manage Uploaded Resumes" detail="Review and delete resumes from Resume History." href="/dashboard/resume/history" />
                <PrivacyAction icon={Database} title="Delete Cached Analysis" detail="Prepared for future cache cleanup controls." />
                <PrivacyAction icon={Monitor} title="Clear Local Data" detail="Browser-local cleanup requires client storage integration." />
              </div>
            </SettingsSection>

            <SettingsSection
              title="Billing"
              description="Plan, usage, and invoices for TalentForge AI."
              icon={CreditCard}
              badge="Coming Soon"
            >
              <div className="grid gap-3">
                <InfoTile label="Current Plan" value={profile.plan} badge="Placeholder" tone="purple" />
                <InfoTile label="Usage" value="Usage tracking not enabled" helper="Billing backend is not connected yet." />
                <InfoTile label="Invoice History" value="No invoices available" badge="Soon" tone="amber" />
              </div>
              <Button className="mt-4 w-full">Upgrade Plan</Button>
            </SettingsSection>

            <SettingsSection
              title="Sessions & Devices"
              description="Current session overview and device controls."
              icon={Laptop}
            >
              <DetailGrid items={sessionItems} />
              <div className="mt-4">
                <Button variant="outline" size="sm" className={forge.secondaryButton}>
                  Sign out from other devices
                </Button>
              </div>
            </SettingsSection>

            <DangerZone />
          </aside>
        </div>
      </div>
    </main>
  );
}

function SettingsSection({
  title,
  description,
  icon: Icon,
  badge,
  children,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
  badge?: string;
  children: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden rounded-[1.65rem] border border-white/[0.08] bg-[radial-gradient(circle_at_12%_0%,rgba(0,229,255,0.09),transparent_30%),linear-gradient(145deg,rgba(7,16,36,0.84),rgba(16,24,39,0.58)_55%,rgba(5,10,22,0.76))] p-5 shadow-[0_20px_70px_rgba(0,0,0,0.22),0_0_28px_rgba(0,229,255,0.04),inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-2xl">
      <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/38 to-transparent" />
      <div className="mb-5 flex items-start gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-cyan-300/18 bg-cyan-300/10 text-cyan-100 shadow-[0_0_18px_rgba(0,229,255,0.1)]">
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold tracking-tight text-white">{title}</h2>
            {badge ? <StatusBadge tone="purple">{badge}</StatusBadge> : null}
          </div>
          <p className="mt-1 text-sm leading-6 text-slate-400">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function Avatar({ name, imageUrl }: { name: string; imageUrl: string | null }) {
  const initial = name.trim().charAt(0).toUpperCase() || "T";

  return (
    <span className="relative grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-[1.7rem] border border-cyan-200/20 bg-gradient-to-br from-[#00E5FF]/25 via-[#6A5CFF]/20 to-[#8B5CF6]/24 text-3xl font-bold text-white shadow-[0_0_34px_rgba(0,229,255,0.18),inset_0_1px_0_rgba(255,255,255,0.12)]">
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

function QuickAction({
  title,
  detail,
  icon: Icon,
}: {
  title: string;
  detail: string;
  icon: LucideIcon;
}) {
  return (
    <div className="group rounded-[1.15rem] border border-white/[0.08] bg-[#071024]/58 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.045)] transition duration-300 hover:-translate-y-0.5 hover:border-cyan-300/18 hover:bg-white/[0.045]">
      <div className="flex items-start gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-cyan-300/18 bg-cyan-300/10 text-cyan-100">
          <Icon className="h-4 w-4" />
        </span>
        <span>
          <span className="block text-sm font-semibold text-white">{title}</span>
          <span className="mt-1 block text-xs leading-5 text-slate-500">{detail}</span>
        </span>
      </div>
    </div>
  );
}

function DetailGrid({ items }: { items: DetailItem[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map((item) => (
        <InfoTile key={item.label} {...item} />
      ))}
    </div>
  );
}

function InfoTile({
  label,
  value,
  helper,
  badge,
  tone = "slate",
}: DetailItem) {
  return (
    <div className="min-w-0 rounded-[1.1rem] border border-white/[0.07] bg-[#071024]/54 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</p>
        {badge ? <StatusBadge tone={tone}>{badge}</StatusBadge> : null}
      </div>
      <p className="mt-2 truncate text-sm font-semibold text-white">{value}</p>
      {helper ? <p className="mt-1 text-xs leading-5 text-slate-500">{helper}</p> : null}
    </div>
  );
}

function ProviderRow({ provider }: { provider: ProviderStatus }) {
  const Icon = provider.icon;
  const tone: BadgeTone =
    provider.status === "Connected" ? "emerald" : provider.status === "Coming Soon" ? "purple" : "slate";

  return (
    <div className="flex items-center justify-between gap-3 rounded-[1.1rem] border border-white/[0.07] bg-[#071024]/54 px-4 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-cyan-300/16 bg-cyan-300/8 text-cyan-100">
          <Icon className="h-4 w-4" />
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-semibold text-white">{provider.name}</span>
          <span className="mt-1 block truncate text-xs text-slate-500">{provider.helper}</span>
        </span>
      </div>
      <StatusBadge tone={tone}>{provider.status}</StatusBadge>
    </div>
  );
}

function PrivacyAction({
  icon: Icon,
  title,
  detail,
  href,
}: {
  icon: LucideIcon;
  title: string;
  detail: string;
  href?: string;
}) {
  const content = (
    <>
      <div className="flex min-w-0 items-center gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-cyan-300/16 bg-cyan-300/8 text-cyan-100">
          <Icon className="h-4 w-4" />
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-semibold text-white">{title}</span>
          <span className="mt-1 block text-xs leading-5 text-slate-500">{detail}</span>
        </span>
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-slate-600" />
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="flex items-center justify-between gap-3 rounded-[1.1rem] border border-white/[0.07] bg-[#071024]/54 px-4 py-3 transition duration-300 hover:-translate-y-0.5 hover:border-cyan-300/18 hover:bg-white/[0.045]"
      >
        {content}
      </Link>
    );
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-[1.1rem] border border-white/[0.07] bg-[#071024]/54 px-4 py-3">
      {content}
    </div>
  );
}

function DangerZone() {
  return (
    <section className="relative overflow-hidden rounded-[1.65rem] border border-red-300/18 bg-[radial-gradient(circle_at_10%_0%,rgba(248,113,113,0.12),transparent_30%),linear-gradient(145deg,rgba(38,9,18,0.58),rgba(10,14,29,0.78))] p-5 shadow-[0_20px_70px_rgba(0,0,0,0.22),0_0_30px_rgba(248,113,113,0.06)] backdrop-blur-2xl">
      <div className="mb-5 flex items-start gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-red-300/22 bg-red-400/10 text-red-100">
          <ShieldAlert className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-white">Danger Zone</h2>
          <p className="mt-1 text-sm leading-6 text-slate-400">
            Destructive controls require confirmation and backend support before execution.
          </p>
        </div>
      </div>
      <div className="grid gap-3">
        <DangerAction
          title="Delete uploaded resumes"
          detail="Remove uploaded resume records and version history."
          confirmation="Delete uploaded resumes? This cannot be undone once backend deletion is enabled."
        />
        <DangerAction
          title="Reset AI history"
          detail="Clear generated coaching, analysis, and recommendation history."
          confirmation="Reset AI history? This cannot be undone once backend deletion is enabled."
        />
        <DangerAction
          title="Delete Account"
          detail="Permanently remove your TalentForge AI account."
          confirmation="Delete your account? This is a permanent action once account deletion is enabled."
        />
      </div>
    </section>
  );
}

function DangerAction({
  title,
  detail,
  confirmation,
}: {
  title: string;
  detail: string;
  confirmation: string;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-[1.1rem] border border-red-300/14 bg-red-400/[0.055] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-semibold text-white">{title}</p>
        <p className="mt-1 text-xs leading-5 text-slate-500">{detail}</p>
      </div>
      <ConfirmActionButton label={title} confirmation={confirmation} tone="danger" />
    </div>
  );
}

function StatusBadge({ tone, children }: { tone: BadgeTone; children: ReactNode }) {
  const classes = {
    cyan: "border-cyan-300/20 bg-cyan-300/10 text-cyan-100",
    emerald: "border-emerald-300/20 bg-emerald-300/10 text-emerald-100",
    purple: "border-purple-300/20 bg-purple-300/10 text-purple-100",
    amber: "border-amber-300/20 bg-amber-300/10 text-amber-100",
    red: "border-red-300/20 bg-red-300/10 text-red-100",
    slate: "border-white/[0.08] bg-white/[0.04] text-slate-300",
  }[tone];

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[0.68rem] font-semibold ${classes}`}>
      {tone === "emerald" ? <CheckCircle2 className="h-3 w-3" /> : null}
      {children}
    </span>
  );
}

function formatRole(role: string) {
  return role
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatProvider(provider: string) {
  const normalized = provider.replace(/^oauth_/, "").replace(/^saml_/, "");
  if (normalized.toLowerCase() === "github") return "GitHub";
  return normalized.charAt(0).toUpperCase() + normalized.slice(1).toLowerCase();
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function getBooleanProperty(value: unknown, key: string) {
  if (typeof value !== "object" || value === null || !(key in value)) {
    return null;
  }

  const property = (value as Record<string, unknown>)[key];
  return typeof property === "boolean" ? property : null;
}
