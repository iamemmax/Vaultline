"use client";

import { ArrowDownLeft, ArrowUpRight, PiggyBank, Scale } from "lucide-react";
import { type ComponentType, type SVGProps } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { useTransactions } from "@/hooks/useData";
import { formatCurrency } from "@/lib/utils/format";

interface Tile {
  label: string;
  value: string;
  hint?: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  accent: "emerald" | "rose" | "violet" | "amber";
}

const accentStyles: Record<Tile["accent"], string> = {
  emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  rose: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  violet: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
};

export function StatStrip({ currency = "USD" }: { currency?: string }) {
  const { data, isPending } = useTransactions({ page: 1, pageSize: 100 });

  if (isPending) {
    return (
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-border bg-card p-4"
          >
            <Skeleton className="h-3 w-20" />
            <Skeleton className="mt-3 h-6 w-28" />
            <Skeleton className="mt-2 h-3 w-16" />
          </div>
        ))}
      </div>
    );
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthTx =
    data?.items.filter(
      (t) => t.status === "COMPLETED" && new Date(t.createdAt) >= startOfMonth,
    ) ?? [];

  const inflow = monthTx.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const outflow = monthTx.filter((t) => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
  const net = inflow - outflow;
  const saveRate = inflow > 0 ? Math.max(0, Math.round((net / inflow) * 100)) : 0;

  const monthLabel = now.toLocaleString(undefined, { month: "long" });

  const tiles: Tile[] = [
    {
      label: "Inflow",
      value: formatCurrency(inflow, currency, { compact: inflow >= 100_000 }),
      hint: `${monthLabel} to date`,
      icon: ArrowDownLeft,
      accent: "emerald",
    },
    {
      label: "Outflow",
      value: formatCurrency(outflow, currency, { compact: outflow >= 100_000 }),
      hint: `${monthLabel} to date`,
      icon: ArrowUpRight,
      accent: "rose",
    },
    {
      label: "Net change",
      value: `${net >= 0 ? "+" : "-"}${formatCurrency(Math.abs(net), currency, { compact: Math.abs(net) >= 100_000 })}`,
      hint: monthTx.length ? `${monthTx.length} transactions` : "No activity",
      icon: Scale,
      accent: "violet",
    },
    {
      label: "Save rate",
      value: `${saveRate}%`,
      hint: saveRate >= 20 ? "On track" : saveRate > 0 ? "Build the habit" : "—",
      icon: PiggyBank,
      accent: "amber",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {tiles.map(({ label, value, hint, icon: Icon, accent }) => (
        <div
          key={label}
          className="group rounded-xl border border-border bg-card p-4 transition-shadow hover:shadow-sm"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">{label}</p>
            <span className={`grid h-7 w-7 place-items-center rounded-md ${accentStyles[accent]}`}>
              <Icon className="h-3.5 w-3.5" />
            </span>
          </div>
          <p className="mt-2 text-xl font-semibold tabular-nums tracking-tight text-foreground">
            {value}
          </p>
          {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
        </div>
      ))}
    </div>
  );
}
