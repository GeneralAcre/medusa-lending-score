"use client";

import Image from "next/image";
import { FormEvent, useEffect, useMemo, useState } from "react";
import type { CreditReport, ScoreFactor, WalletMetrics } from "@/lib/scoring";

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
  const [selectedEntry, setSelectedEntry] = useState<LeaderboardEntry | null>(null);
  const [selectedReport, setSelectedReport] = useState<CreditReport | null>(null);
  const [error, setError] = useState("");
  const [detailError, setDetailError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const storedEntries = window.localStorage.getItem(storageKey);
      if (!storedEntries) return;

      try {
        setEntries(JSON.parse(storedEntries) as LeaderboardEntry[]);
      } catch {
        window.localStorage.removeItem(storageKey);
      }
    }, 0);

    return () => window.clearTimeout(timeout);
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

  async function openProfile(entry: LeaderboardEntry) {
    setSelectedEntry(entry);
    setDetailError("");

    if (entry.source === "curated") {
      setSelectedReport(curatedReport(entry));
      return;
    }

    setIsDetailLoading(true);
    setSelectedReport(null);

    try {
      const params = new URLSearchParams({ wallet: entry.wallet, cluster: "devnet" });
      const response = await fetch(`/api/score?${params.toString()}`);
      const payload = (await response.json()) as CreditReport | { error?: string };

      if (!response.ok) {
        throw new Error("error" in payload ? payload.error : "Unable to load profile.");
      }

      setSelectedReport(payload as CreditReport);
    } catch (caughtError) {
      setDetailError(caughtError instanceof Error ? caughtError.message : "Unable to load profile.");
    } finally {
      setIsDetailLoading(false);
    }
  }

  return (
    <>
      <form
        className="mt-8 grid gap-3 rounded-xl border border-[#450041]/18 bg-[#450041]/5 p-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_240px_150px]"
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
        <div className="grid grid-cols-[52px_minmax(0,1fr)_72px] gap-2 border-b border-[#450041]/12 bg-[#450041]/5 px-3 py-3 text-xs font-black uppercase tracking-[0.12em] text-[#450041]/55 sm:grid-cols-[90px_minmax(0,1fr)_130px_160px] sm:gap-3 sm:px-4">
          <span>Rank</span>
          <span>Wallet</span>
          <span>Score</span>
          <span className="hidden sm:block">Updated</span>
        </div>
        {rankedEntries.length > 0 ? (
          rankedEntries.map((entry, index) => (
            <button
              className={`grid w-full grid-cols-[52px_minmax(0,1fr)_72px] gap-2 border-b border-[#450041]/10 px-3 py-4 text-left transition last:border-b-0 hover:bg-[#00B65C]/8 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#00B65C] sm:grid-cols-[90px_minmax(0,1fr)_130px_160px] sm:items-center sm:gap-3 sm:px-4 sm:py-5 ${
                selectedEntry?.wallet === entry.wallet ? "bg-[#00B65C]/10" : ""
              }`}
              key={entry.wallet}
              onClick={() => openProfile(entry)}
              type="button"
            >
              <p className="text-xl font-black text-[#00B65C] sm:text-2xl">#{index + 1}</p>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="break-words text-base font-black sm:text-lg">{entry.displayName}</h2>
                  <span className="rounded-full border border-[#450041]/15 px-2 py-1 text-xs text-[#450041]/55">
                    {shortWallet(entry.wallet)}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-[#450041]/65">{entry.signals}</p>
              </div>
              <div className="min-w-0">
                <p className="text-2xl font-black sm:text-3xl">{entry.score}</p>
                <p className="text-xs font-bold uppercase text-[#00B65C]">{entry.band}</p>
              </div>
              <p className="hidden text-sm text-[#450041]/55 sm:block">
                {entry.source === "live"
                  ? new Date(entry.updatedAt).toLocaleDateString()
                  : "Curated demo"}
              </p>
            </button>
          ))
        ) : null}
      </section>

      <LeaderboardProfileDetail
        entry={selectedEntry}
        error={detailError}
        isLoading={isDetailLoading}
        onClose={() => {
          setSelectedEntry(null);
          setSelectedReport(null);
          setDetailError("");
          setIsDetailLoading(false);
        }}
        report={selectedReport}
      />
    </>
  );
}

function LeaderboardProfileDetail({
  entry,
  error,
  isLoading,
  onClose,
  report,
}: {
  entry: LeaderboardEntry | null;
  error: string;
  isLoading: boolean;
  onClose: () => void;
  report: CreditReport | null;
}) {
  if (!entry) return null;

  const badge = badgeForScore(report?.score ?? entry.score);
  const activities = report ? activityStats(report) : emptyActivities;

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 grid place-items-center bg-[#170015]/70 p-2 backdrop-blur-sm sm:p-4"
      role="dialog"
    >
      <section className="max-h-[92dvh] w-full max-w-6xl overflow-y-auto rounded-xl border border-[#FFFFFF]/16 bg-[#450041] p-4 text-[#FFFFFF] shadow-[0_28px_90px_rgba(0,0,0,0.42)] sm:max-h-[90vh] sm:p-6 lg:p-8">
        {error ? (
          <p className="mb-5 rounded-lg border border-[#00B65C]/50 bg-[#00B65C]/12 px-4 py-3 text-sm">
            {error}
          </p>
        ) : null}

        <div className="flex flex-col items-stretch gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-center gap-4 sm:gap-5">
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-xl border border-[#FFFFFF]/30 bg-[#FFFFFF]/10 text-3xl font-black sm:h-20 sm:w-20 sm:text-4xl">
              {entry.displayName.slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#00B65C]">
                Leaderboard Profile
              </p>
              <h2 className="mt-2 truncate text-xl font-black sm:text-3xl">
                {entry.displayName}
              </h2>
              <p className="mt-2 inline-flex rounded-full border border-[#FFFFFF]/22 px-3 py-1 text-xs font-black text-[#FFFFFF]/82">
                {isLoading ? "Loading activity" : report?.band ?? entry.band}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between gap-3 sm:justify-end">
            <span className="rounded-full border border-[#FFFFFF]/22 bg-[#FFFFFF]/10 px-4 py-2 text-xs font-black text-[#FFFFFF]/82">
              {shortWallet(entry.wallet)}
            </span>
            <button
              aria-label="Close profile popup"
              className="grid h-10 w-10 place-items-center rounded-lg border border-[#FFFFFF]/24 bg-[#FFFFFF]/10 text-xl font-black text-[#FFFFFF] hover:border-[#00B65C] hover:bg-[#00B65C]"
              onClick={onClose}
              type="button"
            >
              x
            </button>
          </div>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-[minmax(280px,0.9fr)_minmax(0,1.25fr)]">
          <section className="rounded-lg border border-[#FFFFFF]/16 bg-[#FFFFFF]/10 p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#FFFFFF]/50">
                  Credibility Score
                </p>
                <div className="mt-4 flex items-end gap-3">
                  <p className="text-5xl font-black leading-none sm:text-7xl">
                    {report?.score ?? entry.score}
                  </p>
                  <p className="pb-2 text-sm font-black text-[#00B65C]">/ 98 pts</p>
                </div>
              </div>
              <div className="h-20 w-20 overflow-hidden rounded-lg border border-[#FFFFFF]/18 bg-[#FFFFFF]/10 sm:h-24 sm:w-24">
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
                style={{ width: `${Math.max(4, report?.score ?? entry.score)}%` }}
              />
            </div>
            <p className="mt-4 text-sm leading-6 text-[#FFFFFF]/62">
              {report?.summary ?? entry.signals}
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
              <h3 className="text-xl font-black">Account Activity Signals</h3>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#00B65C]">
                Profile evidence
              </p>
            </div>
            <div className="mt-5 grid gap-4">
              {(report?.factors ?? []).map((factor) => (
                <SignalRow factor={factor} key={factor.label} />
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-[#FFFFFF]/16 bg-[#FFFFFF]/10 p-5">
            <h3 className="text-xl font-black">Credibility Identity</h3>
            <div className="mt-5 grid gap-3">
              <ProfileMetric label="Badge" value={badge.name} />
              <ProfileMetric label="Default risk" value={report?.defaultRisk ?? "--"} />
              <ProfileMetric label="Credit line" value={report?.creditLine ?? "--"} />
              <ProfileMetric label="Suggested APR" value={report?.rateEstimate ?? "--"} />
            </div>
          </section>
        </div>

      </section>
    </div>
  );
}

function SignalRow({ factor }: { factor: ScoreFactor }) {
  const percent = Math.round((factor.value / factor.max) * 100);

  return (
    <article className="rounded-lg border border-[#FFFFFF]/14 bg-[#FFFFFF]/8 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h4 className="font-black">{factor.label}</h4>
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

const emptyActivities = [
  ["Successful txs", "--", "Confirmed actions"],
  ["Active days", "--", "Observed activity"],
  ["Protocol touches", "--", "DeFi usage"],
  ["Wallet age", "--", "Days observed"],
] as const;

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

const badgeLevels = [
  {
    name: "Medusa Badge LV1",
    image: "/nft-badge/medusa-badge-lv1.png",
  },
  {
    name: "Medusa Badge LV2",
    image: "/nft-badge/medusa-badge-lv2.png",
  },
  {
    name: "Medusa Badge LV3",
    image: "/nft-badge/medusa-badge-lv3.png",
  },
  {
    name: "Medusa Badge LV4",
    image: "/nft-badge/medusa-badge-lv4.png",
  },
] as const;

function badgeForScore(score: number) {
  if (score >= 82) return badgeLevels[3];
  if (score >= 68) return badgeLevels[2];
  if (score >= 52) return badgeLevels[1];
  return badgeLevels[0];
}

function curatedReport(entry: LeaderboardEntry): CreditReport {
  const metrics: WalletMetrics = {
    wallet: entry.wallet,
    cluster: "curated",
    rpcUrl: "curated-demo",
    solBalance: 42.5,
    sampledTransactions: entry.score + 18,
    successfulTransactions: entry.score + 14,
    failedTransactions: 1,
    successRate: 0.96,
    activeDays: Math.max(24, entry.score - 50),
    observedAgeDays: 420 + entry.score,
    tokenAccountCount: 18,
    nonZeroTokenAccounts: 12,
    protocolInteractions: Math.max(9, Math.round(entry.score / 6)),
    lastActivityAt: entry.updatedAt,
    oldestSampledActivityAt: "2025-01-15T00:00:00.000Z",
  };

  return {
    wallet: entry.wallet,
    score: entry.score,
    band: entry.band,
    rateEstimate: "6.8%-8.4%",
    creditLine: "Up to 12,000 USDC",
    defaultRisk: "Low",
    summary:
      "Curated demo activity shows a mature wallet with strong transaction reliability, broad protocol usage, and steady account history.",
    dataSource: "curated demo",
    metrics,
    factors: [
      {
        label: "Repayment behavior",
        value: 34,
        max: 35,
        status: "strong",
        detail: `${metrics.successfulTransactions}/${metrics.sampledTransactions} sampled actions completed successfully.`,
      },
      {
        label: "Liquidity resilience",
        value: 29,
        max: 30,
        status: "strong",
        detail: `${metrics.solBalance.toFixed(1)} SOL plus ${metrics.nonZeroTokenAccounts} active token accounts in the demo profile.`,
      },
      {
        label: "Wallet age",
        value: 25,
        max: 25,
        status: "strong",
        detail: `${metrics.observedAgeDays} days of observed wallet history.`,
      },
      {
        label: "Protocol activity",
        value: 17,
        max: 18,
        status: "strong",
        detail: `${metrics.protocolInteractions} known DeFi protocol touches across ${metrics.activeDays} active days.`,
      },
      {
        label: "Risk flags",
        value: 2,
        max: 12,
        status: "strong",
        detail: `${metrics.failedTransactions} failed sampled action and no major demo risk flags.`,
      },
    ],
    signals: [],
    recentActivity: [],
    recommendations: [],
    apiPayload: {
      wallet: entry.wallet,
      score: entry.score,
      band: entry.band,
      modelVersion: "curated-demo-0.1",
      confidence: 0.92,
    },
  };
}

function shortWallet(wallet: string) {
  if (wallet.length <= 10) return wallet;
  return `${wallet.slice(0, 4)}...${wallet.slice(-4)}`;
}
