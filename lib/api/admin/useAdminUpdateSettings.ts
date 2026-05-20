"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { api } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { queryKeys } from "@/lib/api/queryKeys";
import type { SiteSettingsInput } from "@/schemas/admin.schema";
import type { SiteSettings } from "@/types";

export const adminUpdateSettings = (body: SiteSettingsInput) =>
  api.patch<SiteSettings>(endpoints.adminSettings, body);

export function useAdminUpdateSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: adminUpdateSettings,
    onSuccess: (next) => {
      qc.setQueryData(queryKeys.admin.settings, next);
      toast.success("Settings saved");
    },
  });
}
