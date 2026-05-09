import Link from "next/link";
import Image from "next/image";
import { GridHoverEffect } from "@/components/GridHoverEffect";
import { SiteHeader } from "@/components/SiteHeader";

const steps = [
  {
    title: "Enter an address",
    copy: "Paste a Solana wallet on the profile page.",
  },
  {
    title: "Analyze activity",
    copy: "The scoring system reads wallet balance, token accounts, age, and recent transaction signals.",
  },
  {
    title: "View credit score",
    copy: "Get points, risk level, and the badge level unlocked by that wallet profile.",
  },
];

const tools = [
  {
    title: "Leaderboard",
    copy: "Browse public top-scoring wallets with anonymous defaults and opt-in display names.",
    href: "/leaderboard",
  },
  {
    title: "Profile Badge",
    copy: "Check which Medusa badge a wallet has earned and how many points it has.",
    href: "/badge",
  },
  {
    title: "Score Simulator",
    copy: "Preview how staking, repayment, longer holding, and stronger liquidity could move the score.",
    href: "/calculator",
  },
];

const devnetProgramId = "BZvu64yv285maSxcw2CiCL77wgLsEZ3VNCYZddZw2o1T";

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
            Medusa turns wallet behavior into a readable borrower profile.
            Use the profile page to search an address, review its points, and see the badge it earns.
          </p>
          <div className="mt-7 flex flex-wrap gap-3 sm:gap-4">
            <Link
              className="rounded-md bg-[#00B65C] px-5 py-3 text-sm font-black text-[#FFFFFF] transition hover:bg-[#450041]"
              href="/dashboard"
            >
              Open Profile
            </Link>
            <a
              className="rounded-md border border-[#450041]/30 px-5 py-3 text-sm font-bold text-[#450041] transition hover:border-[#00B65C] hover:text-[#00B65C]"
              href="#how"
            >
              How It Works
            </a>
            <Link
              className="rounded-md border border-[#450041]/30 px-5 py-3 text-sm font-bold text-[#450041] transition hover:border-[#00B65C] hover:text-[#00B65C]"
              href="/whitepaper"
            >
              Whitepaper
            </Link>
          </div>
          <div className="mt-12 flex flex-wrap gap-3">
            <a
              className="inline-flex min-h-14 items-center gap-3 rounded-full border border-[#450041]/18 bg-[#FFFFFF] px-5 py-2 shadow-[0_12px_38px_rgba(69,0,65,0.10)] transition hover:border-[#00B65C] hover:text-[#00B65C]"
              href="https://dev3pack.xyz/"
              rel="noreferrer"
              target="_blank"
            >
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
            </a>
            <a
              className="inline-flex min-h-14 items-center rounded-full border border-[#450041]/18 bg-[#FFFFFF] px-5 py-2 shadow-[0_12px_38px_rgba(69,0,65,0.10)] transition hover:border-[#00B65C] hover:text-[#00B65C]"
              href={`https://explorer.solana.com/address/${devnetProgramId}?cluster=devnet`}
              rel="noreferrer"
              target="_blank"
            >
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#450041]/65">
                Devnet Deploy
              </p>
            </a>
          </div>
        </div>

        <section className="relative grid place-items-center overflow-hidden rounded-xl border border-[#450041]/18 bg-[#450041]/5 p-6 shadow-[0_24px_90px_rgba(69,0,65,0.12)] sm:p-8">
          <GridHoverEffect />
          <div className="credit-gauge" aria-label="Animated credit score gauge">
            <div className="credit-gauge__ring" />
            <div className="credit-gauge__core">
              <span>78</span>
              <small>Stable</small>
            </div>
          </div>
        </section>
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

      <section className="mx-auto max-w-7xl px-6 py-14 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-[#00B65C]">
              Profile tools
            </p>
            <h2 className="mt-3 text-3xl font-black">Check badges, then simulate.</h2>
          </div>
          <Link className="text-sm font-black text-[#00B65C]" href="/calculator">
            Open calculator
          </Link>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {tools.map((tool) => (
            <Link
              className="rounded-lg border border-[#450041]/18 bg-[#450041]/5 p-6 transition hover:border-[#00B65C] hover:bg-[#00B65C]/5"
              href={tool.href}
              key={tool.title}
            >
              <h3 className="text-xl font-black">{tool.title}</h3>
              <p className="mt-3 text-sm leading-6 text-[#450041]/75">{tool.copy}</p>
            </Link>
          ))}
        </div>
      </section>

      <footer className="px-6 py-8 text-center text-sm text-[#450041]/55">
        Medusa v1. Wallet scoring dashboard for DeFi credit checks.
      </footer>
    </main>
  );
}
