import type { Metadata, Viewport } from "next";
import { Gaegu, Mali, Patrick_Hand, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const gaegu = Gaegu({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-gaegu",
});

const mali = Mali({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-mali",
});

const patrickHand = Patrick_Hand({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-patrick-hand",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: "Belajar Yuk! - Viona Learn Room",
  description:
    "Personal pastel stationery LMS and daily study planner for structured learning.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${gaegu.variable} ${mali.variable} ${patrickHand.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-screen bg-[#fcf9f4] text-[#4a3e3d] antialiased overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
