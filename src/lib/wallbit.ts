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
const WALLBIT_API_KEY = process.env.WALLBIT_API_KEY;

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
  return { "X-API-Key": WALLBIT_API_KEY };
}

export function hasWallbitCredentials() {
  return Boolean(WALLBIT_API_KEY);
}

export async function getWallbitAsset(symbol: string) {
  const authHeaders = headers();
  if (!authHeaders) return null;

  const response = await fetchJsonWithTimeout(`${WALLBIT_BASE_URL}/api/public/v1/assets/${encodeURIComponent(symbol.toUpperCase())}`, {
    headers: authHeaders,
    next: { revalidate: 60 },
  }, 1200);

  if (!response.ok) return null;
  const payload = (await response.json()) as WallbitAssetResponse;
  return payload.data ?? null;
}

export async function searchWallbitAssets(search: string, limit = 10) {
  const authHeaders = headers();
  if (!authHeaders) return [];

  const params = new URLSearchParams({ search, limit: String(limit), page: "1" });
  const response = await fetchJsonWithTimeout(`${WALLBIT_BASE_URL}/api/public/v1/assets?${params.toString()}`, {
    headers: authHeaders,
    next: { revalidate: 60 },
  }, 900);

  if (!response.ok) return [];
  const payload = (await response.json()) as WallbitAssetsResponse;
  return payload.data ?? [];
}
