"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { api } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/queryKeys";

export const adminDeletePackage = (id: string) =>
  api.delete<{ ok: true }>(`/admin/investments/packages/${id}`);

export function useAdminDeletePackage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: adminDeletePackage,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.admin.packages });
      toast.success("Package deleted");
    },
  });
}
