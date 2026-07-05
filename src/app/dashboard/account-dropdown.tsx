"use client";

import Link from "next/link";
import type { ReactNode, RefObject } from "react";
import { useEffect, useRef, useState } from "react";
import { useClerk, useUser } from "@clerk/nextjs";
import {
  BarChart3,
  BookOpen,
  Bot,
  ChevronRight,
  CreditCard,
  FileText,
  Gauge,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Moon,
  Settings,
  UserRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type AccountDropdownProfile = {
  email: string;
  imageUrl: string | null;
  initial: string;
  name: string | null;
  plan: string;
};

type MenuLinkItem = {
  type: "link";
  label: string;
  href: string;
  icon: LucideIcon;
};

type MenuActionItem = {
  type: "action";
  label: string;
  icon: LucideIcon;
  dialog: ComingSoonDialog;
};

type MenuItem = MenuLinkItem | MenuActionItem;

type ComingSoonDialog = {
  title: string;
  description: string;
};

const navigationItems: MenuItem[] = [
  { type: "link", label: "My Profile", href: "/dashboard/settings/account", icon: UserRound },
  { type: "link", label: "Settings", href: "/dashboard/settings", icon: Settings },
  { type: "link", label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { type: "link", label: "My Resumes", href: "/dashboard/resume/history", icon: FileText },
  { type: "link", label: "AI Preferences", href: "/dashboard/settings", icon: Bot },
];

const workspaceItems: MenuItem[] = [
  {
    type: "action",
    label: "Billing",
    icon: CreditCard,
    dialog: {
      title: "Billing coming soon",
      description: "Plan upgrades and billing management will be available from this workspace soon.",
    },
  },
  {
    type: "action",
    label: "Usage",
    icon: BarChart3,
    dialog: {
      title: "Usage dashboard coming soon",
      description: "Detailed usage, limits, and activity insights are not connected yet.",
    },
  },
  {
    type: "action",
    label: "Help & Support",
    icon: HelpCircle,
    dialog: {
      title: "Support center coming soon",
      description: "A guided help center and support workflow will be added soon.",
    },
  },
  {
    type: "action",
    label: "Documentation",
    icon: BookOpen,
    dialog: {
      title: "Documentation coming soon",
      description: "Product guides and workflow documentation are being prepared.",
    },
  },
];

export function AccountDropdown({ profile }: { profile: AccountDropdownProfile }) {
  const { user } = useUser();
  const clerk = useClerk();
  const [open, setOpen] = useState(false);
  const [dialog, setDialog] = useState<ComingSoonDialog | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const firstItemRef = useRef<HTMLAnchorElement>(null);

  const displayName = user?.fullName || profile.name || getDisplayName(profile.email);
  const email = user?.primaryEmailAddress?.emailAddress || profile.email;
  const imageUrl = user?.imageUrl || profile.imageUrl;
  const initial = displayName.trim().charAt(0).toUpperCase() || profile.initial;

  useEffect(() => {
    if (!open) {
      return;
    }

    const focusTimer = window.setTimeout(() => firstItemRef.current?.focus(), 40);

    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        setDialog(null);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  async function handleSignOut() {
    setIsSigningOut(true);

    try {
      await clerk.signOut({ redirectUrl: "/" });
    } catch (error) {
      setIsSigningOut(false);
      console.error("Unable to sign out from account menu.", error);
    }
  }

  function openDialog(nextDialog: ComingSoonDialog) {
    setOpen(false);
    setDialog(nextDialog);
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label="Open account menu"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-[#39C8FF] via-[#6A5CFF] to-[#8B5CF6] p-px shadow-[0_0_26px_rgba(59,168,255,0.26)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_34px_rgba(59,168,255,0.34)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/35"
      >
        <span className="relative grid h-10 w-10 overflow-hidden rounded-full bg-gradient-to-br from-[#3BA8FF] to-[#6A5CFF] text-sm font-bold text-white">
          {imageUrl ? (
            <span
              aria-hidden="true"
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${imageUrl})` }}
            />
          ) : null}
          <span className={imageUrl ? "sr-only" : "grid place-items-center"}>{initial}</span>
        </span>
      </button>

      <div
        role="menu"
        aria-label="Account menu"
        className={`absolute right-0 top-14 z-50 w-[min(calc(100vw-2rem),22rem)] origin-top-right overflow-hidden rounded-[1.35rem] border border-cyan-200/14 bg-[linear-gradient(145deg,rgba(7,16,36,0.94),rgba(8,13,30,0.94)_54%,rgba(24,16,50,0.92))] p-2 text-slate-200 shadow-[0_24px_90px_rgba(0,0,0,0.42),0_0_34px_rgba(0,229,255,0.08),inset_0_1px_0_rgba(255,255,255,0.07)] backdrop-blur-2xl transition duration-200 ${
          open
            ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
            : "pointer-events-none -translate-y-1 scale-[0.98] opacity-0"
        }`}
      >
        <div className="relative overflow-hidden rounded-[1.05rem] border border-white/[0.08] bg-white/[0.035] p-3.5">
          <span className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-[#8B5CF6]/20 blur-2xl" />
          <div className="relative flex items-center gap-3">
            <span className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-2xl border border-cyan-200/18 bg-gradient-to-br from-[#00E5FF]/45 to-[#8B5CF6]/45 text-lg font-bold text-white shadow-[0_0_24px_rgba(0,229,255,0.16)]">
              {imageUrl ? (
                <span
                  aria-hidden="true"
                  className="h-full w-full bg-cover bg-center"
                  style={{ backgroundImage: `url(${imageUrl})` }}
                />
              ) : (
                initial
              )}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{displayName}</p>
              <p className="mt-0.5 truncate text-xs text-slate-400">{email}</p>
              <span className="mt-2 inline-flex rounded-full border border-cyan-200/18 bg-cyan-300/8 px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-cyan-100">
                {profile.plan}
              </span>
            </div>
          </div>
        </div>

        <MenuSection label="Navigation">
          {navigationItems.map((item, index) => (
            <AccountMenuItem
              key={item.label}
              item={item}
              itemRef={index === 0 ? firstItemRef : undefined}
              onAction={openDialog}
            />
          ))}
        </MenuSection>

        <MenuSection label="Workspace">
          {workspaceItems.map((item) => (
            <AccountMenuItem key={item.label} item={item} onAction={openDialog} />
          ))}
        </MenuSection>

        <MenuSection label="Theme">
          <div className="flex h-10 items-center justify-between rounded-xl px-2.5 text-sm">
            <span className="flex items-center gap-2.5 font-medium text-slate-200">
              <MenuIcon icon={Moon} />
              Dark Mode
            </span>
            <span className="rounded-full border border-cyan-200/16 bg-cyan-300/8 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-cyan-100">
              On
            </span>
          </div>
        </MenuSection>

        <MenuSection label="Account" last>
          <button
            type="button"
            role="menuitem"
            disabled={isSigningOut}
            onClick={handleSignOut}
            className="group flex h-10 w-full items-center justify-between rounded-xl px-2.5 text-left text-sm font-semibold text-rose-200 outline-none transition duration-200 hover:bg-rose-400/10 hover:text-rose-100 focus-visible:bg-rose-400/10 focus-visible:ring-2 focus-visible:ring-rose-300/25 disabled:cursor-wait disabled:opacity-70"
          >
            <span className="flex items-center gap-2.5">
              <span className="grid h-7 w-7 place-items-center rounded-lg border border-rose-300/18 bg-rose-400/10 text-rose-200 transition duration-200 group-hover:bg-rose-400/16">
                <LogOut className="h-3.5 w-3.5" />
              </span>
              {isSigningOut ? "Signing out..." : "Sign Out"}
            </span>
          </button>
        </MenuSection>
      </div>

      {dialog ? (
        <ComingSoonModal dialog={dialog} onClose={() => setDialog(null)} />
      ) : null}
    </div>
  );
}

function MenuSection({
  label,
  children,
  last = false,
}: {
  label: string;
  children: ReactNode;
  last?: boolean;
}) {
  return (
    <section className={`px-1 py-2 ${last ? "" : "border-b border-white/[0.07]"}`}>
      <p className="mb-1.5 px-2 text-[0.63rem] font-semibold uppercase tracking-[0.22em] text-slate-500">
        {label}
      </p>
      <div className="grid gap-0.5">{children}</div>
    </section>
  );
}

function AccountMenuItem({
  item,
  itemRef,
  onAction,
}: {
  item: MenuItem;
  itemRef?: RefObject<HTMLAnchorElement | null>;
  onAction: (dialog: ComingSoonDialog) => void;
}) {
  const content = (
    <>
      <span className="flex items-center gap-2.5">
        <MenuIcon icon={item.icon} />
        {item.label}
      </span>
      <ChevronRight className="h-3.5 w-3.5 text-slate-600 transition duration-200 group-hover:translate-x-0.5 group-hover:text-cyan-100" />
    </>
  );

  const className =
    "group flex h-10 w-full items-center justify-between rounded-xl px-2.5 text-left text-sm font-medium text-slate-300 outline-none transition duration-200 hover:bg-white/[0.055] hover:text-white focus-visible:bg-white/[0.055] focus-visible:ring-2 focus-visible:ring-cyan-300/25";

  if (item.type === "link") {
    return (
      <Link ref={itemRef} href={item.href} role="menuitem" className={className}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      role="menuitem"
      onClick={() => onAction(item.dialog)}
      className={className}
    >
      {content}
    </button>
  );
}

function MenuIcon({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <span className="grid h-7 w-7 place-items-center rounded-lg border border-cyan-200/12 bg-cyan-300/7 text-cyan-100 shadow-[0_0_14px_rgba(0,229,255,0.06)] transition duration-200 group-hover:border-cyan-200/22 group-hover:bg-cyan-300/10">
      <Icon className="h-3.5 w-3.5" />
    </span>
  );
}

function ComingSoonModal({
  dialog,
  onClose,
}: {
  dialog: ComingSoonDialog;
  onClose: () => void;
}) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-[70] grid place-items-center bg-[#02040B]/72 px-4 backdrop-blur-md"
      onPointerDown={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="account-menu-dialog-title"
        className="w-full max-w-sm rounded-[1.35rem] border border-cyan-200/14 bg-[linear-gradient(145deg,rgba(7,16,36,0.96),rgba(12,18,38,0.96)_55%,rgba(29,19,58,0.94))] p-5 text-white shadow-[0_24px_90px_rgba(0,0,0,0.45),0_0_34px_rgba(0,229,255,0.08)]"
        onPointerDown={(event) => event.stopPropagation()}
      >
        <div className="grid h-11 w-11 place-items-center rounded-2xl border border-cyan-200/16 bg-cyan-300/8 text-cyan-100">
          <Gauge className="h-5 w-5" />
        </div>
        <h2 id="account-menu-dialog-title" className="mt-4 text-lg font-semibold tracking-tight">
          {dialog.title}
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-400">{dialog.description}</p>
        <button
          type="button"
          onClick={onClose}
          autoFocus
          className="mt-5 h-10 w-full rounded-xl border border-cyan-200/16 bg-cyan-300/8 text-sm font-semibold text-cyan-50 transition duration-200 hover:bg-cyan-300/12 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/30"
        >
          Close
        </button>
      </div>
    </div>
  );
}

function getDisplayName(email: string) {
  const localPart = email.split("@")[0] || "User";

  return localPart
    .split(/[._-]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
