import type { OccasionKey } from "./occasions";

export interface Gift {
  occ: OccasionKey;
  amt: string;
  token: string;
  to: string;
  from: string;
  msg: string;
  /** custom token (gifted by contract address): logo URL + mint */
  logo?: string;
  mint?: string;
}

export function formatAmount(a: string | number): string {
  const n = typeof a === "number" ? a : parseFloat(a) || 0;
  if (n >= 1000) return n.toLocaleString("en-US");
  return Number.isInteger(n) ? String(n) : n.toFixed(2);
}

/** base64url encode a gift into a link fragment (never hits a server). */
export function encodeGift(g: Gift): string {
  const json = JSON.stringify(g);
  const b64 = btoa(String.fromCharCode(...new TextEncoder().encode(json)));
  return b64.replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

export function decodeGift(s: string): Gift | null {
  try {
    const b64 = s.replaceAll("-", "+").replaceAll("_", "/");
    const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    return null;
  }
}

// ---- platform fee policy (the revenue skim) --------------------------------
// Pure + dependency-free so the composer can preview the fee without loading
// web3. lib/solana.ts charges exactly this on-chain at wrap time.
export const FEE_BPS = Number(process.env.NEXT_PUBLIC_WRAPPED_FEE_BPS ?? "150"); // 1.5%
export const FEE_FLAT_SOL = Number(process.env.NEXT_PUBLIC_WRAPPED_FEE_FLAT_SOL ?? "0.001");

/** What Wrapped charges the sender on top of the gift, in SOL. */
export function quoteFeeSol(giftSol: number): number {
  const g = Math.max(giftSol || 0, 0);
  return FEE_FLAT_SOL + (g * FEE_BPS) / 10000;
}

/** Build the shareable link. A `key` fragment marks a real on-chain gift. */
export function buildGiftLink(g: Gift, key?: string): string {
  if (typeof window === "undefined") return "";
  const base = `${location.origin}${location.pathname}#g=${encodeGift(g)}`;
  return key ? `${base}&k=${key}` : base;
}

/** Pull the gift metadata (`g`) and optional bearer key (`k`) out of a hash. */
export function parseGiftHash(hash: string): { gift: Gift | null; key: string | null } {
  const g = hash.match(/[#&]g=([A-Za-z0-9_-]+)/);
  const k = hash.match(/[#&]k=([A-Za-z0-9_-]+)/);
  return { gift: g ? decodeGift(g[1]) : null, key: k ? k[1] : null };
}
