import type { Metadata } from "next";
import { storeConfig } from "@/config/store";
import "./globals.css";

export const metadata: Metadata = {
  title: storeConfig.name,
  description: storeConfig.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
