"use client";

import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { HoloCard } from "./HoloCard";
import { OCCASION_LIST, type OccasionKey } from "@/lib/occasions";
import { encodeGift, type Gift } from "@/lib/gift";
import { fireConfetti } from "@/lib/confetti";

export function TryIt() {
  const [occ, setOcc] = useState<OccasionKey>("birthday");
  const [amt, setAmt] = useState("50");
  const [token, setToken] = useState("USDC");
  const [to, setTo] = useState("maya");
  const [from, setFrom] = useState("alex");
  const [msg, setMsg] = useState("your first crypto 🎂");
  const [sent, setSent] = useState(false);
  const [copied, setCopied] = useState(false);

  const gift: Gift = { occ, amt, token, to, from, msg };
  const link = useMemo(
    () => (typeof window !== "undefined" ? `${location.origin}${location.pathname}#g=${encodeGift(gift)}` : ""),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [occ, amt, token, to, from, msg],
  );

  function send() {
    setSent(true);
    setCopied(false);
    fireConfetti(0.78, 0.5);
  }
  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  }
  function preview() {
    location.hash = `g=${encodeGift(gift)}`;
  }

  const inputCls =
    "w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 font-bold text-text outline-none placeholder:text-muted/50 focus:border-cyan transition-colors";

  return (
    <section id="try" className="relative z-10 px-4 py-20">
      <div className="mx-auto grid max-w-6xl items-start gap-12 md:grid-cols-[1fr_320px]">
        <div>
          <p className="mb-2 font-mono text-sm font-bold uppercase text-pink">try it live</p>
          <h2 className="mb-8 font-display text-4xl font-black lowercase tracking-tight text-text md:text-6xl">
            wrap one <span className="text-violet">right now.</span>
          </h2>

          <label className="mb-2 block font-mono text-xs font-bold uppercase text-muted">occasion</label>
          <div className="mb-5 flex flex-wrap gap-2">
            {OCCASION_LIST.map((o) => (
              <button
                key={o.key}
                onClick={() => { setOcc(o.key); setSent(false); }}
                className={`rounded-xl px-3.5 py-2 text-sm font-extrabold lowercase transition-transform hover:-translate-y-0.5 ${
                  occ === o.key
                    ? "border-2 border-ink bg-lime text-ink shadow-[3px_3px_0_0_var(--color-pink)]"
                    : "border border-line bg-surface text-text"
                }`}
              >
                <span className="mr-1.5">{o.emoji}</span>{o.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block font-mono text-xs font-bold uppercase text-muted">amount</label>
              <input className={inputCls + " tabular-nums"} value={amt} inputMode="decimal"
                onChange={(e) => { setAmt(e.target.value); setSent(false); }} />
            </div>
            <div>
              <label className="mb-2 block font-mono text-xs font-bold uppercase text-muted">token</label>
              <select className={inputCls} value={token} onChange={(e) => { setToken(e.target.value); setSent(false); }}>
                {["USDC", "SOL", "BONK", "WIF"].map((t) => <option key={t} className="bg-surface">{t}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-2 block font-mono text-xs font-bold uppercase text-muted">to</label>
              <input className={inputCls} value={to} maxLength={20}
                onChange={(e) => { setTo(e.target.value); setSent(false); }} />
            </div>
            <div>
              <label className="mb-2 block font-mono text-xs font-bold uppercase text-muted">from</label>
              <input className={inputCls} value={from} maxLength={20}
                onChange={(e) => { setFrom(e.target.value); setSent(false); }} />
            </div>
          </div>
          <div className="mt-4">
            <label className="mb-2 block font-mono text-xs font-bold uppercase text-muted">message</label>
            <input className={inputCls} value={msg} maxLength={80}
              onChange={(e) => { setMsg(e.target.value); setSent(false); }} />
          </div>

          <button
            onClick={send}
            className="mt-7 w-full rounded-2xl border-2 border-ink bg-pink py-4 font-display text-xl font-black lowercase text-white shadow-[6px_6px_0_0_var(--color-cyan)] transition-transform hover:-translate-y-1 active:translate-y-0"
          >
            wrap &amp; send 🎁
          </button>

          {sent && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
              <div className="rounded-xl border border-dashed border-line bg-surface-2 px-3.5 py-3 font-mono text-xs break-all text-muted">
                {link}
              </div>
              <div className="mt-3 flex gap-3">
                <button onClick={copy}
                  className={`rounded-xl border-2 border-ink px-4 py-2 text-sm font-extrabold lowercase text-ink transition-transform hover:-translate-y-0.5 ${copied ? "bg-lime" : "bg-cyan"}`}>
                  {copied ? "copied ✓" : "copy link"}
                </button>
                <button onClick={preview}
                  className="rounded-xl border border-line bg-surface px-4 py-2 text-sm font-extrabold lowercase text-text transition-transform hover:-translate-y-0.5">
                  preview what they get →
                </button>
              </div>
            </motion.div>
          )}
        </div>

        <div className="sticky top-24 mx-auto w-full max-w-[300px]">
          <p className="mb-3 text-center font-mono text-xs font-bold uppercase text-pink">↓ live preview</p>
          <HoloCard gift={gift} interactive />
        </div>
      </div>
    </section>
  );
}
