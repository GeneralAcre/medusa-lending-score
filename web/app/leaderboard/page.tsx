import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";

const leaderboard = [
  {
    rank: 1,
    wallet: "8Lr...xQ9",
    displayName: "prime.sol",
    score: 94,
    band: "Prime",
    trend: "+6",
    signals: "214 txs / 486 days / 18 protocols",
  },
  {
    rank: 2,
    wallet: "3Mc...7eP",
    displayName: "Anonymous",
    score: 91,
    band: "Prime",
    trend: "+3",
    signals: "182 txs / 391 days / 14 protocols",
  },
  {
    rank: 3,
    wallet: "Fv2...aL4",
    displayName: "vault.sns",
    score: 88,
    band: "Prime",
    trend: "+9",
    signals: "156 txs / 308 days / 11 protocols",
  },
  {
    rank: 4,
    wallet: "9zA...mK2",
    displayName: "Anonymous",
    score: 84,
    band: "Prime",
    trend: "+2",
    signals: "121 txs / 279 days / 9 protocols",
  },
  {
    rank: 5,
    wallet: "BPk...n6R",
    displayName: "lender.sns",
    score: 81,
    band: "Reliable",
    trend: "+11",
    signals: "98 txs / 242 days / 7 protocols",
  },
];

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
              Top scoring Solana borrowers.
            </h1>
            <p className="mt-4 text-sm leading-6 text-[#450041]/70 sm:text-base sm:leading-7">
              Anonymous by default, with opt-in display names for wallets that want to
              compete publicly and build reputation.
            </p>
          </div>
          <Link
            className="rounded-md bg-[#00B65C] px-5 py-3 text-sm font-black text-[#FFFFFF] transition hover:bg-[#450041]"
            href="/badge"
          >
            Mint Score Badge
          </Link>
        </div>

        <section className="mt-8 overflow-hidden rounded-xl border border-[#450041]/18 bg-[#FFFFFF] shadow-[0_20px_70px_rgba(69,0,65,0.10)]">
          <div className="grid grid-cols-[70px_minmax(0,1fr)_100px] gap-3 border-b border-[#450041]/12 bg-[#450041]/5 px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-[#450041]/55 sm:grid-cols-[90px_minmax(0,1fr)_130px_120px]">
            <span>Rank</span>
            <span>Wallet</span>
            <span>Score</span>
            <span className="hidden sm:block">Trend</span>
          </div>
          {leaderboard.map((entry) => (
            <article
              className="grid grid-cols-[70px_minmax(0,1fr)_100px] gap-3 border-b border-[#450041]/10 px-4 py-5 last:border-b-0 sm:grid-cols-[90px_minmax(0,1fr)_130px_120px] sm:items-center"
              key={entry.wallet}
            >
              <p className="text-2xl font-black text-[#00B65C]">#{entry.rank}</p>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="break-words text-lg font-black">{entry.displayName}</h2>
                  <span className="rounded-full border border-[#450041]/15 px-2 py-1 text-xs text-[#450041]/55">
                    {entry.wallet}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-[#450041]/65">{entry.signals}</p>
              </div>
              <div>
                <p className="text-3xl font-black">{entry.score}</p>
                <p className="text-xs font-bold uppercase text-[#00B65C]">{entry.band}</p>
              </div>
              <p className="hidden text-lg font-black text-[#00B65C] sm:block">{entry.trend}</p>
            </article>
          ))}
        </section>
      </section>
    </main>
  );
}
