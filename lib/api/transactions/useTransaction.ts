"use client";

import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/queryKeys";
import type { Transaction } from "@/types";

export const getTransaction = (id: string) =>
  api.get<Transaction>(`/transactions/${id}`);

export function useTransaction(id: string | undefined) {
  return useQuery({
    queryKey: id ? queryKeys.transactions.detail(id) : ["__noop__"],
    queryFn: () => getTransaction(id as string),
    enabled: !!id,
  });
}
