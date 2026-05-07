import { getLiveReport } from "@/lib/graveyard";
import { getClientIp, isValidSymbol, jsonError, normalizeSymbol, rateLimit, safeJson } from "@/lib/security";

type RouteContext = { params: Promise<{ symbol: string }> };

export async function GET(request: Request, { params }: RouteContext) {
  const ip = getClientIp(request);
  const limited = rateLimit(`ticker:${ip}`, 60, 60_000);
  if (!limited.allowed) {
    return jsonError("Too many requests", 429, {
      "Retry-After": String(Math.ceil((limited.resetAt - Date.now()) / 1000)),
      "X-RateLimit-Remaining": "0",
    });
  }

  const { symbol: rawSymbol } = await params;
  const symbol = normalizeSymbol(rawSymbol);
  if (!symbol || !isValidSymbol(symbol)) return jsonError("Invalid ticker symbol", 400);

  try {
    const report = await getLiveReport(symbol);
    if (!report) return jsonError("Ticker not found", 404);
    return safeJson(report, { headers: { "X-RateLimit-Remaining": String(limited.remaining) } });
  } catch {
    return jsonError("Ticker unavailable", 503);
  }
}
