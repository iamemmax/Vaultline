"use client";

import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { queryKeys } from "@/lib/api/queryKeys";
import type { Transaction } from "@/types";

export const getAdminPendingTx = () =>
  api.get<Transaction[]>(endpoints.adminPendingTransactions);

export function useAdminPendingTx() {
  return useQuery({
    queryKey: queryKeys.admin.pendingTx,
    queryFn: getAdminPendingTx,
  });
}
