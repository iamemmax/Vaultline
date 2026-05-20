import Link from "next/link";
import { ArrowRight, Lock, LineChart, Wallet } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Backdrop glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(900px circle at 20% 10%, color-mix(in srgb, var(--color-primary) 22%, transparent), transparent 50%), radial-gradient(700px circle at 80% 90%, color-mix(in srgb, var(--color-primary) 14%, transparent), transparent 50%)",
        }}
      />

      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
            V
          </span>
          <span>Vaultline</span>
        </div>
        <nav className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link href="/login">Sign in</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/register">
              Get started
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </nav>
      </header>

      <section className="mx-auto max-w-6xl px-6 pt-16 pb-24 md:pt-24">
        <p className="text-sm font-medium uppercase tracking-widest text-primary">
          Banking · Investments · Crypto
        </p>
        <h1 className="mt-4 max-w-3xl text-balance text-5xl font-semibold leading-[1.05] tracking-tight md:text-7xl">
          A bank that compounds.
        </h1>
        <p className="mt-6 max-w-xl text-pretty text-lg text-muted-foreground">
          Move money, grow savings with locked investment packages, and hold
          crypto — all from one account with bank-grade security.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link href="/register">
              Open an account
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/login">I have an account</Link>
          </Button>
        </div>

        <div className="mt-20 grid gap-4 md:grid-cols-3">
          {[
            {
              icon: Wallet,
              title: "Multi-currency wallet",
              body: "Hold USD alongside BTC, ETH, USDT, BNB and SOL. Move between them instantly.",
            },
            {
              icon: LineChart,
              title: "Locked investments",
              body: "3, 6 and 12 month packages with transparent ROI and a live maturity countdown.",
            },
            {
              icon: Lock,
              title: "Built for trust",
              body: "Two-factor authentication, transaction PINs, and session control on every device.",
            },
          ].map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="rounded-xl border border-border bg-card p-6 transition-colors hover:bg-accent"
            >
              <Icon className="h-5 w-5 text-primary" />
              <h3 className="mt-4 font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-3 px-6 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} Vaultline. Demo build — mock data only.</p>
          <p>Built with Next.js 15 · Tailwind v4 · TanStack Query</p>
        </div>
      </footer>
    </main>
  );
}
