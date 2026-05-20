"use client";

import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { queryKeys } from "@/lib/api/queryKeys";
import type { InvestmentPackage } from "@/types";

export const getInvestmentPackages = () =>
  api.get<InvestmentPackage[]>(endpoints.investmentPackages);

export function useInvestmentPackages() {
  return useQuery({
    queryKey: queryKeys.investments.packages,
    queryFn: getInvestmentPackages,
    staleTime: 5 * 60_000,
  });
}
