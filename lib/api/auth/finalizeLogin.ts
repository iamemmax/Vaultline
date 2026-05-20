import type { QueryClient } from "@tanstack/react-query";
import type { useRouter } from "next/navigation";
import { toast } from "sonner";

import { setAuthToken } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/queryKeys";
import { setSessionMeta } from "@/lib/auth/session";
import type { User } from "@/types";

export function finalizeLogin(
  user: User,
  token: string,
  qc: QueryClient,
  router: ReturnType<typeof useRouter>,
) {
  setAuthToken(token);
  setSessionMeta({ userId: user.id, role: user.role });
  qc.setQueryData(queryKeys.auth.me, user);
  toast.success(`Welcome back, ${user.fullName.split(" ")[0] ?? ""}`);
  const next = new URLSearchParams(window.location.search).get("callbackUrl");
  router.push(next ?? (user.role === "ADMIN" ? "/admin" : "/dashboard"));
}
