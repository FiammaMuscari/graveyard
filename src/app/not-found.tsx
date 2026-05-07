import Image from "next/image";
import Link from "next/link";
import { GraveyardSearch } from "@/components/GraveyardSearch";

export default function NotFound() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#070918] text-white">
      <section className="cemetery-scene relative grid min-h-screen place-items-center px-4 py-10 text-center">
        <div className="moon-glow absolute left-[12%] top-[16%] h-[19%] w-[20%] rounded-full" />
        <div className="scene-vignette absolute inset-0" />
        <div className="relative z-10 mx-auto w-full max-w-3xl rounded-[2rem] border border-white/12 bg-[#100d24]/78 p-6 shadow-2xl shadow-black/50 backdrop-blur-md sm:p-10">
          <div className="mx-auto mb-3 grid h-48 w-48 place-items-center sm:h-64 sm:w-64">
            <Image
              src="/graveyard-assets/not-found/ticker-ghost.webp"
              alt="Friendly ticker ghost"
              width={260}
              height={260}
              priority
              className="h-full w-full object-contain drop-shadow-[0_20px_28px_rgba(0,0,0,.45)]"
            />
          </div>
          <p className="text-xs font-black uppercase tracking-[.35em] text-violet-300/70">Ticker ghost not found</p>
          <h1 className="display-title mt-3 text-4xl font-black leading-tight sm:text-6xl">This grave is empty</h1>
          <p className="mx-auto mt-4 max-w-xl text-sm font-semibold text-violet-100/70 sm:text-base">
            We couldn&apos;t find that symbol in Wallbit or the fallback cemetery. Try a valid ticker like AAPL, TSLA, NVDA, META, VOO, QQQ or ARKK.
          </p>
          <div className="mx-auto mt-7 flex justify-center">
            <GraveyardSearch />
          </div>
          <Link href="/" className="mt-6 inline-flex rounded-full border border-white/10 bg-white/[0.06] px-5 py-2 text-sm font-black text-violet-100 transition hover:bg-white/[0.1]">
            Back to cemetery
          </Link>
        </div>
      </section>
    </main>
  );
}
