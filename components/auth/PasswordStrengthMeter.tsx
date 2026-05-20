"use client";

import { Check, X } from "lucide-react";

import { passwordChecks, passwordStrength } from "@/schemas/password";
import { cn } from "@/lib/utils/cn";

interface Props {
  value: string;
}

const strengthLabels = ["Too weak", "Weak", "Fair", "Strong", "Excellent"];

export function PasswordStrengthMeter({ value }: Props) {
  const { score, passed, total } = passwordStrength(value);

  return (
    <div className="space-y-2">
      <div className="flex h-1.5 gap-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "flex-1 rounded-full transition-colors duration-200",
              i < score
                ? score === 1
                  ? "bg-destructive"
                  : score === 2
                    ? "bg-warning"
                    : score === 3
                      ? "bg-primary"
                      : "bg-success"
                : "bg-muted",
            )}
          />
        ))}
      </div>
      {value.length > 0 ? (
        <p className="text-xs text-muted-foreground">
          {strengthLabels[score] ?? "Too weak"} · {passed}/{total} checks
        </p>
      ) : null}
      <ul className="grid grid-cols-1 gap-1 sm:grid-cols-2">
        {passwordChecks.map((c) => {
          const ok = c.test(value);
          return (
            <li
              key={c.label}
              className={cn(
                "flex items-center gap-1.5 text-xs",
                ok ? "text-success" : "text-muted-foreground",
              )}
            >
              {ok ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
              {c.label}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
