import { faker } from "@faker-js/faker";
import { http } from "msw";

import { endpoints } from "@/lib/api/endpoints";
import { delay, fail, ok, requireAuth } from "@/mocks/helpers";
import { findCredsByUserId, findUserById, getDB, persist } from "@/mocks/db";
import type { Transaction } from "@/types";

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api";
const url = (path: string) => `${BASE}${path}`;

export const transfersHandlers = [
  http.post(url(endpoints.transfers), async ({ request }) => {
    await delay(400);
    const result = requireAuth(request);
    if (result instanceof Response) return result;
    const sender = result;

    const body = (await request.json()) as {
      recipient: string; // account number or email
      amount: number;
      note?: string;
      pin: string;
    };

    const creds = findCredsByUserId(sender.id);
    if (!creds || creds.pinHash !== body.pin) {
      return fail("Incorrect PIN", "INVALID_PIN", 400, { pin: "Incorrect transaction PIN" });
    }

    const db = getDB();
    const recipient = db.users.find(
      (u) =>
        u.accountNumber === body.recipient ||
        u.email.toLowerCase() === body.recipient.toLowerCase(),
    );
    if (!recipient) {
      return fail("Recipient not found", "RECIPIENT_NOT_FOUND", 404, {
        recipient: "No account matches that identifier",
      });
    }
    if (recipient.id === sender.id) {
      return fail("Cannot transfer to your own account", "SELF_TRANSFER", 400, {
        recipient: "Choose a different recipient",
      });
    }

    const live = findUserById(sender.id)!;
    if (live.balance < body.amount) {
      return fail("Insufficient funds", "INSUFFICIENT_FUNDS", 400, {
        amount: "Amount exceeds your available balance",
      });
    }

    const now = new Date().toISOString();
    const ref = `REF${faker.string.numeric({ length: 8 })}`;

    const out: Transaction = {
      id: `tx_${faker.string.alphanumeric({ length: 12, casing: "lower" })}`,
      userId: live.id,
      type: "TRANSFER_OUT",
      status: "COMPLETED",
      amount: -body.amount,
      currency: live.currency,
      description: body.note?.trim() || `Transfer to ${recipient.fullName}`,
      reference: ref,
      counterparty: recipient.fullName,
      createdAt: now,
      completedAt: now,
    };
    const inn: Transaction = {
      id: `tx_${faker.string.alphanumeric({ length: 12, casing: "lower" })}`,
      userId: recipient.id,
      type: "TRANSFER_IN",
      status: "COMPLETED",
      amount: body.amount,
      currency: recipient.currency,
      description: body.note?.trim() || `Transfer from ${live.fullName}`,
      reference: ref,
      counterparty: live.fullName,
      createdAt: now,
      completedAt: now,
    };
    live.balance -= body.amount;
    recipient.balance += body.amount;
    db.transactions.unshift(out, inn);
    persist();

    return ok({ transaction: out, recipient: { name: recipient.fullName, accountNumber: recipient.accountNumber } });
  }),

  http.get(url(endpoints.beneficiaries), async ({ request }) => {
    await delay(100);
    const result = requireAuth(request);
    if (result instanceof Response) return result;
    const user = result;
    return ok(getDB().beneficiaries[user.id] ?? []);
  }),
];
