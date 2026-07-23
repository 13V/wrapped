"use client";

// Jupiter swap: let a recipient turn their gifted SOL into USDC (or any SPL
// token) at the best route across every Solana DEX. Quotes are live from
// Jupiter's API; execution runs on mainnet (that's where the liquidity is).
//
// We take an optional platform fee on the swap (another revenue line) via
// Jupiter's `platformFeeBps` — set NEXT_PUBLIC_WRAPPED_SWAP_FEE_BPS.

import { CLUSTER, conn } from "./solana";

const JUP_API = process.env.NEXT_PUBLIC_JUPITER_API || "https://lite-api.jup.ag/swap/v1";
export const SWAP_FEE_BPS = Number(process.env.NEXT_PUBLIC_WRAPPED_SWAP_FEE_BPS ?? "0");

export const SOL_MINT = "So11111111111111111111111111111111111111112";
export const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"; // mainnet USDC
export const USDC_DECIMALS = 6;

/** Swaps only execute where there's real liquidity — i.e. mainnet. */
export function swapExecutable(): boolean {
  return CLUSTER === "mainnet-beta" || CLUSTER === "mainnet";
}

export interface Quote {
  outAmount: number; // human units of the output token
  outRaw: string; // raw integer string
  priceImpactPct: number;
  route: unknown; // opaque Jupiter quoteResponse, passed back to /swap
}

/** Live quote for swapping `solAmount` SOL into USDC. */
export async function quoteSolToUsdc(solAmount: number): Promise<Quote> {
  const lamports = Math.round(solAmount * 1e9);
  const qs = new URLSearchParams({
    inputMint: SOL_MINT,
    outputMint: USDC_MINT,
    amount: String(lamports),
    slippageBps: "50",
  });
  if (SWAP_FEE_BPS > 0) qs.set("platformFeeBps", String(SWAP_FEE_BPS));

  const res = await fetch(`${JUP_API}/quote?${qs.toString()}`);
  if (!res.ok) throw new Error(`Jupiter quote failed (${res.status})`);
  const q = await res.json();
  return {
    outRaw: q.outAmount,
    outAmount: Number(q.outAmount) / 10 ** USDC_DECIMALS,
    priceImpactPct: Number(q.priceImpactPct || 0),
    route: q,
  };
}

/**
 * Execute a SOL→USDC swap from `key`'s wallet (mainnet only). Fetches a fresh
 * swap transaction from Jupiter, signs it with the recipient key, and sends it.
 * Returns the signature. Throws with a clear message off mainnet.
 */
export async function swapSolToUsdc(
  key: import("@solana/web3.js").Keypair,
  solAmount: number,
): Promise<string> {
  if (!swapExecutable()) {
    throw new Error("Swaps run on mainnet — set the app's cluster to mainnet-beta.");
  }
  const { VersionedTransaction } = await import("@solana/web3.js");
  const { route } = await quoteSolToUsdc(solAmount);

  const res = await fetch(`${JUP_API}/swap`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      quoteResponse: route,
      userPublicKey: key.publicKey.toBase58(),
      wrapAndUnwrapSol: true,
      dynamicComputeUnitLimit: true,
    }),
  });
  if (!res.ok) throw new Error(`Jupiter swap build failed (${res.status})`);
  const { swapTransaction } = await res.json();

  const tx = VersionedTransaction.deserialize(
    Uint8Array.from(atob(swapTransaction), (c) => c.charCodeAt(0)),
  );
  tx.sign([key]);
  const sig = await conn().sendRawTransaction(tx.serialize());
  await conn().confirmTransaction(sig, "confirmed");
  return sig;
}
