import { searchLiveReports } from "@/lib/graveyard";
import { getClientIp, isValidSearch, jsonError, normalizeSearch, rateLimit, safeJson } from "@/lib/security";

export async function GET(request: Request) {
  const ip = getClientIp(request);
  const limited = rateLimit(`assets:${ip}`, 30, 60_000);
  if (!limited.allowed) {
    return jsonError("Too many requests", 429, {
      "Retry-After": String(Math.ceil((limited.resetAt - Date.now()) / 1000)),
      "X-RateLimit-Remaining": "0",
    });
  }

  const { searchParams } = new URL(request.url);
  const search = normalizeSearch(searchParams.get("search") ?? "");
  if (!search) return safeJson({ data: [] });
  if (search.length < 2) return safeJson({ data: [] });
  if (!isValidSearch(search)) return jsonError("Invalid search", 400);

  try {
    const data = await searchLiveReports(search, 10);
    return safeJson(
      {
        data: data.slice(0, 10).map((item) => ({
          symbol: item.symbol,
          name: item.name,
          type: item.type,
          sector: item.sector,
        })),
      },
      { headers: { "X-RateLimit-Remaining": String(limited.remaining) } },
    );
  } catch {
    return jsonError("Search unavailable", 503);
  }
}
