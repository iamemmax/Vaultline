"use client";

import { LockCountdown } from "@/components/investments/LockCountdown";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatSmartDate } from "@/lib/utils/format";
import type { Investment } from "@/types";

interface Props {
  inv: Investment;
}

export function ActiveInvestmentRow({ inv }: Props) {
  const projectedReturn = inv.principal * (inv.roiPercent / 100);
  const now = Date.now();
  const start = new Date(inv.startedAt).getTime();
  const end = new Date(inv.maturesAt).getTime();
  const total = end - start;
  const elapsed = Math.max(0, Math.min(total, now - start));
  const accrued = total > 0 ? projectedReturn * (elapsed / total) : 0;

  const isComplete = inv.status === "COMPLETED" || now >= end;

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="flex flex-row items-start justify-between pb-3">
        <div>
          <CardTitle className="text-base">{inv.packageName}</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            Started {formatSmartDate(inv.startedAt)}
          </p>
        </div>
        <Badge variant={isComplete ? "success" : "default"}>
          {isComplete ? "Matured" : "Active"}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-3 text-sm">
          <Stat label="Principal" value={formatCurrency(inv.principal, inv.currency)} />
          <Stat
            label="Accrued so far"
            value={`+${formatCurrency(accrued, inv.currency)}`}
            tone="success"
          />
          <Stat
            label={isComplete ? "Total return" : "Projected return"}
            value={`+${formatCurrency(projectedReturn, inv.currency)}`}
          />
        </div>
        <LockCountdown startedAt={inv.startedAt} maturesAt={inv.maturesAt} />
      </CardContent>
    </Card>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "success" }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p
        className={`font-semibold tabular-nums ${
          tone === "success" ? "text-success" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}
