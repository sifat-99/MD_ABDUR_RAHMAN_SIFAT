"use client";

import React, { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import {
  IconLoader2,
  IconAlertCircle,
  IconCheck,
  IconCopy,
  IconSparkles,
} from "@tabler/icons-react";

interface MermaidDiagramProps {
  chart: string;
}

export function MermaidDiagram({ chart }: MermaidDiagramProps) {
  const [svgHtml, setSvgHtml] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [copied, setCopied] = useState(false);
  const { resolvedTheme } = useTheme();

  // Strip any accidental markdown code fences
  const cleanChart = (chart || "")
    .replace(/^```[a-zA-Z0-9_-]*\n?/, "")
    .replace(/\n?```$/, "")
    .trim();

  useEffect(() => {
    let isMounted = true;

    if (!cleanChart) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setHasError(false);

    const renderChart = async () => {
      try {
        const mermaid = (await import("mermaid")).default;
        const isDark = resolvedTheme === "dark";

        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "loose",
          theme: isDark ? "dark" : "default",
          fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
          themeVariables: isDark
            ? {
                darkMode: true,
                background: "transparent",
                primaryColor: "#10b981",
                primaryTextColor: "#ffffff",
                primaryBorderColor: "#10b981",
                lineColor: "#94a3b8",
                secondaryColor: "#1e293b",
                tertiaryColor: "#0f172a",
                noteBkgColor: "#1e1e24",
                noteTextColor: "#f1f5f9",
                noteBorderColor: "#334155",
                actorBkg: "#1e293b",
                actorTextColor: "#f8fafc",
                actorLineColor: "#64748b",
                signalColor: "#38bdf8",
                signalTextColor: "#f8fafc",
                labelBoxBkgColor: "#1e293b",
                labelBoxBorderColor: "#475569",
                labelTextColor: "#f8fafc",
              }
            : {
                darkMode: false,
                background: "transparent",
                primaryColor: "#10b981",
                primaryTextColor: "#0f172a",
                primaryBorderColor: "#059669",
                lineColor: "#64748b",
                secondaryColor: "#f1f5f9",
                tertiaryColor: "#ffffff",
                noteBkgColor: "#f8fafc",
                noteTextColor: "#0f172a",
                noteBorderColor: "#e2e8f0",
                actorBkg: "#f8fafc",
                actorTextColor: "#0f172a",
                actorLineColor: "#cbd5e1",
                signalColor: "#0284c7",
                signalTextColor: "#0f172a",
              },
        });

        const renderId = `mermaid_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`;
        const { svg } = await mermaid.render(renderId, cleanChart);

        if (isMounted) {
          setSvgHtml(svg);
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Failed to render Mermaid diagram:", err);
        if (isMounted) {
          setHasError(true);
          setIsLoading(false);
        }
      }
    };

    renderChart();

    return () => {
      isMounted = false;
    };
  }, [cleanChart, resolvedTheme]);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(cleanChart);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  if (hasError) {
    return (
      <div className="my-6 rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-xs font-mono text-foreground not-prose">
        <div className="flex items-center gap-2 text-destructive font-semibold mb-2">
          <IconAlertCircle className="w-4 h-4" />
          <span>Diagram Display Error</span>
        </div>
        <pre className="overflow-x-auto p-3 rounded-xl bg-zinc-950 text-zinc-300">
          {cleanChart}
        </pre>
      </div>
    );
  }

  return (
    <figure className="my-8 group/diagram relative not-prose">
      <div className="relative rounded-2xl sm:rounded-3xl border border-border/80 bg-card/60 dark:bg-zinc-950/60 backdrop-blur-xl shadow-lg overflow-hidden transition-all hover:border-primary/40 hover:shadow-primary/5">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/60 bg-muted/40 text-xs text-muted-foreground select-none">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="font-semibold text-foreground tracking-wide font-mono text-[11px] uppercase flex items-center gap-1.5">
              <IconSparkles className="w-3.5 h-3.5 text-primary" />
              <span>Interactive Architecture Diagram</span>
            </span>
          </div>
          <button
            type="button"
            onClick={handleCopyCode}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-muted text-[11px] font-medium transition-colors cursor-pointer text-muted-foreground hover:text-foreground active:scale-95"
            title="Copy Diagram Source Code"
          >
            {copied ? (
              <>
                <IconCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-500 font-semibold">Copied</span>
              </>
            ) : (
              <>
                <IconCopy className="w-3.5 h-3.5" />
                <span>Copy Code</span>
              </>
            )}
          </button>
        </div>

        {/* Diagram Canvas */}
        <div className="p-4 sm:p-8 flex items-center justify-center overflow-x-auto min-h-[140px] [&>svg]:max-w-full [&>svg]:h-auto [&>svg]:mx-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground py-8">
              <IconLoader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="text-xs font-mono">Rendering diagram...</span>
            </div>
          ) : (
            <div
              className="w-full flex justify-center [&>svg]:mx-auto"
              dangerouslySetInnerHTML={{ __html: svgHtml }}
            />
          )}
        </div>
      </div>
    </figure>
  );
}
