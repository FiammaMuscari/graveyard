"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";

type SearchResult = { symbol: string; name: string; type?: string; sector?: string };

const LOCAL_PREVIEW: SearchResult[] = [
  { symbol: "AAPL", name: "Apple" },
  { symbol: "TSLA", name: "Tesla" },
  { symbol: "NVDA", name: "NVIDIA" },
  { symbol: "META", name: "Meta Platforms" },
  { symbol: "SPY", name: "SPDR S&P 500 ETF" },
  { symbol: "QQQ", name: "Invesco QQQ ETF" },
  { symbol: "VOO", name: "Vanguard S&P 500 ETF" },
  { symbol: "BBBY", name: "Bed Bath & Beyond" },
  { symbol: "SPCE", name: "Virgin Galactic" },
  { symbol: "NIO", name: "NIO Inc." },
  { symbol: "PLTR", name: "Palantir Technologies" },
  { symbol: "RIVN", name: "Rivian Automotive" },
  { symbol: "HOOD", name: "Robinhood Markets" },
];

function normalizeTicker(value: string) {
  return value.trim().replace(/[^a-zA-Z.]/g, "").toUpperCase().slice(0, 12);
}

function uniqResults(items: SearchResult[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.symbol)) return false;
    seen.add(item.symbol);
    return true;
  });
}

export function GraveyardSearch({ mode = "navigate" }: { mode?: "navigate" | "scene" }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [remoteResults, setRemoteResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState(false);
  const cache = useRef(new Map<string, SearchResult[]>());

  const clean = useMemo(() => normalizeTicker(query), [query]);

  const localResults = useMemo(() => {
    if (!clean) return [];
    return LOCAL_PREVIEW.filter((item) =>
      item.symbol.includes(clean) || item.name.toUpperCase().includes(clean)
    ).slice(0, 5);
  }, [clean]);

  const effectiveLoading = clean.length >= 2 && loading;
  const results = useMemo(() => {
    const effectiveRemoteResults = clean.length >= 2 ? remoteResults : [];
    return uniqResults([...localResults, ...effectiveRemoteResults]).slice(0, 6);
  }, [clean.length, localResults, remoteResults]);
  const hasExactMatch = useMemo(() => results.some((item) => item.symbol === clean), [results, clean]);
  const showDropdown = touched && clean.length > 0;

  useEffect(() => {
    if (clean.length < 2) return;

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      const cached = cache.current.get(clean);
      if (cached) {
        setRemoteResults(cached);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(`/api/assets?search=${encodeURIComponent(clean)}`, { signal: controller.signal });
        if (!response.ok) return;
        const payload = (await response.json()) as { data?: SearchResult[] };
        const data = (payload.data ?? []).slice(0, 6);
        cache.current.set(clean, data);
        setRemoteResults(data);
      } catch {
        if (!controller.signal.aborted) setRemoteResults([]);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 120);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [clean]);

  const openTicker = useCallback((value: string) => {
    const ticker = normalizeTicker(value);
    if (!ticker) return;

    if (mode === "scene") {
      window.dispatchEvent(new CustomEvent("graveyard:ticker", { detail: ticker }));
      setQuery(ticker);
      setTouched(false);
      setRemoteResults([]);
      return;
    }

    router.push(`/ticker/${ticker}`);
  }, [mode, router]);

  const onSubmit = useCallback((event: FormEvent) => {
    event.preventDefault();
    const exact = results.find((item) => item.symbol === clean);
    const first = results[0];
    if (exact) openTicker(exact.symbol);
    else if (first) openTicker(first.symbol);
    else setTouched(true);
  }, [clean, openTicker, results]);

  return (
    <form onSubmit={onSubmit} className="search-shell relative flex h-10 min-w-0 items-center rounded-2xl border border-white/25 bg-white/10 px-3 shadow-2xl shadow-black/30 backdrop-blur-md sm:h-14 sm:w-72 sm:px-5">
      <input
        aria-label="Search a ticker"
        value={query}
        onBlur={() => window.setTimeout(() => setTouched(false), 140)}
        onChange={(event) => {
          setQuery(event.target.value);
          setTouched(true);
        }}
        onFocus={() => setTouched(true)}
        placeholder="Search a ticker"
        spellCheck={false}
        autoComplete="off"
        className="w-28 bg-transparent text-sm font-black uppercase text-white outline-none placeholder:normal-case placeholder:text-white/75 sm:w-full sm:text-base"
      />
      <button type="submit" aria-label="Search" disabled={!clean || (!effectiveLoading && results.length === 0)} className="grid place-items-center disabled:opacity-40">
        <svg className="h-4 w-4 shrink-0 text-white sm:h-5 sm:w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="m21 21-4.2-4.2m1.2-5.3a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>

      {showDropdown && (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-2xl border border-white/15 bg-[#14112c]/95 p-1 shadow-2xl shadow-black/50 backdrop-blur-md">
          {results.map((item) => (
            <button
              type="button"
              key={item.symbol}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => openTicker(item.symbol)}
              className="block w-full rounded-xl px-3 py-2 text-left hover:bg-white/10"
            >
              <span className="block text-sm font-black text-white">{item.symbol}</span>
              <span className="block truncate text-xs font-semibold text-violet-100/70">{item.name}</span>
            </button>
          ))}
          {effectiveLoading && <p className="px-3 py-2 text-xs font-bold text-violet-100/60">Searching Wallbit…</p>}
          {!effectiveLoading && results.length === 0 && (
            <p className="px-3 py-3 text-xs font-bold text-red-100/75">No valid ticker found. Choose a listed result.</p>
          )}
          {!hasExactMatch && results.length > 0 && (
            <p className="px-3 pb-2 pt-1 text-[11px] font-bold text-violet-100/50">Press enter to open the first match.</p>
          )}
        </div>
      )}
    </form>
  );
}
