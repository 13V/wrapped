import type { Metadata } from "next";
import { Fraunces, Bricolage_Grotesque, Space_Mono } from "next/font/google";
import "./globals.css";

// Warm, premium serif for headlines; a clean grotesque for body.
const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
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
  title: "Wrapped — give crypto as a gift",
  description:
    "Wrap any token into a beautiful card and send it with a link. They open it in seconds — no wallet, no app, no jargon. Non-custodial, secured on Solana.",
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
