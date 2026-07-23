"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

/** Renders a gift link as a scannable QR (for in-person / cross-device handoff). */
export function Qr({ value, size = 132 }: { value: string; size?: number }) {
  const [src, setSrc] = useState("");

  useEffect(() => {
    let live = true;
    QRCode.toDataURL(value, {
      width: size * 2,
      margin: 1,
      color: { dark: "#141018", light: "#ffffff" },
    })
      .then((url) => live && setSrc(url))
      .catch(() => live && setSrc(""));
    return () => {
      live = false;
    };
  }, [value, size]);

  if (!src) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt="Scan to open the gift"
      width={size}
      height={size}
      className="rounded-xl border-2 border-ink bg-white p-1.5 shadow-[3px_3px_0_0_var(--color-cyan)]"
    />
  );
}
