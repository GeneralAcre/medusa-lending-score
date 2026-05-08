import Link from "next/link";
import Image from "next/image";
import { SiteHeader } from "@/components/SiteHeader";

const steps = [
  {
    title: "Enter an address",
    copy: "Paste a Solana wallet or connect from the dashboard.",
  },
  {
    title: "Analyze activity",
    copy: "The scoring system reads wallet balance, token accounts, age, and recent transaction signals.",
  },
  {
    title: "View credit score",
    copy: "Get a clear score, risk level, factor breakdown, and suggested lending terms.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#FFFFFF] text-[#450041]">
      <SiteHeader />

      <section className="mx-auto grid max-w-7xl items-center gap-9 px-6 py-14 sm:px-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:px-8 lg:py-24">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.2em] text-[#00B65C]">
            Wallet reputation for Solana
          </p>
          <h1 className="mt-5 max-w-4xl text-4xl font-black leading-[1.05] sm:text-6xl sm:leading-none lg:text-7xl">
            Simple credit scoring for on-chain borrowers.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-[#450041]/75 sm:text-lg sm:leading-8">
            Solana Trust turns wallet behavior into a readable borrower profile.
            Use the dashboard to search an address and review its score factors.
          </p>
          <div className="mt-7 flex flex-wrap gap-3 sm:gap-4">
            <Link
              className="rounded-md bg-[#00B65C] px-5 py-3 text-sm font-black text-[#FFFFFF] transition hover:bg-[#450041]"
              href="/dashboard"
            >
              Open Dashboard
            </Link>
            <a
              className="rounded-md border border-[#450041]/30 px-5 py-3 text-sm font-bold text-[#450041] transition hover:border-[#00B65C] hover:text-[#00B65C]"
              href="#how"
            >
              How It Works
            </a>
          </div>
        </div>

        <section className="grid place-items-center overflow-hidden rounded-xl border border-[#450041]/18 bg-[#450041]/5 p-6 shadow-[0_24px_90px_rgba(69,0,65,0.12)] sm:p-8">
          <div className="credit-gauge" aria-label="Animated credit score gauge">
            <div className="credit-gauge__ring" />
            <div className="credit-gauge__core">
              <span>78</span>
              <small>Stable</small>
            </div>
          </div>
        </section>

        <div className="flex justify-center lg:col-span-2">
          <div className="inline-flex items-center gap-3 rounded-full border border-[#450041]/18 bg-[#FFFFFF] px-4 py-2 shadow-[0_12px_38px_rgba(69,0,65,0.10)]">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#450041]/65">
              Built for Dev3pack
            </p>
            <Image
              alt="Dev3pack logo"
              className="h-auto w-10"
              height={120}
              priority
              src="/dev3pack-logo.png"
              width={120}
            />
          </div>
        </div>
      </section>

      <section id="how" className="border-y border-[#450041]/15 bg-[#450041]/5">
        <div className="mx-auto max-w-7xl px-6 py-14 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black">How It Works</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {steps.map((step, index) => (
              <article
                className="rounded-lg border border-[#450041]/18 bg-[#FFFFFF] p-6"
                key={step.title}
              >
                <p className="text-sm font-black text-[#00B65C]">0{index + 1}</p>
                <h3 className="mt-4 text-xl font-black">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#450041]/75">{step.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <footer className="px-6 py-8 text-center text-sm text-[#450041]/55">
        Solana Trust v1. Wallet scoring dashboard for DeFi credit checks.
      </footer>
    </main>
  );
}
