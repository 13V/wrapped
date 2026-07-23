# How Wrapped makes money

The whole app is **non-custodial** — Wrapped never holds user funds. That's a
feature (it keeps us software, not a money transmitter), but it means we can't
profit the way gift-card companies do, off *breakage* and *float*. We profit on
the **transaction** and the **experience**. Two levers are the near-term plan;
one is already live.

---

## 1. Platform fee on the wrap — ✅ LIVE (devnet)

A small fee charged to the **sender** on top of the gift, at wrap time. The
recipient always receives the full gift; the fee is extra.

**Policy** (`lib/gift.ts`, one source of truth):

```
fee = FEE_FLAT_SOL + gift * (FEE_BPS / 10_000)
    = 0.001 SOL flat + 1.5%          (defaults)
```

Configurable without code changes:

| Env var | Default | Meaning |
| --- | --- | --- |
| `NEXT_PUBLIC_WRAPPED_FEE_BPS` | `150` | percentage fee, in basis points (150 = 1.5%) |
| `NEXT_PUBLIC_WRAPPED_FEE_FLAT_SOL` | `0.001` | flat fee per gift, in SOL |
| `NEXT_PUBLIC_WRAPPED_TREASURY` | demo address | where the fee lands |

**Mechanism** (`lib/solana.ts` → `createRealGift`): the sender's wallet signs
**one atomic transaction** with two transfers — gift → link key, fee → treasury.
They settle together or not at all. Verify it end-to-end:

```bash
SOLANA_RPC=http://127.0.0.1:8899 npm run gift:roundtrip
#   result  recipient: 0.020000 SOL (got the gift)  treasury: 0.001300 SOL (our revenue)
```

The composer shows the sender the full breakdown ("gift 0.02 + platform fee
0.0013 → you pay 0.0213 SOL") before they send, and confirms the collected fee
after.

> On mainnet this same transfer skims a real cut of every gift. At 1.5% + a
> small flat, a $50 gift nets ~$1.70; margin is ~100% (no inventory, no float).

---

## 2. On-ramp revenue share (MoonPay) — planned, biggest line

Gifting is a **funding event**: most senders don't already hold the token, so
they buy it to gift. That fresh-fiat inflow is exactly what fiat on-ramps pay a
referral cut for — so the "fund your gift" step is our highest-value real estate.

### How MoonPay's economics work (as researched, July 2026)

- **No integration/subscription fee.** The dashboard paywall was removed
  (Apr 2026). You onboard as a partner for free.
- **MoonPay's own fees** on a card buy: ~**4.5% platform fee** + a ~**1–3%
  spread** baked into the quote.
- **Our cut:** partners can **set their own fee on top**, charged per
  transaction, configured in the Partner Dashboard (On-ramp → Fees). This is
  the affiliate revenue — it flows to us on every gift funded through the widget.
- **Volume rev-share:** larger negotiated share + a dedicated compliance contact
  once volume picks up.
- **Solana supported** (SOL, USDC) — matches what we gift.

### Integration shape

Two options; we want the **hosted widget** (fastest, MoonPay owns KYC/payments/UI):

1. Get a partner API key (publishable + secret) from the MoonPay dashboard.
2. Launch the buy widget pointed at the gift's funding address, e.g.

   ```
   https://buy.moonpay.com?apiKey=pk_live_xxx
     &walletAddress=<gift funding address>
     &currencyCode=sol           # or usdc_sol
     &baseCurrencyCode=usd
     &baseCurrencyAmount=50
     &redirectURL=<back to the wrap flow>
   ```

3. **Sign the URL server-side**: HMAC-SHA256 of the query string with the secret
   key, base64, appended as `&signature=`. (Never ship the secret to the
   browser — this is the one piece that needs a tiny backend or edge function.)
4. Set the partner fee in the dashboard; it's withheld automatically and paid
   out to us — no on-chain plumbing on our side.

### Where it slots into the product

Today the composer funds gifts from the devnet faucet (a stand-in for the
sender's wallet). The mainnet flow becomes: **compose → MoonPay buy for
`amount + platform fee` → funds land at the gift address → link minted.** The
sender never needs to pre-own crypto, and we earn on both the on-ramp (MoonPay
affiliate fee) *and* the wrap (lever #1).

Docs: <https://dev.moonpay.com/> · widget params
<https://dev.moonpay.com/widget/on-ramp/customization/parameters.md> · URL
signing <https://dev.moonpay.com/widget/on-ramp/customization/url-signing.md>

---

## Stacked take on a $50 gift

| Lever | Rate | Take |
| --- | --- | --- |
| On-ramp affiliate (MoonPay) | ~0.5–1% | ~$0.35 |
| Platform fee (live) | 1.5% + $0.99-equiv | ~$1.70 |
| Premium card (future, ~30% attach) | $1.99 | ~$0.60 avg |

→ **~$2.50–3 per $50 gift, ~100% gross margin.** The growth flywheel: every
gift is a link to a new person who opens a wallet to claim → the recipient
becomes a sender. The product is its own distribution.

## Deliberately *not* doing (early)

- **Float/yield on unclaimed gifts** — unclaimed gifts reclaim to the *sender*
  by design (the trust feature); skimming yield off user funds breaks the
  non-custodial story.
- **Our own token** — financing/marketing with legal risk, not profit.
- **Over-charging** — nobody pays 10% to gift $20; keep fees modest, win on
  volume + the viral loop.

> Compliance note: even non-custodial, on-ramp KYC and state money-transmission
> law touch this. Talk to counsel before a mainnet launch.
