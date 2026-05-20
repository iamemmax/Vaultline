"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { api } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { queryKeys } from "@/lib/api/queryKeys";
import type { CreateInvestmentInput } from "@/schemas/investment.schema";
import type { Investment } from "@/types";

export const createInvestment = (input: CreateInvestmentInput) =>
  api.post<{ investment: Investment }>(endpoints.investments, {
    packageId: input.packageId,
    amount: input.amount,
    pin: input.pin,
  });

export function useCreateInvestment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createInvestment,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.investments.all });
      qc.invalidateQueries({ queryKey: queryKeys.transactions.all });
      qc.invalidateQueries({ queryKey: queryKeys.auth.me });
      toast.success("Investment locked. Watch it grow on your dashboard.");
    },
  });
}
