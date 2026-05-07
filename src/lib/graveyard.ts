import { getStooqAth } from "@/lib/historical";
import { getWallbitAsset, searchWallbitAssets, type WallbitAsset } from "@/lib/wallbit";

export type GraveyardTicker = {
  symbol: string;
  name: string;
  type: "Stock" | "ETF";
  sector: string;
  currentPrice: number;
  ath: number;
  athDate: string;
  yearRange: string;
  availableOnWallbit: boolean;
  source?: "mock" | "wallbit";
};

export type GraveyardReport = GraveyardTicker & {
  athChange: number;
  drawdown: number;
  recoveryNeeded: number;
  isAboveAth: boolean;
  isAtAth: boolean;
  status: string;
  statusEmoji: string;
  epitaph: string;
  painLevel: number;
  dirtDepth: number;
};

export const tickers: GraveyardTicker[] = [
  { symbol: "SPCE", name: "Virgin Galactic", type: "Stock", sector: "Space", currentPrice: 7.82, ath: 100, athDate: "2019", yearRange: "2019–2021", availableOnWallbit: true },
  { symbol: "BBBY", name: "Bed Bath & Beyond", type: "Stock", sector: "Retail", currentPrice: 12.58, ath: 100, athDate: "2021", yearRange: "2021–2022", availableOnWallbit: true },
  { symbol: "NIO", name: "NIO Inc.", type: "Stock", sector: "EV", currentPrice: 21.89, ath: 100, athDate: "2021", yearRange: "2021–2024", availableOnWallbit: true },
  { symbol: "RIVN", name: "Rivian Automotive", type: "Stock", sector: "EV", currentPrice: 25.91, ath: 100, athDate: "2021", yearRange: "2021–2023", availableOnWallbit: true },
  { symbol: "FB", name: "Meta Platforms", type: "Stock", sector: "Social/AI", currentPrice: 26.79, ath: 100, athDate: "2021", yearRange: "2021–2022", availableOnWallbit: true },
  { symbol: "PLTR", name: "Palantir Technologies", type: "Stock", sector: "Software", currentPrice: 43.73, ath: 100, athDate: "2021", yearRange: "2021–2022", availableOnWallbit: true },
  { symbol: "HOOD", name: "Robinhood Markets", type: "Stock", sector: "Fintech", currentPrice: 51.09, ath: 100, athDate: "2021", yearRange: "2021–2022", availableOnWallbit: true },
  { symbol: "PYPL", name: "PayPal Holdings", type: "Stock", sector: "Fintech", currentPrice: 67.2, ath: 310.16, athDate: "Jul 2021", yearRange: "2021–2026", availableOnWallbit: true },
  { symbol: "SNAP", name: "Snap Inc.", type: "Stock", sector: "Social", currentPrice: 8.74, ath: 83.34, athDate: "Sep 2021", yearRange: "2021–2026", availableOnWallbit: true },
  { symbol: "TSLA", name: "Tesla", type: "Stock", sector: "EV", currentPrice: 279.98, ath: 414.5, athDate: "Nov 2021", yearRange: "2021–2026", availableOnWallbit: true },
  { symbol: "META", name: "Meta Platforms", type: "Stock", sector: "Social/AI", currentPrice: 591.24, ath: 740.91, athDate: "Feb 2026", yearRange: "2026", availableOnWallbit: true },
  { symbol: "NVDA", name: "NVIDIA", type: "Stock", sector: "AI Chips", currentPrice: 178.4, ath: 195.62, athDate: "Jan 2026", yearRange: "2026", availableOnWallbit: true },
  { symbol: "AAPL", name: "Apple", type: "Stock", sector: "Consumer Tech", currentPrice: 205.1, ath: 260.1, athDate: "Dec 2024", yearRange: "2024–2026", availableOnWallbit: true },
  { symbol: "VOO", name: "Vanguard S&P 500 ETF", type: "ETF", sector: "Broad Market", currentPrice: 545.2, ath: 563.92, athDate: "Feb 2026", yearRange: "2026", availableOnWallbit: true },
  { symbol: "QQQ", name: "Invesco QQQ ETF", type: "ETF", sector: "Nasdaq 100", currentPrice: 487.5, ath: 540.81, athDate: "Dec 2025", yearRange: "2025–2026", availableOnWallbit: true },
  { symbol: "SPY", name: "SPDR S&P 500 ETF", type: "ETF", sector: "Broad Market", currentPrice: 510.0, ath: 532.0, athDate: "2026", yearRange: "2026", availableOnWallbit: true },
  { symbol: "ARKK", name: "ARK Innovation ETF", type: "ETF", sector: "Innovation", currentPrice: 35.4, ath: 156.58, athDate: "Feb 2021", yearRange: "2021–2026", availableOnWallbit: true },
  { symbol: "BABA", name: "Alibaba", type: "Stock", sector: "E-commerce", currentPrice: 82.9, ath: 317.14, athDate: "Oct 2020", yearRange: "2020–2026", availableOnWallbit: true },
  { symbol: "INTC", name: "Intel", type: "Stock", sector: "Semiconductors", currentPrice: 30.6, ath: 74.88, athDate: "Aug 2000", yearRange: "2000–2026", availableOnWallbit: true },
  { symbol: "COIN", name: "Coinbase", type: "Stock", sector: "Crypto", currentPrice: 210, ath: 429.54, athDate: "Apr 2021", yearRange: "2021–2026", availableOnWallbit: true }
];

const epitaphs = [
  "Here lies everyone who bought the top.",
  "Gone from growth story to ghost story.",
  "It was only a dip until it bought a coffin.",
  "Still haunting portfolios after midnight.",
  "Rest in price.",
  "The chart asked for privacy.",
  "No refunds. Only lessons.",
  "Beloved by analysts. Betrayed by gravity."
];

export function calculateReport(ticker: GraveyardTicker): GraveyardReport {
  const currentPrice = Number.isFinite(ticker.currentPrice) && ticker.currentPrice > 0 ? ticker.currentPrice : 0;
  const ath = Number.isFinite(ticker.ath) && ticker.ath > 0 ? ticker.ath : currentPrice;
  const athChange = currentPrice > 0 && ath > 0 ? ((currentPrice - ath) / ath) * 100 : 0;
  const isAtAth = Math.abs(athChange) < 0.05;
  const isAboveAth = athChange > 0.05;
  const drawdown = athChange < -0.05 ? athChange : 0;
  const recoveryNeeded = drawdown < 0 && currentPrice > 0
    ? Math.max(0, (ath / currentPrice - 1) * 100)
    : 0;
  const abs = Math.abs(drawdown);

  let status = "Alive and complaining";
  let statusEmoji = "🌱";
  if (isAboveAth) [status, statusEmoji] = ["Breaking the curse", "✨"];
  else if (isAtAth) [status, statusEmoji] = ["At the old gates", "🌕"];
  else if (abs >= 90) [status, statusEmoji] = ["Financial fossil", "🦴"];
  else if (abs >= 70) [status, statusEmoji] = ["Skeleton portfolio", "💀"];
  else if (abs >= 50) [status, statusEmoji] = ["Graveyard resident", "🪦"];
  else if (abs >= 30) [status, statusEmoji] = ["Half underground", "🧟"];
  else if (abs >= 15) [status, statusEmoji] = ["Lightly buried", "⚰️"];

  const idx = Math.abs([...ticker.symbol].reduce((a, c) => a + c.charCodeAt(0), 0)) % epitaphs.length;

  return {
    ...ticker,
    currentPrice,
    ath,
    athChange,
    drawdown,
    recoveryNeeded,
    isAboveAth,
    isAtAth,
    status,
    statusEmoji,
    epitaph: epitaphs[idx],
    painLevel: Math.min(100, Math.round(abs)),
    dirtDepth: Math.min(96, Math.max(8, Math.round(abs)))
  };
}

export function getMockReport(symbol: string) {
  const item = tickers.find((t) => t.symbol.toLowerCase() === symbol.toLowerCase());
  return item ? calculateReport(item) : null;
}

export const getReport = getMockReport;

function wallbitAssetToTicker(asset: WallbitAsset, fallback?: GraveyardReport, historicalAth?: { ath: number; athDate: string }): GraveyardTicker {
  const livePrice = Number(asset.price);
  const currentPrice = Number.isFinite(livePrice) && livePrice > 0 ? livePrice : fallback?.currentPrice || 0;
  const historicalAthValue = historicalAth?.ath;
  const fallbackAthValue = fallback?.ath;
  const ath =
    Number.isFinite(historicalAthValue) && historicalAthValue && historicalAthValue > 0
      ? historicalAthValue
      : Number.isFinite(fallbackAthValue) && fallbackAthValue && fallbackAthValue > 0
        ? fallbackAthValue
        : currentPrice;
  return {
    symbol: asset.symbol,
    name: asset.name,
    type: asset.asset_type === "ETF" ? "ETF" : "Stock",
    sector: asset.sector || fallback?.sector || asset.exchange || "Wallbit asset",
    currentPrice,
    ath,
    athDate: historicalAth?.athDate || fallback?.athDate || "Live baseline",
    yearRange: fallback?.yearRange || new Date().getFullYear().toString(),
    availableOnWallbit: true,
    source: "wallbit",
  };
}

export async function getLiveReport(symbol: string) {
  const fallback = getMockReport(symbol);
  const [asset, historicalAth] = await Promise.all([getWallbitAsset(symbol), getStooqAth(symbol)]);

  if (!asset) {
    if (!fallback) return null;
    return calculateReport({
      ...fallback,
      ath: historicalAth?.ath || fallback.ath,
      athDate: historicalAth?.athDate || fallback.athDate,
    });
  }

  return calculateReport(wallbitAssetToTicker(asset, fallback ?? undefined, historicalAth ?? undefined));
}

export async function searchLiveReports(search: string, limit = 10) {
  const normalized = search.toLowerCase();
  const localMatches = getTopBuried().filter((item) =>
    item.symbol.toLowerCase().includes(normalized) || item.name.toLowerCase().includes(normalized)
  );

  const assets = await searchWallbitAssets(search, limit);
  const liveMatches = assets.map((asset) => {
    const fallback = getMockReport(asset.symbol);
    return calculateReport(wallbitAssetToTicker(asset, fallback ?? undefined));
  });

  const seen = new Set<string>();
  return [...liveMatches, ...localMatches]
    .filter((item) => {
      if (seen.has(item.symbol)) return false;
      seen.add(item.symbol);
      return true;
    })
    .slice(0, limit);
}

export function getTopBuried() {
  return tickers.map(calculateReport).sort((a, b) => a.drawdown - b.drawdown);
}
