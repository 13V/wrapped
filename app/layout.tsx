import type { Metadata } from "next";
import { Unbounded, Bricolage_Grotesque, Space_Mono } from "next/font/google";
import "./globals.css";

const display = Unbounded({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "700", "800", "900"],
});
const body = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-body",
});
const mono = Space_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Wrapped — gift crypto that actually slaps",
  description:
    "Wrap any token into a holographic gift card, drop the link, they claim in two taps. No wallet. No seed phrase. No gas.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
