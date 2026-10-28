"use client";

import React from "react";
import {
  CheckCircle2,
  Clock,
  Save,
  RotateCcw,
  History,
  ExternalLink,
  ChevronRight,
  Layers,
  Sparkles,
} from "lucide-react";
import type { DocumentStatus } from "@/types/portfolio";

interface DocumentHeaderProps {
  title: string;
  category: string;
  status: DocumentStatus;
  saving?: boolean;
  publishing?: boolean;
  hasDraft?: boolean;
  onSaveDraft: () => void;
  onPublish: () => void;
  onDiscard?: () => void;
  onOpenHistory?: () => void;
  previewUrl?: string;
  className?: string;
}

export function DocumentHeader({
  title,
  category,
  status,
  saving = false,
  publishing = false,
  hasDraft = false,
  onSaveDraft,
  onPublish,
  onDiscard,
  onOpenHistory,
  previewUrl = "/",
  className = "",
}: DocumentHeaderProps) {
  return (
    <div className={`sticky top-0 z-30 bg-card/90 dark:bg-zinc-900/90 backdrop-blur-2xl py-4 px-4 sm:px-8 border-b border-border shadow-xs space-y-3 transition-all ${className}`}>
      {/* Breadcrumb row */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <span className="hover:text-foreground cursor-pointer">Portfolio Content</span>
        <ChevronRight className="w-3 h-3 text-muted-foreground" />
        <span className="hover:text-foreground cursor-pointer">{category}</span>
        <ChevronRight className="w-3 h-3 text-muted-foreground" />
        <span className="font-semibold text-foreground truncate max-w-[200px]">{title}</span>
      </div>

      {/* Main Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Title & Status */}
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              {title}
            </h2>

            {/* Status Badge */}
            {publishing ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
                Publishing...
              </span>
            ) : saving ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                Saving Draft...
              </span>
            ) : status === "draft" || hasDraft ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Draft (Unpublished Changes)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                Published
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Edit and manage content structure. Save working drafts or publish live to production.
          </p>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex items-center flex-wrap gap-2">
          {/* History Button */}
          {onOpenHistory && (
            <button
              type="button"
              onClick={onOpenHistory}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-border bg-card text-foreground hover:bg-muted/80 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] shadow-xs"
              title="View draft and revision history"
            >
              <History className="w-3.5 h-3.5 text-muted-foreground" />
              <span>History</span>
            </button>
          )}

          {/* Discard Draft Button (if draft is dirty/active) */}
          {(hasDraft || status === "draft") && onDiscard && (
            <button
              type="button"
              onClick={onDiscard}
              disabled={saving || publishing}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-destructive border border-destructive/20 hover:bg-destructive/10 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              title="Discard draft changes and revert to published version"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Discard Changes</span>
            </button>
          )}

          {/* Save Draft Button */}
          <button
            type="button"
            onClick={onSaveDraft}
            disabled={saving || publishing}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border border-border bg-card text-foreground hover:bg-muted/80 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] shadow-xs disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5 text-muted-foreground" />
            <span>{saving ? "Saving..." : "Save Draft"}</span>
          </button>

          {/* Publish Button (Primary Theme Color) */}
          <button
            type="button"
            onClick={onPublish}
            disabled={saving || publishing}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{publishing ? "Publishing..." : "Publish Live"}</span>
          </button>

          {/* Preview Link */}
          {previewUrl && (
            <a
              href={previewUrl}
              target="_blank"
              rel="noreferrer"
              className="p-2 text-muted-foreground hover:text-foreground rounded-xl border border-border bg-card hover:bg-muted/80 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] shadow-xs"
              title="Open Live Portfolio"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
