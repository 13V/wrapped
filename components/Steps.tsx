"use client";

import { motion } from "motion/react";

const STEPS = [
  { n: "01", emoji: "🎁", title: "wrap it", body: "pick a vibe, choose any token, add a message. it becomes a 1-of-1 holo card.", bg: "var(--color-pink)", fg: "#fff" },
  { n: "02", emoji: "🔗", title: "send it", body: "drop the link anywhere — imessage, discord, the group chat. you never need their wallet.", bg: "var(--color-cyan)", fg: "#0a1418" },
  { n: "03", emoji: "⚡", title: "they claim it", body: "two taps and it's theirs. we spin up a wallet for them and cover the gas. zero setup.", bg: "var(--color-lime)", fg: "#141018" },
];

export function Steps() {
  return (
    <section id="how" className="relative z-10 px-4 py-20">
      <div className="mx-auto max-w-6xl">
        <h2 className="mb-3 font-display text-4xl font-black lowercase tracking-tight text-text md:text-6xl">
          three taps. <span className="text-violet">done.</span>
        </h2>
        <p className="mb-12 max-w-lg text-lg font-medium text-muted">
          gifting crypto used to mean addresses and prayers. now it&apos;s just… a gift.
        </p>
        <div className="grid gap-6 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ delay: i * 0.1, type: "spring", stiffness: 120, damping: 16 }}
              whileHover={{ y: -6, rotate: i % 2 ? 1 : -1 }}
              className="rounded-3xl border-[3px] border-ink p-7 shadow-hard"
              style={{ background: s.bg, color: s.fg }}
            >
              <div className="flex items-center justify-between">
                <span className="text-5xl">{s.emoji}</span>
                <span className="font-mono text-2xl font-bold opacity-40">{s.n}</span>
              </div>
              <h3 className="mt-6 font-display text-3xl font-black lowercase">{s.title}</h3>
              <p className="mt-2 font-semibold opacity-85">{s.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
