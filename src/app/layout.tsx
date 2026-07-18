import type { Metadata } from "next";
import { Geist_Mono, Bricolage_Grotesque, Fraunces, Plus_Jakarta_Sans, Fredoka } from "next/font/google";
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

// Rounded display — the soft, bubbly voice of the logo and wordmark
const round = Fredoka({
  variable: "--font-round",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// Serif — used for the elegant italic accent words
const serif = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["SOFT", "WONK", "opsz"],
});

export const metadata: Metadata = {
  title: "Menoid — A private crypto wallet",
  description:
    "Menoid is a Private crypto wallet. Shield your assets, transact completely unseen, and unmask safely — with one click. Join the V1 private beta waitlist for early access.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${display.variable} ${serif.variable} ${round.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SmoothScroll />
        {children}
      </body>
    </html>
  );
}
