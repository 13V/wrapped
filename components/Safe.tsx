"use client";

import { motion } from "motion/react";

const FEATS = [
  { emoji: "🔒", title: "non-custodial", body: "your money sits in an escrow only the gift link can open. we literally can't touch it.", accent: "var(--color-cyan)" },
  { emoji: "⛽", title: "gas is on us", body: "the link pays its own network fee, so your friend can claim with zero SOL and zero setup.", accent: "var(--color-pink)" },
  { emoji: "↩️", title: "always reclaimable", body: "not claimed in time? it bounces back to you automatically. nothing gets stuck. ever.", accent: "var(--color-lime)" },
];

export function Safe() {
  return (
    <section id="safe" className="relative z-10 px-4 py-20">
      <div className="mx-auto max-w-6xl">
        <div
          className="rounded-[32px] border-[3px] border-ink p-8 shadow-hard-lg md:p-12"
          style={{ background: "#100c18" }}
        >
          <p className="font-mono text-sm font-bold uppercase text-lime">but is it safe tho</p>
          <h2 className="mt-2 max-w-2xl font-display text-4xl font-black lowercase tracking-tight text-white md:text-5xl">
            yeah. it&apos;s locked until they open it.
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {FEATS.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-6"
                style={{ boxShadow: `inset 0 2px 0 0 ${f.accent}88` }}
              >
                <span className="grid size-12 place-items-center rounded-xl text-3xl" style={{ background: `${f.accent}22` }}>
                  {f.emoji}
                </span>
                <h3 className="mt-4 font-display text-2xl font-black lowercase text-white">{f.title}</h3>
                <p className="mt-2 font-medium text-white/65">{f.body}</p>
              </motion.div>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-3 font-mono text-xs font-bold uppercase">
            {["built on solana", "open source", "passkey wallets", "no seed phrase"].map((b) => (
              <span key={b} className="rounded-full border border-lime/50 px-3 py-1.5 text-lime">{b}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
