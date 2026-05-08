import { NextResponse } from "next/server";
import { analyzeSolanaWallet } from "@/lib/solanaRpc";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const wallet = searchParams.get("wallet");
  const cluster = searchParams.get("cluster") === "devnet" ? "devnet" : "mainnet-beta";

  if (!wallet) {
    return NextResponse.json(
      { error: "Missing required wallet query parameter." },
      { status: 400 },
    );
  }

  try {
    return NextResponse.json(await analyzeSolanaWallet(wallet, { cluster }));
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to analyze this wallet through Solana RPC.",
      },
      { status: 422 },
    );
  }
}
