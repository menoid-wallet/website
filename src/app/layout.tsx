import type { Metadata } from "next";
import { Geist_Mono, Bricolage_Grotesque, Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";

// Body / sans — matches the wallet extension's welcome screen
const geistSans = Plus_Jakarta_Sans({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Display / headings — matches the wallet extension's welcome screen
const display = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
});

// Serif — used for the elegant italic accent words
const serif = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["SOFT", "WONK", "opsz"],
});

export const metadata: Metadata = {
  title: "Menoid — Ai Native private crypto wallet·",
  description:
    "Menoid is an AI-native private crypto wallet. Shield your assets, transact completely unseen, and unmask safely — with one click. Join the testnet waitlist for early access.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${display.variable} ${serif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* Background layer placed at -z-50 so it sits behind the negative z-index particles */}
        <div className="fixed inset-0 -z-50 bg-parchment pointer-events-none" />
        <SmoothScroll />
        {children}
      </body>
    </html>
  );
}
