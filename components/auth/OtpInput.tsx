"use client";

import * as React from "react";

import { cn } from "@/lib/utils/cn";

interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  autoFocus?: boolean;
  disabled?: boolean;
  ariaLabel?: string;
  invalid?: boolean;
}

/**
 * Six-box numeric input. Backspace moves left, paste fills all boxes,
 * left/right arrows navigate. Single source of truth via the `value` prop.
 */
export function OtpInput({
  length = 6,
  value,
  onChange,
  autoFocus,
  disabled,
  ariaLabel = "One-time code",
  invalid,
}: OtpInputProps) {
  const refs = React.useRef<Array<HTMLInputElement | null>>([]);
  const digits = React.useMemo(() => {
    const arr = value.padEnd(length, " ").slice(0, length).split("");
    return arr.map((c) => (c === " " ? "" : c));
  }, [value, length]);

  React.useEffect(() => {
    if (autoFocus) refs.current[0]?.focus();
  }, [autoFocus]);

  const setIndex = (idx: number, val: string) => {
    const next = [...digits];
    next[idx] = val;
    onChange(next.join("").trim());
  };

  return (
    <div
      className="flex items-center justify-center gap-2"
      role="group"
      aria-label={ariaLabel}
    >
      {Array.from({ length }).map((_, idx) => (
        <input
          key={idx}
          ref={(el) => {
            refs.current[idx] = el;
          }}
          inputMode="numeric"
          autoComplete={idx === 0 ? "one-time-code" : "off"}
          maxLength={1}
          value={digits[idx] ?? ""}
          disabled={disabled}
          aria-invalid={invalid}
          onChange={(e) => {
            const raw = e.target.value.replace(/\D/g, "");
            if (!raw) {
              setIndex(idx, "");
              return;
            }
            setIndex(idx, raw[raw.length - 1] ?? "");
            if (idx < length - 1) refs.current[idx + 1]?.focus();
          }}
          onKeyDown={(e) => {
            if (e.key === "Backspace" && !digits[idx] && idx > 0) {
              refs.current[idx - 1]?.focus();
            }
            if (e.key === "ArrowLeft" && idx > 0) refs.current[idx - 1]?.focus();
            if (e.key === "ArrowRight" && idx < length - 1) refs.current[idx + 1]?.focus();
          }}
          onPaste={(e) => {
            e.preventDefault();
            const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
            if (!pasted) return;
            onChange(pasted);
            const focusTo = Math.min(pasted.length, length - 1);
            refs.current[focusTo]?.focus();
          }}
          className={cn(
            "h-12 w-10 rounded-md border border-input bg-background text-center text-lg font-semibold tabular-nums shadow-sm",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 focus:border-primary",
            "disabled:opacity-50",
            invalid && "border-destructive focus:ring-destructive",
          )}
        />
      ))}
    </div>
  );
}
