"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { api } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/queryKeys";
import type { User } from "@/types";

export const adminSuspendUser = (id: string) =>
  api.post<User>(`/admin/users/${id}/suspend`);

export function useAdminSuspendUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: adminSuspendUser,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.admin.all });
      toast.success("Status updated");
    },
  });
}
