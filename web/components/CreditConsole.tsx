"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import type { CreditReport, RecentActivityImpact } from "@/lib/scoring";
import { SiteHeader } from "@/components/SiteHeader";

type SolanaWalletProvider = {
  isBackpack?: boolean;
  isPhantom?: boolean;
  isSolflare?: boolean;
  publicKey?: { toString: () => string };
  connect: (options?: { onlyIfTrusted?: boolean }) => Promise<{
    publicKey: { toString: () => string };
  }>;
  disconnect?: () => Promise<void>;
};

type DetectedWallet = {
  id: string;
  name: string;
  provider: SolanaWalletProvider;
};

declare global {
  interface Window {
    backpack?: { solana?: SolanaWalletProvider };
    solana?: SolanaWalletProvider;
    solflare?: SolanaWalletProvider;
  }
}

const mockHistory = [
  { month: "Jul", score: 42 },
  { month: "Aug", score: 48 },
  { month: "Sep", score: 53 },
  { month: "Oct", score: 51 },
  { month: "Nov", score: 59 },
  { month: "Dec", score: 64 },
  { month: "Jan", score: 71 },
  { month: "Feb", score: 78 },
];

const previewFactors = [
  ["Transaction History", 85],
  ["DeFi Engagement", 72],
  ["Wallet Age", 91],
  ["Repayment Record", 68],
] as const;

export function CreditConsole({ compact = false }: { compact?: boolean }) {
  const [wallet, setWallet] = useState("");
  const [cluster, setCluster] = useState<"mainnet-beta" | "devnet">("devnet");
  const [report, setReport] = useState<CreditReport | null>(null);
  const [error, setError] = useState("");
  const [detectedWallets, setDetectedWallets] = useState<DetectedWallet[]>([]);
  const [selectedWalletId, setSelectedWalletId] = useState("");
  const [connectedWalletName, setConnectedWalletName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const score = report ? String(report.score) : "--";
  const rank = report ? rankForScore(report.score) : "Search address";
  const risk = report?.defaultRisk ?? "Waiting";
  const dashboardFactors = report
    ? factorRowsFromReport(report)
    : previewFactors.map(([label]) => ({ label, value: 0 }));
  const activityImpacts = report?.recentActivity ?? [];
  const history = useMemo(() => {
    if (!report) return mockHistory.map((item) => ({ ...item, score: 0 }));
    const start = Math.max(24, report.score - 32);
    return mockHistory.map((item, index) => ({
      month: item.month,
      score: Math.round(start + ((report.score - start) / 7) * index),
    }));
  }, [report]);

  useEffect(() => {
    const wallets: DetectedWallet[] = [];
    const seenProviders = new Set<SolanaWalletProvider>();

    function addWallet(
      id: string,
      name: string,
      provider: SolanaWalletProvider | undefined,
    ) {
      if (!provider || seenProviders.has(provider)) return;
      seenProviders.add(provider);
      wallets.push({ id, name, provider });
    }

    addWallet("phantom", "Phantom", window.solana?.isPhantom ? window.solana : undefined);
    addWallet(
      "solflare",
      "Solflare",
      window.solflare ?? (window.solana?.isSolflare ? window.solana : undefined),
    );
    addWallet(
      "backpack",
      "Backpack",
      window.backpack?.solana ?? (window.solana?.isBackpack ? window.solana : undefined),
    );
    addWallet("injected", "Browser wallet", wallets.length === 0 ? window.solana : undefined);

    const timeout = window.setTimeout(() => {
      setDetectedWallets(wallets);
      setSelectedWalletId((current) => current || wallets[0]?.id || "");
    }, 0);

    return () => window.clearTimeout(timeout);
  }, []);

  async function runAnalysis(nextWallet = wallet) {
    const trimmedWallet = nextWallet.trim();

    if (!trimmedWallet) {
      setError("Paste or connect a Solana wallet address first.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        wallet: trimmedWallet,
        cluster,
      });
      const response = await fetch(`/api/score?${params.toString()}`);
      const payload = (await response.json()) as CreditReport | { error?: string };

      if (!response.ok) {
        throw new Error("error" in payload ? payload.error : "Wallet analysis failed.");
      }

      setReport(payload as CreditReport);
    } catch (caughtError) {
      setReport(null);
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to analyze this wallet.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function analyzeWallet(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await runAnalysis();
  }

  async function connectWallet() {
    const selectedWallet = detectedWallets.find(
      (detectedWallet) => detectedWallet.id === selectedWalletId,
    );

    setIsConnecting(true);
    setError("");

    try {
      if (!selectedWallet) {
        throw new Error("No Solana wallet was found in this browser.");
      }

      const connection = await selectedWallet.provider.connect();
      const connectedWallet = connection.publicKey.toString();
      setWallet(connectedWallet);
      setConnectedWalletName(selectedWallet.name);
      await runAnalysis(connectedWallet);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error ? caughtError.message : "Wallet connection failed.",
      );
    } finally {
      setIsConnecting(false);
    }
  }

  async function disconnectWallet() {
    const selectedWallet = detectedWallets.find(
      (detectedWallet) => detectedWallet.id === selectedWalletId,
    );

    await selectedWallet?.provider.disconnect?.();
    setConnectedWalletName("");
    setWallet("");
    setReport(null);
    setError("");
  }

  return (
    <div className={`${compact ? "" : "min-h-screen"} bg-[#FFFFFF] text-[#450041]`}>
      {!compact ? <SiteHeader /> : null}

      <section className="mx-auto max-w-7xl px-5 pb-10 pt-2 sm:px-6 lg:px-8">
        {!compact ? (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 pt-6">
            <div>
              <h1 className="text-2xl font-black sm:text-3xl">Dashboard</h1>
              <p className="mt-1 text-sm text-[#450041]/65">
                Search an address or connect a wallet to view credit scoring.
              </p>
            </div>
            {connectedWalletName ? (
              <button
                className="rounded-md border border-[#450041] px-4 py-2 text-sm font-bold text-[#450041] transition hover:bg-[#00B65C] hover:text-[#FFFFFF]"
                onClick={disconnectWallet}
                type="button"
              >
                Disconnect
              </button>
            ) : (
              <button
                className="rounded-md bg-[#00B65C] px-4 py-2 text-sm font-black text-[#FFFFFF] transition hover:bg-[#450041] disabled:bg-[#450041]/15 disabled:text-[#450041]/45"
                disabled={isConnecting}
                onClick={connectWallet}
                type="button"
              >
                {isConnecting ? "Connecting" : "Connect Wallet"}
              </button>
            )}
          </div>
        ) : null}

        {!compact ? (
          <section className="mb-6 rounded-xl border border-[#450041]/18 bg-[#450041]/5 p-5">
            <p className="text-sm font-black uppercase tracking-[0.16em] text-[#00B65C]">
              Wallet Lookup
            </p>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[#450041]/70">
              Paste any Solana address to view its public credit summary from RPC data.
              This is the organic lookup flow users can share before connecting a wallet.
            </p>
          </section>
        ) : null}

        <div className="mb-6 grid gap-3 lg:grid-cols-[180px_minmax(0,1fr)_220px]">
          <select
            className="min-h-14 rounded-lg border border-[#450041]/20 bg-[#FFFFFF] px-3 text-sm text-[#450041] outline-none"
            onChange={(event) => {
              setCluster(event.target.value === "mainnet-beta" ? "mainnet-beta" : "devnet");
              setReport(null);
              setError("");
            }}
            value={cluster}
          >
            <option value="devnet">Devnet</option>
            <option value="mainnet-beta">Mainnet</option>
          </select>
          <form
            className="flex min-h-14 overflow-hidden rounded-lg border border-[#450041]/20 bg-[#FFFFFF]"
            onSubmit={analyzeWallet}
          >
            <input
              className="min-w-0 flex-1 bg-transparent px-4 text-sm text-[#450041] outline-none placeholder:text-[#450041]/45"
              onChange={(event) => setWallet(event.target.value)}
              placeholder="Search Solana address for credit score"
              value={wallet}
            />
            <button
              className="min-w-28 bg-[#00B65C] px-5 text-sm font-black text-[#FFFFFF] transition hover:bg-[#450041] disabled:bg-[#450041]/15 disabled:text-[#450041]/45"
              disabled={isLoading}
              type="submit"
            >
              {isLoading ? "Scoring" : "Search"}
            </button>
          </form>
          <select
            className="min-h-14 rounded-lg border border-[#450041]/20 bg-[#FFFFFF] px-3 text-sm text-[#450041] outline-none"
            disabled={detectedWallets.length === 0 || isConnecting || isLoading}
            onChange={(event) => setSelectedWalletId(event.target.value)}
            value={selectedWalletId}
          >
            {detectedWallets.length === 0 ? (
              <option>No wallet found</option>
            ) : (
              detectedWallets.map((detectedWallet) => (
                <option key={detedWalletKey(detectedWallet)} value={detectedWallet.id}>
                  {detectedWallet.name}
                </option>
              ))
            )}
          </select>
        </div>

        {error ? (
          <p className="mb-6 rounded-lg border border-[#00B65C] bg-[#00B65C]/10 px-4 py-3 text-sm text-[#450041]">
            {error}
          </p>
        ) : null}

        <div className="grid gap-6 sm:grid-cols-3">
          <StatCard
            label="Current Score"
            value={score}
            accent={report ? `${report.metrics.sampledTransactions} txs` : cluster}
            icon="~"
          />
          <StatCard label="Rank" value={rank} accent={report ? "live RPC" : "no mock"} icon="^" />
          <StatCard label="Risk Level" value={risk} accent={report ? report.band : "Stable"} icon="o" />
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.55fr)_minmax(360px,1fr)]">
          <section className="rounded-xl border border-[#450041]/18 bg-[#450041]/5 p-6 shadow-[0_20px_70px_rgba(69,0,65,0.10)]">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-black">Score History</h2>
              <span className="text-sm font-bold text-[#00B65C]">8 months</span>
            </div>
            <div className="mt-12 flex h-48 items-end justify-between gap-3">
              {history.map((item) => (
                <div className="flex min-w-0 flex-1 flex-col items-center gap-2" key={item.month}>
                  <span className="text-xs font-black text-[#450041]/45">
                    {item.score || "--"}
                  </span>
                  <span
                    className="w-full rounded-t-full bg-[#00B65C]"
                    style={{ height: `${Math.max(10, item.score * 0.72)}px` }}
                  />
                  <span className="text-xs text-[#450041]/45">{item.month}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-[#450041]/18 bg-[#450041]/5 p-6 shadow-[0_20px_70px_rgba(69,0,65,0.10)]">
            <h2 className="text-lg font-black">Score Factors</h2>
            <div className="mt-6 space-y-6">
              {dashboardFactors.map((factor) => (
                <FactorBar key={factor.label} label={factor.label} value={factor.value} />
              ))}
            </div>
          </section>
        </div>

        {!compact ? (
          <section className="mt-8 rounded-xl border border-[#450041]/18 bg-[#450041]/5 p-6 shadow-[0_20px_70px_rgba(69,0,65,0.10)]">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-black">Recent Activity Impact</h2>
                <p className="mt-1 text-sm leading-6 text-[#450041]/65">
                  Why recent wallet actions moved the credit score.
                </p>
              </div>
              <span className="rounded-md border border-[#00B65C] px-3 py-1 text-xs font-bold text-[#00B65C]">
                Score movement
              </span>
            </div>

            <div className="mt-5 divide-y divide-[#450041]/12">
              {activityImpacts.length > 0 ? (
                activityImpacts.map((activity) => (
                  <ActivityRow
                    key={`${activity.signature ?? activity.action}-${activity.time}`}
                    activity={activity}
                  />
                ))
              ) : (
                <p className="py-5 text-sm leading-6 text-[#450041]/65">
                  Search a wallet address to load real recent activity from Solana RPC.
                </p>
              )}
            </div>
          </section>
        ) : null}

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section className="rounded-xl border border-[#450041]/18 bg-[#450041]/5 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-black">Credit Summary</h2>
              <span className="rounded-md border border-[#00B65C] px-3 py-1 text-xs font-bold text-[#00B65C]">
                {report?.dataSource ?? "Mock preview"}
              </span>
            </div>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-[#450041]/75">
              {report?.summary ??
                "Search an address to replace the preview with a real credit report from Solana RPC signals."}
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <Metric label="Credit line" value={report?.creditLine ?? "--"} />
              <Metric label="Suggested APR" value={report?.rateEstimate ?? "--"} />
              <Metric
                label="Confidence"
                value={report ? `${Math.round(report.apiPayload.confidence * 100)}%` : "--"}
              />
            </div>
          </section>

          <section className="rounded-xl border border-[#450041]/18 bg-[#450041]/5 p-6">
            <h2 className="text-lg font-black">Live Signals</h2>
            <div className="mt-4 grid gap-3">
              <Metric label="SOL balance" value={report ? report.metrics.solBalance.toFixed(4) : "--"} />
              <Metric label="Sampled txs" value={report ? String(report.metrics.sampledTransactions) : "--"} />
              <Metric label="Token accounts" value={report ? String(report.metrics.tokenAccountCount) : "--"} />
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}

function ActivityRow({ activity }: { activity: RecentActivityImpact }) {
  const isPositive = activity.impact >= 0;
  const formattedImpact = `${isPositive ? "+" : ""}${activity.impact.toFixed(1)}`;

  return (
    <div className="grid gap-3 py-4 sm:grid-cols-[minmax(0,1fr)_86px] sm:items-center">
      <div className="flex min-w-0 items-start gap-4">
        <span
          className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-base font-black ${
            isPositive
              ? "bg-[#00B65C]/12 text-[#00B65C]"
              : "bg-[#450041]/10 text-[#450041]"
          }`}
        >
          {isPositive ? "^" : "v"}
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <p className="text-sm font-black text-[#450041]">{activity.action}</p>
            <p className="text-xs text-[#450041]/50">{activity.time}</p>
          </div>
          <p className="mt-1 text-sm leading-6 text-[#450041]/70">{activity.reason}</p>
        </div>
      </div>
      <p
        className={`text-left text-lg font-black sm:text-right ${
          isPositive ? "text-[#00B65C]" : "text-[#450041]"
        }`}
      >
        {formattedImpact}
      </p>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
  icon,
}: {
  label: string;
  value: string;
  accent: string;
  icon: string;
}) {
  return (
    <section className="rounded-xl border border-[#450041]/18 bg-[#450041]/5 p-5 shadow-[0_20px_70px_rgba(69,0,65,0.10)]">
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm text-[#450041]/65">{label}</p>
        <span className="font-mono text-lg text-[#00B65C]">{icon}</span>
      </div>
      <div className="mt-4 flex items-end gap-3">
        <p className="text-3xl font-black">{value}</p>
        <p className="pb-1 text-sm font-bold text-[#00B65C]">{accent}</p>
      </div>
    </section>
  );
}

function FactorBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-4 text-sm">
        <span className="text-[#450041]/75">{label}</span>
        <span className="font-black text-[#450041]">{value}</span>
      </div>
      <div className="h-2 rounded-full bg-[#450041]/15">
        <div
          className="h-2 rounded-full bg-[#00B65C]"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[#450041]/18 bg-[#FFFFFF] p-4">
      <p className="text-xs font-bold uppercase text-[#450041]/55">{label}</p>
      <p className="mt-2 break-words text-lg font-black text-[#00B65C]">{value}</p>
    </div>
  );
}

function factorRowsFromReport(report: CreditReport) {
  return report.factors.slice(0, 4).map((factor) => ({
    label: factor.label,
    value: Math.round((factor.value / factor.max) * 100),
  }));
}

function rankForScore(score: number) {
  if (score >= 82) return "Top 5%";
  if (score >= 68) return "Top 15%";
  if (score >= 52) return "Top 38%";
  return "Review";
}

function detedWalletKey(detectedWallet: DetectedWallet) {
  return `${detectedWallet.id}-${detectedWallet.name}`;
}
