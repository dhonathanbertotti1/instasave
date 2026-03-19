"use client";

import { MediaData, MediaItem } from "@/types/media";
import Image from "next/image";
import { useState } from "react";

interface Props {
  data: MediaData;
}

const typeLabels: Record<string, string> = {
  video: "Video",
  image: "Photo",
  carousel: "Carousel",
  story: "Story",
  reel: "Reel",
  igtv: "IGTV",
};

const typeColors: Record<string, string> = {
  video: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  image: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  carousel: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  story: "bg-pink-500/20 text-pink-400 border-pink-500/30",
  reel: "bg-green-500/20 text-green-400 border-green-500/30",
  igtv: "bg-red-500/20 text-red-400 border-red-500/30",
};

export default function MediaResult({ data }: Props) {
  const [downloading, setDownloading] = useState<number | null>(null);

  const handleDownload = async (item: MediaItem, index: number) => {
    setDownloading(index);
    try {
      const isVideo = item.type === "video";
      const ext = isVideo ? "mp4" : "jpg";
      const filename = `instagram-${data.type}-${index + 1}`;

      const downloadUrl = `/api/download?url=${encodeURIComponent(item.url)}&filename=${filename}`;

      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `${filename}.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } finally {
      setTimeout(() => setDownloading(null), 2000);
    }
  };

  const handleOpenOriginal = (url: string) => {
    window.open(data.postUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="w-full text-left">
      {/* Post info header */}
      <div className="glass-card rounded-2xl p-5 mb-4">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full instagram-gradient flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-white">@{data.username}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full border ${typeColors[data.type] || typeColors.video}`}>
                {typeLabels[data.type] || "Media"}
              </span>
              <span className="text-xs text-gray-500">
                {data.items.length} {data.items.length === 1 ? "file" : "files"} found
              </span>
            </div>
            {data.caption && (
              <p className="text-sm text-gray-400 mt-1 line-clamp-2">{data.caption}</p>
            )}
          </div>
          <button
            onClick={() => handleOpenOriginal(data.postUrl)}
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors flex items-center gap-1 flex-shrink-0"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Original
          </button>
        </div>
      </div>

      {/* Media items */}
      <div className={`grid gap-4 ${data.items.length > 1 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"}`}>
        {data.items.map((item, index) => (
          <div key={index} className="media-card rounded-2xl overflow-hidden">
            {/* Preview */}
            <div className="relative bg-black/40 aspect-square overflow-hidden">
              {item.type === "video" ? (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-2">
                      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                    <p className="text-xs text-gray-400">Video {data.items.length > 1 ? `#${index + 1}` : ""}</p>
                  </div>
                  {item.thumbnail && (
                    <Image
                      src={`/api/proxy?url=${encodeURIComponent(item.thumbnail)}`}
                      alt="Video thumbnail"
                      fill
                      className="object-cover opacity-50"
                      unoptimized
                    />
                  )}
                </div>
              ) : (
                <div className="w-full h-full relative">
                  <Image
                    src={`/api/proxy?url=${encodeURIComponent(item.url)}`}
                    alt={`Media ${index + 1}`}
                    fill
                    className="object-contain"
                    unoptimized
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                    }}
                  />
                  {/* Fallback when image fails */}
                  <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm bg-gray-900">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              )}

              {/* Type badge */}
              <div className="absolute top-2 left-2">
                <span className="text-xs px-2 py-1 rounded-full bg-black/60 text-white backdrop-blur-sm flex items-center gap-1">
                  {item.type === "video" ? (
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  ) : (
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  )}
                  {item.type === "video" ? "Video" : "Photo"}
                  {data.items.length > 1 && ` ${index + 1}/${data.items.length}`}
                </span>
              </div>
            </div>

            {/* Download button */}
            <div className="p-4">
              <button
                onClick={() => handleDownload(item, index)}
                disabled={downloading === index}
                className="download-btn w-full py-3 px-4 rounded-xl font-semibold text-white text-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {downloading === index ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Downloading...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download {item.type === "video" ? "Video" : "Photo"}{" "}
                    {data.items.length > 1 ? `#${index + 1}` : ""}
                  </>
                )}
              </button>

              {/* Direct link fallback */}
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 w-full py-2 px-4 rounded-xl text-sm text-gray-500 hover:text-gray-300 transition-colors flex items-center justify-center gap-1"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Open in new tab
              </a>
            </div>
          </div>
        ))}
      </div>

      {data.items.length > 1 && (
        <div className="mt-4 p-4 glass-card rounded-xl text-center">
          <p className="text-sm text-gray-400 mb-3">
            Download all {data.items.length} files at once
          </p>
          <button
            onClick={() => data.items.forEach((item, i) => setTimeout(() => handleDownload(item, i), i * 500))}
            className="download-btn px-6 py-2.5 rounded-xl font-semibold text-white text-sm inline-flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download All ({data.items.length})
          </button>
        </div>
      )}
    </div>
  );
}
