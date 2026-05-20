"use client";

import { TrendingDown, TrendingUp } from "lucide-react";
import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCryptoPrices, useCryptoWallets } from "@/hooks/useData";
import { cn } from "@/lib/utils/cn";
import { formatCurrency, formatNumber } from "@/lib/utils/format";

export function MarketWatch() {
  const prices = useCryptoPrices();
  const wallets = useCryptoWallets();

  const items = (prices.data ?? []).slice(0, 4);
  const walletByAsset = new Map((wallets.data ?? []).map((w) => [w.asset, w]));

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Markets</CardTitle>
          <p className="mt-1 text-xs text-muted-foreground">Live crypto · 24h</p>
        </div>
        <Link href="/crypto" className="text-xs font-medium text-primary hover:underline">
          Trade
        </Link>
      </CardHeader>
      <CardContent className="px-0 pb-3">
        {prices.isPending ? (
          <ul className="divide-y divide-border">
            {Array.from({ length: 4 }).map((_, i) => (
              <li key={i} className="flex items-center justify-between gap-3 px-6 py-2.5">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-3 w-12" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <Skeleton className="h-4 w-14" />
              </li>
            ))}
          </ul>
        ) : items.length === 0 ? (
          <p className="px-6 py-4 text-sm text-muted-foreground">No market data.</p>
        ) : (
          <ul className="divide-y divide-border">
            {items.map((p) => {
              const positive = p.change24h >= 0;
              const wallet = walletByAsset.get(p.asset);
              const label = wallet?.name ?? p.asset;
              return (
                <li
                  key={p.asset}
                  className="flex items-center gap-3 px-6 py-2.5 transition-colors hover:bg-muted/40"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/10 text-[0.65rem] font-bold text-primary">
                      {p.asset}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{label}</p>
                      <p className="truncate text-xs text-muted-foreground tabular-nums">
                        {wallet && wallet.balance > 0
                          ? `${formatNumber(wallet.balance, 4)} held`
                          : "Not held"}
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-semibold tabular-nums">
                      {formatCurrency(p.usd, "USD", { compact: p.usd >= 10_000 })}
                    </p>
                    <p
                      className={cn(
                        "inline-flex items-center gap-0.5 text-xs font-medium tabular-nums",
                        positive ? "text-emerald-600 dark:text-emerald-500" : "text-rose-600 dark:text-rose-500",
                      )}
                    >
                      {positive ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      {positive ? "+" : ""}
                      {p.change24h.toFixed(2)}%
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
