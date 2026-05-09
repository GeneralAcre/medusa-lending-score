import { SiteHeader } from "@/components/SiteHeader";

const inputs = [
  ["SOL balance", "Native SOL held by the wallet at scoring time."],
  ["Token accounts", "SPL token accounts, with stronger weight for non-zero balances."],
  ["Transaction sample", "Recent signatures fetched from Solana RPC and checked for success or failure."],
  ["Wallet age", "Observed days between the oldest sampled activity and the current score request."],
  ["Active days", "Unique days with activity inside the sampled transaction window."],
  ["Protocol touches", "Known DeFi or protocol interactions found in the sampled wallet activity."],
] as const;

const formulas = [
  {
    signal: "Repayment behavior",
    max: "35 pts",
    formula: "round(successRate x 35)",
    detail: "A higher successful transaction ratio increases the strongest score component.",
  },
  {
    signal: "Liquidity resilience",
    max: "30 pts",
    formula: "round(min(SOL, 10) x 1.5) + min(nonZeroTokenAccounts x 3, 15)",
    detail: "Rewards available SOL and diversified non-zero token balances, capped to prevent oversized wallets from dominating.",
  },
  {
    signal: "Wallet age",
    max: "25 pts",
    formula: "round(min(observedAgeDays, 365) / 14.6)",
    detail: "Older observed history improves confidence, with one year treated as the useful cap.",
  },
  {
    signal: "Protocol activity",
    max: "18 pts",
    formula: "round(min(sampledTransactions, 50) / 3.2) + min(activeDays, 6)",
    detail: "Rewards steady, repeated wallet use across multiple days.",
  },
  {
    signal: "Protocol bonus",
    max: "6 pts",
    formula: "round(protocolInteractions / 4)",
    detail: "Adds a small bonus for known protocol participation without overpowering core wallet behavior.",
  },
  {
    signal: "Risk flags",
    max: "12 pts penalty pool",
    formula: "round((1 - successRate) x 8) + failedTxPenalty + lowSamplePenalty",
    detail: "Failed transactions and thin history create a penalty that is partially subtracted from the score.",
  },
] as const;

const bands = [
  ["Prime", "82-98", "Strong history, stronger liquidity, and low observed risk."],
  ["Reliable", "68-81", "Enough wallet evidence for risk-adjusted DeFi credit review."],
  ["Emerging", "52-67", "Some useful activity, but history or liquidity is still developing."],
  ["High Risk", "8-51", "Thin, failed, or uneven activity. Conservative review recommended."],
] as const;

const badges = [
  ["LV4", "Prime", "82+"],
  ["LV3", "Reliable", "68+"],
  ["LV2", "Emerging", "52+"],
  ["LV1", "High Risk", "8+"],
] as const;

export default function WhitepaperPage() {
  return (
    <main className="min-h-screen bg-[#450041] text-[#FFFFFF]">
      <SiteHeader />

      <section className="mx-auto max-w-7xl px-6 py-14 sm:px-6 lg:px-8 lg:py-18">
        <div className="max-w-4xl">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-[#00B65C]">
            Medusa whitepaper
          </p>
          <h1 className="mt-5 text-4xl font-black leading-tight sm:text-6xl">
            How the wallet credit score is calculated.
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-[#FFFFFF]/75 sm:text-lg sm:leading-8">
            Medusa converts public Solana Devnet wallet behavior into a readable
            borrower reputation score. The current model is `trust-rpc-0.2` and
            produces a score from 8 to 98 points.
          </p>
        </div>
      </section>

      <section className="border-y border-[#FFFFFF]/15 bg-[#FFFFFF]/6">
        <div className="mx-auto max-w-7xl px-6 py-12 sm:px-6 lg:px-8">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-[#00B65C]">
            Data inputs
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {inputs.map(([title, copy]) => (
              <article
                className="rounded-lg border border-[#FFFFFF]/18 bg-[#FFFFFF]/10 p-6"
                key={title}
              >
                <h2 className="text-xl font-black">{title}</h2>
                <p className="mt-3 text-sm leading-6 text-[#FFFFFF]/72">{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[300px_minmax(0,1fr)]">
          <aside>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-[#00B65C]">
              Formula
            </p>
            <h2 className="mt-3 text-3xl font-black">Point breakdown.</h2>
            <p className="mt-4 text-sm leading-6 text-[#FFFFFF]/70">
              Each factor is clamped to its maximum. The final score adds positive
              factors and subtracts half of the risk penalty.
            </p>
          </aside>

          <div className="grid gap-4">
            {formulas.map((item) => (
              <article
                className="rounded-lg border border-[#FFFFFF]/18 bg-[#FFFFFF]/10 p-6"
                key={item.signal}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <h3 className="text-xl font-black">{item.signal}</h3>
                  <p className="rounded-md border border-[#00B65C]/50 px-3 py-1 text-xs font-black text-[#00B65C]">
                    {item.max}
                  </p>
                </div>
                <p className="mt-4 break-words rounded-md border border-[#FFFFFF]/14 bg-[#FFFFFF]/10 px-4 py-3 font-mono text-xs leading-6 text-[#FFFFFF]/78">
                  {item.formula}
                </p>
                <p className="mt-3 text-sm leading-6 text-[#FFFFFF]/72">{item.detail}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-[#FFFFFF]/15 bg-[#FFFFFF]/8 text-[#FFFFFF]">
        <div className="mx-auto max-w-7xl px-6 py-12 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black">Final score equation</h2>
          <p className="mt-5 break-words rounded-lg border border-[#FFFFFF]/16 bg-[#FFFFFF]/10 p-5 font-mono text-sm leading-7 text-[#FFFFFF]/82">
            score = clamp(repayment + liquidity + walletAge + activity + protocolBonus - floor(risk / 2), 8, 98)
          </p>
          <p className="mt-5 max-w-4xl text-sm leading-6 text-[#FFFFFF]/66">
            The model intentionally caps the score at 98 because this version is
            based on public RPC observations, not a complete off-chain identity,
            underwriting, or repayment registry.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-[#00B65C]">
              Score bands
            </p>
            <div className="mt-6 divide-y divide-[#FFFFFF]/12 rounded-lg border border-[#FFFFFF]/18">
              {bands.map(([name, range, copy]) => (
                <div className="grid gap-2 p-5 sm:grid-cols-[120px_90px_1fr]" key={name}>
                  <p className="font-black">{name}</p>
                  <p className="text-sm font-black text-[#00B65C]">{range}</p>
                  <p className="text-sm leading-6 text-[#FFFFFF]/72">{copy}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-[#00B65C]">
              Badge mapping
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {badges.map(([level, band, minimum]) => (
                <article
                  className="rounded-lg border border-[#FFFFFF]/18 bg-[#FFFFFF]/10 p-5"
                  key={level}
                >
                  <p className="text-3xl font-black">{level}</p>
                  <p className="mt-3 text-sm font-black text-[#00B65C]">{band}</p>
                  <p className="mt-2 text-sm text-[#FFFFFF]/70">Minimum score: {minimum}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-[#FFFFFF]/15 px-6 py-10">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-2xl font-black">Confidence and limitations</h2>
          <p className="mt-4 max-w-4xl text-sm leading-6 text-[#FFFFFF]/65">
            API confidence is calculated as `clamp(45 + sampledTransactions + activeDays x 2, 45, 92)`.
            The score can be limited by RPC availability, small transaction samples,
            test-wallet behavior, spam, failed transactions, or wallets with meaningful
            activity outside the sampled window. Medusa should be used as a transparent
            reputation signal, not as automatic loan approval.
          </p>
        </div>
      </section>
    </main>
  );
}
