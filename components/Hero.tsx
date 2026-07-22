"use client";

import { motion, useMotionValue } from "motion/react";
import { useRef } from "react";
import { PackRip } from "./PackRip";
import { Marquee } from "./Marquee";
import { Magnetic } from "./Magnetic";

const words = ["gift", "crypto", "that", "actually", "slaps."];

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
      className="relative z-10 overflow-hidden px-4 pt-10 pb-6 md:pt-16"
    >
      {/* cursor-follow glow */}
      <motion.div
        aria-hidden
        style={{ x: mx, y: my, background: "radial-gradient(circle, #ff3d9a, transparent 66%)" }}
        className="pointer-events-none absolute z-0 -ml-40 -mt-40 h-80 w-80 rounded-full opacity-30 blur-3xl"
      />

      <div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-2">
        <div className="relative z-10">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-wide text-cyan"
          >
            <span className="text-pink">◆</span> no wallet · no seed phrase · no cap
          </motion.p>

          <h1 className="font-display text-[15vw] font-black leading-[0.92] tracking-tight text-text md:text-7xl">
            {words.map((w, i) => (
              <motion.span
                key={w}
                initial={{ opacity: 0, y: 24, rotate: -4 }}
                animate={{ opacity: 1, y: 0, rotate: 0 }}
                transition={{ delay: 0.08 * i + 0.1, type: "spring", stiffness: 260, damping: 16 }}
                whileHover={{ scale: 1.09, rotate: -3, transition: { type: "spring", stiffness: 400, damping: 12 } }}
                className={`mr-3 inline-block cursor-default ${w === "slaps." ? "text-pink [text-shadow:3px_0_var(--color-cyan),-3px_0_var(--color-lime)]" : ""}`}
              >
                {w}
              </motion.span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-6 max-w-md text-lg font-medium text-muted"
          >
            wrap any token into a holographic card, drop the link in the group chat,
            and they claim it in two taps. that&apos;s the whole app.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <Magnetic
              href="#try"
              className="inline-block rounded-2xl border-2 border-ink bg-lime px-6 py-3.5 font-display text-lg font-extrabold lowercase text-ink shadow-[5px_5px_0_0_var(--color-pink)]"
            >
              wrap one now →
            </Magnetic>
            <Magnetic
              href="#how"
              className="inline-block rounded-2xl border border-line bg-surface px-6 py-3.5 font-display text-lg font-extrabold lowercase text-text"
            >
              how&apos;s it work
            </Magnetic>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.25, type: "spring", stiffness: 140, damping: 15 }}
          className="mx-auto w-full max-w-[300px]"
        >
          <PackRip gift={{ occ: "birthday", amt: "50", token: "USDC", to: "maya", from: "alex", msg: "your first crypto 🎂" }} />
        </motion.div>
      </div>

      <div className="mt-10 -rotate-1 border-y-2 border-ink bg-lime py-2.5">
        <Marquee items={["send crypto", "no seed phrase", "claim in 2 taps", "gas on us", "to the group chat"]} />
      </div>
    </section>
  );
}
