import { http } from "msw";

import { endpoints } from "@/lib/api/endpoints";
import { delay, notFound, ok, requireAuth } from "@/mocks/helpers";
import { getDB } from "@/mocks/db";
import type { Paginated, Transaction } from "@/types";

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api";
const url = (path: string) => `${BASE}${path}`;

export const transactionsHandlers = [
  http.get(url(endpoints.transactions), async ({ request }) => {
    await delay(150);
    const result = requireAuth(request);
    if (result instanceof Response) return result;
    const user = result;

    const u = new URL(request.url);
    const page = Math.max(1, Number(u.searchParams.get("page") ?? 1));
    const pageSize = Math.min(50, Math.max(5, Number(u.searchParams.get("pageSize") ?? 10)));
    const type = u.searchParams.get("type") ?? "";
    const status = u.searchParams.get("status") ?? "";
    const search = u.searchParams.get("q")?.toLowerCase() ?? "";
    const from = u.searchParams.get("from");
    const to = u.searchParams.get("to");

    const all = getDB()
      .transactions.filter((t) => t.userId === user.id)
      .filter((t) => (type ? t.type === type : true))
      .filter((t) => (status ? t.status === status : true))
      .filter((t) =>
        search
          ? [t.description, t.reference, t.counterparty ?? ""]
              .join(" ")
              .toLowerCase()
              .includes(search)
          : true,
      )
      .filter((t) => (from ? new Date(t.createdAt) >= new Date(from) : true))
      .filter((t) => (to ? new Date(t.createdAt) <= new Date(to) : true));

    const start = (page - 1) * pageSize;
    const items = all.slice(start, start + pageSize);
    const payload: Paginated<Transaction> = {
      items,
      total: all.length,
      page,
      pageSize,
    };
    return ok(payload);
  }),

  http.get(url("/transactions/:id"), async ({ request, params }) => {
    await delay(100);
    const result = requireAuth(request);
    if (result instanceof Response) return result;
    const user = result;
    const tx = getDB().transactions.find(
      (t) => t.id === String(params.id) && t.userId === user.id,
    );
    if (!tx) return notFound("Transaction not found");
    return ok(tx);
  }),
];
