"use client";

import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { queryKeys } from "@/lib/api/queryKeys";

import type { AdminStats } from "./types";

export const getAdminStats = () => api.get<AdminStats>(endpoints.adminStats);

export function useAdminStats() {
  return useQuery({
    queryKey: queryKeys.admin.stats,
    queryFn: getAdminStats,
    staleTime: 30_000,
  });
}
