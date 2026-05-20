"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { api } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/queryKeys";
import type { User } from "@/types";

export const adminResetTwoFactor = (id: string) =>
  api.post<User>(`/admin/users/${id}/reset-2fa`);

export function useAdminResetTwoFactor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: adminResetTwoFactor,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.admin.all });
      toast.success("2FA reset");
    },
  });
}
