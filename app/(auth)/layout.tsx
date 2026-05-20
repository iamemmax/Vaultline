import Link from "next/link";

import { AuthStaleStateGuard } from "@/components/auth/AuthStaleStateGuard";

/* ------------------------------------------------------------------ */
/*  Brand panel data                                                   */
/* ------------------------------------------------------------------ */

const pillars = [
  {
    n: "01",
    title: "Private banking",
    body: "Multi-currency accounts, instant transfers, and a dedicated relationship manager from day one.",
  },
  {
    n: "02",
    title: "Curated investments",
    body: "Hand-picked portfolios, fixed-yield notes, and direct access to public and private markets.",
  },
  {
    n: "03",
    title: "Always-on crypto",
    body: "Self-custody or managed — trade and hold 80+ digital assets with institutional-grade settlement.",
  },
];

const ticker = [
  { sym: "S&P 500", val: "5,847.12", chg: "+0.42%", up: true },
  { sym: "BTC", val: "$94,210", chg: "+1.18%", up: true },
  { sym: "USD/EUR", val: "0.9214", chg: "−0.07%", up: false },
  { sym: "GOLD", val: "$2,684", chg: "+0.31%", up: true },
  { sym: "ETH", val: "$3,412", chg: "−0.94%", up: false },
];

/* ------------------------------------------------------------------ */
/*  Layout                                                             */
/* ------------------------------------------------------------------ */

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="auth-light min-h-screen bg-[#f6f3ec] lg:grid lg:grid-cols-[1.1fr_1fr] xl:grid-cols-[1.2fr_1fr]">
      <AuthStaleStateGuard />
      {/*
        Editorial fonts. If your app already loads these globally, remove this <link>.
        Fraunces (display serif) + Geist (UI sans) — distinctive but readable.
      */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Geist:wght@400;500;600&family=Geist+Mono:wght@400;500&display=swap"
      />

      {/* ── Brand panel (desktop) ─────────────────────────────────── */}
      <aside
        className="relative hidden overflow-hidden text-white lg:flex lg:flex-col lg:px-14 lg:py-10 xl:px-20 xl:py-12"
        style={{
          fontFamily: "'Geist', ui-sans-serif, system-ui, sans-serif",
          backgroundColor: "#0a1530",
          backgroundImage:
            "radial-gradient(1100px circle at 8% -10%, rgba(120,150,255,0.18), transparent 55%), radial-gradient(900px circle at 110% 110%, rgba(196,168,118,0.14), transparent 50%), linear-gradient(165deg, #0a1530 0%, #060b1c 100%)",
        }}
      >
        {/* fine grid texture */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage:
              "radial-gradient(ellipse at 50% 40%, black 40%, transparent 80%)",
          }}
        />

        {/* film grain */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.7'/></svg>\")",
          }}
        />

        {/* ── Top: logo + meta row ─────────────────────────────── */}
        <div className="relative flex items-center justify-between">
          <Link href="/" className="group flex items-center gap-3">
            <Logomark />
            <span
              className="text-[17px] tracking-[-0.01em]"
              style={{ fontFamily: "'Fraunces', serif", fontWeight: 500 }}
            >
              Vaultline
            </span>
          </Link>

          <div
            className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-white/45"
            style={{ fontFamily: "'Geist Mono', ui-monospace, monospace" }}
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </span>
            Markets open
          </div>
        </div>

        {/* ── Middle: editorial headline + pillars ─────────────── */}
        <div className="relative my-auto max-w-xl py-14">
          <div
            className="mb-7 flex items-center gap-3 text-[11px] uppercase tracking-[0.22em] text-white/45"
            style={{ fontFamily: "'Geist Mono', ui-monospace, monospace" }}
          >
            <span className="h-px w-8 bg-white/30" />
            Est. 2019 &middot; New York
          </div>

          <h1
            className="text-[44px] leading-[1.02] tracking-tight xl:text-[56px]"
            style={{ fontFamily: "'Fraunces', serif", fontWeight: 400 }}
          >
            Where modern money{" "}
            <em
              className="not-italic"
              style={{
                fontFamily: "'Fraunces', serif",
                fontStyle: "italic",
                fontWeight: 400,
                color: "#e7c79a",
              }}
            >
              finds its
            </em>{" "}
            home.
          </h1>

          <p className="mt-6 max-w-lg text-[15px] leading-relaxed text-white/65">
            Banking, investments and crypto, brought together with the
            discretion of a private bank and the speed of a modern app.
          </p>

          <ul className="mt-12 divide-y divide-white/8 border-y border-white/8">
            {pillars.map(({ n, title, body }) => (
              <li
                key={n}
                className="group flex items-start gap-6 py-5 transition-colors duration-300 hover:bg-white/[0.02]"
              >
                <span
                  className="mt-1 shrink-0 text-[11px] tracking-[0.2em] text-white/35"
                  style={{
                    fontFamily: "'Geist Mono', ui-monospace, monospace",
                  }}
                >
                  {n}
                </span>
                <div className="space-y-1">
                  <p
                    className="text-[17px] tracking-[-0.01em] text-white"
                    style={{ fontFamily: "'Fraunces', serif", fontWeight: 500 }}
                  >
                    {title}
                  </p>
                  <p className="text-[13.5px] leading-relaxed text-white/55">
                    {body}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* ── Bottom: ticker + footer meta ─────────────────────── */}
        <div className="relative space-y-5">
          {/* Ticker */}
          <div className="relative overflow-hidden border-y border-white/8 py-3">
            <div
              className="flex w-max gap-10 whitespace-nowrap"
              style={{
                fontFamily: "'Geist Mono', ui-monospace, monospace",
                animation: "vl-ticker 38s linear infinite",
              }}
            >
              {[...ticker, ...ticker, ...ticker].map((t, i) => (
                <span
                  key={i}
                  className="flex items-center gap-2.5 text-[11.5px] tracking-[0.04em] text-white/70"
                >
                  <span className="text-white/45">{t.sym}</span>
                  <span className="text-white/85">{t.val}</span>
                  <span
                    className={t.up ? "text-emerald-300/90" : "text-rose-300/90"}
                  >
                    {t.chg}
                  </span>
                  <span className="text-white/15">&bull;</span>
                </span>
              ))}
            </div>
            {/* edge fades */}
            <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-linear-to-r from-[#0a1530] to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-linear-to-l from-[#0a1530] to-transparent" />
          </div>

          <div
            className="flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-white/40"
            style={{ fontFamily: "'Geist Mono', ui-monospace, monospace" }}
          >
            <span>&copy; {new Date().getFullYear()} Vaultline Financial</span>
            <span>FDIC insured &middot; up to $250,000</span>
          </div>
        </div>

        {/* keyframes for ticker */}
        <style>{`
          @keyframes vl-ticker {
            from { transform: translateX(0); }
            to   { transform: translateX(-33.333%); }
          }
        `}</style>
      </aside>

      {/* ── Form panel ────────────────────────────────────────────── */}
      <section
        className="flex min-h-screen flex-col bg-[#f6f3ec]"
        style={{ fontFamily: "'Geist', ui-sans-serif, system-ui, sans-serif" }}
      >
        {/* Mobile header */}
        <header className="flex items-center justify-between px-6 py-6 lg:hidden">
          <Link href="/" className="flex items-center gap-2.5">
            <LogomarkDark />
            <span
              className="text-[16px] tracking-[-0.01em] text-[#0a1530]"
              style={{ fontFamily: "'Fraunces', serif", fontWeight: 500 }}
            >
              Vaultline
            </span>
          </Link>
          <span
            className="text-[10px] uppercase tracking-[0.2em] text-[#0a1530]/50"
            style={{ fontFamily: "'Geist Mono', ui-monospace, monospace" }}
          >
            Member portal
          </span>
        </header>

        <main className="flex flex-1 items-center justify-center px-6 pb-16 pt-4 sm:px-10 lg:px-12 lg:py-12">
          <div className="w-full max-w-md">
            {/* Decorative serial label above form slot */}
            <div
              className="mb-8 hidden items-center gap-3 text-[10.5px] uppercase tracking-[0.22em] text-[#0a1530]/45 lg:flex"
              style={{ fontFamily: "'Geist Mono', ui-monospace, monospace" }}
            >
              <span className="h-px w-6 bg-[#0a1530]/25" />
              Secure access
              <span className="ml-auto">No. 0001-VL</span>
            </div>

            {children}
          </div>
        </main>

        <footer
          className="px-6 pb-8 text-center text-[11px] uppercase tracking-[0.18em] text-[#0a1530]/45 lg:hidden"
          style={{ fontFamily: "'Geist Mono', ui-monospace, monospace" }}
        >
          &copy; {new Date().getFullYear()} Vaultline Financial
        </footer>
      </section>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Logomark — a small, considered brand mark (not a letter in a box)  */
/* ------------------------------------------------------------------ */

function Logomark() {
  return (
    <span className="grid h-9 w-9 place-items-center rounded-[10px] bg-white/8 ring-1 ring-white/12 backdrop-blur-sm">
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

function LogomarkDark() {
  return (
    <span className="grid h-8 w-8 place-items-center rounded-[9px] bg-[#0a1530] text-white">
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4"
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

