"use client";

// Resolve any Solana token by its contract address (mint) into display
// metadata, via Jupiter's token search. Lets a sender gift ANY SPL token, not
// just the presets.

const JUP_TOKENS = process.env.NEXT_PUBLIC_JUPITER_TOKENS_API || "https://lite-api.jup.ag/tokens/v2";

export interface ResolvedToken {
  mint: string;
  symbol: string;
  name: string;
  logo: string;
  decimals: number;
}

/** A base58 Solana address is ~32–44 chars, no 0/O/I/l. */
export function looksLikeMint(s: string): boolean {
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(s.trim());
}

/** Look up a token by mint address (or symbol/name). Returns null if unknown. */
export async function resolveToken(query: string): Promise<ResolvedToken | null> {
  const q = query.trim();
  if (!q) return null;
  const res = await fetch(`${JUP_TOKENS}/search?query=${encodeURIComponent(q)}`);
  if (!res.ok) return null;
  const list = await res.json();
  if (!Array.isArray(list) || list.length === 0) return null;
  // Prefer an exact mint match when a full address was pasted.
  const hit = list.find((t: { id?: string }) => t.id === q) ?? list[0];
  return {
    mint: hit.id,
    symbol: String(hit.symbol || "TOKEN").toUpperCase().slice(0, 10),
    name: hit.name || hit.symbol || "Token",
    logo: hit.icon || "",
    decimals: Number(hit.decimals ?? 0),
  };
}
