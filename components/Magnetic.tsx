"use client";

import { motion, useMotionValue, useSpring } from "motion/react";
import { useRef } from "react";

/** A button/link that springs toward the cursor — a magnetic micro-interaction. */
export function Magnetic({
  children,
  href,
  className = "",
  strength = 0.4,
}: {
  children: React.ReactNode;
  href?: string;
  className?: string;
  strength?: number;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 14 });
  const sy = useSpring(y, { stiffness: 200, damping: 14 });

  function move(e: React.PointerEvent) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  }
  function leave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.a
      ref={ref}
      href={href}
      onPointerMove={move}
      onPointerLeave={leave}
      style={{ x: sx, y: sy }}
      className={className}
    >
      {children}
    </motion.a>
  );
}
