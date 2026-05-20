"use client";

import { TrendingUp } from "lucide-react";
import { useState } from "react";

import { ActiveInvestmentRow } from "@/components/investments/ActiveInvestmentRow";
import { InvestmentModal } from "@/components/investments/InvestmentModal";
import { PackageCard } from "@/components/investments/PackageCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useInvestmentPackages, useMyInvestments } from "@/hooks/useData";
import { formatCurrency } from "@/lib/utils/format";
import type { InvestmentPackage } from "@/types";

export default function InvestmentsPage() {
  const packages = useInvestmentPackages();
  const investments = useMyInvestments();
  const [selectedPkg, setSelectedPkg] = useState<InvestmentPackage | null>(null);

  const active = investments.data?.filter((i) => i.status === "ACTIVE") ?? [];
  const completed = investments.data?.filter((i) => i.status === "COMPLETED") ?? [];
  const totalLocked = active.reduce((s, i) => s + i.principal, 0);
  const totalProjected = active.reduce((s, i) => s + i.principal * (i.roiPercent / 100), 0);
  const totalEarned = completed.reduce(
    (s, i) => s + i.principal * (i.roiPercent / 100),
    0,
  );
  const avgRoi = active.length
    ? active.reduce((s, i) => s + i.roiPercent, 0) / active.length
    : 0;

  return (
    <div className="w-full space-y-8">
      <PageHeader
        eyebrow="Wealth"
        title="Investments"
        description="Lock funds into curated fixed-yield packages. Returns are paid in full at maturity."
      />

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <SummaryCard
          label="Active principal"
          value={formatCurrency(totalLocked)}
          loading={investments.isPending}
        />
        <SummaryCard
          label="Projected return"
          value={`+${formatCurrency(totalProjected)}`}
          tone="success"
          loading={investments.isPending}
        />
        <SummaryCard
          label="Earned to date"
          value={`+${formatCurrency(totalEarned)}`}
          loading={investments.isPending}
        />
        <SummaryCard
          label="Average ROI"
          value={active.length ? `${avgRoi.toFixed(1)}%` : "—"}
          loading={investments.isPending}
          suffix={active.length ? `${active.length} active` : undefined}
        />
      </div>

      {/* Packages */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">Available packages</h2>
        {packages.isPending ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-72 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {packages.data?.map((pkg, idx) => (
              <PackageCard
                key={pkg.id}
                pkg={pkg}
                onInvest={setSelectedPkg}
                highlighted={idx === 1}
              />
            ))}
          </div>
        )}
      </section>

      {/* Active investments */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">Your investments</h2>
        {investments.isPending ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-56 rounded-xl" />
            ))}
          </div>
        ) : !investments.data?.length ? (
          <EmptyState
            icon={TrendingUp}
            title="No investments yet"
            description="Pick a package above to start earning returns on your idle balance."
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {investments.data.map((inv) => (
              <ActiveInvestmentRow key={inv.id} inv={inv} />
            ))}
          </div>
        )}
      </section>

      <InvestmentModal pkg={selectedPkg} onClose={() => setSelectedPkg(null)} />
    </div>
  );
}

function SummaryCard({
  label,
  value,
  tone,
  loading,
  suffix,
}: {
  label: string;
  value: string;
  tone?: "success";
  loading?: boolean;
  suffix?: string;
}) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardDescription className="text-xs uppercase tracking-wider">
          {label}
        </CardDescription>
        <CardTitle
          className={`text-2xl tabular-nums tracking-tight ${tone === "success" ? "text-emerald-600 dark:text-emerald-500" : ""}`}
        >
          {loading ? <Skeleton className="h-7 w-32" /> : value}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <span className="text-xs text-muted-foreground">{suffix ?? "USD"}</span>
      </CardContent>
    </Card>
  );
}
