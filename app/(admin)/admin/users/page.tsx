"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { MoreHorizontal, Search, ShieldOff } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { AdminInsight } from "@/components/admin/AdminInsight";
import { RangeToggle, type RangeDays } from "@/components/admin/RangeToggle";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { PageHeader } from "@/components/shared/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  useAdminAdjustBalance,
  useAdminResetTwoFactor,
  useAdminStats,
  useAdminSuspendUser,
  useAdminUsers,
} from "@/hooks/useAdmin";
import { formatCurrency } from "@/lib/utils/format";
import { adjustBalanceSchema, type AdjustBalanceInput } from "@/schemas/admin.schema";
import { ApiError, type User, type UserStatus } from "@/types";

const STATUSES: UserStatus[] = ["ACTIVE", "PENDING", "SUSPENDED"];

function statusVariant(status: UserStatus): "success" | "warning" | "destructive" {
  if (status === "ACTIVE") return "success";
  if (status === "PENDING") return "warning";
  return "destructive";
}

export default function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string | undefined>();
  const [country, setCountry] = useState<string | undefined>();
  const [range, setRange] = useState<RangeDays>(30);
  const [adjusting, setAdjusting] = useState<User | null>(null);

  const { data, isPending } = useAdminUsers({ page, pageSize: 15, q: q || undefined, status });
  const stats = useAdminStats();
  // Larger sample so charts + country list reflect the whole user base.
  const statusSample = useAdminUsers({ page: 1, pageSize: 200 });
  const suspend = useAdminSuspendUser();
  const resetTfa = useAdminResetTwoFactor();

  // Client-side country filter applied after the server-side query.
  const filteredItems = useMemo(() => {
    if (!country) return data?.items ?? [];
    return (data?.items ?? []).filter((u) => u.country === country);
  }, [data, country]);
  const totalPages = data ? Math.max(1, Math.ceil(data.total / 15)) : 1;

  const statusMix = useMemo(() => {
    const counts = { ACTIVE: 0, PENDING: 0, SUSPENDED: 0 };
    for (const u of statusSample.data?.items ?? []) {
      counts[u.status] = (counts[u.status] ?? 0) + 1;
    }
    return [
      { name: "Active", value: counts.ACTIVE, fill: "var(--color-chart-2)" },
      { name: "Pending", value: counts.PENDING, fill: "var(--color-chart-3)" },
      { name: "Suspended", value: counts.SUSPENDED, fill: "var(--color-destructive)" },
    ].filter((s) => s.value > 0);
  }, [statusSample.data]);

  const countryOptions = useMemo(() => {
    const set = new Set<string>();
    for (const u of statusSample.data?.items ?? []) {
      if (u.country) set.add(u.country);
    }
    return Array.from(set).sort();
  }, [statusSample.data]);

  const signupSeries = useMemo(
    () => (stats.data?.trend ?? []).slice(-range),
    [stats.data, range],
  );
  const signupTotal = useMemo(
    () => signupSeries.reduce((s, d) => s + d.users, 0),
    [signupSeries],
  );

  return (
    <div className="w-full space-y-6">
      <PageHeader
        eyebrow="Operations"
        title="Users"
        description="Search, audit, and manage user accounts."
      />

      {/* Insights */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <AdminInsight
          title="Account status mix"
          description="Breakdown across active, pending, and suspended."
          meta={
            <p className="text-2xl font-semibold tabular-nums">
              {statusSample.isPending ? "—" : statusSample.data?.total ?? 0}
            </p>
          }
        >
          {statusSample.isPending ? (
            <Skeleton className="h-[180px] w-full flex-1" />
          ) : statusMix.length === 0 ? (
            <p className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
              No users yet.
            </p>
          ) : (
            <div className="flex flex-1 items-center gap-4">
              <div className="h-[180px] w-[180px] shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusMix}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={48}
                      outerRadius={80}
                      paddingAngle={2}
                      stroke="none"
                    >
                      {statusMix.map((entry) => (
                        <Cell key={entry.name} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "var(--color-card)",
                        border: "1px solid var(--color-border)",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <ul className="flex-1 space-y-2 text-sm">
                {statusMix.map((s) => (
                  <li key={s.name} className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ background: s.fill }}
                      />
                      <span className="text-muted-foreground">{s.name}</span>
                    </span>
                    <span className="font-semibold tabular-nums">{s.value}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </AdminInsight>

        <AdminInsight
          title={`Sign-ups · last ${range} days`}
          description="New accounts per day."
          meta={
            <div className="flex items-center gap-3">
              <p className="text-2xl font-semibold tabular-nums">
                {stats.isPending ? "—" : signupTotal}
              </p>
              <RangeToggle value={range} onChange={setRange} />
            </div>
          }
        >
          {stats.isPending || !stats.data ? (
            <Skeleton className="h-[180px] w-full flex-1" />
          ) : (
            <div className="h-[180px] w-full flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={signupSeries}
                  margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                >
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
                    minTickGap={28}
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
                  <Bar dataKey="users" fill="var(--color-primary)" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </AdminInsight>
      </div>

      <Card className="p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1 lg:col-span-2">
            <Label className="text-xs">Search</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setPage(1);
                }}
                className="pl-9"
                placeholder="Name, email, or account number"
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Status</Label>
            <Select
              value={status ?? "all"}
              onValueChange={(v) => {
                setStatus(v === "all" ? undefined : v);
                setPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Country</Label>
            <Select
              value={country ?? "all"}
              onValueChange={(v) => {
                setCountry(v === "all" ? undefined : v);
                setPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All countries</SelectItem>
                {countryOptions.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Account</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Balance</TableHead>
              <TableHead aria-label="Actions" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPending
              ? Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-44" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="ml-auto h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-7 w-7 rounded" /></TableCell>
                  </TableRow>
                ))
              : filteredItems.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{u.fullName}</span>
                        <span className="text-xs text-muted-foreground">{u.email}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono tabular-nums">{u.accountNumber}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(u.status)}>{u.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right tabular-nums font-semibold">
                      {formatCurrency(u.balance, u.currency)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" aria-label="Open user menu">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setAdjusting(u)}>
                            Adjust balance
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <ConfirmDialog
                            trigger={
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                {u.status === "SUSPENDED" ? "Reactivate" : "Suspend"}
                              </DropdownMenuItem>
                            }
                            title={u.status === "SUSPENDED" ? "Reactivate user?" : "Suspend user?"}
                            description={
                              u.status === "SUSPENDED"
                                ? `${u.fullName} will be able to sign in again.`
                                : `${u.fullName} will be blocked from signing in.`
                            }
                            confirmLabel={u.status === "SUSPENDED" ? "Reactivate" : "Suspend"}
                            destructive={u.status !== "SUSPENDED"}
                            onConfirm={() => suspend.mutate(u.id)}
                          />
                          {u.twoFactorEnabled ? (
                            <ConfirmDialog
                              trigger={
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                  <ShieldOff />
                                  Reset 2FA
                                </DropdownMenuItem>
                              }
                              title="Reset two-factor authentication?"
                              description="The user will need to set up 2FA again on next sign-in."
                              confirmLabel="Reset 2FA"
                              onConfirm={() => resetTfa.mutate(u.id)}
                            />
                          ) : null}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </Card>

      {data && data.total > 15 ? (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Page {page} of {totalPages} · {data.total} users</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
          </div>
        </div>
      ) : null}

      <AdjustBalanceDialog user={adjusting} onClose={() => setAdjusting(null)} />
    </div>
  );
}

function AdjustBalanceDialog({ user, onClose }: { user: User | null; onClose: () => void }) {
  const adjust = useAdminAdjustBalance();
  const form = useForm<AdjustBalanceInput>({
    resolver: zodResolver(adjustBalanceSchema),
    defaultValues: { amount: undefined as unknown as number, reason: "" },
  });

  return (
    <Dialog open={!!user} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        {user ? (
          <>
            <DialogHeader>
              <DialogTitle>Adjust balance · {user.fullName}</DialogTitle>
              <DialogDescription>
                Current balance:{" "}
                <span className="font-semibold tabular-nums text-foreground">
                  {formatCurrency(user.balance, user.currency)}
                </span>
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form
                className="space-y-4"
                onSubmit={form.handleSubmit((v) =>
                  adjust.mutate(
                    { id: user.id, body: v },
                    {
                      onSuccess: () => {
                        form.reset();
                        onClose();
                      },
                      onError: (err) => {
                        if (err instanceof ApiError && err.fieldErrors) {
                          for (const [field, message] of Object.entries(err.fieldErrors)) {
                            form.setError(field as keyof AdjustBalanceInput, { message });
                          }
                        }
                      },
                    },
                  ),
                )}
                noValidate
              >
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount (positive credits, negative debits)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          inputMode="decimal"
                          placeholder="0.00"
                          className="tabular-nums"
                          value={field.value ?? ""}
                          onChange={(e) => {
                            const v = e.target.value;
                            field.onChange(v === "" ? undefined : Number(v));
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reason</FormLabel>
                      <FormControl>
                        <Textarea rows={3} placeholder="Why is this adjustment being made?" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                  <Button type="submit" loading={adjust.isPending}>Apply</Button>
                </DialogFooter>
              </form>
            </Form>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
