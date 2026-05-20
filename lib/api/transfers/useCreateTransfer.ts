"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { queryKeys } from "@/lib/api/queryKeys";
import type { InternalTransferInput } from "@/schemas/transfer.schema";
import type { Transaction } from "@/types";

export const createTransfer = (input: InternalTransferInput) =>
  api.post<{
    transaction: Transaction;
    recipient: { name: string; accountNumber: string };
  }>(endpoints.transfers, input);

export function useCreateTransfer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createTransfer,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.transactions.all });
      qc.invalidateQueries({ queryKey: queryKeys.auth.me });
    },
  });
}
