"use client";

import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { HoloCard } from "./HoloCard";
import { Reveal } from "./Reveal";
import { OCCASION_LIST, type OccasionKey } from "@/lib/occasions";
import { encodeGift, buildGiftLink, quoteFeeSol, type Gift } from "@/lib/gift";
import { fireConfetti } from "@/lib/confetti";
import { Qr } from "./Qr";

type RealState =
  | { s: "idle" }
  | { s: "minting" }
  | { s: "ready"; link: string; sig: string; address: string; feeSol: number; treasury: string }
  | { s: "error"; msg: string };

const fmtSol = (n: number) => n.toFixed(4).replace(/\.?0+$/, "");

export function TryIt() {
  const [occ, setOcc] = useState<OccasionKey>("birthday");
  const [amt, setAmt] = useState("50");
  const [token, setToken] = useState("USDC");
  const [to, setTo] = useState("maya");
  const [from, setFrom] = useState("alex");
  const [msg, setMsg] = useState("your first crypto 🎂");
  const [sent, setSent] = useState(false);
  const [copied, setCopied] = useState(false);

  const [realAmt, setRealAmt] = useState("0.02");
  const [real, setReal] = useState<RealState>({ s: "idle" });
  const [realCopied, setRealCopied] = useState(false);
  const [mp, setMp] = useState<{ note: string; link?: string; tone: "info" | "warn" } | null>(null);
  const [deliverTo, setDeliverTo] = useState("");
  const [del, setDel] = useState<{ busy?: boolean; note?: string; tone?: "info" | "warn" }>({});

  const gift: Gift = { occ, amt, token, to, from, msg };
  const link = useMemo(
    () => buildGiftLink(gift),
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

  // Real on-chain path: mint a bearer keypair, fund it with real devnet SOL,
  // and bake its secret into the link. This actually moves crypto.
  async function sendReal() {
    const sol = Math.min(Math.max(parseFloat(realAmt) || 0, 0.001), 1);
    setReal({ s: "minting" });
    try {
      const { createRealGift, encodeKey, toSol } = await import("@/lib/solana");
      const { key, sig, address, feeLamports, treasury } = await createRealGift(sol);
      const realGift: Gift = { ...gift, token: "SOL", amt: String(sol) };
      const fullLink = buildGiftLink(realGift, encodeKey(key));
      setReal({ s: "ready", link: fullLink, sig, address, feeSol: toSol(feeLamports), treasury });
      fireConfetti(0.78, 0.5);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Something went wrong.";
      setReal({
        s: "error",
        msg: /airdrop|429|rate/i.test(msg)
          ? "Devnet faucet is rate-limited right now — try again in a bit."
          : msg,
      });
    }
  }
  async function copyReal(l: string) {
    try {
      await navigator.clipboard.writeText(l);
      setRealCopied(true);
      setTimeout(() => setRealCopied(false), 1500);
    } catch {}
  }
  function openReal(l: string) {
    location.hash = l.slice(l.indexOf("#") + 1);
  }

  // On-ramp path: buy SOL with a card via MoonPay, delivered straight to a
  // fresh gift address. Revenue here is MoonPay's affiliate fee, not the wrap
  // fee. Settlement is async, so we hand over the claim link immediately.
  async function buyWithCard() {
    const sol = Math.min(Math.max(parseFloat(realAmt) || 0, 0.001), 1);
    setMp(null);
    const { moonpayEnabled, openMoonPayBuy } = await import("@/lib/moonpay");
    if (!moonpayEnabled()) {
      setMp({
        tone: "warn",
        note: "MoonPay not configured — set NEXT_PUBLIC_MOONPAY_API_KEY and MOONPAY_SECRET_KEY to enable card top-ups.",
      });
      return;
    }
    try {
      const { prepareGift, encodeKey } = await import("@/lib/solana");
      const { key, address } = prepareGift();
      const realGift: Gift = { ...gift, token: "SOL", amt: String(sol) };
      const link = buildGiftLink(realGift, encodeKey(key));
      await openMoonPayBuy({
        walletAddress: address,
        currencyCode: "sol",
        amount: sol,
        redirectURL: typeof window !== "undefined" ? location.origin : undefined,
      });
      setMp({
        tone: "info",
        link,
        note: "MoonPay opened. Once the card payment settles, the SOL lands at the gift address and they can claim.",
      });
    } catch (e) {
      setMp({ tone: "warn", note: e instanceof Error ? e.message : "Could not open MoonPay." });
    }
  }
  async function copyMp(l: string) {
    try {
      await navigator.clipboard.writeText(l);
      setRealCopied(true);
      setTimeout(() => setRealCopied(false), 1500);
    } catch {}
  }

  // Deliver the gift link by email or SMS (channel inferred from the input).
  async function sendDelivery(link: string) {
    const to = deliverTo.trim();
    if (!to) return;
    const channel = to.includes("@") ? "email" : "sms";
    setDel({ busy: true });
    try {
      const res = await fetch("/api/deliver", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ channel, to, link, from, message: msg }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) setDel({ note: `sent via ${channel} ✓`, tone: "info" });
      else setDel({ note: data.error || "couldn’t send", tone: "warn" });
    } catch (e) {
      setDel({ note: e instanceof Error ? e.message : "couldn’t send", tone: "warn" });
    }
  }

  const inputCls =
    "w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 font-bold text-text outline-none placeholder:text-muted/50 focus:border-cyan transition-colors";

  const realSol = Math.min(Math.max(parseFloat(realAmt) || 0, 0), 1);
  const feePreview = quoteFeeSol(realSol);

  return (
    <section id="try" className="relative z-10 px-4 py-20">
      <div className="mx-auto grid max-w-6xl items-start gap-12 md:grid-cols-[1fr_320px]">
        <div>
          <Reveal>
            <p className="mb-2 font-mono text-sm font-bold uppercase text-pink">try it live</p>
            <h2 className="mb-8 font-display text-4xl font-black lowercase tracking-tight text-text md:text-6xl">
              wrap one <span className="text-violet">right now.</span>
            </h2>
          </Reveal>

          <label className="mb-2 block font-mono text-xs font-bold uppercase text-muted">occasion</label>
          <div className="mb-5 flex flex-wrap gap-2">
            {OCCASION_LIST.map((o) => (
              <motion.button
                key={o.key}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.93 }}
                onClick={() => { setOcc(o.key); setSent(false); }}
                className={`rounded-xl px-3.5 py-2 text-sm font-extrabold lowercase ${
                  occ === o.key
                    ? "border-2 border-ink bg-lime text-ink shadow-[3px_3px_0_0_var(--color-pink)]"
                    : "border border-line bg-surface text-text"
                }`}
              >
                <span className="mr-1.5">{o.emoji}</span>{o.label}
              </motion.button>
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

          <motion.button
            onClick={send}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.98, y: 0 }}
            className="mt-7 w-full rounded-2xl border-2 border-ink bg-pink py-4 font-display text-xl font-black lowercase text-white shadow-[6px_6px_0_0_var(--color-cyan)]"
          >
            wrap &amp; send 🎁
          </motion.button>

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

          {/* ---------- real on-chain path (devnet) ---------- */}
          <div className="mt-8 rounded-2xl border-2 border-dashed border-violet/50 bg-surface/60 p-5">
            <div className="mb-1 flex items-center gap-2">
              <span className="rounded-md border border-violet/40 bg-violet/10 px-2 py-0.5 font-mono text-[10px] font-black uppercase tracking-wide text-violet">
                ⚡ live · {process.env.NEXT_PUBLIC_SOLANA_CLUSTER || "devnet"}
              </span>
              <span className="font-display text-sm font-black lowercase text-text">actually move real crypto</span>
            </div>
            <p className="mb-4 font-mono text-xs text-muted">
              mints a real link-wallet, funds it with devnet SOL, hides the key in the link. claim it below — real transactions, real explorer.
            </p>

            <div className="flex flex-wrap items-stretch gap-3">
              <div className="relative">
                <input
                  className={inputCls + " w-28 pr-12 tabular-nums"}
                  value={realAmt}
                  inputMode="decimal"
                  onChange={(e) => { setRealAmt(e.target.value); setReal({ s: "idle" }); }}
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 font-mono text-xs font-bold text-muted">SOL</span>
              </div>
              <motion.button
                onClick={sendReal}
                disabled={real.s === "minting"}
                whileHover={real.s === "minting" ? undefined : { y: -3 }}
                whileTap={real.s === "minting" ? undefined : { scale: 0.98 }}
                className="flex-1 rounded-xl border-2 border-ink bg-violet px-5 py-2.5 font-display text-base font-black lowercase text-white shadow-[4px_4px_0_0_var(--color-lime)] disabled:opacity-70"
              >
                {real.s === "minting" ? "minting on devnet…" : "send for real →"}
              </motion.button>
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 font-mono text-[11px] text-muted">
              <span>gift {fmtSol(realSol)} + platform fee {fmtSol(feePreview)}</span>
              <span className="font-bold text-text">you pay {fmtSol(realSol + feePreview)} SOL</span>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-line/60 pt-3">
              <span className="font-mono text-[11px] text-muted">no crypto to send?</span>
              <button
                onClick={buyWithCard}
                className="rounded-lg border-2 border-ink bg-cyan px-3 py-1.5 text-xs font-extrabold lowercase text-ink transition-transform hover:-translate-y-0.5"
              >
                💳 buy with card
              </button>
              <span className="font-mono text-[10px] uppercase tracking-wide text-muted">via moonpay</span>
            </div>

            {mp && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-3">
                <p className={`font-mono text-[11px] ${mp.tone === "warn" ? "font-bold text-pink" : "text-muted"}`}>
                  {mp.note}
                </p>
                {mp.link && (
                  <div className="mt-2">
                    <div className="rounded-xl border border-dashed border-line bg-surface-2 px-3.5 py-3 font-mono text-[11px] break-all text-muted">
                      {mp.link}
                    </div>
                    <button
                      onClick={() => copyMp(mp.link!)}
                      className={`mt-2 rounded-xl border-2 border-ink px-4 py-2 text-sm font-extrabold lowercase text-ink transition-transform hover:-translate-y-0.5 ${realCopied ? "bg-lime" : "bg-cyan"}`}
                    >
                      {realCopied ? "copied ✓" : "copy gift link"}
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {real.s === "error" && (
              <p className="mt-3 font-mono text-xs font-bold text-pink">{real.msg}</p>
            )}

            {real.s === "ready" && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
                <p className="mb-2 font-mono text-[11px] font-bold text-violet">
                  ✓ fee {fmtSol(real.feeSol)} SOL → treasury {real.treasury.slice(0, 4)}…{real.treasury.slice(-4)}
                </p>
                <div className="rounded-xl border border-dashed border-line bg-surface-2 px-3.5 py-3 font-mono text-[11px] break-all text-muted">
                  {real.link}
                </div>
                <div className="mt-3 flex flex-wrap gap-3">
                  <button onClick={() => copyReal(real.link)}
                    className={`rounded-xl border-2 border-ink px-4 py-2 text-sm font-extrabold lowercase text-ink transition-transform hover:-translate-y-0.5 ${realCopied ? "bg-lime" : "bg-cyan"}`}>
                    {realCopied ? "copied ✓" : "copy link"}
                  </button>
                  <button onClick={() => openReal(real.link)}
                    className="rounded-xl border-2 border-ink bg-lime px-4 py-2 text-sm font-extrabold lowercase text-ink shadow-[3px_3px_0_0_var(--color-pink)] transition-transform hover:-translate-y-0.5">
                    open &amp; claim it →
                  </button>
                  <a href={`https://explorer.solana.com/tx/${real.sig}?cluster=${process.env.NEXT_PUBLIC_SOLANA_CLUSTER || "devnet"}`}
                    target="_blank" rel="noreferrer"
                    className="rounded-xl border border-line bg-surface px-4 py-2 text-sm font-extrabold lowercase text-text transition-transform hover:-translate-y-0.5">
                    funded ✓ view tx ↗
                  </a>
                </div>

                {/* deliver it: QR + email/SMS */}
                <div className="mt-4 flex flex-wrap items-start gap-4 border-t border-line/60 pt-4">
                  <div className="shrink-0"><Qr value={real.link} /></div>
                  <div className="min-w-[200px] flex-1">
                    <label className="mb-1.5 block font-mono text-[10px] font-bold uppercase text-muted">
                      or send it directly
                    </label>
                    <div className="flex gap-2">
                      <input
                        value={deliverTo}
                        onChange={(e) => { setDeliverTo(e.target.value); setDel({}); }}
                        placeholder="email or phone"
                        className={inputCls + " py-2 text-sm"}
                      />
                      <button
                        onClick={() => sendDelivery(real.link)}
                        disabled={del.busy}
                        className="shrink-0 rounded-xl border-2 border-ink bg-pink px-4 py-2 text-sm font-extrabold lowercase text-white shadow-[3px_3px_0_0_var(--color-cyan)] transition-transform hover:-translate-y-0.5 disabled:opacity-70"
                      >
                        {del.busy ? "sending…" : "send"}
                      </button>
                    </div>
                    {del.note && (
                      <p className={`mt-2 font-mono text-[11px] ${del.tone === "warn" ? "font-bold text-pink" : "text-muted"}`}>
                        {del.note}
                      </p>
                    )}
                    <p className="mt-2 font-mono text-[10px] leading-relaxed text-muted">
                      scan in person, or text/email the link. bearer link — best for small gifts; escrow hardens larger ones.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        <div className="sticky top-24 mx-auto w-full max-w-[300px]">
          <p className="mb-3 text-center font-mono text-xs font-bold uppercase text-pink">↓ live preview</p>
          <HoloCard gift={gift} interactive />
        </div>
      </div>
    </section>
  );
}
