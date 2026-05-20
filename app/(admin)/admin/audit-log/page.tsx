"use client";

import { ClipboardList, Search } from "lucide-react";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { AdminInsight } from "@/components/admin/AdminInsight";
import { RangeToggle, type RangeDays } from "@/components/admin/RangeToggle";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAdminAuditLog } from "@/hooks/useAdmin";
import { truncateMiddle } from "@/lib/utils/format";

const ROWS_PER_PAGE = 25;

export default function AdminAuditLogPage() {
  // Single large pull — we filter and paginate client-side so filters apply
  // consistently to the chart, the top-actions list, and the table.
  const { data, isPending } = useAdminAuditLog({ page: 1, pageSize: 500 });

  const [page, setPage] = useState(1);
  const [range, setRange] = useState<RangeDays>(14);
  const [action, setAction] = useState<string | undefined>();
  const [actorQ, setActorQ] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const actionOptions = useMemo(() => {
    const set = new Set<string>();
    for (const e of data?.items ?? []) set.add(e.action);
    return Array.from(set).sort();
  }, [data]);

  const filteredEntries = useMemo(() => {
    const entries = data?.items ?? [];
    const q = actorQ.trim().toLowerCase();
    return entries.filter((e) => {
      if (action && e.action !== action) return false;
      if (q && !e.actorName?.toLowerCase().includes(q)) return false;
      if (from && e.createdAt < from) return false;
      if (to && e.createdAt > `${to}T23:59:59`) return false;
      return true;
    });
  }, [data, action, actorQ, from, to]);

  const { perDay, topActions, totalRecent } = useMemo(() => {
    const byDay = new Map<string, number>();
    for (let i = range - 1; i >= 0; i--) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      byDay.set(d.toISOString().slice(0, 10), 0);
    }
    for (const e of filteredEntries) {
      const key = e.createdAt.slice(0, 10);
      if (byDay.has(key)) byDay.set(key, (byDay.get(key) ?? 0) + 1);
    }
    const days = Array.from(byDay, ([date, count]) => ({ date, count }));

    const counts = new Map<string, number>();
    for (const e of filteredEntries) {
      counts.set(e.action, (counts.get(e.action) ?? 0) + 1);
    }
    const top = Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([a, count]) => ({ action: humanizeAction(a), count }));

    return {
      perDay: days,
      topActions: top,
      totalRecent: days.reduce((s, d) => s + d.count, 0),
    };
  }, [filteredEntries, range]);

  const totalPages = Math.max(1, Math.ceil(filteredEntries.length / ROWS_PER_PAGE));
  const pageItems = filteredEntries.slice(
    (page - 1) * ROWS_PER_PAGE,
    page * ROWS_PER_PAGE,
  );

  const hasFilters = !!(action || actorQ || from || to);
  const clearFilters = () => {
    setAction(undefined);
    setActorQ("");
    setFrom("");
    setTo("");
    setPage(1);
  };

  return (
    <div className="w-full space-y-6">
      <PageHeader
        eyebrow="Compliance"
        title="Audit log"
        description="Every privileged action and its outcome, in chronological order."
      />

      {/* Insights — surfaced first so charts are always visible */}
      <InsightsRow
        loading={isPending}
        perDay={perDay}
        topActions={topActions}
        totalRecent={totalRecent}
        range={range}
        onRangeChange={setRange}
      />

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <div className="space-y-1 lg:col-span-2">
            <Label className="text-xs">Actor</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={actorQ}
                onChange={(e) => {
                  setActorQ(e.target.value);
                  setPage(1);
                }}
                className="pl-9"
                placeholder="Search by actor name"
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Action</Label>
            <Select
              value={action ?? "all"}
              onValueChange={(v) => {
                setAction(v === "all" ? undefined : v);
                setPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All actions</SelectItem>
                {actionOptions.map((a) => (
                  <SelectItem key={a} value={a}>{humanizeAction(a)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">From</Label>
            <Input
              type="date"
              value={from}
              onChange={(e) => {
                setFrom(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">To</Label>
            <Input
              type="date"
              value={to}
              onChange={(e) => {
                setTo(e.target.value);
                setPage(1);
              }}
            />
          </div>
          {hasFilters ? (
            <div className="flex items-end">
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear filters
              </Button>
            </div>
          ) : null}
        </div>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>When</TableHead>
              <TableHead>Actor</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Target</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPending ? (
              Array.from({ length: 8 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                </TableRow>
              ))
            ) : pageItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5}>
                  <EmptyState
                    icon={ClipboardList}
                    title={hasFilters ? "No matching entries" : "No audit entries"}
                    description={
                      hasFilters
                        ? "Try removing filters or expanding the date range."
                        : "Once an admin acts on the platform, an immutable record will appear here."
                    }
                  />
                </TableCell>
              </TableRow>
            ) : (
              pageItems.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                    {new Date(e.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-sm">
                    <div className="flex flex-col">
                      <span className="font-medium">{e.actorName ?? "System"}</span>
                      <span className="text-xs text-muted-foreground">
                        {e.actorId ? truncateMiddle(e.actorId, 14) : "—"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{e.action}</TableCell>
                  <TableCell className="font-mono text-xs">
                    {e.target ? truncateMiddle(e.target, 14) : "—"}
                  </TableCell>
                  <TableCell
                    className="max-w-md truncate text-sm text-muted-foreground"
                    title={e.metadata ? JSON.stringify(e.metadata) : ""}
                  >
                    {e.metadata ? JSON.stringify(e.metadata) : "—"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {filteredEntries.length > ROWS_PER_PAGE ? (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Page {page} of {totalPages} · {filteredEntries.length} entries
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

const tooltipStyle = {
  background: "var(--color-card)",
  border: "1px solid var(--color-border)",
  borderRadius: 8,
  fontSize: 12,
} as const;

function humanizeAction(action: string) {
  return action.replace(/_/g, " ").toLowerCase();
}

interface InsightsRowProps {
  loading: boolean;
  perDay: { date: string; count: number }[];
  topActions: { action: string; count: number }[];
  totalRecent: number;
  range: RangeDays;
  onRangeChange: (r: RangeDays) => void;
}

function InsightsRow({
  loading,
  perDay,
  topActions,
  totalRecent,
  range,
  onRangeChange,
}: InsightsRowProps) {
  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      <AdminInsight
        title={`Activity · last ${range} days`}
        description="Privileged actions recorded per day."
        meta={
          <div className="flex items-center gap-3">
            <p className="text-2xl font-semibold tabular-nums">
              {loading ? "—" : totalRecent}
            </p>
            <RangeToggle
              value={range}
              onChange={onRangeChange}
              options={[
                { value: 7, label: "7D" },
                { value: 14, label: "14D" },
                { value: 30, label: "30D" },
              ]}
            />
          </div>
        }
      >
        {loading ? (
          <Skeleton className="h-55 w-full" />
        ) : (
          <div className="h-55 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={perDay} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
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
                  minTickGap={24}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                  stroke="var(--color-muted-foreground)"
                  width={28}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  labelFormatter={(d) =>
                    new Date(d as string).toLocaleDateString(undefined, {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })
                  }
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="var(--color-primary)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </AdminInsight>

      <AdminInsight
        title="Top actions"
        description="Most-recorded events under your current filters."
      >
        {loading ? (
          <Skeleton className="h-55 w-full" />
        ) : topActions.length === 0 ? (
          <p className="flex h-55 items-center justify-center text-sm text-muted-foreground">
            No events match these filters.
          </p>
        ) : (
          <div className="h-55 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topActions}
                layout="vertical"
                margin={{ top: 4, right: 12, left: 8, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
                <XAxis
                  type="number"
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                  stroke="var(--color-muted-foreground)"
                  allowDecimals={false}
                />
                <YAxis
                  type="category"
                  dataKey="action"
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                  stroke="var(--color-muted-foreground)"
                  width={120}
                />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" fill="var(--color-primary)" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </AdminInsight>
    </div>
  );
}
