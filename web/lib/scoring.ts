export type ScoreFactor = {
  label: string;
  value: number;
  max: number;
  status: "strong" | "watch" | "weak";
  detail: string;
};

export type WalletMetrics = {
  wallet: string;
  cluster: string;
  rpcUrl: string;
  solBalance: number;
  sampledTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  successRate: number;
  activeDays: number;
  observedAgeDays: number;
  tokenAccountCount: number;
  nonZeroTokenAccounts: number;
  protocolInteractions: number;
  lastActivityAt: string | null;
  oldestSampledActivityAt: string | null;
};

export type CreditSignal = {
  label: string;
  value: string;
  tone: "positive" | "neutral" | "negative";
};

export type RecentActivityImpact = {
  signature: string | null;
  action: string;
  time: string;
  impact: number;
  reason: string;
};

export type CreditReport = {
  wallet: string;
  score: number;
  band: "Prime" | "Reliable" | "Emerging" | "High Risk";
  rateEstimate: string;
  creditLine: string;
  defaultRisk: string;
  summary: string;
  dataSource: string;
  metrics: WalletMetrics;
  factors: ScoreFactor[];
  signals: CreditSignal[];
  recentActivity: RecentActivityImpact[];
  recommendations: string[];
  apiPayload: {
    wallet: string;
    score: number;
    band: string;
    modelVersion: string;
    confidence: number;
  };
};

const modelVersion = "trust-rpc-0.2";

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function statusFor(value: number, max: number): ScoreFactor["status"] {
  const ratio = value / max;

  if (ratio >= 0.72) return "strong";
  if (ratio >= 0.45) return "watch";
  return "weak";
}

function bandFor(score: number): CreditReport["band"] {
  if (score >= 82) return "Prime";
  if (score >= 68) return "Reliable";
  if (score >= 52) return "Emerging";
  return "High Risk";
}

export function generateCreditReport(wallet: string): CreditReport {
  return generateCreditReportFromMetrics({
    wallet,
    cluster: "demo",
    rpcUrl: "local-demo",
    solBalance: 0,
    sampledTransactions: 0,
    successfulTransactions: 0,
    failedTransactions: 0,
    successRate: 0,
    activeDays: 0,
    observedAgeDays: 0,
    tokenAccountCount: 0,
    nonZeroTokenAccounts: 0,
    protocolInteractions: 0,
    lastActivityAt: null,
    oldestSampledActivityAt: null,
  });
}

export function generateCreditReportFromMetrics(metrics: WalletMetrics): CreditReport {
  const normalizedWallet = metrics.wallet.trim();
  const repayment = clamp(Math.round(metrics.successRate * 35), 0, 35);
  const liquidity = clamp(
    Math.round(Math.min(metrics.solBalance, 10) * 1.5) +
      Math.min(metrics.nonZeroTokenAccounts * 3, 15),
    0,
    30,
  );
  const accountAge = clamp(Math.round(Math.min(metrics.observedAgeDays, 365) / 14.6), 0, 25);
  const activity = clamp(
    Math.round(Math.min(metrics.sampledTransactions, 50) / 3.2) +
      Math.min(metrics.activeDays, 6),
    0,
    18,
  );
  const risk = clamp(
    Math.round((1 - metrics.successRate) * 8) +
      (metrics.failedTransactions > 4 ? 3 : 0) +
      (metrics.sampledTransactions < 4 ? 2 : 0),
    0,
    12,
  );
  const protocolBonus = clamp(Math.round(metrics.protocolInteractions / 4), 0, 6);
  const score = clamp(
    repayment + liquidity + accountAge + activity + protocolBonus - Math.floor(risk / 2),
    8,
    98,
  );
  const band = bandFor(score);

  const factors: ScoreFactor[] = [
    {
      label: "Repayment behavior",
      value: repayment,
      max: 35,
      status: statusFor(repayment, 35),
      detail: `${metrics.successfulTransactions}/${metrics.sampledTransactions} sampled transactions succeeded.`,
    },
    {
      label: "Liquidity resilience",
      value: liquidity,
      max: 30,
      status: statusFor(liquidity, 30),
      detail: `${metrics.solBalance.toFixed(4)} SOL plus ${metrics.nonZeroTokenAccounts} non-zero token accounts detected.`,
    },
    {
      label: "Wallet age",
      value: accountAge,
      max: 25,
      status: statusFor(accountAge, 25),
      detail: `${metrics.observedAgeDays} days of observed history in the sampled RPC window.`,
    },
    {
      label: "Protocol activity",
      value: activity,
      max: 18,
      status: statusFor(activity, 18),
      detail: `${metrics.sampledTransactions} sampled transactions across ${metrics.activeDays} active days.`,
    },
    {
      label: "Risk flags",
      value: risk,
      max: 12,
      status: risk <= 4 ? "strong" : risk <= 8 ? "watch" : "weak",
      detail: `${metrics.failedTransactions} failed sampled transactions and ${metrics.protocolInteractions} known protocol touches.`,
    },
  ];

  const signals: CreditSignal[] = [
    {
      label: "Suggested lending APR",
      value: score >= 82 ? "6.8%-8.4%" : score >= 68 ? "8.5%-10.9%" : score >= 52 ? "11.0%-15.5%" : "Manual review",
      tone: score >= 68 ? "positive" : score >= 52 ? "neutral" : "negative",
    },
    {
      label: "API confidence",
      value: `${clamp(45 + metrics.sampledTransactions + metrics.activeDays * 2, 45, 92)}%`,
      tone: "neutral",
    },
    {
      label: "Monitoring tier",
      value: score >= 68 ? "Eligible" : "Needs history",
      tone: score >= 68 ? "positive" : "neutral",
    },
  ];

  return {
    wallet: normalizedWallet,
    score,
    band,
    rateEstimate: signals[0].value,
    creditLine: score >= 82 ? "Up to 12,000 USDC" : score >= 68 ? "Up to 6,500 USDC" : score >= 52 ? "Up to 2,000 USDC" : "Collateral-only",
    defaultRisk: score >= 82 ? "Low" : score >= 68 ? "Moderate" : score >= 52 ? "Elevated" : "High",
    summary:
      metrics.sampledTransactions === 0
        ? "No recent on-chain activity was found for this wallet through the configured Solana RPC."
        : score >= 68
          ? "Live RPC signals show enough wallet history to support risk-adjusted lending terms."
          : "Live RPC signals show limited or uneven history, so protocols should keep terms conservative.",
    dataSource: `${metrics.cluster} RPC`,
    metrics,
    factors,
    signals,
    recentActivity: [],
    recommendations: [
      "Maintain collateral buffers above protocol liquidation thresholds.",
      "Close small borrow positions cleanly to build repayment evidence.",
      "Keep stablecoin inflows and outflows consistent for at least 30 days.",
    ],
    apiPayload: {
      wallet: normalizedWallet,
      score,
      band,
      modelVersion,
      confidence: Number(signals[1].value.replace("%", "")) / 100,
    },
  };
}
