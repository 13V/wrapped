"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";

/** Deterministic so SSR and client match (no Math.random). */
const BITS = [
  { e: "🎁", l: 6, t: 14, s: 34, dur: 7, dy: -22, rot: 8 },
  { e: "✦", l: 15, t: 64, s: 20, dur: 6, dy: -16, rot: -10 },
  { e: "🪙", l: 44, t: 8, s: 26, dur: 8, dy: -24, rot: 12 },
  { e: "⭐", l: 80, t: 20, s: 26, dur: 7.5, dy: -20, rot: -8 },
  { e: "💸", l: 90, t: 54, s: 24, dur: 9, dy: -26, rot: 10 },
  { e: "✧", l: 70, t: 40, s: 18, dur: 5.5, dy: -14, rot: -12 },
  { e: "🎉", l: 30, t: 84, s: 28, dur: 8.5, dy: -22, rot: 8 },
  { e: "🪙", l: 60, t: 88, s: 22, dur: 7, dy: -18, rot: -10 },
  { e: "✦", l: 3, t: 42, s: 16, dur: 6.5, dy: -14, rot: 10 },
  { e: "⭐", l: 86, t: 84, s: 22, dur: 8, dy: -20, rot: -8 },
  { e: "✧", l: 50, t: 50, s: 16, dur: 6, dy: -12, rot: 12 },
  { e: "🎁", l: 94, t: 6, s: 22, dur: 7.5, dy: -18, rot: -8 },
];

export function FloatingBg() {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const blobY1 = useTransform(scrollYProgress, [0, 1], ["0%", "60%"]);
  const blobY2 = useTransform(scrollYProgress, [0, 1], ["0%", "-45%"]);
  const bitsY = useTransform(scrollYProgress, [0, 1], ["0%", "-18%"]);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* parallax gradient blobs */}
      <motion.div
        style={{ y: reduce ? 0 : blobY1 }}
        className="absolute -left-32 top-[8%] h-[46vmax] w-[46vmax] rounded-full opacity-[0.06] blur-3xl"
      >
        <motion.div
          animate={reduce ? undefined : { x: [0, 40, 0], y: [0, 30, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="h-full w-full rounded-full"
          style={{ background: "radial-gradient(circle, #635bff, transparent 62%)" }}
        />
      </motion.div>
      <motion.div
        style={{ y: reduce ? 0 : blobY2 }}
        className="absolute -right-40 top-[46%] h-[50vmax] w-[50vmax] rounded-full opacity-[0.05] blur-3xl"
      >
        <motion.div
          animate={reduce ? undefined : { x: [0, -50, 0], y: [0, -30, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          className="h-full w-full rounded-full"
          style={{ background: "radial-gradient(circle, #4b8df8, transparent 60%)" }}
        />
      </motion.div>

      {/* floating bits */}
      <motion.div style={{ y: reduce ? 0 : bitsY }} className="absolute inset-0">
        {BITS.map((b, i) => (
          <motion.span
            key={i}
            className="absolute select-none"
            style={{ left: `${b.l}%`, top: `${b.t}%`, fontSize: b.s, opacity: 0.22 }}
            animate={reduce ? undefined : { y: [0, b.dy, 0], rotate: [0, b.rot, 0] }}
            transition={{ duration: b.dur, repeat: Infinity, ease: "easeInOut", delay: (i % 5) * 0.6 }}
          >
            {b.e}
          </motion.span>
        ))}
      </motion.div>
    </div>
  );
}
