import crypto from "crypto";

// Server-only. Signs MoonPay widget URLs so the secret key never reaches the
// browser. Algorithm per https://dev.moonpay.com widget URL signing:
// HMAC-SHA256 of the query string (leading '?' included) → base64 → URL-encode
// → append as &signature=.

/** True if `url` points at a MoonPay host we're willing to sign. */
export function isMoonPayUrl(url: string): boolean {
  try {
    const h = new URL(url).hostname;
    return h === "moonpay.com" || h.endsWith(".moonpay.com");
  } catch {
    return false;
  }
}

export function signMoonPayUrl(url: string, secret: string): string {
  const search = new URL(url).search; // includes the leading '?'
  const signature = crypto.createHmac("sha256", secret).update(search).digest("base64");
  return `${url}&signature=${encodeURIComponent(signature)}`;
}
