"use client";

import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api/client";
import type { Investment } from "@/types";

export const getAdminInvestments = () =>
  api.get<Investment[]>("/admin/investments");

export function useAdminInvestments() {
  return useQuery({
    queryKey: ["admin", "investments"] as const,
    queryFn: getAdminInvestments,
    staleTime: 30_000,
  });
}
