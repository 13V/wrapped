import { NextResponse } from "next/server";
import { isMoonPayUrl, signMoonPayUrl } from "@/lib/moonpay-sign";

// crypto (HMAC) needs the Node runtime, and the secret must stay server-side.
export const runtime = "nodejs";

export async function POST(req: Request) {
  const secret = process.env.MOONPAY_SECRET_KEY;
  if (!secret) {
    return NextResponse.json(
      { error: "MoonPay is not configured (set MOONPAY_SECRET_KEY)." },
      { status: 501 },
    );
  }

  let url: unknown;
  try {
    ({ url } = await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  // Only ever sign MoonPay URLs — never turn our secret into a general oracle.
  if (typeof url !== "string" || !isMoonPayUrl(url)) {
    return NextResponse.json({ error: "url must be a MoonPay URL." }, { status: 400 });
  }

  return NextResponse.json({ url: signMoonPayUrl(url, secret) });
}
