"use client";

import { useEffect, useId, useState, useSyncExternalStore } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import { useClerk } from "@clerk/nextjs";
import { AlertTriangle, LogOut, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SettingToggleProps = {
  label: string;
  storageKey: string;
  description?: string;
  defaultChecked?: boolean;
  disabled?: boolean;
  badge?: string;
};

export function SettingToggle({
  label,
  storageKey,
  description,
  defaultChecked = false,
  disabled = false,
  badge,
}: SettingToggleProps) {
  const [storedChecked, setStoredChecked] = useLocalStorageValue(
    storageKey,
    String(defaultChecked)
  );
  const checked = storedChecked === "true";
  const switchId = useId();

  useEffect(() => {
    if (storageKey === "talentforge.settings.reduced-motion") {
      document.documentElement.dataset.talentforgeReducedMotion = String(checked);
    }

    if (storageKey === "talentforge.settings.animations") {
      document.documentElement.dataset.talentforgeAnimations = String(checked);
    }

    if (storageKey === "talentforge.settings.compact-mode") {
      document.documentElement.dataset.talentforgeCompactMode = String(checked);
    }
  }, [checked, storageKey]);

  return (
    <div className="group flex min-h-12 items-center justify-between gap-4 rounded-[1rem] px-1 py-2 transition duration-300 hover:bg-white/[0.035] sm:px-2">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor={switchId} className="text-sm font-semibold text-white">
            {label}
          </label>
          {badge ? (
            <span className="rounded-full border border-purple-300/18 bg-purple-300/10 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-purple-100">
              {badge}
            </span>
          ) : null}
        </div>
        {description ? <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p> : null}
      </div>
      <button
        id={switchId}
        type="button"
        role="switch"
        aria-label={label}
        aria-checked={checked}
        disabled={disabled}
        onClick={() => setStoredChecked(String(!checked))}
        className={`relative h-6 w-11 shrink-0 rounded-full border transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/30 disabled:cursor-not-allowed disabled:opacity-55 ${
          checked
            ? "border-cyan-200/35 bg-gradient-to-r from-[#00E5FF]/55 to-[#8B5CF6]/55 shadow-[0_0_18px_rgba(0,229,255,0.2)]"
            : "border-white/[0.11] bg-[#030713]/80 shadow-inner"
        }`}
      >
        <span
          className={`absolute top-0.5 grid h-5 w-5 place-items-center rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.18)] transition duration-300 ${
            checked ? "left-5" : "left-0.5"
          }`}
        />
      </button>
    </div>
  );
}

export function SignOutAction() {
  const clerk = useClerk();
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleSignOut() {
    setIsSigningOut(true);

    try {
      await clerk.signOut({ redirectUrl: "/" });
    } catch (error) {
      setIsSigningOut(false);
      console.error("Unable to sign out from Settings.", error);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={isSigningOut}
      onClick={handleSignOut}
      aria-label="Sign out"
    >
      <LogOut className="h-3.5 w-3.5" />
      {isSigningOut ? "Signing out..." : "Sign Out"}
    </Button>
  );
}

type BillingActionProps = {
  children: ReactNode;
  plan: string;
  variant?: "default" | "outline";
};

export function BillingAction({ children, plan, variant = "outline" }: BillingActionProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button type="button" size="sm" variant={variant} onClick={() => setIsOpen(true)}>
        {children}
      </Button>
      <SettingsModal
        open={isOpen}
        title="Billing coming soon"
        onClose={() => setIsOpen(false)}
      >
        <div className="space-y-4">
          <div className="rounded-2xl border border-cyan-200/12 bg-cyan-300/[0.055] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Current plan
            </p>
            <p className="mt-2 text-xl font-semibold text-white">{plan}</p>
          </div>
          <p className="text-sm leading-6 text-slate-300">
            Upgrade plan coming soon. Billing controls will be connected once subscription
            management is enabled for TalentForge AI.
          </p>
          <Button type="button" size="sm" onClick={() => setIsOpen(false)}>
            Close
          </Button>
        </div>
      </SettingsModal>
    </>
  );
}

type PreferenceSelectProps = {
  label: string;
  storageKey: string;
  defaultValue: string;
  options: Array<{ label: string; value: string }>;
};

export function PreferenceSelect({
  label,
  storageKey,
  defaultValue,
  options,
}: PreferenceSelectProps) {
  const [storedValue, setStoredValue] = useLocalStorageValue(storageKey, defaultValue);
  const value = options.some((option) => option.value === storedValue)
    ? storedValue
    : defaultValue;
  const selectId = useId();

  return (
    <div className="flex min-h-12 items-center justify-between gap-4 px-1 py-2 sm:px-2">
      <label htmlFor={selectId} className="text-sm font-semibold text-white">
        {label}
      </label>
      <select
        id={selectId}
        value={value}
        onChange={(event) => setStoredValue(event.target.value)}
        className="h-9 w-40 rounded-xl border border-white/[0.1] bg-[#071024]/80 px-3 text-sm font-medium text-slate-200 outline-none transition duration-300 focus:border-cyan-200/40 focus:ring-2 focus:ring-cyan-300/20"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

type DangerActionButtonProps = {
  label: string;
  title: string;
  confirmation: string;
  resultMessage: string;
};

export function DangerActionButton({
  label,
  title,
  confirmation,
  resultMessage,
}: DangerActionButtonProps) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isResultOpen, setIsResultOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsConfirmOpen(true)}
        className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-red-300/22 bg-red-400/8 px-3 text-xs font-semibold text-red-100 shadow-[0_0_14px_rgba(248,113,113,0.06)] transition duration-300 hover:-translate-y-0.5 hover:border-red-200/38 hover:bg-red-400/12 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300/25"
      >
        <AlertTriangle className="h-3.5 w-3.5" />
        {label}
      </button>
      <SettingsModal
        open={isConfirmOpen}
        title={title}
        tone="danger"
        onClose={() => setIsConfirmOpen(false)}
      >
        <div className="space-y-4">
          <p className="text-sm leading-6 text-slate-300">{confirmation}</p>
          <div className="flex flex-wrap justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              className="border-red-300/24 bg-red-400/12 text-red-100 shadow-[0_0_18px_rgba(248,113,113,0.12)] hover:bg-red-400/18"
              onClick={() => {
                setIsConfirmOpen(false);
                setIsResultOpen(true);
              }}
            >
              I understand
            </Button>
          </div>
        </div>
      </SettingsModal>
      <SettingsModal
        open={isResultOpen}
        title="Backend action not connected yet"
        onClose={() => setIsResultOpen(false)}
      >
        <div className="space-y-4">
          <p className="text-sm leading-6 text-slate-300">{resultMessage}</p>
          <Button type="button" size="sm" onClick={() => setIsResultOpen(false)}>
            Close
          </Button>
        </div>
      </SettingsModal>
    </>
  );
}

type SettingsModalProps = {
  open: boolean;
  title: string;
  children: ReactNode;
  tone?: "neutral" | "danger";
  onClose: () => void;
};

function SettingsModal({
  open,
  title,
  children,
  tone = "neutral",
  onClose,
}: SettingsModalProps) {
  if (!open) {
    return null;
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      onClose();
    }
  }

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-50 grid place-items-center bg-[#02040b]/72 px-4 backdrop-blur-md"
      onMouseDown={onClose}
      onKeyDown={handleKeyDown}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-modal-title"
        tabIndex={-1}
        className={cn(
          "relative w-full max-w-md overflow-hidden rounded-[1.5rem] border bg-[linear-gradient(145deg,rgba(7,16,36,0.96),rgba(16,24,39,0.86)_55%,rgba(5,10,22,0.95))] p-5 text-white shadow-[0_30px_110px_rgba(0,0,0,0.45),0_0_42px_rgba(0,229,255,0.08)] outline-none backdrop-blur-2xl",
          tone === "danger"
            ? "border-red-300/18"
            : "border-cyan-200/12"
        )}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-xl border border-white/[0.08] bg-white/[0.035] text-slate-300 transition hover:bg-white/[0.07] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/25"
        >
          <X className="h-4 w-4" />
        </button>
        <h3 id="settings-modal-title" className="pr-10 text-xl font-semibold text-white">
          {title}
        </h3>
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}

function useLocalStorageValue(key: string, defaultValue: string) {
  const getSnapshot = () => {
    if (typeof window === "undefined") {
      return defaultValue;
    }

    return window.localStorage.getItem(key) ?? defaultValue;
  };

  const subscribe = (callback: () => void) => {
    if (typeof window === "undefined") {
      return () => {};
    }

    const handleStorage = (event: StorageEvent) => {
      if (event.key === key) {
        callback();
      }
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("talentforge-settings-storage", callback);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("talentforge-settings-storage", callback);
    };
  };

  const value = useSyncExternalStore(subscribe, getSnapshot, () => defaultValue);

  const setValue = (nextValue: string) => {
    window.localStorage.setItem(key, nextValue);
    window.dispatchEvent(new Event("talentforge-settings-storage"));
  };

  return [value, setValue] as const;
}
