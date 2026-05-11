import type { Metadata } from "next";
import { storeConfig } from "@/config/store";
import "./globals.css";

export const metadata: Metadata = {
  title: storeConfig.name,
  description: storeConfig.description,
  icons: {
    icon: "/images/logo/favicon.png",
    shortcut: "/images/logo/favicon.png",
    apple: "/images/logo/favicon.png",
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
