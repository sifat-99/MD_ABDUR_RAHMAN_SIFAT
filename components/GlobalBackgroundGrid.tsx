"use client";

import React, { useEffect, useState, useMemo } from "react";
import { cn } from "@/lib/utils";

type CellStyle = React.CSSProperties & {
  "--delay"?: string;
  "--duration"?: string;
};

export function GlobalBackgroundGrid() {
  const [dimensions, setDimensions] = useState<{
    rows: number;
    cols: number;
    cellSize: number;
  }>({ rows: 16, cols: 26, cellSize: 56 });

  const [clickedCell, setClickedCell] = useState<{
    row: number;
    col: number;
  } | null>(null);
  const [rippleKey, setRippleKey] = useState(0);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const updateDimensions = () => {
      if (typeof window === "undefined") return;
      const width = window.innerWidth;
      const height = window.innerHeight;
      const cellSize = width < 640 ? 44 : width < 1024 ? 50 : 56;
      const cols = Math.ceil(width / cellSize) + 1;
      const rows = Math.ceil(height / cellSize) + 1;
      setDimensions({ rows, cols, cellSize });
    };

    updateDimensions();

    let resizeTimer: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(updateDimensions, 200);
    };

    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      // Skip ripple when interacting with text inputs or studio editors
      if (target?.closest("input, textarea, select, [contenteditable='true']")) return;

      const cellSize = dimensions.cellSize;
      const col = Math.floor(e.clientX / cellSize);
      const row = Math.floor(e.clientY / cellSize);

      setClickedCell({ row, col });
      setRippleKey((k) => k + 1);
    };

    const handlePointerMove = (e: PointerEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointermove", handlePointerMove, { passive: true });

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

  return (
    <div
      aria-hidden="true"
      className={cn(
        "fixed inset-0 pointer-events-none z-0 overflow-hidden select-none",
        "[--cell-border-color:rgba(0,0,0,0.06)] [--cell-fill-color:rgba(0,0,0,0.012)] [--cell-shadow-color:color-mix(in_srgb,var(--primary)_10%,transparent)]",
        "dark:[--cell-border-color:rgba(255,255,255,0.07)] dark:[--cell-fill-color:rgba(255,255,255,0.015)] dark:[--cell-shadow-color:color-mix(in_srgb,var(--primary)_22%,transparent)]"
      )}
    >
      {/* Subtle ambient mouse follow spotlight */}
      {mousePos && (
        <div
          className="pointer-events-none absolute inset-0 z-[2] transition-opacity duration-300"
          style={{
            background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, color-mix(in srgb, var(--primary) 12%, transparent), transparent 75%)`,
          }}
        />
      )}

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
