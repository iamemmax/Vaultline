/**
 * Hierarchical React Query key factory.
 *
 * Pattern: queryKeys.feature.list({filters}) / queryKeys.feature.detail(id)
 * Invalidating `queryKeys.transactions.all` invalidates every transaction
 * list and detail query in one shot.
 */

export const queryKeys = {
  auth: {
    me: ["auth", "me"] as const,
    sessions: ["auth", "sessions"] as const,
  },
  transactions: {
    all: ["transactions"] as const,
    list: (filters?: Record<string, unknown>) =>
      ["transactions", "list", filters ?? {}] as const,
    detail: (id: string) => ["transactions", "detail", id] as const,
  },
  investments: {
    all: ["investments"] as const,
    packages: ["investments", "packages"] as const,
    active: ["investments", "active"] as const,
    detail: (id: string) => ["investments", "detail", id] as const,
  },
  crypto: {
    wallets: ["crypto", "wallets"] as const,
    prices: ["crypto", "prices"] as const,
  },
  admin: {
    all: ["admin"] as const,
    stats: ["admin", "stats"] as const,
    users: (filters?: Record<string, unknown>) =>
      ["admin", "users", filters ?? {}] as const,
    user: (id: string) => ["admin", "users", id] as const,
    pendingTx: ["admin", "pending-tx"] as const,
    allTransactions: (filters?: Record<string, unknown>) =>
      ["admin", "transactions", filters ?? {}] as const,
    packages: ["admin", "packages"] as const,
    settings: ["admin", "settings"] as const,
    auditLog: (filters?: Record<string, unknown>) =>
      ["admin", "audit-log", filters ?? {}] as const,
  },
} as const;
