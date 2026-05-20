"use client";

import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { queryKeys } from "@/lib/api/queryKeys";
import type { Investment } from "@/types";

export const getMyInvestments = () => api.get<Investment[]>(endpoints.investments);

export function useMyInvestments() {
  return useQuery({
    queryKey: queryKeys.investments.active,
    queryFn: getMyInvestments,
    refetchInterval: 60_000,
  });
}
