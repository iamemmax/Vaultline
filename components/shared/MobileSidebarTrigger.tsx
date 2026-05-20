"use client";

import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { AdminSidebarBody } from "@/components/admin/AdminSidebar";
import { SidebarBody } from "@/components/shared/Sidebar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";

interface MobileSidebarTriggerProps {
  isAdmin?: boolean;
}

/**
 * Hamburger button (visible <md) that slides the full sidebar in from the left.
 * Re-uses the desktop sidebar's body so nav structure stays in sync.
 */
export function MobileSidebarTrigger({ isAdmin }: MobileSidebarTriggerProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Auto-close on route change so the drawer doesn't linger after a Link click.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Open navigation"
        className="md:hidden"
        onClick={() => setOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>
      <SheetContent
        side="left"
        className="w-72 max-w-[80vw] border-r border-border bg-sidebar p-0 text-sidebar-foreground"
      >
        {isAdmin ? (
          <AdminSidebarBody onNavigate={() => setOpen(false)} />
        ) : (
          <SidebarBody onNavigate={() => setOpen(false)} />
        )}
      </SheetContent>
    </Sheet>
  );
}
