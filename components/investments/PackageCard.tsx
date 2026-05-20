"use client";

import { TrendingUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils/format";
import type { InvestmentPackage } from "@/types";

interface Props {
  pkg: InvestmentPackage;
  onInvest: (pkg: InvestmentPackage) => void;
  highlighted?: boolean;
}

export function PackageCard({ pkg, onInvest, highlighted }: Props) {
  return (
    <Card className={highlighted ? "relative flex h-full flex-col border-primary shadow-lg" : "relative flex h-full flex-col"}>
      {highlighted ? (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground shadow">
          Most popular
        </span>
      ) : null}
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{pkg.name}</CardTitle>
          <Badge variant="default">
            <TrendingUp className="h-3 w-3" />
            {pkg.roiPercent}%
          </Badge>
        </div>
        <CardDescription>{pkg.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col space-y-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <Stat label="Lock period" value={`${pkg.durationMonths} months`} />
          <Stat label="ROI at maturity" value={`${pkg.roiPercent}%`} />
          <Stat label="Min" value={formatCurrency(pkg.minAmount)} />
          <Stat label="Max" value={formatCurrency(pkg.maxAmount)} />
        </div>
        <Button className="mt-auto w-full" onClick={() => onInvest(pkg)}>
          Invest in this package
        </Button>
      </CardContent>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-semibold tabular-nums">{value}</p>
    </div>
  );
}
