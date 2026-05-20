"use client";

import { useCountdown } from "@/hooks/useCountdown";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils/cn";

interface Props {
  startedAt: string;
  maturesAt: string;
  compact?: boolean;
}

/**
 * Renders a 4-cell digital countdown with a progress bar.
 * Marks as "Matured" once complete.
 */
export function LockCountdown({ startedAt, maturesAt, compact }: Props) {
  const c = useCountdown(maturesAt, startedAt);

  if (c.isComplete) {
    return (
      <div className="rounded-md bg-success/10 px-3 py-2 text-sm font-medium text-success">
        Matured · ready to collect
      </div>
    );
  }

  const cells: { label: string; value: number }[] = compact
    ? [
        { label: "d", value: c.days },
        { label: "h", value: c.hours },
        { label: "m", value: c.minutes },
      ]
    : [
        { label: "Days", value: c.days },
        { label: "Hours", value: c.hours },
        { label: "Minutes", value: c.minutes },
        { label: "Seconds", value: c.seconds },
      ];

  return (
    <div className="space-y-2">
      <div className={cn("grid gap-1.5", compact ? "grid-cols-3" : "grid-cols-4")}>
        {cells.map((cell) => (
          <div
            key={cell.label}
            className="rounded-md border border-border bg-card px-2 py-1.5 text-center"
          >
            <p className="font-mono text-lg font-semibold tabular-nums leading-none">
              {String(cell.value).padStart(2, "0")}
            </p>
            <p className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
              {cell.label}
            </p>
          </div>
        ))}
      </div>
      <Progress value={c.progressPercent} />
    </div>
  );
}
