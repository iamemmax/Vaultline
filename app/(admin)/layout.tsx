"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Topbar } from "@/components/shared/Topbar";
import { useMe } from "@/hooks/useAuth";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const me = useMe();

  useEffect(() => {
    if (me.isError) {
      router.replace("/login?callbackUrl=/admin");
      return;
    }
    if (me.data && me.data.role !== "ADMIN") {
      router.replace("/dashboard");
    }
  }, [me.isError, me.data, router]);

  if (me.isPending || !me.data || me.data.role !== "ADMIN") {
    return (
      <div className="grid min-h-screen place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="admin-scope flex h-screen bg-background">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar isAdmin />
        <main className="flex-1 overflow-y-auto px-4 pb-10 pt-6 md:px-8">{children}</main>
      </div>
    </div>
  );
}
