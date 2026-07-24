"use client";

import { motion, useScroll, useSpring } from "motion/react";

/** A thin holographic bar at the top of the page tracking scroll progress. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 26, mass: 0.3 });
  return (
    <motion.div
      style={{
        scaleX,
        background: "linear-gradient(90deg,#635bff,#4b8df8,#22c9e0)",
      }}
      className="fixed inset-x-0 top-0 z-[60] h-1 origin-left"
      aria-hidden="true"
    />
  );
}
