import Link from "next/link";
import { BadgeMintClient } from "@/components/BadgeMintClient";
import { SiteHeader } from "@/components/SiteHeader";

const credentialFacts = [
  ["Cluster", "Solana Devnet"],
  ["Credential type", "Score credential payload"],
  ["Source", "Live Solana RPC score"],
  ["Mint status", "Requires deployed program"],
];

export default function BadgePage() {
  return (
    <main className="min-h-screen bg-[#FFFFFF] text-[#450041]">
      <SiteHeader />
      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-10 sm:px-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(340px,1fr)] lg:px-8">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#00B65C]">
            Score Badge / Soulbound NFT
          </p>
          <h1 className="mt-3 text-3xl font-black sm:text-5xl">
            Generate a real devnet score credential.
          </h1>
          <p className="mt-4 text-sm leading-6 text-[#450041]/70 sm:text-base sm:leading-7">
            This page uses the live score API. It does not fake minting: on-chain minting
            stays disabled until a real non-transferable credential program is deployed.
          </p>

          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            {credentialFacts.map(([label, value]) => (
              <div className="rounded-lg border border-[#450041]/18 bg-[#450041]/5 p-4" key={label}>
                <p className="text-xs font-bold uppercase text-[#450041]/55">{label}</p>
                <p className="mt-2 text-lg font-black text-[#00B65C]">{value}</p>
              </div>
            ))}
          </div>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              className="rounded-md bg-[#00B65C] px-5 py-3 text-sm font-black text-[#FFFFFF] transition hover:bg-[#450041]"
              href="/dashboard"
            >
              Check Wallet Score
            </Link>
            <Link
              className="rounded-md border border-[#450041]/30 px-5 py-3 text-sm font-bold text-[#450041] transition hover:border-[#00B65C] hover:text-[#00B65C]"
              href="/roadmap"
            >
              Improve First
            </Link>
          </div>
        </div>

        <BadgeMintClient />
      </section>
    </main>
  );
}
