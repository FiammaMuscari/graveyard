export type HistoricalAth = {
  ath: number;
  athDate: string;
};

function toStooqSymbol(symbol: string) {
  const clean = symbol.trim().toLowerCase();
  if (!clean) return clean;
  if (clean.startsWith("^") || clean.includes(".")) return clean;
  return `${clean}.us`;
}

function formatDate(value: string) {
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en", { month: "short", year: "numeric", timeZone: "UTC" }).format(date);
}

async function fetchWithTimeout(url: URL, timeoutMs: number) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { signal: controller.signal, next: { revalidate: 60 * 60 * 24 * 7 } });
  } finally {
    clearTimeout(timeout);
  }
}

export async function getStooqAth(symbol: string): Promise<HistoricalAth | null> {
  const stooqSymbol = toStooqSymbol(symbol);
  const currentYear = new Date().getUTCFullYear();
  const url = new URL("https://stooq.com/q/d/l/");
  url.searchParams.set("s", stooqSymbol);
  url.searchParams.set("i", "d");
  url.searchParams.set("d1", "19800101");
  url.searchParams.set("d2", `${currentYear}1231`);

  try {
    const response = await fetchWithTimeout(url, 1200);
    if (!response.ok) return null;

    const csv = await response.text();
    const rows = csv.trim().split(/\r?\n/).slice(1);
    let ath = 0;
    let athDate = "";

    for (const row of rows) {
      const [date, , high, , close] = row.split(",");
      const highNumber = Number(high);
      const closeNumber = Number(close);
      const value = Number.isFinite(highNumber) && highNumber > 0 ? highNumber : closeNumber;
      if (Number.isFinite(value) && value > ath) {
        ath = value;
        athDate = date;
      }
    }

    if (!ath || !athDate) return null;
    return { ath, athDate: formatDate(athDate) };
  } catch {
    return null;
  }
}
