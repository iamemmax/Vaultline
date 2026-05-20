"use client";

import { CalendarClock, Lock, TrendingUp } from "lucide-react";
import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyInvestments } from "@/hooks/useData";
import { formatCurrency, formatDate } from "@/lib/utils/format";

function daysBetween(a: Date, b: Date) {
  return Math.max(0, Math.ceil((a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24)));
}

export function InvestmentProgress() {
  const { data, isPending } = useMyInvestments();

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-start justify-between gap-2">
        <div>
          <CardTitle>Investments</CardTitle>
          <p className="mt-1 text-xs text-muted-foreground">Locked positions & yield</p>
        </div>
        <Link
          href="/investments"
          className="text-xs font-medium text-primary hover:underline"
        >
          Manage
        </Link>
      </CardHeader>
      <CardContent className="space-y-5">
        {isPending ? (
          <>
            <Skeleton className="h-9 w-44" />
            <Skeleton className="h-2 w-full rounded-full" />
            <Skeleton className="h-4 w-3/4" />
          </>
        ) : (() => {
          const active = (data ?? []).filter((i) => i.status === "ACTIVE");
          if (active.length === 0) {
            return (
              <div className="rounded-lg border border-dashed border-border bg-muted/30 px-4 py-6 text-center">
                <Lock className="mx-auto h-5 w-5 text-muted-foreground" />
                <p className="mt-2 text-sm font-medium">Nothing locked yet</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Start an investment to grow your idle balance.
                </p>
                <Link
                  href="/investments"
                  className="mt-3 inline-block text-xs font-medium text-primary hover:underline"
                >
                  Browse packages →
                </Link>
              </div>
            );
          }

          const locked = active.reduce((s, i) => s + i.principal, 0);
          const projected = active.reduce(
            (s, i) => s + i.principal * (i.roiPercent / 100),
            0,
          );
          const next = active
            .map((i) => ({ ...i, maturesAtDate: new Date(i.maturesAt) }))
            .sort((a, b) => a.maturesAtDate.getTime() - b.maturesAtDate.getTime())[0];
          const totalDays = next
            ? daysBetween(new Date(next.maturesAt), new Date(next.startedAt))
            : 0;
          const elapsedDays = next
            ? daysBetween(new Date(), new Date(next.startedAt))
            : 0;
          const progressPct = totalDays > 0
            ? Math.min(100, Math.round((elapsedDays / totalDays) * 100))
            : 0;
          const remainingDays = next ? daysBetween(new Date(next.maturesAt), new Date()) : 0;

          return (
            <>
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Locked</p>
                <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight">
                  {formatCurrency(locked)}
                </p>
                <p className="mt-1 inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-500">
                  <TrendingUp className="h-3 w-3" />
                  +{formatCurrency(projected)} projected
                </p>
              </div>

              {next ? (
                <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
                      <CalendarClock className="h-3.5 w-3.5 text-muted-foreground" />
                      Next maturity
                    </span>
                    <span className="text-muted-foreground">
                      {formatDate(next.maturesAt, "MMM d")}
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[0.7rem] text-muted-foreground">
                    <span className="truncate pr-2">{next.packageName}</span>
                    <span className="tabular-nums">{remainingDays}d left</span>
                  </div>
                </div>
              ) : null}

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{active.length} active position{active.length === 1 ? "" : "s"}</span>
                <span className="tabular-nums">
                  avg {(
                    active.reduce((s, i) => s + i.roiPercent, 0) / active.length
                  ).toFixed(1)}
                  % ROI
                </span>
              </div>
            </>
          );
        })()}
      </CardContent>
    </Card>
  );
}
