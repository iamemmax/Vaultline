import Link from "next/link";

import { cn } from "@/lib/utils/cn";

export function Logo({ href = "/dashboard", className }: { href?: string; className?: string }) {
  return (
    <Link href={href} className={cn("flex items-center gap-2 font-semibold tracking-tight", className)}>
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
        V
      </span>
      <span>Vaultline</span>
    </Link>
  );
}
