import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PayoutProof — Total-loss offer audit demo",
  description: "An explainable demo for auditing a totaled-car insurance valuation against comparable listings."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
