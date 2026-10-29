"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import { cn } from "@/lib/utils";

type CellStyle = React.CSSProperties & {
  "--delay"?: string;
  "--duration"?: string;
};

export function GlobalBackgroundGrid() {
  const [mounted, setMounted] = useState(false);
  const [dimensions, setDimensions] = useState<{
    rows: number;
    cols: number;
    cellSize: number;
  }>({ rows: 22, cols: 36, cellSize: 56 });

  const [clickedCell, setClickedCell] = useState<{
    row: number;
    col: number;
  } | null>(null);
  const [rippleKey, setRippleKey] = useState(0);
  const spotlightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Dynamic calculation: guarantees 100% edge-to-edge viewport coverage on any screen size
    const updateDimensions = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const cellSize = width < 640 ? 46 : width < 1024 ? 50 : 56;
      // +2 ensures zero gap on right/bottom edges on high-DPI and fractional scales
      const cols = Math.ceil(width / cellSize) + 2;
      const rows = Math.ceil(height / cellSize) + 2;
      setDimensions({ rows, cols, cellSize });
    };

    updateDimensions();
    setMounted(true);

    let resizeTimer: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(updateDimensions, 150);
    };

    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      // Do not trigger ripple when interacting with form controls or actionable links/buttons
      if (target?.closest("input, textarea, select, [contenteditable='true'], button, a")) return;

      const cellSize = dimensions.cellSize;
      // Precision coordinate mapping from viewport origin (0, 0)
      const col = Math.floor(e.clientX / cellSize);
      const row = Math.floor(e.clientY / cellSize);

      setClickedCell({ row, col });
      setRippleKey((k) => k + 1);
    };

    // Hardware-accelerated mouse spotlight with 0 React re-renders
    let hasMoved = false;
    const handlePointerMove = (e: PointerEvent) => {
      if (!spotlightRef.current) return;
      if (!hasMoved) {
        hasMoved = true;
        spotlightRef.current.style.opacity = "0.75";
      }
      spotlightRef.current.style.transform = `translate3d(${e.clientX - 250}px, ${e.clientY - 250}px, 0)`;
    };

    const handlePointerLeave = () => {
      if (spotlightRef.current) {
        spotlightRef.current.style.opacity = "0";
        hasMoved = false;
      }
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("pointerdown", handlePointerDown);
    if (window.matchMedia("(pointer: fine)").matches) {
      window.addEventListener("pointermove", handlePointerMove, { passive: true });
      document.addEventListener("mouseleave", handlePointerLeave);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("mouseleave", handlePointerLeave);
      clearTimeout(resizeTimer);
    };
  }, [dimensions.cellSize]);

  const { rows, cols, cellSize } = dimensions;

  const cells = useMemo(
    () => Array.from({ length: rows * cols }, (_, idx) => idx),
    [rows, cols]
  );

  const gridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
    gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
    width: cols * cellSize,
    height: rows * cellSize,
  };

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
    >
      {/* Dynamic Cursor Spotlight (Hidden initially, lights up crisply only on mouse movement) */}
      <div
        ref={spotlightRef}
        className="pointer-events-none absolute top-0 left-0 w-[500px] h-[500px] rounded-full opacity-0 transition-opacity duration-300 z-[2]"
        style={{
          background:
            "radial-gradient(circle, color-mix(in srgb, var(--primary) 16%, transparent) 0%, transparent 70%)",
          willChange: "transform",
        }}
      />

      {/* Grid container spanning 100% of viewport edge-to-edge from (0,0) */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <div
          key={`base-${rippleKey}`}
          className="absolute top-0 left-0 will-change-transform"
          style={gridStyle}
        >
          {cells.map((idx) => {
            const rowIdx = Math.floor(idx / cols);
            const colIdx = idx % cols;
            const distance = clickedCell
              ? Math.hypot(clickedCell.row - rowIdx, clickedCell.col - colIdx)
              : 0;
            const delay = clickedCell ? Math.max(0, distance * 45) : 0;
            const duration = 200 + distance * 65;

            const style: CellStyle = clickedCell
              ? {
                  "--delay": `${delay}ms`,
                  "--duration": `${duration}ms`,
                }
              : {};

            return (
              <div
                key={idx}
                className={cn(
                  "cell relative border-[0.5px] will-change-transform transition-colors duration-200",
                  // Crisp, razor-sharp border lines - no foggy or blurry inset shadows
                  "border-neutral-300/40 bg-neutral-100/5",
                  "dark:border-white/[0.07] dark:bg-white/[0.01]",
                  clickedCell && "animate-cell-ripple [animation-fill-mode:none]"
                )}
                style={style}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
