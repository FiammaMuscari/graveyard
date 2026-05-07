import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BadgeCheck, Ghost, TrendingUp } from "lucide-react";
import { SearchBox } from "@/components/SearchBox";
import { ShareGrave } from "@/components/ShareGrave";
import { Tombstone } from "@/components/Tombstone";
import { getLiveReport, getMockReport, getTopBuried } from "@/lib/graveyard";
import { formatMoney, formatPercent } from "@/lib/utils";

type PageProps = { params: Promise<{ symbol: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps) {
  const { symbol } = await params;
  const report = getMockReport(symbol);
  if (!report) return { title: `${symbol.toUpperCase()} — Ticker Graveyard` };
  return {
    title: `${report.symbol} is ${formatPercent(report.drawdown)} from ATH — Ticker Graveyard`,
    description: `${report.symbol} needs +${report.recoveryNeeded.toFixed(1)}% to recover. ${report.epitaph}`
  };
}

export default async function TickerPage({ params }: PageProps) {
  const { symbol } = await params;
  const report = await getLiveReport(symbol);
  if (!report) notFound();

  const similar = getTopBuried().filter((item) => item.symbol !== report.symbol).slice(0, 3);

  return (
    <main className="grave-bg min-h-screen">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <Link href="/" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-bold text-violet-100 hover:bg-white/15"><ArrowLeft className="h-4 w-4" /> Cemetery</Link>
        <SearchBox compact />
      </nav>

      <section className="mx-auto grid max-w-7xl gap-8 px-6 pb-20 pt-8 lg:grid-cols-[.95fr_1.05fr]">
        <div>
          <Tombstone report={report} large />
        </div>

        <div className="space-y-5">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.07] p-6 backdrop-blur">
            <div className="mb-5 flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-emerald-400 px-3 py-1 text-xs font-black text-slate-950">{report.availableOnWallbit ? "Available on Wallbit" : "Not found"}</span>
              <span className="rounded-full bg-violet-400/15 px-3 py-1 text-xs font-bold text-violet-100">{report.type}</span>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-violet-100">{report.sector}</span>
            </div>
            <h1 className="text-5xl font-black">{report.symbol}</h1>
            <p className="mt-2 text-xl text-violet-100/75">{report.name}</p>

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <Metric label="Current price" value={formatMoney(report.currentPrice)} />
              <Metric label={`All-time high · ${report.athDate}`} value={formatMoney(report.ath)} />
              <Metric label="Down from ATH" value={formatPercent(report.drawdown)} danger />
              <Metric label="Needs to recover" value={`+${report.recoveryNeeded.toFixed(1)}%`} danger />
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.07] p-6 backdrop-blur">
              <Ghost className="mb-4 h-8 w-8 text-violet-200" />
              <p className="text-sm font-black uppercase tracking-[0.3em] text-violet-200/70">Status</p>
              <h2 className="mt-2 text-3xl font-black">{report.statusEmoji} {report.status}</h2>
              <p className="mt-3 text-violet-100/70">Pain level: {report.painLevel}/100. The deeper the drawdown, the harder the comeback math gets.</p>
            </div>
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.07] p-6 backdrop-blur">
              <TrendingUp className="mb-4 h-8 w-8 text-emerald-300" />
              <p className="text-sm font-black uppercase tracking-[0.3em] text-violet-200/70">Spooky math</p>
              <h2 className="mt-2 text-3xl font-black">-{report.painLevel}% ≠ +{report.painLevel}%</h2>
              <p className="mt-3 text-violet-100/70">A stock down {Math.abs(report.drawdown).toFixed(1)}% needs +{report.recoveryNeeded.toFixed(1)}% to return to its ATH.</p>
            </div>
          </div>

          <ShareGrave report={report} />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-20">
        <h2 className="mb-5 text-2xl font-black">Other haunted tickers</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {similar.map((item) => (
            <Link key={item.symbol} href={`/ticker/${item.symbol}`} className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 hover:bg-white/[0.1]">
              <div className="flex items-center justify-between"><span className="text-2xl font-black">{item.symbol}</span><span className="text-red-300">{formatPercent(item.drawdown)}</span></div>
              <p className="mt-2 text-sm text-violet-100/70"><BadgeCheck className="mr-1 inline h-4 w-4 text-emerald-300" /> {item.status}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}

function Metric({ label, value, danger = false }: { label: string; value: string; danger?: boolean }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/25 p-5">
      <p className="text-sm font-bold text-violet-200/65">{label}</p>
      <p className={`mt-2 text-2xl font-black ${danger ? "text-red-300" : "text-white"}`}>{value}</p>
    </div>
  );
}
