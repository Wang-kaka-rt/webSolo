import type { Metadata } from "next";
import { Fredoka, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-fredoka",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Pangpangshop — Kawaii Stickers & Stationery",
  description:
    "Adorable kawaii sticker packs, dreamy journal sheets, and cozy stationery by Pangpangshop.",
  openGraph: {
    title: "Pangpangshop — Kawaii Stickers & Stationery",
    description:
      "Adorable kawaii sticker packs, dreamy journal sheets, and cozy stationery by Pangpangshop.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pangpangshop — Kawaii Stickers & Stationery",
    description:
      "Adorable kawaii sticker packs, dreamy journal sheets, and cozy stationery by Pangpangshop.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fredoka.variable} ${jakarta.variable}`}>
      <body className="min-h-screen bg-[#FFFDFB] text-[#5B3E3E] antialiased selection:bg-[#FFE0EA] selection:text-[#5B3E3E]">
        {children}
      </body>
    </html>
  );
}
