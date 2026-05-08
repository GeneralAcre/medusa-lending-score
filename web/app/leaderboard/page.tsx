import Link from "next/link";
import { LeaderboardClient } from "@/components/LeaderboardClient";
import { SiteHeader } from "@/components/SiteHeader";

export default function LeaderboardPage() {
  return (
    <main className="min-h-screen bg-[#FFFFFF] text-[#450041]">
      <SiteHeader />
      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div className="max-w-3xl">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#00B65C]">
              Public wallet ranking
            </p>
            <h1 className="mt-3 text-3xl font-black sm:text-5xl">
              Rank real scored wallets.
            </h1>
            <p className="mt-4 text-sm leading-6 text-[#450041]/70 sm:text-base sm:leading-7">
              No seeded wallets. Add real devnet addresses to score them through RPC and
              opt in to display a name.
            </p>
          </div>
          <Link
            className="rounded-md bg-[#00B65C] px-5 py-3 text-sm font-black text-[#FFFFFF] transition hover:bg-[#450041]"
            href="/badge"
          >
            Mint Score Badge
          </Link>
        </div>
        <LeaderboardClient />
      </section>
    </main>
  );
}
