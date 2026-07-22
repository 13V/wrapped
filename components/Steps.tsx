"use client";

import { motion } from "motion/react";
import { Reveal } from "./Reveal";
import { TiltCard } from "./TiltCard";

const STEPS = [
  { n: "01", emoji: "🎁", title: "wrap it", body: "pick a vibe, choose any token, add a message. it becomes a 1-of-1 holo card.", bg: "var(--color-pink)", fg: "#fff" },
  { n: "02", emoji: "🔗", title: "send it", body: "drop the link anywhere — imessage, discord, the group chat. you never need their wallet.", bg: "var(--color-cyan)", fg: "#0a1418" },
  { n: "03", emoji: "⚡", title: "they claim it", body: "two taps and it's theirs. we spin up a wallet for them and cover the gas. zero setup.", bg: "var(--color-lime)", fg: "#141018" },
];

export function Steps() {
  return (
    <section id="how" className="relative z-10 px-4 py-20">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <h2 className="mb-3 font-display text-4xl font-black lowercase tracking-tight text-text md:text-6xl">
            three taps. <span className="text-violet">done.</span>
          </h2>
          <p className="mb-12 max-w-lg text-lg font-medium text-muted">
            gifting crypto used to mean addresses and prayers. now it&apos;s just… a gift.
          </p>
        </Reveal>
        <div className="grid gap-6 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 44, rotate: i % 2 ? 3 : -3 }}
              whileInView={{ opacity: 1, y: 0, rotate: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ delay: i * 0.12, type: "spring", stiffness: 120, damping: 15 }}
            >
              <TiltCard className="group relative overflow-hidden rounded-3xl border-[3px] border-ink p-7 shadow-hard" max={9}>
                <div className="absolute inset-0" style={{ background: s.bg }} />
                {/* hover shine sweep */}
                <div className="pointer-events-none absolute -inset-y-8 -left-1/3 w-1/3 -skew-x-12 bg-white/35 blur-md transition-transform duration-700 ease-out group-hover:translate-x-[420%]" />
                <div className="relative" style={{ color: s.fg }}>
                  <div className="flex items-center justify-between">
                    <motion.span
                      className="inline-block text-5xl"
                      animate={{ y: [0, -8, 0], rotate: [0, -6, 0] }}
                      transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 }}
                    >
                      {s.emoji}
                    </motion.span>
                    <span className="font-mono text-2xl font-bold opacity-40">{s.n}</span>
                  </div>
                  <h3 className="mt-6 font-display text-3xl font-black lowercase">{s.title}</h3>
                  <p className="mt-2 font-semibold opacity-85">{s.body}</p>
                </div>
              </TiltCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
