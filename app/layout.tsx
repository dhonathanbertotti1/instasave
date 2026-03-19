import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "InstaDownloader - Download Instagram Videos, Reels, Stories & Photos",
  description:
    "Download Instagram videos, reels, stories, photos and carousel posts for free. No login required. Fast and easy Instagram downloader.",
  keywords: "instagram downloader, download instagram video, instagram reels downloader, instagram stories downloader, instagram photo downloader",
  openGraph: {
    title: "InstaDownloader - Download Instagram Videos, Reels, Stories & Photos",
    description: "Download Instagram videos, reels, stories, photos and carousel posts for free.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-[#0a0a0a] text-white antialiased">
        {children}
      </body>
    </html>
  );
}
