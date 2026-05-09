export type WallbitAsset = {
  symbol: string;
  name: string;
  price: number;
  asset_type: "Stock" | "ETF" | string;
  exchange?: string;
  sector?: string;
  market_cap_m?: string;
  description?: string;
  logo_url?: string;
};

type WallbitAssetResponse = { data?: WallbitAsset };
type WallbitAssetsResponse = { data?: WallbitAsset[]; pages?: number; current_page?: number; count?: number };

const WALLBIT_BASE_URL = process.env.WALLBIT_BASE_URL ?? "https://api.wallbit.io";
const WALLBIT_API_KEY = process.env.WALLBIT_API_KEY ?? process.env.WALLBIT_MCP_API_KEY;
const WALLBIT_REVALIDATE_SECONDS = 60;

async function fetchJsonWithTimeout(url: string, init: RequestInit, timeoutMs: number) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

function headers() {
  if (!WALLBIT_API_KEY) return null;
  return {
    Accept: "application/json",
    "X-API-Key": WALLBIT_API_KEY,
  };
}

export function hasWallbitCredentials() {
  return Boolean(WALLBIT_API_KEY);
}

export async function getWallbitAsset(symbol: string) {
  const authHeaders = headers();
  if (!authHeaders) return null;

  try {
    const response = await fetchJsonWithTimeout(`${WALLBIT_BASE_URL}/api/public/v1/assets/${encodeURIComponent(symbol.toUpperCase())}`, {
      headers: authHeaders,
      next: { revalidate: WALLBIT_REVALIDATE_SECONDS },
    }, 3000);

    if (!response.ok) return null;
    const payload = (await response.json()) as WallbitAssetResponse;
    return payload.data ?? null;
  } catch {
    return null;
  }
}

export async function searchWallbitAssets(search: string, limit = 10) {
  const authHeaders = headers();
  if (!authHeaders) return [];

  const safeLimit = Math.max(1, Math.min(limit, 50));
  const params = new URLSearchParams({ search: search.slice(0, 100), limit: String(safeLimit), page: "1" });
  try {
    const response = await fetchJsonWithTimeout(`${WALLBIT_BASE_URL}/api/public/v1/assets?${params.toString()}`, {
      headers: authHeaders,
      next: { revalidate: WALLBIT_REVALIDATE_SECONDS },
    }, 2500);

    if (!response.ok) return [];
    const payload = (await response.json()) as WallbitAssetsResponse;
    return payload.data ?? [];
  } catch {
    return [];
  }
}
