"use client";

import { motion } from "motion/react";

export function Nav() {
  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 160, damping: 20, delay: 0.1 }}
      className="sticky top-0 z-40 px-4 pt-4"
    >
      <div className="mx-auto flex max-w-6xl items-center gap-4 rounded-2xl border border-line bg-surface/70 px-4 py-2.5 backdrop-blur-md">
        <a href="#top" className="flex items-center gap-2.5">
          <motion.span
            whileHover={{ rotate: [0, -12, 12, -8, 0], scale: 1.08 }}
            transition={{ duration: 0.5 }}
            className="grid size-9 place-items-center rounded-xl border-2 border-ink bg-lime text-lg shadow-[2px_2px_0_0_var(--color-pink)]"
          >
            🎁
          </motion.span>
          <span className="font-display text-xl font-extrabold tracking-tight text-text">wrapped</span>
        </a>
        <nav className="ml-auto hidden items-center gap-1 md:flex">
          {[
            ["how", "how it works"],
            ["try", "try it"],
            ["occasions", "occasions"],
            ["safe", "is it safe?"],
          ].map(([id, label]) => (
            <a
              key={id}
              href={`#${id}`}
              className="rounded-lg px-3 py-1.5 text-sm font-bold lowercase text-muted transition-colors hover:bg-surface-2 hover:text-text"
            >
              {label}
            </a>
          ))}
        </nav>
        <motion.a
          href="#try"
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.95 }}
          className="ml-auto rounded-xl border-2 border-ink bg-pink px-4 py-2 text-sm font-extrabold lowercase text-white shadow-[3px_3px_0_0_var(--color-cyan)] md:ml-0"
        >
          send a gift
        </motion.a>
      </div>
    </motion.header>
  );
}
