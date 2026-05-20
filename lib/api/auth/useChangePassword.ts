"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { api } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { ChangePasswordInput } from "@/schemas/auth.schema";

export const changePassword = (input: ChangePasswordInput) =>
  api.post<{ message: string }>(endpoints.changePassword, {
    currentPassword: input.currentPassword,
    newPassword: input.newPassword,
  });

export function useChangePassword() {
  return useMutation({
    mutationFn: changePassword,
    onSuccess: () => toast.success("Password changed"),
  });
}
