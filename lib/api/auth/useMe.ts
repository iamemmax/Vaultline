"use client";

import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { queryKeys } from "@/lib/api/queryKeys";
import type { User } from "@/types";

export const getMe = () => api.get<User>(endpoints.me);

export function useMe(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: getMe,
    enabled: options?.enabled ?? true,
    retry: false,
    staleTime: 60_000,
  });
}
