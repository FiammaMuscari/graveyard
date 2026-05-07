import type { Metadata } from "next";
import "./globals.css";


export const metadata: Metadata = {
  title: "Ticker Graveyard — Rest in price",
  description: "A viral cemetery for stocks that fell from their all-time highs. Educational only, not financial advice.",
  openGraph: {
    title: "Ticker Graveyard",
    description: "Find out how buried your favorite ticker is.",
    images: ["/graveyard-assets/optimized/graveyard_background.webp"]
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="antialiased">
      <body>{children}</body>
    </html>
  );
}
