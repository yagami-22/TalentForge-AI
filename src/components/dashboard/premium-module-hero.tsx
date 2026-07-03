import Link from "next/link";
import type { ReactNode } from "react";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Bot,
  FileText,
  GitCompareArrows,
  MessageSquareText,
  PenLine,
  SearchCheck,
  Sparkles,
  Timeline,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { designTokens, forge } from "@/lib/talentforge-design";

type HeroLink = {
  href: string;
  label: string;
  icon?: LucideIcon;
};

export type HeroMetric = {
  label: string;
  value: string;
  helper?: string;
  icon?: LucideIcon;
  tone?: "cyan" | "purple" | "emerald" | "amber";
  progress?: number;
  trend?: string;
};

export type HeroQuickAction = {
  href: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
};

export type PremiumModuleHeroProps = {
  badge: string;
  title: string;
  description: string;
  primaryCta?: HeroLink;
  secondaryCta?: HeroLink;
  quickActions?: HeroQuickAction[];
  metrics?: HeroMetric[];
  illustration?: ReactNode;
  variant?:
    | "dashboard"
    | "resume"
    | "ats"
    | "match"
    | "rewrite"
    | "interview"
    | "history"
    | "analytics"
    | "coach";
  status?: ReactNode;
};

export function DashboardContainer({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`${forge.content} ${className}`}>{children}</div>;
}

export function DashboardGrid({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`grid gap-5 ${className}`}>{children}</div>;
}

export function DashboardSurface({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`${forge.panel} ${designTokens.spacing.card} ${className}`}>
      <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/60 to-transparent" />
      <div className="pointer-events-none absolute -left-16 top-0 h-56 w-56 rounded-full bg-[#00E5FF]/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-0 h-56 w-56 rounded-full bg-[#8B5CF6]/10 blur-3xl" />
      {children}
    </section>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow ? (
          <p className={`${designTokens.typography.eyebrow} text-cyan-100`}>
            {eyebrow}
          </p>
        ) : null}
        <h2 className={`mt-1 ${designTokens.typography.h2}`}>
          {title}
        </h2>
        {description ? (
          <p className={`mt-2 ${designTokens.typography.body}`}>{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function HeroMetricCard({ metric }: { metric: HeroMetric }) {
  const Icon = metric.icon ?? Activity;
  const progress = Math.max(0, Math.min(100, metric.progress ?? 72));
  const toneClass =
    metric.tone === "purple"
      ? "border-[#8B5CF6]/25 bg-[#8B5CF6]/10 text-purple-100"
      : metric.tone === "emerald"
        ? "border-emerald-300/25 bg-emerald-300/10 text-emerald-100"
        : metric.tone === "amber"
          ? "border-amber-300/25 bg-amber-300/10 text-amber-100"
          : "border-[#00E5FF]/25 bg-[#00E5FF]/10 text-cyan-100";

  const fillClass =
    metric.tone === "purple"
      ? "bg-gradient-to-r from-[#8B5CF6] to-[#00E5FF]"
      : metric.tone === "emerald"
        ? "bg-gradient-to-r from-emerald-300 to-[#00E5FF]"
        : metric.tone === "amber"
          ? "bg-gradient-to-r from-amber-300 to-[#8B5CF6]"
          : "bg-gradient-to-r from-[#00E5FF] to-[#6A5CFF]";

  return (
    <div className={`group relative overflow-hidden rounded-[22px] border p-4 shadow-[0_16px_50px_rgba(0,0,0,0.18)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 ${toneClass}`}>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent opacity-70" />
      <div className="flex items-center justify-between gap-3">
        <p className="text-[0.68rem] font-semibold uppercase tracking-wide text-white/55">
          {metric.label}
        </p>
        <Icon
          className="h-3.5 w-3.5 opacity-80 transition group-hover:scale-110"
          aria-hidden="true"
        />
      </div>
      <p className="mt-2 text-xl font-semibold tracking-tight text-white">
        {metric.value}
      </p>
      <div className="mt-1 flex items-center justify-between gap-2">
        {metric.helper ? (
          <p className="truncate text-xs text-white/50">{metric.helper}</p>
        ) : <span />}
        {metric.trend ? (
          <span className="shrink-0 rounded-full border border-white/10 bg-white/[0.06] px-2 py-0.5 text-[0.65rem] font-semibold text-white/75">
            {metric.trend}
          </span>
        ) : null}
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.08] shadow-inner">
        <div
          className={`h-full rounded-full shadow-[0_0_10px_rgba(0,229,255,0.16)] transition-all duration-500 ${fillClass}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

export function QuickActionCard({ action }: { action: HeroQuickAction }) {
  const Icon = action.icon;

  return (
    <Link
      href={action.href}
      className="group relative flex min-h-28 items-start gap-3 overflow-hidden rounded-[20px] border border-white/[0.06] bg-[#101827]/82 p-5 shadow-[0_16px_48px_rgba(0,0,0,0.14)] outline-none ring-1 ring-white/[0.04] backdrop-blur-xl transition duration-200 hover:-translate-y-0.5 hover:border-[#00E5FF]/18 hover:bg-[#151E2F]/72 focus-visible:border-[#00E5FF]/55 focus-visible:ring-2 focus-visible:ring-[#00E5FF]/20"
    >
      <span className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-[#00E5FF]/60 to-transparent opacity-0 transition group-hover:opacity-100" />
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[#00E5FF]/18 bg-[#00E5FF]/10 text-cyan-100 shadow-[0_0_24px_rgba(0,229,255,0.12)] ring-1 ring-[#00E5FF]/14 transition duration-300 group-hover:scale-110">
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-white">
          {action.title}
        </span>
        <span className="mt-1 block text-xs leading-5 text-slate-500">
          {action.subtitle}
        </span>
      </span>
      <ArrowRight className="ml-auto mt-1 h-4 w-4 shrink-0 text-slate-600 transition duration-200 group-hover:translate-x-0.5 group-hover:text-cyan-100" />
    </Link>
  );
}

export function PremiumModuleHero({
  badge,
  title,
  description,
  primaryCta,
  secondaryCta,
  quickActions = [],
  metrics = [],
  illustration,
  variant = "dashboard",
  status,
}: PremiumModuleHeroProps) {
  const PrimaryIcon = primaryCta?.icon;
  const SecondaryIcon = secondaryCta?.icon;

  return (
    <section className="space-y-5">
      <div className={forge.hero}>
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#00E5FF]/14 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 left-20 h-72 w-72 rounded-full bg-[#8B5CF6]/14 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.1),transparent_24%,rgba(255,255,255,0.04)_54%,transparent_74%)] opacity-80" />
        <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/60 to-transparent" />
        <div className="relative grid gap-5 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-center xl:grid-cols-[minmax(0,1fr)_310px]">
          <div className="max-w-3xl">
            <p className={forge.badge}>{badge}</p>
            <h1 className={`mt-3 max-w-3xl ${designTokens.typography.h1}`}>
              {title}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
              {description}
            </p>
            {(primaryCta || secondaryCta) ? (
              <div className="mt-5 flex flex-wrap gap-3">
                {primaryCta ? (
                  <Button asChild className={forge.primaryButton}>
                    <Link href={primaryCta.href}>
                      {PrimaryIcon ? <PrimaryIcon className="h-4 w-4" /> : null}
                      {primaryCta.label}
                    </Link>
                  </Button>
                ) : null}
                {secondaryCta ? (
                  <Button asChild variant="outline" className={forge.secondaryButton}>
                    <Link href={secondaryCta.href}>
                      {SecondaryIcon ? <SecondaryIcon className="h-4 w-4" /> : null}
                      {secondaryCta.label}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                ) : null}
              </div>
            ) : null}
            {status ? <div className="mt-4">{status}</div> : null}
          </div>
          <div className="hidden lg:block">
            {illustration ?? <ModuleIllustration variant={variant} />}
          </div>
        </div>
      </div>

      {metrics.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
          {metrics.map((metric) => (
            <HeroMetricCard key={metric.label} metric={metric} />
          ))}
        </div>
      ) : null}

      {quickActions.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {quickActions.map((action) => (
            <QuickActionCard key={action.title} action={action} />
          ))}
        </div>
      ) : null}
    </section>
  );
}

function ModuleIllustration({
  variant = "dashboard",
}: {
  variant?: NonNullable<PremiumModuleHeroProps["variant"]>;
}) {
  const config = getIllustrationConfig(variant);
  const Icon = config.icon;

  return (
    <div className="relative ml-auto h-56 w-56 xl:h-64 xl:w-64" aria-hidden="true">
      <div className="absolute inset-0 rounded-full bg-[#8B5CF6]/18 blur-3xl" />
      <div className={`absolute inset-4 rounded-full border ${config.border} bg-[#071024]/62 shadow-[0_0_44px_rgba(0,229,255,0.12)] backdrop-blur-xl`} />
      <div className={`absolute inset-16 rounded-full border ${config.border} bg-gradient-to-br ${config.gradient} shadow-[0_0_52px_rgba(139,92,246,0.24)]`} />
      <div className="absolute left-1/2 top-1/2 grid h-20 w-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/[0.12] bg-[#070B16]/72 shadow-[inset_0_0_24px_rgba(0,229,255,0.08),0_0_34px_rgba(0,229,255,0.14)]">
        <Icon className="h-8 w-8 text-cyan-100 drop-shadow-[0_0_14px_rgba(0,229,255,0.85)]" />
      </div>
      {config.nodes.map((item) => (
        <span
          key={item}
          className={`absolute h-2.5 w-2.5 rounded-full ${config.dot} shadow-[0_0_12px_rgba(0,229,255,0.5)]`}
          style={{
            left: `${50 + Math.cos((item / config.nodes.length) * Math.PI * 2) * 42}%`,
            top: `${50 + Math.sin((item / config.nodes.length) * Math.PI * 2) * 42}%`,
          }}
        />
      ))}
      <svg className="absolute inset-0 h-full w-full opacity-70" viewBox="0 0 256 256">
        <circle cx="128" cy="128" r="94" fill="none" stroke="rgba(0,229,255,0.18)" />
        <circle cx="128" cy="128" r="64" fill="none" stroke="rgba(139,92,246,0.2)" />
        {config.paths}
      </svg>
    </div>
  );
}

function getIllustrationConfig(
  variant: NonNullable<PremiumModuleHeroProps["variant"]>
) {
  const common = {
    border: "border-cyan-300/20",
    gradient: "from-[#00E5FF]/16 to-[#8B5CF6]/20",
    dot: "bg-[#00E5FF]",
    nodes: [0, 1, 2, 3, 4, 5],
  };

  const map: Record<
    NonNullable<PremiumModuleHeroProps["variant"]>,
    typeof common & { icon: LucideIcon; paths: ReactNode }
  > = {
    dashboard: {
      ...common,
      icon: Sparkles,
      paths: (
        <path d="M55 128h146M128 34v188M58 82c48 31 94 31 140 0M58 174c48-31 94-31 140 0" fill="none" stroke="rgba(255,255,255,0.12)" strokeLinecap="round" />
      ),
    },
    resume: {
      ...common,
      icon: FileText,
      paths: (
        <>
          <rect x="76" y="55" width="104" height="146" rx="12" fill="none" stroke="rgba(255,255,255,0.15)" />
          <path d="M95 91h66M95 117h50M95 143h66M95 169h42" stroke="rgba(0,229,255,0.35)" strokeLinecap="round" />
        </>
      ),
    },
    ats: {
      ...common,
      icon: SearchCheck,
      dot: "bg-emerald-300",
      paths: (
        <>
          {[72, 96, 120, 144, 168].map((y, index) => (
            <path key={y} d={`M70 ${y}h116`} stroke={index % 2 ? "rgba(251,191,36,0.35)" : "rgba(0,229,255,0.35)"} strokeLinecap="round" />
          ))}
          <rect x="90" y="84" width="54" height="18" rx="6" fill="rgba(0,229,255,0.16)" />
          <rect x="117" y="136" width="70" height="18" rx="6" fill="rgba(251,191,36,0.14)" />
        </>
      ),
    },
    match: {
      ...common,
      icon: GitCompareArrows,
      dot: "bg-[#8B5CF6]",
      paths: (
        <>
          <rect x="54" y="76" width="64" height="96" rx="10" fill="none" stroke="rgba(0,229,255,0.25)" />
          <rect x="138" y="76" width="64" height="96" rx="10" fill="none" stroke="rgba(139,92,246,0.3)" />
          <path d="M118 104h20M118 128h20M118 152h20" stroke="rgba(255,255,255,0.18)" strokeLinecap="round" />
        </>
      ),
    },
    rewrite: {
      ...common,
      icon: PenLine,
      paths: (
        <>
          <path d="M78 164c30-52 68-74 110-82M88 186c24-22 53-28 88-21" stroke="rgba(0,229,255,0.3)" strokeLinecap="round" />
          <path d="M155 72l30 30" stroke="rgba(139,92,246,0.35)" strokeLinecap="round" />
        </>
      ),
    },
    interview: {
      ...common,
      icon: MessageSquareText,
      paths: (
        <>
          <path d="M58 132c16-42 34-42 50 0s34 42 50 0 34-42 50 0" fill="none" stroke="rgba(0,229,255,0.36)" strokeLinecap="round" />
          <path d="M68 84h86M68 174h120" stroke="rgba(255,255,255,0.12)" strokeLinecap="round" />
        </>
      ),
    },
    history: {
      ...common,
      icon: Timeline,
      dot: "bg-emerald-300",
      paths: (
        <>
          <path d="M128 55v146" stroke="rgba(255,255,255,0.14)" strokeLinecap="round" />
          {[76, 108, 140, 172].map((y) => (
            <circle key={y} cx="128" cy={y} r="7" fill="rgba(0,229,255,0.22)" stroke="rgba(0,229,255,0.45)" />
          ))}
        </>
      ),
    },
    analytics: {
      ...common,
      icon: BarChart3,
      paths: (
        <>
          <path d="M62 182h132" stroke="rgba(255,255,255,0.14)" strokeLinecap="round" />
          {[78, 106, 134, 162].map((x, index) => (
            <rect key={x} x={x} y={112 - index * 12} width="16" height={70 + index * 12} rx="6" fill={index % 2 ? "rgba(139,92,246,0.22)" : "rgba(0,229,255,0.22)"} />
          ))}
        </>
      ),
    },
    coach: {
      ...common,
      icon: Bot,
      dot: "bg-[#8B5CF6]",
      paths: (
        <>
          <rect x="72" y="82" width="112" height="82" rx="24" fill="none" stroke="rgba(0,229,255,0.25)" />
          <circle cx="108" cy="122" r="8" fill="rgba(0,229,255,0.36)" />
          <circle cx="148" cy="122" r="8" fill="rgba(139,92,246,0.36)" />
          <path d="M106 148c14 10 30 10 44 0" stroke="rgba(255,255,255,0.18)" strokeLinecap="round" />
        </>
      ),
    },
  };

  return map[variant];
}
