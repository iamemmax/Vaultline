"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { api } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/queryKeys";
import type { PackageCrudInput } from "@/schemas/admin.schema";
import type { InvestmentPackage } from "@/types";

export const adminUpdatePackage = ({
  id,
  body,
}: {
  id: string;
  body: Partial<PackageCrudInput>;
}) => api.patch<InvestmentPackage>(`/admin/investments/packages/${id}`, body);

export function useAdminUpdatePackage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: adminUpdatePackage,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.admin.packages });
      toast.success("Package updated");
    },
  });
}
