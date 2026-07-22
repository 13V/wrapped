import type { OccasionKey } from "./occasions";

export interface Gift {
  occ: OccasionKey;
  amt: string;
  token: string;
  to: string;
  from: string;
  msg: string;
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
