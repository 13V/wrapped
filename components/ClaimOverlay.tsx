"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { HoloCard } from "./HoloCard";
import { decodeGift, type Gift } from "@/lib/gift";
import { fireConfetti } from "@/lib/confetti";

export function ClaimOverlay() {
  const [gift, setGift] = useState<Gift | null>(null);
  const [claimed, setClaimed] = useState(false);
  const [wallet, setWallet] = useState("");

  useEffect(() => {
    const read = () => {
      const m = location.hash.match(/#g=([A-Za-z0-9_-]+)/);
      if (m) {
        const g = decodeGift(m[1]);
        if (g) { setGift(g); setClaimed(false); }
      }
    };
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, []);

  function claim() {
    const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
    const w = Array.from(crypto.getRandomValues(new Uint8Array(16)), (b) => chars[b % chars.length]).join("");
    setWallet(w.slice(0, 20));
    setClaimed(true);
    fireConfetti(0.5, 0.42);
  }
  function close() {
    setGift(null);
    if (location.hash.startsWith("#g=")) history.replaceState(null, "", location.pathname);
  }

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
                <button
                  onClick={claim}
                  className="rounded-2xl border-2 border-ink bg-lime px-8 py-4 font-display text-xl font-black lowercase text-ink shadow-[6px_6px_0_0_var(--color-pink)] transition-transform hover:-translate-y-1"
                >
                  claim it →
                </button>
              ) : (
                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="space-y-3">
                  <div className="inline-block rotate-[-2deg] rounded-xl border-2 border-ink bg-lime px-5 py-2.5 font-display text-xl font-black lowercase text-ink shadow-[4px_4px_0_0_var(--color-cyan)]">
                    claimed — it&apos;s yours! 🎉
                  </div>
                  <p className="font-mono text-xs text-muted">
                    wallet {wallet}… made for you · we covered the gas · you&apos;re set.
                  </p>
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
