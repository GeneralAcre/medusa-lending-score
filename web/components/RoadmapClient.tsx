"use client";

import { FormEvent, useMemo, useState } from "react";
import type { CreditReport } from "@/lib/scoring";

export function RoadmapClient() {
  const [wallet, setWallet] = useState("");
  const [report, setReport] = useState<CreditReport | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const items = useMemo(() => (report ? roadmapFromReport(report) : []), [report]);
  const completedAverage =
    items.length > 0
      ? Math.round(items.reduce((total, item) => total + item.progress, 0) / items.length)
      : 0;
  const estimatedUpside = items.reduce((total, item) => total + item.impact, 0);

  async function loadRoadmap(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedWallet = wallet.trim();

    if (!trimmedWallet) {
      setError("Paste a Solana wallet address first.");
      return;
    }

    setIsLoading(true);
    setError("");
    setReport(null);

    try {
      const params = new URLSearchParams({ wallet: trimmedWallet, cluster: "devnet" });
      const response = await fetch(`/api/score?${params.toString()}`);
      const payload = (await response.json()) as CreditReport | { error?: string };

      if (!response.ok) {
        throw new Error("error" in payload ? payload.error : "Unable to score wallet.");
      }

      setReport(payload as CreditReport);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to score wallet.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <form
        className="mt-8 grid gap-3 rounded-xl border border-[#450041]/18 bg-[#450041]/5 p-5 sm:grid-cols-[minmax(0,1fr)_160px]"
        onSubmit={loadRoadmap}
      >
        <input
          className="min-h-12 rounded-lg border border-[#450041]/20 bg-[#FFFFFF] px-4 text-sm outline-none focus:border-[#00B65C]"
          onChange={(event) => setWallet(event.target.value)}
          placeholder="Devnet wallet address"
          value={wallet}
        />
        <button
          className="rounded-md bg-[#00B65C] px-5 py-3 text-sm font-black text-[#FFFFFF] transition hover:bg-[#450041] disabled:bg-[#450041]/15 disabled:text-[#450041]/45"
          disabled={isLoading}
          type="submit"
        >
          {isLoading ? "Loading" : "Build Roadmap"}
        </button>
      </form>

      {error ? (
        <p className="mt-4 rounded-lg border border-[#00B65C] bg-[#00B65C]/10 px-4 py-3 text-sm text-[#450041]">
          {error}
        </p>
      ) : null}

      <section className="mt-8 rounded-xl border border-[#450041]/18 bg-[#450041]/5 p-5">
        <p className="text-sm font-bold text-[#450041]/65">Roadmap progress</p>
        <p className="mt-3 text-5xl font-black">{completedAverage}%</p>
        <p className="mt-2 text-sm font-bold text-[#00B65C]">
          {report ? `Estimated +${estimatedUpside} score upside` : "Load a real wallet first"}
        </p>
      </section>

      <div className="mt-8 grid gap-4">
        {items.length > 0 ? (
          items.map((item) => (
            <article
              className="rounded-xl border border-[#450041]/18 bg-[#FFFFFF] p-5 shadow-[0_16px_50px_rgba(69,0,65,0.08)]"
              key={item.title}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-xl font-black">{item.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-[#450041]/68">{item.detail}</p>
                </div>
                <p className="rounded-full border border-[#00B65C]/35 px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-[#00B65C]">
                  +{item.impact} score
                </p>
              </div>
              <div className="mt-5">
                <div className="mb-2 flex justify-between text-xs font-bold uppercase text-[#450041]/55">
                  <span>Progress</span>
                  <span>{item.progress}%</span>
                </div>
                <div className="h-3 rounded-full bg-[#450041]/12">
                  <div
                    className="h-3 rounded-full bg-[#00B65C]"
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-xl border border-[#450041]/18 bg-[#FFFFFF] p-6 text-sm leading-6 text-[#450041]/70">
            No roadmap is generated until a wallet is scored through live Solana RPC.
          </div>
        )}
      </div>
    </>
  );
}

function roadmapFromReport(report: CreditReport) {
  const liquidityFactor = report.factors.find((factor) => factor.label === "Liquidity resilience");
  const ageFactor = report.factors.find((factor) => factor.label === "Wallet age");
  const repaymentFactor = report.factors.find((factor) => factor.label === "Repayment behavior");
  const protocolFactor = report.factors.find((factor) => factor.label === "Protocol activity");

  return [
    {
      title: "Build 30+ days of observed history",
      progress: factorProgress(ageFactor),
      impact: 4,
      detail: `${report.metrics.observedAgeDays} observed days from the live RPC sample.`,
    },
    {
      title: "Improve clean transaction history",
      progress: factorProgress(repaymentFactor),
      impact: 7,
      detail: `${report.metrics.successfulTransactions}/${report.metrics.sampledTransactions} sampled transactions succeeded.`,
    },
    {
      title: "Increase protocol participation",
      progress: factorProgress(protocolFactor),
      impact: 3,
      detail: `${report.metrics.protocolInteractions} known protocol touches were detected.`,
    },
    {
      title: "Keep stronger liquid balances",
      progress: factorProgress(liquidityFactor),
      impact: 3,
      detail: `${report.metrics.solBalance.toFixed(4)} SOL and ${report.metrics.nonZeroTokenAccounts} non-zero token accounts detected.`,
    },
  ];
}

function factorProgress(factor: CreditReport["factors"][number] | undefined) {
  if (!factor) return 0;
  return Math.round((factor.value / factor.max) * 100);
}
