"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { api } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { queryKeys } from "@/lib/api/queryKeys";
import type { User } from "@/types";

export const disable2FA = (password: string) =>
  api.post<{ user: User }>(endpoints.twoFactorDisable, { password });

export function use2FADisable() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: disable2FA,
    onSuccess: ({ user }) => {
      qc.setQueryData(queryKeys.auth.me, user);
      toast.success("Two-factor authentication disabled");
    },
  });
}
