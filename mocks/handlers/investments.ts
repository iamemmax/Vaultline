import { faker } from "@faker-js/faker";
import { http } from "msw";

import { endpoints } from "@/lib/api/endpoints";
import { delay, fail, ok, requireAuth } from "@/mocks/helpers";
import {
  findCredsByUserId,
  findUserById,
  getDB,
  persist,
} from "@/mocks/db";
import type { Investment, Transaction } from "@/types";

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api";
const url = (path: string) => `${BASE}${path}`;

/**
 * Mature any investments that have crossed their maturity date on every
 * /investments GET. This is the "client-side cron" the spec describes —
 * the user opening their dashboard triggers settlement.
 */
function settleMaturedInvestments(userId: string) {
  const db = getDB();
  const now = Date.now();
  const user = findUserById(userId);
  if (!user) return;

  for (const inv of db.investments) {
    if (inv.userId !== userId) continue;
    if (inv.status !== "ACTIVE") continue;
    if (new Date(inv.maturesAt).getTime() > now) continue;

    inv.status = "COMPLETED";
    inv.completedAt = new Date().toISOString();
    const payout = inv.principal + inv.principal * (inv.roiPercent / 100);
    user.balance += payout;

    const tx: Transaction = {
      id: `tx_${faker.string.alphanumeric({ length: 12, casing: "lower" })}`,
      userId: user.id,
      type: "INVESTMENT_RETURN",
      status: "COMPLETED",
      amount: payout,
      currency: inv.currency,
      description: `Matured: ${inv.packageName}`,
      reference: `INV${inv.id.slice(-6).toUpperCase()}`,
      createdAt: inv.completedAt,
      completedAt: inv.completedAt,
      metadata: { investmentId: inv.id, roiPercent: inv.roiPercent },
    };
    db.transactions.unshift(tx);
  }
  persist();
}

export const investmentsHandlers = [
  http.get(url(endpoints.investmentPackages), async () => {
    await delay(120);
    return ok(getDB().investmentPackages.filter((p) => p.active));
  }),

  http.get(url(endpoints.investments), async ({ request }) => {
    await delay(150);
    const result = requireAuth(request);
    if (result instanceof Response) return result;
    const user = result;
    settleMaturedInvestments(user.id);
    const list = getDB().investments.filter((i) => i.userId === user.id);
    return ok(list);
  }),

  http.post(url(endpoints.investments), async ({ request }) => {
    await delay(400);
    const result = requireAuth(request);
    if (result instanceof Response) return result;
    const user = result;
    const body = (await request.json()) as {
      packageId: string;
      amount: number;
      pin: string;
    };
    const creds = findCredsByUserId(user.id);
    if (!creds || creds.pinHash !== body.pin) {
      return fail("Incorrect PIN", "INVALID_PIN", 400, { pin: "Incorrect transaction PIN" });
    }

    const db = getDB();
    const pkg = db.investmentPackages.find((p) => p.id === body.packageId && p.active);
    if (!pkg) return fail("Package not found", "PACKAGE_NOT_FOUND", 404);

    if (body.amount < pkg.minAmount || body.amount > pkg.maxAmount) {
      return fail(
        `Amount must be between ${pkg.minAmount} and ${pkg.maxAmount}`,
        "AMOUNT_OUT_OF_RANGE",
        400,
        { amount: `Allowed range: ${pkg.minAmount} – ${pkg.maxAmount}` },
      );
    }

    const live = findUserById(user.id)!;
    if (live.balance < body.amount) {
      return fail("Insufficient funds", "INSUFFICIENT_FUNDS", 400, {
        amount: "Amount exceeds your available balance",
      });
    }

    const now = new Date();
    const matures = new Date(now);
    matures.setMonth(matures.getMonth() + pkg.durationMonths);

    const investment: Investment = {
      id: `inv_${faker.string.alphanumeric({ length: 12, casing: "lower" })}`,
      userId: user.id,
      packageId: pkg.id,
      packageName: pkg.name,
      durationMonths: pkg.durationMonths,
      roiPercent: pkg.roiPercent,
      principal: body.amount,
      currency: live.currency,
      status: "ACTIVE",
      startedAt: now.toISOString(),
      maturesAt: matures.toISOString(),
    };
    db.investments.unshift(investment);

    live.balance -= body.amount;
    const debit: Transaction = {
      id: `tx_${faker.string.alphanumeric({ length: 12, casing: "lower" })}`,
      userId: user.id,
      type: "INVESTMENT",
      status: "COMPLETED",
      amount: -body.amount,
      currency: live.currency,
      description: `Locked: ${pkg.name}`,
      reference: `INV${investment.id.slice(-6).toUpperCase()}`,
      createdAt: now.toISOString(),
      completedAt: now.toISOString(),
      metadata: { investmentId: investment.id },
    };
    db.transactions.unshift(debit);
    persist();
    return ok({ investment });
  }),
];
