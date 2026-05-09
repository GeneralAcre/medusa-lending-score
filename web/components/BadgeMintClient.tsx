"use client";

import Image from "next/image";
import { FormEvent, useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import type { CreditReport } from "@/lib/scoring";

const badgeLevels = [
  {
    level: "LV1",
    name: "Medusa Badge LV1",
    band: "High Risk",
    minimumScore: 8,
    nextScore: 52,
    image: "/nft-badge/medusa-badge-lv1.png",
  },
  {
    level: "LV2",
    name: "Medusa Badge LV2",
    band: "Emerging",
    minimumScore: 52,
    nextScore: 68,
    image: "/nft-badge/medusa-badge-lv2.png",
  },
  {
    level: "LV3",
    name: "Medusa Badge LV3",
    band: "Reliable",
    minimumScore: 68,
    nextScore: 82,
    image: "/nft-badge/medusa-badge-lv3.png",
  },
  {
    level: "LV4",
    name: "Medusa Badge LV4",
    band: "Prime",
    minimumScore: 82,
    nextScore: null,
    image: "/nft-badge/medusa-badge-lv4.png",
  },
] as const;

export function BadgeMintClient() {
  const { publicKey } = useWallet();
  const [wallet, setWallet] = useState(() => {
    if (typeof window === "undefined") return "";
    return window.localStorage.getItem("solana-trust-wallet") ?? "";
  });
  const [report, setReport] = useState<CreditReport | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const earnedBadge = report ? badgeForScore(report.score) : badgeLevels[0];
  const nextBadge = report ? badgeLevels.find((badge) => badge.minimumScore > report.score) : null;
  const pointsToNext = report && nextBadge ? nextBadge.minimumScore - report.score : 0;

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const nextAddress = publicKey?.toBase58() ?? "";
      setWallet(nextAddress);
      setReport(null);
      setError("");
      if (nextAddress) {
        window.localStorage.setItem("solana-trust-wallet", nextAddress);
      } else {
        window.localStorage.removeItem("solana-trust-wallet");
      }
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [publicKey]);

  async function pasteAddress() {
    try {
      const clipboardText = await navigator.clipboard.readText();
      const nextWallet = clipboardText.trim();

      if (!nextWallet) {
        setError("Clipboard does not contain a wallet address.");
        return;
      }

      setWallet(nextWallet);
      setReport(null);
      setError("");
    } catch {
      setError("Allow clipboard access or paste the wallet address manually.");
    }
  }

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
    <section className="rounded-xl border border-[#450041]/18 bg-[#450041]/5 p-5 shadow-[0_24px_90px_rgba(69,0,65,0.12)] sm:p-6">
      <div className="mb-5">
        <p className="text-sm font-black uppercase tracking-[0.16em] text-[#00B65C]">
          Wallet Profile
        </p>
        <h2 className="mt-2 text-2xl font-black">Check points and earned badge</h2>
      </div>

      <form className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_90px_140px]" onSubmit={loadScore}>
        <input
          className="min-h-12 rounded-lg border border-[#450041]/20 bg-[#FFFFFF] px-4 text-sm outline-none focus:border-[#00B65C]"
          onChange={(event) => setWallet(event.target.value)}
          placeholder="Devnet wallet address"
          value={wallet}
        />
        <button
          className="rounded-md border border-[#450041]/25 px-4 py-3 text-sm font-bold text-[#450041] transition hover:border-[#00B65C] hover:text-[#00B65C]"
          onClick={pasteAddress}
          type="button"
        >
          Paste
        </button>
        <button
          className="rounded-md bg-[#00B65C] px-5 py-3 text-sm font-black text-[#FFFFFF] transition hover:bg-[#450041] disabled:bg-[#450041]/15 disabled:text-[#450041]/45"
          disabled={isLoading}
          type="submit"
        >
          {isLoading ? "Checking" : "Check"}
        </button>
      </form>

      {error ? (
        <p className="mt-4 rounded-lg border border-[#00B65C] bg-[#00B65C]/10 px-4 py-3 text-sm text-[#450041]">
          {error}
        </p>
      ) : null}

      <div className="mt-6 grid gap-5 rounded-xl border border-[#450041]/18 bg-[#FFFFFF] p-5 lg:grid-cols-[220px_minmax(0,1fr)]">
        <div className="grid place-items-center">
          <div className="aspect-square w-full max-w-56 overflow-hidden rounded-lg border border-[#450041]/12 bg-[#450041]/5">
            <Image
              alt={`${earnedBadge.name} NFT artwork`}
              className="h-full w-full object-cover"
              height={512}
              priority
              src={earnedBadge.image}
              width={512}
            />
          </div>
        </div>

        <div>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.14em] text-[#00B65C]">
                {report ? "Earned Badge" : "Preview Badge"}
              </p>
              <h3 className="mt-2 text-2xl font-black">{earnedBadge.name}</h3>
              <p className="mt-1 text-sm font-bold text-[#450041]/60">{earnedBadge.band}</p>
            </div>
            <div className="rounded-lg border border-[#00B65C]/24 bg-[#00B65C]/10 px-4 py-3 text-right">
              <p className="text-xs font-black uppercase tracking-[0.12em] text-[#00B65C]">
                Points
              </p>
              <p className="mt-1 text-4xl font-black text-[#450041]">{report?.score ?? "--"}</p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <ProfileMetric label="Score band" value={report?.band ?? "Load wallet"} />
            <ProfileMetric
              label="Confidence"
              value={report ? `${Math.round(report.apiPayload.confidence * 100)}%` : "--"}
            />
            <ProfileMetric
              label="Next badge"
              value={
                report
                  ? nextBadge
                    ? `${pointsToNext} pts`
                    : "Max level"
                  : "Check score"
              }
            />
          </div>

          <p className="mt-5 text-sm leading-6 text-[#450041]/70">
            {report
              ? nextBadge
                ? `${pointsToNext} more points unlocks ${nextBadge.name}.`
                : "This wallet has the highest Medusa badge level available."
              : "Paste a devnet wallet address to see the badge this profile currently qualifies for."}
          </p>
        </div>
      </div>
    </section>
  );
}

function badgeForScore(score: number) {
  if (score >= 82) return badgeLevels[3];
  if (score >= 68) return badgeLevels[2];
  if (score >= 52) return badgeLevels[1];
  return badgeLevels[0];
}

function ProfileMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[#450041]/14 bg-[#450041]/5 p-3">
      <p className="text-xs font-black uppercase tracking-[0.1em] text-[#450041]/50">
        {label}
      </p>
      <p className="mt-2 break-words text-lg font-black text-[#00B65C]">{value}</p>
    </div>
  );
}
