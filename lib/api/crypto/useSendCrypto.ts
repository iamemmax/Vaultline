"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { queryKeys } from "@/lib/api/queryKeys";
import type { CryptoSendInput } from "@/schemas/crypto.schema";
import type { Transaction } from "@/types";

export const sendCrypto = (input: CryptoSendInput) =>
  api.post<{ transaction: Transaction }>(endpoints.cryptoSend, input);

export function useSendCrypto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: sendCrypto,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.crypto.wallets });
      qc.invalidateQueries({ queryKey: queryKeys.transactions.all });
    },
  });
}
