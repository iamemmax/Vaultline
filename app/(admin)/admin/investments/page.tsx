"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, Pencil, Plus, Trash2, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { AdminInsight } from "@/components/admin/AdminInsight";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  useAdminCreatePackage,
  useAdminDeletePackage,
  useAdminInvestments,
  useAdminPackages,
  useAdminUpdatePackage,
} from "@/hooks/useAdmin";
import { formatCurrency } from "@/lib/utils/format";
import { packageCrudSchema, type PackageCrudInput } from "@/schemas/admin.schema";
import { ApiError, type InvestmentPackage } from "@/types";

type StatusFilter = "all" | "active" | "inactive";

export default function AdminInvestmentsPage() {
  const { data, isPending } = useAdminPackages();
  const investments = useAdminInvestments();
  const del = useAdminDeletePackage();
  const [editing, setEditing] = useState<InvestmentPackage | null>(null);
  const [creating, setCreating] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  // Per-package roll-up: count, total locked, total projected ROI
  const packageStats = useMemo(() => {
    const map = new Map<
      string,
      { count: number; locked: number; projected: number; investors: Set<string> }
    >();
    for (const inv of investments.data ?? []) {
      const cur = map.get(inv.packageId) ?? {
        count: 0,
        locked: 0,
        projected: 0,
        investors: new Set<string>(),
      };
      cur.count += 1;
      if (inv.status === "ACTIVE") cur.locked += inv.principal;
      cur.projected += inv.principal * (inv.roiPercent / 100);
      cur.investors.add(inv.userId);
      map.set(inv.packageId, cur);
    }
    return map;
  }, [investments.data]);

  // Top-line stats across the catalog
  const totals = useMemo(() => {
    let locked = 0;
    let projected = 0;
    const investorIds = new Set<string>();
    let active = 0;
    for (const inv of investments.data ?? []) {
      if (inv.status === "ACTIVE") {
        locked += inv.principal;
        active += 1;
      }
      projected += inv.principal * (inv.roiPercent / 100);
      investorIds.add(inv.userId);
    }
    return { locked, projected, investors: investorIds.size, active };
  }, [investments.data]);

  const chartData = useMemo(
    () =>
      (data ?? []).map((pkg) => ({
        name: pkg.name.split(" — ")[0] ?? pkg.name,
        roi: pkg.roiPercent,
        min: pkg.minAmount,
        max: pkg.maxAmount,
        duration: pkg.durationMonths,
        positions: packageStats.get(pkg.id)?.count ?? 0,
        locked: packageStats.get(pkg.id)?.locked ?? 0,
      })),
    [data, packageStats],
  );

  const avgRoi = useMemo(
    () =>
      chartData.length
        ? (chartData.reduce((s, p) => s + p.roi, 0) / chartData.length).toFixed(1)
        : "—",
    [chartData],
  );

  const filteredPackages = useMemo(() => {
    if (!data) return [];
    if (statusFilter === "active") return data.filter((p) => p.active);
    if (statusFilter === "inactive") return data.filter((p) => !p.active);
    return data;
  }, [data, statusFilter]);

  return (
    <div className="w-full space-y-6">
      <PageHeader
        eyebrow="Catalog"
        title="Investment packages"
        description="Create and tune the packages users see on the investment page."
        actions={
          <Button onClick={() => setCreating(true)}>
            <Plus />
            New package
          </Button>
        }
      />

      {/* Top-line stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile
          label="Total locked"
          value={formatCurrency(totals.locked)}
          icon={Lock}
          loading={investments.isPending}
        />
        <StatTile
          label="Projected ROI"
          value={`+${formatCurrency(totals.projected)}`}
          tone="success"
          loading={investments.isPending}
        />
        <StatTile
          label="Active positions"
          value={String(totals.active)}
          loading={investments.isPending}
        />
        <StatTile
          label="Unique investors"
          value={String(totals.investors)}
          icon={Users}
          loading={investments.isPending}
        />
      </div>

      {/* Insights */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
        <AdminInsight
          title="ROI by package"
          description="Annual percentage payout at maturity."
          meta={
            <p className="text-2xl font-semibold tabular-nums">
              {typeof avgRoi === "string" ? `${avgRoi}%` : `${avgRoi}%`}
            </p>
          }
        >
          {isPending ? (
            <Skeleton className="h-[200px] w-full flex-1" />
          ) : chartData.length === 0 ? (
            <p className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
              No packages to chart yet.
            </p>
          ) : (
            <div className="h-[200px] w-full flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    fontSize={11}
                    stroke="var(--color-muted-foreground)"
                  />
                  <YAxis
                    tickFormatter={(v) => `${v}%`}
                    tickLine={false}
                    axisLine={false}
                    fontSize={11}
                    stroke="var(--color-muted-foreground)"
                    width={36}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "var(--color-card)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                    formatter={(v) => [`${v}%`, "ROI"]}
                  />
                  <Bar dataKey="roi" fill="var(--color-primary)" radius={[3, 3, 0, 0]} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}
        </AdminInsight>

        <AdminInsight
          title="Amount range by package"
          description="Min and max investment per package, in USD."
        >
          {isPending ? (
            <Skeleton className="h-[200px] w-full flex-1" />
          ) : chartData.length === 0 ? (
            <p className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
              No packages to chart yet.
            </p>
          ) : (
            <div className="h-[200px] w-full flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    fontSize={11}
                    stroke="var(--color-muted-foreground)"
                  />
                  <YAxis
                    tickFormatter={(v) => `$${Math.round(Number(v) / 1000)}k`}
                    tickLine={false}
                    axisLine={false}
                    fontSize={11}
                    stroke="var(--color-muted-foreground)"
                    width={48}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "var(--color-card)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                    formatter={(v) => [formatCurrency(Number(v)), ""]}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: 11, paddingTop: 4 }}
                    iconType="circle"
                    iconSize={8}
                  />
                  <Bar dataKey="min" name="Min" fill="var(--color-chart-2)" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="max" name="Max" fill="var(--color-chart-3)" radius={[3, 3, 0, 0]} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}
        </AdminInsight>

        <AdminInsight
          title="Subscriptions by package"
          description="How many positions each package holds."
          meta={
            <p className="text-2xl font-semibold tabular-nums">
              {investments.isPending ? "—" : investments.data?.length ?? 0}
            </p>
          }
        >
          {investments.isPending ? (
            <Skeleton className="h-[200px] w-full flex-1" />
          ) : chartData.length === 0 ? (
            <p className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
              No subscriptions yet.
            </p>
          ) : (
            <div className="h-[200px] w-full flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    fontSize={11}
                    stroke="var(--color-muted-foreground)"
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    fontSize={11}
                    stroke="var(--color-muted-foreground)"
                    width={28}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "var(--color-card)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Bar
                    dataKey="positions"
                    name="Positions"
                    fill="var(--color-chart-5)"
                    radius={[3, 3, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </AdminInsight>
      </div>

      {/* Filter row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-md border border-border bg-muted/40 p-0.5 text-xs font-medium">
          {(["all", "active", "inactive"] as StatusFilter[]).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setStatusFilter(f)}
              className={
                "rounded px-3 py-1 capitalize transition-colors " +
                (statusFilter === f
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground")
              }
            >
              {f === "all" ? "All packages" : f}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          {filteredPackages.length} of {data?.length ?? 0} packages
        </p>
      </div>

      {isPending ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-56 rounded-xl" />
          ))}
        </div>
      ) : !data?.length ? (
        <EmptyState
          title="No packages yet"
          description="Create your first investment package to make it available to users."
          action={
            <Button onClick={() => setCreating(true)}>
              <Plus />
              Create package
            </Button>
          }
        />
      ) : filteredPackages.length === 0 ? (
        <EmptyState
          title="No packages match this filter"
          description="Try the other status filters above or clear the filter."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {filteredPackages.map((pkg) => {
            const stats = packageStats.get(pkg.id);
            return (
              <Card key={pkg.id} className="flex h-full flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base leading-tight">
                      {pkg.name}
                    </CardTitle>
                    <Badge variant={pkg.active ? "success" : "default"}>
                      {pkg.active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {pkg.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col space-y-3 text-sm">
                  {/* Uptake summary at the top — most important admin signal */}
                  <div className="grid grid-cols-2 gap-2 rounded-lg border border-border bg-muted/30 p-3 text-xs">
                    <div>
                      <p className="text-muted-foreground">Subscribers</p>
                      <p className="mt-0.5 text-base font-semibold tabular-nums">
                        {stats?.count ?? 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Locked</p>
                      <p className="mt-0.5 text-base font-semibold tabular-nums">
                        {formatCurrency(stats?.locked ?? 0, "USD", { compact: true })}
                      </p>
                    </div>
                  </div>

                  <Row label="Duration" value={`${pkg.durationMonths} months`} />
                  <Row label="ROI" value={`${pkg.roiPercent}%`} />
                  <Row label="Min" value={formatCurrency(pkg.minAmount)} />
                  <Row label="Max" value={formatCurrency(pkg.maxAmount)} />

                  <div className="mt-auto flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => setEditing(pkg)}>
                      <Pencil />
                      Edit
                    </Button>
                    <ConfirmDialog
                      trigger={
                        <Button variant="destructive" size="sm">
                          <Trash2 />
                        </Button>
                      }
                      title="Delete package?"
                      description={`${pkg.name} will no longer be available to users. Existing investments are unaffected.`}
                      confirmLabel="Delete"
                      destructive
                      onConfirm={() => del.mutate(pkg.id)}
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <PackageDialog
        open={creating || !!editing}
        pkg={editing}
        onClose={() => {
          setCreating(false);
          setEditing(null);
        }}
      />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border pb-1.5 last:border-none">
      <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className="font-semibold tabular-nums">{value}</span>
    </div>
  );
}

function StatTile({
  label,
  value,
  tone,
  icon: Icon,
  loading,
}: {
  label: string;
  value: string;
  tone?: "success";
  icon?: typeof Lock;
  loading?: boolean;
}) {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div>
          <CardDescription className="text-xs uppercase tracking-wider">
            {label}
          </CardDescription>
          <CardTitle
            className={
              "mt-1 text-2xl tabular-nums tracking-tight " +
              (tone === "success" ? "text-emerald-600 dark:text-emerald-500" : "")
            }
          >
            {loading ? <Skeleton className="h-7 w-32" /> : value}
          </CardTitle>
        </div>
        {Icon ? (
          <span className="grid h-8 w-8 place-items-center rounded-md bg-primary/10 text-primary">
            <Icon className="h-4 w-4" />
          </span>
        ) : null}
      </CardHeader>
    </Card>
  );
}

function PackageDialog({
  open,
  pkg,
  onClose,
}: {
  open: boolean;
  pkg: InvestmentPackage | null;
  onClose: () => void;
}) {
  const create = useAdminCreatePackage();
  const update = useAdminUpdatePackage();
  const form = useForm<PackageCrudInput>({
    resolver: zodResolver(packageCrudSchema),
    values: pkg
      ? {
          name: pkg.name,
          description: pkg.description,
          durationMonths: pkg.durationMonths as 3 | 6 | 12,
          roiPercent: pkg.roiPercent,
          minAmount: pkg.minAmount,
          maxAmount: pkg.maxAmount,
          active: pkg.active,
        }
      : {
          name: "",
          description: "",
          durationMonths: 3,
          roiPercent: 10,
          minAmount: 100,
          maxAmount: 10000,
          active: true,
        },
  });

  const onSubmit = (values: PackageCrudInput) => {
    const onError = (err: unknown) => {
      if (err instanceof ApiError && err.fieldErrors) {
        for (const [field, message] of Object.entries(err.fieldErrors)) {
          form.setError(field as keyof PackageCrudInput, { message });
        }
      }
    };
    if (pkg) {
      update.mutate(
        { id: pkg.id, body: values },
        { onSuccess: onClose, onError },
      );
    } else {
      create.mutate(values, {
        onSuccess: () => {
          form.reset();
          onClose();
        },
        onError,
      });
    }
  };

  const submitting = create.isPending || update.isPending;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{pkg ? "Edit package" : "Create package"}</DialogTitle>
          <DialogDescription>
            Changes apply to new investments. Existing positions keep their original terms.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl><Textarea rows={2} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="durationMonths"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration</FormLabel>
                    <Select
                      value={String(field.value)}
                      onValueChange={(v) => field.onChange(Number(v) as 3 | 6 | 12)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3 months</SelectItem>
                        <SelectItem value="6">6 months</SelectItem>
                        <SelectItem value="12">12 months</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="roiPercent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ROI %</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        className="tabular-nums"
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="minAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Min amount</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        className="tabular-nums"
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="maxAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max amount</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        className="tabular-nums"
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit" loading={submitting}>
                {pkg ? "Save changes" : "Create package"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
