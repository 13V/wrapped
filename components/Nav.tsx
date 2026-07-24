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
      <div className="mx-auto flex max-w-6xl items-center gap-4 rounded-full border border-line bg-white/80 px-4 py-2.5 shadow-[var(--shadow-hard-sm)] backdrop-blur-md">
        <a href="#top" className="flex items-center gap-2.5">
          <motion.span
            whileHover={{ rotate: [0, -10, 10, -6, 0] }}
            transition={{ duration: 0.5 }}
            className="grid size-9 place-items-center rounded-lg bg-lime text-lg shadow-[var(--shadow-hard-sm)]"
          >
            🎁
          </motion.span>
          <span className="font-display text-xl font-semibold tracking-tight text-text">Wrapped</span>
        </a>
        <nav className="ml-auto hidden items-center gap-1 md:flex">
          {[
            ["how", "How it works"],
            ["try", "Create a gift"],
            ["occasions", "Occasions"],
            ["safe", "Security"],
          ].map(([id, label]) => (
            <a
              key={id}
              href={`#${id}`}
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-muted transition-colors hover:bg-surface-2 hover:text-text"
            >
              {label}
            </a>
          ))}
        </nav>
        <motion.a
          href="#try"
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.96 }}
          className="ml-auto rounded-full bg-ink px-5 py-2 text-sm font-semibold text-surface shadow-[var(--shadow-hard-sm)] md:ml-0"
        >
          Send a gift
        </motion.a>
      </div>
    </motion.header>
  );
}
