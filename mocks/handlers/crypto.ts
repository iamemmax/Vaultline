import { faker } from "@faker-js/faker";
import { http } from "msw";

import { endpoints } from "@/lib/api/endpoints";
import { delay, fail, ok, requireAuth } from "@/mocks/helpers";
import { findCredsByUserId, getDB, persist } from "@/mocks/db";
import type { CryptoSymbol, Transaction } from "@/types";

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api";
const url = (path: string) => `${BASE}${path}`;

/** Apply a small random walk to each price on every fetch — feels live. */
function tickPrices() {
  const db = getDB();
  db.cryptoPrices = db.cryptoPrices.map((p) => {
    const drift = p.usd * faker.number.float({ min: -0.004, max: 0.004 });
    const newPrice = Math.max(0.0001, p.usd + drift);
    return {
      ...p,
      usd: Number(newPrice.toFixed(p.asset === "USDT" ? 4 : 2)),
      change24h: Number((p.change24h + faker.number.float({ min: -0.2, max: 0.2 })).toFixed(2)),
      updatedAt: new Date().toISOString(),
    };
  });
  persist();
}

export const cryptoHandlers = [
  http.get(url(endpoints.cryptoWallets), async ({ request }) => {
    await delay(140);
    const result = requireAuth(request);
    if (result instanceof Response) return result;
    const user = result;
    const db = getDB();
    if (!db.cryptoWallets[user.id]) {
      db.cryptoWallets[user.id] = [];
      persist();
    }
    return ok(db.cryptoWallets[user.id]);
  }),

  http.get(url(endpoints.cryptoPrices), async () => {
    await delay(100);
    tickPrices();
    return ok(getDB().cryptoPrices);
  }),

  http.post(url(endpoints.cryptoSend), async ({ request }) => {
    await delay(400);
    const result = requireAuth(request);
    if (result instanceof Response) return result;
    const user = result;
    const body = (await request.json()) as {
      asset: CryptoSymbol;
      address: string;
      amount: number;
      network: string;
      pin: string;
    };
    const creds = findCredsByUserId(user.id);
    if (!creds || creds.pinHash !== body.pin) {
      return fail("Incorrect PIN", "INVALID_PIN", 400, { pin: "Incorrect transaction PIN" });
    }

    const db = getDB();
    const wallets = db.cryptoWallets[user.id] ?? [];
    const wallet = wallets.find((w) => w.asset === body.asset);
    if (!wallet) return fail("Wallet not found", "WALLET_NOT_FOUND", 404);
    if (wallet.balance < body.amount) {
      return fail("Insufficient funds", "INSUFFICIENT_FUNDS", 400, {
        amount: "Amount exceeds wallet balance",
      });
    }
    wallet.balance -= body.amount;
    const now = new Date().toISOString();
    const tx: Transaction = {
      id: `tx_${faker.string.alphanumeric({ length: 12, casing: "lower" })}`,
      userId: user.id,
      type: "CRYPTO_SEND",
      status: "COMPLETED",
      amount: -body.amount,
      currency: body.asset,
      description: `Sent ${body.asset}`,
      reference: `TXH${faker.string.alphanumeric({ length: 10, casing: "upper" })}`,
      counterparty: body.address,
      fee: 0.0001,
      createdAt: now,
      completedAt: now,
      metadata: { network: body.network },
    };
    db.transactions.unshift(tx);
    persist();
    return ok({ transaction: tx });
  }),

  http.get(url(endpoints.cryptoReceive), async ({ request }) => {
    await delay(80);
    const result = requireAuth(request);
    if (result instanceof Response) return result;
    const user = result;
    const u = new URL(request.url);
    const asset = (u.searchParams.get("asset") ?? "BTC") as CryptoSymbol;
    const wallet = (getDB().cryptoWallets[user.id] ?? []).find((w) => w.asset === asset);
    if (!wallet) return fail("Wallet not found", "WALLET_NOT_FOUND", 404);
    return ok({ asset: wallet.asset, address: wallet.address, network: wallet.network });
  }),
];
