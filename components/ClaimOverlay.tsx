"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { HoloCard } from "./HoloCard";
import { parseGiftHash, type Gift } from "@/lib/gift";
import { fireConfetti } from "@/lib/confetti";

type Claimed =
  | { kind: "demo"; wallet: string }
  | { kind: "real"; recipient: string; amount: number; sig: string };

export function ClaimOverlay() {
  const [gift, setGift] = useState<Gift | null>(null);
  const [keyStr, setKeyStr] = useState<string | null>(null);
  const [claimed, setClaimed] = useState<Claimed | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const read = () => {
      const { gift: g, key } = parseGiftHash(location.hash);
      if (g) {
        setGift(g);
        setKeyStr(key);
        setClaimed(null);
        setError("");
      }
    };
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, []);

  async function claim() {
    setError("");
    // Real gift: sweep the link key into a fresh wallet on-chain.
    if (keyStr) {
      setBusy(true);
      try {
        const { decodeKey, claimRealGift, toSol } = await import("@/lib/solana");
        const { recipient, lamports, sig } = await claimRealGift(decodeKey(keyStr));
        setClaimed({ kind: "real", recipient, amount: toSol(lamports), sig });
        fireConfetti(0.5, 0.42);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Claim failed — try again.");
      } finally {
        setBusy(false);
      }
      return;
    }
    // Demo gift: no chain, just the celebration.
    const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
    const w = Array.from(crypto.getRandomValues(new Uint8Array(16)), (b) => chars[b % chars.length]).join("");
    setClaimed({ kind: "demo", wallet: w.slice(0, 20) });
    fireConfetti(0.5, 0.42);
  }

  function close() {
    setGift(null);
    setKeyStr(null);
    if (location.hash.startsWith("#g=")) history.replaceState(null, "", location.pathname);
  }

  const cluster = process.env.NEXT_PUBLIC_SOLANA_CLUSTER || "devnet";

  return (
    <AnimatePresence>
      {gift && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] grid place-items-center overflow-y-auto bg-base/95 px-5 py-10 backdrop-blur-md"
        >
          <div className="w-full max-w-sm text-center">
            <motion.p
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="font-display text-3xl font-black lowercase tracking-tight text-text"
            >
              <span className="text-pink [text-shadow:2px_0_var(--color-cyan),-2px_0_var(--color-lime)]">{gift.from || "someone"}</span> sent you a gift 🎁
            </motion.p>

            {keyStr && (
              <span className="mt-3 inline-block rounded-md border border-violet/40 bg-violet/10 px-2 py-0.5 font-mono text-[10px] font-black uppercase tracking-wide text-violet">
                ⚡ real · {cluster}
              </span>
            )}

            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotate: -6, y: 20 }}
              animate={{ opacity: 1, scale: 1, rotate: 0, y: 0 }}
              transition={{ type: "spring", stiffness: 140, damping: 14 }}
              className="mx-auto mt-6 w-[260px]"
            >
              <HoloCard gift={gift} interactive float reveal />
            </motion.div>

            {gift.msg && <p className="mt-5 font-medium italic text-muted">&ldquo;{gift.msg}&rdquo;</p>}

            <div className="mt-7">
              {!claimed ? (
                <>
                  <button
                    onClick={claim}
                    disabled={busy}
                    className="rounded-2xl border-2 border-ink bg-lime px-8 py-4 font-display text-xl font-black lowercase text-ink shadow-[6px_6px_0_0_var(--color-pink)] transition-transform hover:-translate-y-1 disabled:opacity-70"
                  >
                    {busy ? "claiming on-chain…" : "claim it →"}
                  </button>
                  {error && <p className="mt-3 font-mono text-xs font-bold text-pink">{error}</p>}
                </>
              ) : (
                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="space-y-3">
                  <div className="inline-block rotate-[-2deg] rounded-xl border-2 border-ink bg-lime px-5 py-2.5 font-display text-xl font-black lowercase text-ink shadow-[4px_4px_0_0_var(--color-cyan)]">
                    claimed — it&apos;s yours! 🎉
                  </div>
                  {claimed.kind === "real" ? (
                    <div className="space-y-1.5">
                      <p className="font-mono text-xs text-muted">
                        {claimed.amount} SOL swept to a fresh wallet made for you · gas covered.
                      </p>
                      <p className="font-mono text-[11px] text-muted">
                        wallet {claimed.recipient.slice(0, 4)}…{claimed.recipient.slice(-4)}
                      </p>
                      <a href={`https://explorer.solana.com/tx/${claimed.sig}?cluster=${cluster}`}
                        target="_blank" rel="noreferrer"
                        className="inline-block font-mono text-[11px] font-bold text-violet underline hover:text-ink">
                        view the claim on explorer ↗
                      </a>
                    </div>
                  ) : (
                    <p className="font-mono text-xs text-muted">
                      wallet {claimed.wallet}… made for you · we covered the gas · you&apos;re set.
                    </p>
                  )}
                </motion.div>
              )}
            </div>

            <button onClick={close} className="mt-8 font-mono text-sm font-bold lowercase text-muted underline hover:text-text">
              ← back to wrapped
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
