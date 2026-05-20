"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { api, clearAuthToken } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { clearSessionMeta } from "@/lib/auth/session";

export const logout = () => api.post<{ ok: true }>(endpoints.logout);

export function useLogout() {
  const router = useRouter();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: logout,
    onSettled: () => {
      clearAuthToken();
      clearSessionMeta();
      qc.clear();
      router.push("/login");
    },
  });
}
