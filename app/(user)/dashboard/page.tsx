"use client";

import { useMemo } from "react";

import { AccountInfo } from "@/components/dashboard/AccountInfo";
import { BalanceCard } from "@/components/dashboard/BalanceCard";
import { InvestmentProgress } from "@/components/dashboard/InvestmentProgress";
import { MarketWatch } from "@/components/dashboard/MarketWatch";
import { PortfolioChart } from "@/components/dashboard/PortfolioChart";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { StatStrip } from "@/components/dashboard/StatStrip";
import { useMe } from "@/hooks/useAuth";
import { useTransactions } from "@/hooks/useData";

function greetingFor(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function DashboardPage() {
  const me = useMe();
  const { data: txData } = useTransactions({ page: 1, pageSize: 100 });

  const monthlyChange = useMemo(() => {
    if (!txData?.items) return undefined;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    return txData.items
      .filter((t) => t.status === "COMPLETED" && new Date(t.createdAt) >= cutoff)
      .reduce((s, t) => s + t.amount, 0);
  }, [txData]);

  const now = new Date();
  const greeting = greetingFor(now.getHours());
  const dateLabel = now.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  const firstName = me.data?.fullName.split(" ")[0] ?? "";

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <header className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {dateLabel}
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
            {greeting}
            {firstName ? `, ${firstName}` : ""}.
          </h1>
        </div>
      </header>

      {/* Hero band */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <BalanceCard
            user={me.data}
            loading={me.isPending}
            monthlyChange={monthlyChange}
          />
        </div>
        <div className="xl:col-span-1">
          <InvestmentProgress />
        </div>
      </div>

      {/* Stats strip */}
      <StatStrip currency={me.data?.currency} />

      {/* Quick actions */}
      <QuickActions />

      {/* Portfolio + Markets */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <PortfolioChart currentBalance={me.data?.balance ?? 0} />
        </div>
        <div className="xl:col-span-1">
          <MarketWatch />
        </div>
      </div>

      {/* Activity + Account */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <RecentTransactions />
        </div>
        <div className="xl:col-span-1">
          <AccountInfo user={me.data} loading={me.isPending} />
        </div>
      </div>
    </div>
  );
}
