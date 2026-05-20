"use client";

import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { queryKeys } from "@/lib/api/queryKeys";
import type { Paginated, User } from "@/types";

export interface AdminUsersParams {
  page?: number;
  pageSize?: number;
  q?: string;
  status?: string;
}

export const getAdminUsers = (params: AdminUsersParams = {}) =>
  api.get<Paginated<User>>(endpoints.adminUsers, {
    query: params as Record<string, string | number>,
  });

export function useAdminUsers(params: AdminUsersParams = {}) {
  return useQuery({
    queryKey: queryKeys.admin.users(params as Record<string, unknown>),
    queryFn: () => getAdminUsers(params),
    placeholderData: (prev) => prev,
  });
}
