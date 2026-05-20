"use client";

import { TrendingDown, TrendingUp } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCryptoPrices } from "@/hooks/useData";
import { formatCurrency } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

export function PriceTicker() {
  const { data, isPending } = useCryptoPrices();

  if (isPending) {
    return (
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
      {data?.map((p) => {
        const up = p.change24h >= 0;
        return (
          <Card key={p.asset} className="p-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-semibold tracking-wider">{p.asset}</span>
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 font-medium tabular-nums",
                  up ? "text-success" : "text-destructive",
                )}
              >
                {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {Math.abs(p.change24h).toFixed(2)}%
              </span>
            </div>
            <p className="mt-1 text-lg font-semibold tabular-nums">
              {formatCurrency(p.usd)}
            </p>
          </Card>
        );
      })}
    </div>
  );
}
