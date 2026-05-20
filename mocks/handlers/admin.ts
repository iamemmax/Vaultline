import { faker } from "@faker-js/faker";
import { http } from "msw";

import { endpoints } from "@/lib/api/endpoints";
import { delay, fail, notFound, ok, requireAdmin } from "@/mocks/helpers";
import { getDB, logAudit, persist } from "@/mocks/db";
import type { InvestmentPackage, Paginated, Transaction, User } from "@/types";

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api";
const url = (path: string) => `${BASE}${path}`;

export const adminHandlers = [
  http.get(url(endpoints.adminStats), async ({ request }) => {
    await delay(180);
    const result = requireAdmin(request);
    if (result instanceof Response) return result;
    const db = getDB();
    const totalUsers = db.users.filter((u) => u.role === "USER").length;
    const totalDeposits = db.users.reduce((sum, u) => sum + u.balance, 0);
    const activeInvestments = db.investments.filter((i) => i.status === "ACTIVE");
    const activeInvestmentValue = activeInvestments.reduce((s, i) => s + i.principal, 0);
    const pending = db.transactions.filter(
      (t) => t.status === "PENDING" || t.status === "AWAITING_APPROVAL",
    );
    const twentyFourHrsAgo = Date.now() - 24 * 60 * 60_000;
    const last24hVolume = db.transactions
      .filter((t) => new Date(t.createdAt).getTime() > twentyFourHrsAgo)
      .reduce((s, t) => s + Math.abs(t.amount), 0);

    // 30-day trend for the chart
    const days: { date: string; volume: number; users: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const dayStart = new Date();
      dayStart.setDate(dayStart.getDate() - i);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);
      const vol = db.transactions
        .filter((t) => {
          const ts = new Date(t.createdAt).getTime();
          return ts >= dayStart.getTime() && ts <= dayEnd.getTime();
        })
        .reduce((s, t) => s + Math.abs(t.amount), 0);
      const newUsers = db.users.filter((u) => {
        const ts = new Date(u.createdAt).getTime();
        return ts >= dayStart.getTime() && ts <= dayEnd.getTime();
      }).length;
      days.push({
        date: dayStart.toISOString().slice(0, 10),
        volume: Math.round(vol),
        users: newUsers,
      });
    }

    return ok({
      totalUsers,
      totalDeposits,
      activeInvestmentValue,
      activeInvestmentCount: activeInvestments.length,
      pendingApprovals: pending.length,
      last24hVolume,
      trend: days,
    });
  }),

  /* ───────────────────────── Users ───────────────────────── */

  http.get(url(endpoints.adminUsers), async ({ request }) => {
    await delay(150);
    const result = requireAdmin(request);
    if (result instanceof Response) return result;
    const u = new URL(request.url);
    const page = Math.max(1, Number(u.searchParams.get("page") ?? 1));
    const pageSize = Math.min(50, Math.max(5, Number(u.searchParams.get("pageSize") ?? 10)));
    const search = u.searchParams.get("q")?.toLowerCase() ?? "";
    const status = u.searchParams.get("status") ?? "";

    const all = getDB()
      .users.filter((x) => x.role === "USER")
      .filter((x) =>
        search
          ? [x.fullName, x.email, x.accountNumber].join(" ").toLowerCase().includes(search)
          : true,
      )
      .filter((x) => (status ? x.status === status : true));
    const items = all.slice((page - 1) * pageSize, page * pageSize);
    const payload: Paginated<User> = { items, total: all.length, page, pageSize };
    return ok(payload);
  }),

  http.get(url("/admin/users/:id"), async ({ request, params }) => {
    await delay(120);
    const result = requireAdmin(request);
    if (result instanceof Response) return result;
    const target = getDB().users.find((u) => u.id === String(params.id));
    if (!target) return notFound("User not found");
    return ok(target);
  }),

  http.post(url("/admin/users/:id/suspend"), async ({ request, params }) => {
    await delay();
    const result = requireAdmin(request);
    if (result instanceof Response) return result;
    const actor = result;
    const target = getDB().users.find((u) => u.id === String(params.id));
    if (!target) return notFound("User not found");
    target.status = target.status === "SUSPENDED" ? "ACTIVE" : "SUSPENDED";
    logAudit({
      actorId: actor.id,
      actorName: actor.fullName,
      action: target.status === "SUSPENDED" ? "USER_SUSPENDED" : "USER_REACTIVATED",
      target: target.id,
    });
    persist();
    return ok(target);
  }),

  http.post(url("/admin/users/:id/reset-2fa"), async ({ request, params }) => {
    await delay();
    const result = requireAdmin(request);
    if (result instanceof Response) return result;
    const actor = result;
    const db = getDB();
    const target = db.users.find((u) => u.id === String(params.id));
    if (!target) return notFound("User not found");
    target.twoFactorEnabled = false;
    const creds = db.credentials.find((c) => c.userId === target.id);
    if (creds) {
      creds.twoFactorSecret = undefined;
      creds.recoveryCodes = undefined;
    }
    logAudit({
      actorId: actor.id,
      actorName: actor.fullName,
      action: "USER_2FA_RESET",
      target: target.id,
    });
    persist();
    return ok(target);
  }),

  http.post(url("/admin/users/:id/adjust-balance"), async ({ request, params }) => {
    await delay();
    const result = requireAdmin(request);
    if (result instanceof Response) return result;
    const actor = result;
    const body = (await request.json()) as { amount: number; reason: string };
    const db = getDB();
    const target = db.users.find((u) => u.id === String(params.id));
    if (!target) return notFound("User not found");

    target.balance += body.amount;
    const now = new Date().toISOString();
    const tx: Transaction = {
      id: `tx_${faker.string.alphanumeric({ length: 12, casing: "lower" })}`,
      userId: target.id,
      type: body.amount >= 0 ? "DEPOSIT" : "WITHDRAWAL",
      status: "COMPLETED",
      amount: body.amount,
      currency: target.currency,
      description: `Admin adjustment: ${body.reason}`,
      reference: `ADJ${faker.string.numeric({ length: 7 })}`,
      counterparty: actor.fullName,
      createdAt: now,
      completedAt: now,
      metadata: { adminAdjustment: true, reason: body.reason },
    };
    db.transactions.unshift(tx);
    logAudit({
      actorId: actor.id,
      actorName: actor.fullName,
      action: "BALANCE_ADJUSTED",
      target: target.id,
      metadata: { amount: body.amount, reason: body.reason },
    });
    persist();
    return ok(target);
  }),

  /* ───────────────────────── Transactions ───────────────────────── */

  http.get(url(endpoints.adminPendingTransactions), async ({ request }) => {
    await delay(140);
    const result = requireAdmin(request);
    if (result instanceof Response) return result;
    const pending = getDB().transactions.filter(
      (t) => t.status === "PENDING" || t.status === "AWAITING_APPROVAL",
    );
    return ok(pending);
  }),

  http.post(url("/admin/transactions/:id/approve"), async ({ request, params }) => {
    await delay();
    const result = requireAdmin(request);
    if (result instanceof Response) return result;
    const actor = result;
    const tx = getDB().transactions.find((t) => t.id === String(params.id));
    if (!tx) return notFound("Transaction not found");
    tx.status = "COMPLETED";
    tx.completedAt = new Date().toISOString();
    logAudit({
      actorId: actor.id,
      actorName: actor.fullName,
      action: "TX_APPROVED",
      target: tx.id,
    });
    persist();
    return ok(tx);
  }),

  http.post(url("/admin/transactions/:id/reject"), async ({ request, params }) => {
    await delay();
    const result = requireAdmin(request);
    if (result instanceof Response) return result;
    const actor = result;
    const body = (await request.json().catch(() => ({}))) as { reason?: string };
    const tx = getDB().transactions.find((t) => t.id === String(params.id));
    if (!tx) return notFound("Transaction not found");
    tx.status = "FAILED";
    tx.metadata = { ...(tx.metadata ?? {}), rejectionReason: body.reason ?? "Unspecified" };
    logAudit({
      actorId: actor.id,
      actorName: actor.fullName,
      action: "TX_REJECTED",
      target: tx.id,
      metadata: { reason: body.reason ?? "" },
    });
    persist();
    return ok(tx);
  }),

  /* ───────────────────────── Investment packages ───────────────────────── */

  http.get(url(endpoints.adminPackages), async ({ request }) => {
    await delay(100);
    const result = requireAdmin(request);
    if (result instanceof Response) return result;
    return ok(getDB().investmentPackages);
  }),

  http.post(url(endpoints.adminPackages), async ({ request }) => {
    await delay();
    const result = requireAdmin(request);
    if (result instanceof Response) return result;
    const actor = result;
    const body = (await request.json()) as Omit<InvestmentPackage, "id">;
    const pkg: InvestmentPackage = {
      ...body,
      id: `pkg_${faker.string.alphanumeric({ length: 8, casing: "lower" })}`,
    };
    getDB().investmentPackages.push(pkg);
    logAudit({
      actorId: actor.id,
      actorName: actor.fullName,
      action: "PACKAGE_CREATED",
      target: pkg.id,
    });
    persist();
    return ok(pkg);
  }),

  http.patch(url("/admin/investments/packages/:id"), async ({ request, params }) => {
    await delay();
    const result = requireAdmin(request);
    if (result instanceof Response) return result;
    const actor = result;
    const body = (await request.json()) as Partial<InvestmentPackage>;
    const pkg = getDB().investmentPackages.find((p) => p.id === String(params.id));
    if (!pkg) return notFound("Package not found");
    Object.assign(pkg, body);
    logAudit({
      actorId: actor.id,
      actorName: actor.fullName,
      action: "PACKAGE_UPDATED",
      target: pkg.id,
    });
    persist();
    return ok(pkg);
  }),

  http.delete(url("/admin/investments/packages/:id"), async ({ request, params }) => {
    await delay();
    const result = requireAdmin(request);
    if (result instanceof Response) return result;
    const actor = result;
    const db = getDB();
    const idx = db.investmentPackages.findIndex((p) => p.id === String(params.id));
    if (idx < 0) return notFound("Package not found");
    const [removed] = db.investmentPackages.splice(idx, 1);
    if (removed) {
      logAudit({
        actorId: actor.id,
        actorName: actor.fullName,
        action: "PACKAGE_DELETED",
        target: removed.id,
      });
    }
    persist();
    return ok({ ok: true });
  }),

  /* All investments across the platform — for admin package analytics */
  http.get(url("/admin/investments"), async ({ request }) => {
    await delay(120);
    const result = requireAdmin(request);
    if (result instanceof Response) return result;
    return ok(getDB().investments);
  }),

  /* ───────────────────────── Site settings ───────────────────────── */

  http.get(url(endpoints.adminSettings), async ({ request }) => {
    await delay(80);
    const result = requireAdmin(request);
    if (result instanceof Response) return result;
    return ok(getDB().siteSettings);
  }),

  http.patch(url(endpoints.adminSettings), async ({ request }) => {
    await delay();
    const result = requireAdmin(request);
    if (result instanceof Response) return result;
    const actor = result;
    const body = (await request.json()) as Partial<typeof getDB extends () => infer T ? T : never>;
    const db = getDB();
    Object.assign(db.siteSettings, body as object);
    logAudit({
      actorId: actor.id,
      actorName: actor.fullName,
      action: "SETTINGS_UPDATED",
    });
    persist();
    return ok(db.siteSettings);
  }),

  /* ───────────────────────── Audit log ───────────────────────── */

  http.get(url(endpoints.adminAuditLog), async ({ request }) => {
    await delay(120);
    const result = requireAdmin(request);
    if (result instanceof Response) return result;
    const u = new URL(request.url);
    const page = Math.max(1, Number(u.searchParams.get("page") ?? 1));
    const pageSize = Math.min(50, Math.max(5, Number(u.searchParams.get("pageSize") ?? 20)));
    const all = getDB().auditLog;
    const items = all.slice((page - 1) * pageSize, page * pageSize);
    return ok({ items, total: all.length, page, pageSize });
  }),

  /* Catch unhandled admin verbs cleanly */
  http.get(url("/admin/transactions"), async ({ request }) => {
    await delay(150);
    const result = requireAdmin(request);
    if (result instanceof Response) return result;
    const u = new URL(request.url);
    const page = Math.max(1, Number(u.searchParams.get("page") ?? 1));
    const pageSize = Math.min(500, Math.max(5, Number(u.searchParams.get("pageSize") ?? 20)));
    const status = u.searchParams.get("status") ?? "";
    const type = u.searchParams.get("type") ?? "";
    const search = u.searchParams.get("q")?.toLowerCase() ?? "";
    const from = u.searchParams.get("from");
    const to = u.searchParams.get("to");
    const all = getDB()
      .transactions.filter((t) => (status ? t.status === status : true))
      .filter((t) => (type ? t.type === type : true))
      .filter((t) => (from ? t.createdAt >= from : true))
      .filter((t) => (to ? t.createdAt <= `${to}T23:59:59` : true))
      .filter((t) =>
        search
          ? [t.description, t.reference, t.counterparty ?? ""]
              .join(" ")
              .toLowerCase()
              .includes(search)
          : true,
      );
    const items = all.slice((page - 1) * pageSize, page * pageSize);
    return ok({ items, total: all.length, page, pageSize });
  }),

  /* Fallback for any admin POST we forgot — keep dev console clean */
  http.post(url("/admin/*"), async () => {
    return fail("Endpoint not implemented", "NOT_IMPLEMENTED", 501);
  }),
];
