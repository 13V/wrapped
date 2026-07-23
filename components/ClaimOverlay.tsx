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

                      {/* what now? — swap / cash out / keep */}
                      <div className="!mt-4 rounded-2xl border-2 border-ink bg-surface/70 p-3">
                        <p className="mb-2 font-mono text-[10px] font-bold uppercase tracking-wide text-muted">
                          what now?{quote != null && <span className="text-violet"> · ≈ {quote.toFixed(2)} usdc</span>}
                        </p>
                        <div className="flex flex-wrap justify-center gap-2">
                          <button
                            onClick={swapToUsdc}
                            disabled={hubBusy === "swap"}
                            className="rounded-xl border-2 border-ink bg-violet px-3.5 py-2 text-xs font-extrabold lowercase text-white shadow-[3px_3px_0_0_var(--color-lime)] transition-transform hover:-translate-y-0.5 disabled:opacity-70"
                          >
                            {hubBusy === "swap" ? "swapping…" : "swap to usdc"}
                          </button>
                          <button
                            onClick={cashOut}
                            disabled={hubBusy === "cash"}
                            className="rounded-xl border-2 border-ink bg-cyan px-3.5 py-2 text-xs font-extrabold lowercase text-ink shadow-[3px_3px_0_0_var(--color-pink)] transition-transform hover:-translate-y-0.5 disabled:opacity-70"
                          >
                            {hubBusy === "cash" ? "opening…" : "cash out 💳"}
                          </button>
                          <button
                            onClick={close}
                            className="rounded-xl border-2 border-ink bg-surface px-3.5 py-2 text-xs font-extrabold lowercase text-text transition-transform hover:-translate-y-0.5"
                          >
                            keep it
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
