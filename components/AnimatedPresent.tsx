"use client";

import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";

// A wrapped present that pops open: the lid + bow lift and tilt, a light burst
// and sparkles fire from inside. Opens on hover, or when `open` is forced true
// (e.g. the moment a gift is claimed). One scalable SVG, so it stays crisp.

const RAYS = [0, 45, 90, 135, 180, 225, 270, 315];
const DOTS = [
  { x: 50, y: 6, c: "#ff2d9a" },
  { x: 74, y: 14, c: "#22e0ff" },
  { x: 84, y: 36, c: "#bfff3a" },
  { x: 26, y: 14, c: "#ffe000" },
  { x: 16, y: 36, c: "#9b6bff" },
  { x: 64, y: 4, c: "#ff7a00" },
  { x: 36, y: 4, c: "#22e0ff" },
];

export function AnimatedPresent({
  open = false,
  className = "",
}: {
  open?: boolean;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const [hover, setHover] = useState(false);
  const isOpen = (open || hover) && !reduce;

  return (
    <motion.svg
      viewBox="0 0 100 100"
      className={className}
      onHoverStart={() => setHover(true)}
      onHoverEnd={() => setHover(false)}
      whileHover={reduce ? undefined : { scale: 1.04 }}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="ap-glow">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="ap-box" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#e8e6f4" />
        </linearGradient>
      </defs>

      {/* light spilling out */}
      <motion.circle
        cx="50" cy="44" r="30" fill="url(#ap-glow)"
        style={{ transformBox: "fill-box", transformOrigin: "center" }}
        initial={false}
        animate={isOpen ? { opacity: 0.9, scale: 1.25 } : { opacity: 0, scale: 0.4 }}
        transition={{ duration: 0.35 }}
      />

      {/* box body */}
      <g>
        <rect x="20" y="50" width="60" height="40" rx="6" fill="url(#ap-box)" />
        <rect x="24" y="50" width="52" height="7" rx="2" fill="#c7c4db" />
        <path d="M50 50 V90" stroke="rgba(23,16,34,0.16)" strokeWidth="5" strokeLinecap="round" />
      </g>

      {/* burst — rays + confetti dots, behind the lid */}
      <motion.g
        style={{ transformBox: "fill-box", transformOrigin: "center" }}
        initial={false}
        animate={isOpen ? { scale: [0.2, 1.15, 1], opacity: [0, 1, 0.9] } : { scale: 0.2, opacity: 0 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
      >
        {RAYS.map((a) => (
          <rect key={a} x="48.5" y="10" width="3" height="13" rx="1.5" fill="#fff" transform={`rotate(${a} 50 44)`} />
        ))}
        {DOTS.map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r="2.4" fill={d.c} />
        ))}
      </motion.g>

      {/* lid + bow — lifts and tilts off the top */}
      <motion.g
        style={{ transformBox: "fill-box", transformOrigin: "50% 70%" }}
        initial={false}
        animate={isOpen ? { y: -34, rotate: -13 } : { y: 0, rotate: 0 }}
        transition={{ type: "spring", stiffness: 240, damping: 13 }}
      >
        <rect x="14" y="40" width="72" height="14" rx="4" fill="url(#ap-box)" />
        <path d="M50 40 C 37 22 18 26 25 39 C 30 48 45 45 50 40 Z" fill="#fff" />
        <path d="M50 40 C 63 22 82 26 75 39 C 70 48 55 45 50 40 Z" fill="#fff" />
        <rect x="44" y="35" width="12" height="10" rx="3.5" fill="#fff" />
      </motion.g>
    </motion.svg>
  );
}
