"use client";

import React, { useEffect, useRef, useState } from "react";
import Lenis from "lenis";
import type { SmoothScrollConfig } from "@/types/portfolio";

interface SmoothScrollProviderProps {
  initialConfig?: SmoothScrollConfig;
  children: React.ReactNode;
}

export function SmoothScrollProvider({
  initialConfig,
  children,
}: SmoothScrollProviderProps) {
  const [config, setConfig] = useState<SmoothScrollConfig>(() => ({
    enabled: initialConfig?.enabled ?? true,
    intensity: initialConfig?.intensity || "subtle",
    speed: initialConfig?.speed ?? 1.0,
  }));

  const lenisRef = useRef<Lenis | null>(null);

  // Sync with initialConfig prop if it changes
  useEffect(() => {
    if (initialConfig) {
      setConfig({
        enabled: initialConfig.enabled ?? true,
        intensity: initialConfig.intensity || "subtle",
        speed: initialConfig.speed ?? 1.0,
      });
    }
  }, [initialConfig?.enabled, initialConfig?.intensity, initialConfig?.speed]);

  // Listen for real-time live preview updates from SiteSettingsManager
  useEffect(() => {
    const handleLiveUpdate = (e: CustomEvent<SmoothScrollConfig>) => {
      if (e.detail) {
        setConfig((prev) => ({
          ...prev,
          ...e.detail,
        }));
      }
    };

    window.addEventListener(
      "portfolio:smooth-scroll-update" as any,
      handleLiveUpdate
    );
    return () => {
      window.removeEventListener(
        "portfolio:smooth-scroll-update" as any,
        handleLiveUpdate
      );
    };
  }, []);

  useEffect(() => {
    // If disabled or on mobile touch devices, use native high-performance OS scrolling (0 CPU overhead)
    const isMobileDevice =
      typeof window !== "undefined" &&
      (window.innerWidth < 768 || window.matchMedia("(pointer: coarse)").matches);

    if (config.enabled === false || isMobileDevice) {
      if (lenisRef.current) {
        lenisRef.current.destroy();
        lenisRef.current = null;
      }
      return;
    }

    const intensity = config.intensity || "subtle";
    const speedMultiplier = config.speed ?? 1.0;

    let duration = 0.8;
    let wheelMultiplier = 0.85;
    let lerp = 0.12;

    switch (intensity) {
      case "subtle":
        // Crisp micro-steps, perfectly smooth without floatiness or delay
        duration = Math.max(0.4, 0.75 / speedMultiplier);
        wheelMultiplier = 0.85 * speedMultiplier;
        lerp = Math.min(0.25, 0.14 * speedMultiplier);
        break;
      case "balanced":
        // Apple-style natural momentum
        duration = Math.max(0.6, 1.05 / speedMultiplier);
        wheelMultiplier = 1.0 * speedMultiplier;
        lerp = Math.min(0.2, 0.09 * speedMultiplier);
        break;
      case "floaty":
        // Cinematic, long luxurious glide
        duration = Math.max(0.8, 1.5 / speedMultiplier);
        wheelMultiplier = 1.15 * speedMultiplier;
        lerp = Math.min(0.15, 0.05 * speedMultiplier);
        break;
    }

    const lenis = new Lenis({
      duration,
      lerp,
      wheelMultiplier,
      touchMultiplier: 1.0,
      smoothWheel: true,
      syncTouch: false, // Keep native touch gestures on iOS/Android
    });

    lenisRef.current = lenis;

    if (typeof window !== "undefined") {
      (window as any).__lenis = lenis;
    }

    // Handle initial hash on page load
    let hashTimer: NodeJS.Timeout | undefined;
    if (typeof window !== "undefined" && window.location.hash) {
      hashTimer = setTimeout(() => {
        const id = window.location.hash.replace("#", "");
        if (id === "home") {
          lenis.scrollTo(0, { duration: 1.15 });
        } else {
          const el =
            document.getElementById(id) ||
            document.querySelector(window.location.hash);
          if (el) {
            lenis.scrollTo(el, { offset: -24, duration: 1.15 });
          }
        }
      }, 300);
    }

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      if (hashTimer) clearTimeout(hashTimer);
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
      if (typeof window !== "undefined") {
        delete (window as any).__lenis;
      }
    };
  }, [config.enabled, config.intensity, config.speed]);

  return <>{children}</>;
}
