"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { api } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { queryKeys } from "@/lib/api/queryKeys";
import type { User } from "@/types";

export const setPin = (pin: string) =>
  api.post<{ user: User }>(endpoints.setPin, { pin });

export function useSetPin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: setPin,
    onSuccess: ({ user }) => {
      qc.setQueryData(queryKeys.auth.me, user);
      toast.success("Transaction PIN set");
    },
  });
}
