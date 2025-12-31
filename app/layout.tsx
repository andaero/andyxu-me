import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next"
import "./globals.css";
import Link from "next/link";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "andy xu",
  description: "andy xu's personal website",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <nav className="nav">
          <Link href="/">home</Link>
          <Link href="/writing">writing</Link>
        </nav>
        <main className="flex-1">
          {children}
        </main>

        <footer className="footer">
          made with &lt;3 & ⋆˙⟡
        </footer>
        <Analytics />
      </body>
    </html>
  );
}
