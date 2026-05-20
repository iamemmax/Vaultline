"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { api } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { queryKeys } from "@/lib/api/queryKeys";
import type { PackageCrudInput } from "@/schemas/admin.schema";
import type { InvestmentPackage } from "@/types";

export const adminCreatePackage = (body: PackageCrudInput) =>
  api.post<InvestmentPackage>(endpoints.adminPackages, body);

export function useAdminCreatePackage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: adminCreatePackage,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.admin.packages });
      toast.success("Package created");
    },
  });
}
