"use client";

import { FormEvent, useMemo, useState } from "react";
import type { CreditReport } from "@/lib/scoring";

export function BadgeMintClient() {
  const [wallet, setWallet] = useState("");
  const [report, setReport] = useState<CreditReport | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const credentialPayload = useMemo(() => {
    if (!report) return null;

    return {
      wallet: report.wallet,
      cluster: "devnet",
      score: report.score,
      band: report.band,
      modelVersion: report.apiPayload.modelVersion,
      confidence: report.apiPayload.confidence,
      issuedAt: new Date().toISOString(),
    };
  }, [report]);

  async function loadScore(event: FormEvent<HTMLFormElement>) {
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
    <section className="rounded-xl border border-[#450041]/18 bg-[#450041]/5 p-6 shadow-[0_24px_90px_rgba(69,0,65,0.12)]">
      <form className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_140px]" onSubmit={loadScore}>
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
          {isLoading ? "Scoring" : "Load Score"}
        </button>
      </form>

      {error ? (
        <p className="mt-4 rounded-lg border border-[#00B65C] bg-[#00B65C]/10 px-4 py-3 text-sm text-[#450041]">
          {error}
        </p>
      ) : null}

      <div className="mt-6 rounded-xl border border-[#450041]/18 bg-[#FFFFFF] p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="rounded-full border border-[#00B65C]/30 px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-[#00B65C]">
            Live Devnet Report
          </p>
          <p className="text-xs font-black uppercase tracking-[0.12em] text-[#450041]/45">
            Not minted until signed
          </p>
        </div>
        <div className="mt-10 grid place-items-center">
          <div className="grid h-48 w-48 place-items-center rounded-full bg-[#450041] text-[#FFFFFF] shadow-[0_24px_70px_rgba(69,0,65,0.25)]">
            <div className="text-center">
              <p className="text-6xl font-black leading-none">{report?.score ?? "--"}</p>
              <p className="mt-2 text-sm font-black uppercase tracking-[0.18em] text-[#00B65C]">
                {report?.band ?? "Load"}
              </p>
            </div>
          </div>
        </div>
        <div className="mt-10">
          <h2 className="text-xl font-black">Credential Payload</h2>
          <pre className="mt-3 max-h-60 overflow-auto rounded-lg border border-[#450041]/14 bg-[#450041]/5 p-4 text-xs leading-5 text-[#450041]">
            {credentialPayload
              ? JSON.stringify(credentialPayload, null, 2)
              : "Load a real devnet wallet score to generate the credential payload."}
          </pre>
        </div>
        <button
          className="mt-6 w-full rounded-md bg-[#450041]/15 px-5 py-3 text-sm font-black text-[#450041]/55"
          disabled
          type="button"
        >
          Mint disabled until SCORE_BADGE_PROGRAM_ID is deployed
        </button>
      </div>
    </section>
  );
}
