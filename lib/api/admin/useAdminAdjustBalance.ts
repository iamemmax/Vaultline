"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { api } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/queryKeys";
import type { AdjustBalanceInput } from "@/schemas/admin.schema";
import type { User } from "@/types";

export const adminAdjustBalance = ({
  id,
  body,
}: {
  id: string;
  body: AdjustBalanceInput;
}) => api.post<User>(`/admin/users/${id}/adjust-balance`, body);

export function useAdminAdjustBalance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: adminAdjustBalance,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.admin.all });
      toast.success("Balance adjusted");
    },
  });
}
