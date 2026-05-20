"use client";

import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCryptoPrices } from "@/hooks/useData";
import { formatCurrency } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import type { CryptoSymbol } from "@/types";

const ASSETS: CryptoSymbol[] = ["BTC", "ETH", "USDT", "BNB", "SOL"];

/**
 * Synthetic 30-day series anchored on the current live-feel price.
 * Real backend would return historical candles — for the mock, we
 * generate a deterministic random walk seeded by the asset symbol.
 */
function syntheticSeries(asset: string, endPrice: number) {
  const seed = [...asset].reduce((s, c) => s + c.charCodeAt(0), 0);
  let rng = seed * 9301 + 49297;
  const next = () => {
    rng = (rng * 9301 + 49297) % 233280;
    return rng / 233280;
  };
  const points: { date: string; price: number }[] = [];
  let p = endPrice * 0.85;
  for (let i = 29; i >= 0; i--) {
    p = p * (1 + (next() - 0.48) * 0.04);
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    points.push({ date: d.toISOString().slice(0, 10), price: Number(p.toFixed(2)) });
  }
  // Pin the last point to the current price
  const last = points[points.length - 1];
  if (last) last.price = Number(endPrice.toFixed(2));
  return points;
}

export function CryptoChart() {
  const { data, isPending } = useCryptoPrices();
  const [active, setActive] = useState<CryptoSymbol>("BTC");
  const price = data?.find((p) => p.asset === active);

  const series = useMemo(() => {
    if (!price) return [];
    return syntheticSeries(active, price.usd);
  }, [active, price]);

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Price chart</CardTitle>
        <div className="flex gap-1">
          {ASSETS.map((a) => (
            <Button
              key={a}
              size="sm"
              variant="ghost"
              onClick={() => setActive(a)}
              className={cn(
                "h-7 px-2 text-xs font-semibold",
                active === a ? "bg-accent text-accent-foreground" : "text-muted-foreground",
              )}
            >
              {a}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col">
        {isPending || !price ? (
          <Skeleton className="h-[220px] w-full flex-1" />
        ) : (
          <>
            <p className="mb-2 text-2xl font-semibold tabular-nums">
              {formatCurrency(price.usd)}
              <span
                className={cn(
                  "ml-2 text-sm font-medium",
                  price.change24h >= 0 ? "text-success" : "text-destructive",
                )}
              >
                {price.change24h >= 0 ? "+" : ""}
                {price.change24h.toFixed(2)}% · 24h
              </span>
            </p>
            <div className="h-[220px] w-full flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={series} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="priceFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.3} />
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
                    minTickGap={32}
                  />
                  <YAxis
                    tickFormatter={(v) => `$${Math.round(Number(v))}`}
                    tickLine={false}
                    axisLine={false}
                    fontSize={11}
                    stroke="var(--color-muted-foreground)"
                    width={50}
                    domain={["auto", "auto"]}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "var(--color-card)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                    formatter={(v) => [formatCurrency(Number(v)), active]}
                  />
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke="var(--color-primary)"
                    strokeWidth={2}
                    fill="url(#priceFill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
