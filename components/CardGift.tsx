"use client";

import { motion, useMotionValue, useReducedMotion, useSpring, useTransform, useMotionTemplate, type MotionValue } from "motion/react";
import { useRef } from "react";
import { OCCASIONS, type OccasionKey } from "@/lib/occasions";
import { formatAmount, type Gift } from "@/lib/gift";
import { SolanaMark, TokenChip } from "@/components/logos";

type RibbonStyle = "wrap" | "corner";

/** A premium GIFT CARD — landscape, gold foil, EMV chip, satin ribbon + bow.
 *  Everything inside is sized in container-query units (cqw) so the whole
 *  card scales proportionally at any width and never clips its content.
 *
 *  interactive → cursor tilt + glare + parallax (default on)
 *  float       → idle 3D float + entrance settle + traveling light sweep (default on) */
export function CardGift({
  gift,
  ribbon = "corner",
  interactive = true,
  float = true,
  className = "",
}: {
  gift: Gift;
  ribbon?: RibbonStyle;
  interactive?: boolean;
  float?: boolean;
  className?: string;
}) {
  const o = OCCASIONS[gift.occ as OccasionKey] ?? OCCASIONS.birthday;
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const tilt = interactive && !reduce; // cursor-driven motion
  const lively = float && !reduce; // idle motion + entrance + sweep

  // pointer position, normalized 0..1 across the card
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  // how "engaged" the pointer is (0 at rest, 1 while hovering) — drives the glare
  const active = useMotionValue(0);
  const glareOpacity = useSpring(active, { stiffness: 160, damping: 22 });

  // 3D tilt toward the cursor
  const tiltSpring = { stiffness: 180, damping: 20, mass: 0.6 };
  const rx = useSpring(useTransform(py, [0, 1], [8, -8]), tiltSpring);
  const ry = useSpring(useTransform(px, [0, 1], [-11, 11]), tiltSpring);

  // pointer offset from center (-1..1), spring-smoothed — powers the parallax layers
  const parSpring = { stiffness: 150, damping: 20, mass: 0.6 };
  const mx = useSpring(useTransform(px, [0, 1], [-1, 1]), parSpring);
  const my = useSpring(useTransform(py, [0, 1], [-1, 1]), parSpring);
  const bowX = useTransform(mx, (v) => v * 16);
  const bowY = useTransform(my, (v) => v * 16);
  const heroX = useTransform(mx, (v) => v * 9);
  const heroY = useTransform(my, (v) => v * 9);
  const glowX = useTransform(mx, (v) => v * -13);
  const glowY = useTransform(my, (v) => v * -11);

  // sheen + glare positions track the cursor
  const gx = useTransform(px, (v) => `${v * 100}%`);
  const gy = useTransform(py, (v) => `${v * 100}%`);
  const sheen = useMotionTemplate`radial-gradient(90% 120% at ${gx} ${gy}, rgba(255,255,255,0.20), rgba(255,255,255,0.04) 32%, transparent 55%)`;
  const glare = useMotionTemplate`radial-gradient(26% 38% at ${gx} ${gy}, rgba(255,255,255,0.55), rgba(255,255,255,0.10) 42%, transparent 68%)`;

  // drop shadow shifts opposite the tilt so the card feels physically lit
  const shX = useTransform(ry, (v) => -v * 1.5);
  const shY = useTransform(rx, (v) => 22 - v * 1.5);
  const shadow = useMotionTemplate`${shX}px ${shY}px 46px -14px rgba(8,12,32,0.62)`;

  function onMove(e: React.PointerEvent) {
    if (!ref.current || !tilt) return;
    const r = ref.current.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width);
    py.set((e.clientY - r.top) / r.height);
    active.set(1);
  }
  function reset() { px.set(0.5); py.set(0.5); active.set(0); }

  const pad = ribbon === "wrap" ? "p-[6.5%] pr-[20%]" : "p-[6.5%] pr-[13%]";

  return (
    <motion.div
      className={className}
      style={{ perspective: 1200 }}
      initial={lively ? { opacity: 0, y: 18, scale: 0.94 } : false}
      animate={lively ? { opacity: 1, y: 0, scale: 1 } : undefined}
      transition={{ type: "spring", stiffness: 120, damping: 17, mass: 0.8 }}
    >
      {/* idle float — a gentle 3D drift, not a flat bob */}
      <motion.div
        style={{ transformStyle: "preserve-3d" }}
        animate={lively ? { y: [0, -6, 0], rotateZ: [-0.55, 0.55, -0.55], rotateX: [0.6, -0.6, 0.6] } : undefined}
        transition={lively ? { duration: 7, repeat: Infinity, ease: "easeInOut" } : undefined}
      >
        {/* 3D tilt toward the cursor */}
        <motion.div
          ref={ref}
          onPointerMove={tilt ? onMove : undefined}
          onPointerLeave={tilt ? reset : undefined}
          style={{ rotateX: tilt ? rx : 0, rotateY: tilt ? ry : 0, transformStyle: "preserve-3d", containerType: "inline-size", boxShadow: shadow }}
          className="relative aspect-[1.586/1] w-full select-none overflow-hidden rounded-[18px] text-white"
        >
          {/* deep premium base */}
          <div className="absolute inset-0" style={{ background: "linear-gradient(120deg,#191728 0%,#0e0f1c 58%,#080910 100%)" }} />
          {/* occasion glow — parallaxes slightly behind everything else */}
          <motion.div className="absolute inset-0" style={{ x: glowX, y: glowY, scale: 1.1 }}>
            <div className="absolute inset-0 opacity-55 mix-blend-screen" style={{ background: `radial-gradient(75% 110% at 14% -10%, ${o.c1}, transparent 60%)` }} />
            <div className="absolute inset-0 opacity-40 mix-blend-screen" style={{ background: `radial-gradient(70% 110% at 96% 120%, ${o.c2}, transparent 60%)` }} />
          </motion.div>
          <div className="absolute inset-0" style={{ background: "radial-gradient(130% 130% at 50% 120%, rgba(0,0,0,0.5), transparent 55%)" }} />
          {/* cursor-tracked soft sheen */}
          <motion.div className="absolute inset-0 mix-blend-soft-light" style={{ background: sheen }} />
          {/* crisp specular glare — fades in only while hovering */}
          <motion.div className="absolute inset-0 mix-blend-screen" style={{ background: glare, opacity: glareOpacity }} />
          {/* top light + hairline edge */}
          <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent" />
          <div className="pointer-events-none absolute inset-0 rounded-[18px] ring-1 ring-inset ring-white/12" />
          {/* animated light sweep — a slow glint traveling across the foil */}
          {lively && (
            <motion.div
              aria-hidden
              className="pointer-events-none absolute -inset-y-10 left-0 w-1/3 rotate-[16deg] mix-blend-overlay"
              style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.14) 38%, rgba(255,255,255,0.42) 50%, rgba(255,255,255,0.14) 62%, transparent)" }}
              initial={{ x: "-70%" }}
              animate={{ x: ["-70%", "520%"] }}
              transition={{ duration: 4.6, repeat: Infinity, ease: "easeInOut", repeatDelay: 2.6, delay: 0.7 }}
            />
          )}

          {/* the gift cue: a satin ribbon + bow (parallaxes forward) */}
          {ribbon === "wrap"
            ? <RibbonWrap lively={lively} bowX={bowX} bowY={bowY} />
            : <RibbonCorner lively={lively} bowX={bowX} bowY={bowY} />}

          {/* content — all sizes in cqw so the card scales proportionally */}
          <div className={`relative z-10 flex h-full flex-col justify-between ${pad}`}>
            {/* header: wordmark + chip beneath, on the left */}
            <div>
              <div className="font-display text-[4.1cqw] font-semibold leading-none tracking-[0.16em]"
                style={{ background: "linear-gradient(180deg,#fff,#f3e9c4 55%,#cdb46a)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
                WRAPPED
              </div>
              <div className="mt-[1.2cqw] font-mono text-[1.85cqw] font-bold uppercase tracking-[0.32em] text-white/50">Gift Card</div>
              <Chip className="mt-[4.5%]" />
            </div>

            {/* hero: the denomination — parallaxes forward for depth */}
            <motion.div style={{ x: heroX, y: heroY }}>
              <div className="mb-[0.8cqw] font-mono text-[1.85cqw] font-bold uppercase tracking-[0.26em] text-white/55">{o.label}</div>
              <div className="flex items-end gap-[2.5cqw]">
                <span className="font-display text-[16.3cqw] font-semibold leading-[0.78] tabular-nums [text-shadow:0_2px_16px_rgba(0,0,0,0.5)]">{formatAmount(gift.amt)}</span>
                <span className="pb-[1.6cqw]"><TokenChip symbol={gift.token} logo={gift.logo} size="lg" /></span>
              </div>
            </motion.div>

            {/* footer: to / from + solana */}
            <div className="flex items-end justify-between gap-[3.3cqw]">
              <div className="min-w-0 space-y-[0.8cqw]">
                <div className="truncate"><span className="font-mono text-[1.73cqw] uppercase tracking-[0.24em] text-white/40">To</span> <span className="text-[2.65cqw] font-semibold">{gift.to || "you"}</span></div>
                <div className="truncate"><span className="font-mono text-[1.73cqw] uppercase tracking-[0.24em] text-white/40">From</span> <span className="text-[2.65cqw] font-semibold">{gift.from || "someone"}</span></div>
              </div>
              <span title="Secured on Solana" className="grid size-[4.9cqw] shrink-0 place-items-center rounded-full border border-white/25 bg-white/10 p-[1cqw] backdrop-blur-sm">
                <SolanaMark className="h-full w-full" />
              </span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

/** Satin ribbon wrapping the full height, tied in a bow near the top. */
function RibbonWrap({ lively, bowX, bowY }: { lively: boolean; bowX: MotionValue<number>; bowY: MotionValue<number> }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-[5]" aria-hidden>
      {/* soft shadows the ribbon casts on the card — makes it sit ON the surface */}
      <div className="absolute inset-y-0 right-[calc(16%+1.5cqw)] w-[0.6cqw]" style={{ background: "linear-gradient(90deg,transparent,rgba(0,0,0,0.30))" }} />
      <div className="absolute inset-y-0 right-[calc(16%-1.6cqw)] w-[0.6cqw]" style={{ background: "linear-gradient(270deg,transparent,rgba(0,0,0,0.30))" }} />
      {/* satin body — champagne gold with a bright folded center */}
      <div className="absolute inset-y-0 right-[16%] w-[3cqw]"
        style={{ background: "linear-gradient(90deg,#6f4f14 0%,#a97f28 18%,#e7cf7f 40%,#fff6d8 52%,#e7cf7f 64%,#a97f28 82%,#6f4f14 100%)" }} />
      {/* fine specular line down the fold */}
      <div className="absolute inset-y-0 right-[calc(16%+1cqw)] w-[0.6cqw] opacity-80" style={{ background: "linear-gradient(180deg,rgba(255,255,255,0.9),rgba(255,255,255,0.25))", mixBlendMode: "screen" }} />
      {/* slow traveling glint along the ribbon */}
      {lively && (
        <motion.div
          className="absolute right-[16%] w-[3cqw] h-1/3"
          style={{ background: "linear-gradient(180deg,transparent,rgba(255,255,255,0.85),transparent)", mixBlendMode: "screen" }}
          initial={{ y: "-40%" }}
          animate={{ y: ["-40%", "320%"] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", repeatDelay: 1.6 }}
        />
      )}
      <motion.div className="absolute right-[calc(16%-7cqw)] top-[-1.5cqw]" style={{ x: bowX, y: bowY }}
        initial={lively ? { scale: 0, rotate: -22, opacity: 0 } : false}
        animate={lively ? { scale: 1, rotate: 0, opacity: 1 } : undefined}
        transition={{ type: "spring", stiffness: 240, damping: 13, delay: 0.5 }}>
        <Bow className="h-[17cqw] w-[17cqw] drop-shadow-[0_7px_11px_rgba(0,0,0,0.5)]" />
      </motion.div>
    </div>
  );
}

/** A compact bow tucked into the top-right corner — no full-height band. */
function RibbonCorner({ lively, bowX, bowY }: { lively: boolean; bowX: MotionValue<number>; bowY: MotionValue<number> }) {
  return (
    <motion.div className="pointer-events-none absolute right-[5%] top-[5%] z-[5]" aria-hidden style={{ x: bowX, y: bowY }}>
      <motion.div
        initial={lively ? { scale: 0, rotate: -22, opacity: 0 } : false}
        animate={lively ? { scale: 1, rotate: 0, opacity: 1 } : undefined}
        transition={{ type: "spring", stiffness: 240, damping: 13, delay: 0.5 }}
      >
        <Bow className="h-[15cqw] w-[15cqw] drop-shadow-[0_7px_12px_rgba(0,0,0,0.55)]" />
      </motion.div>
    </motion.div>
  );
}

/** A gold EMV-style chip. */
function Chip({ className = "" }: { className?: string }) {
  return (
    <div className={`relative h-[6.1cqw] w-[8.6cqw] overflow-hidden rounded-[1.2cqw] shadow-[0_1px_2px_rgba(0,0,0,0.4)] ${className}`} style={{ background: "linear-gradient(135deg,#f8e98f,#d9b44a 38%,#b8860b 68%,#f6e6a0)" }}>
      <div className="absolute inset-0" style={{
        backgroundImage:
          "linear-gradient(0deg,transparent 28%,rgba(90,60,0,.5) 28% 32%,transparent 32%),linear-gradient(0deg,transparent 64%,rgba(90,60,0,.5) 64% 68%,transparent 68%),linear-gradient(90deg,transparent 44%,rgba(90,60,0,.5) 44% 56%,transparent 56%)",
      }} />
      <div className="absolute inset-0 rounded-[1.2cqw] ring-1 ring-inset ring-white/45" />
    </div>
  );
}

/** A gold satin bow — two full loops, a knot, and two ribbon tails. */
function Bow({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 96" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="bowSat" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff3c8" />
          <stop offset="0.46" stopColor="#e4c264" />
          <stop offset="1" stopColor="#9c701d" />
        </linearGradient>
        <radialGradient id="bowKnot" cx="0.5" cy="0.38" r="0.75">
          <stop offset="0" stopColor="#fff0bd" />
          <stop offset="1" stopColor="#a97c24" />
        </radialGradient>
      </defs>
      {/* tails hanging below the knot */}
      <g fill="url(#bowSat)" stroke="rgba(96,66,10,0.5)" strokeWidth="1" strokeLinejoin="round">
        <path d="M57 54 C 52 70 49 82 45 95 L57 87 Z" />
        <path d="M63 54 C 68 70 71 82 75 95 L63 87 Z" />
      </g>
      {/* loops */}
      <g fill="url(#bowSat)" stroke="rgba(96,66,10,0.5)" strokeWidth="1" strokeLinejoin="round">
        <path d="M60 50 C 33 22 7 30 16 52 C 23 69 48 60 60 51 Z" />
        <path d="M60 50 C 87 22 113 30 104 52 C 97 69 72 60 60 51 Z" />
      </g>
      {/* inner fold shading for depth */}
      <path d="M60 51 C 42 34 22 39 21 51 C 37 45 51 48 60 51 Z" fill="rgba(110,74,10,0.38)" />
      <path d="M60 51 C 78 34 98 39 99 51 C 83 45 69 48 60 51 Z" fill="rgba(110,74,10,0.38)" />
      {/* top-edge highlight on each loop */}
      <path d="M22 35 C 34 29 47 34 57 47" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M98 35 C 86 29 73 34 63 47" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.4" strokeLinecap="round" />
      {/* knot */}
      <rect x="51" y="43" width="18" height="18" rx="6" fill="url(#bowKnot)" stroke="rgba(96,66,10,0.6)" strokeWidth="1" />
      <rect x="55" y="46" width="7" height="6" rx="3" fill="rgba(255,255,255,0.42)" />
    </svg>
  );
}
