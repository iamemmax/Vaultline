"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { api } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/queryKeys";
import type { TwoFactorSetupInput } from "@/schemas/auth.schema";
import type { User } from "@/types";

export const confirm2FA = (input: TwoFactorSetupInput) =>
  api.post<{ user: User }>("/auth/2fa/confirm", { code: input.code });

export function use2FAConfirm() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: confirm2FA,
    onSuccess: ({ user }) => {
      qc.setQueryData(queryKeys.auth.me, user);
      toast.success("Two-factor authentication enabled");
    },
  });
}
