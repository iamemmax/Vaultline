"use client";

import { useMutation } from "@tanstack/react-query";

import { api } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { RegisterInput } from "@/schemas/auth.schema";

export interface RegisterResponse {
  message: string;
}

export const register = (input: RegisterInput) =>
  api.post<RegisterResponse>(
    endpoints.register,
    {
      fullName: input.fullName,
      email: input.email,
      phone: input.phone,
      country: input.country,
      password: input.password,
    },
    { anonymous: true },
  );

export function useRegister() {
  return useMutation({ mutationFn: register });
}
