"use client";

import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { queryKeys } from "@/lib/api/queryKeys";
import type { AuditLogEntry, Paginated } from "@/types";

export interface AdminAuditLogParams {
  page?: number;
  pageSize?: number;
}

export const getAdminAuditLog = (params: AdminAuditLogParams = {}) =>
  api.get<Paginated<AuditLogEntry>>(endpoints.adminAuditLog, {
    query: params as Record<string, string | number>,
  });

export function useAdminAuditLog(params: AdminAuditLogParams = {}) {
  return useQuery({
    queryKey: queryKeys.admin.auditLog(params as Record<string, unknown>),
    queryFn: () => getAdminAuditLog(params),
    placeholderData: (prev) => prev,
  });
}
