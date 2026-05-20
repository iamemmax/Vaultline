"use client";

import { Bitcoin, TrendingDown, TrendingUp } from "lucide-react";
import { useState } from "react";

import { CryptoChart } from "@/components/crypto/CryptoChart";
import { PriceTicker } from "@/components/crypto/PriceTicker";
import { ReceiveCryptoModal } from "@/components/crypto/ReceiveCryptoModal";
import { SendCryptoModal } from "@/components/crypto/SendCryptoModal";
import { WalletCard } from "@/components/crypto/WalletCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCryptoPrices, useCryptoWallets } from "@/hooks/useData";
import { cn } from "@/lib/utils/cn";
import { formatCurrency } from "@/lib/utils/format";
import type { CryptoWallet } from "@/types";

export default function CryptoPage() {
  const wallets = useCryptoWallets();
  const prices = useCryptoPrices();
  const [sendWallet, setSendWallet] = useState<CryptoWallet | null>(null);
  const [receiveWallet, setReceiveWallet] = useState<CryptoWallet | null>(null);

  // Total fiat value across all wallets
  const priceByAsset = new Map((prices.data ?? []).map((p) => [p.asset, p]));
  const totalValue = (wallets.data ?? []).reduce((sum, w) => {
    const p = priceByAsset.get(w.asset);
    return sum + (p ? w.balance * p.usd : 0);
  }, 0);
  const weighted24h = (() => {
    if (!wallets.data?.length || totalValue === 0) return 0;
    let weighted = 0;
    for (const w of wallets.data) {
      const p = priceByAsset.get(w.asset);
      if (!p) continue;
      const value = w.balance * p.usd;
      weighted += (value / totalValue) * p.change24h;
    }
    return weighted;
  })();
  const positive = weighted24h >= 0;

  return (
    <div className="w-full space-y-6">
      <PageHeader
        eyebrow="Digital assets"
        title="Crypto"
        description="Hold, send, and receive digital assets across major networks."
      />

      {/* Portfolio summary */}
      <Card>
        <CardContent className="flex flex-col gap-4 py-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Crypto portfolio value
            </p>
            {wallets.isPending || prices.isPending ? (
              <Skeleton className="mt-2 h-9 w-44" />
            ) : (
              <p className="mt-1 text-3xl font-semibold tabular-nums tracking-tight">
                {formatCurrency(totalValue)}
              </p>
            )}
            {!wallets.isPending && !prices.isPending ? (
              <p
                className={cn(
                  "mt-1 inline-flex items-center gap-1 text-sm font-medium tabular-nums",
                  positive
                    ? "text-emerald-600 dark:text-emerald-500"
                    : "text-rose-600 dark:text-rose-500",
                )}
              >
                {positive ? (
                  <TrendingUp className="h-3.5 w-3.5" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5" />
                )}
                {positive ? "+" : ""}
                {weighted24h.toFixed(2)}% · 24h
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="rounded-full border border-border bg-muted/40 px-3 py-1.5">
              {wallets.data?.length ?? 0} wallets
            </span>
            <span className="rounded-full border border-border bg-muted/40 px-3 py-1.5">
              {(wallets.data ?? []).filter((w) => w.balance > 0).length} funded
            </span>
          </div>
        </CardContent>
      </Card>

      <PriceTicker />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <CryptoChart />
        </div>
        <div className="xl:col-span-1">
          <div className="space-y-3">
            {wallets.isPending ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-36 rounded-xl" />
              ))
            ) : !wallets.data?.length ? (
              <EmptyState
                icon={Bitcoin}
                title="No wallets yet"
                description="Your crypto wallets will appear here once provisioned."
              />
            ) : (
              wallets.data.slice(0, 2).map((w) => (
                <WalletCard
                  key={w.asset}
                  wallet={w}
                  price={priceByAsset.get(w.asset)}
                  onSend={setSendWallet}
                  onReceive={setReceiveWallet}
                />
              ))
            )}
          </div>
        </div>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">All wallets</h2>
        {wallets.isPending ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-44 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {wallets.data?.map((w) => (
              <WalletCard
                key={w.asset}
                wallet={w}
                price={priceByAsset.get(w.asset)}
                onSend={setSendWallet}
                onReceive={setReceiveWallet}
              />
            ))}
          </div>
        )}
      </section>

      <SendCryptoModal wallet={sendWallet} onClose={() => setSendWallet(null)} />
      <ReceiveCryptoModal wallet={receiveWallet} onClose={() => setReceiveWallet(null)} />
    </div>
  );
}
