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
const FEE = 5000;
const c = new Connection(RPC, "confirmed");
const sol = (l) => (l / LAMPORTS_PER_SOL).toFixed(6);

async function confirm(sig) {
  await c.confirmTransaction({ signature: sig, ...(await c.getLatestBlockhash()) }, "confirmed");
}

async function main() {
  console.log(`RPC: ${RPC}\n`);
  const gift = Keypair.generate();      // the link key (secret rides in the URL)
  const recipient = Keypair.generate(); // the "2-tap wallet" made on claim
  const lamports = Math.round(GIFT_SOL * LAMPORTS_PER_SOL);

  // WRAP — fund the link key from the faucet (stands in for the sender wallet).
  console.log(`WRAP  funding link ${gift.publicKey.toBase58().slice(0, 8)}… with ${GIFT_SOL} SOL`);
  const air = await c.requestAirdrop(gift.publicKey, lamports + FEE);
  await confirm(air);
  console.log(`      link balance: ${sol(await c.getBalance(gift.publicKey))} SOL  (tx ${air.slice(0, 12)}…)`);

  // CLAIM — the link key sweeps everything (minus its own fee) to the recipient.
  const bal = await c.getBalance(gift.publicKey);
  const tx = new Transaction().add(SystemProgram.transfer({
    fromPubkey: gift.publicKey, toPubkey: recipient.publicKey, lamports: bal - FEE,
  }));
  const sig = await sendAndConfirmTransaction(c, tx, [gift]);
  console.log(`CLAIM swept to ${recipient.publicKey.toBase58().slice(0, 8)}…  (tx ${sig.slice(0, 12)}…)`);

  console.log(`\nresult  link: ${sol(await c.getBalance(gift.publicKey))} SOL (drained)  ` +
    `recipient: ${sol(await c.getBalance(recipient.publicKey))} SOL (received)`);
  console.log("\n✅ real SOL moved end-to-end: wrap → link → claim");
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
