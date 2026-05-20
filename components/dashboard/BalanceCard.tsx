"use client";

import { Copy, Eye, EyeOff, TrendingUp } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, maskAccountNumber, maskBalance } from "@/lib/utils/format";
import type { User } from "@/types";

interface Props {
  user?: User;
  loading?: boolean;
  /** Optional 30-day net movement, displayed as a small change chip. */
  monthlyChange?: number;
}

export function BalanceCard({ user, loading, monthlyChange }: Props) {
  const [hidden, setHidden] = useState(false);

  if (loading || !user) {
    return (
      <div
        className="relative flex h-full flex-col overflow-hidden rounded-2xl p-7 text-white shadow-lg"
        style={{ background: "linear-gradient(135deg, #0b1d3a 0%, #142a55 50%, #0a1024 100%)" }}
      >
        <Skeleton className="h-4 w-24 bg-white/15" />
        <Skeleton className="mt-5 h-12 w-64 bg-white/15" />
        <Skeleton className="mt-auto h-4 w-52 bg-white/15" />
      </div>
    );
  }

  const formattedBalance = formatCurrency(user.balance, user.currency);
  const displayBalance = hidden ? maskBalance(formattedBalance) : formattedBalance;

  const copyAccount = () => {
    navigator.clipboard.writeText(user.accountNumber);
    toast.success("Account number copied");
  };

  const changePositive = (monthlyChange ?? 0) >= 0;
  const changeAbs = Math.abs(monthlyChange ?? 0);

  return (
    <div
      className="relative isolate flex h-full flex-col overflow-hidden rounded-2xl p-7 text-white shadow-lg ring-1 ring-white/10"
      style={{
        background:
          "radial-gradient(900px circle at 0% 0%, rgba(99,140,255,0.28), transparent 55%), radial-gradient(700px circle at 100% 100%, rgba(56,189,248,0.18), transparent 55%), linear-gradient(160deg, #0b1d3a 0%, #0a1024 100%)",
      }}
    >
      {/* Subtle grid pattern */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.05] mix-blend-overlay"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-white/10 blur-3xl"
      />

      {/* Top row: label + currency chip + eye toggle */}
      <div className="relative flex items-start justify-between">
        <div className="flex items-center gap-2">
          <p className="text-[0.7rem] font-medium uppercase tracking-[0.18em] text-white/70">
            Available balance
          </p>
          <span className="rounded-md bg-white/10 px-1.5 py-0.5 text-[0.65rem] font-semibold tracking-wider text-white/90 ring-1 ring-white/15">
            {user.currency}
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setHidden((h) => !h)}
          aria-label={hidden ? "Show balance" : "Hide balance"}
          className="h-8 w-8 text-white hover:bg-white/15 hover:text-white"
        >
          {hidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
        </Button>
      </div>

      {/* Balance */}
      <p className="relative mt-3 text-3xl font-semibold tabular-nums tracking-tight sm:text-4xl">
        {displayBalance}
      </p>

      {/* Change chip */}
      {typeof monthlyChange === "number" ? (
        <div className="relative mt-3 flex items-center gap-1.5 text-xs">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium ${
              changePositive ? "bg-emerald-400/15 text-emerald-300" : "bg-rose-400/15 text-rose-300"
            }`}
          >
            <TrendingUp className={`h-3 w-3 ${changePositive ? "" : "rotate-180"}`} />
            {changePositive ? "+" : "-"}
            {formatCurrency(changeAbs, user.currency)}
          </span>
          <span className="text-white/55">last 30 days</span>
        </div>
      ) : null}

      {/* Bottom: account row */}
      <div className="relative mt-auto flex items-end justify-between border-t border-white/10 pt-4">
        <div>
          <p className="text-[0.65rem] uppercase tracking-wider text-white/55">Account</p>
          <p className="mt-1 font-mono text-sm tracking-wider text-white/90">
            {maskAccountNumber(user.accountNumber)}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={copyAccount}
          className="h-8 gap-1.5 px-2.5 text-xs text-white/80 hover:bg-white/15 hover:text-white"
        >
          <Copy className="h-3 w-3" />
          Copy
        </Button>
      </div>
    </div>
  );
}
