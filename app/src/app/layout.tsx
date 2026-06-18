import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Lexend } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

const lexend = Lexend({
  variable: "--font-lexend",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Simulateur Crypto — S'investir",
  description:
    "Simulez un investissement en cryptomonnaie (achat unique ou DCA) sur données historiques. Backtest pédagogique, ne constitue pas un conseil en investissement.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${jakarta.variable} ${lexend.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-surface text-text">
        {children}
      </body>
    </html>
  );
}
