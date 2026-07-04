export const clerkAuthAppearance = {
  variables: {
    colorPrimary: "#00E5FF",
    colorBackground: "#101827",
    colorInputBackground: "#101827",
    colorInputText: "#F8FAFC",
    colorText: "#F8FAFC",
    colorTextSecondary: "#94A3B8",
    colorNeutral: "#94A3B8",
    colorDanger: "#FB7185",
    borderRadius: "1rem",
    fontFamily: "var(--font-geist-sans)",
  },
  elements: {
    rootBox: {
      width: "100%",
      maxWidth: "30rem",
    },
    cardBox: {
      width: "100%",
      borderRadius: "20px",
      background:
        "linear-gradient(135deg, rgba(16,24,39,0.92), rgba(21,30,47,0.78) 52%, rgba(139,92,246,0.12))",
      border: "1px solid rgba(255,255,255,0.06)",
      boxShadow: "0 18px 58px rgba(0,0,0,0.18)",
      backdropFilter: "blur(12px)",
      overflow: "hidden",
    },
    card: {
      gap: "1.25rem",
      borderRadius: "20px",
      background: "rgba(16,24,39,0.82)",
      boxShadow: "none",
      border: "1px solid rgba(255,255,255,0.06)",
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
      border: "1px solid rgba(255,255,255,0.08)",
      background: "rgba(21,30,47,0.72)",
      color: "#F8FAFC",
      boxShadow: "none",
      transition:
        "transform 250ms ease, border-color 250ms ease, background 250ms ease, box-shadow 250ms ease",
    },
    socialButtonsBlockButton__hover: {
      transform: "translateY(-2px)",
      borderColor: "rgba(0,229,255,0.3)",
      background: "rgba(0,229,255,0.1)",
      boxShadow: "none",
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
      border: "1px solid rgba(255,255,255,0.08)",
      background: "rgba(16,24,39,0.82)",
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
      boxShadow: "0 0 16px rgba(0,229,255,0.14)",
      transition: "transform 250ms ease, box-shadow 250ms ease",
    },
    formButtonPrimary__hover: {
      transform: "translateY(-2px)",
      boxShadow: "0 0 22px rgba(0,229,255,0.18)",
    },
    footer: {
      background: "rgba(7,11,22,0.6)",
      borderTop: "1px solid rgba(255,255,255,0.06)",
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
      border: "1px solid rgba(255,255,255,0.06)",
      background: "rgba(21,30,47,0.72)",
      color: "#F8FAFC",
    },
    identityPreviewText: {
      color: "#F8FAFC",
    },
    alternativeMethodsBlockButton: {
      borderRadius: "1rem",
      border: "1px solid rgba(255,255,255,0.08)",
      background: "rgba(21,30,47,0.72)",
      color: "#F8FAFC",
    },
    formResendCodeLink: {
      color: "#67E8F9",
      fontWeight: "700",
    },
    otpCodeFieldInput: {
      borderRadius: "1rem",
      border: "1px solid rgba(255,255,255,0.08)",
      background: "rgba(16,24,39,0.82)",
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
    userButtonTrigger: {
      borderRadius: "1rem",
      boxShadow: "0 0 0 1px rgba(255,255,255,0.08), 0 12px 26px rgba(0,0,0,0.18)",
      transition:
        "transform 250ms ease, box-shadow 250ms ease, border-color 250ms ease",
    },
    userButtonTrigger__hover: {
      transform: "translateY(-1px)",
      boxShadow: "0 0 0 1px rgba(0,229,255,0.24), 0 14px 30px rgba(0,0,0,0.2)",
    },
    userButtonAvatarBox: {
      borderRadius: "1rem",
      boxShadow: "0 0 0 1px rgba(0,229,255,0.24)",
    },
    userButtonPopoverRootBox: {
      zIndex: "80",
    },
    userButtonPopoverCard: {
      minWidth: "18rem",
      borderRadius: "20px",
      background:
        "linear-gradient(135deg, rgba(16,24,39,0.96), rgba(7,11,22,0.94) 48%, rgba(36,20,75,0.9))",
      border: "1px solid rgba(255,255,255,0.08)",
      boxShadow: "0 24px 80px rgba(0,0,0,0.48)",
      backdropFilter: "blur(16px)",
      color: "#F8FAFC",
      overflow: "hidden",
    },
    userButtonPopoverMain: {
      background: "rgba(16,24,39,0.72)",
      borderRadius: "20px",
    },
    userButtonPopoverActions: {
      background: "transparent",
      borderTop: "1px solid rgba(255,255,255,0.06)",
      padding: "0.45rem",
    },
    userButtonPopoverActionButton: {
      borderRadius: "1rem",
      color: "#CBD5E1",
      background: "transparent",
      transition:
        "transform 220ms ease, background 220ms ease, color 220ms ease, box-shadow 220ms ease",
    },
    userButtonPopoverActionButton__hover: {
      transform: "translateY(-1px)",
      color: "#F8FAFC",
      background: "rgba(0,229,255,0.1)",
      boxShadow: "none",
    },
    userButtonPopoverActionButtonIcon: {
      color: "#67E8F9",
    },
    userButtonPopoverActionButtonText: {
      color: "inherit",
      fontWeight: "600",
    },
    userButtonPopoverFooter: {
      background: "rgba(5,8,22,0.78)",
      borderTop: "1px solid rgba(255,255,255,0.06)",
      color: "#94A3B8",
    },
    userPreview: {
      background: "rgba(255,255,255,0.04)",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
    },
    userPreviewAvatarBox: {
      borderRadius: "1rem",
      boxShadow: "0 0 0 1px rgba(0,229,255,0.22)",
    },
    userPreviewMainIdentifier: {
      color: "#F8FAFC",
      fontWeight: "700",
    },
    userPreviewSecondaryIdentifier: {
      color: "#94A3B8",
    },
    popoverCard: {
      borderRadius: "20px",
      background:
        "linear-gradient(135deg, rgba(16,24,39,0.96), rgba(7,11,22,0.94) 48%, rgba(36,20,75,0.9))",
      border: "1px solid rgba(255,255,255,0.08)",
      boxShadow: "0 24px 80px rgba(0,0,0,0.48)",
      backdropFilter: "blur(16px)",
      color: "#F8FAFC",
    },
    popoverFooter: {
      background: "rgba(5,8,22,0.78)",
      borderTop: "1px solid rgba(255,255,255,0.08)",
      color: "#94A3B8",
    },
  },
  layout: {
    applicationName: "TalentForge AI",
    logoPlacement: "none",
    socialButtonsPlacement: "top",
    socialButtonsVariant: "blockButton",
  },
} as const;

export const clerkUserProfileAppearance = {
  variables: {
    colorPrimary: "#00E5FF",
    colorBackground: "#071024",
    colorInputBackground: "#0B1224",
    colorInputText: "#F8FAFC",
    colorText: "#F8FAFC",
    colorTextSecondary: "#CBD5E1",
    colorNeutral: "#94A3B8",
    colorDanger: "#FB7185",
    borderRadius: "1rem",
    fontFamily: "var(--font-geist-sans)",
  },
  elements: {
    rootBox: {
      width: "100%",
      maxWidth: "100%",
    },
    cardBox: {
      width: "100%",
      maxWidth: "1120px",
      borderRadius: "28px",
      background:
        "linear-gradient(145deg, rgba(7,16,36,0.98), rgba(15,23,42,0.96) 52%, rgba(29,19,58,0.94))",
      border: "1px solid rgba(103,232,249,0.16)",
      boxShadow:
        "0 28px 100px rgba(0,0,0,0.42), 0 0 64px rgba(0,229,255,0.08), inset 0 1px 0 rgba(255,255,255,0.07)",
      backdropFilter: "blur(20px)",
      overflow: "hidden",
    },
    card: {
      width: "100%",
      minHeight: "680px",
      borderRadius: "28px",
      background:
        "radial-gradient(circle at 10% 0%, rgba(0,229,255,0.09), transparent 26%), radial-gradient(circle at 85% 8%, rgba(139,92,246,0.12), transparent 30%), rgba(7,16,36,0.96)",
      color: "#F8FAFC",
      boxShadow: "none",
      border: "0",
      padding: "0",
    },
    navbar: {
      background: "rgba(3,7,18,0.54)",
      borderRight: "1px solid rgba(255,255,255,0.08)",
      color: "#CBD5E1",
      padding: "1rem",
    },
    navbarButton: {
      borderRadius: "14px",
      color: "#CBD5E1",
      fontWeight: "650",
      transition: "background 180ms ease, color 180ms ease",
    },
    navbarButton__active: {
      background: "rgba(0,229,255,0.12)",
      color: "#FFFFFF",
      boxShadow: "inset 0 0 0 1px rgba(103,232,249,0.2)",
    },
    navbarButton__hover: {
      background: "rgba(255,255,255,0.06)",
      color: "#FFFFFF",
    },
    navbarButtonIcon: {
      color: "#67E8F9",
    },
    pageScrollBox: {
      background: "transparent",
      color: "#F8FAFC",
      padding: "1.5rem",
    },
    page: {
      background: "transparent",
      color: "#F8FAFC",
    },
    headerTitle: {
      color: "#FFFFFF",
      fontSize: "1.65rem",
      fontWeight: "700",
      letterSpacing: "-0.02em",
    },
    headerSubtitle: {
      color: "#CBD5E1",
      lineHeight: "1.6",
    },
    profileSectionTitleText: {
      color: "#FFFFFF",
      fontSize: "1rem",
      fontWeight: "700",
    },
    profileSectionPrimaryButton: {
      borderRadius: "14px",
      background: "linear-gradient(90deg, #00E5FF, #6A5CFF, #8B5CF6)",
      color: "#FFFFFF",
      fontWeight: "700",
      boxShadow: "0 0 20px rgba(0,229,255,0.18)",
    },
    profileSectionPrimaryButton__hover: {
      boxShadow: "0 0 28px rgba(0,229,255,0.24)",
    },
    profileSectionItem: {
      borderColor: "rgba(255,255,255,0.09)",
      color: "#F8FAFC",
    },
    profileSectionItemList: {
      background: "rgba(15,23,42,0.34)",
      borderRadius: "20px",
      border: "1px solid rgba(255,255,255,0.07)",
      overflow: "hidden",
    },
    profileSectionItemTitle: {
      color: "#FFFFFF",
      fontWeight: "650",
    },
    profileSectionItemSubtitle: {
      color: "#CBD5E1",
    },
    accordionTriggerButton: {
      color: "#FFFFFF",
      borderRadius: "16px",
      background: "rgba(255,255,255,0.035)",
      border: "1px solid rgba(255,255,255,0.07)",
    },
    accordionContent: {
      color: "#CBD5E1",
    },
    formFieldLabel: {
      color: "#F8FAFC",
      fontWeight: "650",
    },
    formFieldInput: {
      height: "2.875rem",
      borderRadius: "14px",
      border: "1px solid rgba(148,163,184,0.24)",
      background: "rgba(3,7,18,0.72)",
      color: "#F8FAFC",
      caretColor: "#00E5FF",
      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
    },
    formFieldInput__focus: {
      borderColor: "rgba(0,229,255,0.7)",
      boxShadow: "0 0 0 3px rgba(0,229,255,0.18)",
    },
    formButtonPrimary: {
      borderRadius: "14px",
      background: "linear-gradient(90deg, #00E5FF, #6A5CFF, #8B5CF6)",
      color: "#FFFFFF",
      fontWeight: "700",
      boxShadow: "0 0 20px rgba(0,229,255,0.18)",
    },
    formButtonPrimary__hover: {
      boxShadow: "0 0 28px rgba(0,229,255,0.24)",
    },
    formButtonReset: {
      color: "#CBD5E1",
      fontWeight: "650",
    },
    formFieldAction: {
      color: "#67E8F9",
      fontWeight: "700",
    },
    formFieldErrorText: {
      color: "#FDA4AF",
    },
    badge: {
      color: "#CFFAFE",
      background: "rgba(0,229,255,0.1)",
      border: "1px solid rgba(0,229,255,0.2)",
    },
    avatarBox: {
      boxShadow: "0 0 0 2px rgba(0,229,255,0.2), 0 0 30px rgba(0,229,255,0.14)",
    },
    userPreviewMainIdentifier: {
      color: "#FFFFFF",
      fontWeight: "700",
    },
    userPreviewSecondaryIdentifier: {
      color: "#CBD5E1",
    },
    footer: {
      background: "rgba(3,7,18,0.6)",
      borderTop: "1px solid rgba(255,255,255,0.08)",
    },
    footerActionText: {
      color: "#CBD5E1",
    },
    footerActionLink: {
      color: "#67E8F9",
      fontWeight: "700",
    },
    modalBackdrop: {
      background: "rgba(2,4,11,0.82)",
      backdropFilter: "blur(10px)",
    },
    modalContent: {
      background:
        "linear-gradient(145deg, rgba(7,16,36,0.98), rgba(15,23,42,0.96) 52%, rgba(29,19,58,0.94))",
      border: "1px solid rgba(103,232,249,0.16)",
      color: "#F8FAFC",
    },
  },
  layout: {
    applicationName: "TalentForge AI",
    logoPlacement: "none",
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
