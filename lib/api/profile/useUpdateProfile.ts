"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { api } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { queryKeys } from "@/lib/api/queryKeys";
import type { UpdateProfileInput } from "@/schemas/profile.schema";
import type { User } from "@/types";

export const updateProfile = (input: UpdateProfileInput) =>
  api.patch<User>(endpoints.userUpdate, input);

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateProfile,
    onSuccess: (user) => {
      qc.setQueryData(queryKeys.auth.me, user);
      toast.success("Profile updated");
    },
  });
}
