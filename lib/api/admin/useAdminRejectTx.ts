"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { api } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/queryKeys";
import type { TransactionRejectInput } from "@/schemas/admin.schema";
import type { Transaction } from "@/types";

export const adminRejectTx = ({
  id,
  body,
}: {
  id: string;
  body: TransactionRejectInput;
}) => api.post<Transaction>(`/admin/transactions/${id}/reject`, body);

export function useAdminRejectTx() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: adminRejectTx,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.admin.all });
      toast.success("Transaction rejected");
    },
  });
}
