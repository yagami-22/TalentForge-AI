export const designTokens = {
  radius: {
    control: "rounded-2xl",
    card: "rounded-[20px]",
    hero: "rounded-[20px]",
    pill: "rounded-full",
  },
  spacing: {
    page: "px-5 py-6 sm:px-8 lg:px-10",
    section: "space-y-8 py-8 lg:py-10",
    card: "p-6",
    control: "h-11 px-4",
    button: "h-10 px-4",
    buttonLarge: "h-12 px-5",
  },
  typography: {
    eyebrow: "text-[0.72rem] font-medium uppercase tracking-[0.2em]",
    h1: "text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-[2.9rem] lg:leading-tight",
    h2: "text-xl font-semibold tracking-tight text-white sm:text-2xl",
    h3: "text-[0.95rem] font-semibold text-white",
    body: "text-sm leading-6 text-slate-400",
    caption: "text-xs leading-5 text-slate-500",
  },
  icon: {
    xs: "h-3.5 w-3.5",
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
    tile: "grid h-10 w-10 place-items-center rounded-2xl",
  },
  shadow: {
    card: "shadow-[0_16px_48px_rgba(0,0,0,0.16)]",
    elevated: "shadow-[0_22px_70px_rgba(0,0,0,0.22)]",
    glow: "shadow-[0_0_18px_rgba(0,229,255,0.08)]",
  },
};

export const forge = {
  page:
    "min-h-screen overflow-hidden bg-[#070B16] bg-[radial-gradient(circle_at_15%_5%,rgba(0,229,255,0.075),transparent_32rem),radial-gradient(circle_at_85%_8%,rgba(106,92,255,0.085),transparent_34rem),linear-gradient(180deg,#070B16_0%,#0A1020_52%,#070B16_100%)] px-5 py-6 text-white sm:px-8 lg:px-10",
  topNav:
    "mx-auto flex w-full max-w-[1540px] flex-wrap items-center justify-between gap-4 rounded-[20px] border border-[rgba(255,255,255,0.06)] bg-[#101827]/82 p-4 shadow-[0_16px_48px_rgba(0,0,0,0.16)] backdrop-blur-xl",
  hero:
    "relative overflow-hidden rounded-[20px] border border-[rgba(255,255,255,0.06)] bg-[linear-gradient(135deg,rgba(16,24,39,0.92),rgba(21,30,47,0.78)_52%,rgba(106,92,255,0.12))] p-6 shadow-[0_18px_58px_rgba(0,0,0,0.18)] backdrop-blur-xl",
  heroGlowCyan:
    "pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#00E5FF]/7 blur-3xl",
  heroGlowPurple:
    "pointer-events-none absolute -bottom-24 left-16 h-72 w-72 rounded-full bg-[#8B5CF6]/7 blur-3xl",
  badge:
    "inline-flex rounded-full bg-[#00E5FF]/8 px-3 py-1 text-[0.72rem] font-medium uppercase tracking-[0.2em] text-cyan-100 ring-1 ring-[#00E5FF]/14",
  card:
    "rounded-[20px] border-[rgba(255,255,255,0.06)] bg-[#101827]/82 text-white shadow-[0_16px_48px_rgba(0,0,0,0.16)] ring-1 ring-white/[0.06] backdrop-blur-xl",
  cardStrong:
    "overflow-hidden rounded-[20px] border-[rgba(255,255,255,0.06)] bg-[linear-gradient(135deg,rgba(16,24,39,0.92),rgba(21,30,47,0.78)_52%,rgba(139,92,246,0.12))] text-white shadow-[0_18px_58px_rgba(0,0,0,0.18)] ring-1 ring-white/[0.06] backdrop-blur-xl",
  panel:
    "rounded-[20px] border border-[rgba(255,255,255,0.06)] bg-[#101827]/82 shadow-[0_16px_48px_rgba(0,0,0,0.16)] backdrop-blur-xl",
  metric:
    "rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[#151E2F]/72 p-4 shadow-[0_12px_34px_rgba(0,0,0,0.14)]",
  input:
    "rounded-2xl border-white/[0.08] bg-[#101827]/82 text-white shadow-inner placeholder:text-slate-500 transition duration-200 focus-visible:border-[#00E5FF]/45 focus-visible:ring-[#00E5FF]/16",
  select:
    "h-11 w-full rounded-2xl border border-white/[0.08] bg-[#101827]/82 px-3 text-sm text-white outline-none ring-[#00E5FF]/16 transition duration-200 focus:border-[#00E5FF]/45 focus:ring-2",
  primaryButton:
    "rounded-2xl bg-gradient-to-r from-[#00E5FF] via-[#6A5CFF] to-[#8B5CF6] text-white shadow-[0_0_16px_rgba(0,229,255,0.14)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_22px_rgba(0,229,255,0.18)] disabled:opacity-60",
  secondaryButton:
    "rounded-2xl border-white/[0.08] bg-[#101827]/72 text-white shadow-none transition duration-200 hover:-translate-y-0.5 hover:border-[#00E5FF]/20 hover:bg-[#00E5FF]/7 hover:text-white",
  progressTrack: "overflow-hidden rounded-full bg-white/10 shadow-inner",
  progressFill:
    "h-full rounded-full bg-gradient-to-r from-[#00E5FF] to-[#6A5CFF] shadow-[0_0_12px_rgba(0,229,255,0.22)]",
  hoverCard:
    "transition duration-300 hover:-translate-y-0.5 hover:border-[#00E5FF]/20 hover:bg-white/[0.05] hover:shadow-[0_0_22px_rgba(0,229,255,0.08),0_0_32px_rgba(106,92,255,0.07)]",
  detailPanel:
    "rounded-2xl border border-white/10 bg-[#101827]/60 px-3 py-2 shadow-inner",
  statusSuccess:
    "rounded-2xl border border-emerald-300/18 bg-emerald-400/8 px-3 py-2 text-sm text-emerald-200 shadow-[0_0_12px_rgba(52,211,153,0.05)]",
  statusError:
    "rounded-2xl border border-red-300/18 bg-red-400/8 px-3 py-2 text-sm text-red-200 shadow-[0_0_12px_rgba(248,113,113,0.05)]",
  statusWarning:
    "rounded-2xl border border-amber-300/18 bg-amber-300/8 px-3 py-2 text-sm leading-6 text-amber-100 shadow-[0_0_12px_rgba(251,191,36,0.05)]",
  content: "mx-auto w-full max-w-[1540px]",
  section: "mx-auto w-full max-w-[1540px] space-y-8 py-8 lg:py-10",
  skeleton: "animate-pulse rounded-2xl bg-white/[0.07]",
};
