"use client";

import React, { useEffect } from "react";
import { X, Sparkles } from "lucide-react";

export interface StudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl";
  onSubmit?: (e: React.FormEvent) => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function StudioModal({
  isOpen,
  onClose,
  title,
  subtitle,
  maxWidth = "2xl",
  onSubmit,
  children,
  footer,
}: StudioModalProps) {
  // Prevent background page scroll while modal is open
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
    "4xl": "max-w-4xl",
    "5xl": "max-w-5xl",
  }[maxWidth];

  const headerContent = (
    <div className="relative px-6 py-4.5 border-b border-border/70 flex items-center justify-between shrink-0 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl">
      <div className="space-y-1 pr-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <h3 className="text-base sm:text-lg font-extrabold text-foreground tracking-tight font-heading leading-tight">
            {title}
          </h3>
        </div>
        {subtitle && (
          <p className="text-xs text-muted-foreground font-sans leading-relaxed pl-4">
            {subtitle}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={onClose}
        className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all cursor-pointer active:scale-95 shrink-0 border border-transparent hover:border-border/60"
        aria-label="Close modal"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );

  const footerContent = footer && (
    <div className="px-6 py-4 border-t border-border/70 bg-zinc-50/90 dark:bg-zinc-950/70 backdrop-blur-2xl flex items-center justify-end gap-3 shrink-0">
      {footer}
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`relative w-full ${maxWidthClasses} max-h-[85vh] bg-white dark:bg-zinc-900 border border-border/80 dark:border-white/15 rounded-3xl shadow-2xl shadow-black/50 overflow-hidden text-card-foreground animate-in zoom-in-95 duration-200 flex flex-col`}
        onClick={(e) => e.stopPropagation()}
        style={{
          backdropFilter: "blur(32px) saturate(190%)",
          WebkitBackdropFilter: "blur(32px) saturate(190%)",
        }}
      >
        {/* Dynamic Theme Glow Accent Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-primary/30 via-primary to-primary/30 shrink-0" />

        {onSubmit ? (
          <form onSubmit={onSubmit} className="flex flex-col h-full max-h-[calc(85vh-6px)] overflow-hidden">
            {headerContent}
            <div className="studio-modal-body flex-1 overflow-y-auto px-6 py-5 space-y-4 bg-white dark:bg-zinc-900 text-foreground font-sans">
              {children}
            </div>
            {footerContent}
          </form>
        ) : (
          <div className="flex flex-col h-full max-h-[calc(85vh-6px)] overflow-hidden">
            {headerContent}
            <div className="studio-modal-body flex-1 overflow-y-auto px-6 py-5 space-y-4 bg-white dark:bg-zinc-900 text-foreground font-sans">
              {children}
            </div>
            {footerContent}
          </div>
        )}
      </div>
    </div>
  );
}
