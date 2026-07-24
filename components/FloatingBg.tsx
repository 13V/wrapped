"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";

/** A calm, corporate backdrop: two very faint, slow color washes for depth.
 *  No floating emoji — the page reads clean and finance-grade. */
export function FloatingBg() {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const blobY1 = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const blobY2 = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"]);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <motion.div
        style={{ y: reduce ? 0 : blobY1 }}
        className="absolute -left-40 top-[6%] h-[44vmax] w-[44vmax] rounded-full opacity-[0.04] blur-3xl"
      >
        <div className="h-full w-full rounded-full" style={{ background: "radial-gradient(circle, #635bff, transparent 62%)" }} />
      </motion.div>
      <motion.div
        style={{ y: reduce ? 0 : blobY2 }}
        className="absolute -right-44 top-[52%] h-[48vmax] w-[48vmax] rounded-full opacity-[0.035] blur-3xl"
      >
        <div className="h-full w-full rounded-full" style={{ background: "radial-gradient(circle, #4b8df8, transparent 60%)" }} />
      </motion.div>
    </div>
  );
}
