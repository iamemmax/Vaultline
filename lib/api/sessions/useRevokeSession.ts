"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { api } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/queryKeys";

export const revokeSession = (id: string) =>
  api.delete<{ ok: true }>(`/users/sessions/${id}`);

export function useRevokeSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: revokeSession,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.auth.sessions });
      toast.success("Session revoked");
    },
  });
}
