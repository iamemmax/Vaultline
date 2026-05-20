"use client";

import {
  AlertCircle,
  ArrowRight,
  Bitcoin,
  ClipboardList,
  Clock,
  Receipt,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { AdminInsight } from "@/components/admin/AdminInsight";
import { RangeToggle, type RangeDays } from "@/components/admin/RangeToggle";
import { StatsGrid } from "@/components/admin/StatsGrid";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useAdminAllTransactions,
  useAdminAuditLog,
  useAdminPendingTx,
  useAdminStats,
} from "@/hooks/useAdmin";
import { formatCurrency, formatSmartDate, humanStatus } from "@/lib/utils/format";
import type { AuditLogEntry, Transaction } from "@/types";

export default function AdminOverviewPage() {
  const stats = useAdminStats();
  const pendingTx = useAdminPendingTx();
  const auditLog = useAdminAuditLog({ page: 1, pageSize: 5 });
  const txSample = useAdminAllTransactions({ page: 1, pageSize: 500 });
  const [range, setRange] = useState<RangeDays>(30);

  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="w-full space-y-6">
      <PageHeader
        eyebrow={today}
        title="Operations overview"
        description="Platform health, pending approvals, and recent audit activity at a glance."
        actions={
          <Button variant="outline" asChild>
            <Link href="/admin/transactions">
              <Receipt />
              All transactions
            </Link>
          </Button>
        }
      />

      <PendingApprovalsCallout
        count={stats.data?.pendingApprovals ?? 0}
        loading={stats.isPending}
      />

      <StatsGrid data={stats.data} isPending={stats.isPending} />

      {/* Flows section header with global range toggle */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold tracking-tight">
            Flows & activity
          </h2>
          <p className="text-xs text-muted-foreground">
            Filter every chart below by time range.
          </p>
        </div>
        <RangeToggle value={range} onChange={setRange} />
      </div>

      {/* Charts row 1 — volume + users */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <VolumeChart sample={txSample.data?.items} loading={txSample.isPending} days={range} />
        <UsersChart trend={stats.data?.trend} loading={stats.isPending} days={range} />
      </div>

      {/* Charts row 2 — type, crypto, investment flows */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <TypeBreakdownChart sample={txSample.data?.items} loading={txSample.isPending} days={range} />
        <CryptoFlowChart sample={txSample.data?.items} loading={txSample.isPending} days={range} />
        <InvestmentFlowChart sample={txSample.data?.items} loading={txSample.isPending} days={range} />
      </div>

      {/* Operations panels */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <PendingTransactionsPanel
          data={pendingTx.data}
          loading={pendingTx.isPending}
        />
        <AuditLogPanel
          data={auditLog.data?.items ?? []}
          loading={auditLog.isPending}
        />
      </div>
    </div>
  );
}

/* ─────────────── helpers ─────────────── */

function bucketDays(days: number) {
  const out = new Map<string, number>();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    out.set(d.toISOString().slice(0, 10), 0);
  }
  return out;
}

function isWithinRange(iso: string, days: number) {
  const cutoff = new Date();
  cutoff.setHours(0, 0, 0, 0);
  cutoff.setDate(cutoff.getDate() - (days - 1));
  return new Date(iso) >= cutoff;
}

const TYPE_COLORS: Record<string, string> = {
  DEPOSIT: "var(--color-chart-2)",
  WITHDRAWAL: "var(--color-chart-3)",
  TRANSFER_IN: "var(--color-chart-1)",
  TRANSFER_OUT: "var(--color-chart-4)",
  INVESTMENT: "var(--color-chart-5)",
  INVESTMENT_RETURN: "var(--color-success)",
  CRYPTO_BUY: "var(--color-chart-1)",
  CRYPTO_SELL: "var(--color-chart-4)",
  CRYPTO_SEND: "var(--color-destructive)",
  CRYPTO_RECEIVE: "var(--color-chart-2)",
  FEE: "var(--color-muted-foreground)",
};

/* ─────────────── Volume chart ─────────────── */

function VolumeChart({
  sample,
  loading,
  days,
}: {
  sample?: Transaction[];
  loading: boolean;
  days: number;
}) {
  const { series, total } = useMemo(() => {
    const days_ = bucketDays(days);
    let total = 0;
    for (const t of sample ?? []) {
      if (t.status !== "COMPLETED") continue;
      const key = t.createdAt.slice(0, 10);
      if (!days_.has(key)) continue;
      const v = Math.abs(t.amount);
      days_.set(key, (days_.get(key) ?? 0) + v);
      total += v;
    }
    return {
      series: Array.from(days_, ([date, volume]) => ({ date, volume })),
      total,
    };
  }, [sample, days]);

  return (
    <AdminInsight
      title="Platform volume"
      description={`Sum of completed transaction value · last ${days} days.`}
      meta={
        <p className="text-xl font-semibold tabular-nums">
          {loading ? "—" : formatCurrency(total)}
        </p>
      }
    >
      {loading ? (
        <Skeleton className="h-[200px] w-full flex-1" />
      ) : (
        <div className="h-[200px] w-full flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={series} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="volFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.32} />
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
                minTickGap={28}
              />
              <YAxis
                tickFormatter={(v) => `$${Math.round(Number(v) / 1000)}k`}
                tickLine={false}
                axisLine={false}
                fontSize={11}
                stroke="var(--color-muted-foreground)"
                width={44}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(v) => [formatCurrency(Number(v)), "Volume"]}
              />
              <Area
                type="monotone"
                dataKey="volume"
                stroke="var(--color-primary)"
                strokeWidth={2}
                fill="url(#volFill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </AdminInsight>
  );
}

/* ─────────────── Users chart ─────────────── */

function UsersChart({
  trend,
  loading,
  days,
}: {
  trend?: { date: string; users: number }[];
  loading: boolean;
  days: number;
}) {
  const { series, total } = useMemo(() => {
    if (!trend) return { series: [], total: 0 };
    const sliced = trend.slice(-days);
    return {
      series: sliced,
      total: sliced.reduce((s, d) => s + d.users, 0),
    };
  }, [trend, days]);

  return (
    <AdminInsight
      title="New users"
      description={`Sign-ups · last ${days} days.`}
      meta={
        <p className="text-xl font-semibold tabular-nums">
          {loading ? "—" : total}
        </p>
      }
    >
      {loading ? (
        <Skeleton className="h-[200px] w-full flex-1" />
      ) : (
        <div className="h-[200px] w-full flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={series} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
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
                minTickGap={28}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                fontSize={11}
                stroke="var(--color-muted-foreground)"
                width={28}
                allowDecimals={false}
              />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="users" fill="var(--color-primary)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </AdminInsight>
  );
}

/* ─────────────── Type breakdown chart ─────────────── */

function TypeBreakdownChart({
  sample,
  loading,
  days,
}: {
  sample?: Transaction[];
  loading: boolean;
  days: number;
}) {
  const data = useMemo(() => {
    const counts = new Map<string, number>();
    for (const t of sample ?? []) {
      if (!isWithinRange(t.createdAt, days)) continue;
      counts.set(t.type, (counts.get(t.type) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .map(([type, value]) => ({
        name: humanStatus(type),
        value,
        fill: TYPE_COLORS[type] ?? "var(--color-primary)",
      }))
      .sort((a, b) => b.value - a.value);
  }, [sample, days]);

  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <AdminInsight
      title="Transactions by type"
      description={`Volume mix · last ${days} days.`}
      meta={
        <p className="text-xl font-semibold tabular-nums">
          {loading ? "—" : total}
        </p>
      }
    >
      {loading ? (
        <Skeleton className="h-[200px] w-full flex-1" />
      ) : data.length === 0 ? (
        <p className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
          No transactions in this window.
        </p>
      ) : (
        <div className="flex flex-1 items-center gap-3">
          <div className="h-[180px] w-[180px] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={48}
                  outerRadius={78}
                  paddingAngle={2}
                  stroke="none"
                >
                  {data.map((d) => (
                    <Cell key={d.name} fill={d.fill} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="flex-1 space-y-1.5 text-xs">
            {data.slice(0, 6).map((d) => (
              <li key={d.name} className="flex items-center justify-between gap-2">
                <span className="inline-flex min-w-0 items-center gap-2">
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ background: d.fill }}
                  />
                  <span className="truncate text-muted-foreground">{d.name}</span>
                </span>
                <span className="shrink-0 font-semibold tabular-nums">{d.value}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </AdminInsight>
  );
}

/* ─────────────── Crypto flow chart ─────────────── */

function CryptoFlowChart({
  sample,
  loading,
  days,
}: {
  sample?: Transaction[];
  loading: boolean;
  days: number;
}) {
  const { series, sent, received } = useMemo(() => {
    const buckets = bucketDays(days);
    const sentByDay = new Map<string, number>(buckets);
    const recvByDay = new Map<string, number>(buckets);
    let sent = 0;
    let received = 0;
    for (const t of sample ?? []) {
      if (t.status !== "COMPLETED") continue;
      const key = t.createdAt.slice(0, 10);
      if (!buckets.has(key)) continue;
      const v = Math.abs(t.amount);
      if (t.type === "CRYPTO_SEND") {
        sentByDay.set(key, (sentByDay.get(key) ?? 0) + v);
        sent += v;
      } else if (t.type === "CRYPTO_RECEIVE") {
        recvByDay.set(key, (recvByDay.get(key) ?? 0) + v);
        received += v;
      }
    }
    return {
      series: Array.from(buckets.keys()).map((date) => ({
        date,
        sent: sentByDay.get(date) ?? 0,
        received: recvByDay.get(date) ?? 0,
      })),
      sent,
      received,
    };
  }, [sample, days]);

  return (
    <AdminInsight
      title="Crypto flow"
      description={`Sends vs receives · last ${days} days.`}
      meta={
        <div className="space-y-0.5 text-right">
          <p className="text-xs text-emerald-600 dark:text-emerald-500 tabular-nums">
            +{formatCurrency(received, "USD", { compact: received >= 10_000 })}
          </p>
          <p className="text-xs text-rose-600 dark:text-rose-500 tabular-nums">
            -{formatCurrency(sent, "USD", { compact: sent >= 10_000 })}
          </p>
        </div>
      }
    >
      {loading ? (
        <Skeleton className="h-[200px] w-full flex-1" />
      ) : sent === 0 && received === 0 ? (
        <p className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
          <Bitcoin className="mr-2 h-4 w-4" />
          No crypto activity in this window.
        </p>
      ) : (
        <div className="h-[200px] w-full flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={series} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
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
                minTickGap={28}
              />
              <YAxis
                tickFormatter={(v) => `$${Math.round(Number(v) / 1000)}k`}
                tickLine={false}
                axisLine={false}
                fontSize={11}
                stroke="var(--color-muted-foreground)"
                width={40}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(v) => [formatCurrency(Number(v)), ""]}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" iconSize={8} />
              <Line
                type="monotone"
                dataKey="received"
                name="Received"
                stroke="var(--color-chart-2)"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="sent"
                name="Sent"
                stroke="var(--color-destructive)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </AdminInsight>
  );
}

/* ─────────────── Investment flow chart ─────────────── */

function InvestmentFlowChart({
  sample,
  loading,
  days,
}: {
  sample?: Transaction[];
  loading: boolean;
  days: number;
}) {
  const { series, newPositions, payouts } = useMemo(() => {
    const buckets = bucketDays(days);
    const newByDay = new Map<string, number>(buckets);
    const retByDay = new Map<string, number>(buckets);
    let newPositions = 0;
    let payouts = 0;
    for (const t of sample ?? []) {
      if (t.status !== "COMPLETED") continue;
      const key = t.createdAt.slice(0, 10);
      if (!buckets.has(key)) continue;
      const v = Math.abs(t.amount);
      if (t.type === "INVESTMENT") {
        newByDay.set(key, (newByDay.get(key) ?? 0) + v);
        newPositions += v;
      } else if (t.type === "INVESTMENT_RETURN") {
        retByDay.set(key, (retByDay.get(key) ?? 0) + v);
        payouts += v;
      }
    }
    return {
      series: Array.from(buckets.keys()).map((date) => ({
        date,
        locked: newByDay.get(date) ?? 0,
        returned: retByDay.get(date) ?? 0,
      })),
      newPositions,
      payouts,
    };
  }, [sample, days]);

  return (
    <AdminInsight
      title="Investment flow"
      description={`New positions vs payouts · last ${days} days.`}
      meta={
        <div className="space-y-0.5 text-right">
          <p className="text-xs tabular-nums text-foreground">
            {formatCurrency(newPositions, "USD", { compact: newPositions >= 10_000 })}
          </p>
          <p className="text-xs text-emerald-600 dark:text-emerald-500 tabular-nums">
            +{formatCurrency(payouts, "USD", { compact: payouts >= 10_000 })}
          </p>
        </div>
      }
    >
      {loading ? (
        <Skeleton className="h-[200px] w-full flex-1" />
      ) : newPositions === 0 && payouts === 0 ? (
        <p className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
          <TrendingUp className="mr-2 h-4 w-4" />
          No investment activity in this window.
        </p>
      ) : (
        <div className="h-[200px] w-full flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={series} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
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
                minTickGap={28}
              />
              <YAxis
                tickFormatter={(v) => `$${Math.round(Number(v) / 1000)}k`}
                tickLine={false}
                axisLine={false}
                fontSize={11}
                stroke="var(--color-muted-foreground)"
                width={40}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(v) => [formatCurrency(Number(v)), ""]}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" iconSize={8} />
              <Bar dataKey="locked" name="Locked" fill="var(--color-chart-5)" radius={[3, 3, 0, 0]} />
              <Bar dataKey="returned" name="Returned" fill="var(--color-success)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </AdminInsight>
  );
}

const tooltipStyle = {
  background: "var(--color-card)",
  border: "1px solid var(--color-border)",
  borderRadius: 8,
  fontSize: 12,
} as const;

/* ─────────────── Pending approvals callout ─────────────── */

function PendingApprovalsCallout({
  count,
  loading,
}: {
  count: number;
  loading: boolean;
}) {
  if (loading) return <Skeleton className="h-16 w-full rounded-xl" />;
  if (count === 0) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-4 py-3 text-sm">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
          <Receipt className="h-4 w-4" />
        </span>
        <div>
          <p className="font-medium">No transactions waiting for approval</p>
          <p className="text-xs text-muted-foreground">
            You&apos;re all caught up. New requests will surface here.
          </p>
        </div>
      </div>
    );
  }
  return (
    <Link
      href="/admin/transactions"
      className="group flex items-center gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm transition-colors hover:bg-amber-500/15"
    >
      <span className="grid h-9 w-9 place-items-center rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400">
        <AlertCircle className="h-4 w-4" />
      </span>
      <div className="flex-1">
        <p className="font-semibold">
          {count} transaction{count === 1 ? "" : "s"} awaiting approval
        </p>
        <p className="text-xs text-muted-foreground">
          Review and approve or reject before settlement cut-off.
        </p>
      </div>
      <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
    </Link>
  );
}

/* ─────────────── Pending transactions panel ─────────────── */

function PendingTransactionsPanel({
  data,
  loading,
}: {
  data?: Transaction[];
  loading: boolean;
}) {
  return (
    <Card className="flex h-full flex-col">
      <div className="flex flex-row items-center justify-between p-6 pb-3">
        <div>
          <h3 className="text-base font-semibold">Pending transactions</h3>
          <p className="text-xs text-muted-foreground">Awaiting your approval.</p>
        </div>
        <Link
          href="/admin/transactions"
          className="text-xs font-medium text-primary hover:underline"
        >
          View all
        </Link>
      </div>
      <CardContent className="flex-1 px-0 pb-3 pt-0">
        {loading ? (
          <ul className="divide-y divide-border">
            {Array.from({ length: 4 }).map((_, i) => (
              <li key={i} className="flex items-center gap-3 px-6 py-3">
                <Skeleton className="h-9 w-9 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3 w-40" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-4 w-20" />
              </li>
            ))}
          </ul>
        ) : !data?.length ? (
          <div className="px-6 pt-4">
            <EmptyState
              icon={Receipt}
              title="Nothing pending"
              description="When users submit transactions that need review, they'll appear here."
            />
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {data.slice(0, 5).map((tx) => (
              <li key={tx.id} className="flex items-center gap-3 px-6 py-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <Clock className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {humanStatus(tx.type)}
                    {tx.counterparty ? (
                      <span className="text-muted-foreground"> · {tx.counterparty}</span>
                    ) : null}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {formatSmartDate(tx.createdAt)}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p
                    className={`text-sm font-semibold tabular-nums ${
                      tx.amount >= 0
                        ? "text-emerald-600 dark:text-emerald-500"
                        : "text-rose-600 dark:text-rose-500"
                    }`}
                  >
                    {tx.amount >= 0 ? "+" : ""}
                    {formatCurrency(tx.amount, tx.currency)}
                  </p>
                  <Badge variant="warning" className="mt-0.5 text-[10px]">
                    Pending
                  </Badge>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

/* ─────────────── Audit log panel ─────────────── */

function AuditLogPanel({
  data,
  loading,
}: {
  data: AuditLogEntry[];
  loading: boolean;
}) {
  return (
    <Card className="flex h-full flex-col">
      <div className="flex flex-row items-center justify-between p-6 pb-3">
        <div>
          <h3 className="text-base font-semibold">Recent audit log</h3>
          <p className="text-xs text-muted-foreground">Sensitive actions across the platform.</p>
        </div>
        <Link
          href="/admin/audit-log"
          className="text-xs font-medium text-primary hover:underline"
        >
          Open log
        </Link>
      </div>
      <CardContent className="flex-1 px-0 pb-3 pt-0">
        {loading ? (
          <ul className="divide-y divide-border">
            {Array.from({ length: 5 }).map((_, i) => (
              <li key={i} className="flex items-start gap-3 px-6 py-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3 w-44" />
                  <Skeleton className="h-3 w-28" />
                </div>
              </li>
            ))}
          </ul>
        ) : !data.length ? (
          <div className="px-6 pt-4">
            <EmptyState
              icon={ClipboardList}
              title="No audit events yet"
              description="Admin actions will be recorded and shown here."
            />
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {data.map((entry) => (
              <li key={entry.id} className="flex items-start gap-3 px-6 py-3">
                <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/10 text-[0.65rem] font-bold uppercase text-primary">
                  {actorInitials(entry.actorName)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">
                    <span className="font-medium">{entry.actorName}</span>
                    <span className="text-muted-foreground"> · {humanizeAction(entry.action)}</span>
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {entry.target ? `${entry.target} · ` : ""}
                    {formatSmartDate(entry.createdAt)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function actorInitials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function humanizeAction(action: string) {
  return action.replace(/_/g, " ").toLowerCase();
}
