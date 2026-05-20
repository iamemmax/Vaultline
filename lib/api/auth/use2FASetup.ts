"use client";

import { useMutation } from "@tanstack/react-query";

import { api } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";

export const setup2FA = () =>
  api.post<{ secret: string; otpauth: string; recoveryCodes: string[] }>(
    endpoints.twoFactorSetup,
  );

export function use2FASetup() {
  return useMutation({ mutationFn: setup2FA });
}
