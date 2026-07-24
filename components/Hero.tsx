"use client";

import { motion, useMotionValue } from "motion/react";
import { useRef } from "react";
import { PackRip } from "./PackRip";
import { Marquee } from "./Marquee";
import { Magnetic } from "./Magnetic";

const words = ["Give", "crypto", "as", "a", "gift."];

export function Hero() {
  const secRef = useRef<HTMLElement>(null);
  const mx = useMotionValue(-500);
  const my = useMotionValue(-500);

  function onMove(e: React.PointerEvent) {
    const el = secRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    mx.set(e.clientX - r.left);
    my.set(e.clientY - r.top);
  }

  return (
    <section
      id="top"
      ref={secRef}
      onPointerMove={onMove}
      className="relative z-10 overflow-hidden px-4 pt-12 pb-10 md:pt-20 md:pb-14"
    >
      {/* signature Stripe gradient mesh */}
      <div className="hero-gradient" aria-hidden />
      {/* cursor-follow glow */}
      <motion.div
        aria-hidden
        style={{ x: mx, y: my, background: "radial-gradient(circle, rgba(99,91,255,0.9), transparent 66%)" }}
        className="pointer-events-none absolute z-0 -ml-40 -mt-40 h-80 w-80 rounded-full opacity-20 blur-3xl"
      />

      <div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-2">
        <div className="relative z-10">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-1.5 font-mono text-[11px] font-bold uppercase tracking-wide text-gold"
          >
            <span className="text-pink">◆</span> No wallet · No fees for them · Secured on Solana
          </motion.p>

          <h1 className="font-display text-[14vw] font-semibold leading-[0.98] tracking-tight text-text md:text-7xl">
            {words.map((w, i) => (
              <motion.span
                key={w}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 * i + 0.1, type: "spring", stiffness: 240, damping: 20 }}
                className={`mr-3 inline-block ${w === "gift." ? "text-lime" : ""}`}
              >
                {w}
              </motion.span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-6 max-w-md text-lg leading-relaxed text-muted"
          >
            Wrap any token into a beautiful card and send it with a link. They open
            it in seconds — no wallet, no app, and no jargon to figure out.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <Magnetic
              href="#try"
              className="inline-flex items-center gap-1.5 rounded-full bg-lime px-7 py-3.5 text-base font-semibold text-white shadow-[var(--shadow-indigo)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-indigo-lg)]"
            >
              Create a gift →
            </Magnetic>
            <Magnetic
              href="#how"
              className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-7 py-3.5 text-base font-semibold text-ink shadow-[var(--shadow-hard-sm)] transition-colors duration-200 hover:border-lime/40 hover:text-lime"
            >
              See how it works
            </Magnetic>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.25, type: "spring", stiffness: 140, damping: 15 }}
          className="mx-auto w-full max-w-[440px]"
        >
          <PackRip gift={{ occ: "birthday", amt: "50", token: "USDC", to: "maya", from: "alex", msg: "your first crypto 🎂" }} />
        </motion.div>
      </div>

      <div className="mt-10 border-y border-line bg-surface-2 py-2.5">
        <Marquee items={["Send crypto", "No seed phrase", "Claim in seconds", "Fees on us", "Any occasion"]} />
      </div>
    </section>
  );
}
