"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GraveyardSearch } from "@/components/GraveyardSearch";

type SceneReport = {
  symbol: string;
  name: string;
  type: string;
  sector: string;
  currentPrice: number;
  ath: number;
  athDate: string;
  yearRange: string;
  drawdown: number;
  recoveryNeeded: number;
  status: string;
  statusEmoji: string;
  painLevel: number;
  source?: string;
};

type SceneGrave = {
  symbol: string;
  title: string;
  years: string;
  drop: string;
  asset: string;
  className: string;
  tone?: "red" | "amber" | "green";
  report?: SceneReport;
};


const fallenItems = [
  ["SPCE", "Virgin Galactic", "-92.18%"],
  ["BBBY", "Bed Bath & Beyond", "-87.42%"],
  ["SNAP", "Snap Inc.", "-89.51%"],
  ["NIO", "NIO Inc.", "-78.11%"],
  ["RIVN", "Rivian Automotive", "-74.09%"],
  ["FB", "Meta Platforms", "-73.21%"],
  ["BABA", "Alibaba", "-73.86%"],
  ["PYPL", "PayPal Holdings", "-78.33%"],
  ["INTC", "Intel", "-59.13%"],
  ["PLTR", "Palantir Technologies", "-56.27%"],
  ["HOOD", "Robinhood Markets", "-48.91%"],
  ["TSLA", "Tesla", "-32.45%"],
  ["QQQ", "Invesco QQQ ETF", "-9.86%"],
  ["AAPL", "Apple", "-21.15%"],
  ["META", "Meta Platforms", "-20.20%"],
  ["NVDA", "NVIDIA", "-8.80%"],
  ["VOO", "Vanguard S&P 500 ETF", "-3.32%"],
  ["SPY", "SPDR S&P 500 ETF", "-4.10%"],
  ["ARKK", "ARK Innovation ETF", "-70.00%"],
  ["COIN", "Coinbase", "-45.00%"],
] satisfies Array<[string, string, string]>;

const defaultGraves: SceneGrave[] = [
  { symbol: "BBBY", title: "STONKS", years: "2021-2022", drop: "-87.42%", asset: "tombstone_01.webp", className: "grave-hero left-[7%] top-[22%] w-[26%] max-w-[270px]" },
  { symbol: "FB", title: "META", years: "2021-2022", drop: "-73.21%", asset: "tombstone_02.webp", className: "grave-hero left-[38%] top-[22%] w-[27%] max-w-[280px]" },
  { symbol: "SPCE", title: "SPCE", years: "2019-2021", drop: "-92.18%", asset: "tombstone_03.webp", className: "grave-hero left-[66%] top-[22%] w-[27%] max-w-[280px]" },
  { symbol: "NIO", title: "NIO", years: "2021-2024", drop: "-78.11%", asset: "tombstone_04.webp", className: "grave-small left-[2%] bottom-[13%] w-[22%] max-w-[190px]" },
  { symbol: "PLTR", title: "PLTR", years: "2021-2022", drop: "-56.27%", asset: "tombstone_05.webp", className: "grave-small left-[27%] bottom-[12%] w-[20%] max-w-[180px]" },
  { symbol: "RIVN", title: "RIVN", years: "2021-2023", drop: "-74.09%", asset: "tombstone_06.webp", className: "grave-small left-[52%] bottom-[12%] w-[20%] max-w-[180px]" },
  { symbol: "HOOD", title: "HOOD", years: "2021-2022", drop: "-48.91%", asset: "tombstone_07.webp", className: "grave-small left-[76%] bottom-[13%] w-[20%] max-w-[180px]" },
];

function formatPercent(value: number) {
  return `${value.toFixed(2)}%`;
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(value);
}

function toneFromDrawdown(drawdown: number): "red" | "amber" | "green" {
  const abs = Math.abs(drawdown);
  if (abs >= 50) return "red";
  if (abs >= 15) return "amber";
  return "green";
}

function titleFromReport(report: SceneReport) {
  const abs = Math.abs(report.drawdown);
  if (abs < 15) return "ALIVE";
  if (abs < 50) return "HURT";
  return report.symbol;
}

export function GraveyardScene() {
  const [selected, setSelected] = useState<SceneReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [ticker, setTicker] = useState<string | null>(null);
  const requestId = useRef(0);

  const loadTicker = useCallback((symbol: string, scrollToTop = false) => {
    if (scrollToTop) {
      document.getElementById("top")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    const id = requestId.current + 1;
    requestId.current = id;
    setTicker(symbol);
    setLoading(true);

    fetch(`/api/ticker/${encodeURIComponent(symbol)}`)
      .then((response) => (response.ok ? response.json() : null))
      .then((data: SceneReport | null) => {
        if (requestId.current === id && data) setSelected(data);
      })
      .finally(() => {
        if (requestId.current === id) setLoading(false);
      });
  }, []);

  useEffect(() => {
    function onTicker(event: Event) {
      const symbol = (event as CustomEvent<string>).detail;
      if (symbol) loadTicker(symbol);
    }

    window.addEventListener("graveyard:ticker", onTicker);
    return () => window.removeEventListener("graveyard:ticker", onTicker);
  }, [loadTicker]);

  const graves = useMemo<SceneGrave[]>(() => {
    if (!selected) return defaultGraves;
    return [{
      symbol: selected.symbol,
      title: titleFromReport(selected),
      years: selected.yearRange,
      drop: formatPercent(selected.drawdown),
      asset: "tombstone_02.webp",
      className: "grave-selected left-[34%] top-[18%] w-[24%] max-w-[315px] -translate-x-1/2",
      tone: toneFromDrawdown(selected.drawdown),
      report: selected,
    }];
  }, [selected]);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#070918] text-white">
      <section id="top" className="cemetery-scene relative h-[100svh] w-full overflow-hidden">
        <div className="moon-glow absolute left-[12%] top-[16%] h-[19%] w-[20%] rounded-full" />
        <div className="scene-vignette absolute inset-0" />

        <header className="relative z-[70] flex items-center justify-between gap-4 px-4 pt-5 sm:px-8 sm:pt-7">
          <Link href="/" className="block" onClick={() => setSelected(null)}>
            <span className="block text-xl font-black leading-tight drop-shadow sm:text-4xl">Ticker Graveyard</span>
            <span className="mt-1 hidden text-sm font-semibold text-white/90 drop-shadow sm:block sm:text-lg">A cemetery for stocks that didn&apos;t make it.</span>
          </Link>
          <GraveyardSearch mode="scene" />
        </header>

        <div className="absolute inset-0 z-20">
          {graves.map((grave) => (
            <article key={grave.symbol} className={`asset-grave ${grave.tone ? `grave-tone-${grave.tone}` : ""} absolute z-20 ${grave.className}`}>
              <img src={`/graveyard-assets/optimized/${grave.asset}`} alt="" loading={grave.symbol === "HOOD" || grave.symbol === "RIVN" || grave.symbol === "PLTR" ? "lazy" : "eager"} decoding="async" className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_18px_14px_rgba(0,0,0,0.55)]" />
              <div className="grave-copy absolute inset-x-[20%] top-[25%] text-center">
                <p className="grave-title">{grave.title}</p>
                <p className="years">{grave.years}</p>
                <p className="drop">{grave.drop}</p>
                <p className="ticker">{grave.symbol}</p>
              </div>
            </article>
          ))}
          <div className="hand absolute bottom-[15%] right-[5%] z-10 h-28 w-24 sm:h-40 sm:w-32" />
        </div>

        {selected && (
          <aside className="grave-panel absolute bottom-3 left-3 right-3 z-40 mx-auto max-w-3xl rounded-3xl border border-white/15 bg-[#100d24]/82 p-3 shadow-2xl shadow-black/50 backdrop-blur-md sm:bottom-auto sm:left-auto sm:right-8 sm:top-[22%] sm:w-[390px] sm:p-5 lg:right-12 lg:w-[430px]">
            <div className="mb-3 grid grid-cols-[1fr_auto] items-start gap-3">
              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-[.26em] text-violet-200/70">{loading ? "Summoning..." : `${selected.statusEmoji} ${selected.status}`}</p>
                <h2 className="truncate text-xl font-black leading-tight sm:text-3xl">{selected.symbol} · {selected.name}</h2>
              </div>
              <button aria-label="Clear selected ticker" onClick={() => setSelected(null)} className="rounded-full border border-white/10 bg-white/[0.07] px-3 py-2 text-xs font-black text-violet-100/80 transition hover:bg-white/[0.12] hover:text-white">Clear</button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <Metric label="Now" value={formatMoney(selected.currentPrice)} tone="price" />
              <Metric label={`ATH · ${selected.athDate}`} value={formatMoney(selected.ath)} tone="ath" />
              <Metric label="Damage" value={formatPercent(selected.drawdown)} tone={selected.drawdown < -15 ? "danger" : "good"} />
              <Metric label="Recovery" value={`+${selected.recoveryNeeded.toFixed(1)}%`} tone={selected.recoveryNeeded > 50 ? "warning" : "good"} />
            </div>
            <p className="mt-2 text-xs font-semibold text-violet-100/75 sm:mt-3 sm:text-sm">{selected.type} · {selected.sector} · Wallbit price + Stooq ATH.</p>
          </aside>
        )}

        <a href="#fallen" className={`absolute left-1/2 z-40 flex h-12 w-[min(390px,68vw)] -translate-x-1/2 items-center justify-center gap-6 rounded-2xl border border-white/10 bg-white/10 text-sm font-black shadow-2xl shadow-black/40 backdrop-blur-md transition hover:bg-white/15 sm:h-14 sm:text-base ${selected ? "bottom-2 sm:bottom-6" : "bottom-4 sm:bottom-6"}`}>
          View More Fallen Tickers <span aria-hidden="true" className="text-xl leading-none">⌄</span>
        </a>

        {ticker && loading && <div className="absolute inset-x-0 top-24 z-40 text-center text-sm font-black text-violet-100">Searching {ticker}...</div>}
      </section>

      <section id="fallen" className="fallen-section relative flex min-h-[100svh] scroll-mt-0 flex-col overflow-hidden px-4 py-5 sm:px-8 sm:py-8">
        <div className="fallen-orb fallen-orb-a" />
        <div className="fallen-orb fallen-orb-b" />
        <svg className="absolute left-4 top-8 h-24 w-24 text-violet-300/10 sm:left-10 sm:h-40 sm:w-40" viewBox="0 0 120 120" aria-hidden="true">
          <path fill="currentColor" d="M57 7c17 0 31 14 31 31v49h10v18H22V87h10V38C32 21 46 7 57 7Zm0 12c-10 0-19 9-19 19v49h38V38c0-10-9-19-19-19Z" />
        </svg>
        <svg className="absolute bottom-20 right-4 h-28 w-28 rotate-12 text-emerald-200/10 sm:right-12 sm:h-44 sm:w-44" viewBox="0 0 120 120" aria-hidden="true">
          <path fill="currentColor" d="M18 78c8-21 25-30 41-24 9-18 30-25 45-13-18 5-25 17-25 32 0 17-14 31-31 31-14 0-25-8-30-26Z" />
        </svg>

        <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col">
          <div className="flex flex-col gap-4 pb-4 pt-2 text-center sm:pb-6">
            <p className="text-xs font-black uppercase tracking-[.35em] text-violet-300/70">More fallen items</p>
            <h2 className="text-3xl font-black sm:text-5xl">Twenty haunted tickers</h2>
            <p className="mx-auto max-w-2xl text-sm font-semibold text-violet-100/62 sm:text-base">
              A lightweight watchlist preview. Tap any symbol to summon its tombstone with live Wallbit price data and Stooq ATH math.
            </p>
          </div>

          <div className="fallen-list-grid grid min-h-0 flex-1 gap-3 lg:grid-cols-2 lg:gap-5">
            {[fallenItems.slice(0, 10), fallenItems.slice(10, 20)].map((column, columnIndex) => (
              <div key={columnIndex} className="fallen-card min-h-0 rounded-[2rem] border border-white/10 bg-white/[0.045] p-2 shadow-2xl shadow-black/20 backdrop-blur-sm">
                {column.map(([symbol, name, drop], index) => (
                  <button
                    key={symbol}
                    onClick={() => loadTicker(symbol, true)}
                    className="group grid w-full grid-cols-[2.25rem_1fr_auto] items-center gap-3 rounded-3xl px-2.5 py-2 text-left transition hover:bg-white/[0.075] sm:grid-cols-[2.75rem_1fr_auto] sm:px-3 sm:py-2.5"
                  >
                    <span className="grid h-8 w-8 place-items-center rounded-2xl bg-violet-300/10 text-[11px] font-black text-violet-100/55 sm:h-9 sm:w-9">{columnIndex * 10 + index + 1}</span>
                    <span className="min-w-0">
                      <span className="block text-base font-black text-white group-hover:text-violet-100 sm:text-lg">{symbol}</span>
                      <span className="block truncate text-xs font-semibold text-violet-100/55">{name}</span>
                    </span>
                    <span className="rounded-full border border-red-200/10 bg-red-950/20 px-2.5 py-1 font-mono text-xs font-black text-red-100/90 sm:text-sm">{drop}</span>
                  </button>
                ))}
              </div>
            ))}
          </div>

          <div className="relative z-10 mt-4 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-4 text-sm font-semibold text-violet-100/55 sm:flex-row">
            <a href="#top" className="rounded-full border border-white/10 bg-white/[0.06] px-5 py-2 font-black text-violet-100 transition hover:bg-white/[0.1]">Back to top ↑</a>
            <p>© {new Date().getFullYear()} <a className="font-black text-violet-200 hover:text-white" href="https://github.com/fiammamuscari" target="_blank" rel="noreferrer">Fiamy</a></p>
          </div>
        </div>
      </section>
    </main>
  );
}

function Metric({ label, value, tone }: { label: string; value: string; tone: "price" | "ath" | "danger" | "warning" | "good" }) {
  const toneClass = {
    price: "metric-price text-sky-100",
    ath: "metric-ath text-violet-100",
    danger: "metric-danger text-red-100",
    warning: "metric-warning text-amber-100",
    good: "metric-good text-emerald-100",
  }[tone];

  return (
    <div className={`rounded-2xl border p-3 ${toneClass}`}>
      <p className="text-[11px] font-black uppercase tracking-widest opacity-65">{label}</p>
      <p className="mt-1 text-lg font-black">{value}</p>
    </div>
  );
}
