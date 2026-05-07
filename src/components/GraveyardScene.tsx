"use client";

import Image from "next/image";
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

const WALLBIT_ASSETS_API_DOCS = "https://developer.wallbit.io/docs/api-reference/assets/list";


const fireflies = [
  [4, 30, 12.8, -1.2, 28, -18], [8, 52, 14.1, -4.6, -24, 22], [11, 82, 13.4, -2.8, 34, -12],
  [16, 40, 15.2, -7.1, -30, -24], [20, 70, 12.2, -3.5, 26, 18], [24, 24, 13.8, -5.9, 38, -20],
  [29, 88, 14.7, -1.7, -28, -22], [34, 34, 12.6, -6.4, 22, 30], [40, 76, 13.2, -2.2, -36, 16],
  [47, 28, 14.3, -8.1, 32, -26], [54, 84, 12.4, -4.9, -20, 34], [61, 36, 13.9, -3.1, 30, 18],
  [68, 72, 12.9, -6.8, -34, -18], [75, 26, 15.4, -2.6, 24, -30], [82, 58, 13.1, -7.7, 40, 12],
  [90, 34, 14.6, -5.2, -30, 26], [96, 66, 12.3, -1.9, 22, -28], [6, 90, 13.7, -6.1, -38, -16],
  [14, 20, 14.9, -4.1, 34, -24], [22, 58, 12.7, -8.4, -26, 20], [32, 18, 13.5, -2.4, 28, 30],
  [44, 92, 15.1, -7.3, -34, -22], [56, 18, 12.5, -3.9, 24, -32], [70, 90, 13.6, -6.7, -28, 18],
  [84, 22, 14.4, -2.1, -22, 28], [94, 86, 13.3, -9.2, 30, -26], [18, 86, 15.8, -5.6, -36, 14],
  [38, 44, 12.1, -1.4, 22, -34], [64, 48, 14.2, -8.8, 30, 28], [88, 78, 13.0, -4.4, -32, -20],
  [3, 64, 12.6, -2.9, 38, -16], [52, 64, 14.0, -7.9, -24, -30], [97, 46, 13.4, -5.0, 32, 22],
] satisfies Array<[number, number, number, number, number, number]>;

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
  { symbol: "NIO", title: "NIO", years: "2021-2024", drop: "-78.11%", asset: "tombstone_04.webp", className: "grave-small front-grave left-[2.5%] bottom-[12%] w-[19%] max-w-[205px]" },
  { symbol: "PLTR", title: "PLTR", years: "2021-2022", drop: "-56.27%", asset: "tombstone_05.webp", className: "grave-small front-grave left-[27%] bottom-[11%] w-[18%] max-w-[190px]" },
  { symbol: "RIVN", title: "RIVN", years: "2021-2023", drop: "-74.09%", asset: "tombstone_06.webp", className: "grave-small front-grave left-[52%] bottom-[11%] w-[18%] max-w-[190px]" },
  { symbol: "HOOD", title: "HOOD", years: "2021-2022", drop: "-48.91%", asset: "tombstone_07.webp", className: "grave-small front-grave hood-grave left-[77%] bottom-[12%] w-[18%] max-w-[195px]" },
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
        <div className="moon-glow absolute left-[20%] top-[10%] h-[19%] w-[20%] rounded-full" />
        <div className="scene-vignette absolute inset-0" />
        <div className="fireflies" aria-hidden="true">
          {fireflies.map(([x, y, duration, delay, dx, dy], index) => (
            <span
              key={index}
              style={{
                "--x": `${x}%`,
                "--y": `${y}%`,
                "--dur": `${duration}s`,
                "--delay": `${delay}s`,
                "--dx": `${dx}px`,
                "--dy": `${dy}px`,
              } as React.CSSProperties}
            />
          ))}
        </div>

        <header className="relative z-[70] flex items-center justify-between gap-4 px-4 pt-5 sm:px-8 sm:pt-7">
          <Link href="/" className="block" onClick={() => setSelected(null)}>
            <span className="brand-title block text-xl font-black leading-tight drop-shadow sm:text-4xl">Gravefy</span>
            <span className="mt-1 hidden text-sm font-semibold text-white/90 drop-shadow sm:block sm:text-lg">Where hype goes to rest</span>
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
            <p className="mt-2 text-xs font-semibold text-violet-100/75 sm:mt-3 sm:text-sm">
              {selected.type} · {selected.sector} ·{" "}
              <a
                href={WALLBIT_ASSETS_API_DOCS}
                target="_blank"
                rel="noopener noreferrer"
                className="font-black text-emerald-200 underline decoration-emerald-300/70 underline-offset-4 hover:text-emerald-100"
              >
                Wallbit API
              </a>{" "}
              price + Stooq ATH.
            </p>
          </aside>
        )}

        <a href="#fallen" className={`summon-cta ${selected ? "summon-cta-selected" : ""} absolute left-1/2 z-40 flex h-12 w-[min(320px,82vw)] -translate-x-1/2 items-center justify-center rounded-2xl border border-white/10 bg-white/10 px-4 text-sm font-black shadow-2xl shadow-black/40 backdrop-blur-md transition hover:bg-white/15 sm:h-14 sm:w-[min(390px,68vw)] sm:px-6 sm:text-base ${selected ? "bottom-2 sm:bottom-6" : "bottom-4 sm:bottom-6"}`}>
          <span className="inline-flex items-center justify-center gap-2 sm:gap-2.5">
            <span className="sm:hidden">Summon More Tickers</span>
            <span className="hidden sm:inline">Summon More Fallen Tickers</span>
            <svg aria-hidden="true" className="h-5 w-5 shrink-0 translate-y-[1px]" viewBox="0 0 24 24" fill="none">
              <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </a>

        {ticker && loading && <div className="absolute inset-x-0 top-24 z-40 text-center text-sm font-black text-violet-100">Searching {ticker}...</div>}
      </section>

      <section id="fallen" className="fallen-section relative flex min-h-[100svh] scroll-mt-0 flex-col overflow-hidden px-4 py-5 sm:px-8 sm:py-8">
        <div className="fallen-orb fallen-orb-a" />
        <div className="fallen-orb fallen-orb-b" />
        <Image
          src="/graveyard-assets/optimized/tombstone_04.webp"
          alt=""
          aria-hidden="true"
          width={460}
          height={481}
          className="pointer-events-none absolute -left-3 top-28 h-24 w-20 rotate-[-8deg] object-contain opacity-[0.18] drop-shadow-[0_0_24px_rgba(139,92,246,.22)] sm:left-8 sm:top-32 sm:h-36 sm:w-32"
        />
        <Image
          src="/graveyard-assets/not-found/ticker-ghost.webp"
          alt=""
          aria-hidden="true"
          width={520}
          height={520}
          className="pointer-events-none absolute bottom-16 -right-10 h-36 w-36 rotate-12 object-contain opacity-[0.10] blur-[0.2px] drop-shadow-[0_0_34px_rgba(110,231,183,.16)] sm:right-0 sm:h-52 sm:w-52"
        />

        <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col">
          <div className="flex flex-col gap-4 pb-4 pt-2 text-center sm:pb-6">
            <p className="text-xs font-black uppercase tracking-[.35em] text-violet-300/70">More fallen items</p>
            <h2 className="display-title text-3xl font-black sm:text-5xl">Twenty haunted tickers</h2>
            <p className="mx-auto max-w-2xl text-sm font-semibold text-violet-100/62 sm:text-base">
              A lightweight watchlist preview. Tap any symbol to summon its tombstone with live{" "}
              <a
                href={WALLBIT_ASSETS_API_DOCS}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Open Wallbit Assets API documentation in a new tab"
                className="rounded-sm font-black text-emerald-200 underline decoration-emerald-300/75 decoration-2 underline-offset-4 transition hover:text-emerald-100 hover:decoration-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/70"
              >
                Wallbit API
              </a>{" "}
              price data and Stooq ATH math.
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
