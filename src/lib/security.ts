import { NextResponse } from "next/server";

const SYMBOL_RE = /^[A-Z][A-Z.]{0,11}$/;
const SEARCH_RE = /^[A-Z0-9.\-\s]{1,32}$/i;

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();
const MAX_BUCKETS = 5000;

export function normalizeSymbol(value: string) {
  return value.trim().replace(/[^a-zA-Z.]/g, "").toUpperCase().slice(0, 12);
}

export function isValidSymbol(value: string) {
  return SYMBOL_RE.test(value);
}

export function normalizeSearch(value: string) {
  return value.trim().replace(/[^a-zA-Z0-9.\-\s]/g, "").replace(/\s+/g, " ").slice(0, 32);
}

export function isValidSearch(value: string) {
  return SEARCH_RE.test(value);
}

export function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwardedFor || request.headers.get("x-real-ip") || "unknown";
}

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    if (buckets.size > MAX_BUCKETS) {
      for (const [bucketKey, bucket] of buckets) {
        if (bucket.resetAt <= now) buckets.delete(bucketKey);
      }
      if (buckets.size > MAX_BUCKETS) buckets.clear();
    }
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  existing.count += 1;
  return {
    allowed: existing.count <= limit,
    remaining: Math.max(0, limit - existing.count),
    resetAt: existing.resetAt,
  };
}

export function jsonError(message: string, status: number, extraHeaders?: HeadersInit) {
  return NextResponse.json(
    { error: message },
    {
      status,
      headers: {
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
        "X-Robots-Tag": "noindex, nofollow",
        ...extraHeaders,
      },
    },
  );
}

export function safeJson<T>(data: T, init?: ResponseInit) {
  const response = NextResponse.json(data, init);
  response.headers.set("Cache-Control", init?.headers instanceof Headers ? init.headers.get("Cache-Control") ?? "private, max-age=30" : "private, max-age=30");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}
