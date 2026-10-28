"use client";

import React from "react";
import Link from "next/link";
import type { SiteSettings, Profile } from "@/types/portfolio";
import { Wrench, ShieldAlert, ArrowRight, Github, Linkedin, Twitter, Mail } from "lucide-react";

interface MaintenanceScreenProps {
  settings?: SiteSettings | null;
  profile?: Profile | null;
}

export function MaintenanceScreen({ settings, profile }: MaintenanceScreenProps) {
  const siteTitle = settings?.siteTitle || "MD: ABDUR RAHMAN SIFAT";
  const message =
    settings?.maintenanceMessage ||
    "We are currently performing scheduled maintenance and upgrades to improve our digital experience. We will be back online shortly!";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center relative overflow-hidden select-none">
      {/* Decorative Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/15 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[32rem] h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500">
        {/* Status Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-semibold tracking-wide">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
          </span>
          System Maintenance in Progress
        </div>

        {/* Animated Icon */}
        <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
          <div className="absolute inset-0 rounded-3xl bg-primary/10 border border-primary/20 rotate-6 transition-transform hover:rotate-12 duration-300" />
          <div className="absolute inset-0 rounded-3xl bg-card border border-border shadow-xl shadow-primary/10 flex items-center justify-center">
            <Wrench className="w-10 h-10 text-primary animate-pulse" />
          </div>
        </div>

        {/* Title & Description */}
        <div className="space-y-3">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground">
            {siteTitle}
          </h1>
          <h2 className="text-xl md:text-2xl font-bold text-primary">
            Under Scheduled Maintenance
          </h2>
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto">
            {message}
          </p>
        </div>

        {/* Social / Direct Reach Channels */}
        {profile?.socialLinks && (
          <div className="pt-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
              Reach Out Directly
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {profile.socialLinks.github && (
                <Link
                  href={profile.socialLinks.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-card border border-border/80 text-xs font-medium text-foreground hover:bg-muted hover:border-primary/50 transition-all shadow-xs"
                >
                  <Github className="w-3.5 h-3.5" />
                  GitHub
                </Link>
              )}
              {profile.socialLinks.linkedin && (
                <Link
                  href={profile.socialLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-card border border-border/80 text-xs font-medium text-foreground hover:bg-muted hover:border-primary/50 transition-all shadow-xs"
                >
                  <Linkedin className="w-3.5 h-3.5 text-blue-500" />
                  LinkedIn
                </Link>
              )}
              {profile.socialLinks.twitter && (
                <Link
                  href={profile.socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-card border border-border/80 text-xs font-medium text-foreground hover:bg-muted hover:border-primary/50 transition-all shadow-xs"
                >
                  <Twitter className="w-3.5 h-3.5 text-sky-500" />
                  Twitter
                </Link>
              )}
              {profile.email && (
                <Link
                  href={`mailto:${profile.email}`}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-card border border-border/80 text-xs font-medium text-foreground hover:bg-muted hover:border-primary/50 transition-all shadow-xs"
                >
                  <Mail className="w-3.5 h-3.5 text-emerald-500" />
                  Email
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Administrator Portal Access */}
        <div className="pt-6 border-t border-border/60">
          <Link
            href="/studio"
            className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-primary transition-colors group"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Administrator Access / Studio Login</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
