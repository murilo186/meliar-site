import type { Metadata } from "next";
import { storeConfig } from "@/config/store";
import { brandAssets } from "@/lib/assets/storage-public-url";
import "./globals.css";

export const metadata: Metadata = {
  title: storeConfig.name,
  description: storeConfig.description,
  icons: {
    icon: brandAssets.favicon,
    shortcut: brandAssets.favicon,
    apple: brandAssets.favicon,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html data-scroll-behavior="smooth" lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
