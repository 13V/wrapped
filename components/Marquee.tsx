"use client";

import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "motion/react";
import { useRef } from "react";

function wrap(min: number, max: number, v: number) {
  const range = max - min;
  return ((((v - min) % range) + range) % range) + min;
}

/** A marquee that speeds up and flips direction with scroll velocity. */
export function Marquee({
  items,
  baseVelocity = 4,
  className = "",
}: {
  items: string[];
  baseVelocity?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smooth = useSpring(scrollVelocity, { damping: 50, stiffness: 400 });
  const factor = useTransform(smooth, [0, 1000], [0, 4], { clamp: false });
  const x = useTransform(baseX, (v) => `${wrap(-25, 0, v)}%`);
  const dir = useRef(1);

  useAnimationFrame((_t, delta) => {
    if (reduce) return;
    let move = dir.current * baseVelocity * (delta / 1000);
    const f = factor.get();
    if (f < 0) dir.current = -1;
    else if (f > 0) dir.current = 1;
    move += dir.current * move * Math.abs(f);
    baseX.set(baseX.get() + move);
  });

  const row = [...items, ...items, ...items, ...items];
  return (
    <div className={`overflow-hidden ${className}`}>
      <motion.div className="inline-flex whitespace-nowrap" style={{ x }}>
        {row.map((t, i) => (
          <span
            key={i}
            className="mx-5 inline-flex items-center gap-5 font-display text-lg font-extrabold uppercase tracking-tight text-ink"
          >
            {t}
            <span aria-hidden className="text-ink">✦</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}
