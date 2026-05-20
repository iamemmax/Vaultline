"use client";

import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { queryKeys } from "@/lib/api/queryKeys";
import type { CryptoPrice } from "@/types";

export const getCryptoPrices = () => api.get<CryptoPrice[]>(endpoints.cryptoPrices);

export function useCryptoPrices() {
  return useQuery({
    queryKey: queryKeys.crypto.prices,
    queryFn: getCryptoPrices,
    refetchInterval: 30_000,
  });
}
