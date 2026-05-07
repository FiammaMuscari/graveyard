"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function SearchBox({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const [symbol, setSymbol] = useState("");

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const clean = symbol.trim().replace(/[^a-zA-Z.]/g, "").toUpperCase();
    if (clean) router.push(`/ticker/${clean}`);
  }

  return (
    <form onSubmit={onSubmit} className={`group flex w-full items-center rounded-2xl border border-white/10 bg-white/10 p-2 shadow-2xl shadow-black/30 backdrop-blur ${compact ? "max-w-md" : "max-w-2xl"}`}>
      <Search className="ml-3 h-5 w-5 text-violet-200" />
      <input
        value={symbol}
        onChange={(e) => setSymbol(e.target.value)}
        placeholder="Search a ticker... e.g. TSLA"
        className="h-14 flex-1 bg-transparent px-4 text-lg font-semibold uppercase text-white outline-none placeholder:normal-case placeholder:text-violet-200/60"
      />
      <button className="h-12 rounded-xl bg-emerald-400 px-5 text-sm font-black text-slate-950 transition hover:bg-emerald-300">
        Bury it
      </button>
    </form>
  );
}
