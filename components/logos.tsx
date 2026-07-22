/** Custom brand marks — hand-authored SVG, no external assets. */

/** The Solana logomark (three sheared bars) with the signature gradient. */
export function SolanaMark({ className = "" }: { className?: string }) {
  const id = "wsol-grad";
  return (
    <svg viewBox="0 0 101 64" className={className} fill="none" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="64" x2="101" y2="0" gradientUnits="userSpaceOnUse">
          <stop stopColor="#9945FF" />
          <stop offset="1" stopColor="#14F195" />
        </linearGradient>
      </defs>
      <g fill={`url(#${id})`}>
        <path d="M16 0 H101 L85 16 H0 Z" />
        <path d="M16 24 H101 L85 40 H0 Z" />
        <path d="M16 48 H101 L85 64 H0 Z" />
      </g>
    </svg>
  );
}

/** Per-token accent + short label, for the on-card token chip. */
export const TOKENS: Record<string, { color: string; ring: string }> = {
  SOL: { color: "#14F195", ring: "#9945FF" },
  USDC: { color: "#2775CA", ring: "#ffffff" },
  BONK: { color: "#FFAA00", ring: "#ffffff" },
  WIF: { color: "#E8A0BF", ring: "#ffffff" },
};

/** A tiny coin chip: the Solana mark for SOL, a brand-color coin otherwise. */
export function TokenChip({ symbol }: { symbol: string }) {
  const t = TOKENS[symbol] ?? { color: "#ffffff", ring: "#ffffff" };
  return (
    <span className="inline-flex items-center gap-1.5">
      {symbol === "SOL" ? (
        <span className="grid size-4 place-items-center rounded-full bg-[#0b0714] p-[3px] ring-1 ring-white/40">
          <SolanaMark className="h-full w-full" />
        </span>
      ) : (
        <span
          className="size-4 rounded-full ring-1 ring-white/40"
          style={{ background: t.color }}
        />
      )}
      <span className="font-mono text-sm font-bold opacity-90">{symbol}</span>
    </span>
  );
}
