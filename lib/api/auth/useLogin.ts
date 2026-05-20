"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { api } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { LoginInput } from "@/schemas/auth.schema";
import type { User } from "@/types";

import { finalizeLogin } from "./finalizeLogin";

export interface LoginResponse {
  user?: User;
  token?: string;
  requires2FA?: boolean;
  challengeToken?: string;
}

export const login = (input: LoginInput) =>
  api.post<LoginResponse>(endpoints.login, input, { anonymous: true });

export function useLogin() {
  const router = useRouter();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      if (data.requires2FA && data.challengeToken) {
        sessionStorage.setItem("ft.2fa.challenge", data.challengeToken);
        router.push("/2fa");
        return;
      }
      if (!data.token || !data.user) return;
      finalizeLogin(data.user, data.token, qc, router);
    },
  });
}
