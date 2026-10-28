"use client";

import React from "react";
import { LayoutGrid, List } from "lucide-react";

export type StudioViewMode = "grid" | "list";

interface StudioViewToggleProps {
  mode: StudioViewMode;
  onChange: (mode: StudioViewMode) => void;
  className?: string;
}

export function StudioViewToggle({ mode, onChange, className = "" }: StudioViewToggleProps) {
  return (
    <div
      className={`inline-flex items-center p-1 bg-muted/60 dark:bg-zinc-800/60 border border-border/80 rounded-xl shadow-2xs backdrop-blur-md ${className}`}
      role="group"
      aria-label="View Mode Switcher"
    >
      <button
        type="button"
        onClick={() => onChange("grid")}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
          mode === "grid"
            ? "bg-card dark:bg-zinc-900 text-primary shadow-xs font-bold scale-[1.02]"
            : "text-muted-foreground hover:text-foreground hover:bg-card/40"
        }`}
        title="Grid Card View"
      >
        <LayoutGrid className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Grid</span>
      </button>
      <button
        type="button"
        onClick={() => onChange("list")}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
          mode === "list"
            ? "bg-card dark:bg-zinc-900 text-primary shadow-xs font-bold scale-[1.02]"
            : "text-muted-foreground hover:text-foreground hover:bg-card/40"
        }`}
        title="Table / List View"
      >
        <List className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">List</span>
      </button>
    </div>
  );
}
