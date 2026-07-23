# Receiving, delivering, and cashing out a gift

## What the recipient sees

Opening a gift link (`#g=…&k=…`) drops them into a full-screen moment:

1. **Arrival** — "*{sender}* sent you a gift 🎁", the holo card springs in with
   confetti, one **claim it** button. No app, no wallet, no seed phrase.
2. **Claim** — one tap sweeps the gift into a fresh wallet made on the spot; the
   link key pays its own gas, so the recipient needs nothing. They get a live
   explorer link to the on-chain claim.
3. **What now?** — a little hub: **swap to USDC**, **cash out**, or **keep it**.

## How they get the link — delivery channels

The gift is a **link**, so it travels over anything. The composer offers:

| Channel | How | Config |
| --- | --- | --- |
| **Copy / paste** | any app — iMessage, WhatsApp, DM, AirDrop | none |
| **QR code** | shown after wrap; scan in person / cross-device | none |
| **Email** | `/api/deliver` → Resend | `RESEND_API_KEY`, `DELIVER_FROM_EMAIL` |
| **SMS** | `/api/deliver` → Twilio | `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER` |

Email/SMS are **keys-gated**: with none set, the send button returns a friendly
"not configured" and the copy/QR paths still work. All credentials are
server-side (`/api/deliver` runs on the Node runtime).

### Security: the bearer-link tradeoff

The claim secret rides in the URL **`#fragment`**, which browsers never send to
any server — so copy/paste and QR never expose it to us or anyone else. But
**email and SMS transmit the whole link**, secret included, so the email host /
Twilio (and the recipient's inbox) can see it. That's fine for **small,
low-value gifts**. For larger amounts the hardening path is the **escrow
program** (`wrapped-gifts` in the companion repo): funds sit in program escrow,
not in the link key, so a claim can be bound to the recipient's *verified* phone
or email instead of "whoever holds the link." Wire that in before texting people
big gifts.

## Selling / swapping / cashing out

After claiming, the recipient holds SOL in their new wallet. The hub gives them:

- **Swap to USDC** (`lib/jupiter.ts`) — best-route quote across every Solana DEX
  via Jupiter. The claim screen shows a **live rate**; execution runs on mainnet
  (that's where liquidity is), so off-mainnet it displays the quote and notes
  it. We can take a swap fee via `NEXT_PUBLIC_WRAPPED_SWAP_FEE_BPS` — another
  revenue line. This is "transfer to a different token."
- **Cash out** (`lib/moonpay.ts` → `openMoonPaySell`) — MoonPay's off-ramp
  (server-signed, same as the buy widget). SOL → money on their card/bank; we
  earn the MoonPay affiliate fee. This is "sell it."
- **Keep it** — hold in the wallet.

> The wallet made on claim is a throwaway keypair today. For a recipient who
> comes back later to swap/sell, give them a durable **passkey/embedded wallet**
> (Privy / Dynamic / Turnkey) — still no seed phrase. That turns "claimed a
> gift" into "has a wallet."
