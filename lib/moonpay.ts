"use client";

// Client-side MoonPay on-ramp launcher. Builds the buy-widget URL, has our
// server sign it (/api/moonpay/sign), and opens it in a popup. Revenue on this
// path is MoonPay's affiliate fee (configured in the partner dashboard), so no
// on-chain fee is skimmed here.

const API_KEY = process.env.NEXT_PUBLIC_MOONPAY_API_KEY || "";
const ENV = process.env.NEXT_PUBLIC_MOONPAY_ENV || "sandbox";

/** Whether a publishable key is configured — gates the UI. */
export function moonpayEnabled(): boolean {
  return API_KEY.length > 0;
}

export function moonpayBaseUrl(): string {
  return ENV === "production"
    ? "https://buy.moonpay.com"
    : "https://buy-sandbox.moonpay.com";
}

export function moonpaySellBaseUrl(): string {
  return ENV === "production"
    ? "https://sell.moonpay.com"
    : "https://sell-sandbox.moonpay.com";
}

export interface BuyParams {
  /** Solana address the purchased crypto is delivered to. */
  walletAddress?: string;
  /** MoonPay currency code, e.g. "sol" or "usdc_sol". */
  currencyCode?: string;
  /** Amount of the crypto to buy (quoteCurrencyAmount). */
  amount?: number;
  redirectURL?: string;
}

export function buildBuyUrl(p: BuyParams): string {
  const qs = new URLSearchParams({ apiKey: API_KEY });
  if (p.currencyCode) qs.set("currencyCode", p.currencyCode);
  if (p.walletAddress) qs.set("walletAddress", p.walletAddress);
  if (p.amount != null) qs.set("quoteCurrencyAmount", String(p.amount));
  if (p.redirectURL) qs.set("redirectURL", p.redirectURL);
  return `${moonpayBaseUrl()}?${qs.toString()}`;
}

export interface SellParams {
  /** The crypto being sold, e.g. "sol". */
  baseCurrencyCode?: string;
  /** Amount of crypto to sell. */
  amount?: number;
  /** Fiat to receive, e.g. "usd". */
  quoteCurrencyCode?: string;
  /** Address funds are refunded to if the sale doesn't complete. */
  refundWalletAddress?: string;
  redirectURL?: string;
}

export function buildSellUrl(p: SellParams): string {
  const qs = new URLSearchParams({ apiKey: API_KEY });
  if (p.baseCurrencyCode) qs.set("baseCurrencyCode", p.baseCurrencyCode);
  if (p.amount != null) qs.set("baseCurrencyAmount", String(p.amount));
  if (p.quoteCurrencyCode) qs.set("quoteCurrencyCode", p.quoteCurrencyCode);
  if (p.refundWalletAddress) qs.set("refundWalletAddress", p.refundWalletAddress);
  if (p.redirectURL) qs.set("redirectURL", p.redirectURL);
  return `${moonpaySellBaseUrl()}?${qs.toString()}`;
}

async function signAndOpen(unsignedUrl: string): Promise<void> {
  const res = await fetch("/api/moonpay/sign", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ url: unsignedUrl }),
  });
  if (!res.ok) {
    const { error } = await res.json().catch(() => ({ error: "signing failed" }));
    throw new Error(error || "MoonPay signing failed");
  }
  const { url } = await res.json();
  window.open(url, "moonpay", "width=460,height=760");
}

/** Build → sign (server) → open the MoonPay buy widget in a popup. */
export async function openMoonPayBuy(p: BuyParams): Promise<void> {
  await signAndOpen(buildBuyUrl(p));
}

/** Build → sign (server) → open the MoonPay sell (cash-out) widget. */
export async function openMoonPaySell(p: SellParams): Promise<void> {
  await signAndOpen(buildSellUrl(p));
}
