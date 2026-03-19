import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "InstaDownloader - Baixar Vídeos, Reels, Stories e Fotos do Instagram",
  description:
    "Baixe vídeos, reels, stories, fotos e carrosséis do Instagram de graça. Sem precisar de login. Downloader de Instagram rápido e fácil.",
  keywords: "baixar video instagram, downloader instagram, baixar reels instagram, baixar stories instagram, baixar fotos instagram, salvar video instagram",
  openGraph: {
    title: "InstaDownloader - Baixar Vídeos, Reels, Stories e Fotos do Instagram",
    description: "Baixe vídeos, reels, stories, fotos e carrosséis do Instagram de graça. Sem login necessário.",
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
