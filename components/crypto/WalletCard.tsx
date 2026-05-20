"use client";

import { ArrowDownLeft, ArrowUpRight, Bitcoin, Coins, type LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCrypto, formatCurrency, truncateMiddle } from "@/lib/utils/format";
import type { CryptoPrice, CryptoSymbol, CryptoWallet } from "@/types";

interface Props {
  wallet: CryptoWallet;
  price?: CryptoPrice;
  onSend: (wallet: CryptoWallet) => void;
  onReceive: (wallet: CryptoWallet) => void;
}

const iconForAsset: Record<CryptoSymbol, LucideIcon> = {
  BTC: Bitcoin,
  ETH: Coins,
  USDT: Coins,
  BNB: Coins,
  SOL: Coins,
};

export function WalletCard({ wallet, price, onSend, onReceive }: Props) {
  const Icon = iconForAsset[wallet.asset];
  const usdValue = price ? wallet.balance * price.usd : 0;
  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="flex flex-row items-start justify-between pb-3">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </span>
          <div>
            <CardTitle className="text-base">{wallet.name}</CardTitle>
            <CardDescription className="text-xs">{wallet.asset} · {wallet.network}</CardDescription>
          </div>
        </div>
        <div className="text-right">
          <p className="font-semibold tabular-nums">{formatCrypto(wallet.balance, wallet.asset)}</p>
          <p className="text-xs text-muted-foreground tabular-nums">≈ {formatCurrency(usdValue)}</p>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col space-y-3">
        <p className="break-all font-mono text-xs text-muted-foreground">
          {truncateMiddle(wallet.address, 32)}
        </p>
        <div className="mt-auto flex gap-2">
          <Button variant="outline" size="sm" className="flex-1" onClick={() => onSend(wallet)}>
            <ArrowUpRight />
            Send
          </Button>
          <Button variant="outline" size="sm" className="flex-1" onClick={() => onReceive(wallet)}>
            <ArrowDownLeft />
            Receive
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
