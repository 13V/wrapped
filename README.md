# Wrapped 🎁

**Gift crypto that actually slaps.** Wrap any token into a 1-of-1 holographic
card, drop the link in the group chat, and they claim it in two taps — no
wallet, no seed phrase, no gas.

This is the web app: a bold, Gen-Z, holographic-collectible take on crypto
gifting, built as an interactive demo.

## Highlights

- **Holographic foil cards** — each gift is a trading-card-shaped holo card
  that tilts in 3D to your cursor, shifts a chunky rainbow foil with a
  pointer-tracked specular glare, and flips to a holo back.
- **Pack-rip open** — the hero gift starts sealed in a holographic foil pack;
  tap to rip it open and the card springs out with confetti.
- **Live gift composer** — pick an occasion, amount, token, and message; "wrap
  & send" mints a shareable gift link.
- **⚡ Real on-chain sends (devnet)** — the composer can mint an *actual* gift:
  it funds a throwaway "link wallet" with real SOL, hides its key in the link,
  and the recipient's browser sweeps it into a fresh wallet on claim. Real
  transactions, real explorer links, no backend. See below.
- **Recipient claim flow** — opening a gift link (`#g=…`) shows the arrival and
  a claim-to-wallet moment.
- Crisp light UI with neo-brutalist chunk; the foil cards keep their own dark
  base so they pop against the page.

## Tech

- [Next.js 16](https://nextjs.org) (App Router) + React 19
- [Tailwind CSS v4](https://tailwindcss.com)
- [Motion](https://motion.dev) (Framer Motion) for the animations
- Type system via `next/font` — Unbounded, Bricolage Grotesque, Space Mono

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Build for production:

```bash
npm run build && npm start
```

Deploys as-is to [Vercel](https://vercel.com).

## Project layout

```
app/
  layout.tsx        fonts + metadata
  page.tsx          assembles the sections
  globals.css       theme tokens + holographic foil + marquee
  api/moonpay/sign  server-side MoonPay widget URL signer (secret stays server)
components/
  HoloCard.tsx      the interactive holographic card (the centerpiece)
  PackRip.tsx       the sealed foil pack → rip-to-reveal
  Hero.tsx  TryIt.tsx  Occasions.tsx  Steps.tsx  Safe.tsx
  ClaimOverlay.tsx  recipient claim view (reads the #g= gift link)
  Nav.tsx  Marquee.tsx  Magnetic.tsx
lib/
  occasions.ts      occasion series (colors, emoji, copy)
  gift.ts           gift type + base64url link encode/decode + fee policy
  solana.ts         real on-chain gifting (bearer-link create/claim + fee)
  moonpay.ts        MoonPay buy-widget launcher (client)
  moonpay-sign.ts   MoonPay URL HMAC signer (server)
  confetti.ts       canvas confetti burst
scripts/
  gift-roundtrip.mjs  CLI proof of the wrap → claim flow
```

## Real on-chain gifting

The **"actually move real crypto"** panel in the composer is not a mock. It
implements the **bearer-link** model in [`lib/solana.ts`](lib/solana.ts):

1. **wrap** — generate a throwaway keypair, fund it with real SOL from the
   cluster faucet, and encode its secret into the link fragment (`#g=…&k=…`).
   The link *is* the money; it never touches a server.
2. **claim** — the recipient's browser reads that key and sweeps the balance
   into a brand-new wallet made on the spot. The link key pays its own claim
   fee (it was funded with a little extra dust), so the recipient needs
   nothing — no app, no seed phrase, no gas.

**Revenue:** every real wrap also charges a small **platform fee** (default
1.5% + 0.001 SOL) to the sender, paid atomically to a treasury address — the
recipient still gets the full gift. There's also a **"💳 buy with card"** path
that opens a **MoonPay** on-ramp (server-signed widget URL) so senders without
crypto can fund a gift by card; add `NEXT_PUBLIC_MOONPAY_API_KEY` +
`MOONPAY_SECRET_KEY` to enable it. Rates, treasury, and MoonPay keys are all
env-configurable; see [docs/MONETIZATION.md](docs/MONETIZATION.md) for the fee
policy and the MoonPay revenue-share integration.

It defaults to **devnet** (play money). Point it elsewhere with env vars:

```bash
# devnet (default) — nothing to set, just run:
npm run dev

# against a local validator (unlimited airdrops):
solana-test-validator --reset
NEXT_PUBLIC_SOLANA_RPC=http://127.0.0.1:8899 \
NEXT_PUBLIC_SOLANA_CLUSTER=custom npm run dev
```

Prove the flow from the CLI (real transactions, no browser):

```bash
npm run gift:roundtrip                                   # devnet
SOLANA_RPC=http://127.0.0.1:8899 npm run gift:roundtrip  # local validator
```

> Bearer links are the simplest real custody model: whoever holds the link
> holds the funds, and there's no auto-expiry. The stronger model — program
> escrow with sender reclaim after expiry — is the `wrapped-gifts` Solana/Anchor
> program in the [companion repo](https://github.com/13V/solana-experiment);
> swapping `lib/solana.ts` to call it is the next step.

Not financial advice — just a nicer way to give.
