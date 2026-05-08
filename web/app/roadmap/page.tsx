import Link from "next/link";
import { RoadmapClient } from "@/components/RoadmapClient";
import { SiteHeader } from "@/components/SiteHeader";

export default function RoadmapPage() {
  return (
    <main className="min-h-screen bg-[#FFFFFF] text-[#450041]">
      <SiteHeader />
      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-6 lg:px-8">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#00B65C]">
            Credit Improvement Roadmap
          </p>
          <h1 className="mt-3 text-3xl font-black sm:text-5xl">
            Personalized actions from real wallet signals.
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-[#450041]/70 sm:text-base sm:leading-7">
            No mocked progress. Paste a devnet wallet and the checklist is derived from
            the live score report returned by Solana RPC.
          </p>
        </div>

        <RoadmapClient />

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            className="rounded-md bg-[#00B65C] px-5 py-3 text-sm font-black text-[#FFFFFF] transition hover:bg-[#450041]"
            href="/dashboard"
          >
            Refresh Wallet Score
          </Link>
          <Link
            className="rounded-md border border-[#450041]/30 px-5 py-3 text-sm font-bold text-[#450041] transition hover:border-[#00B65C] hover:text-[#00B65C]"
            href="/calculator"
          >
            Simulate Changes
          </Link>
        </div>
      </section>
    </main>
  );
}
