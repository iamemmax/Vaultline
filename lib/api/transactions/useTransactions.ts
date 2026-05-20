"use client";

import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { queryKeys } from "@/lib/api/queryKeys";
import type { Paginated, Transaction } from "@/types";

export interface TxFilters {
  page?: number;
  pageSize?: number;
  type?: string;
  status?: string;
  q?: string;
  from?: string;
  to?: string;
}

export const getTransactions = (filters: TxFilters = {}) =>
  api.get<Paginated<Transaction>>(endpoints.transactions, {
    query: filters as Record<string, string | number>,
  });

export function useTransactions(filters: TxFilters = {}) {
  return useQuery({
    queryKey: queryKeys.transactions.list(filters as Record<string, unknown>),
    queryFn: () => getTransactions(filters),
    placeholderData: (prev) => prev,
  });
}
