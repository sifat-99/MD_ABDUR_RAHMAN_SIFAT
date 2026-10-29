"use client";

import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export function GlobalBackgroundGrid() {
  const spotlightRef = useRef<HTMLDivElement>(null);
  const rippleContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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

    // Lightweight GPU-accelerated shockwave ripple: eliminates 800+ DOM nodes for maximum Lighthouse performance
    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable='true'], button, a")) return;
      if (!rippleContainerRef.current) return;

      const ripple = document.createElement("div");
      ripple.className =
        "pointer-events-none absolute rounded-full border border-primary/50 bg-primary/10 -translate-x-1/2 -translate-y-1/2 animate-shockwave";
      ripple.style.left = `${e.clientX}px`;
      ripple.style.top = `${e.clientY}px`;
      rippleContainerRef.current.appendChild(ripple);

      setTimeout(() => {
        ripple.remove();
      }, 700);
    };

    window.addEventListener("pointerdown", handlePointerDown);
    if (window.matchMedia("(pointer: fine)").matches) {
      window.addEventListener("pointermove", handlePointerMove, { passive: true });
      document.addEventListener("mouseleave", handlePointerLeave);
    }

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("mouseleave", handlePointerLeave);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
    >
      {/* Dynamic Cursor Spotlight (Follows mouse smoothly, 0 React re-renders) */}
      <div
        ref={spotlightRef}
        className="pointer-events-none absolute top-0 left-0 w-[500px] h-[500px] rounded-full opacity-0 transition-opacity duration-300 z-[2]"
        style={{
          background:
            "radial-gradient(circle, color-mix(in srgb, var(--primary) 18%, transparent) 0%, transparent 70%)",
          willChange: "transform",
        }}
      />

      {/* Ripple shockwave container */}
      <div ref={rippleContainerRef} className="absolute inset-0 z-[2]" />

      {/* 100% Full-Viewport Crisp CSS Grid Pattern (0 DOM nodes, 60fps GPU acceleration) */}
      <div
        className={cn(
          "absolute inset-0 w-full h-full",
          // Light mode: subtle 56px grid
          "[background-size:56px_56px] [background-image:linear-gradient(to_right,rgba(0,0,0,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.05)_1px,transparent_1px)]",
          // Dark mode: crisp high-tech 56px grid
          "dark:[background-image:linear-gradient(to_right,rgba(255,255,255,0.07)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.07)_1px,transparent_1px)]"
        )}
      />
    </div>
  );
}
