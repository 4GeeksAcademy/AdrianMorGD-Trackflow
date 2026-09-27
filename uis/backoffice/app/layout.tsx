import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TrackFlow Operations",
  description: "Internal operations workspace for TrackFlow warehouse and delivery teams.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
