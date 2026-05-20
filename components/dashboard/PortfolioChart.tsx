"use client";

import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTransactions } from "@/hooks/useData";
import { cn } from "@/lib/utils/cn";
import { formatCurrency } from "@/lib/utils/format";

type Range = 7 | 30 | 90;
const RANGES: { value: Range; label: string }[] = [
  { value: 7, label: "7D" },
  { value: 30, label: "30D" },
  { value: 90, label: "90D" },
];

export function PortfolioChart({ currentBalance }: { currentBalance: number }) {
  const [range, setRange] = useState<Range>(30);
  const { data, isPending } = useTransactions({ page: 1, pageSize: 150 });

  const { series, change, changePct } = useMemo(() => {
    const days: { date: string; balance: number }[] = [];
    let running = currentBalance;
    const transactions = data?.items ?? [];

    const byDay = new Map<string, number>();
    for (const tx of transactions) {
      const key = tx.createdAt.slice(0, 10);
      byDay.set(key, (byDay.get(key) ?? 0) + tx.amount);
    }

    for (let i = 0; i < range; i++) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      days.push({ date: key, balance: Math.max(0, running) });
      running -= byDay.get(key) ?? 0;
    }
    const reversed = days.reverse();
    const startBalance = reversed[0]?.balance ?? 0;
    const endBalance = reversed[reversed.length - 1]?.balance ?? 0;
    const diff = endBalance - startBalance;
    const pct = startBalance > 0 ? (diff / startBalance) * 100 : 0;
    return { series: reversed, change: diff, changePct: pct };
  }, [data, currentBalance, range]);

  const positive = change >= 0;

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <CardTitle>Portfolio</CardTitle>
          <CardDescription>
            {isPending ? (
              <Skeleton className="h-3.5 w-32" />
            ) : (
              <span className="inline-flex items-center gap-2">
                <span
                  className={cn(
                    "tabular-nums",
                    positive ? "text-emerald-600 dark:text-emerald-500" : "text-rose-600 dark:text-rose-500",
                  )}
                >
                  {positive ? "+" : "-"}
                  {formatCurrency(Math.abs(change))}
                </span>
                <span className="text-muted-foreground">
                  ({positive ? "+" : ""}
                  {changePct.toFixed(1)}%) · last {range} days
                </span>
              </span>
            )}
          </CardDescription>
        </div>
        <div className="inline-flex rounded-md border border-border bg-muted/40 p-0.5">
          {RANGES.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setRange(value)}
              className={cn(
                "rounded px-2.5 py-1 text-xs font-medium transition-colors",
                range === value
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col">
        {isPending ? (
          <Skeleton className="h-[220px] w-full flex-1" />
        ) : (
          <div className="h-[220px] w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="balanceFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={(d) =>
                    new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric" })
                  }
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                  stroke="var(--color-muted-foreground)"
                  minTickGap={32}
                />
                <YAxis
                  tickFormatter={(v) => `$${Math.round(Number(v) / 1000)}k`}
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                  stroke="var(--color-muted-foreground)"
                  width={48}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  labelFormatter={(d) =>
                    new Date(d as string).toLocaleDateString(undefined, {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })
                  }
                  formatter={(v) => [formatCurrency(Number(v)), "Balance"]}
                />
                <Area
                  type="monotone"
                  dataKey="balance"
                  stroke="var(--color-primary)"
                  strokeWidth={2}
                  fill="url(#balanceFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
