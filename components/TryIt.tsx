"use client";

import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { HoloCard } from "./HoloCard";
import { Reveal } from "./Reveal";
import { OCCASION_LIST, type OccasionKey } from "@/lib/occasions";
import { encodeGift, buildGiftLink, quoteFeeSol, type Gift } from "@/lib/gift";
import { fireConfetti } from "@/lib/confetti";
import { Qr } from "./Qr";
import type { ResolvedToken } from "@/lib/tokens";

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

  const [ca, setCa] = useState("");
  const [custom, setCustom] = useState<ResolvedToken | null>(null);
  const [caState, setCaState] = useState<"idle" | "loading" | "error">("idle");

  const gift: Gift = custom
    ? { occ, amt, token: custom.symbol, to, from, msg, logo: custom.logo, mint: custom.mint }
    : { occ, amt, token, to, from, msg };
  const link = useMemo(
    () => buildGiftLink(gift),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [occ, amt, token, to, from, msg, custom?.mint],
  );

  async function resolveCA() {
    const q = ca.trim();
    const { looksLikeMint, resolveToken } = await import("@/lib/tokens");
    if (!looksLikeMint(q)) { setCaState("error"); return; }
    setCaState("loading");
    try {
      const tok = await resolveToken(q);
      if (!tok) { setCaState("error"); return; }
      setCustom(tok);
      setCaState("idle");
      setSent(false);
    } catch {
      setCaState("error");
    }
  }

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
    "w-full rounded-xl border border-line bg-surface-2 px-3.5 py-2.5 font-medium text-text outline-none placeholder:text-muted/50 transition-shadow focus:border-lime focus:bg-white focus:shadow-[0_0_0_3px_rgba(99,91,255,0.16)]";

  const realSol = Math.min(Math.max(parseFloat(realAmt) || 0, 0), 1);
  const feePreview = quoteFeeSol(realSol);

  return (
    <section id="try" className="relative z-10 px-4 py-20">
      <div className="mx-auto grid max-w-6xl items-start gap-12 md:grid-cols-[1fr_320px]">
        <div>
          <Reveal>
            <p className="mb-2 font-mono text-xs font-bold uppercase tracking-wide text-gold">Try it</p>
            <h2 className="mb-8 font-display text-4xl font-semibold tracking-tight text-text md:text-6xl">
              Create a <span className="text-lime">gift</span>.
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
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  occ === o.key
                    ? "border border-lime bg-lime text-white shadow-[var(--shadow-indigo)]"
                    : "border border-line bg-surface text-text hover:border-lime/40"
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
              <select className={inputCls} value={custom ? "" : token} onChange={(e) => { setToken(e.target.value); setCustom(null); setSent(false); }}>
                {custom && <option value="" className="bg-surface">{custom.symbol} (custom)</option>}
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

          {/* gift any Solana token by contract address */}
          <div className="mt-4">
            <label className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-wide text-muted">
              Or gift any token — paste its contract address
            </label>
            {custom ? (
              <div className="flex items-center gap-2.5 rounded-xl border border-line bg-surface px-3 py-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={custom.logo} alt="" width={28} height={28} className="size-7 rounded-full bg-white/10 object-cover ring-1 ring-line" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-bold text-text">
                    {custom.name} <span className="font-normal text-muted">· {custom.symbol}</span>
                  </div>
                  <div className="truncate font-mono text-[10px] text-muted">{custom.mint.slice(0, 6)}…{custom.mint.slice(-6)}</div>
                </div>
                <button onClick={() => { setCustom(null); setCa(""); }}
                  className="shrink-0 rounded-lg border border-line px-2.5 py-1 text-xs font-bold lowercase text-muted hover:text-text">
                  clear
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  className={inputCls + " font-mono text-sm"}
                  value={ca}
                  placeholder="Token mint address…"
                  onChange={(e) => { setCa(e.target.value); setCaState("idle"); }}
                  onKeyDown={(e) => { if (e.key === "Enter") resolveCA(); }}
                />
                <button onClick={resolveCA} disabled={caState === "loading"}
                  className="shrink-0 rounded-full bg-cyan px-5 py-2 text-sm font-semibold text-white shadow-[var(--shadow-hard-sm)] transition-transform hover:-translate-y-0.5 disabled:opacity-70">
                  {caState === "loading" ? "…" : "Add"}
                </button>
              </div>
            )}
            {caState === "error" && (
              <p className="mt-1.5 text-[12px] font-medium text-pink">We couldn&apos;t find that token. Please check the address.</p>
            )}
          </div>

          <motion.button
            onClick={send}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.98, y: 0 }}
            className="mt-7 w-full rounded-full bg-lime py-4 text-lg font-semibold text-white shadow-[var(--shadow-indigo)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-indigo-lg)]"
          >
            Wrap &amp; send 🎁
          </motion.button>

          {sent && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
              <div className="rounded-xl border border-dashed border-line bg-surface-2 px-3.5 py-3 font-mono text-xs break-all text-muted">
                {link}
              </div>
              <div className="mt-3 flex gap-3">
                <button onClick={copy}
                  className={`rounded-full px-4 py-2 text-sm font-semibold text-white shadow-[var(--shadow-hard-sm)] transition-transform hover:-translate-y-0.5 ${copied ? "bg-lime" : "bg-cyan"}`}>
                  {copied ? "Copied ✓" : "Copy link"}
                </button>
                <button onClick={preview}
                  className="rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-ink transition-colors hover:border-lime/40 hover:text-lime">
                  Preview what they&apos;ll get →
                </button>
              </div>
            </motion.div>
          )}

          {/* ---------- real on-chain path (devnet) ---------- */}
          <div className="mt-8 rounded-2xl border border-line bg-surface-2 p-5">
            <div className="mb-1 flex items-center gap-2">
              <span className="rounded-full border border-violet/40 bg-violet/10 px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wide text-violet">
                Live · {process.env.NEXT_PUBLIC_SOLANA_CLUSTER || "devnet"}
              </span>
              <span className="font-display text-base font-semibold text-text">Send real crypto</span>
            </div>
            <p className="mb-4 text-sm leading-relaxed text-muted">
              Creates a real gift link funded with devnet SOL and hides the key inside it. Open it below — real transactions, viewable on the explorer.
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
                className="flex-1 rounded-full bg-violet px-5 py-2.5 text-base font-semibold text-white shadow-[var(--shadow-hard)] transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-70"
              >
                {real.s === "minting" ? "Sending…" : "Send it for real →"}
              </motion.button>
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 font-mono text-[11px] text-muted">
              <span>gift {fmtSol(realSol)} + platform fee {fmtSol(feePreview)}</span>
              <span className="font-bold text-text">you pay {fmtSol(realSol + feePreview)} SOL</span>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-line/60 pt-3">
              <span className="text-sm text-muted">Don&apos;t have crypto?</span>
              <button
                onClick={buyWithCard}
                className="rounded-full bg-cyan px-4 py-1.5 text-xs font-semibold text-white shadow-[var(--shadow-hard-sm)] transition-transform hover:-translate-y-0.5"
              >
                💳 Buy with card
              </button>
              <span className="font-mono text-[10px] uppercase tracking-wide text-muted">via MoonPay</span>
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
                      className={`mt-2 rounded-full px-4 py-2 text-sm font-semibold text-white shadow-[var(--shadow-hard-sm)] transition-transform hover:-translate-y-0.5 ${realCopied ? "bg-lime" : "bg-cyan"}`}
                    >
                      {realCopied ? "Copied ✓" : "Copy gift link"}
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
                    className={`rounded-full px-4 py-2 text-sm font-semibold text-white shadow-[var(--shadow-hard-sm)] transition-transform hover:-translate-y-0.5 ${realCopied ? "bg-lime" : "bg-cyan"}`}>
                    {realCopied ? "Copied ✓" : "Copy link"}
                  </button>
                  <button onClick={() => openReal(real.link)}
                    className="rounded-full bg-lime px-4 py-2 text-sm font-semibold text-white shadow-[var(--shadow-indigo)] transition-transform hover:-translate-y-0.5">
                    Open &amp; claim it →
                  </button>
                  <a href={`https://explorer.solana.com/tx/${real.sig}?cluster=${process.env.NEXT_PUBLIC_SOLANA_CLUSTER || "devnet"}`}
                    target="_blank" rel="noreferrer"
                    className="rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-ink transition-colors hover:border-lime/40 hover:text-lime">
                    Funded ✓ View transaction ↗
                  </a>
                </div>

                {/* deliver it: QR + email/SMS */}
                <div className="mt-4 flex flex-wrap items-start gap-4 border-t border-line/60 pt-4">
                  <div className="shrink-0"><Qr value={real.link} /></div>
                  <div className="min-w-[200px] flex-1">
                    <label className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-wide text-muted">
                      Or send it directly
                    </label>
                    <div className="flex gap-2">
                      <input
                        value={deliverTo}
                        onChange={(e) => { setDeliverTo(e.target.value); setDel({}); }}
                        placeholder="Email or phone"
                        className={inputCls + " py-2 text-sm"}
                      />
                      <button
                        onClick={() => sendDelivery(real.link)}
                        disabled={del.busy}
                        className="shrink-0 rounded-xl bg-lime px-5 py-2 text-sm font-semibold text-white shadow-[var(--shadow-indigo)] transition-transform hover:-translate-y-0.5 disabled:opacity-70"
                      >
                        {del.busy ? "Sending…" : "Send"}
                      </button>
                    </div>
                    {del.note && (
                      <p className={`mt-2 font-mono text-[11px] ${del.tone === "warn" ? "font-bold text-pink" : "text-muted"}`}>
                        {del.note}
                      </p>
                    )}
                    <p className="mt-2 text-[11px] leading-relaxed text-muted">
                      Scan it in person, or send the link by text or email. Best for smaller gifts.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        <div className="sticky top-24 mx-auto w-full max-w-[300px]">
          <p className="mb-3 text-center font-mono text-xs font-bold uppercase tracking-wide text-lime">↓ Live preview</p>
          <HoloCard gift={gift} interactive />
        </div>
      </div>
    </section>
  );
}
