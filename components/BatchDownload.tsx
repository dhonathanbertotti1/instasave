"use client";

import { useState, useRef } from "react";
import { MediaData } from "@/types/media";

type LinkStatus = "idle" | "loading" | "success" | "error";

interface LinkEntry {
  id: string;
  url: string;
  status: LinkStatus;
  error?: string;
  data?: MediaData;
}

export default function BatchDownload() {
  const [links, setLinks] = useState<LinkEntry[]>([{ id: "1", url: "", status: "idle" }]);
  const [zipping, setZipping] = useState(false);
  const [zipProgress, setZipProgress] = useState(0);
  const [zipDone, setZipDone] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const addLink = () => {
    setLinks((prev) => [
      ...prev,
      { id: Date.now().toString(), url: "", status: "idle" },
    ]);
  };

  const removeLink = (id: string) => {
    setLinks((prev) => prev.filter((l) => l.id !== id));
  };

  const updateUrl = (id: string, url: string) => {
    setLinks((prev) =>
      prev.map((l) => (l.id === id ? { ...l, url, status: "idle", error: undefined } : l))
    );
  };

  const handleBulkPaste = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const raw = e.target.value;
    const urls = raw
      .split(/[\n,]+/)
      .map((u) => u.trim())
      .filter((u) => u.length > 0);

    if (urls.length > 0) {
      setLinks(
        urls.map((url, i) => ({ id: `bulk-${i}`, url, status: "idle" }))
      );
    }
  };

  const fetchAll = async () => {
    const validLinks = links.filter((l) => l.url.trim());
    if (validLinks.length === 0) return;

    // Mark all as loading
    setLinks((prev) =>
      prev.map((l) =>
        l.url.trim() ? { ...l, status: "loading", error: undefined, data: undefined } : l
      )
    );

    await Promise.all(
      validLinks.map(async (entry) => {
        try {
          const res = await fetch("/api/fetch", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: entry.url.trim() }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Failed");
          setLinks((prev) =>
            prev.map((l) => (l.id === entry.id ? { ...l, status: "success", data } : l))
          );
        } catch (err: unknown) {
          setLinks((prev) =>
            prev.map((l) =>
              l.id === entry.id
                ? { ...l, status: "error", error: err instanceof Error ? err.message : "Error" }
                : l
            )
          );
        }
      })
    );
  };

  const downloadAllZip = async () => {
    const successful = links.filter((l) => l.status === "success" && l.data);
    if (successful.length === 0) return;

    setZipping(true);
    setZipProgress(0);
    setZipDone(false);

    try {
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();

      const allItems: { url: string; filename: string }[] = [];
      successful.forEach((entry, ei) => {
        entry.data!.items.forEach((item, ii) => {
          const ext = item.type === "video" ? "mp4" : "jpg";
          const username = entry.data!.username.replace(/[^a-z0-9_]/gi, "_");
          allItems.push({
            url: item.url,
            filename: `${username}_${ei + 1}_${ii + 1}.${ext}`,
          });
        });
      });

      let done = 0;
      await Promise.all(
        allItems.map(async ({ url, filename }) => {
          try {
            const res = await fetch(`/api/download?url=${encodeURIComponent(url)}&filename=${filename}`);
            const blob = await res.blob();
            zip.file(filename, blob);
          } catch {
            // skip failed items
          } finally {
            done++;
            setZipProgress(Math.round((done / allItems.length) * 100));
          }
        })
      );

      const blob = await zip.generateAsync({ type: "blob" });
      const { saveAs } = await import("file-saver");
      saveAs(blob, "instagram-downloads.zip");
      setZipDone(true);
    } finally {
      setZipping(false);
    }
  };

  const successCount = links.filter((l) => l.status === "success").length;
  const loadingCount = links.filter((l) => l.status === "loading").length;
  const totalItems = links
    .filter((l) => l.status === "success" && l.data)
    .reduce((sum, l) => sum + (l.data?.items.length ?? 0), 0);

  return (
    <section id="batch" className="py-20 px-4 border-t border-white/5">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#bc1888]/10 border border-[#bc1888]/20 text-[#e6683c] text-xs font-medium mb-4">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Batch Download
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            Download <span className="gradient-text">Multiple Links</span> at Once
          </h2>
          <p className="text-gray-400">
            Paste multiple Instagram links, fetch all media, and download everything as a single <strong className="text-white">.zip</strong> file.
          </p>
        </div>

        {/* Bulk paste area */}
        <div className="glass-card rounded-2xl p-5 mb-4">
          <label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block">Paste multiple links (one per line)</label>
          <textarea
            ref={textareaRef}
            onChange={handleBulkPaste}
            placeholder={`https://www.instagram.com/p/abc123/\nhttps://www.instagram.com/reel/xyz456/\nhttps://www.instagram.com/p/def789/`}
            rows={4}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#dc2743]/50 resize-none"
          />
          <p className="text-xs text-gray-600 mt-1">Or add links individually below ↓</p>
        </div>

        {/* Individual link inputs */}
        <div className="space-y-3 mb-4">
          {links.map((entry, index) => (
            <div key={entry.id} className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="url"
                  value={entry.url}
                  onChange={(e) => updateUrl(entry.id, e.target.value)}
                  placeholder={`Instagram link #${index + 1}`}
                  className={`w-full pl-4 pr-10 py-3 rounded-xl bg-white/5 border text-sm text-white placeholder-gray-600 focus:outline-none transition-all ${
                    entry.status === "success"
                      ? "border-green-500/40 bg-green-500/5"
                      : entry.status === "error"
                      ? "border-red-500/40 bg-red-500/5"
                      : entry.status === "loading"
                      ? "border-[#dc2743]/30 animate-pulse"
                      : "border-white/10 focus:border-[#dc2743]/50"
                  }`}
                />
                {/* Status icon */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {entry.status === "loading" && (
                    <svg className="w-4 h-4 text-[#dc2743] animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  )}
                  {entry.status === "success" && (
                    <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {entry.status === "error" && (
                    <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </div>
              </div>

              {/* Success info */}
              {entry.status === "success" && entry.data && (
                <span className="text-xs text-green-400 whitespace-nowrap">
                  {entry.data.items.length} {entry.data.items.length === 1 ? "file" : "files"}
                </span>
              )}
              {entry.status === "error" && (
                <span className="text-xs text-red-400 max-w-[100px] truncate" title={entry.error}>
                  {entry.error}
                </span>
              )}

              {links.length > 1 && (
                <button
                  onClick={() => removeLink(entry.id)}
                  className="p-2 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-400/10 transition-all flex-shrink-0"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Add more button */}
        <button
          onClick={addLink}
          className="w-full py-2.5 rounded-xl border border-dashed border-white/15 text-gray-500 hover:text-gray-300 hover:border-white/30 transition-all text-sm flex items-center justify-center gap-2 mb-6"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add another link
        </button>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={fetchAll}
            disabled={loadingCount > 0 || links.every((l) => !l.url.trim())}
            className="flex-1 py-3.5 px-6 rounded-xl glass-card border border-white/10 hover:border-white/20 font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loadingCount > 0 ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Fetching {loadingCount} link{loadingCount !== 1 ? "s" : ""}...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Fetch All Links
              </>
            )}
          </button>

          <button
            onClick={downloadAllZip}
            disabled={successCount === 0 || zipping}
            className="flex-1 download-btn py-3.5 px-6 rounded-xl font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
          >
            {zipping ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Zipping... {zipProgress}%
              </>
            ) : zipDone ? (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Downloaded!
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download ZIP
                {totalItems > 0 && (
                  <span className="ml-1 px-2 py-0.5 rounded-full bg-white/20 text-xs">
                    {totalItems} {totalItems === 1 ? "file" : "files"}
                  </span>
                )}
              </>
            )}
          </button>
        </div>

        {/* ZIP progress bar */}
        {zipping && (
          <div className="mt-4 fade-in">
            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full instagram-gradient transition-all duration-300 rounded-full"
                style={{ width: `${zipProgress}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Downloading {totalItems} files and packaging into ZIP...
            </p>
          </div>
        )}

        {zipDone && !zipping && (
          <div className="mt-4 p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm text-center fade-in">
            ✓ ZIP file downloaded with {totalItems} media files
          </div>
        )}
      </div>
    </section>
  );
}
