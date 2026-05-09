"use client";

import Image from "next/image";
import { useWallet } from "@solana/wallet-adapter-react";
import { FormEvent, useEffect, useState } from "react";
import type { CreditReport, ScoreFactor } from "@/lib/scoring";

const badgeLevels = [
  {
    name: "Medusa Badge LV1",
    band: "High Risk",
    minimumScore: 8,
    image: "/nft-badge/medusa-badge-lv1.png",
  },
  {
    name: "Medusa Badge LV2",
    band: "Emerging",
    minimumScore: 52,
    image: "/nft-badge/medusa-badge-lv2.png",
  },
  {
    name: "Medusa Badge LV3",
    band: "Reliable",
    minimumScore: 68,
    image: "/nft-badge/medusa-badge-lv3.png",
  },
  {
    name: "Medusa Badge LV4",
    band: "Prime",
    minimumScore: 82,
    image: "/nft-badge/medusa-badge-lv4.png",
  },
] as const;

const emptyActivities = [
  ["Successful txs", "--", "Confirmed actions"],
  ["Active days", "--", "Observed activity"],
  ["Protocol touches", "--", "DeFi usage"],
  ["Wallet age", "--", "Days observed"],
] as const;

export function ProfileClient() {
  const { publicKey } = useWallet();
  const [wallet, setWallet] = useState(() => {
    if (typeof window === "undefined") return "";
    return window.localStorage.getItem("solana-trust-wallet") ?? "";
  });
  const [report, setReport] = useState<CreditReport | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [shareLabel, setShareLabel] = useState("Share");

  const badge = report ? badgeForScore(report.score) : badgeLevels[0];
  const score = report?.score ?? 0;
  const activities = report ? activityStats(report) : emptyActivities;

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const nextAddress = publicKey?.toBase58() ?? "";
      if (!nextAddress) return;

      setWallet(nextAddress);
      setReport(null);
      setError("");
      window.localStorage.setItem("solana-trust-wallet", nextAddress);
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

  async function shareProfile() {
    const value = report?.wallet ?? wallet.trim();
    if (!value) return;

    await navigator.clipboard.writeText(value);
    setShareLabel("Copied");
    window.setTimeout(() => setShareLabel("Share"), 1400);
  }

  async function loadProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedWallet = wallet.trim();

    if (!trimmedWallet) {
      setError("Paste or connect a Solana wallet first.");
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
        throw new Error("error" in payload ? payload.error : "Unable to load profile.");
      }

      setReport(payload as CreditReport);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to load profile.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="rounded-xl border border-[#450041]/18 bg-[#450041] text-[#FFFFFF] shadow-[0_28px_90px_rgba(69,0,65,0.22)]">
      <div className="border-b border-[#FFFFFF]/12 p-5 sm:p-6 lg:p-8">
        <form className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_96px_150px]" onSubmit={loadProfile}>
          <input
            className="min-h-12 rounded-lg border border-[#FFFFFF]/18 bg-[#FFFFFF]/10 px-4 text-sm text-[#FFFFFF] outline-none placeholder:text-[#FFFFFF]/50 focus:border-[#00B65C]"
            onChange={(event) => setWallet(event.target.value)}
            placeholder="Paste wallet address or connect wallet"
            value={wallet}
          />
          <button
            className="rounded-md border border-[#FFFFFF]/18 px-4 py-3 text-sm font-black text-[#FFFFFF] hover:border-[#00B65C] hover:text-[#00B65C]"
            onClick={pasteAddress}
            type="button"
          >
            Paste
          </button>
          <button
            className="rounded-md bg-[#00B65C] px-5 py-3 text-sm font-black text-[#FFFFFF] hover:bg-[#450041] disabled:bg-[#FFFFFF]/12 disabled:text-[#FFFFFF]/42"
            disabled={isLoading}
            type="submit"
          >
            {isLoading ? "Loading" : "Load Profile"}
          </button>
        </form>
        {error ? (
          <p className="mt-4 rounded-lg border border-[#00B65C]/50 bg-[#00B65C]/12 px-4 py-3 text-sm text-[#FFFFFF]">
            {error}
          </p>
        ) : null}
      </div>

      <div className="relative overflow-hidden p-5 sm:p-6 lg:p-8">
        <div className="pointer-events-none absolute inset-0 bg-[#FFFFFF]/[0.03]" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.09] [background-image:linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)] [background-size:72px_72px]" />
        <div className="relative">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div className="flex min-w-0 items-center gap-5">
              <div className="grid h-20 w-20 shrink-0 place-items-center rounded-xl border border-[#FFFFFF]/30 bg-[#FFFFFF]/10 text-4xl font-black shadow-[0_18px_42px_rgba(0,0,0,0.18)]">
                {report ? report.wallet.slice(0, 1).toUpperCase() : "?"}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#00B65C]">
                  Wallet Identity
                </p>
                <h1 className="mt-2 truncate text-2xl font-black sm:text-3xl">
                  {report ? shortAddress(report.wallet) : "Unverified profile"}
                </h1>
                <p className="mt-2 inline-flex rounded-full border border-[#FFFFFF]/22 px-3 py-1 text-xs font-black text-[#FFFFFF]/82">
                  {report?.band ?? "Connect or paste wallet"}
                </p>
              </div>
            </div>

            <button
              className="rounded-lg border border-[#FFFFFF]/24 bg-[#FFFFFF]/10 px-5 py-3 text-sm font-black text-[#FFFFFF] hover:border-[#00B65C] hover:bg-[#00B65C]"
              onClick={shareProfile}
              type="button"
            >
              {shareLabel}
            </button>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-[minmax(280px,0.9fr)_minmax(0,1.25fr)]">
            <section className="rounded-lg border border-[#FFFFFF]/16 bg-[#FFFFFF]/10 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-[#FFFFFF]/50">
                    Credibility Score
                  </p>
                  <div className="mt-4 flex items-end gap-3">
                    <p className="text-7xl font-black leading-none text-[#FFFFFF]">
                      {report?.score ?? "--"}
                    </p>
                    <p className="pb-2 text-sm font-black text-[#00B65C]">/ 98 pts</p>
                  </div>
                </div>
                <div className="h-24 w-24 overflow-hidden rounded-lg border border-[#FFFFFF]/18 bg-[#FFFFFF]/10">
                  <Image
                    alt={`${badge.name} artwork`}
                    className="h-full w-full object-cover"
                    height={256}
                    src={badge.image}
                    width={256}
                  />
                </div>
              </div>
              <div className="mt-5 h-2 rounded-full bg-[#FFFFFF]/16">
                <div
                  className="h-2 rounded-full bg-[#00B65C]"
                  style={{ width: `${Math.max(4, score)}%` }}
                />
              </div>
              <p className="mt-4 text-sm leading-6 text-[#FFFFFF]/62">
                {report?.summary ??
                  "Load a wallet profile to see credibility based on transaction success, account age, liquidity, and protocol activity."}
              </p>
            </section>

            <section className="grid gap-4 sm:grid-cols-2">
              {activities.map(([label, value, detail]) => (
                <article
                  className="rounded-lg border border-[#FFFFFF]/16 bg-[#FFFFFF]/10 p-5"
                  key={label}
                >
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-[#FFFFFF]/45">
                    {label}
                  </p>
                  <p className="mt-3 text-4xl font-black">{value}</p>
                  <p className="mt-2 text-sm text-[#FFFFFF]/55">{detail}</p>
                </article>
              ))}
            </section>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.85fr)]">
            <section className="rounded-lg border border-[#FFFFFF]/16 bg-[#FFFFFF]/10 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-xl font-black">Account Activity Signals</h2>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#00B65C]">
                  Priority evidence
                </p>
              </div>
              <div className="mt-5 grid gap-4">
                {(report?.factors ?? []).map((factor) => (
                  <SignalRow factor={factor} key={factor.label} />
                ))}
                {!report ? (
                  <p className="rounded-lg border border-[#FFFFFF]/14 bg-[#FFFFFF]/8 p-4 text-sm text-[#FFFFFF]/64">
                    Activity signals appear after loading a wallet.
                  </p>
                ) : null}
              </div>
            </section>

            <section className="rounded-lg border border-[#FFFFFF]/16 bg-[#FFFFFF]/10 p-5">
              <h2 className="text-xl font-black">Credibility Identity</h2>
              <div className="mt-5 grid gap-3">
                <ProfileMetric label="Badge" value={badge.name} />
                <ProfileMetric label="Default risk" value={report?.defaultRisk ?? "--"} />
                <ProfileMetric label="Credit line" value={report?.creditLine ?? "--"} />
                <ProfileMetric label="Suggested APR" value={report?.rateEstimate ?? "--"} />
              </div>
            </section>
          </div>
        </div>
      </div>
    </section>
  );
}

function SignalRow({ factor }: { factor: ScoreFactor }) {
  const percent = Math.round((factor.value / factor.max) * 100);

  return (
    <article className="rounded-lg border border-[#FFFFFF]/14 bg-[#FFFFFF]/8 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-black">{factor.label}</h3>
          <p className="mt-1 text-sm leading-6 text-[#FFFFFF]/55">{factor.detail}</p>
        </div>
        <p className="text-lg font-black text-[#00B65C]">
          {factor.value}/{factor.max}
        </p>
      </div>
      <div className="mt-4 h-2 rounded-full bg-[#FFFFFF]/12">
        <div className="h-2 rounded-full bg-[#00B65C]" style={{ width: `${percent}%` }} />
      </div>
    </article>
  );
}

function ProfileMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[#FFFFFF]/14 bg-[#FFFFFF]/8 p-4">
      <p className="text-xs font-black uppercase tracking-[0.14em] text-[#FFFFFF]/42">{label}</p>
      <p className="mt-2 break-words text-lg font-black text-[#FFFFFF]">{value}</p>
    </div>
  );
}

function activityStats(report: CreditReport) {
  return [
    [
      "Successful txs",
      String(report.metrics.successfulTransactions),
      `${Math.round(report.metrics.successRate * 100)}% success rate`,
    ],
    ["Active days", String(report.metrics.activeDays), "Days seen in RPC sample"],
    ["Protocol touches", String(report.metrics.protocolInteractions), "Known DeFi interactions"],
    ["Wallet age", String(report.metrics.observedAgeDays), "Days of observed history"],
  ] as const;
}

function badgeForScore(score: number) {
  if (score >= 82) return badgeLevels[3];
  if (score >= 68) return badgeLevels[2];
  if (score >= 52) return badgeLevels[1];
  return badgeLevels[0];
}

function shortAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-6)}`;
}
