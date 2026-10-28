"use client";

import React, { useState, useEffect } from "react";
import type { MediaAsset } from "@/types/portfolio";
import { uploadImage } from "@/lib/upload";
import {
  Image as ImageIcon,
  UploadCloud,
  Search,
  RefreshCw,
  Check,
  X,
  ExternalLink,
} from "lucide-react";
import { studioAlert } from "./StudioConfirmContext";

interface MediaLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  title?: string;
  defaultFolder?: string;
  selectedUrl?: string;
}

export function MediaLibraryModal({
  isOpen,
  onClose,
  onSelect,
  title = "Select Image from Library",
  defaultFolder = "all",
  selectedUrl,
}: MediaLibraryModalProps) {
  const [media, setMedia] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [activeFolder, setActiveFolder] = useState(defaultFolder);
  const [uploading, setUploading] = useState(false);
  const [chosenUrl, setChosenUrl] = useState<string | null>(selectedUrl || null);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/studio/media");
      const data = await res.json();
      if (data.media) {
        setMedia(data.media);
      }
    } catch (err) {
      console.error("Failed to load media:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMedia();
      setChosenUrl(selectedUrl || null);

      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
      };
      window.addEventListener("keydown", handleKeyDown);

      return () => {
        document.body.style.overflow = originalOverflow;
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [isOpen, selectedUrl, onClose]);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const targetFolder = activeFolder === "all" ? "general" : activeFolder;
      for (let i = 0; i < files.length; i++) {
        const uploaded = await uploadImage(files[i], targetFolder);
        setChosenUrl(uploaded);
      }
      await fetchMedia();
      studioAlert.success("Media file uploaded successfully.");
    } catch (err: any) {
      console.error("Upload error:", err);
      studioAlert.error(err.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const filtered = media.filter((item) => {
    const matchesSearch = !search || item.name.toLowerCase().includes(search.toLowerCase());
    const matchesFolder = activeFolder === "all" || item.folder === activeFolder;
    return matchesSearch && matchesFolder;
  });

  const handleConfirmSelect = () => {
    if (chosenUrl) {
      onSelect(chosenUrl);
      onClose();
    }
  };

  const getSourceBadge = (source?: string) => {
    switch (source) {
      case "uploadthing":
        return <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">UploadThing</span>;
      case "firebase":
        return <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">Firebase</span>;
      case "sanity":
        return <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">Sanity CDN</span>;
      default:
        return <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border">Local</span>;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-black/60 dark:bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-4xl bg-white dark:bg-zinc-900 border border-border/80 dark:border-white/15 rounded-2xl sm:rounded-3xl shadow-2xl shadow-black/40 flex flex-col max-h-[80vh] overflow-hidden text-card-foreground animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-border/80 flex items-center justify-between shrink-0 bg-white dark:bg-zinc-900 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shadow-xs">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-foreground tracking-tight">{title}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Browse existing media, upload new assets, or select an image
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-muted-foreground hover:text-foreground rounded-xl hover:bg-muted/80 transition-colors cursor-pointer active:scale-95"
            aria-label="Close media library"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar: Search, Filter Tabs & Upload */}
        <div className="p-4 border-b border-border bg-muted/30 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search images by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Folder Filter & Upload button */}
          <div className="flex items-center gap-2">
            <select
              value={activeFolder}
              onChange={(e) => setActiveFolder(e.target.value)}
              className="bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground focus:outline-hidden"
            >
              <option value="all">All Folders</option>
              <option value="profile">Profile</option>
              <option value="projects">Projects</option>
              <option value="certifications">Certifications</option>
              <option value="services">Services</option>
              <option value="general">General</option>
            </select>

            <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-xs">
              <UploadCloud className="w-3.5 h-3.5" />
              <span>{uploading ? "Uploading..." : "Upload New"}</span>
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
        </div>

        {/* Media Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 min-h-[300px]">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-muted-foreground text-xs gap-3">
              <RefreshCw className="w-6 h-6 animate-spin text-primary" />
              <span>Loading media library...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-xl bg-muted text-muted-foreground flex items-center justify-center">
                <ImageIcon className="w-6 h-6" />
              </div>
              <p className="text-xs font-semibold text-foreground">No media assets found</p>
              <p className="text-[11px] text-muted-foreground">
                Drop your images or use "Upload New" above to populate your library.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {filtered.map((item) => {
                const isSelected = chosenUrl === item.url;
                return (
                  <div
                    key={item.id + item.url}
                    onClick={() => setChosenUrl(item.url)}
                    className={`group relative rounded-xl border overflow-hidden cursor-pointer transition-all flex flex-col bg-card ${
                      isSelected
                        ? "border-primary ring-2 ring-primary/40 shadow-md"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className="relative aspect-video w-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:10px_10px] flex items-center justify-center overflow-hidden border-b border-border">
                      <img
                        src={item.url}
                        alt={item.name}
                        className="w-full h-full object-contain transition-transform group-hover:scale-105"
                      />

                      {/* Selected checkmark overlay */}
                      {isSelected && (
                        <div className="absolute inset-0 bg-primary/20 backdrop-blur-xs flex items-center justify-center">
                          <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg">
                            <Check className="w-4 h-4 stroke-[3]" />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Metadata */}
                    <div className="p-2.5 space-y-1">
                      <p className="text-[11px] font-semibold text-foreground truncate">
                        {item.name}
                      </p>
                      <div className="flex items-center justify-between">
                        {getSourceBadge(item.source)}
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-muted-foreground hover:text-foreground"
                          title="Open full image"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sticky Modal Footer */}
        <div className="p-3.5 sm:p-4 border-t border-border/80 bg-muted/20 dark:bg-zinc-950/40 backdrop-blur-md flex items-center justify-between shrink-0">
          <div className="text-xs text-muted-foreground truncate max-w-sm">
            {chosenUrl ? (
              <span className="font-mono text-[11px] truncate block text-foreground font-semibold">
                Selected: {chosenUrl}
              </span>
            ) : (
              <span>Select an image from the grid to insert</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-border bg-muted/50 hover:bg-muted text-xs font-semibold text-foreground transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmSelect}
              disabled={!chosenUrl}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-md shadow-primary/25 disabled:opacity-50 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              Select Image
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
