import React from "react";

interface StudioLoaderProps {
  label?: string;
  sublabel?: string;
}

export function StudioLoader({
  label = "Loading data...",
  sublabel = "Fetching latest records from database",
}: StudioLoaderProps) {
  return (
    <div className="py-24 flex flex-col items-center justify-center text-center p-6 space-y-4 animate-in fade-in duration-300">
      <div className="relative flex items-center justify-center">
        {/* Outer glowing pulsing ring */}
        <div className="w-12 h-12 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
        <div className="absolute w-6 h-6 rounded-full bg-primary/10 animate-ping" />
        <div className="absolute w-2 h-2 rounded-full bg-primary" />
      </div>

      <div className="space-y-1">
        <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 tracking-wide">
          {label}
        </p>
        {sublabel && (
          <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
            {sublabel}
          </p>
        )}
      </div>
    </div>
  );
}
