import Link from "next/link";
import Image from "next/image";
import { SiteHeader } from "@/components/SiteHeader";

const badgeLevels = [
  {
    name: "Medusa Badge LV1",
    band: "High Risk",
    points: "8-51 points",
    image: "/nft-badge/medusa-badge-lv1.png",
    description: "Entry badge for wallets with little activity or uneven transaction history.",
    howToEarn: "Start building history with successful transactions and keep a small active SOL balance.",
  },
  {
    name: "Medusa Badge LV2",
    band: "Emerging",
    points: "52-67 points",
    image: "/nft-badge/medusa-badge-lv2.png",
    description: "For wallets showing early trust signals across activity, age, and liquidity.",
    howToEarn: "Reach 52+ points by keeping non-zero token accounts and reducing failed transactions.",
  },
  {
    name: "Medusa Badge LV3",
    band: "Reliable",
    points: "68-81 points",
    image: "/nft-badge/medusa-badge-lv3.png",
    description: "For wallets with enough live RPC evidence to qualify for better lending terms.",
    howToEarn: "Reach 68+ points with consistent successful activity, more active days, and stronger liquidity.",
  },
  {
    name: "Medusa Badge LV4",
    band: "Prime",
    points: "82-98 points",
    image: "/nft-badge/medusa-badge-lv4.png",
    description: "Top badge for wallets with the strongest score profile and low risk flags.",
    howToEarn: "Reach 82+ points by combining high success rate, mature wallet history, and broad protocol activity.",
  },
];

export default function BadgePage() {
  return (
    <main className="min-h-screen bg-[#FFFFFF] text-[#450041]">
      <SiteHeader />
      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-6 lg:px-8">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#00B65C]">
            Profile / Badge
          </p>
          <h1 className="mt-3 max-w-4xl text-3xl font-black sm:text-5xl">
            Wallet profile, points, and badge level.
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-[#450041]/70 sm:text-base sm:leading-7">
            Paste a wallet address to see the current Solana Trust points, the Medusa badge
            earned by that score, and how close the wallet is to the next level.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              className="rounded-md border border-[#450041]/30 px-5 py-3 text-sm font-bold text-[#450041] transition hover:border-[#00B65C] hover:text-[#00B65C]"
              href="/calculator"
            >
              Open Score Simulator
            </Link>
          </div>
        </div>

      </section>

      <section className="mx-auto max-w-7xl px-5 pb-14 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#00B65C]">
              Badge Types
            </p>
            <h2 className="mt-2 text-2xl font-black sm:text-3xl">Point-based NFT badges</h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-[#450041]/65">
            Higher levels require stronger on-chain evidence. Improve your points by building
            clean activity over time instead of relying on one transaction.
          </p>
        </div>

        {/* ALIGNED CARDS GRID */}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 items-stretch">
          {badgeLevels.map((badge) => (
            <article
              className="flex flex-col h-full rounded-lg border border-[#450041]/16 bg-[#FFFFFF] p-4 shadow-[0_14px_44px_rgba(69,0,65,0.08)]"
              key={badge.name}
            >
              <div className="grid aspect-square place-items-center overflow-hidden rounded-lg border border-[#450041]/12 bg-[#450041]/5">
                <Image
                  alt={`${badge.name} NFT artwork`}
                  className="h-full w-full object-cover"
                  height={512}
                  src={badge.image}
                  width={512}
                />
              </div>

              <div className="mt-4 flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-black">{badge.name}</h3>
                  <p className="mt-1 text-xs font-black uppercase tracking-[0.14em] text-[#00B65C]">
                    {badge.band}
                  </p>
                </div>
                <p className="shrink-0 rounded-md bg-[#00B65C]/10 px-3 py-2 text-xs font-black text-[#00B65C]">
                  {badge.points}
                </p>
              </div>

              <p className="mt-4 text-sm leading-6 text-[#450041]/70">
                {badge.description}
              </p>

              {/* Pushes "How to get it" to the bottom regardless of description length */}
              <div className="mt-auto pt-4">
                <div className="rounded-lg border border-[#450041]/12 bg-[#450041]/5 p-3">
                  <p className="text-xs font-black uppercase tracking-[0.12em] text-[#450041]/55">
                    How to get it
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[#450041]/75">
                    {badge.howToEarn}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
