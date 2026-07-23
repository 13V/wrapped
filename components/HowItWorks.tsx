"use client";

import { motion, useMotionValueEvent, useScroll, useTransform } from "motion/react";
import { useRef, useState } from "react";
import { HoloCard } from "./HoloCard";
import { fireConfetti } from "@/lib/confetti";

const STEPS = [
  { t: "Wrap it", d: "Choose the occasion, any token, and a message. It becomes a one-of-a-kind card." },
  { t: "Send it", d: "Share the link however you like — a text, an email, or in person. You never need their wallet." },
  { t: "They open it", d: "In two taps it's theirs. We create the wallet and cover the network fees for them." },
];

export function HowItWorks() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [stage, setStage] = useState(0);
  const fired = useRef(false);

  useMotionValueEvent(p, "change", (v) => {
    setStage(v < 0.34 ? 0 : v < 0.68 ? 1 : 2);
    if (v > 0.73 && !fired.current) {
      fired.current = true;
      fireConfetti(0.68, 0.42);
    }
    if (v < 0.68) fired.current = false;
  });

  // pack tears away → reveals card
  const packY = useTransform(p, [0.16, 0.33], ["0%", "-135%"]);
  const packRot = useTransform(p, [0.16, 0.33], [0, -14]);
  const packOpacity = useTransform(p, [0.24, 0.35], [1, 0]);
  const cardScale = useTransform(p, [0.08, 0.33], [0.85, 1]);
  const cardRot = useTransform(p, [0.33, 0.5, 0.66], [0, -7, 0]);
  const cardX = useTransform(p, [0.4, 0.6], ["0%", "6%"]);
  // send
  const planeX = useTransform(p, [0.42, 0.66], ["-40%", "150%"]);
  const planeY = useTransform(p, [0.42, 0.54, 0.66], ["0%", "-40%", "10%"]);
  const planeOpacity = useTransform(p, [0.42, 0.5, 0.62, 0.66], [0, 1, 1, 0]);
  const linkOpacity = useTransform(p, [0.44, 0.52, 0.64, 0.7], [0, 1, 1, 0]);
  const linkY = useTransform(p, [0.44, 0.52], [16, 0]);
  // claim
  const stampScale = useTransform(p, [0.73, 0.85], [2.4, 1]);
  const stampOpacity = useTransform(p, [0.73, 0.8], [0, 1]);
  const railFill = useTransform(p, [0.02, 0.98], ["0%", "100%"]);

  return (
    <section id="how" ref={ref} className="relative z-10 h-[280vh]">
      <div className="sticky top-0 flex h-screen items-center overflow-hidden px-4">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-12 md:grid-cols-2">
          {/* left rail */}
          <div className="order-2 md:order-1">
            <p className="mb-6 font-mono text-xs font-bold uppercase tracking-wide text-gold">How it works · scroll ↓</p>
            <div className="relative flex flex-col gap-8 pl-9">
              <div className="absolute left-[13px] bottom-3 top-3 w-1 rounded bg-line" />
              <motion.div
                style={{ height: railFill }}
                className="absolute left-[13px] top-3 w-1 rounded bg-gradient-to-b from-pink via-violet to-cyan"
              />
              {STEPS.map((s, i) => (
                <div
                  key={i}
                  className="relative flex items-start transition-opacity duration-300"
                  style={{ opacity: stage === i ? 1 : 0.38 }}
                >
                  <motion.div
                    animate={stage === i ? { scale: 1.15 } : { scale: 1 }}
                    className={`absolute -left-9 grid size-7 place-items-center rounded-full border border-ink/15 font-mono text-xs font-bold ${stage === i ? "bg-lime text-ink" : "bg-surface text-muted"}`}
                  >
                    {i + 1}
                  </motion.div>
                  <div>
                    <h3 className="font-display text-3xl font-semibold text-text md:text-4xl">{s.t}</h3>
                    <p className="mt-1.5 max-w-xs leading-relaxed text-muted">{s.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* right: the morphing card */}
          <div
            className="relative order-1 mx-auto flex h-[420px] w-full max-w-[300px] items-center justify-center md:order-2"
            style={{ perspective: 1100 }}
          >
            <motion.div style={{ scale: cardScale, rotate: cardRot, x: cardX }} className="w-[250px]">
              <HoloCard
                gift={{ occ: "birthday", amt: "50", token: "USDC", to: "maya", from: "alex", msg: "your first crypto 🎂" }}
                interactive={false}
                hint={false}
              />
            </motion.div>

            {/* sealed pack overlay */}
            <motion.div
              style={{ y: packY, rotate: packRot, opacity: packOpacity }}
              className="absolute left-1/2 top-1/2 w-[250px] -translate-x-1/2 -translate-y-1/2"
            >
              <div
                className="relative aspect-[5/7] overflow-hidden rounded-[24px] border-[3px] border-white/15"
                style={{ background: "linear-gradient(150deg,#150e28,#0b0714)" }}
              >
                <div className="holo-bands absolute inset-0 opacity-60 mix-blend-screen" />
                <div className="foil-tex absolute inset-0 opacity-70" />
                <div className="absolute inset-x-0 top-[22%] flex items-center justify-between px-2 text-white">
                  <span>✂</span>
                  <div className="mx-1 h-0 flex-1" style={{ borderTop: "3px dashed rgba(255,255,255,.5)" }} />
                  <span className="rotate-90">✂</span>
                </div>
                <div className="relative z-10 flex h-full flex-col items-center justify-center gap-2 text-white [text-shadow:0_2px_10px_rgba(0,0,0,.5)]">
                  <span className="font-display text-3xl font-semibold tracking-wide">Wrapped</span>
                  <span className="rounded-full border border-white/50 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wide">
                    A gift for you
                  </span>
                </div>
              </div>
            </motion.div>

            {/* paper plane (send) */}
            <motion.div style={{ x: planeX, y: planeY, opacity: planeOpacity }} className="pointer-events-none absolute left-0 top-8 text-4xl">
              ✈️
            </motion.div>
            {/* link chip (send) */}
            <motion.div
              style={{ opacity: linkOpacity, y: linkY }}
              className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border-2 border-ink bg-surface px-4 py-2 font-mono text-xs font-bold text-text shadow-hard-sm"
            >
              🔗 wrapped.gift/n/0482 · copied ✓
            </motion.div>
            {/* claimed stamp (claim) */}
            <motion.div
              style={{ scale: stampScale, opacity: stampOpacity }}
              className="absolute -right-3 top-3 rotate-6 rounded-xl bg-lime px-4 py-2 font-display text-lg font-semibold text-ink shadow-hard-sm"
            >
              Claimed ✓
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
