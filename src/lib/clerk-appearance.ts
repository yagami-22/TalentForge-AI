export const clerkAuthAppearance = {
  variables: {
    colorPrimary: "#00E5FF",
    colorBackground: "#070B1F",
    colorInputBackground: "rgba(5, 8, 22, 0.78)",
    colorInputText: "#F8FAFC",
    colorText: "#F8FAFC",
    colorTextSecondary: "#94A3B8",
    colorNeutral: "#94A3B8",
    colorDanger: "#FB7185",
    borderRadius: "1.5rem",
    fontFamily: "var(--font-geist-sans)",
  },
  elements: {
    rootBox: {
      width: "100%",
      maxWidth: "30rem",
    },
    cardBox: {
      width: "100%",
      borderRadius: "2rem",
      background:
        "linear-gradient(135deg, rgba(0,229,255,0.1), rgba(255,255,255,0.04) 48%, rgba(139,92,246,0.12))",
      border: "1px solid rgba(255,255,255,0.08)",
      boxShadow:
        "0 0 44px rgba(0,229,255,0.14), 0 0 70px rgba(106,92,255,0.14)",
      backdropFilter: "blur(24px)",
      overflow: "hidden",
    },
    card: {
      gap: "1.25rem",
      borderRadius: "2rem",
      background: "rgba(7, 11, 31, 0.72)",
      boxShadow: "none",
      border: "1px solid rgba(255,255,255,0.08)",
      color: "#F8FAFC",
      padding: "2rem",
    },
    headerTitle: {
      color: "#FFFFFF",
      fontSize: "1.75rem",
      fontWeight: "650",
      letterSpacing: "0",
    },
    headerSubtitle: {
      color: "#94A3B8",
      lineHeight: "1.6",
    },
    socialButtonsBlockButton: {
      height: "2.875rem",
      borderRadius: "1rem",
      border: "1px solid rgba(255,255,255,0.1)",
      background: "rgba(255,255,255,0.04)",
      color: "#F8FAFC",
      boxShadow: "0 0 24px rgba(0,229,255,0.08)",
      transition:
        "transform 250ms ease, border-color 250ms ease, background 250ms ease, box-shadow 250ms ease",
    },
    socialButtonsBlockButton__hover: {
      transform: "translateY(-2px)",
      borderColor: "rgba(0,229,255,0.3)",
      background: "rgba(0,229,255,0.1)",
      boxShadow: "0 0 30px rgba(0,229,255,0.16)",
    },
    socialButtonsBlockButtonText: {
      color: "#F8FAFC",
      fontWeight: "600",
    },
    dividerLine: {
      background: "rgba(255,255,255,0.1)",
    },
    dividerText: {
      color: "#64748B",
    },
    formFieldLabel: {
      color: "#CBD5E1",
      fontWeight: "600",
    },
    formFieldInput: {
      height: "2.875rem",
      borderRadius: "1rem",
      border: "1px solid rgba(255,255,255,0.1)",
      background: "rgba(5,8,22,0.78)",
      color: "#F8FAFC",
      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
      caretColor: "#00E5FF",
    },
    formFieldInput__focus: {
      borderColor: "rgba(0,229,255,0.55)",
      boxShadow: "0 0 0 3px rgba(0,229,255,0.16)",
    },
    formFieldInputShowPasswordButton: {
      color: "#94A3B8",
    },
    formFieldAction: {
      color: "#67E8F9",
      fontWeight: "600",
    },
    formFieldAction__hover: {
      color: "#CFFAFE",
    },
    formButtonPrimary: {
      height: "2.875rem",
      borderRadius: "1rem",
      background: "linear-gradient(90deg, #00E5FF, #6A5CFF, #8B5CF6)",
      color: "#FFFFFF",
      fontWeight: "700",
      boxShadow: "0 0 32px rgba(0,229,255,0.28)",
      transition: "transform 250ms ease, box-shadow 250ms ease",
    },
    formButtonPrimary__hover: {
      transform: "translateY(-2px)",
      boxShadow: "0 0 46px rgba(0,229,255,0.38)",
    },
    footer: {
      background: "rgba(5,8,22,0.5)",
      borderTop: "1px solid rgba(255,255,255,0.08)",
    },
    footerActionText: {
      color: "#94A3B8",
    },
    footerActionLink: {
      color: "#67E8F9",
      fontWeight: "700",
    },
    footerActionLink__hover: {
      color: "#CFFAFE",
    },
    identityPreview: {
      borderRadius: "1rem",
      border: "1px solid rgba(255,255,255,0.08)",
      background: "rgba(255,255,255,0.04)",
      color: "#F8FAFC",
    },
    identityPreviewText: {
      color: "#F8FAFC",
    },
    alternativeMethodsBlockButton: {
      borderRadius: "1rem",
      border: "1px solid rgba(255,255,255,0.1)",
      background: "rgba(255,255,255,0.04)",
      color: "#F8FAFC",
    },
    formResendCodeLink: {
      color: "#67E8F9",
      fontWeight: "700",
    },
    otpCodeFieldInput: {
      borderRadius: "1rem",
      border: "1px solid rgba(255,255,255,0.1)",
      background: "rgba(5,8,22,0.78)",
      color: "#F8FAFC",
      caretColor: "#00E5FF",
    },
    alert: {
      borderRadius: "1rem",
      background: "rgba(251,113,133,0.1)",
      border: "1px solid rgba(251,113,133,0.25)",
      color: "#FFE4E6",
    },
    formFieldErrorText: {
      color: "#FDA4AF",
    },
  },
  layout: {
    applicationName: "TalentForge AI",
    logoPlacement: "none",
    socialButtonsPlacement: "top",
    socialButtonsVariant: "blockButton",
  },
} as const;

export const clerkLocalization = {
  signIn: {
    start: {
      title: "Sign in to TalentForge AI",
      titleCombined: "Continue to TalentForge AI",
      subtitle: "Continue to your career intelligence workspace.",
      subtitleCombined: "Sign in or create an account to open your workspace.",
      actionText: "New to TalentForge AI?",
      actionLink: "Create an account",
    },
    password: {
      title: "Welcome back to TalentForge AI",
      subtitle: "Enter your password to continue.",
      actionLink: "Forgot password?",
    },
  },
  signUp: {
    start: {
      title: "Create your TalentForge AI account",
      titleCombined: "Start with TalentForge AI",
      subtitle: "Start analyzing, improving, and practicing with AI.",
      subtitleCombined: "Create an account or sign in to continue.",
      actionText: "Already have an account?",
      actionLink: "Sign in",
    },
    continue: {
      title: "Complete your TalentForge AI account",
      subtitle: "A few details help secure your workspace.",
      actionText: "Already have an account?",
      actionLink: "Sign in",
    },
  },
} as const;
