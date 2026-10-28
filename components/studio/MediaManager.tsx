"use client";

import React, { useState, useEffect } from "react";
import type { MediaAsset } from "@/types/portfolio";
import { uploadImage } from "@/lib/upload";
import {
  Image as ImageIcon,
  UploadCloud,
  Search,
  RefreshCw,
  Copy,
  Check,
  Trash2,
  ExternalLink,
  Layers,
  Filter,
} from "lucide-react";
import { useStudioConfirm, studioAlert } from "./StudioConfirmContext";

export function MediaManager() {
  const { confirm } = useStudioConfirm();
  const [media, setMedia] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [folderFilter, setFolderFilter] = useState("all");
  const [uploading, setUploading] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const loadMedia = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/studio/media");
      const data = await res.json();
      if (data.media) {
        setMedia(data.media);
      }
    } catch (err) {
      console.error("Error loading media:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedia();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        await uploadImage(files[i], folderFilter === "all" ? "general" : folderFilter);
      }
      await loadMedia();
      studioAlert.success("Media asset uploaded successfully.");
    } catch (err: any) {
      console.error("Upload error:", err);
      studioAlert.error(err.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: "Remove Media Asset?",
      description: "Are you sure you want to remove this media asset from your library?",
      confirmText: "Remove Asset",
      variant: "destructive",
    });
    if (!ok) return;
    try {
      await fetch(`/api/studio/media?id=${id}`, { method: "DELETE" });
      setMedia((prev) => prev.filter((m) => m.id !== id));
      studioAlert.success("Media asset removed.");
    } catch (err) {
      console.error("Delete media error:", err);
      studioAlert.error("Failed to remove media asset.");
    }
  };

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    studioAlert.success("Asset URL copied to clipboard!");
    setTimeout(() => setCopiedUrl(null), 2500);
  };

  const filtered = media.filter((item) => {
    const matchesSearch = !search || item.name.toLowerCase().includes(search.toLowerCase());
    const matchesFolder = folderFilter === "all" || item.folder === folderFilter;
    return matchesSearch && matchesFolder;
  });

  return (
    <div className="w-full pb-20">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-card/90 dark:bg-zinc-900/90 backdrop-blur-2xl border-b border-border py-4 px-4 sm:px-8 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <h2 className="text-2xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
            <Layers className="w-6 h-6 text-primary" />
            Media Library
          </h2>
          <p className="text-xs text-muted-foreground font-medium mt-1">
            Manage, upload, and reuse assets across your entire portfolio
          </p>
        </div>

        <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-sm self-start sm:self-auto cursor-pointer hover:scale-[1.02] active:scale-[0.98]">
          <UploadCloud className="w-4 h-4" />
          <span>{uploading ? "Uploading..." : "Upload Images"}</span>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>

      <div className="px-4 sm:px-8 space-y-6">

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl border border-border bg-card/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-2xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search assets by filename..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-muted-foreground" />
          <select
            value={folderFilter}
            onChange={(e) => setFolderFilter(e.target.value)}
            className="bg-background border border-border rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none"
          >
            <option value="all">All Categories</option>
            <option value="profile">Profile</option>
            <option value="projects">Projects</option>
            <option value="certifications">Certifications</option>
            <option value="services">Services</option>
            <option value="general">General</option>
          </select>
          <button
            onClick={loadMedia}
            className="p-2 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            title="Refresh library"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Assets Grid */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center text-muted-foreground text-xs gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-primary" />
          <span>Loading assets from CDN & database...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center space-y-3 bg-card border border-border rounded-2xl p-8">
          <div className="w-12 h-12 mx-auto rounded-xl bg-muted text-muted-foreground flex items-center justify-center">
            <ImageIcon className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-foreground">No media assets in library</p>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Drag and drop images or click "Upload Images" above to upload WebP, PNG, SVG, or JPG assets.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10 gap-4">
          {filtered.map((item) => (
            <div
              key={item.id + item.url}
              className="group rounded-xl border border-white/10 dark:border-white/5 bg-card/75 backdrop-blur-xl overflow-hidden hover:border-primary/60 transition-all flex flex-col shadow-xs hover:shadow-md"
            >
              {/* Image Preview with transparency checkerboard */}
              <div className="relative aspect-square w-full bg-[radial-gradient(#9ca3af_1px,transparent_1px)] [background-size:10px_10px] flex items-center justify-center overflow-hidden border-b border-border">
                <img
                  src={item.url}
                  alt={item.name}
                  className="w-full h-full object-contain transition-transform group-hover:scale-105"
                />

                {/* Hover Quick Action Buttons */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopy(item.url)}
                    className="p-2 rounded-lg bg-card/90 text-foreground hover:bg-card shadow-sm transition-transform hover:scale-110 cursor-pointer"
                    title="Copy URL"
                  >
                    {copiedUrl === item.url ? (
                      <Check className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-lg bg-card/90 text-foreground hover:bg-card shadow-sm transition-transform hover:scale-110 cursor-pointer"
                    title="Open Full"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  {item.source !== "sanity" && (
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="p-2 rounded-lg bg-card/90 text-destructive hover:bg-destructive hover:text-white shadow-sm transition-transform hover:scale-110 cursor-pointer"
                      title="Delete asset"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Info footer */}
              <div className="p-2.5 space-y-1">
                <p className="text-[11px] font-semibold text-foreground truncate" title={item.name}>
                  {item.name}
                </p>
                <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono">
                  <span className="capitalize">{item.folder || "general"}</span>
                  <span className="uppercase">{item.source || "CDN"}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  );
}
