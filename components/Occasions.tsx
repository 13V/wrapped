"use client";

import { motion } from "motion/react";
import { HoloCard } from "./HoloCard";
import { Reveal } from "./Reveal";
import { OCCASION_LIST } from "@/lib/occasions";

const AMTS = ["50", "100", "25", "10", "42"];
const TOKS = ["SOL", "USDC", "BONK", "SOL", "WIF"];

export function Occasions() {
  return (
    <section id="occasions" className="relative z-10 px-4 py-20">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <h2 className="mb-3 font-display text-4xl font-black lowercase tracking-tight text-text md:text-6xl">
            a card for every <span className="text-pink">main-character</span> moment.
          </h2>
          <p className="mb-12 max-w-lg text-lg font-medium text-muted">
            each one&apos;s a 1-of-1 holographic drop. yes, even the rug one. hover to tilt.
          </p>
        </Reveal>
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
          {OCCASION_LIST.map((o, i) => (
            <motion.div
              key={o.key}
              initial={{ opacity: 0, y: 34, rotate: -3 }}
              whileInView={{ opacity: 1, y: 0, rotate: i % 2 ? 2 : -2 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.07, type: "spring", stiffness: 140, damping: 15 }}
            >
              <motion.div
                animate={{ y: [0, -9, 0] }}
                transition={{ duration: 5 + i * 0.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.35 }}
              >
                <HoloCard
                  gift={{ occ: o.key, amt: AMTS[i], token: TOKS[i], to: "you", from: "wrapped", msg: o.blurb }}
                  interactive
                  hint={false}
                />
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
