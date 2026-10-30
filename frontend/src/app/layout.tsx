import type { Metadata, Viewport } from "next";
import { Instrument_Sans, Outfit } from "next/font/google";
import "./globals.css";

const titulo = Outfit({
  subsets: ["latin"],
  variable: "--font-titulo",
  display: "swap",
});

const corpo = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-corpo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CineMatch",
  description:
    "Recomendador de filmes que explica por que cada filme combina com você.",
};

export const viewport: Viewport = {
  themeColor: "#0b0a1f",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${titulo.variable} ${corpo.variable}`}>
      <body>{children}</body>
    </html>
  );
}