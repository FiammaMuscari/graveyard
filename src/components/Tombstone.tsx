import Link from "next/link";
import type { GraveyardReport } from "@/lib/graveyard";
import { formatMoney, formatPercent } from "@/lib/utils";

export function Tombstone({ report, large = false }: { report: GraveyardReport; large?: boolean }) {
  return (
    <div className={large ? "mx-auto w-full max-w-xl" : "w-full"}>
      <div className="relative overflow-hidden rounded-t-[999px] rounded-b-[2.2rem] border border-stone-300/30 bg-gradient-to-br from-stone-300 via-stone-400 to-stone-600 p-5 text-slate-950 shadow-2xl shadow-black/40">
        <div className="absolute inset-x-8 top-8 h-20 rounded-full bg-white/20 blur-2xl" />
        <div className="relative rounded-t-[999px] rounded-b-[1.6rem] border-[10px] border-stone-700/35 px-5 pb-8 pt-20 text-center">
          <p className="font-black tracking-[0.55em] text-slate-800/80">RIP</p>
          <h2 className={`${large ? "text-7xl" : "text-5xl"} mt-5 font-black tracking-tight`}>{report.symbol}</h2>
          <p className="mt-2 text-sm font-bold uppercase tracking-widest text-slate-800/70">{report.yearRange}</p>
          <div className="mx-auto my-7 h-1 w-36 rounded-full bg-slate-800/30" />
          <p className="font-mono text-4xl font-black text-red-500 drop-shadow">{formatPercent(report.drawdown)}</p>
          <p className="mt-1 text-sm font-black uppercase tracking-widest text-slate-800/70">from all-time high</p>
          <div className="mt-7 grid gap-3 rounded-3xl bg-slate-950/10 p-4 text-left text-sm font-bold">
            <div className="flex justify-between gap-4"><span>Current</span><span>{formatMoney(report.currentPrice)}</span></div>
            <div className="flex justify-between gap-4"><span>ATH</span><span>{formatMoney(report.ath)}</span></div>
            <div className="flex justify-between gap-4"><span>Needs</span><span className="text-red-700">+{report.recoveryNeeded.toFixed(1)}%</span></div>
          </div>
          <p className="mt-7 text-lg font-black">“{report.epitaph}”</p>
        </div>
      </div>
      <div className="mx-auto h-8 w-[88%] rounded-b-[999px] bg-slate-950/70 blur-sm" />
      {!large && <Link href={`/ticker/${report.symbol}`} className="mt-3 block text-center text-sm font-bold text-violet-200 hover:text-white">Open grave →</Link>}
    </div>
  );
}
