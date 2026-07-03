export const designTokens = {
  radius: {
    control: "rounded-2xl",
    card: "rounded-[28px]",
    hero: "rounded-[30px]",
    pill: "rounded-full",
  },
  spacing: {
    page: "px-4 py-4 sm:px-5 lg:px-7",
    section: "space-y-6 py-6 lg:py-8",
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
    card: "shadow-[0_24px_90px_rgba(0,0,0,0.24),0_0_42px_rgba(0,229,255,0.045)]",
    elevated: "shadow-[0_32px_120px_rgba(0,0,0,0.32),0_0_72px_rgba(139,92,246,0.1)]",
    glow: "shadow-[0_0_30px_rgba(0,229,255,0.14),0_0_42px_rgba(139,92,246,0.08)]",
  },
};

export const forge = {
  page:
    "relative min-h-screen overflow-hidden bg-[#050914] bg-[radial-gradient(circle_at_10%_6%,rgba(0,229,255,0.12),transparent_28rem),radial-gradient(circle_at_88%_8%,rgba(139,92,246,0.13),transparent_32rem),radial-gradient(circle_at_52%_105%,rgba(59,168,255,0.08),transparent_34rem),linear-gradient(180deg,#050914_0%,#080D1D_50%,#050914_100%)] px-4 py-4 text-white sm:px-5 lg:px-7 before:pointer-events-none before:fixed before:inset-0 before:bg-[radial-gradient(circle_at_18%_22%,rgba(0,229,255,0.045),transparent_22rem),radial-gradient(circle_at_82%_20%,rgba(139,92,246,0.05),transparent_24rem)] before:content-['']",
  topNav:
    "relative mx-auto flex w-full max-w-[1536px] flex-wrap items-center justify-between gap-4 overflow-hidden rounded-[26px] border border-cyan-200/10 bg-[#071024]/72 p-4 shadow-[0_24px_90px_rgba(0,0,0,0.26),0_0_42px_rgba(0,229,255,0.06)] backdrop-blur-2xl before:pointer-events-none before:absolute before:inset-x-6 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-cyan-200/50 before:to-transparent",
  hero:
    "relative overflow-hidden rounded-[30px] border border-white/[0.1] bg-[radial-gradient(circle_at_74%_28%,rgba(139,92,246,0.34),transparent_32%),radial-gradient(circle_at_78%_66%,rgba(0,229,255,0.2),transparent_30%),linear-gradient(135deg,rgba(7,13,30,0.92),rgba(13,20,38,0.76)_50%,rgba(3,8,18,0.86))] p-7 shadow-[0_32px_120px_rgba(0,0,0,0.34),0_0_88px_rgba(139,92,246,0.12)] backdrop-blur-2xl",
  heroGlowCyan:
    "pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#00E5FF]/14 blur-3xl",
  heroGlowPurple:
    "pointer-events-none absolute -bottom-24 left-16 h-72 w-72 rounded-full bg-[#8B5CF6]/14 blur-3xl",
  badge:
    "inline-flex rounded-full border border-purple-300/18 bg-purple-300/10 px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-purple-100 shadow-[0_0_18px_rgba(139,92,246,0.14)] ring-1 ring-white/[0.04]",
  card:
    "rounded-[28px] border border-cyan-200/10 bg-[radial-gradient(circle_at_10%_0%,rgba(0,229,255,0.12),transparent_30%),radial-gradient(circle_at_84%_8%,rgba(139,92,246,0.14),transparent_34%),linear-gradient(145deg,rgba(7,16,36,0.86),rgba(16,24,39,0.58)_55%,rgba(5,10,22,0.78))] text-white shadow-[0_24px_90px_rgba(0,0,0,0.24),0_0_42px_rgba(0,229,255,0.045)] ring-1 ring-white/[0.04] backdrop-blur-2xl",
  cardStrong:
    "overflow-hidden rounded-[30px] border border-cyan-200/14 bg-[radial-gradient(circle_at_10%_0%,rgba(0,229,255,0.18),transparent_30%),radial-gradient(circle_at_84%_8%,rgba(139,92,246,0.2),transparent_34%),linear-gradient(145deg,rgba(7,16,36,0.9),rgba(16,24,39,0.62)_55%,rgba(5,10,22,0.82))] text-white shadow-[0_28px_100px_rgba(0,0,0,0.28),0_0_58px_rgba(0,229,255,0.07),inset_0_1px_0_rgba(255,255,255,0.06)] ring-1 ring-white/[0.05] backdrop-blur-2xl",
  panel:
    "relative overflow-hidden rounded-[28px] border border-cyan-200/14 bg-[radial-gradient(circle_at_10%_0%,rgba(0,229,255,0.18),transparent_30%),radial-gradient(circle_at_84%_8%,rgba(139,92,246,0.2),transparent_34%),linear-gradient(145deg,rgba(7,16,36,0.9),rgba(16,24,39,0.62)_55%,rgba(5,10,22,0.82))] shadow-[0_28px_100px_rgba(0,0,0,0.28),0_0_58px_rgba(0,229,255,0.07),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-2xl",
  metric:
    "rounded-2xl border border-white/[0.08] bg-white/[0.04] p-4 shadow-[0_14px_42px_rgba(0,0,0,0.18)] backdrop-blur-xl",
  input:
    "rounded-2xl border-white/[0.1] bg-[#071024]/78 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_0_20px_rgba(0,229,255,0.025)] backdrop-blur-xl placeholder:text-slate-500 transition duration-200 focus-visible:border-[#00E5FF]/50 focus-visible:ring-[#00E5FF]/18",
  select:
    "h-11 w-full rounded-2xl border border-white/[0.1] bg-[#071024]/78 px-3 text-sm text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] outline-none ring-[#00E5FF]/16 backdrop-blur-xl transition duration-200 focus:border-[#00E5FF]/50 focus:ring-2",
  primaryButton:
    "rounded-2xl bg-gradient-to-r from-[#00E5FF] via-[#6A5CFF] to-[#8B5CF6] text-white shadow-[0_0_24px_rgba(0,229,255,0.18),0_0_32px_rgba(139,92,246,0.14)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_32px_rgba(0,229,255,0.24),0_0_42px_rgba(139,92,246,0.18)] disabled:opacity-60",
  secondaryButton:
    "rounded-2xl border-white/[0.1] bg-[#071024]/72 text-white shadow-[0_0_18px_rgba(0,229,255,0.035)] backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:border-[#00E5FF]/24 hover:bg-[#00E5FF]/8 hover:text-white",
  progressTrack: "overflow-hidden rounded-full bg-white/10 shadow-inner",
  progressFill:
    "h-full rounded-full bg-gradient-to-r from-[#00E5FF] to-[#6A5CFF] shadow-[0_0_12px_rgba(0,229,255,0.22)]",
  hoverCard:
    "transition duration-300 hover:-translate-y-0.5 hover:border-[#00E5FF]/20 hover:bg-white/[0.05] hover:shadow-[0_0_22px_rgba(0,229,255,0.08),0_0_32px_rgba(106,92,255,0.07)]",
  detailPanel:
    "rounded-2xl border border-white/10 bg-[#071024]/62 px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl",
  statusSuccess:
    "rounded-2xl border border-emerald-300/18 bg-emerald-400/8 px-3 py-2 text-sm text-emerald-200 shadow-[0_0_12px_rgba(52,211,153,0.05)]",
  statusError:
    "rounded-2xl border border-red-300/18 bg-red-400/8 px-3 py-2 text-sm text-red-200 shadow-[0_0_12px_rgba(248,113,113,0.05)]",
  statusWarning:
    "rounded-2xl border border-amber-300/18 bg-amber-300/8 px-3 py-2 text-sm leading-6 text-amber-100 shadow-[0_0_12px_rgba(251,191,36,0.05)]",
  content: "relative mx-auto w-full max-w-[1536px]",
  section: "relative mx-auto w-full max-w-[1536px] space-y-6 py-6 lg:py-8",
  skeleton: "animate-pulse rounded-2xl bg-white/[0.07]",
};
