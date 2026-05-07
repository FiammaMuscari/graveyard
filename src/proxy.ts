import { NextResponse, type NextRequest } from "next/server";

const BOT_UA_RE = /(ahrefs|semrush|mj12|dotbot|bytespider|petalbot|scrapy|crawler|spider|python-requests|wget|curl|httpclient|libwww-perl|nikto|sqlmap|masscan|nmap|zgrab|gptbot|ccbot)/i;
const API_PATH_RE = /^\/api\//;

function securityHeaders(response: NextResponse) {
  response.headers.set("X-DNS-Prefetch-Control", "off");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()");
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  response.headers.set("X-Robots-Tag", process.env.ALLOW_INDEXING === "true" ? "index, follow" : "noindex, nofollow");
  return response;
}

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const ua = request.headers.get("user-agent") ?? "";

  if (API_PATH_RE.test(pathname) && (!ua || BOT_UA_RE.test(ua))) {
    return securityHeaders(NextResponse.json({ error: "Forbidden" }, { status: 403 }));
  }

  if (!API_PATH_RE.test(pathname) && BOT_UA_RE.test(ua)) {
    return securityHeaders(NextResponse.rewrite(new URL("/not-found", request.url)));
  }

  return securityHeaders(NextResponse.next());
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|txt|xml)$).*)",
  ],
};
