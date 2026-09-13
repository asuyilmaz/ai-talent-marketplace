import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "TALNIVO — Your talent. Your next level.",
    template: "%s | TALNIVO",
  },
  description:
    "AI-powered talent marketplace for smarter job matching, skill growth, interview practice, and modern recruiting.",
  keywords: [
    "TALNIVO",
    "talent marketplace",
    "AI recruitment",
    "job matching",
    "career platform",
    "interview practice",
  ],
  authors: [{ name: "TALNIVO" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
