"use client";

import { Activity, DollarSign, TrendingUp, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils/format";

interface StatsData {
  totalUsers: number;
  totalDeposits: number;
  activeInvestmentValue: number;
  activeInvestmentCount: number;
  pendingApprovals: number;
  last24hVolume: number;
}

export function StatsGrid({ data, isPending }: { data?: StatsData; isPending?: boolean }) {
  const tiles: { icon: LucideIcon; label: string; value: string; sub?: string }[] = data
    ? [
        {
          icon: Users,
          label: "Total users",
          value: data.totalUsers.toLocaleString(),
          sub: `${data.pendingApprovals} pending`,
        },
        {
          icon: DollarSign,
          label: "Total deposits",
          value: formatCurrency(data.totalDeposits),
          sub: "across all accounts",
        },
        {
          icon: TrendingUp,
          label: "Active investments",
          value: formatCurrency(data.activeInvestmentValue),
          sub: `${data.activeInvestmentCount} positions`,
        },
        {
          icon: Activity,
          label: "24h volume",
          value: formatCurrency(data.last24hVolume),
          sub: "last 24 hours",
        },
      ]
    : [];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {isPending || !data
        ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)
        : tiles.map((t) => (
            <Card key={t.label}>
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div>
                  <CardDescription>{t.label}</CardDescription>
                  <CardTitle className="mt-1 text-2xl tabular-nums">{t.value}</CardTitle>
                </div>
                <span className="grid h-8 w-8 place-items-center rounded-md bg-primary/10 text-primary">
                  <t.icon className="h-4 w-4" />
                </span>
              </CardHeader>
              <CardContent className="pt-0 text-xs text-muted-foreground">{t.sub}</CardContent>
            </Card>
          ))}
    </div>
  );
}
