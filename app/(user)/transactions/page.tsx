"use client";

import { Download, Filter, Receipt, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Badge } from "@/components/ui/badge";
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTransactions, type TxFilters } from "@/hooks/useData";
import {
  formatCurrency,
  formatSmartDate,
  humanStatus,
  truncateMiddle,
} from "@/lib/utils/format";
import type { Transaction, TransactionStatus } from "@/types";

const TYPES = [
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
const STATUSES = ["COMPLETED", "PENDING", "FAILED", "AWAITING_APPROVAL", "CANCELLED"];

function statusVariant(status: TransactionStatus): "default" | "success" | "warning" | "destructive" {
  if (status === "COMPLETED") return "success";
  if (status === "PENDING" || status === "AWAITING_APPROVAL") return "warning";
  if (status === "FAILED" || status === "CANCELLED") return "destructive";
  return "default";
}

export default function TransactionsPage() {
  const [filters, setFilters] = useState<TxFilters>({ page: 1, pageSize: 20 });
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const finalFilters = useMemo(() => ({ ...filters, q: search.trim() || undefined }), [filters, search]);
  const { data, isPending, isFetching } = useTransactions(finalFilters);

  const totalPages = data ? Math.max(1, Math.ceil(data.total / (filters.pageSize ?? 20))) : 1;

  const exportCsv = () => {
    if (!data?.items.length) return;
    const headers = ["id", "date", "type", "status", "amount", "currency", "description", "reference"];
    const rows = data.items.map((t) =>
      [
        t.id,
        t.createdAt,
        t.type,
        t.status,
        t.amount,
        t.currency,
        `"${t.description.replace(/"/g, '""')}"`,
        t.reference,
      ].join(","),
    );
    const blob = new Blob([headers.join(",") + "\n" + rows.join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transactions-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const selected = data?.items.find((t) => t.id === selectedId) ?? null;

  // Summary chips reflect the currently-loaded page of results
  const pageInflow =
    data?.items.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0) ?? 0;
  const pageOutflow =
    data?.items
      .filter((t) => t.amount < 0)
      .reduce((s, t) => s + Math.abs(t.amount), 0) ?? 0;

  return (
    <div className="w-full space-y-6">
      <PageHeader
        eyebrow="Account history"
        title="Transactions"
        description="Filter, search, and export every movement on your account."
        actions={
          <Button variant="outline" onClick={exportCsv} disabled={!data?.items.length}>
            <Download />
            Export CSV
          </Button>
        }
      />

      {/* Summary chips */}
      {data && data.items.length ? (
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5">
            <span className="text-xs text-muted-foreground">Showing</span>
            <span className="font-semibold tabular-nums">{data.items.length}</span>
            <span className="text-xs text-muted-foreground">of {data.total}</span>
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span className="text-xs text-muted-foreground">Inflow</span>
            <span className="font-semibold tabular-nums text-emerald-600 dark:text-emerald-500">
              +{formatCurrency(pageInflow)}
            </span>
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
            <span className="text-xs text-muted-foreground">Outflow</span>
            <span className="font-semibold tabular-nums text-rose-600 dark:text-rose-500">
              -{formatCurrency(pageOutflow)}
            </span>
          </span>
        </div>
      ) : null}

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
          <div className="space-y-1">
            <Label htmlFor="search" className="text-xs">Search</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Description, reference, party…"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setFilters((f) => ({ ...f, page: 1 }));
                }}
                className="pl-9"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Type</Label>
            <Select
              value={filters.type ?? "all"}
              onValueChange={(v) =>
                setFilters((f) => ({ ...f, type: v === "all" ? undefined : v, page: 1 }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                {TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {humanStatus(t)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Status</Label>
            <Select
              value={filters.status ?? "all"}
              onValueChange={(v) =>
                setFilters((f) => ({ ...f, status: v === "all" ? undefined : v, page: 1 }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {humanStatus(s)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">From</Label>
              <Input
                type="date"
                value={filters.from ?? ""}
                onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value || undefined, page: 1 }))}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">To</Label>
              <Input
                type="date"
                value={filters.to ?? ""}
                onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value || undefined, page: 1 }))}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Description</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPending
              ? Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-3.5 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-3.5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-3.5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="ml-auto h-3.5 w-20" /></TableCell>
                  </TableRow>
                ))
              : data?.items.map((tx) => (
                  <TableRow
                    key={tx.id}
                    onClick={() => setSelectedId(tx.id)}
                    className="cursor-pointer"
                  >
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>{tx.description}</span>
                        {tx.counterparty ? (
                          <span className="text-xs text-muted-foreground">{tx.counterparty}</span>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatSmartDate(tx.createdAt)}
                    </TableCell>
                    <TableCell className="text-sm">{humanStatus(tx.type)}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(tx.status)}>{humanStatus(tx.status)}</Badge>
                    </TableCell>
                    <TableCell className={`text-right tabular-nums font-semibold ${tx.amount > 0 ? "text-success" : ""}`}>
                      {tx.amount > 0 ? "+" : ""}
                      {formatCurrency(tx.amount, tx.currency)}
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>

        {!isPending && !data?.items.length ? (
          <div className="p-6">
            <EmptyState
              icon={Receipt}
              title="No matching transactions"
              description="Try removing filters or expanding your date range."
              action={
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFilters({ page: 1, pageSize: 20 });
                    setSearch("");
                  }}
                >
                  <Filter />
                  Clear filters
                </Button>
              }
            />
          </div>
        ) : null}
      </Card>

      {/* Pagination */}
      {data && data.total > (filters.pageSize ?? 20) ? (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Page {filters.page ?? 1} of {totalPages} · {data.total} transactions
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={(filters.page ?? 1) <= 1 || isFetching}
              onClick={() => setFilters((f) => ({ ...f, page: Math.max(1, (f.page ?? 1) - 1) }))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={(filters.page ?? 1) >= totalPages || isFetching}
              onClick={() => setFilters((f) => ({ ...f, page: (f.page ?? 1) + 1 }))}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}

      {/* Drawer */}
      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelectedId(null)}>
        <SheetContent className="w-full sm:max-w-md">
          {selected ? <TransactionDetails tx={selected} /> : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function TransactionDetails({ tx }: { tx: Transaction }) {
  return (
    <>
      <SheetHeader>
        <SheetTitle>{tx.description}</SheetTitle>
        <SheetDescription>
          {humanStatus(tx.type)} · {formatSmartDate(tx.createdAt)}
        </SheetDescription>
      </SheetHeader>
      <dl className="space-y-3 px-6 pb-6 text-sm">
        <Row label="Amount" value={`${tx.amount > 0 ? "+" : ""}${formatCurrency(tx.amount, tx.currency)}`} mono />
        <Row label="Status" value={humanStatus(tx.status)} />
        <Row label="Reference" value={tx.reference} mono />
        {tx.counterparty ? <Row label="Counterparty" value={tx.counterparty} /> : null}
        {tx.fee !== undefined ? <Row label="Fee" value={formatCurrency(tx.fee, tx.currency)} mono /> : null}
        {tx.completedAt ? <Row label="Completed" value={new Date(tx.completedAt).toLocaleString()} /> : null}
        <Row label="ID" value={truncateMiddle(tx.id, 18)} mono />
      </dl>
    </>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={mono ? "font-mono tabular-nums" : "font-medium"}>{value}</dd>
    </div>
  );
}
