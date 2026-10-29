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
  }>({ rows: 14, cols: 22, cellSize: 56 });

  const [clickedCell, setClickedCell] = useState<{
    row: number;
    col: number;
  } | null>(null);
  const [rippleKey, setRippleKey] = useState(0);
  const spotlightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Defer grid mounting until browser is idle to guarantee 0 impact on FCP/LCP
    const init = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const cellSize = width < 640 ? 48 : width < 1024 ? 52 : 56;
      // Cap max cells to keep DOM lean: max 12 rows on mobile, 16 on desktop
      const cols = Math.min(width < 640 ? 10 : 28, Math.ceil(width / cellSize));
      const rows = Math.min(width < 640 ? 16 : 20, Math.ceil(height / cellSize));
      setDimensions({ rows, cols, cellSize });
      setMounted(true);
    };

    if ("requestIdleCallback" in window) {
      (window as any).requestIdleCallback(init);
    } else {
      setTimeout(init, 50);
    }

    let resizeTimer: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const cellSize = width < 640 ? 48 : width < 1024 ? 52 : 56;
        const cols = Math.min(width < 640 ? 10 : 28, Math.ceil(width / cellSize));
        const rows = Math.min(width < 640 ? 16 : 20, Math.ceil(height / cellSize));
        setDimensions({ rows, cols, cellSize });
      }, 250);
    };

    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable='true'], button, a")) return;

      const cellSize = dimensions.cellSize;
      const col = Math.floor(e.clientX / cellSize);
      const row = Math.floor(e.clientY / cellSize);

      setClickedCell({ row, col });
      setRippleKey((k) => k + 1);
    };

    // Hardware-accelerated pointermove via Ref (0 React re-renders!)
    const handlePointerMove = (e: PointerEvent) => {
      if (!spotlightRef.current) return;
      spotlightRef.current.style.transform = `translate3d(${e.clientX - 300}px, ${e.clientY - 300}px, 0)`;
      spotlightRef.current.style.opacity = "1";
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("pointerdown", handlePointerDown);
    // Only listen to mousemove on desktop
    if (window.matchMedia("(pointer: fine)").matches) {
      window.addEventListener("pointermove", handlePointerMove, { passive: true });
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointermove", handlePointerMove);
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
    marginInline: "auto",
  };

  if (!mounted) {
    return (
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-transparent"
      />
    );
  }

  return (
    <div
      aria-hidden="true"
      className={cn(
        "fixed inset-0 pointer-events-none z-0 overflow-hidden select-none",
        "[--cell-border-color:rgba(0,0,0,0.06)] [--cell-fill-color:rgba(0,0,0,0.012)] [--cell-shadow-color:color-mix(in_srgb,var(--primary)_10%,transparent)]",
        "dark:[--cell-border-color:rgba(255,255,255,0.07)] dark:[--cell-fill-color:rgba(255,255,255,0.015)] dark:[--cell-shadow-color:color-mix(in_srgb,var(--primary)_22%,transparent)]"
      )}
    >
      {/* 60fps GPU-accelerated spotlight following mouse (zero React state updates) */}
      <div
        ref={spotlightRef}
        className="pointer-events-none absolute top-0 left-0 w-[600px] h-[600px] rounded-full opacity-0 transition-opacity duration-300 z-[2]"
        style={{
          background: "radial-gradient(circle, color-mix(in srgb, var(--primary) 14%, transparent) 0%, transparent 70%)",
          willChange: "transform",
        }}
      />

      {/* Grid container */}
      <div className="relative h-full w-full overflow-hidden flex items-center justify-center opacity-85">
        <div
          key={`base-${rippleKey}`}
          className="relative z-[1] will-change-transform"
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
                  "cell relative border-[0.5px] opacity-40 transition-opacity duration-150 will-change-transform dark:shadow-[0px_0px_36px_1px_var(--cell-shadow-color)_inset]",
                  clickedCell && "animate-cell-ripple [animation-fill-mode:none]"
                )}
                style={{
                  backgroundColor: "var(--cell-fill-color)",
                  borderColor: "var(--cell-border-color)",
                  ...style,
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
