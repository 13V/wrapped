"use client";

import { motion } from "motion/react";
import { Reveal } from "./Reveal";

const FEATS = [
  { emoji: "🔒", title: "Non-custodial", body: "Your gift sits in a secure on-chain escrow that only the recipient's link can open. We never hold or touch the funds.", accent: "var(--color-cyan)" },
  { emoji: "🎁", title: "We cover the fees", body: "The gift link pays its own network fee, so the person you're gifting needs nothing set up — no crypto, no account.", accent: "var(--color-pink)" },
  { emoji: "↩️", title: "Always refundable", body: "If a gift isn't opened in time, it returns to you automatically. Nothing ever gets lost or stuck.", accent: "var(--color-lime)" },
];

export function Safe() {
  return (
    <section id="safe" className="relative z-10 px-4 py-20">
      <div className="mx-auto max-w-6xl">
        <div
          className="rounded-3xl border border-white/10 p-8 shadow-hard-lg md:p-12"
          style={{ background: "#0a2540" }}
        >
          <Reveal>
            <p className="font-mono text-xs font-bold uppercase tracking-wide text-[#b7b1ff]">Security</p>
            <h2 className="mt-2 max-w-2xl font-display text-4xl font-semibold tracking-tight text-white md:text-5xl">
              Locked until they open it.
            </h2>
          </Reveal>
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
                <h3 className="mt-4 font-display text-2xl font-semibold text-white">{f.title}</h3>
                <p className="mt-2 leading-relaxed text-white/65">{f.body}</p>
              </motion.div>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-3 font-mono text-xs font-bold uppercase tracking-wide">
            {["Built on Solana", "Open source", "Passkey wallets", "No seed phrase"].map((b) => (
              <span key={b} className="rounded-full border border-[#635bff]/50 px-3 py-1.5 text-[#b7b1ff]">{b}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
