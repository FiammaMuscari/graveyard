"use client";

import { Download, Link as LinkIcon } from "lucide-react";
import { toPng } from "html-to-image";
import { useRef, useState } from "react";
import type { GraveyardReport } from "@/lib/graveyard";
import { Tombstone } from "./Tombstone";

export function ShareGrave({ report }: { report: GraveyardReport }) {
  const ref = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  async function download() {
    if (!ref.current) return;
    const dataUrl = await toPng(ref.current, { cacheBust: true, pixelRatio: 2, backgroundColor: "#090716" });
    const a = document.createElement("a");
    a.download = `${report.symbol}-grave.png`;
    a.href = dataUrl;
    a.click();
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-4">
      <div ref={ref} className="rounded-[2rem] bg-[#090716] p-8 text-white">
        <p className="mb-5 text-center text-2xl font-black">Gravefy 🪦</p>
        <Tombstone report={report} large />
        <p className="mt-6 text-center text-sm text-violet-200">Not financial advice. Just spooky math.</p>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <button onClick={copyLink} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white/10 px-4 py-3 font-bold text-white hover:bg-white/15"><LinkIcon className="h-4 w-4" />{copied ? "Copied" : "Copy link"}</button>
        <button onClick={download} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-4 py-3 font-black text-slate-950 hover:bg-emerald-300"><Download className="h-4 w-4" />PNG</button>
      </div>
    </div>
  );
}
