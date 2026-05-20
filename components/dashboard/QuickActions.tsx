import {
  ArrowDownToLine,
  ArrowLeftRight,
  ArrowUpFromLine,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

const actions = [
  { href: "/transfer", label: "Transfer", icon: ArrowLeftRight },
  { href: "/send", label: "Send", icon: ArrowUpFromLine },
  { href: "/receive", label: "Receive", icon: ArrowDownToLine },
  { href: "/investments", label: "Invest", icon: TrendingUp },
] as const;

export function QuickActions() {
  return (
    <div className="grid grid-cols-4 gap-3 sm:gap-4">
      {actions.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className="group flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4 text-center text-sm font-medium transition-all hover:border-primary/30 hover:shadow-sm"
        >
          <span className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
            <Icon className="h-4 w-4" />
          </span>
          {label}
        </Link>
      ))}
    </div>
  );
}
