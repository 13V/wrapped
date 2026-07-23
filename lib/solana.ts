"use client";

// Real, non-custodial gifting on Solana — the "bearer link" model.
//
// wrap:  mint a throwaway keypair, fund it with real SOL. its secret key
//        travels ONLY in the link fragment (never a server). the link *is*
//        the money — whoever opens it controls the funds.
// claim: the recipient's browser loads that key and sweeps the balance into a
//        fresh wallet made on the spot. no app, no seed phrase, no gas — the
//        gift key pays its own claim fee (funded with a little extra dust).
//
// Defaults to devnet so the whole flow runs on real infrastructure with play
// money. Point NEXT_PUBLIC_SOLANA_RPC at a local validator or mainnet to move.

import { Buffer } from "buffer";
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";

// web3.js reaches for a global Buffer in the browser; Next/Turbopack doesn't
// provide one, so polyfill it once on the client.
if (typeof globalThis !== "undefined" && !(globalThis as { Buffer?: unknown }).Buffer) {
  (globalThis as { Buffer?: unknown }).Buffer = Buffer;
}

export const RPC_URL =
  process.env.NEXT_PUBLIC_SOLANA_RPC || "https://api.devnet.solana.com";
export const CLUSTER = process.env.NEXT_PUBLIC_SOLANA_CLUSTER || "devnet";
/** flat lamport cost of a 1-signature transfer — what the claim tx pays. */
export const FEE_LAMPORTS = 5000;

let _conn: Connection | null = null;
export function conn(): Connection {
  return (_conn ??= new Connection(RPC_URL, "confirmed"));
}

export const toSol = (lamports: number) => lamports / LAMPORTS_PER_SOL;
export const solToLamports = (sol: number) => Math.round(sol * LAMPORTS_PER_SOL);

const b64url = (b: Buffer) =>
  b.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

/** serialize a keypair's 64-byte secret into a URL-safe link fragment. */
export function encodeKey(kp: Keypair): string {
  return b64url(Buffer.from(kp.secretKey));
}

export function decodeKey(s: string): Keypair {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/");
  return Keypair.fromSecretKey(new Uint8Array(Buffer.from(b64, "base64")));
}

export function explorerTx(sig: string): string {
  return `https://explorer.solana.com/tx/${sig}${clusterQuery()}`;
}
export function explorerAddr(addr: string): string {
  return `https://explorer.solana.com/address/${addr}${clusterQuery()}`;
}
function clusterQuery(): string {
  if (CLUSTER === "devnet") return "?cluster=devnet";
  if (CLUSTER === "testnet") return "?cluster=testnet";
  if (CLUSTER === "mainnet-beta" || CLUSTER === "mainnet") return "";
  // local/custom validator
  return `?cluster=custom&customUrl=${encodeURIComponent(RPC_URL)}`;
}

export async function getBalanceSol(addr: string | PublicKey): Promise<number> {
  const pub = typeof addr === "string" ? new PublicKey(addr) : addr;
  return toSol(await conn().getBalance(pub));
}

async function confirm(sig: string): Promise<void> {
  const bh = await conn().getLatestBlockhash();
  await conn().confirmTransaction({ signature: sig, ...bh }, "confirmed");
}

/**
 * Create a real on-chain SOL gift. Funds a throwaway "link key" from the
 * cluster faucet with the gift amount plus enough dust to cover the eventual
 * claim fee, so the recipient truly needs nothing.
 */
export async function createRealGift(
  sol: number,
): Promise<{ key: Keypair; lamports: number; sig: string; address: string }> {
  const c = conn();
  const key = Keypair.generate();
  const lamports = solToLamports(sol);
  const sig = await c.requestAirdrop(key.publicKey, lamports + FEE_LAMPORTS);
  await confirm(sig);
  return { key, lamports, sig, address: key.publicKey.toBase58() };
}

/**
 * Claim a real gift: sweep the link key's whole balance (minus the tx fee it
 * pays itself) into a brand-new recipient wallet. Returns the new wallet and
 * the settling signature.
 */
export async function claimRealGift(
  key: Keypair,
): Promise<{ recipient: string; lamports: number; sig: string }> {
  const c = conn();
  const bal = await c.getBalance(key.publicKey);
  const lamports = bal - FEE_LAMPORTS;
  if (lamports <= 0) throw new Error("This gift has already been claimed.");

  const recipient = Keypair.generate();
  const tx = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: key.publicKey,
      toPubkey: recipient.publicKey,
      lamports,
    }),
  );
  const sig = await sendAndConfirmTransaction(c, tx, [key]);
  return { recipient: recipient.publicKey.toBase58(), lamports, sig };
}
