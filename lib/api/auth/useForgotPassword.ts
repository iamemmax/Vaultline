"use client";

import { useMutation } from "@tanstack/react-query";

import { api } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { ForgotPasswordInput } from "@/schemas/auth.schema";

export const forgotPassword = (input: ForgotPasswordInput) =>
  api.post<{ message: string }>(endpoints.forgotPassword, input, { anonymous: true });

export function useForgotPassword() {
  return useMutation({ mutationFn: forgotPassword });
}
