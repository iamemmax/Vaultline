"use client";

import { useMutation } from "@tanstack/react-query";

import { api } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { VerifyOtpInput } from "@/schemas/auth.schema";

export const verifyOtp = (input: VerifyOtpInput) =>
  api.post<{ ok: boolean }>(endpoints.verifyPin, { pin: input.code });

export function useVerifyOtp() {
  return useMutation({ mutationFn: verifyOtp });
}
