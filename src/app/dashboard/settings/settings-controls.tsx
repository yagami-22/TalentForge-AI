"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";

type SettingToggleProps = {
  label: string;
  description: string;
  defaultChecked?: boolean;
  disabled?: boolean;
  badge?: string;
};

export function SettingToggle({
  label,
  description,
  defaultChecked = false,
  disabled = false,
  badge,
}: SettingToggleProps) {
  const [checked, setChecked] = useState(defaultChecked);

  return (
    <div className="group flex items-center justify-between gap-4 rounded-[1.1rem] border border-white/[0.07] bg-[#071024]/54 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition duration-300 hover:border-cyan-300/16 hover:bg-white/[0.045]">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold text-white">{label}</p>
          {badge ? (
            <span className="rounded-full border border-purple-300/18 bg-purple-300/10 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-purple-100">
              {badge}
            </span>
          ) : null}
        </div>
        <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => setChecked((value) => !value)}
        className={`relative h-7 w-12 shrink-0 rounded-full border transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/30 disabled:cursor-not-allowed disabled:opacity-55 ${
          checked
            ? "border-cyan-200/35 bg-gradient-to-r from-[#00E5FF]/55 to-[#8B5CF6]/55 shadow-[0_0_22px_rgba(0,229,255,0.24)]"
            : "border-white/[0.11] bg-[#030713]/80 shadow-inner"
        }`}
      >
        <span
          className={`absolute top-1 grid h-5 w-5 place-items-center rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.18)] transition duration-300 ${
            checked ? "left-6" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}

type ConfirmActionButtonProps = {
  label: string;
  confirmation: string;
  disabled?: boolean;
  tone?: "danger" | "neutral";
};

export function ConfirmActionButton({
  label,
  confirmation,
  disabled = false,
  tone = "neutral",
}: ConfirmActionButtonProps) {
  function handleClick() {
    if (window.confirm(confirmation)) {
      window.alert("This action is prepared for the settings interface and needs backend support before it can run.");
    }
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={handleClick}
      className={`inline-flex h-9 items-center justify-center gap-2 rounded-xl border px-3 text-xs font-semibold transition duration-300 focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-55 ${
        tone === "danger"
          ? "border-red-300/24 bg-red-400/10 text-red-100 shadow-[0_0_18px_rgba(248,113,113,0.08)] hover:-translate-y-0.5 hover:border-red-200/42 hover:bg-red-400/14 focus-visible:ring-red-300/25"
          : "border-white/[0.1] bg-[#071024]/70 text-slate-200 hover:-translate-y-0.5 hover:border-cyan-200/24 hover:bg-cyan-300/8 focus-visible:ring-cyan-300/25"
      }`}
    >
      {tone === "danger" ? <AlertTriangle className="h-3.5 w-3.5" /> : null}
      {label}
    </button>
  );
}
