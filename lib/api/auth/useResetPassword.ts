"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { api } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { ResetPasswordInput } from "@/schemas/auth.schema";

export const resetPassword = (input: ResetPasswordInput) =>
  api.post<{ message: string }>(
    endpoints.resetPassword,
    { token: input.token, password: input.password },
    { anonymous: true },
  );

export function useResetPassword() {
  const router = useRouter();
  return useMutation({
    mutationFn: resetPassword,
    onSuccess: () => {
      toast.success("Password updated. Please sign in.");
      router.push("/login");
    },
  });
}
