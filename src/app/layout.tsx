import type { Metadata } from "next";
import { Geist, Geist_Mono, Fraunces } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import CursorParticles from "@/components/CursorParticles";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const display = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  axes: ["SOFT", "WONK", "opsz"],
});

export const metadata: Metadata = {
  title: "Menoid — Private Wallet on Monad · Join Waitlist",
  description:
    "Menoid is an AI-native private wallet built on Monad. Shield your assets, transact completely unseen, and unmask safely — with one click. Join the testnet waitlist for early access.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${display.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* Background layer placed at -z-50 so it sits behind the negative z-index particles */}
        <div className="fixed inset-0 -z-50 bg-parchment pointer-events-none" />
        <SmoothScroll />
        <CursorParticles zIndexClass="z-[99]" />
        {children}
      </body>
    </html>
  );
}
