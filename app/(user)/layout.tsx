"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { MobileNav } from "@/components/shared/MobileNav";
import { Sidebar } from "@/components/shared/Sidebar";
import { Topbar } from "@/components/shared/Topbar";
import { useMe } from "@/hooks/useAuth";

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const me = useMe();

  useEffect(() => {
    if (me.isError) {
      router.replace("/login?callbackUrl=" + encodeURIComponent(window.location.pathname));
    }
    if (me.data?.role === "ADMIN") {
      router.replace("/admin");
    }
  }, [me.isError, me.data, router]);

  if (me.isPending || !me.data) {
    return (
      <div className="grid min-h-screen place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto px-4 pb-24 pt-6 md:px-8 md:pb-10">{children}</main>
        <MobileNav />
      </div>
    </div>
  );
}
