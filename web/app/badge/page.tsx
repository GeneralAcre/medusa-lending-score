import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";

const credentialFacts = [
  ["Cluster", "Solana Devnet"],
  ["Credential type", "Soulbound score badge"],
  ["Transferability", "Non-transferable"],
  ["Gate checks", "Score band, model version, issuer"],
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
            Mint a non-transferable credit credential.
          </h1>
          <p className="mt-4 text-sm leading-6 text-[#450041]/70 sm:text-base sm:leading-7">
            Users can publish their score as a devnet credential that protocols can
            gate-check without exposing the full wallet report.
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

        <section className="rounded-xl border border-[#450041]/18 bg-[#450041]/5 p-6 shadow-[0_24px_90px_rgba(69,0,65,0.12)]">
          <div className="rounded-xl border border-[#450041]/18 bg-[#FFFFFF] p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="rounded-full border border-[#00B65C]/30 px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-[#00B65C]">
                Devnet Ready
              </p>
              <p className="text-xs font-black uppercase tracking-[0.12em] text-[#450041]/45">
                v1 credential
              </p>
            </div>
            <div className="mt-10 grid place-items-center">
              <div className="grid h-48 w-48 place-items-center rounded-full bg-[#450041] text-[#FFFFFF] shadow-[0_24px_70px_rgba(69,0,65,0.25)]">
                <div className="text-center">
                  <p className="text-6xl font-black leading-none">88</p>
                  <p className="mt-2 text-sm font-black uppercase tracking-[0.18em] text-[#00B65C]">
                    Prime
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-10">
              <h2 className="text-xl font-black">Solana Trust Score Badge</h2>
              <p className="mt-3 text-sm leading-6 text-[#450041]/70">
                A wallet-bound credential for reputation checks, lending allowlists,
                fee tiers, and score-gated product access.
              </p>
            </div>
            <button
              className="mt-6 w-full rounded-md bg-[#450041] px-5 py-3 text-sm font-black text-[#FFFFFF]"
              type="button"
            >
              Mint Flow Preview
            </button>
          </div>
        </section>
      </section>
    </main>
  );
}
