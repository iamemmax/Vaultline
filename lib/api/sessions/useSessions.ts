"use client";

import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { queryKeys } from "@/lib/api/queryKeys";
import type { Session } from "@/types";

export const getSessions = () => api.get<Session[]>(endpoints.sessions);

export function useSessions() {
  return useQuery({
    queryKey: queryKeys.auth.sessions,
    queryFn: getSessions,
  });
}
