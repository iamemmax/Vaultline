"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { api } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/queryKeys";
import type { Transaction } from "@/types";

export const adminApproveTx = (id: string) =>
  api.post<Transaction>(`/admin/transactions/${id}/approve`);

export function useAdminApproveTx() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: adminApproveTx,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.admin.all });
      toast.success("Transaction approved");
    },
  });
}
