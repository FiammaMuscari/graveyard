import type { Metadata } from "next";
import { Cinzel, Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700", "800", "900"],
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  weight: ["700"],
});

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
  weight: ["700"],
});

export const metadata: Metadata = {
  title: "Rest in price",
  description: "A viral cemetery for stocks that fell from their all-time highs. Educational only, not financial advice.",
  openGraph: {
    title: "Ticker Graveyard",
    description: "Find out how buried your favorite ticker is.",
    images: ["/graveyard-assets/optimized/graveyard_background.webp"]
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable} ${cinzel.variable} antialiased`}>
      <body>{children}</body>
    </html>
  );
}
