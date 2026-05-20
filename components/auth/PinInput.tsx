"use client";

import * as React from "react";

import { cn } from "@/lib/utils/cn";

interface Props {
  value: string;
  onChange: (value: string) => void;
  autoFocus?: boolean;
  disabled?: boolean;
  invalid?: boolean;
}

/** 4-digit masked PIN input. */
export function PinInput({ value, onChange, autoFocus, disabled, invalid }: Props) {
  const length = 4;
  const refs = React.useRef<Array<HTMLInputElement | null>>([]);
  const digits = React.useMemo(() => {
    const padded = value.padEnd(length, " ").slice(0, length).split("");
    return padded.map((c) => (c === " " ? "" : c));
  }, [value]);

  React.useEffect(() => {
    if (autoFocus) refs.current[0]?.focus();
  }, [autoFocus]);

  const setIndex = (idx: number, v: string) => {
    const next = [...digits];
    next[idx] = v;
    onChange(next.join("").trim());
  };

  return (
    <div className="flex items-center gap-2" role="group" aria-label="Transaction PIN">
      {Array.from({ length }).map((_, idx) => (
        <input
          key={idx}
          ref={(el) => {
            refs.current[idx] = el;
          }}
          inputMode="numeric"
          maxLength={1}
          type="password"
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
          }}
          onPaste={(e) => {
            e.preventDefault();
            const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
            if (!pasted) return;
            onChange(pasted);
            refs.current[Math.min(pasted.length, length - 1)]?.focus();
          }}
          className={cn(
            "h-12 w-12 rounded-md border border-input bg-background text-center text-xl font-semibold tabular-nums shadow-sm",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 focus:border-primary",
            "disabled:opacity-50",
            invalid && "border-destructive focus:ring-destructive",
          )}
        />
      ))}
    </div>
  );
}
