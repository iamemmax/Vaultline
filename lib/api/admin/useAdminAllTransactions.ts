"use client";

import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/queryKeys";
import type { Paginated, Transaction } from "@/types";

export interface AdminAllTransactionsParams {
  page?: number;
  pageSize?: number;
  status?: string;
  type?: string;
  q?: string;
  from?: string;
  to?: string;
}

export const getAdminAllTransactions = (params: AdminAllTransactionsParams = {}) =>
  api.get<Paginated<Transaction>>("/admin/transactions", {
    query: params as Record<string, string | number>,
  });

export function useAdminAllTransactions(params: AdminAllTransactionsParams = {}) {
  return useQuery({
    queryKey: queryKeys.admin.allTransactions(params as Record<string, unknown>),
    queryFn: () => getAdminAllTransactions(params),
    placeholderData: (prev) => prev,
  });
}
