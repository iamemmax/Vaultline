"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Search, XCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import {
  CartesianGrid,
  Cell,
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
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  useAdminAllTransactions,
  useAdminApproveTx,
  useAdminPendingTx,
  useAdminRejectTx,
} from "@/hooks/useAdmin";
import { formatCurrency, formatSmartDate, humanStatus } from "@/lib/utils/format";
import {
  transactionRejectSchema,
  type TransactionRejectInput,
} from "@/schemas/admin.schema";
import type { Transaction, TransactionStatus } from "@/types";

function statusVariant(status: TransactionStatus): "default" | "success" | "warning" | "destructive" {
  if (status === "COMPLETED") return "success";
  if (status === "PENDING" || status === "AWAITING_APPROVAL") return "warning";
  if (status === "FAILED" || status === "CANCELLED") return "destructive";
  return "default";
}

export default function AdminTransactionsPage() {
  return (
    <div className="w-full space-y-6">
      <PageHeader
        eyebrow="Operations"
        title="Transactions"
        description="Approve pending withdrawals and audit every transaction across the platform."
      />

      <TransactionsInsights />

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">Pending approval</TabsTrigger>
          <TabsTrigger value="all">All transactions</TabsTrigger>
        </TabsList>
        <TabsContent value="pending" className="pt-4">
          <PendingQueue />
        </TabsContent>
        <TabsContent value="all" className="pt-4">
          <AllTransactions />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function TransactionsInsights() {
  const pending = useAdminPendingTx();
  const sample = useAdminAllTransactions({ page: 1, pageSize: 500 });
  const [range, setRange] = useState<RangeDays>(30);

  const { volumeSeries, totalVolume } = useMemo(() => {
    const buckets = bucketDays(range);
    let total = 0;
    for (const t of sample.data?.items ?? []) {
      if (t.status !== "COMPLETED") continue;
      const key = t.createdAt.slice(0, 10);
      if (!buckets.has(key)) continue;
      const v = Math.abs(t.amount);
      buckets.set(key, (buckets.get(key) ?? 0) + v);
      total += v;
    }
    return {
      volumeSeries: Array.from(buckets, ([date, volume]) => ({ date, volume })),
      totalVolume: total,
    };
  }, [sample.data, range]);

  const typeMix = useMemo(() => {
    const counts = new Map<string, number>();
    for (const t of sample.data?.items ?? []) {
      if (!isWithinDays(t.createdAt, range)) continue;
      counts.set(t.type, (counts.get(t.type) ?? 0) + 1);
    }
    const colors: Record<string, string> = {
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
    return Array.from(counts.entries())
      .map(([type, value]) => ({
        name: humanStatus(type),
        value,
        fill: colors[type] ?? "var(--color-primary)",
      }))
      .sort((a, b) => b.value - a.value);
  }, [sample.data, range]);

  const pendingValue = useMemo(
    () => (pending.data ?? []).reduce((s, t) => s + Math.abs(t.amount), 0),
    [pending.data],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold tracking-tight">Activity & flows</h2>
          <p className="text-xs text-muted-foreground">
            Filter every insight below by time range.
          </p>
        </div>
        <RangeToggle value={range} onChange={setRange} />
      </div>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
      <AdminInsight
        title="Platform volume"
        description={`Daily transaction value · last ${range} days.`}
        meta={
          <p className="text-xl font-semibold tabular-nums">
            {sample.isPending ? "—" : formatCurrency(totalVolume)}
          </p>
        }
      >
        {sample.isPending ? (
          <Skeleton className="h-[180px] w-full flex-1" />
        ) : (
          <div className="h-[180px] w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={volumeSeries} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
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
                  contentStyle={{
                    background: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  formatter={(v) => [formatCurrency(Number(v)), "Volume"]}
                />
                <Line
                  type="monotone"
                  dataKey="volume"
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
        title="Transactions by type"
        description={`Volume mix · last ${range} days.`}
        meta={
          <p className="text-xl font-semibold tabular-nums">
            {sample.isPending ? "—" : typeMix.reduce((s, d) => s + d.value, 0)}
          </p>
        }
      >
        {sample.isPending ? (
          <Skeleton className="h-[180px] w-full flex-1" />
        ) : typeMix.length === 0 ? (
          <p className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
            No transactions in this window.
          </p>
        ) : (
          <div className="flex flex-1 items-center gap-3">
            <div className="h-[180px] w-[180px] shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={typeMix}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={48}
                    outerRadius={78}
                    paddingAngle={2}
                    stroke="none"
                  >
                    {typeMix.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "var(--color-card)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="flex-1 space-y-1.5 text-xs">
              {typeMix.slice(0, 6).map((s) => (
                <li key={s.name} className="flex items-center justify-between gap-2">
                  <span className="inline-flex min-w-0 items-center gap-2">
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ background: s.fill }}
                    />
                    <span className="truncate text-muted-foreground">{s.name}</span>
                  </span>
                  <span className="shrink-0 font-semibold tabular-nums">{s.value}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </AdminInsight>

      <AdminInsight
        title="Awaiting your approval"
        description="Pending value & count to clear."
      >
        {pending.isPending ? (
          <Skeleton className="h-[180px] w-full flex-1" />
        ) : (
          <div className="flex flex-1 flex-col justify-center gap-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Value held up
              </p>
              <p className="mt-1 text-3xl font-semibold tabular-nums">
                {formatCurrency(pendingValue)}
              </p>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border bg-muted/40 px-3 py-2">
              <span className="text-xs text-muted-foreground">
                Items in queue
              </span>
              <span className="text-lg font-semibold tabular-nums">
                {pending.data?.length ?? 0}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Switch to the <span className="font-medium text-foreground">Pending approval</span> tab below to act.
            </p>
          </div>
        )}
      </AdminInsight>
      </div>
    </div>
  );
}

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

function isWithinDays(iso: string, days: number) {
  const cutoff = new Date();
  cutoff.setHours(0, 0, 0, 0);
  cutoff.setDate(cutoff.getDate() - (days - 1));
  return new Date(iso) >= cutoff;
}

const PENDING_PAGE_SIZE = 10;

function PendingQueue() {
  const { data, isPending } = useAdminPendingTx();
  const approve = useAdminApproveTx();
  const [rejecting, setRejecting] = useState<Transaction | null>(null);
  const [page, setPage] = useState(1);

  const items = data ?? [];
  const totalPages = Math.max(1, Math.ceil(items.length / PENDING_PAGE_SIZE));
  const pageItems = items.slice(
    (page - 1) * PENDING_PAGE_SIZE,
    page * PENDING_PAGE_SIZE,
  );

  return (
    <>
      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Reference</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPending ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="ml-auto h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="ml-auto h-7 w-32" /></TableCell>
                </TableRow>
              ))
            ) : !items.length ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <EmptyState
                    icon={CheckCircle2}
                    title="Nothing pending"
                    description="All caught up. New withdrawal requests will show up here."
                  />
                </TableCell>
              </TableRow>
            ) : (
              pageItems.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="font-mono text-xs">{tx.reference}</TableCell>
                  <TableCell className="text-sm">
                    <div className="flex flex-col">
                      <span className="font-medium">{tx.counterparty ?? "—"}</span>
                      <span className="text-xs text-muted-foreground">{tx.description}</span>
                    </div>
                  </TableCell>
                  <TableCell>{humanStatus(tx.type)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatSmartDate(tx.createdAt)}</TableCell>
                  <TableCell className="text-right tabular-nums font-semibold">
                    {formatCurrency(tx.amount, tx.currency)}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => approve.mutate(tx.id)}
                        loading={approve.isPending}
                      >
                        <CheckCircle2 />
                        Approve
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => setRejecting(tx)}>
                        <XCircle />
                        Reject
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {items.length > PENDING_PAGE_SIZE ? (
        <div className="flex items-center justify-between pt-3 text-sm">
          <span className="text-muted-foreground">
            Page {page} of {totalPages} · {items.length} pending
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
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

      <RejectDialog tx={rejecting} onClose={() => setRejecting(null)} />
    </>
  );
}

function RejectDialog({ tx, onClose }: { tx: Transaction | null; onClose: () => void }) {
  const reject = useAdminRejectTx();
  const form = useForm<TransactionRejectInput>({
    resolver: zodResolver(transactionRejectSchema),
    defaultValues: { reason: "" },
  });

  return (
    <Dialog open={!!tx} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        {tx ? (
          <>
            <DialogHeader>
              <DialogTitle>Reject transaction</DialogTitle>
              <DialogDescription>
                {tx.reference} · {formatCurrency(tx.amount, tx.currency)}. Funds will be refunded
                if previously held.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form
                className="space-y-4"
                onSubmit={form.handleSubmit((v) =>
                  reject.mutate(
                    { id: tx.id, body: v },
                    {
                      onSuccess: () => {
                        form.reset();
                        onClose();
                      },
                    },
                  ),
                )}
                noValidate
              >
                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reason</FormLabel>
                      <FormControl>
                        <Textarea rows={3} placeholder="Explain why this is being rejected" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                  <Button type="submit" variant="destructive" loading={reject.isPending}>
                    Reject transaction
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

const TX_TYPES = [
  "DEPOSIT",
  "WITHDRAWAL",
  "TRANSFER_IN",
  "TRANSFER_OUT",
  "INVESTMENT",
  "INVESTMENT_RETURN",
  "CRYPTO_BUY",
  "CRYPTO_SELL",
  "CRYPTO_SEND",
  "CRYPTO_RECEIVE",
  "FEE",
];

function AllTransactions() {
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string | undefined>();
  const [type, setType] = useState<string | undefined>();
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");

  const { data, isPending } = useAdminAllTransactions({
    page,
    pageSize: 25,
    q: q || undefined,
    status,
    type,
    from: from || undefined,
    to: to || undefined,
  });
  const totalPages = data ? Math.max(1, Math.ceil(data.total / 25)) : 1;

  const hasFilters = !!(q || status || type || from || to);
  const clearFilters = () => {
    setQ("");
    setStatus(undefined);
    setType(undefined);
    setFrom("");
    setTo("");
    setPage(1);
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1 lg:col-span-2">
            <Label className="text-xs">Search</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setPage(1);
                }}
                className="pl-9"
                placeholder="Reference, description, party"
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Status</Label>
            <Select
              value={status ?? "all"}
              onValueChange={(v) => {
                setStatus(v === "all" ? undefined : v);
                setPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {["COMPLETED", "PENDING", "FAILED", "AWAITING_APPROVAL", "CANCELLED"].map((s) => (
                  <SelectItem key={s} value={s}>{humanStatus(s)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Type</Label>
            <Select
              value={type ?? "all"}
              onValueChange={(v) => {
                setType(v === "all" ? undefined : v);
                setPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                {TX_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>{humanStatus(t)}</SelectItem>
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

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Reference</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPending
              ? Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="ml-auto h-4 w-20" /></TableCell>
                  </TableRow>
                ))
              : data?.items.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell className="font-mono text-xs">{tx.reference}</TableCell>
                    <TableCell className="text-sm">{tx.description}</TableCell>
                    <TableCell className="text-sm">{humanStatus(tx.type)}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(tx.status)}>{humanStatus(tx.status)}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatSmartDate(tx.createdAt)}</TableCell>
                    <TableCell
                      className={`text-right tabular-nums font-semibold ${tx.amount > 0 ? "text-success" : ""}`}
                    >
                      {tx.amount > 0 ? "+" : ""}
                      {formatCurrency(tx.amount, tx.currency)}
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </Card>

      {data && data.total > 25 ? (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Page {page} of {totalPages} · {data.total} transactions
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
