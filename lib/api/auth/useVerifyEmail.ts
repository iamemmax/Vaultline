"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { api } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { VerifyEmailInput } from "@/schemas/auth.schema";
import type { User } from "@/types";

import { finalizeLogin } from "./finalizeLogin";

export const verifyEmail = (input: VerifyEmailInput) =>
  api.post<{ user: User; token: string }>(
    endpoints.verifyEmail,
    input,
    { anonymous: true },
  );

export function useVerifyEmail() {
  const router = useRouter();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: verifyEmail,
    onSuccess: ({ user, token }) => {
      finalizeLogin(user, token, qc, router);
    },
  });
}
