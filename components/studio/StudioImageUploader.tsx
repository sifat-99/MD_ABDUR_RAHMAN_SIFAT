"use client";

import React, { useState, useRef, useEffect, DragEvent } from "react";
import { uploadImage } from "@/lib/upload";
import { MediaLibraryModal } from "./MediaLibraryModal";
import {
  UploadCloud,
  Image as ImageIcon,
  Link as LinkIcon,
  Trash2,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  FileImage,
  Layers,
} from "lucide-react";

interface StudioImageUploaderProps {
  value?: string;
  altText?: string;
  folder?: string;
  label?: string;
  description?: string;
  onChange: (url: string) => void;
  onAltChange?: (alt: string) => void;
  aspectRatio?: "square" | "video" | "banner" | "free";
}

const SUPPORTED_FORMATS = ["WEBP", "PNG", "JPG", "SVG", "GIF", "AVIF", "ICO"];

export function StudioImageUploader({
  value,
  altText = "",
  folder = "portfolio",
  label = "Image Upload",
  description = "Drag & drop your image here, browse from your computer, choose from Media Library, or paste from clipboard.",
  onChange,
  onAltChange,
  aspectRatio = "free",
}: StudioImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"file" | "url">("file");
  const [urlInput, setUrlInput] = useState(value || "");
  const [altInput, setAltInput] = useState(altText);
  const [mediaModalOpen, setMediaModalOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setUrlInput(value || "");
  }, [value]);

  useEffect(() => {
    setAltInput(altText);
  }, [altText]);

  // Handle Clipboard Paste (Cmd+V / Ctrl+V)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (!containerRef.current?.contains(document.activeElement)) return;
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            e.preventDefault();
            handleProcessFile(file);
            break;
          }
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, []);

  const handleProcessFile = async (file: File) => {
    setError(null);
    setUploading(true);
    setProgress(10);

    try {
      const url = await uploadImage(file, folder, (prog) => {
        setProgress(prog);
      });
      onChange(url);
      setUrlInput(url);
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(err?.message || "Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleProcessFile(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleProcessFile(files[0]);
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (urlInput.trim()) {
      onChange(urlInput.trim());
    }
  };

  const handleClearImage = () => {
    onChange("");
    setUrlInput("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleAltChangeInternal = (val: string) => {
    setAltInput(val);
    if (onAltChange) {
      onAltChange(val);
    }
  };

  const getFormatBadge = (url?: string) => {
    if (!url) return null;
    const cleanUrl = url.split("?")[0].toLowerCase();
    for (const fmt of SUPPORTED_FORMATS) {
      if (cleanUrl.endsWith(`.${fmt.toLowerCase()}`)) return fmt;
    }
    return "IMAGE";
  };

  return (
    <div ref={containerRef} className="space-y-3">
      {/* Header with Mode Toggle and Media Library Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <FileImage className="w-3.5 h-3.5 text-primary" />
            {label}
          </label>
          {description && (
            <p className="text-[11px] text-muted-foreground mt-0.5">{description}</p>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          {/* Media Library Button (Shopify Style) */}
          <button
            type="button"
            onClick={() => setMediaModalOpen(true)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium border border-border bg-card text-foreground hover:bg-accent hover:text-accent-foreground transition-all shadow-2xs"
            title="Browse uploaded images"
          >
            <Layers className="w-3.5 h-3.5 text-primary" />
            <span>Media Library</span>
          </button>

          {/* Mode Selector */}
          <div className="inline-flex rounded-md p-0.5 bg-muted border border-border text-[11px]">
            <button
              type="button"
              onClick={() => setMode("file")}
              className={`px-2 py-0.5 rounded font-medium transition-all ${
                mode === "file"
                  ? "bg-card text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Upload
            </button>
            <button
              type="button"
              onClick={() => setMode("url")}
              className={`px-2 py-0.5 rounded font-medium transition-all ${
                mode === "url"
                  ? "bg-card text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              URL
            </button>
          </div>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/webp, image/png, image/jpeg, image/jpg, image/svg+xml, image/gif, image/avif, image/x-icon, image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Error Banner */}
      {error && (
        <div className="p-2.5 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs">
          {error}
        </div>
      )}

      {/* Upload Progress Bar */}
      {uploading && (
        <div className="p-4 rounded-xl border border-primary/30 bg-primary/5 space-y-2">
          <div className="flex items-center justify-between text-xs text-primary font-medium">
            <span className="flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              Uploading image to CDN...
            </span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-primary/20 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-primary h-1.5 transition-all duration-300 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Mode 1: File Drop Zone & Preview */}
      {mode === "file" && (
        <>
          {value ? (
            /* Active Image Preview Card */
            <div className="p-4 rounded-xl border border-border bg-card shadow-2xs space-y-4">
              <div className="flex items-start gap-4">
                {/* Thumbnail with checkerboard for transparency */}
                <div className="relative w-28 h-28 rounded-lg overflow-hidden border border-border shrink-0 bg-[radial-gradient(#9ca3af_1px,transparent_1px)] [background-size:10px_10px] flex items-center justify-center">
                  <img
                    src={value}
                    alt={altInput || "Uploaded preview"}
                    className="w-full h-full object-contain"
                  />
                  {getFormatBadge(value) && (
                    <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-background/80 text-foreground backdrop-blur-xs font-mono border border-border">
                      {getFormatBadge(value)}
                    </span>
                  )}
                </div>

                {/* Details and Actions */}
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Image Attached
                    </span>
                    <a
                      href={value}
                      target="_blank"
                      rel="noreferrer"
                      className="text-muted-foreground hover:text-foreground p-1 rounded hover:bg-muted transition-colors"
                      title="Open full size"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  <p className="text-[11px] text-muted-foreground truncate font-mono bg-muted p-1.5 rounded border border-border">
                    {value}
                  </p>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Replace
                    </button>
                    <button
                      type="button"
                      onClick={() => setMediaModalOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-border bg-card text-foreground hover:bg-accent transition-colors"
                    >
                      <Layers className="w-3 h-3 text-primary" />
                      Pick Another
                    </button>
                    <button
                      type="button"
                      onClick={handleClearImage}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Drag and Drop Zone */
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-6 transition-all duration-200 flex flex-col items-center justify-center text-center group ${
                isDragging
                  ? "border-primary bg-primary/15 scale-[1.01] shadow-lg shadow-primary/10"
                  : "border-primary/30 bg-primary/[0.03] hover:border-primary hover:bg-primary/[0.08]"
              }`}
            >
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors mb-3 ${
                  isDragging
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground group-hover:scale-110 shadow-xs"
                }`}
              >
                <UploadCloud className="w-6 h-6 transition-transform" />
              </div>

              <div className="space-y-1">
                <p className="text-xs font-semibold text-foreground">
                  <span className="text-primary font-bold underline decoration-primary/40">
                    Click to browse
                  </span>{" "}
                  or drag and drop your image
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Supports paste (<kbd className="font-mono text-[10px] px-1 py-0.5 rounded bg-muted border border-border">Ctrl+V</kbd>) or choose from Media Library
                </p>
              </div>

              {/* Supported Format Pills */}
              <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3 pt-3 border-t border-border/80">
                {SUPPORTED_FORMATS.map((fmt) => (
                  <span
                    key={fmt}
                    className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground border border-border/80"
                  >
                    {fmt}
                  </span>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Mode 2: Direct URL Input */}
      {mode === "url" && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <LinkIcon className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="url"
                placeholder="https://example.com/image.webp"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleUrlSubmit(e);
                  }
                }}
                className="w-full pl-9 pr-3 py-2 bg-card border border-border rounded-lg text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <button
              type="button"
              onClick={handleUrlSubmit}
              className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-xs font-semibold transition-colors shadow-2xs cursor-pointer"
            >
              Apply URL
            </button>
          </div>
          {value && (
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Image URL currently set
            </p>
          )}
        </div>
      )}

      {/* SEO Alt Text Field */}
      {onAltChange && (
        <div className="pt-1">
          <label className="text-[11px] font-medium text-muted-foreground block mb-1">
            Alternative Text (Alt text for SEO & Accessibility)
          </label>
          <input
            type="text"
            placeholder="e.g. Portrait photo of Md. Abdur Rahman Sifat"
            value={altInput}
            onChange={(e) => handleAltChangeInternal(e.target.value)}
            className="w-full px-3 py-1.5 bg-card border border-border rounded-lg text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      )}

      {/* Shopify-style Media Library Modal */}
      <MediaLibraryModal
        isOpen={mediaModalOpen}
        selectedUrl={value}
        onClose={() => setMediaModalOpen(false)}
        onSelect={(newUrl) => {
          onChange(newUrl);
          setUrlInput(newUrl);
        }}
      />
    </div>
  );
}
