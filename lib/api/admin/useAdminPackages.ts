"use client";

import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { queryKeys } from "@/lib/api/queryKeys";
import type { InvestmentPackage } from "@/types";

export const getAdminPackages = () =>
  api.get<InvestmentPackage[]>(endpoints.adminPackages);

export function useAdminPackages() {
  return useQuery({
    queryKey: queryKeys.admin.packages,
    queryFn: getAdminPackages,
  });
}
