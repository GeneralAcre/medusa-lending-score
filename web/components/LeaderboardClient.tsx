"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import type { CreditReport } from "@/lib/scoring";

type LeaderboardEntry = {
  wallet: string;
  displayName: string;
  score: number;
  band: CreditReport["band"];
  signals: string;
  updatedAt: string;
  source: "live" | "curated";
};

const storageKey = "solana-trust-leaderboard";
const curatedEntries: LeaderboardEntry[] = [
  {
    wallet: "curated-toly-sol",
    displayName: "toly.sol",
    score: 96,
    band: "Prime",
    signals: "Curated Solana ecosystem profile",
    updatedAt: "2026-05-09T00:00:00.000Z",
    source: "curated",
  },
  {
    wallet: "curated-mert-sol",
    displayName: "mert.sol",
    score: 93,
    band: "Prime",
    signals: "Curated Solana ecosystem profile",
    updatedAt: "2026-05-09T00:00:00.000Z",
    source: "curated",
  },
  {
    wallet: "curated-raj-sol",
    displayName: "raj.sol",
    score: 90,
    band: "Prime",
    signals: "Curated Solana ecosystem profile",
    updatedAt: "2026-05-09T00:00:00.000Z",
    source: "curated",
  },
  {
    wallet: "curated-armani-sol",
    displayName: "armani.sol",
    score: 87,
    band: "Prime",
    signals: "Curated Solana ecosystem profile",
    updatedAt: "2026-05-09T00:00:00.000Z",
    source: "curated",
  },
  {
    wallet: "curated-anatoly-sol",
    displayName: "anatoly.sol",
    score: 84,
    band: "Prime",
    signals: "Curated Solana ecosystem profile",
    updatedAt: "2026-05-09T00:00:00.000Z",
    source: "curated",
  },
];

export function LeaderboardClient() {
  const [wallet, setWallet] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const storedEntries = window.localStorage.getItem(storageKey);
    if (!storedEntries) return;

    try {
      setEntries(JSON.parse(storedEntries) as LeaderboardEntry[]);
    } catch {
      window.localStorage.removeItem(storageKey);
    }
  }, []);

  const rankedEntries = useMemo(
    () =>
      [...entries, ...curatedEntries].sort((left, right) => {
        if (right.score !== left.score) return right.score - left.score;
        return right.updatedAt.localeCompare(left.updatedAt);
      }),
    [entries],
  );

  async function submitWallet(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedWallet = wallet.trim();
    const trimmedName = displayName.trim();

    if (!trimmedWallet) {
      setError("Paste a Solana wallet address first.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({ wallet: trimmedWallet, cluster: "devnet" });
      const response = await fetch(`/api/score?${params.toString()}`);
      const payload = (await response.json()) as CreditReport | { error?: string };

      if (!response.ok) {
        throw new Error("error" in payload ? payload.error : "Unable to score wallet.");
      }

      const report = payload as CreditReport;
      const nextEntry: LeaderboardEntry = {
        wallet: report.wallet,
        displayName: trimmedName || "Anonymous",
        score: report.score,
        band: report.band,
        signals: `${report.metrics.sampledTransactions} txs / ${report.metrics.observedAgeDays} days / ${report.metrics.protocolInteractions} protocol touches`,
        updatedAt: new Date().toISOString(),
        source: "live",
      };
      const nextEntries = [
        nextEntry,
        ...entries.filter((entry) => entry.wallet !== report.wallet),
      ];

      setEntries(nextEntries);
      window.localStorage.setItem(storageKey, JSON.stringify(nextEntries));
      setWallet("");
      setDisplayName("");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to score wallet.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <form
        className="mt-8 grid gap-3 rounded-xl border border-[#450041]/18 bg-[#450041]/5 p-5 lg:grid-cols-[minmax(0,1fr)_240px_150px]"
        onSubmit={submitWallet}
      >
        <input
          className="min-h-12 rounded-lg border border-[#450041]/20 bg-[#FFFFFF] px-4 text-sm outline-none focus:border-[#00B65C]"
          onChange={(event) => setWallet(event.target.value)}
          placeholder="Devnet wallet address"
          value={wallet}
        />
        <input
          className="min-h-12 rounded-lg border border-[#450041]/20 bg-[#FFFFFF] px-4 text-sm outline-none focus:border-[#00B65C]"
          onChange={(event) => setDisplayName(event.target.value)}
          placeholder="Display name optional"
          value={displayName}
        />
        <button
          className="rounded-md bg-[#00B65C] px-5 py-3 text-sm font-black text-[#FFFFFF] transition hover:bg-[#450041] disabled:bg-[#450041]/15 disabled:text-[#450041]/45"
          disabled={isLoading}
          type="submit"
        >
          {isLoading ? "Scoring" : "Opt In"}
        </button>
      </form>

      {error ? (
        <p className="mt-4 rounded-lg border border-[#00B65C] bg-[#00B65C]/10 px-4 py-3 text-sm text-[#450041]">
          {error}
        </p>
      ) : null}

      <section className="mt-8 overflow-hidden rounded-xl border border-[#450041]/18 bg-[#FFFFFF] shadow-[0_20px_70px_rgba(69,0,65,0.10)]">
        <div className="grid grid-cols-[70px_minmax(0,1fr)_100px] gap-3 border-b border-[#450041]/12 bg-[#450041]/5 px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-[#450041]/55 sm:grid-cols-[90px_minmax(0,1fr)_130px_160px]">
          <span>Rank</span>
          <span>Wallet</span>
          <span>Score</span>
          <span className="hidden sm:block">Updated</span>
        </div>
        {rankedEntries.length > 0 ? (
          rankedEntries.map((entry, index) => (
            <article
              className="grid grid-cols-[70px_minmax(0,1fr)_100px] gap-3 border-b border-[#450041]/10 px-4 py-5 last:border-b-0 sm:grid-cols-[90px_minmax(0,1fr)_130px_160px] sm:items-center"
              key={entry.wallet}
            >
              <p className="text-2xl font-black text-[#00B65C]">#{index + 1}</p>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="break-words text-lg font-black">{entry.displayName}</h2>
                  <span className="rounded-full border border-[#450041]/15 px-2 py-1 text-xs text-[#450041]/55">
                    {shortWallet(entry.wallet)}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-[#450041]/65">{entry.signals}</p>
              </div>
              <div>
                <p className="text-3xl font-black">{entry.score}</p>
                <p className="text-xs font-bold uppercase text-[#00B65C]">{entry.band}</p>
              </div>
              <p className="hidden text-sm text-[#450041]/55 sm:block">
                {entry.source === "live"
                  ? new Date(entry.updatedAt).toLocaleDateString()
                  : "Curated demo"}
              </p>
            </article>
          ))
        ) : null}
      </section>
    </>
  );
}

function shortWallet(wallet: string) {
  if (wallet.length <= 10) return wallet;
  return `${wallet.slice(0, 4)}...${wallet.slice(-4)}`;
}
