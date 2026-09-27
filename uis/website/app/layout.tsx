import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://trackflow.example"),
  title: {
    default: "TrackFlow | Smarter fulfillment for growing e-commerce brands",
    template: "%s | TrackFlow",
  },
  description:
    "TrackFlow connects inventory, fulfillment, delivery, and returns across Los Angeles and Zaragoza for growing e-commerce brands.",
  openGraph: {
    title: "TrackFlow | Smarter fulfillment for growing e-commerce brands",
    description: "Reliable fulfillment and last-mile delivery across the United States and Spain.",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${manrope.variable} antialiased`}>
      <body>{children}</body>
    </html>
  );
}
