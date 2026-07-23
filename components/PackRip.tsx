"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { HoloCard } from "./HoloCard";
import { fireConfetti } from "@/lib/confetti";
import type { Gift } from "@/lib/gift";

/** A foil pack you rip open to reveal the holographic card inside. */
export function PackRip({ gift }: { gift: Gift }) {
  const [ripped, setRipped] = useState(false);
  const reduce = useReducedMotion();

  function rip() {
    if (ripped) return;
    setRipped(true);
    fireConfetti(0.78, 0.42);
  }

  return (
    <div className="relative mx-auto flex aspect-[5/7] w-full max-w-[300px] items-center justify-center">
      {/* the card underneath */}
      <motion.div
        initial={false}
        animate={ripped ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.82, y: 26 }}
        transition={{ delay: ripped ? 0.18 : 0, type: "spring", stiffness: 150, damping: 15 }}
        className="absolute inset-0"
      >
        <HoloCard gift={gift} interactive float reveal={ripped} />
      </motion.div>

      {/* the sealed foil pack */}
      <AnimatePresence>
        {!ripped && (
          <motion.button
            onClick={rip}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -160, rotate: -22, scale: 0.92, transition: { duration: 0.5, ease: "easeIn" } }}
            className="absolute inset-0 cursor-pointer"
            aria-label="Rip open the pack"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* pack body */}
            <div
              className="relative h-full w-full overflow-hidden rounded-[26px] border-[3px] border-white/15 shadow-[0_26px_60px_-20px_rgba(122,91,255,0.45)]"
              style={{ background: "linear-gradient(150deg, #150e28, #0b0714)" }}
            >
              <div className="holo-bands absolute inset-0 opacity-70 mix-blend-screen" />
              <div className="foil-tex absolute inset-0" />
              <div className="holo-glitter absolute inset-0 opacity-40 mix-blend-screen" />
              {/* perforated tear line near the top */}
              <div className="absolute inset-x-0 top-[22%] z-10 flex items-center justify-between px-1">
                <span className="text-lg">✂</span>
                <div
                  className="mx-1 h-0 flex-1"
                  style={{ borderTop: "3px dashed rgba(255,255,255,0.55)" }}
                />
                <span className="rotate-90 text-lg">✂</span>
              </div>
              {/* label */}
              <div className="relative z-10 flex h-full flex-col items-center justify-center gap-3 text-center text-white [text-shadow:0_2px_10px_rgba(0,0,0,0.5)]">
                <span className="font-display text-3xl font-semibold tracking-wide">Wrapped</span>
                <span className="rounded-full border border-white/60 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest">
                  A gift for you
                </span>
                <motion.span
                  animate={reduce ? undefined : { scale: [1, 1.06, 1] }}
                  transition={{ duration: 1.6, repeat: Infinity }}
                  className="mt-2 rounded-full bg-lime px-5 py-2 font-display text-sm font-semibold text-ink shadow-[var(--shadow-hard-sm)]"
                  style={{ color: "#221c17" }}
                >
                  Tap to open ✦
                </motion.span>
              </div>
            </div>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
