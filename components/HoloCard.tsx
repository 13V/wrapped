"use client";

import {
  motion,
  useMotionValue,
  useMotionTemplate,
  useSpring,
  useTransform,
  useReducedMotion,
} from "motion/react";
import { useRef, useState } from "react";
import { OCCASIONS, type OccasionKey } from "@/lib/occasions";
import { formatAmount, type Gift } from "@/lib/gift";
import { SolanaMark, TokenChip } from "./logos";

const DARK = "linear-gradient(150deg, #150e28, #0b0714)";

export function HoloCard({
  gift,
  interactive = true,
  float = false,
  reveal = false,
  className = "",
}: {
  gift: Gift;
  interactive?: boolean;
  float?: boolean;
  reveal?: boolean;
  className?: string;
}) {
  const o = OCCASIONS[gift.occ as OccasionKey] ?? OCCASIONS.birthday;
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [flipped, setFlipped] = useState(false);

  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const hover = useMotionValue(0);
  const spring = { stiffness: 220, damping: 20, mass: 0.5 };
  const hoverS = useSpring(hover, { stiffness: 200, damping: 26 });

  const tiltX = useSpring(useTransform(py, [0, 1], [17, -17]), spring);
  const tiltY = useSpring(useTransform(px, [0, 1], [-19, 19]), spring);
  const flipMV = useMotionValue(0);
  const flip = useSpring(flipMV, { stiffness: 120, damping: 16 });
  const rotateY = useTransform([flip, tiltY], ([f, t]: number[]) => f + (interactive ? t : 0));
  const rotateX = useTransform(tiltX, (t) => (interactive ? t : 0));

  const gx = useTransform(px, (v) => `${v * 100}%`);
  const gy = useTransform(py, (v) => `${v * 100}%`);
  const rpx = useTransform(px, [0, 1], [0, 100]);
  const rpy = useTransform(py, [0, 1], [0, 100]);
  const reactPos = useMotionTemplate`${rpx}% ${rpy}%`;
  const glare = useMotionTemplate`radial-gradient(circle at ${gx} ${gy}, rgba(255,255,255,0.9), rgba(255,255,255,0.15) 22%, transparent 46%)`;
  const glitterMask = useMotionTemplate`radial-gradient(circle at ${gx} ${gy}, #000 0%, rgba(0,0,0,0.4) 34%, transparent 64%)`;
  const shadowShift = useTransform([tiltX, tiltY], ([x, y]: number[]) => `${-y * 1.5}px ${22 + x}px 48px -12px rgba(155,107,255,0.6)`);
  const reactOpacity = useTransform(hoverS, [0, 1], [0.12, 0.72]);
  const glitterOpacity = useTransform(hoverS, [0, 1], [0.28, 1]);

  function onMove(e: React.PointerEvent) {
    if (!interactive || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width);
    py.set((e.clientY - r.top) / r.height);
    hover.set(1);
  }
  function reset() {
    px.set(0.5);
    py.set(0.5);
    hover.set(0);
  }

  const face = "absolute inset-0 rounded-[24px] overflow-hidden [backface-visibility:hidden] border-[3px] border-white/15";

  return (
    <motion.div
      className={className}
      style={{ perspective: 1100 }}
      animate={float && !reduce ? { y: [0, -12, 0] } : undefined}
      transition={float ? { duration: 5.5, repeat: Infinity, ease: "easeInOut" } : undefined}
    >
      <motion.div
        ref={ref}
        onPointerMove={onMove}
        onPointerLeave={reset}
        onClick={() => {
          if (!interactive) return;
          const nf = !flipped;
          setFlipped(nf);
          flipMV.set(nf ? 180 : 0);
        }}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
          boxShadow: interactive ? shadowShift : "0 22px 50px -18px rgba(155,107,255,0.5)",
        }}
        className="relative aspect-[5/7] w-full cursor-pointer select-none touch-none"
      >
        {/* ---------- FRONT ---------- */}
        <div className={face} style={{ background: DARK }}>
          <div className="absolute inset-0 mix-blend-screen" style={{ background: `linear-gradient(150deg, ${o.c1}, ${o.c2})`, opacity: 0.34 }} />
          <div className="holo-bands absolute inset-0 opacity-60 mix-blend-screen" />
          <motion.div className="holo-react absolute inset-0 mix-blend-screen" style={{ backgroundPosition: reactPos, opacity: reactOpacity }} />
          <div className="foil-tex absolute inset-0 opacity-70" />
          <motion.div
            className="holo-glitter absolute inset-0 mix-blend-screen"
            style={{ opacity: glitterOpacity, WebkitMaskImage: glitterMask, maskImage: glitterMask }}
          />
          <motion.div className="absolute inset-0 mix-blend-overlay pointer-events-none" style={{ background: glare, opacity: interactive ? hoverS : 0 }} />
          {reveal && !reduce && <div className="glare-sweep absolute -inset-y-1/2 left-0 z-20 w-1/3 pointer-events-none" />}

          {/* content */}
          <div className="relative z-10 flex h-full flex-col justify-between p-4 text-white [text-shadow:0_1px_8px_rgba(0,0,0,0.55)]">
            <div className="flex items-start justify-between">
              <span className="font-display text-[15px] font-extrabold tracking-tight">WRAPPED</span>
              <span className="grid size-9 place-items-center rounded-full border-2 border-white/70 bg-white/20 text-lg backdrop-blur-sm">{o.emoji}</span>
            </div>
            <div className="rotate-[-7deg] self-start rounded-md border-2 border-ink bg-lime px-2 py-0.5 font-mono text-[10px] font-bold text-ink [text-shadow:none]">
              {o.tag} · 1 OF 1 · HOLO
            </div>
            <div>
              <div className="flex items-end gap-2">
                <span className="font-display text-5xl font-black leading-none tabular-nums">{formatAmount(gift.amt)}</span>
                <span className="pb-1"><TokenChip symbol={gift.token} /></span>
              </div>
              <div className="mt-3 flex items-end justify-between gap-2">
                <div className="min-w-0">
                  <div className="truncate text-sm font-bold lowercase">to {gift.to || "you"}</div>
                  {gift.msg && <div className="truncate text-[11px] font-medium opacity-90">{gift.msg}</div>}
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <span
                    title="Secured on Solana"
                    className="grid size-8 place-items-center rounded-full border border-white/40 bg-white/10 p-[7px] backdrop-blur-sm"
                  >
                    <SolanaMark className="h-full w-full" />
                  </span>
                  <span className="text-[11px] font-bold opacity-90">— {gift.from || "someone"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ---------- BACK ---------- */}
        <div className={face} style={{ transform: "rotateY(180deg)", background: DARK }}>
          <div className="absolute inset-0 mix-blend-screen" style={{ background: `linear-gradient(150deg, ${o.c2}, ${o.c1})`, opacity: 0.3 }} />
          <div className="holo-bands absolute inset-0 opacity-60 mix-blend-screen" />
          <div className="foil-tex absolute inset-0 opacity-60" />
          <div className="holo-glitter absolute inset-0 opacity-45 mix-blend-screen" />
          <div className="relative z-10 flex h-full flex-col items-center justify-center gap-3 p-5 text-center text-white [text-shadow:0_1px_8px_rgba(0,0,0,0.6)]">
            <span className="grid size-16 place-items-center rounded-2xl border-[3px] border-white/70 bg-white/15 text-4xl backdrop-blur-sm">🎁</span>
            <span className="font-display text-2xl font-black tracking-tight">WRAPPED</span>
            <span className="rounded-full border-2 border-white/60 px-3 py-1 font-mono text-[10px] font-bold uppercase">
              {o.tag} · no. {String(Math.abs(hashStr(gift.to + gift.from)) % 10000).padStart(4, "0")}
            </span>
            <span className="mt-1 font-mono text-[10px] font-bold uppercase opacity-80">1 of 1 · secured on solana</span>
          </div>
        </div>
      </motion.div>

      {interactive && (
        <p className="mt-3 text-center font-mono text-[11px] font-bold uppercase text-muted">tilt it · tap to flip ⟳</p>
      )}
    </motion.div>
  );
}

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i);
  return h;
}
