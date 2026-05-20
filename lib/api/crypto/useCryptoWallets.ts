"use client";

import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { queryKeys } from "@/lib/api/queryKeys";
import type { CryptoWallet } from "@/types";

export const getCryptoWallets = () => api.get<CryptoWallet[]>(endpoints.cryptoWallets);

export function useCryptoWallets() {
  return useQuery({
    queryKey: queryKeys.crypto.wallets,
    queryFn: getCryptoWallets,
  });
}
