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
components/
  HoloCard.tsx      the interactive holographic card (the centerpiece)
  PackRip.tsx       the sealed foil pack → rip-to-reveal
  Hero.tsx  TryIt.tsx  Occasions.tsx  Steps.tsx  Safe.tsx
  ClaimOverlay.tsx  recipient claim view (reads the #g= gift link)
  Nav.tsx  Marquee.tsx  Magnetic.tsx
lib/
  occasions.ts      occasion series (colors, emoji, copy)
  gift.ts           gift type + base64url link encode/decode
  confetti.ts       canvas confetti burst
```

## Note

This is a front-end demo — gift links are simulated in the browser (the gift
payload rides in the URL fragment, which never touches a server) and no real
funds move. The on-chain, non-custodial escrow that backs the real product
(`wrapped-gifts`, a Solana/Anchor program) lives in a separate repo.

Not financial advice — just a nicer way to give.
