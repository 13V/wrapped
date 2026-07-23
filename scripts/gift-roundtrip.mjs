// Proves the "bearer link" gift model end-to-end with real transactions.
//
//   wrap:  fund a throwaway keypair (the link key) with SOL
//   claim: that key sweeps its balance into a brand-new recipient wallet
//
// Runs against whatever RPC you point it at. Defaults to devnet; set
// SOLANA_RPC=http://127.0.0.1:8899 to use a local `solana-test-validator`
// (unlimited airdrops). The web app uses this exact flow in lib/solana.ts.
//
//   node scripts/gift-roundtrip.mjs

import { createRequire } from "module";
const require = createRequire(import.meta.url);
const {
  Connection, Keypair, LAMPORTS_PER_SOL, SystemProgram,
  Transaction, sendAndConfirmTransaction,
} = require("@solana/web3.js");

const RPC = process.env.SOLANA_RPC || "https://api.devnet.solana.com";
const GIFT_SOL = Number(process.env.GIFT_SOL || "0.02");
const FEE_BPS = Number(process.env.WRAPPED_FEE_BPS || "150");     // 1.5%
const FEE_FLAT_SOL = Number(process.env.WRAPPED_FEE_FLAT_SOL || "0.001");
const FEE = 5000; // tx fee, 1 sig
const c = new Connection(RPC, "confirmed");
const sol = (l) => (l / LAMPORTS_PER_SOL).toFixed(6);
const feeLamports = (giftL) =>
  Math.round((FEE_FLAT_SOL + (giftL / LAMPORTS_PER_SOL) * FEE_BPS / 10000) * LAMPORTS_PER_SOL);

async function confirm(sig) {
  await c.confirmTransaction({ signature: sig, ...(await c.getLatestBlockhash()) }, "confirmed");
}

async function main() {
  console.log(`RPC: ${RPC}\n`);
  const funder = Keypair.generate();    // stands in for the sender's wallet
  const gift = Keypair.generate();      // the link key (secret rides in the URL)
  const recipient = Keypair.generate(); // the "2-tap wallet" made on claim
  const treasury = Keypair.generate();  // where the platform fee lands
  const lamports = Math.round(GIFT_SOL * LAMPORTS_PER_SOL);
  const fee = feeLamports(lamports);

  // WRAP — the sender funds the link key AND pays the platform fee, atomically.
  console.log(`WRAP  gift ${GIFT_SOL} SOL + fee ${sol(fee)} SOL`);
  await confirm(await c.requestAirdrop(funder.publicKey, lamports + FEE + fee + FEE));
  const wrap = await sendAndConfirmTransaction(c, new Transaction().add(
    SystemProgram.transfer({ fromPubkey: funder.publicKey, toPubkey: gift.publicKey, lamports: lamports + FEE }),
    SystemProgram.transfer({ fromPubkey: funder.publicKey, toPubkey: treasury.publicKey, lamports: fee }),
  ), [funder]);
  console.log(`      link ${sol(await c.getBalance(gift.publicKey))} SOL · ` +
    `treasury +${sol(await c.getBalance(treasury.publicKey))} SOL  (tx ${wrap.slice(0, 12)}…)`);

  // CLAIM — the link key sweeps everything (minus its own fee) to the recipient.
  const bal = await c.getBalance(gift.publicKey);
  const claim = await sendAndConfirmTransaction(c, new Transaction().add(SystemProgram.transfer({
    fromPubkey: gift.publicKey, toPubkey: recipient.publicKey, lamports: bal - FEE,
  })), [gift]);
  console.log(`CLAIM swept to ${recipient.publicKey.toBase58().slice(0, 8)}…  (tx ${claim.slice(0, 12)}…)`);

  console.log(`\nresult  recipient: ${sol(await c.getBalance(recipient.publicKey))} SOL (got the gift)  ` +
    `treasury: ${sol(await c.getBalance(treasury.publicKey))} SOL (our revenue)`);
  console.log("\n✅ real SOL moved end-to-end: wrap (+fee) → link → claim");
}

main().catch((e) => {
  const m = String(e.message || e);
  if (/airdrop|429|rate/i.test(m)) {
    console.error("\n⚠ faucet rate-limited. Retry later, or run a local validator:\n" +
      "   solana-test-validator --reset\n   SOLANA_RPC=http://127.0.0.1:8899 node scripts/gift-roundtrip.mjs");
  } else {
    console.error("ERROR:", m);
  }
  process.exit(1);
});
