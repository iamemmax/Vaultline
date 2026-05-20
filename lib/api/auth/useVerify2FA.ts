"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { api } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { TwoFactorChallengeInput } from "@/schemas/auth.schema";
import type { User } from "@/types";

import { finalizeLogin } from "./finalizeLogin";

export const verify2FA = (input: TwoFactorChallengeInput) => {
  const challengeToken = sessionStorage.getItem("ft.2fa.challenge") ?? "";
  return api.post<{ user: User; token: string }>(
    endpoints.twoFactorVerify,
    { challengeToken, code: input.code },
    { anonymous: true },
  );
};

export function useVerify2FA() {
  const router = useRouter();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: verify2FA,
    onSuccess: ({ user, token }) => {
      sessionStorage.removeItem("ft.2fa.challenge");
      finalizeLogin(user, token, qc, router);
    },
  });
}
