"use client";

import { motion } from "motion/react";

/** Fade + slide-up on scroll into view. Wraps any block of content. */
export function Reveal({
  children,
  delay = 0,
  y = 26,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ delay, type: "spring", stiffness: 120, damping: 18 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
