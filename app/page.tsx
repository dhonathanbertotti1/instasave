"use client";

import { useState } from "react";
import Header from "@/components/Header";
import DownloadForm from "@/components/DownloadForm";
import MediaResult from "@/components/MediaResult";
import HowItWorks from "@/components/HowItWorks";
import Features from "@/components/Features";
import BatchDownload from "@/components/BatchDownload";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import { MediaData } from "@/types/media";

export default function Home() {
  const [mediaData, setMediaData] = useState<MediaData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFetch = async (url: string) => {
    setLoading(true);
    setError(null);
    setMediaData(null);

    try {
      const response = await fetch("/api/fetch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Falha ao buscar a mídia");
      }

      setMediaData(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Algo deu errado. Por favor, tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setMediaData(null);
    setError(null);
  };

  return (
    <main className="flex flex-col min-h-screen">
      <Header />

      {/* Seção Hero */}
      <section className="relative flex-1 flex flex-col items-center justify-start pt-16 pb-20 px-4">
        {/* Brilho de fundo */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-r from-[#f09433]/10 via-[#dc2743]/10 to-[#bc1888]/10 blur-3xl" />
        </div>

        <div className="relative z-10 w-full max-w-3xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card text-sm text-gray-400 mb-6">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Grátis · Sem Login · Sem Marca d&apos;água
          </div>

          {/* Título */}
          <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
            Baixe Vídeos, Reels,{" "}
            <span className="gradient-text">Stories e Fotos</span>
            <br />
            <span className="gradient-text">do Instagram</span>
          </h1>

          <p className="text-gray-400 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
            Cole qualquer link do Instagram abaixo para baixar vídeos, reels, stories, fotos
            e carrosséis na hora. Sem precisar de conta.
          </p>

          <DownloadForm onFetch={handleFetch} loading={loading} onReset={handleReset} hasResult={!!mediaData} />

          {!mediaData && !loading && (
            <div className="mt-4 text-center">
              <button
                onClick={async () => {
                  setLoading(true);
                  setError(null);
                  const res = await fetch("/api/test");
                  const data = await res.json();
                  setMediaData(data);
                  setLoading(false);
                }}
                className="text-sm text-gray-500 hover:text-gray-300 transition-colors underline underline-offset-2"
              >
                Testar com um exemplo (sem link real)
              </button>
            </div>
          )}

          {error && (
            <div className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 fade-in">
              <p className="flex items-center gap-2">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </p>
            </div>
          )}

          {loading && (
            <div className="mt-10 flex flex-col items-center gap-4 fade-in">
              <div className="spinner" />
              <p className="text-gray-400">Buscando mídia...</p>
            </div>
          )}

          {mediaData && !loading && (
            <div className="mt-10 fade-in">
              <MediaResult data={mediaData} />
            </div>
          )}
        </div>

        {/* Tipos suportados */}
        <div className="relative z-10 mt-16 flex flex-wrap justify-center gap-3 px-4">
          {["Vídeos", "Reels", "Stories", "Fotos", "Carrosséis", "IGTV"].map((type) => (
            <span
              key={type}
              className="px-4 py-2 rounded-full glass-card text-sm text-gray-300 flex items-center gap-2"
            >
              <span className="w-1.5 h-1.5 rounded-full instagram-gradient inline-block" />
              {type}
            </span>
          ))}
        </div>
      </section>

      <HowItWorks />
      <Features />
      <BatchDownload />
      <FAQ />
      <Footer />
    </main>
  );
}
