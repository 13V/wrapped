"use client";

import { motion } from "motion/react";
import { useRef } from "react";
import { CardGift } from "./CardGift";
import { Reveal } from "./Reveal";
import { OCCASION_LIST } from "@/lib/occasions";

const AMTS = ["50", "100", "25", "10", "42"];
const TOKS = ["SOL", "USDC", "BONK", "SOL", "WIF"];
const POS = [
  { l: "2%", t: "5%", r: -8 },
  { l: "55%", t: "8%", r: 6 },
  { l: "30%", t: "36%", r: -4 },
  { l: "5%", t: "60%", r: 7 },
  { l: "57%", t: "58%", r: -6 },
];

export function Occasions() {
  const wall = useRef<HTMLDivElement>(null);

  return (
    <section id="occasions" className="relative z-10 px-4 py-20">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <h2 className="mb-3 font-display text-4xl font-semibold tracking-tight text-text md:text-6xl">
            A card for every <span className="text-lime">occasion</span>.
          </h2>
          <p className="mb-8 max-w-lg text-lg leading-relaxed text-muted">
            Each one is a premium gift card, tuned to the moment. Pick one up and give it a toss.
          </p>
        </Reveal>

        <div
          ref={wall}
          className="relative h-[500px] overflow-hidden rounded-3xl border border-line bg-white/60 shadow-[var(--shadow-hard)] backdrop-blur-sm md:h-[560px]"
        >
          {OCCASION_LIST.map((o, i) => (
            <motion.div
              key={o.key}
              drag
              dragConstraints={wall}
              dragElastic={0.16}
              dragTransition={{ power: 0.32, timeConstant: 260, bounceStiffness: 300, bounceDamping: 22 }}
              whileDrag={{ scale: 1.07, zIndex: 50 }}
              whileTap={{ cursor: "grabbing" }}
              initial={{ opacity: 0, scale: 0.7, y: 30 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.09, type: "spring", stiffness: 160, damping: 15 }}
              style={{ left: POS[i].l, top: POS[i].t, rotate: POS[i].r }}
              className="absolute w-[200px] cursor-grab touch-none active:cursor-grabbing sm:w-[240px]"
            >
              <div className="pointer-events-none">
                <CardGift
                  gift={{ occ: o.key, amt: AMTS[i], token: TOKS[i], to: "you", from: "wrapped", msg: o.blurb }}
                  interactive={false}
                  float={false}
                />
              </div>
            </motion.div>
          ))}
          <span className="pointer-events-none absolute bottom-3 right-4 z-40 font-mono text-[11px] font-bold uppercase tracking-wide text-muted">
            Drag to explore ✦
          </span>
        </div>
      </div>
    </section>
  );
}
