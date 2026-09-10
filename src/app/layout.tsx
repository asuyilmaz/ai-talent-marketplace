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
    default: "TALNIVO",
    template: "%s | TALNIVO",
  },
  description:
    "AI-powered talent and recruitment platform connecting candidates with employers.",
  keywords: [
    "TALNIVO",
    "job marketplace",
    "recruitment",
    "AI matching",
    "career platform",
    "job search",
  ],
  authors: [
    {
      name: "Fatma Asu Yılmaz",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}