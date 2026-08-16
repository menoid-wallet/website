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

/* Absolute URLs for the link-preview card. Vercel sets the production URL for
   us; NEXT_PUBLIC_SITE_URL overrides it if the site ever moves to its own
   domain. Without a metadataBase, Next falls back to localhost and every
   scraper gets an image URL it cannot reach. */
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

const title = "Menoid — A private crypto wallet";
const description =
  "Menoid is a private crypto wallet. Shield your assets, transact completely unseen, and unmask safely — with one click. Download V1 Testnet: Android app or browser extension.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  // og:image / twitter:image come from src/app/opengraph-image.png and
  // twitter-image.png — Next emits the tags, sizes and type from the files.
  openGraph: {
    type: "website",
    siteName: "Menoid",
    url: siteUrl,
    title,
    description,
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
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
