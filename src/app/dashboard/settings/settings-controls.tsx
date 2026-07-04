"use client";

import { useEffect, useId, useState, useSyncExternalStore } from "react";
import { useClerk } from "@clerk/nextjs";
import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";

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
