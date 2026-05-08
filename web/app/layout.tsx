import type { Metadata } from "next";
import { SolanaProvider } from "@/components/SolanaProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Solana Trust",
  description: "Decentralized credit scoring for Solana wallets.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <SolanaProvider>{children}</SolanaProvider>
      </body>
    </html>
  );
}
