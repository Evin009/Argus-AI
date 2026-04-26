import Image from "next/image";
import Link from "next/link";
import { AuroraBackground } from "@/components/ui/aurora-background";

// ── Data ──────────────────────────────────────────────────────────────

const features = [
  {
    title: "Cashflow Prediction",
    description:
      "See your balance 30–60 days out. Know about an overdraft before your bank does.",
    previewType: "chart" as const,
  },
  {
    title: "AI Financial Copilot",
    description:
      "Ask anything. Get answers grounded in your real account data — not generic advice.",
    previewType: "terminal" as const,
  },
  {
    title: "Risk Radar",
    description:
      "Daily overdraft probability scoring. Alerts fire before the problem, not after.",
    previewType: "radar" as const,
  },
  {
    title: "Behavioral Intelligence",
    description:
      "ArgusAI learns your spending rhythm. It surfaces patterns you've never noticed.",
    previewType: "heatmap" as const,
  },
];

const teasers = [
  {
    title: "Debt Simulator",
    description: "Snowball vs. Avalanche, simulated against your real cashflow.",
  },
  {
    title: "Health Score",
    description: "A 0–100 score across 4 dimensions. Updates every day.",
  },
  {
    title: "Scenario Simulator",
    description: "What if your income dropped $500? See the impact in real time.",
  },
  {
    title: "Subscription Creep",
    description: "The price increase was $2.99. You never noticed. ArgusAI did.",
  },
  {
    title: "Smart Allocation",
    description: "Deposit landed. Here's exactly how to split it.",
  },
  {
    title: "Bill Calendar",
    description: "Every bill, every due date, color-coded by urgency.",
  },
];

const problems = [
  {
    label: "Lagging Indicators",
    body: "Traditional apps tell you what you already spent. ArgusAI calculates what happens next based on current trajectories.",
  },
  {
    label: "Cognitive Overload",
    body: "Sifting through fragmented bank statements is inefficient. We unify your data into a single actionable intelligence stream.",
  },
  {
    label: "Static Risk Models",
    body: "Volatility doesn't wait for quarterly reviews. Our risk engine operates on continuous real-time signals.",
  },
];

// ── Feature Card Previews ─────────────────────────────────────────────

function ChartPreview() {
  return (
    <div className="relative h-32 overflow-hidden rounded-md border border-border bg-surface-lowest">
      <div className="absolute inset-0 flex items-end gap-0.5 px-3 pb-2">
        {[42, 55, 48, 62, 58, 70, 65, 76, 70, 84, 78, 90].map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-sm bg-accent/20"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
      <div className="absolute inset-0 flex items-end px-2 pb-1">
        <svg
          viewBox="0 0 300 100"
          className="h-20 w-full opacity-70"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="chart-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ecbca7" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#ecbca7" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M0,58 L25,50 L50,54 L75,38 L100,43 L125,28 L150,34 L175,20 L200,27 L225,14 L250,20 L275,10 L300,6 L300,100 L0,100 Z"
            fill="url(#chart-fill)"
          />
          <polyline
            points="0,58 25,50 50,54 75,38 100,43 125,28 150,34 175,20 200,27 225,14 250,20 275,10 300,6"
            fill="none"
            stroke="#ecbca7"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}

function TerminalPreview() {
  return (
    <div className="h-32 overflow-hidden rounded-md border border-border bg-surface-lowest p-3 font-display">
      <div className="text-[11px] leading-relaxed">
        <div className="text-accent/60">$ argus query --account all</div>
        <div className="mt-1 text-on-surface/40">› Balance: $12,842.00</div>
        <div className="text-on-surface/40">› Upcoming: $1,247 due in 7 days</div>
        <div className="text-on-surface/40">
          › Overdraft risk:{" "}
          <span className="text-positive/60">LOW (4%)</span>
        </div>
        <div className="mt-1 animate-pulse text-accent/40">_</div>
      </div>
    </div>
  );
}

function RadarPreview() {
  return (
    <div className="flex h-32 items-center justify-center overflow-hidden rounded-md border border-border bg-surface-lowest">
      <div className="relative h-20 w-20">
        <div className="absolute inset-0 rounded-full border border-accent/20" />
        <div className="absolute inset-3 rounded-full border border-accent/14" />
        <div className="absolute inset-6 rounded-full border border-warning/25" />
        <div className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent" />
        <div className="absolute right-1/4 top-1/4 h-1 w-1 rounded-full bg-danger/70" />
        <div className="absolute bottom-1/3 left-1/4 h-1 w-1 rounded-full bg-warning/60" />
        <div className="absolute bottom-1/4 right-1/3 h-1 w-1 rounded-full bg-on-muted/40" />
      </div>
    </div>
  );
}

function HeatmapPreview() {
  const opacities = [
    0.8, 0.2, 0.9, 0.1, 0.5, 0.7, 0.3, 0.6, 0.4, 0.8, 0.1, 0.7, 0.9, 0.2,
    0.5, 0.3, 0.6, 0.8, 0.4, 0.9, 0.2, 0.7, 0.5, 0.1, 0.8, 0.3, 0.6, 0.9,
    0.4, 0.7, 0.2, 0.5,
  ];
  return (
    <div className="flex h-32 items-center justify-center overflow-hidden rounded-md border border-border bg-surface-lowest">
      <div className="grid grid-cols-8 gap-1">
        {opacities.map((op, i) => (
          <div
            key={i}
            className="h-4 w-4 rounded-sm bg-accent"
            style={{ opacity: op }}
          />
        ))}
      </div>
    </div>
  );
}

// ── Dashboard Mockup ──────────────────────────────────────────────────

function DashboardMockup() {
  const stats = [
    { label: "Total Balance", value: "$12,842", delta: "+$340", pos: true },
    { label: "Monthly Spend", value: "$3,241", delta: "+12%", pos: false },
    { label: "Health Score", value: "74 / 100", delta: "+3 pts", pos: true },
    { label: "Next Bill", value: "$247", delta: "in 4 days", pos: null },
  ];

  const navItems = [
    "Dashboard",
    "Accounts",
    "Transactions",
    "Cashflow",
    "Risk Radar",
    "Copilot",
    "Goals",
  ];

  return (
    <div className="overflow-hidden rounded-t-xl border-x border-t border-border shadow-2xl">
      {/* Window chrome */}
      <div className="flex h-8 items-center gap-2 border-b border-white/10 bg-white/5 px-4 backdrop-blur-md">
        <div className="h-3 w-3 rounded-full bg-danger/50" />
        <div className="h-3 w-3 rounded-full bg-warning/40" />
        <div className="h-3 w-3 rounded-full bg-border" />
        <span className="ml-4 font-display text-[9px] uppercase tracking-widest text-on-muted">
          ARGUS_TERMINAL_V.2.04
        </span>
      </div>

      {/* App shell */}
      <div className="flex h-[360px] bg-surface-lowest">
        {/* Sidebar */}
        <div className="flex w-44 flex-col gap-0.5 border-r border-border bg-surface px-2 py-4">
          <span className="mb-3 px-2 font-display text-xs font-bold uppercase tracking-widest text-accent-light">
            ArgusAI
          </span>
          {navItems.map((item, i) => (
            <div
              key={item}
              className={`rounded px-2 py-1.5 font-display text-xs ${
                i === 0
                  ? "border-l-2 border-accent bg-accent-container/30 text-accent-light"
                  : "text-on-muted"
              }`}
            >
              {item}
            </div>
          ))}
        </div>

        {/* Main */}
        <div className="flex-1 overflow-hidden p-4">
          {/* Stats row */}
          <div className="mb-4 grid grid-cols-4 gap-3">
            {stats.map(({ label, value, delta, pos }) => (
              <div
                key={label}
                className="rounded-lg border border-border bg-surface p-2.5"
              >
                <div className="mb-1 font-display text-[9px] uppercase tracking-widest text-on-muted">
                  {label}
                </div>
                <div className="font-display text-sm font-bold text-on-surface">
                  {value}
                </div>
                <div
                  className={`mt-0.5 text-[9px] ${
                    pos === true
                      ? "text-positive"
                      : pos === false
                        ? "text-danger"
                        : "text-on-muted"
                  }`}
                >
                  {delta}
                </div>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-3 gap-3">
            {/* Cashflow */}
            <div className="col-span-2 rounded-lg border border-border bg-surface p-3">
              <div className="mb-2 font-display text-[9px] uppercase tracking-widest text-on-muted">
                30-Day Cashflow Forecast
              </div>
              <svg
                viewBox="0 0 200 60"
                className="h-14 w-full"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient
                    id="mockup-grad"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="#ecbca7"
                      stopOpacity="0.3"
                    />
                    <stop
                      offset="100%"
                      stopColor="#ecbca7"
                      stopOpacity="0"
                    />
                  </linearGradient>
                </defs>
                <path
                  d="M0,42 L20,36 L40,40 L60,26 L80,30 L100,20 L120,23 L140,15 L160,18 L180,9 L200,7 L200,60 L0,60 Z"
                  fill="url(#mockup-grad)"
                />
                <polyline
                  points="0,42 20,36 40,40 60,26 80,30 100,20 120,23 140,15 160,18 180,9 200,7"
                  fill="none"
                  stroke="#ecbca7"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            {/* Risk alerts */}
            <div className="rounded-lg border border-border bg-surface p-3">
              <div className="mb-2 font-display text-[9px] uppercase tracking-widest text-on-muted">
                Risk Radar
              </div>
              <div className="space-y-1.5">
                <div className="rounded border-l-2 border-warning bg-warning/10 px-2 py-1.5">
                  <div className="font-display text-[9px] font-semibold text-warning">
                    Medium Risk
                  </div>
                  <div className="text-[8px] text-on-muted">
                    Credit util at 28%
                  </div>
                </div>
                <div className="rounded border-l-2 border-positive bg-positive/10 px-2 py-1.5">
                  <div className="font-display text-[9px] font-semibold text-positive">
                    Low Risk
                  </div>
                  <div className="text-[8px] text-on-muted">
                    Overdraft unlikely
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-on-background">

      {/* ── Nav ───────────────────────────────────────────────────── */}
      <nav className="fixed top-4 left-1/2 z-50 w-[calc(100%-3rem)] max-w-5xl -translate-x-1/2 rounded-2xl border border-white/10 bg-surface-lowest/60 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-xl">
        <div className="flex h-14 items-center justify-between px-6">
          <span className="font-display text-xl font-bold uppercase tracking-tighter text-accent-light">
            ArgusAI
          </span>
          <div className="hidden items-center gap-8 font-display font-medium tracking-tight md:flex">
            {["Platform", "Features", "Security", "Docs"].map((link) => (
              <a
                key={link}
                href="#"
                className="text-on-surface/60 transition-colors hover:text-accent-light"
              >
                {link}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-4 font-display">
            <Link
              href="/login"
              className="hidden text-sm text-on-surface/60 transition-colors hover:text-on-surface sm:block"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-accent-light px-5 py-2 text-sm font-bold text-accent-on transition-all hover:brightness-110 active:scale-95"
            >
              Get Early Access
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <AuroraBackground className="relative flex h-screen w-full flex-col items-center justify-center px-6 text-center">
        {/* Background image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hero.jpg"
            alt=""
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
          {/* Subtle dark tint — keeps image visible but text legible */}
          <div className="absolute inset-0 bg-background/45" />
          {/* Vignette: darkens edges, draws eye to center */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(16,20,21,0.7)_100%)]" />
          {/* Tall diffuse fade — image dissolves into background well before the next section */}
          <div className="absolute bottom-0 left-0 right-0 h-[55vh] bg-gradient-to-t from-background via-background/80 to-transparent" />
        </div>
        <div className="relative z-10 mb-[18vh] mt-16 max-w-4xl space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-on-surface/20 bg-surface-lowest/70 px-3 py-1 backdrop-blur-sm">
            <span className="h-2 w-2 animate-pulse rounded-full bg-accent" />
            <span className="font-display text-[10px] uppercase tracking-widest text-on-surface">
              Next-Gen Financial Intelligence
            </span>
          </div>

          <h1 className="text-shadow-hero font-display text-6xl font-bold leading-tight tracking-tight text-on-surface md:text-7xl lg:text-8xl">
            Your <span className="font-serif italic font-normal">finances,</span>{" "}
            <span className="text-accent-light">
              <br />
              one step ahead.
            </span>
          </h1>

          <p className="text-shadow-hero mx-auto max-w-2xl text-lg font-medium leading-relaxed text-on-surface/85">
            ArgusAI predicts cashflow, detects risk before it happens, and gives
            you an AI that reasons about your real money — not generic advice.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 pt-4 sm:flex-row">
            <Link
              href="/signup"
              className="rounded-lg bg-accent-light px-8 py-4 text-lg font-bold text-accent-on shadow-xl transition-all hover:brightness-110 active:scale-95"
            >
              Get Early Access
            </Link>
            <a
              href="#features"
              className="rounded-lg border border-on-surface/20 bg-surface-lowest/60 px-8 py-4 text-lg font-bold text-on-surface shadow-xl backdrop-blur-md transition-all hover:bg-surface/60"
            >
              See how it works
            </a>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 animate-bounce">
          <svg
            className="h-6 w-6 text-on-surface/30"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </AuroraBackground>

      {/* ── Dashboard Preview ──────────────────────────────────────── */}
      <section className="relative z-10 -mt-[20vh] bg-transparent px-4 pb-24">
        <div className="mx-auto max-w-5xl drop-shadow-[0_-8px_32px_rgba(0,0,0,0.6)]">
          <DashboardMockup />
          <p className="mt-6 text-center font-display text-sm text-on-muted">
            Your financial picture, always current.
          </p>
        </div>
      </section>

      {/* ── Problem Section ───────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="grid grid-cols-1 gap-12 text-center md:grid-cols-3 md:text-left">
          {problems.map(({ label, body }) => (
            <div key={label} className="space-y-4">
              <h3 className="font-display text-[11px] font-bold uppercase tracking-widest text-accent">
                {label}
              </h3>
              <p className="text-sm leading-relaxed text-on-surface/55">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Feature Grid ──────────────────────────────────────────── */}
      <section
        id="features"
        className="border-y border-border/30 bg-surface-low px-6 py-24"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="font-display text-4xl font-bold text-on-surface">
              Tactical Intelligence
            </h2>
            <p className="mt-4 text-on-surface/55">
              Precision-engineered modules for total financial oversight.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {features.map(({ title, description, previewType }) => (
              <div
                key={title}
                className="group rounded-lg border border-border bg-surface p-8 transition-colors hover:border-accent/50"
              >
                <h3 className="mb-4 font-display text-2xl font-bold text-on-surface">
                  {title}
                </h3>
                <p className="mb-6 text-sm leading-relaxed text-on-surface/55">
                  {description}
                </p>
                {previewType === "chart" && <ChartPreview />}
                {previewType === "terminal" && <TerminalPreview />}
                {previewType === "radar" && <RadarPreview />}
                {previewType === "heatmap" && <HeatmapPreview />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Feature Teaser Grid ───────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {teasers.map(({ title, description }) => (
            <div
              key={title}
              className="rounded-lg border border-border bg-surface-low p-6 transition-colors hover:border-border/80"
            >
              <h4 className="mb-2 font-display font-bold text-on-surface">
                {title}
              </h4>
              <p className="text-sm text-on-surface/55">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────────── */}
      <section className="px-6 py-32">
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-accent-container/30 to-surface p-12 text-center">
          <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-accent/10 blur-[80px]" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-accent/10 blur-[80px]" />
          <h2 className="font-display text-5xl font-bold text-on-surface">
            Stop reviewing.
            <br />
            <span className="text-accent">Start staying ahead.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-on-surface/55">
            Join the waitlist for early access. Free during beta. No credit card
            required.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <input
              type="email"
              placeholder="Enter your work email"
              className="w-full rounded-lg border border-border bg-surface-low px-4 py-4 text-on-surface outline-none placeholder:text-on-muted focus:ring-1 focus:ring-accent sm:w-80"
            />
            <Link
              href="/signup"
              className="w-full rounded-lg bg-accent-light px-8 py-4 font-bold text-accent-on transition-all hover:brightness-110 sm:w-auto"
            >
              Request Early Access
            </Link>
          </div>
          <p className="mt-6 font-display text-[10px] uppercase tracking-[0.2em] text-on-muted">
            Early access · Beta · No card required
          </p>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <footer className="border-t border-border/40 bg-surface-lowest">
        <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-8 px-6 py-12 md:flex-row md:px-12">
          <span className="font-display text-lg font-black uppercase tracking-tight text-accent-light">
            ArgusAI
          </span>
          <div className="flex flex-wrap justify-center gap-8 font-display text-[11px] uppercase tracking-widest">
            {["Features", "Pricing", "Privacy", "Terms", "Docs"].map((link) => (
              <a
                key={link}
                href="#"
                className="text-on-muted transition-colors hover:text-on-surface"
              >
                {link}
              </a>
            ))}
          </div>
          <p className="text-center font-display text-[11px] uppercase tracking-widest text-on-muted md:text-right">
            Not a financial advisor. Read-only intelligence layer.
          </p>
        </div>
      </footer>
    </div>
  );
}
