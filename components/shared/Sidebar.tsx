"use client";

import {
  ArrowDownToLine,
  ArrowLeftRight,
  ArrowUpFromLine,
  Bitcoin,
  LayoutDashboard,
  LogOut,
  Receipt,
  Settings,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useLogout, useMe } from "@/hooks/useAuth";
import { cn } from "@/lib/utils/cn";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const GROUPS: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/transactions", label: "Transactions", icon: Receipt },
    ],
  },
  {
    label: "Move money",
    items: [
      { href: "/transfer", label: "Transfer", icon: ArrowLeftRight },
      { href: "/send", label: "Send", icon: ArrowUpFromLine },
      { href: "/receive", label: "Receive", icon: ArrowDownToLine },
    ],
  },
  {
    label: "Wealth",
    items: [
      { href: "/investments", label: "Investments", icon: TrendingUp },
      { href: "/crypto", label: "Crypto", icon: Bitcoin },
    ],
  },
  {
    label: "Account",
    items: [{ href: "/settings", label: "Settings", icon: Settings }],
  },
];

export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-sidebar text-sidebar-foreground md:flex">
      <SidebarBody />
    </aside>
  );
}

export function SidebarBody({ onNavigate }: { onNavigate?: () => void } = {}) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="flex h-16 items-center px-5">
        <Link href="/dashboard" className="flex items-center gap-2.5" onClick={onNavigate}>
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary font-semibold text-primary-foreground shadow-sm">
            V
          </span>
          <span className="text-[15px] font-semibold tracking-tight">
            Vaultline
          </span>
        </Link>
      </div>

      {/* Nav groups */}
      <nav className="flex-1 overflow-y-auto px-3 py-2">
        {GROUPS.map((group, idx) => (
          <div key={group.label} className={idx === 0 ? "" : "mt-5"}>
            <p className="px-3 pb-1.5 pt-1 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map(({ href, label, icon: Icon }) => {
                const active =
                  pathname === href ||
                  (href !== "/dashboard" && pathname.startsWith(href));
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={onNavigate}
                    className={cn(
                      "group relative flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                      active
                        ? "bg-primary/10 font-semibold text-primary"
                        : "font-medium text-muted-foreground hover:bg-accent hover:text-foreground",
                    )}
                  >
                    {active ? (
                      <span
                        aria-hidden
                        className="absolute inset-y-1 left-0 w-0.5 rounded-r-full bg-primary"
                      />
                    ) : null}
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User block */}
      <UserBlock />
    </div>
  );
}

function UserBlock() {
  const me = useMe();
  const logout = useLogout();

  if (me.isPending || !me.data) {
    return (
      <div className="flex items-center gap-3 border-t border-border p-4">
        <Skeleton className="h-9 w-9 rounded-full" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
    );
  }

  const initials = me.data.fullName
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex items-center gap-3 border-t border-border p-3">
      <Avatar className="h-9 w-9">
        {me.data.avatarUrl ? (
          <AvatarImage src={me.data.avatarUrl} alt={me.data.fullName} />
        ) : null}
        <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium leading-tight">
          {me.data.fullName}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {me.data.email}
        </p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
        onClick={() => logout.mutate()}
        aria-label="Sign out"
      >
        <LogOut className="h-4 w-4" />
      </Button>
    </div>
  );
}
