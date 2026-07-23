import { NextResponse } from "next/server";

export const runtime = "nodejs";

// Deliver a gift link by email (Resend) or SMS (Twilio). All credentials are
// server-side. Keys-gated: with none configured this returns 501 and the UI
// falls back to copy / QR.
//
// SECURITY: the link carries the bearer secret in its #fragment. Sending it
// over email/SMS means that provider transmits the secret — fine for small,
// low-value gifts, but the hardening path for larger amounts is the escrow
// program with an identity-bound claim (see docs/DELIVERY.md).

interface Body {
  channel?: "email" | "sms";
  to?: string;
  link?: string;
  from?: string;
  message?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[0-9][0-9\s\-()]{6,}$/;

export async function POST(req: Request) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { channel, to, link, from, message } = body;
  if (typeof link !== "string" || !/^https?:\/\//.test(link)) {
    return NextResponse.json({ error: "A valid gift link is required." }, { status: 400 });
  }
  const sender = (from || "someone").slice(0, 40);
  const note = (message || "").slice(0, 140);

  if (channel === "email") {
    if (typeof to !== "string" || !EMAIL_RE.test(to)) {
      return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });
    }
    return sendEmail(to, link, sender, note);
  }
  if (channel === "sms") {
    if (typeof to !== "string" || !PHONE_RE.test(to)) {
      return NextResponse.json({ error: "Enter a valid phone number." }, { status: 400 });
    }
    return sendSms(to, link, sender);
  }
  return NextResponse.json({ error: "channel must be 'email' or 'sms'." }, { status: 400 });
}

async function sendEmail(to: string, link: string, sender: string, note: string) {
  const key = process.env.RESEND_API_KEY;
  const fromAddr = process.env.DELIVER_FROM_EMAIL;
  if (!key || !fromAddr) {
    return NextResponse.json(
      { error: "Email delivery not configured (RESEND_API_KEY + DELIVER_FROM_EMAIL)." },
      { status: 501 },
    );
  }
  const html = `<div style="font-family:system-ui,sans-serif;max-width:480px">
    <h2 style="margin:0 0 8px">🎁 ${escapeHtml(sender)} sent you a Wrapped gift</h2>
    ${note ? `<p style="color:#555">“${escapeHtml(note)}”</p>` : ""}
    <p><a href="${escapeAttr(link)}" style="display:inline-block;background:#141018;color:#bfff3a;
      text-decoration:none;padding:12px 20px;border-radius:12px;font-weight:800">Open your gift →</a></p>
    <p style="color:#888;font-size:12px">Claim it in two taps — no wallet, no seed phrase, no gas.</p>
  </div>`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
    body: JSON.stringify({
      from: fromAddr,
      to,
      subject: `🎁 ${sender} sent you a gift`,
      html,
    }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    return NextResponse.json({ error: `Email send failed. ${detail}`.trim() }, { status: 502 });
  }
  return NextResponse.json({ ok: true, channel: "email" });
}

async function sendSms(to: string, link: string, sender: string) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const fromNum = process.env.TWILIO_FROM_NUMBER;
  if (!sid || !token || !fromNum) {
    return NextResponse.json(
      { error: "SMS delivery not configured (TWILIO_ACCOUNT_SID + TWILIO_AUTH_TOKEN + TWILIO_FROM_NUMBER)." },
      { status: 501 },
    );
  }
  const params = new URLSearchParams({
    To: to,
    From: fromNum,
    Body: `🎁 ${sender} sent you a Wrapped gift. Claim it (no wallet needed): ${link}`,
  });
  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: "POST",
    headers: {
      authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`,
      "content-type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    return NextResponse.json({ error: `SMS send failed. ${detail}`.trim() }, { status: 502 });
  }
  return NextResponse.json({ ok: true, channel: "sms" });
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );
}
function escapeAttr(s: string) {
  return s.replace(/"/g, "%22");
}
