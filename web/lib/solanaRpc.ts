import {
  generateCreditReportFromMetrics,
  type CreditReport,
  type RecentActivityImpact,
  type WalletMetrics,
} from "@/lib/scoring";

const LAMPORTS_PER_SOL = 1_000_000_000;
const DEFAULT_RPC_URL = "https://api.mainnet-beta.solana.com";
const DEFAULT_CLUSTER = "mainnet-beta";
const DEVNET_RPC_URL = "https://api.devnet.solana.com";
const SYSTEM_PROGRAM_ID = "11111111111111111111111111111111";
const TOKEN_PROGRAM_ID = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
const TOKEN_2022_PROGRAM_ID = "TokenzQdBNbLqP5VEhdkAS6EPFZSrHKU94m7UJ6P4hW";

const KNOWN_DEFI_PROGRAMS = new Set([
  "JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4",
  "whirLbMiicVdio4qvUfM5KAg6Ct8V3tPsg3fX7rfd6d",
  "9W959DqEETiGZocYWCQPaJ6WeA86Q5xJ9eQitQjY8Qh",
  "LendZqTs7gn5CTSJU1jWKhKuVpjJGom45nnwPb2AMTi",
  "Port7uDYB3wk6rLnxLLHb8Q6shnAV8D9Efx8kyvXzJ5",
  "So1endDq2YkqhipRh3WViPa8hdiSpxWy6z3Z6tMCpAo",
  "marginfi4nnqxXyLzAys3oUu9jT9gqgukAcQMfCuwk",
  "KLend2g3kuT7tVwpKrr9J1iTQrx8rjWQoU1u4tBz8n",
]);

type RpcEnvelope<T> = {
  result?: T;
  error?: {
    code: number;
    message: string;
  };
};

type SignatureInfo = {
  signature: string;
  blockTime: number | null;
  err: unknown | null;
};

type BalanceResult = {
  value: number;
};

type AccountInfoResult = {
  value: {
    executable: boolean;
    owner: string;
  } | null;
};

type ParsedTokenAccount = {
  account: {
    data: {
      parsed?: {
        info?: {
          tokenAmount?: {
            uiAmount?: number | null;
          };
        };
      };
    };
  };
};

type ParsedTransaction = {
  blockTime: number | null;
  meta: {
    err: unknown | null;
  } | null;
  transaction: {
    message: {
      accountKeys: Array<string | { pubkey?: string }>;
      instructions?: Array<{
        programId?: string;
      }>;
    };
  };
};

type ClusterName = "mainnet-beta" | "devnet";

type AnalysisOptions = {
  cluster?: ClusterName;
};

function normalizeCluster(value: string | null | undefined): ClusterName {
  return value === "devnet" ? "devnet" : "mainnet-beta";
}

function getRpcUrl(cluster = normalizeCluster(getClusterName())) {
  if (cluster === "devnet") {
    return process.env.SOLANA_DEVNET_RPC_URL || DEVNET_RPC_URL;
  }

  return process.env.SOLANA_RPC_URL || process.env.NEXT_PUBLIC_SOLANA_RPC_URL || DEFAULT_RPC_URL;
}

function getClusterName() {
  return process.env.SOLANA_CLUSTER || process.env.NEXT_PUBLIC_SOLANA_CLUSTER || DEFAULT_CLUSTER;
}

export function isLikelySolanaAddress(value: string) {
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(value.trim());
}

async function rpc<T>(rpcUrl: string, method: string, params: unknown[] = []): Promise<T> {
  const response = await fetch(rpcUrl, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: `${method}-${Date.now()}`,
      method,
      params,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Solana RPC ${method} failed with HTTP ${response.status}.`);
  }

  const payload = (await response.json()) as RpcEnvelope<T>;

  if (payload.error) {
    throw new Error(`Solana RPC ${method} failed: ${payload.error.message}`);
  }

  if (payload.result === undefined) {
    throw new Error(`Solana RPC ${method} returned no result.`);
  }

  return payload.result;
}

async function getTokenAccounts(rpcUrl: string, wallet: string, programId: string) {
  const result = await rpc<{ value: ParsedTokenAccount[] }>(rpcUrl, "getTokenAccountsByOwner", [
    wallet,
    { programId },
    { encoding: "jsonParsed" },
  ]);

  return result.value;
}

function extractProgramIds(transaction: ParsedTransaction | null) {
  if (!transaction) return [];

  const accountKeys = transaction.transaction.message.accountKeys
    .map((key) => (typeof key === "string" ? key : key.pubkey))
    .filter((key): key is string => Boolean(key));
  const instructionPrograms =
    transaction.transaction.message.instructions
      ?.map((instruction) => instruction.programId)
      .filter((programId): programId is string => Boolean(programId)) ?? [];

  return [...accountKeys, ...instructionPrograms];
}

export async function analyzeSolanaWallet(
  wallet: string,
  options: AnalysisOptions = {},
): Promise<CreditReport> {
  const normalizedWallet = wallet.trim();
  const cluster = normalizeCluster(options.cluster ?? getClusterName());
  const rpcUrl = getRpcUrl(cluster);

  if (!isLikelySolanaAddress(normalizedWallet)) {
    throw new Error("Enter a valid Solana wallet address.");
  }

  const [accountInfo, balance, signatures, tokenAccounts, token2022Accounts] = await Promise.all([
    rpc<AccountInfoResult>(rpcUrl, "getAccountInfo", [
      normalizedWallet,
      { encoding: "base64" },
    ]),
    rpc<BalanceResult>(rpcUrl, "getBalance", [normalizedWallet]),
    rpc<SignatureInfo[]>(rpcUrl, "getSignaturesForAddress", [
      normalizedWallet,
      { limit: 50 },
    ]),
    getTokenAccounts(rpcUrl, normalizedWallet, TOKEN_PROGRAM_ID).catch(() => []),
    getTokenAccounts(rpcUrl, normalizedWallet, TOKEN_2022_PROGRAM_ID).catch(() => []),
  ]);

  if (accountInfo.value?.executable) {
    throw new Error("This address is an executable Solana program. Enter a user wallet address.");
  }

  const transactions = await Promise.all(
    signatures.slice(0, 20).map((item) =>
      rpc<ParsedTransaction | null>(rpcUrl, "getTransaction", [
        item.signature,
        {
          encoding: "jsonParsed",
          maxSupportedTransactionVersion: 0,
        },
      ]).catch(() => null),
    ),
  );

  const successfulTransactions = signatures.filter((item) => item.err === null).length;
  const failedTransactions = signatures.length - successfulTransactions;
  const blockTimes = signatures
    .map((item) => item.blockTime)
    .filter((blockTime): blockTime is number => typeof blockTime === "number");
  const activeDays = new Set(
    blockTimes.map((blockTime) => new Date(blockTime * 1000).toISOString().slice(0, 10)),
  ).size;
  const newestBlockTime = blockTimes[0] ?? null;
  const oldestBlockTime = blockTimes.at(-1) ?? null;
  const observedAgeDays =
    newestBlockTime && oldestBlockTime
      ? Math.max(0, Math.ceil((newestBlockTime - oldestBlockTime) / 86_400))
      : 0;
  const allTokenAccounts = [...tokenAccounts, ...token2022Accounts];
  const nonZeroTokenAccounts = allTokenAccounts.filter((tokenAccount) => {
    const amount = tokenAccount.account.data.parsed?.info?.tokenAmount?.uiAmount;
    return typeof amount === "number" && amount > 0;
  }).length;
  const protocolInteractions = transactions.reduce((count, transaction) => {
    const touchedKnownProgram = extractProgramIds(transaction).some((programId) =>
      KNOWN_DEFI_PROGRAMS.has(programId),
    );

    return touchedKnownProgram ? count + 1 : count;
  }, 0);

  const metrics: WalletMetrics = {
    wallet: normalizedWallet,
    cluster,
    rpcUrl,
    solBalance: balance.value / LAMPORTS_PER_SOL,
    sampledTransactions: signatures.length,
    successfulTransactions,
    failedTransactions,
    successRate: signatures.length === 0 ? 0 : successfulTransactions / signatures.length,
    activeDays,
    observedAgeDays,
    tokenAccountCount: allTokenAccounts.length,
    nonZeroTokenAccounts,
    protocolInteractions,
    lastActivityAt: newestBlockTime ? new Date(newestBlockTime * 1000).toISOString() : null,
    oldestSampledActivityAt: oldestBlockTime
      ? new Date(oldestBlockTime * 1000).toISOString()
      : null,
  };

  const report = generateCreditReportFromMetrics(metrics);
  return {
    ...report,
    recentActivity: buildRecentActivity(signatures, transactions),
  };
}

function buildRecentActivity(
  signatures: SignatureInfo[],
  transactions: Array<ParsedTransaction | null>,
): RecentActivityImpact[] {
  if (signatures.length === 0) {
    return [
      {
        signature: null,
        action: "No recent activity found",
        time: "No activity",
        impact: -0.6,
        reason:
          "The RPC returned no recent signatures, so the model has less behavior to score.",
      },
    ];
  }

  return signatures.slice(0, 4).map((signatureInfo, index) => {
    const transaction = transactions[index] ?? null;
    const programIds = extractProgramIds(transaction);
    const hasKnownDefi = programIds.some((programId) => KNOWN_DEFI_PROGRAMS.has(programId));
    const hasTokenProgram = programIds.some(
      (programId) => programId === TOKEN_PROGRAM_ID || programId === TOKEN_2022_PROGRAM_ID,
    );
    const isSystemTransfer = programIds.includes(SYSTEM_PROGRAM_ID);
    const failed = signatureInfo.err !== null || transaction?.meta?.err !== null;

    if (failed) {
      return {
        signature: signatureInfo.signature,
        action: "Failed transaction",
        time: formatRelativeBlockTime(signatureInfo.blockTime),
        impact: -0.4,
        reason:
          "Failed transactions reduce execution reliability in the sampled activity window.",
      };
    }

    if (hasKnownDefi) {
      return {
        signature: signatureInfo.signature,
        action: "DeFi protocol interaction",
        time: formatRelativeBlockTime(signatureInfo.blockTime),
        impact: 0.5,
        reason:
          "Known DeFi program usage gives the model more lending and liquidity context.",
      };
    }

    if (hasTokenProgram) {
      return {
        signature: signatureInfo.signature,
        action: "Token account activity",
        time: formatRelativeBlockTime(signatureInfo.blockTime),
        impact: 0.3,
        reason:
          "Token activity helps show active wallet management and available liquidity signals.",
      };
    }

    return {
      signature: signatureInfo.signature,
      action: isSystemTransfer ? "SOL transfer" : "Successful wallet transaction",
      time: formatRelativeBlockTime(signatureInfo.blockTime),
      impact: 0.2,
      reason:
        "A successful recent transaction improves confidence that the wallet is active and usable.",
    };
  });
}

function formatRelativeBlockTime(blockTime: number | null) {
  if (!blockTime) return "Recent";

  const diffMs = Date.now() - blockTime * 1000;
  const diffHours = Math.max(1, Math.round(diffMs / 3_600_000));
  if (diffHours < 24) return `${diffHours} hours ago`;

  return `${Math.round(diffHours / 24)} days ago`;
}
