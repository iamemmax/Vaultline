"use client";

import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { queryKeys } from "@/lib/api/queryKeys";
import type { SiteSettings } from "@/types";

export const getAdminSettings = () => api.get<SiteSettings>(endpoints.adminSettings);

export function useAdminSettings() {
  return useQuery({
    queryKey: queryKeys.admin.settings,
    queryFn: getAdminSettings,
  });
}
