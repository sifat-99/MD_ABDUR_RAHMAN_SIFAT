"use client";

import React, { useState, useEffect } from "react";
import {
  IconCheck,
  IconCopy,
  IconBrandX,
  IconBrandLinkedin,
  IconArrowLeft,
  IconShare,
} from "@tabler/icons-react";
import Link from "next/link";

interface BlogReadingClientProps {
  slug: string;
  title: string;
}

export function BlogReadingClient({ slug, title }: BlogReadingClientProps) {
  const [copied, setCopied] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop || document.body.scrollTop;
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (windowHeight > 0) {
        const progress = (totalScroll / windowHeight) * 100;
        setScrollProgress(Math.min(100, Math.max(0, progress)));
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleCopyLink = async () => {
    try {
      if (typeof window !== "undefined") {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  const getShareUrl = () => {
    if (typeof window !== "undefined") {
      return encodeURIComponent(window.location.href);
    }
    return encodeURIComponent(`https://sifat.online/blog/${slug}`);
  };

  const encodedTitle = encodeURIComponent(title);

  return (
    <>
      {/* Top Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-muted/40 backdrop-blur-xs">
        <div
          className="h-full bg-gradient-to-r from-primary via-indigo-500 to-primary transition-all duration-150 ease-out shadow-[0_0_12px_var(--primary)]"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Floating or Embedded Share Bar */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleCopyLink}
          type="button"
          aria-label="Copy Article Link"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-border/80 bg-background/80 hover:bg-muted text-foreground transition-all cursor-pointer shadow-xs active:scale-95"
        >
          {copied ? (
            <>
              <IconCheck className="w-3.5 h-3.5 text-emerald-500 stroke-[2.5]" />
              <span className="text-emerald-500 font-semibold">Copied!</span>
            </>
          ) : (
            <>
              <IconCopy className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Copy Link</span>
            </>
          )}
        </button>

        <a
          href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${getShareUrl()}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Share on X"
          className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-border/80 bg-background/80 hover:bg-muted text-foreground transition-all cursor-pointer shadow-xs hover:text-primary active:scale-95"
        >
          <IconBrandX className="w-4 h-4" />
        </a>

        <a
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${getShareUrl()}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Share on LinkedIn"
          className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-border/80 bg-background/80 hover:bg-muted text-foreground transition-all cursor-pointer shadow-xs hover:text-[#0a66c2] active:scale-95"
        >
          <IconBrandLinkedin className="w-4 h-4" />
        </a>
      </div>
    </>
  );
}

export function BackToHomeButton() {
  return (
    <Link
      href="/"
      className="group inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold border border-border/80 bg-card/80 hover:bg-muted/80 backdrop-blur-md text-foreground transition-all shadow-xs hover:border-primary/50"
    >
      <IconArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
      <span>Back to Portfolio</span>
    </Link>
  );
}
