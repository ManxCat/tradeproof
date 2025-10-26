import type { Metadata } from "next";
import "./globals.css";
import { WhopClientProvider } from "@/lib/whop-client";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "TradeProof",
  description: "Gamified trading community platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <Suspense fallback={null}>
          <WhopClientProvider>
            {children}
          </WhopClientProvider>
        </Suspense>
      </body>
    </html>
  );
}