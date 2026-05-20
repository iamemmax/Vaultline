"use client";

import {
  ArrowDownLeft,
  ArrowDownToLine,
  ArrowUpRight,
  Bitcoin,
  Receipt,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/shared/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTransactions } from "@/hooks/useData";
import { formatCurrency, formatSmartDate, humanStatus } from "@/lib/utils/format";
import type { Transaction, TransactionStatus, TransactionType } from "@/types";

function iconFor(type: TransactionType) {
  switch (type) {
    case "DEPOSIT":
    case "TRANSFER_IN":
    case "INVESTMENT_RETURN":
    case "CRYPTO_RECEIVE":
      return ArrowDownLeft;
    case "WITHDRAWAL":
    case "TRANSFER_OUT":
    case "CRYPTO_SEND":
      return ArrowUpRight;
    case "INVESTMENT":
      return TrendingUp;
    case "CRYPTO_BUY":
    case "CRYPTO_SELL":
      return Bitcoin;
    default:
      return ArrowDownToLine;
  }
}

function statusVariant(status: TransactionStatus): "default" | "success" | "warning" | "destructive" {
  if (status === "COMPLETED") return "success";
  if (status === "PENDING" || status === "AWAITING_APPROVAL") return "warning";
  if (status === "FAILED" || status === "CANCELLED") return "destructive";
  return "default";
}

export function RecentTransactions() {
  const { data, isPending } = useTransactions({ page: 1, pageSize: 6 });

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent activity</CardTitle>
        <Link href="/transactions" className="text-sm font-medium text-primary hover:underline">
          View all
        </Link>
      </CardHeader>
      <CardContent className="flex-1 px-0">
        {isPending ? (
          <ul className="divide-y divide-border">
            {Array.from({ length: 5 }).map((_, i) => (
              <li key={i} className="flex items-center gap-3 px-6 py-3">
                <Skeleton className="h-9 w-9 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-4 w-20" />
              </li>
            ))}
          </ul>
        ) : !data?.items.length ? (
          <div className="px-6 pb-2">
            <EmptyState
              icon={Receipt}
              title="No activity yet"
              description="Your transactions will appear here as soon as you start moving money."
            />
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {data.items.map((tx) => (
              <TransactionRow key={tx.id} tx={tx} />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function TransactionRow({ tx }: { tx: Transaction }) {
  const Icon = iconFor(tx.type);
  const isCredit = tx.amount > 0;
  return (
    <li className="flex items-center gap-3 px-6 py-3">
      <span
        className={`grid h-9 w-9 place-items-center rounded-full ${
          isCredit ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
        }`}
      >
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{tx.description}</p>
        <p className="truncate text-xs text-muted-foreground">
          {formatSmartDate(tx.createdAt)}
          {tx.counterparty ? ` · ${tx.counterparty}` : ""}
        </p>
      </div>
      <div className="text-right">
        <p className={`text-sm font-semibold tabular-nums ${isCredit ? "text-success" : ""}`}>
          {isCredit ? "+" : ""}
          {formatCurrency(tx.amount, tx.currency)}
        </p>
        <Badge variant={statusVariant(tx.status)} className="mt-0.5 text-[10px]">
          {humanStatus(tx.status)}
        </Badge>
      </div>
    </li>
  );
}
