import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Bitcoin,
  CheckCircle2,
  Fingerprint,
  Globe2,
  LineChart,
  Lock,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Wallet,
} from "lucide-react";

import { Button } from "@/components/ui/button";

const FONT_LINK =
  "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Geist:wght@400;500;600&family=Geist+Mono:wght@400;500&display=swap";

const SERIF = "'Fraunces', ui-serif, Georgia, serif";
const SANS = "'Geist', ui-sans-serif, system-ui, sans-serif";
const MONO = "'Geist Mono', ui-monospace, monospace";

const ticker = [
  { sym: "S&P 500", val: "5,847.12", chg: "+0.42%", up: true },
  { sym: "BTC", val: "$94,210", chg: "+1.18%", up: true },
  { sym: "EUR/USD", val: "1.0853", chg: "−0.07%", up: false },
  { sym: "GOLD", val: "$2,684", chg: "+0.31%", up: true },
  { sym: "ETH", val: "$3,412", chg: "−0.94%", up: false },
  { sym: "10Y", val: "4.187%", chg: "−0.02", up: false },
  { sym: "NIKKEI", val: "39,288", chg: "+0.62%", up: true },
];

export default function HomePage() {
  return (
    <main
      className="min-h-screen bg-[#f6f3ec] text-[#0a1530]"
      style={{ fontFamily: SANS }}
    >
      <link rel="stylesheet" href={FONT_LINK} />

      <Nav />
      <Hero />
      <TickerStrip />
      <Stats />
      <Products />
      <Security />
      <Testimonial />
      <BigCTA />
      <Footer />
    </main>
  );
}

/* ------------------------------------------------------------------ */
/*  Nav                                                                */
/* ------------------------------------------------------------------ */

function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-[#0a1530]/10 bg-[#f6f3ec]/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2.5">
          <Mark />
          <span
            className="text-[17px] tracking-[-0.01em]"
            style={{ fontFamily: SERIF, fontWeight: 500 }}
          >
            Vaultline
          </span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm text-[#0a1530]/65 md:flex">
          <a href="#products" className="transition-colors hover:text-[#0a1530]">
            Products
          </a>
          <a href="#security" className="transition-colors hover:text-[#0a1530]">
            Security
          </a>
          <a href="#trust" className="transition-colors hover:text-[#0a1530]">
            Why us
          </a>
          <span
            className="text-[10.5px] uppercase tracking-[0.18em] text-[#0a1530]/40"
            style={{ fontFamily: MONO }}
          >
            Member portal
          </span>
        </nav>

        <div className="flex items-center gap-2">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-[#0a1530] hover:bg-[#0a1530]/5"
          >
            <Link href="/login">Sign in</Link>
          </Button>
          <Button
            asChild
            size="sm"
            className="bg-[#0a1530] text-white hover:bg-[#0a1530]/90"
          >
            <Link href="/register">
              Open account
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

function Mark() {
  return (
    <span className="grid h-9 w-9 place-items-center rounded-[10px] bg-[#0a1530] text-white">
      <svg
        viewBox="0 0 24 24"
        className="h-[18px] w-[18px]"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M4 5l8 14L20 5" />
        <path d="M8 5l4 7 4-7" opacity="0.55" />
      </svg>
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Hero                                                               */
/* ------------------------------------------------------------------ */

function Hero() {
  return (
    <section
      className="relative overflow-hidden text-white"
      style={{
        backgroundColor: "#0a1530",
        backgroundImage:
          "radial-gradient(1200px circle at 10% -10%, rgba(120,150,255,0.20), transparent 55%), radial-gradient(900px circle at 110% 110%, rgba(196,168,118,0.16), transparent 50%), linear-gradient(165deg, #0a1530 0%, #060b1c 100%)",
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage:
            "radial-gradient(ellipse at 50% 30%, black 40%, transparent 80%)",
        }}
      />

      <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-6 py-20 md:py-28 lg:grid-cols-[1.15fr_1fr]">
        <div className="max-w-2xl">
          <div
            className="mb-7 flex items-center gap-3 text-[11px] uppercase tracking-[0.22em] text-white/45"
            style={{ fontFamily: MONO }}
          >
            <span className="h-px w-8 bg-white/30" />
            Est. 2019 &middot; New York
          </div>

          <h1
            className="text-[44px] leading-[1.02] tracking-tight md:text-[60px] lg:text-[70px]"
            style={{ fontFamily: SERIF, fontWeight: 400 }}
          >
            Where modern money{" "}
            <em
              className="not-italic"
              style={{
                fontFamily: SERIF,
                fontStyle: "italic",
                fontWeight: 400,
                color: "#e7c79a",
              }}
            >
              finds its
            </em>{" "}
            home.
          </h1>

          <p className="mt-6 max-w-xl text-[16px] leading-relaxed text-white/65 md:text-[17px]">
            Banking, investments and crypto, brought together with the discretion
            of a private bank and the speed of a modern app. Open an account in
            under a minute.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Button
              asChild
              size="lg"
              className="bg-white text-[#0a1530] hover:bg-white/90"
            >
              <Link href="/register">
                Open an account
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="ghost"
              className="text-white hover:bg-white/10"
            >
              <Link href="/login">I have an account</Link>
            </Button>
          </div>

          <ul
            className="mt-10 flex flex-wrap gap-x-7 gap-y-2 text-[12.5px] text-white/55"
            style={{ fontFamily: MONO }}
          >
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300/90" />
              FDIC insured · $250k
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300/90" />
              SOC 2 type II
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300/90" />
              No monthly fees
            </li>
          </ul>
        </div>

        <HeroVisual />
      </div>
    </section>
  );
}

function HeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-md lg:max-w-none">
      <div
        className="absolute -left-4 -top-6 z-10 flex items-center gap-2 rounded-full bg-white/8 px-3 py-1.5 text-[11px] text-white/80 ring-1 ring-white/12 backdrop-blur md:left-2"
        style={{ fontFamily: MONO }}
      >
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
        </span>
        Live · markets open
      </div>

      <div
        className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.02] p-6 shadow-2xl backdrop-blur"
        style={{ boxShadow: "0 30px 80px -20px rgba(0,0,0,0.5)" }}
      >
        <div className="flex items-start justify-between">
          <div>
            <p
              className="text-[10.5px] uppercase tracking-[0.18em] text-white/45"
              style={{ fontFamily: MONO }}
            >
              Total balance · USD
            </p>
            <p
              className="mt-2 text-[34px] leading-none tracking-tight text-white"
              style={{ fontFamily: SERIF, fontWeight: 500 }}
            >
              $128,492.<span className="text-white/55">06</span>
            </p>
            <p className="mt-2 inline-flex items-center gap-1 text-[12px] text-emerald-300/90">
              <TrendingUp className="h-3.5 w-3.5" />
              +2.41% · last 30 days
            </p>
          </div>

          <div className="grid h-9 w-9 place-items-center rounded-md bg-white/10 ring-1 ring-white/10">
            <Wallet className="h-4 w-4 text-white/80" />
          </div>
        </div>

        <div className="mt-6">
          <svg viewBox="0 0 320 80" className="h-16 w-full" aria-hidden>
            <defs>
              <linearGradient id="vl-spark" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#e7c79a" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#e7c79a" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M0,60 C30,55 50,40 80,42 C110,44 130,28 160,30 C190,32 210,18 240,14 C270,10 295,22 320,12 L320,80 L0,80 Z"
              fill="url(#vl-spark)"
            />
            <path
              d="M0,60 C30,55 50,40 80,42 C110,44 130,28 160,30 C190,32 210,18 240,14 C270,10 295,22 320,12"
              fill="none"
              stroke="#e7c79a"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <div className="mt-5 space-y-3">
          {[
            { label: "Checking", sub: "•••• 4821", val: "$12,304.50" },
            { label: "Locked · 6-month", sub: "8.2% APY", val: "$45,000.00" },
            { label: "BTC", sub: "1.0420 ฿", val: "$98,187.56" },
          ].map((row) => (
            <div
              key={row.label}
              className="flex items-center justify-between border-t border-white/8 pt-3 first:border-0 first:pt-0"
            >
              <div>
                <p className="text-[13px] text-white/85">{row.label}</p>
                <p
                  className="text-[11px] text-white/45"
                  style={{ fontFamily: MONO }}
                >
                  {row.sub}
                </p>
              </div>
              <p
                className="text-[14px] tabular-nums text-white"
                style={{ fontFamily: MONO }}
              >
                {row.val}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div
        className="absolute -bottom-6 -right-2 z-10 hidden w-56 rounded-xl border border-white/10 bg-[#0a1530] p-4 shadow-xl ring-1 ring-white/5 sm:block"
        style={{ boxShadow: "0 20px 60px -20px rgba(0,0,0,0.6)" }}
      >
        <p
          className="text-[10px] uppercase tracking-[0.2em] text-white/45"
          style={{ fontFamily: MONO }}
        >
          12-month package
        </p>
        <p
          className="mt-1 text-[26px] leading-none text-white"
          style={{ fontFamily: SERIF, fontWeight: 500 }}
        >
          11.4%
        </p>
        <p className="mt-1 text-[11.5px] text-white/55">
          Projected APY · paid on maturity
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Ticker strip                                                       */
/* ------------------------------------------------------------------ */

function TickerStrip() {
  return (
    <div className="border-y border-[#0a1530]/10 bg-[#0a1530]/[0.03]">
      <div className="relative overflow-hidden py-3">
        <div
          className="flex w-max gap-10 whitespace-nowrap"
          style={{
            fontFamily: MONO,
            animation: "vl-ticker 42s linear infinite",
          }}
        >
          {[...ticker, ...ticker, ...ticker].map((t, i) => (
            <span
              key={i}
              className="flex items-center gap-2.5 text-[11.5px] tracking-[0.04em] text-[#0a1530]/70"
            >
              <span className="text-[#0a1530]/45">{t.sym}</span>
              <span className="text-[#0a1530]">{t.val}</span>
              <span className={t.up ? "text-emerald-600/90" : "text-rose-600/90"}>
                {t.chg}
              </span>
              <span className="text-[#0a1530]/20">&bull;</span>
            </span>
          ))}
        </div>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[#f6f3ec] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[#f6f3ec] to-transparent" />
      </div>
      <style>{`
        @keyframes vl-ticker {
          from { transform: translateX(0); }
          to   { transform: translateX(-33.333%); }
        }
      `}</style>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Stats                                                              */
/* ------------------------------------------------------------------ */

function Stats() {
  const items = [
    { k: "$4.2B", v: "Assets in custody" },
    { k: "182k+", v: "Members across 38 countries" },
    { k: "99.99%", v: "Platform uptime · 12 months" },
    { k: "11.4%", v: "Average 12-month package APY" },
  ];
  return (
    <section id="trust" className="mx-auto max-w-6xl px-6 py-20 md:py-24">
      <div
        className="mb-10 flex items-center gap-3 text-[11px] uppercase tracking-[0.22em] text-[#0a1530]/45"
        style={{ fontFamily: MONO }}
      >
        <span className="h-px w-8 bg-[#0a1530]/25" />
        At a glance
      </div>
      <dl className="grid gap-x-8 gap-y-10 border-y border-[#0a1530]/10 py-10 md:grid-cols-4 md:divide-x md:divide-[#0a1530]/10">
        {items.map((s, i) => (
          <div key={s.k} className={i === 0 ? "" : "md:pl-8"}>
            <dt
              className="text-[44px] leading-none tracking-tight text-[#0a1530]"
              style={{ fontFamily: SERIF, fontWeight: 500 }}
            >
              {s.k}
            </dt>
            <dd className="mt-2 text-[13px] text-[#0a1530]/60">{s.v}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Products                                                           */
/* ------------------------------------------------------------------ */

function Products() {
  const items = [
    {
      n: "01",
      icon: Wallet,
      title: "Private banking",
      body: "Multi-currency accounts, instant transfers, and a dedicated relationship manager from day one. Spend in 38 countries with no markup.",
      bullets: ["Same-day USD wires", "Virtual + physical cards", "Joint accounts"],
    },
    {
      n: "02",
      icon: LineChart,
      title: "Curated investments",
      body: "Hand-picked portfolios, fixed-yield packages, and direct access to public and private markets — all with a live maturity countdown.",
      bullets: ["3, 6, 12-month locks", "Transparent APY", "Auto-reinvest"],
    },
    {
      n: "03",
      icon: Bitcoin,
      title: "Always-on crypto",
      body: "Self-custody or managed — trade and hold 80+ digital assets with institutional-grade settlement and on-chain proof of reserves.",
      bullets: ["BTC, ETH, USDT, BNB, SOL", "Network-aware sends", "Proof of reserves"],
    },
  ];

  return (
    <section id="products" className="border-y border-[#0a1530]/10 bg-white">
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl">
            <div
              className="mb-5 flex items-center gap-3 text-[11px] uppercase tracking-[0.22em] text-[#0a1530]/45"
              style={{ fontFamily: MONO }}
            >
              <span className="h-px w-8 bg-[#0a1530]/25" />
              The product
            </div>
            <h2
              className="text-[36px] leading-[1.05] tracking-tight md:text-[48px]"
              style={{ fontFamily: SERIF, fontWeight: 400 }}
            >
              Three accounts.{" "}
              <em
                className="not-italic"
                style={{
                  fontFamily: SERIF,
                  fontStyle: "italic",
                  color: "#a37a32",
                }}
              >
                One balance.
              </em>
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-[#0a1530]/65">
              Built so you never have to leave the app — banking, investments,
              and crypto sharing a single ledger, statement, and identity.
            </p>
          </div>
          <Link
            href="/register"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#0a1530] hover:text-[#0a1530]/70"
          >
            Open an account
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {items.map(({ n, icon: Icon, title, body, bullets }) => (
            <article
              key={n}
              className="group flex flex-col rounded-2xl border border-[#0a1530]/10 bg-[#f6f3ec]/60 p-7 transition-colors hover:bg-[#f6f3ec]"
            >
              <div className="flex items-start justify-between">
                <span
                  className="text-[11px] tracking-[0.22em] text-[#0a1530]/40"
                  style={{ fontFamily: MONO }}
                >
                  {n}
                </span>
                <span className="grid h-9 w-9 place-items-center rounded-md bg-[#0a1530] text-white">
                  <Icon className="h-4 w-4" />
                </span>
              </div>
              <h3
                className="mt-8 text-[22px] tracking-tight text-[#0a1530]"
                style={{ fontFamily: SERIF, fontWeight: 500 }}
              >
                {title}
              </h3>
              <p className="mt-3 text-[14px] leading-relaxed text-[#0a1530]/65">
                {body}
              </p>
              <ul className="mt-6 space-y-2 border-t border-[#0a1530]/10 pt-5 text-[13px] text-[#0a1530]/75">
                {bullets.map((b) => (
                  <li key={b} className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#a37a32]" />
                    {b}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Security                                                           */
/* ------------------------------------------------------------------ */

function Security() {
  const items = [
    {
      icon: ShieldCheck,
      title: "2FA on every sensitive action",
      body: "TOTP with recovery codes. Required for transfers, withdrawals, and admin changes.",
    },
    {
      icon: Fingerprint,
      title: "Transaction PIN",
      body: "A second factor on top of your password for moving money. Never sent over the wire.",
    },
    {
      icon: Lock,
      title: "Session control",
      body: "See every device signed in. Revoke any session instantly. We notify you on new devices.",
    },
    {
      icon: Globe2,
      title: "Regulated globally",
      body: "Licensed for money transmission in 38 jurisdictions and held to a SOC 2 type II standard.",
    },
  ];

  return (
    <section id="security" className="mx-auto max-w-6xl px-6 py-20 md:py-28">
      <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <div
            className="mb-5 flex items-center gap-3 text-[11px] uppercase tracking-[0.22em] text-[#0a1530]/45"
            style={{ fontFamily: MONO }}
          >
            <span className="h-px w-8 bg-[#0a1530]/25" />
            Security
          </div>
          <h2
            className="text-[36px] leading-[1.05] tracking-tight md:text-[44px]"
            style={{ fontFamily: SERIF, fontWeight: 400 }}
          >
            The boring stuff{" "}
            <em
              className="not-italic"
              style={{ fontFamily: SERIF, fontStyle: "italic", color: "#a37a32" }}
            >
              done well.
            </em>
          </h2>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-[#0a1530]/65">
            We don&apos;t sell you on security as a feature — we treat it as the
            floor. Every privileged action is signed, logged and reversible.
          </p>
        </div>

        <ul className="grid gap-6 sm:grid-cols-2">
          {items.map(({ icon: Icon, title, body }) => (
            <li
              key={title}
              className="rounded-xl border border-[#0a1530]/10 bg-white p-5"
            >
              <span className="grid h-9 w-9 place-items-center rounded-md bg-[#0a1530]/[0.06] text-[#0a1530]">
                <Icon className="h-4 w-4" />
              </span>
              <h3
                className="mt-4 text-[16px] text-[#0a1530]"
                style={{ fontFamily: SERIF, fontWeight: 500 }}
              >
                {title}
              </h3>
              <p className="mt-2 text-[13.5px] leading-relaxed text-[#0a1530]/60">
                {body}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Testimonial                                                        */
/* ------------------------------------------------------------------ */

function Testimonial() {
  return (
    <section className="border-y border-[#0a1530]/10 bg-[#0a1530]/[0.03]">
      <div className="mx-auto max-w-3xl px-6 py-20 text-center">
        <Sparkles className="mx-auto h-5 w-5 text-[#a37a32]" />
        <blockquote
          className="mt-6 text-[26px] leading-[1.25] tracking-tight text-[#0a1530] md:text-[34px]"
          style={{ fontFamily: SERIF, fontWeight: 400 }}
        >
          &ldquo;Moved my operating account, my idle USD into a 6-month package,
          and a chunk of my BTC over a single weekend. The thing I notice most
          is how{" "}
          <em
            className="not-italic"
            style={{ fontFamily: SERIF, fontStyle: "italic", color: "#a37a32" }}
          >
            quiet
          </em>{" "}
          it is.&rdquo;
        </blockquote>
        <div
          className="mt-7 text-[11px] uppercase tracking-[0.22em] text-[#0a1530]/55"
          style={{ fontFamily: MONO }}
        >
          Mara K. · Founder, Northbeam &middot; member since 2022
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Big CTA                                                            */
/* ------------------------------------------------------------------ */

function BigCTA() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20 md:py-28">
      <div
        className="relative overflow-hidden rounded-2xl px-8 py-14 text-white md:px-14 md:py-20"
        style={{
          backgroundColor: "#0a1530",
          backgroundImage:
            "radial-gradient(900px circle at 10% 110%, rgba(231,199,154,0.16), transparent 50%), radial-gradient(700px circle at 100% -10%, rgba(120,150,255,0.18), transparent 55%)",
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="relative grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:items-end">
          <div>
            <div
              className="mb-5 flex items-center gap-3 text-[11px] uppercase tracking-[0.22em] text-white/45"
              style={{ fontFamily: MONO }}
            >
              <span className="h-px w-8 bg-white/30" />
              Open in 60 seconds
            </div>
            <h2
              className="max-w-2xl text-[36px] leading-[1.05] tracking-tight md:text-[52px]"
              style={{ fontFamily: SERIF, fontWeight: 400 }}
            >
              Bring your money somewhere{" "}
              <em
                className="not-italic"
                style={{
                  fontFamily: SERIF,
                  fontStyle: "italic",
                  color: "#e7c79a",
                }}
              >
                deliberate.
              </em>
            </h2>
            <p className="mt-5 max-w-lg text-[15.5px] leading-relaxed text-white/65">
              One application. One identity. Three accounts working together,
              insured and audited.
            </p>
          </div>

          <div className="flex flex-col gap-3 lg:items-end">
            <Button
              asChild
              size="lg"
              className="bg-white text-[#0a1530] hover:bg-white/90"
            >
              <Link href="/register">
                Open an account
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
            <Link
              href="/login"
              className="text-[13px] text-white/70 underline-offset-4 hover:underline"
            >
              I already have one
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Footer                                                             */
/* ------------------------------------------------------------------ */

function Footer() {
  const cols = [
    { label: "Product", links: ["Banking", "Investments", "Crypto", "Cards", "Pricing"] },
    { label: "Company", links: ["About", "Newsroom", "Careers", "Contact"] },
    { label: "Resources", links: ["Help center", "Status", "Security", "Developers"] },
    { label: "Legal", links: ["Terms", "Privacy", "Disclosures", "Cookies"] },
  ];

  return (
    <footer className="border-t border-[#0a1530]/10 bg-[#f6f3ec]">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_2fr]">
          <div>
            <Link href="/" className="flex items-center gap-2.5">
              <Mark />
              <span
                className="text-[17px] tracking-[-0.01em]"
                style={{ fontFamily: SERIF, fontWeight: 500 }}
              >
                Vaultline
              </span>
            </Link>
            <p className="mt-5 max-w-sm text-[13.5px] leading-relaxed text-[#0a1530]/60">
              Banking, investments and crypto, brought together with the
              discretion of a private bank and the speed of a modern app.
            </p>
            <p
              className="mt-6 text-[10.5px] uppercase tracking-[0.2em] text-[#0a1530]/45"
              style={{ fontFamily: MONO }}
            >
              FDIC insured &middot; up to $250,000
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {cols.map((c) => (
              <div key={c.label}>
                <p
                  className="text-[10.5px] uppercase tracking-[0.2em] text-[#0a1530]/45"
                  style={{ fontFamily: MONO }}
                >
                  {c.label}
                </p>
                <ul className="mt-4 space-y-2.5 text-[13.5px] text-[#0a1530]/75">
                  {c.links.map((l) => (
                    <li key={l}>
                      <a href="#" className="hover:text-[#0a1530]">
                        {l}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div
          className="mt-14 flex flex-col items-start justify-between gap-3 border-t border-[#0a1530]/10 pt-6 text-[11px] uppercase tracking-[0.18em] text-[#0a1530]/45 sm:flex-row sm:items-center"
          style={{ fontFamily: MONO }}
        >
          <p>© {new Date().getFullYear()} Vaultline Financial</p>
        </div>
      </div>
    </footer>
  );
}
