"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { Keypair } from "@solana/web3.js";
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

  // Post-claim "what now?" hub: swap to USDC / cash out / keep.
  const recipientKey = useRef<Keypair | null>(null);
  const [quote, setQuote] = useState<number | null>(null);
  const [hub, setHub] = useState<{ note: string; tone: "info" | "warn"; sig?: string } | null>(null);
  const [hubBusy, setHubBusy] = useState<"" | "swap" | "cash">("");

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
        const { recipient, recipientKey: rk, lamports, sig } = await claimRealGift(decodeKey(keyStr));
        const amount = toSol(lamports);
        recipientKey.current = rk;
        setClaimed({ kind: "real", recipient, amount, sig });
        fireConfetti(0.5, 0.42);
        // fetch a live swap quote for the "what now?" hub (non-blocking)
        import("@/lib/jupiter")
          .then((j) => j.quoteSolToUsdc(amount))
          .then((q) => setQuote(q.outAmount))
          .catch(() => {});
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
    setQuote(null);
    setHub(null);
    recipientKey.current = null;
    if (location.hash.startsWith("#g=")) history.replaceState(null, "", location.pathname);
  }

  // Hub: swap the claimed SOL to USDC (mainnet execution; live quote elsewhere).
  async function swapToUsdc() {
    if (!claimed || claimed.kind !== "real" || !recipientKey.current) return;
    setHub(null);
    const { swapExecutable, swapSolToUsdc } = await import("@/lib/jupiter");
    if (!swapExecutable()) {
      setHub({
        tone: "info",
        note: `That's a live rate${quote != null ? ` (≈ ${quote.toFixed(2)} USDC)` : ""}. Swaps execute on mainnet — flip the cluster to go live.`,
      });
      return;
    }
    setHubBusy("swap");
    try {
      const sig = await swapSolToUsdc(recipientKey.current, claimed.amount);
      setHub({ tone: "info", note: `Swapped to USDC.`, sig });
    } catch (e) {
      setHub({ tone: "warn", note: e instanceof Error ? e.message : "Swap failed." });
    } finally {
      setHubBusy("");
    }
  }

  // Hub: cash out to card/bank via MoonPay's off-ramp.
  async function cashOut() {
    if (!claimed || claimed.kind !== "real") return;
    setHub(null);
    const { moonpayEnabled, openMoonPaySell } = await import("@/lib/moonpay");
    if (!moonpayEnabled()) {
      setHub({ tone: "warn", note: "Cash-out needs MoonPay keys (NEXT_PUBLIC_MOONPAY_API_KEY + MOONPAY_SECRET_KEY)." });
      return;
    }
    setHubBusy("cash");
    try {
      await openMoonPaySell({
        baseCurrencyCode: "sol",
        amount: claimed.amount,
        quoteCurrencyCode: "usd",
        refundWalletAddress: claimed.recipient,
        redirectURL: typeof window !== "undefined" ? location.origin : undefined,
      });
      setHub({ tone: "info", note: "MoonPay cash-out opened — follow it to send SOL and receive cash." });
    } catch (e) {
      setHub({ tone: "warn", note: e instanceof Error ? e.message : "Could not open MoonPay." });
    } finally {
      setHubBusy("");
    }
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
              className="font-display text-3xl font-semibold tracking-tight text-text"
            >
              <span className="italic text-pink">{gift.from || "Someone"}</span> sent you a gift 🎁
            </motion.p>

            {keyStr && (
              <span className="mt-3 inline-block rounded-full border border-violet/40 bg-violet/10 px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wide text-violet">
                Real · {cluster}
              </span>
            )}

            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotate: -6, y: 20 }}
              animate={{ opacity: 1, scale: 1, rotate: 0, y: 0 }}
              transition={{ type: "spring", stiffness: 140, damping: 14 }}
              className="mx-auto mt-6 w-[260px]"
            >
              <HoloCard gift={gift} interactive float reveal opened={!!claimed} />
            </motion.div>

            {gift.msg && <p className="mt-5 font-medium italic text-muted">&ldquo;{gift.msg}&rdquo;</p>}

            <div className="mt-7">
              {!claimed ? (
                <>
                  <button
                    onClick={claim}
                    disabled={busy}
                    className="rounded-full bg-ink px-8 py-4 text-lg font-semibold text-surface shadow-[var(--shadow-hard-sm)] transition-shadow hover:shadow-[var(--shadow-hard)] disabled:opacity-70"
                  >
                    {busy ? "Opening…" : "Open your gift →"}
                  </button>
                  {error && <p className="mt-3 font-mono text-xs font-bold text-pink">{error}</p>}
                </>
              ) : (
                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="space-y-3">
                  <div className="inline-block rounded-full bg-lime px-5 py-2.5 font-display text-xl font-semibold text-ink shadow-[var(--shadow-hard-sm)]">
                    It&apos;s yours! 🎉
                  </div>
                  {claimed.kind === "real" ? (
                    <div className="space-y-1.5">
                      <p className="text-sm text-muted">
                        {claimed.amount} SOL is now in a new wallet we made for you — fees covered.
                      </p>
                      <p className="font-mono text-[11px] text-muted">
                        Wallet {claimed.recipient.slice(0, 4)}…{claimed.recipient.slice(-4)}
                      </p>
                      <a href={`https://explorer.solana.com/tx/${claimed.sig}?cluster=${cluster}`}
                        target="_blank" rel="noreferrer"
                        className="inline-block font-mono text-[11px] font-bold text-violet underline hover:text-ink">
                        View on explorer ↗
                      </a>

                      {/* what next? — swap / cash out / keep */}
                      <div className="!mt-4 rounded-2xl border border-line bg-surface/80 p-3 shadow-[var(--shadow-hard-sm)]">
                        <p className="mb-2 font-mono text-[10px] font-bold uppercase tracking-wide text-muted">
                          What next?{quote != null && <span className="text-violet"> · ≈ {quote.toFixed(2)} USDC</span>}
                        </p>
                        <div className="flex flex-wrap justify-center gap-2">
                          <button
                            onClick={swapToUsdc}
                            disabled={hubBusy === "swap"}
                            className="rounded-full bg-violet px-4 py-2 text-xs font-semibold text-white shadow-[var(--shadow-hard-sm)] transition-transform hover:-translate-y-0.5 disabled:opacity-70"
                          >
                            {hubBusy === "swap" ? "Swapping…" : "Swap to USDC"}
                          </button>
                          <button
                            onClick={cashOut}
                            disabled={hubBusy === "cash"}
                            className="rounded-full bg-cyan px-4 py-2 text-xs font-semibold text-white shadow-[var(--shadow-hard-sm)] transition-transform hover:-translate-y-0.5 disabled:opacity-70"
                          >
                            {hubBusy === "cash" ? "Opening…" : "Cash out 💳"}
                          </button>
                          <button
                            onClick={close}
                            className="rounded-full border border-line bg-surface px-4 py-2 text-xs font-semibold text-text transition-transform hover:-translate-y-0.5"
                          >
                            Keep it
                          </button>
                        </div>
                        {hub && (
                          <div className="mt-2">
                            <p className={`font-mono text-[11px] ${hub.tone === "warn" ? "font-bold text-pink" : "text-muted"}`}>
                              {hub.note}
                            </p>
                            {hub.sig && (
                              <a href={`https://explorer.solana.com/tx/${hub.sig}?cluster=${cluster}`}
                                target="_blank" rel="noreferrer"
                                className="font-mono text-[11px] font-bold text-violet underline hover:text-ink">
                                view swap ↗
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted">
                      A new wallet ({claimed.wallet}…) was created for you — fees covered. You&apos;re all set.
                    </p>
                  )}
                </motion.div>
              )}
            </div>

            <button onClick={close} className="mt-8 text-sm font-medium text-muted underline hover:text-text">
              ← Back to Wrapped
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
