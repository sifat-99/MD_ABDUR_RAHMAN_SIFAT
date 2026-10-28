"use client";

import React, { useState, useEffect } from "react";
import type { SiteSettings, ThemeConfig, SmoothScrollConfig } from "@/types/portfolio";
import { getSiteSettings, saveSiteSettings } from "@/lib/db-service";
import {
  THEME_PALETTES,
  getPaletteById,
  FONT_SCHEMES,
  getFontSchemeById,
  generateThemeCss,
} from "@/lib/theme-presets";
import { StudioImageUploader } from "./StudioImageUploader";
import { StudioLoader } from "./StudioLoader";
import { useStudioConfirm, studioAlert } from "./StudioConfirmContext";
import {
  Save,
  CheckCircle2,
  ShieldCheck,
  UserPlus,
  Trash2,
  Palette,
  Globe,
  ImageIcon,
  Sliders,
  Check,
  Sparkles,
  Type,
  ArrowRight,
  Activity,
  MousePointer,
} from "lucide-react";

const SUPER_ADMIN = "mdabdurrahmansifat@gmail.com";

type SettingsTab = "theme" | "typography" | "branding" | "general" | "admins" | "features";

export function SiteSettingsManager() {
  const { confirm } = useStudioConfirm();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [activeTab, setActiveTab] = useState<SettingsTab>("theme");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [fontCategory, setFontCategory] = useState<string>("all");
  const [testHeadingText, setTestHeadingText] = useState(
    "Architecting Scalable Web Applications & AI Systems"
  );

  const applyThemeLocally = (targetSettings: SiteSettings) => {
    if (typeof document !== "undefined") {
      const scheme = getFontSchemeById(targetSettings?.themeConfig?.activeFontSchemeId);
      let fontLink = document.getElementById("dynamic-google-font") as HTMLLinkElement | null;
      if (scheme.googleFontQuery) {
        if (!fontLink) {
          fontLink = document.createElement("link");
          fontLink.id = "dynamic-google-font";
          fontLink.rel = "stylesheet";
          document.head.appendChild(fontLink);
        }
        fontLink.href = `https://fonts.googleapis.com/css2?${scheme.googleFontQuery}&display=swap`;
      } else if (fontLink) {
        fontLink.remove();
      }

      const css = generateThemeCss(targetSettings);
      let el = document.getElementById("dynamic-theme-palette");
      if (!el) {
        el = document.createElement("style");
        el.id = "dynamic-theme-palette";
        document.head.appendChild(el);
      }
      el.innerHTML = css;

      if (typeof window !== "undefined" && targetSettings?.smoothScrollConfig) {
        window.dispatchEvent(
          new CustomEvent("portfolio:smooth-scroll-update", {
            detail: targetSettings.smoothScrollConfig,
          })
        );
      }
    }
  };

  useEffect(() => {
    getSiteSettings().then((data) => {
      if (data) {
        if (!data.allowedAdmins) {
          data.allowedAdmins = [SUPER_ADMIN];
        } else if (!data.allowedAdmins.includes(SUPER_ADMIN)) {
          data.allowedAdmins.unshift(SUPER_ADMIN);
        }
        if (!data.themeConfig) {
          data.themeConfig = {
            activePaletteId: "emerald-luxe",
          };
        }
        applyThemeLocally(data);
      }
      setSettings(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <StudioLoader
        label="Loading Site Settings..."
        sublabel="Loading theme configuration and security rules"
      />
    );
  }
  if (!settings) return null;

  const currentThemeConfig: ThemeConfig = settings.themeConfig || {
    activePaletteId: "emerald-luxe",
  };

  const activePalette = getPaletteById(currentThemeConfig.activePaletteId);

  const handleSelectPalette = (paletteId: string) => {
    const selected = getPaletteById(paletteId);
    const updated: SiteSettings = {
      ...settings,
      primaryColor: selected.primary,
      secondaryColor: selected.accent,
      accentColor: selected.accent,
      themeConfig: {
        ...currentThemeConfig,
        activePaletteId: paletteId,
        customPrimary: selected.primary,
        customAccent: selected.accent,
      },
    };
    setSettings(updated);
    applyThemeLocally(updated);
  };

  const handleSelectFontScheme = (schemeId: string) => {
    const updated: SiteSettings = {
      ...settings,
      themeConfig: {
        ...currentThemeConfig,
        activeFontSchemeId: schemeId,
      },
    };
    setSettings(updated);
    applyThemeLocally(updated);
  };

  const handleUpdateSmoothScroll = (updates: Partial<SmoothScrollConfig>) => {
    const current = settings.smoothScrollConfig || {
      enabled: true,
      intensity: "subtle",
      speed: 1.0,
    };
    const nextConfig: SmoothScrollConfig = {
      ...current,
      ...updates,
    };
    const nextSettings: SiteSettings = {
      ...settings,
      smoothScrollConfig: nextConfig,
    };
    setSettings(nextSettings);
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("portfolio:smooth-scroll-update", {
          detail: nextConfig,
        })
      );
    }
  };

  const handleAddAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    const email = newAdminEmail.trim().toLowerCase();
    if (!email) return;
    const current = settings.allowedAdmins || [SUPER_ADMIN];
    if (current.includes(email)) {
      studioAlert.error("This admin email is already in the authorized list.");
      return;
    }
    setSettings({
      ...settings,
      allowedAdmins: [...current, email],
    });
    setNewAdminEmail("");
    studioAlert.success(`Added ${email} to authorized admins.`);
  };

  const handleRemoveAdmin = async (emailToRemove: string) => {
    if (emailToRemove.toLowerCase() === SUPER_ADMIN.toLowerCase()) {
      studioAlert.error("Cannot remove the primary Super Admin.");
      return;
    }
    const ok = await confirm({
      title: "Revoke Admin Access?",
      description: `Are you sure you want to revoke admin panel access for ${emailToRemove}? They will no longer be able to manage this portfolio.`,
      confirmText: "Revoke Access",
      variant: "destructive",
    });
    if (!ok) return;
    const current = settings.allowedAdmins || [SUPER_ADMIN];
    setSettings({
      ...settings,
      allowedAdmins: current.filter((e) => e.toLowerCase() !== emailToRemove.toLowerCase()),
    });
    studioAlert.success(`Admin access revoked for ${emailToRemove}`);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    try {
      await saveSiteSettings(settings);
      applyThemeLocally(settings);
      setSuccess(true);
      studioAlert.success("Site settings and theme saved successfully!");
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      studioAlert.error("Failed to save site settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const tabs: Array<{ id: SettingsTab; label: string; icon: React.ElementType }> = [
    { id: "theme", label: "Theme & Palette", icon: Palette },
    { id: "typography", label: "Typography & Fonts", icon: Type },
    { id: "branding", label: "Branding & Images", icon: ImageIcon },
    { id: "general", label: "General & SEO", icon: Globe },
    { id: "admins", label: "Administrators", icon: ShieldCheck },
    { id: "features", label: "Experience & Features", icon: Sliders },
  ];

  return (
    <form onSubmit={handleSave} className="w-full pb-20">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-card/90 dark:bg-zinc-900/90 backdrop-blur-2xl border-b border-border py-4 px-4 sm:px-8 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <h2 className="text-2xl font-extrabold text-foreground tracking-tight">Site & Theme Settings</h2>
          <p className="text-xs text-muted-foreground font-medium mt-0.5">
            Configure color palettes, branding icons, authorized admins, and global metadata
          </p>
        </div>
        <div className="flex items-center gap-3">
          {success && (
            <span className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4" /> Saved!
            </span>
          )}
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs transition-all shadow-md shadow-primary/20 disabled:opacity-50 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </div>

      <div className="px-4 sm:px-8 space-y-6">

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1.5 border-b border-border overflow-x-auto pb-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] border-b-2 ${
                isActive
                  ? "border-primary text-primary bg-primary/10 shadow-xs"
                  : "border-transparent text-foreground/70 hover:text-foreground hover:bg-muted/60"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: Theme & Color Palette Templates */}
      {activeTab === "theme" && (
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6 space-y-6 shadow-2xs">
            <div>
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Palette className="w-4 h-4 text-primary" />
                Portfolio Color Palette Templates
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Choose a pre-built color scheme for your portfolio and studio, or customize the primary accents below.
              </p>
            </div>

            {/* Palette Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {THEME_PALETTES.map((pal) => {
                const isSelected = (settings.themeConfig?.activePaletteId || "emerald-luxe") === pal.id;
                return (
                  <div
                    key={pal.id}
                    onClick={() => handleSelectPalette(pal.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
                      isSelected
                        ? "border-primary ring-2 ring-primary/40 bg-accent/30 shadow-sm"
                        : "border-border bg-card/60 hover:border-foreground/30 hover:bg-muted/30"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-xs font-bold text-foreground block">{pal.name}</span>
                        <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                          {pal.description}
                        </p>
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </div>

                    {/* Color Swatch Preview Chips */}
                    <div className="flex items-center gap-1.5 pt-1">
                      {pal.previewColors.map((color, idx) => (
                        <div
                          key={idx}
                          className="h-6 flex-1 rounded-md border border-black/10 shadow-2xs"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Custom Color Overrides */}
            <div className="pt-4 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Primary Brand Color (Hex / Color Picker)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={settings.primaryColor || activePalette.primary}
                    onChange={(e) => {
                      const next = {
                        ...settings,
                        primaryColor: e.target.value,
                        themeConfig: {
                          ...settings.themeConfig,
                          customPrimary: e.target.value,
                        },
                      };
                      setSettings(next);
                      applyThemeLocally(next);
                    }}
                    className="w-10 h-9 rounded-lg border border-border cursor-pointer bg-transparent"
                  />
                  <input
                    type="text"
                    value={settings.primaryColor || activePalette.primary}
                    onChange={(e) => {
                      const next = {
                        ...settings,
                        primaryColor: e.target.value,
                        themeConfig: {
                          ...settings.themeConfig,
                          customPrimary: e.target.value,
                        },
                      };
                      setSettings(next);
                      applyThemeLocally(next);
                    }}
                    className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-xs font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Secondary / Accent Color (Hex)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={settings.accentColor || activePalette.accent}
                    onChange={(e) => {
                      const next = {
                        ...settings,
                        accentColor: e.target.value,
                        themeConfig: {
                          ...settings.themeConfig,
                          customAccent: e.target.value,
                        },
                      };
                      setSettings(next);
                      applyThemeLocally(next);
                    }}
                    className="w-10 h-9 rounded-lg border border-border cursor-pointer bg-transparent"
                  />
                  <input
                    type="text"
                    value={settings.accentColor || activePalette.accent}
                    onChange={(e) => {
                      const next = {
                        ...settings,
                        accentColor: e.target.value,
                        themeConfig: {
                          ...settings.themeConfig,
                          customAccent: e.target.value,
                        },
                      };
                      setSettings(next);
                      applyThemeLocally(next);
                    }}
                    className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-xs font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
            </div>

            {/* Live Palette Preview Card */}
            <div className="p-4 rounded-xl border border-border bg-card/80 space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                Live Component Preview
              </span>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  style={{
                    backgroundColor: settings.primaryColor || activePalette.primary,
                    color: activePalette.primaryForeground,
                  }}
                  className="px-4 py-2 rounded-lg text-xs font-semibold shadow-sm"
                >
                  Primary Action Button
                </button>
                <button
                  type="button"
                  style={{
                    borderColor: settings.primaryColor || activePalette.primary,
                    color: settings.primaryColor || activePalette.primary,
                  }}
                  className="px-4 py-2 rounded-lg text-xs font-semibold border bg-transparent"
                >
                  Outline Button
                </button>
                <span
                  style={{
                    backgroundColor: `${settings.primaryColor || activePalette.primary}20`,
                    color: settings.primaryColor || activePalette.primary,
                    borderColor: `${settings.primaryColor || activePalette.primary}40`,
                  }}
                  className="px-2.5 py-1 rounded-full text-xs font-semibold border"
                >
                  Status Badge
                </span>
              </div>
            </div>
            {/* Quick Typography Shortcut in Theme Tab */}
            <div className="p-4 rounded-xl border border-border bg-card/80 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <Type className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <span className="text-xs font-bold text-foreground block">
                    Active Typography: {getFontSchemeById(settings.themeConfig?.activeFontSchemeId).name}
                  </span>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {getFontSchemeById(settings.themeConfig?.activeFontSchemeId).description}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab("typography")}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-muted hover:bg-muted/80 text-foreground border border-border flex items-center gap-1.5 shrink-0 transition-all cursor-pointer"
              >
                <span>Browse All Fonts (12)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Typography & Font Schemes (12 Curated Presets) */}
      {activeTab === "typography" && (
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6 space-y-6 shadow-2xs">
            {/* Header & Description */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Type className="w-4 h-4 text-primary" />
                  Portfolio Font Schemes & Typography
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Select from 12 hand-crafted, standard typography pairings designed for portfolios. Selected fonts apply live to all headings, body text, and code blocks.
                </p>
              </div>

              {/* Active Font Badge */}
              <div className="px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/25 text-xs font-semibold text-primary shrink-0 self-start sm:self-auto flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                <span>Active: {getFontSchemeById(settings.themeConfig?.activeFontSchemeId).name}</span>
              </div>
            </div>

            {/* Filter Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {[
                { id: "all", label: `All Schemes (${FONT_SCHEMES.length})` },
                { id: "sans", label: "Modern Sans-Serif" },
                { id: "display", label: "Display & Web3" },
                { id: "serif", label: "Editorial Serif" },
                { id: "mono", label: "Code Mono / Tech" },
                { id: "hybrid", label: "Hybrid (Serif + Sans)" },
              ].map((cat) => {
                const isActive = fontCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setFontCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-xs font-bold"
                        : "bg-muted/70 text-muted-foreground hover:text-foreground hover:bg-muted border border-border"
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* Font Schemes Grid (12 Cards) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {FONT_SCHEMES.filter(
                (f) => fontCategory === "all" || f.category === fontCategory
              ).map((scheme) => {
                const isSelected =
                  (settings.themeConfig?.activeFontSchemeId || "default") === scheme.id;

                return (
                  <div
                    key={scheme.id}
                    onClick={() => handleSelectFontScheme(scheme.id)}
                    className={`p-5 rounded-2xl border cursor-pointer transition-all duration-200 flex flex-col justify-between space-y-4 group ${
                      isSelected
                        ? "border-primary ring-2 ring-primary/40 bg-accent/30 shadow-md"
                        : "border-border bg-card/60 hover:border-primary/40 hover:bg-muted/40 shadow-2xs"
                    }`}
                  >
                    <div className="space-y-2.5">
                      {/* Card Header: Title & Active Badge */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                              {scheme.name}
                            </span>
                            {scheme.id === "default" && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground font-mono font-medium border border-border">
                                Default
                              </span>
                            )}
                          </div>
                          <span className="inline-block mt-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                            {scheme.category}
                          </span>
                        </div>

                        {isSelected ? (
                          <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-sm shadow-primary/30">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full border border-border group-hover:border-primary/50 flex items-center justify-center shrink-0 opacity-40 group-hover:opacity-100 transition-opacity" />
                        )}
                      </div>

                      {/* Description */}
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                        {scheme.description}
                      </p>

                      {/* Font Details Pill */}
                      <div className="text-[11px] text-muted-foreground/90 font-medium space-y-0.5 pt-1 border-t border-border/60">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Heading:</span>
                          <span className="font-semibold text-foreground truncate max-w-[150px]">
                            {scheme.headingFont.split(",")[0].replace(/['"]/g, "")}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Body:</span>
                          <span className="font-semibold text-foreground truncate max-w-[150px]">
                            {scheme.bodyFont.split(",")[0].replace(/['"]/g, "")}
                          </span>
                        </div>
                      </div>

                      {/* Live Typography Preview Box */}
                      <div className="p-3.5 rounded-xl bg-background/80 border border-border/80 space-y-2 overflow-hidden shadow-inner">
                        <p
                          style={{ fontFamily: scheme.headingFont }}
                          className="text-base font-bold text-foreground truncate leading-tight"
                        >
                          {scheme.previewHeading}
                        </p>
                        <p
                          style={{ fontFamily: scheme.bodyFont }}
                          className="text-xs text-muted-foreground line-clamp-2 leading-relaxed"
                        >
                          {scheme.previewBody}
                        </p>
                      </div>
                    </div>

                    {/* Bottom Action */}
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectFontScheme(scheme.id);
                        }}
                        className={`w-full py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all duration-200 active:scale-95 ${
                          isSelected
                            ? "bg-primary text-primary-foreground font-bold shadow-xs shadow-primary/20"
                            : "bg-muted hover:bg-primary hover:text-primary-foreground text-foreground border border-border"
                        }`}
                      >
                        {isSelected ? "Active Font Scheme" : "Apply This Font"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Interactive Live Typography Playground */}
            <div className="p-5 rounded-2xl border border-border bg-card/70 space-y-4 backdrop-blur-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-primary" />
                  Interactive Font Testing Playground
                </span>
                <span className="text-xs text-muted-foreground">
                  Type custom text to preview with selected font:
                </span>
              </div>

              {/* Custom Headline Input */}
              <input
                type="text"
                value={testHeadingText}
                onChange={(e) => setTestHeadingText(e.target.value)}
                placeholder="Type your portfolio headline here..."
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/30"
              />

              {/* Live Preview Elements */}
              <div className="p-6 rounded-xl bg-background border border-border/80 space-y-5">
                {/* H1 Headline */}
                <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground leading-tight">
                  {testHeadingText || "Architecting Scalable Web Applications & AI Systems"}
                </h1>

                {/* Subheading & Paragraph */}
                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-primary">
                    Full-Stack Engineer & AI Solutions Architect
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed max-w-3xl">
                    I build resilient full-stack applications, scalable distributed architectures, and intuitive digital interfaces. Meticulous code craftsmanship, modern Next.js systems, and clean typography.
                  </p>
                </div>

                {/* Buttons & Code Sample */}
                <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-border">
                  <button
                    type="button"
                    className="px-5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-md shadow-primary/25 cursor-pointer"
                  >
                    View Featured Projects
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 rounded-xl border border-border bg-card text-foreground text-xs font-semibold cursor-pointer hover:bg-muted"
                  >
                    Download Resume
                  </button>
                  <code className="text-xs font-mono bg-muted/80 border border-border px-3 py-1.5 rounded-lg text-primary">
                    npx create-next-app@latest
                  </code>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Branding & Drag-and-Drop Image Assets */}
      {activeTab === "branding" && (
        <div className="bg-card border border-border rounded-2xl p-6 space-y-6 shadow-2xs">
          <div>
            <h3 className="text-sm font-bold text-foreground">Branding & Media Assets</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Drag and drop icons, favicons, site logo, and social sharing image.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Site Logo */}
            <StudioImageUploader
              value={settings.siteLogo}
              folder="branding"
              label="Site Logo"
              description="SVG, PNG, or WebP logo displayed on navbar and header."
              onChange={(url) => setSettings({ ...settings, siteLogo: url })}
            />

            {/* Favicon */}
            <StudioImageUploader
              value={settings.favicon}
              folder="branding"
              label="Browser Favicon"
              description="Supports .ico, .svg, .png tab icon."
              onChange={(url) => setSettings({ ...settings, favicon: url })}
            />

            {/* OpenGraph Image */}
            <StudioImageUploader
              value={settings.ogImage}
              folder="branding"
              label="Social Share Image (OG Image)"
              description="Preview banner (1200x630 recommended) for Twitter, LinkedIn, Facebook."
              onChange={(url) => setSettings({ ...settings, ogImage: url })}
            />

            {/* Hero Background Canvas */}
            <StudioImageUploader
              value={settings.heroBackground}
              folder="branding"
              label="Hero Background Canvas"
              description="Optional background texture, grid or wallpaper for the Hero section."
              onChange={(url) => setSettings({ ...settings, heroBackground: url })}
            />
                      </div>
        </div>
      )}

{/* TAB 4: General & SEO */}
      {activeTab === "general" && (
        <div className="bg-card border border-border rounded-2xl p-6 space-y-4 shadow-2xs">
          <div>
            <h3 className="text-sm font-bold text-foreground">General Metadata & SEO</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Meta titles and search descriptions</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Site Title <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              required
              value={settings.siteTitle}
              onChange={(e) => setSettings({ ...settings, siteTitle: e.target.value })}
              className="w-full bg-background border border-border rounded-lg px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Site Description</label>
            <textarea
              rows={3}
              value={settings.siteDescription || ""}
              onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
              className="w-full bg-background border border-border rounded-lg p-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Hero Headline</label>
              <input
                type="text"
                value={settings.heroHeadline || ""}
                onChange={(e) => setSettings({ ...settings, heroHeadline: e.target.value })}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Hero Subheadline</label>
              <input
                type="text"
                value={settings.heroSubheadline || ""}
                onChange={(e) => setSettings({ ...settings, heroSubheadline: e.target.value })}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
                      </div>
        </div>
      )}

{/* TAB 5: Authorized Administrators */}
      {activeTab === "admins" && (
        <div className="bg-card border border-border rounded-2xl p-6 space-y-6 shadow-2xs">
          <div>
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary" />
              Authorized Studio Administrators
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Only authenticated users with these emails can access this CMS Studio.
            </p>
          </div>

          {/* Admin Email List */}
          <div className="space-y-2">
            {(settings.allowedAdmins || [SUPER_ADMIN]).map((email) => {
              const isSuper = email.toLowerCase() === SUPER_ADMIN.toLowerCase();
              return (
                <div
                  key={email}
                  className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border text-xs"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <div className="w-7 h-7 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0">
                      {email.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-semibold text-foreground truncate">{email}</span>
                    {isSuper && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shrink-0">
                        Permanent Super Admin
                      </span>
                    )}
                  </div>

                  {!isSuper && (
                    <button
                      type="button"
                      onClick={() => handleRemoveAdmin(email)}
                      className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                      title="Revoke Admin Access"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Add Admin Form */}
          <div className="pt-2 border-t border-border">
            <span className="text-xs font-semibold text-foreground block mb-2">
              Authorize a New Admin Email
            </span>
            <div className="flex gap-2 max-w-md">
              <input
                type="email"
                placeholder="colleague@example.com"
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                type="button"
                onClick={handleAddAdmin}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 text-xs font-semibold transition-colors"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Add Admin
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: Experience & Features */}
      {activeTab === "features" && (
        <div className="space-y-6">
          {/* Smooth Scrolling Engine Card */}
          <div className="bg-card border border-border rounded-2xl p-6 space-y-6 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
              <div>
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Activity className="w-4 h-4 text-primary" />
                  Smooth Scrolling Physics (Lenis Engine)
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Eliminate mouse wheel stuttering with silky-smooth micro-step interpolation and momentum damping.
                </p>
              </div>

              {/* Master Toggle */}
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={settings.smoothScrollConfig?.enabled ?? true}
                  onChange={(e) => handleUpdateSmoothScroll({ enabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                <span className="ml-3 text-xs font-bold text-foreground">
                  {(settings.smoothScrollConfig?.enabled ?? true) ? "Enabled" : "Disabled"}
                </span>
              </label>
            </div>

            {/* Presets Grid */}
            <div className="space-y-3">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-primary" />
                Scroll Intensity Presets
              </label>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                {[
                  {
                    id: "subtle",
                    name: "Subtle & Crisp",
                    badge: "Recommended",
                    description: "ছোট ছোট স্টেপে স্মুথ স্ক্রল — Snappy micro-steps, zero delay, silky fluid motion without floatiness.",
                    lerpText: "Lerp: 0.14 | Duration: 0.75s",
                  },
                  {
                    id: "balanced",
                    name: "Balanced & Natural",
                    badge: "Default",
                    description: "Natural Apple-style momentum with smooth deceleration and gentle inertia.",
                    lerpText: "Lerp: 0.09 | Duration: 1.05s",
                  },
                  {
                    id: "floaty",
                    name: "Cinematic & Floaty",
                    badge: "High Inertia",
                    description: "Extended luxurious glide with deep cinematic deceleration.",
                    lerpText: "Lerp: 0.05 | Duration: 1.50s",
                  },
                ].map((preset) => {
                  const activeIntensity = settings.smoothScrollConfig?.intensity || "subtle";
                  const isSelected = activeIntensity === preset.id;
                  const isEnabled = settings.smoothScrollConfig?.enabled ?? true;

                  return (
                    <div
                      key={preset.id}
                      onClick={() => isEnabled && handleUpdateSmoothScroll({ intensity: preset.id as any })}
                      className={`p-4 rounded-xl border transition-all flex flex-col justify-between space-y-3 ${
                        !isEnabled
                          ? "opacity-50 cursor-not-allowed border-border bg-muted/20"
                          : isSelected
                          ? "border-primary ring-2 ring-primary/30 bg-primary/5 shadow-xs cursor-pointer"
                          : "border-border bg-card/60 hover:border-foreground/30 hover:bg-muted/30 cursor-pointer"
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-foreground">{preset.name}</span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                              isSelected
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {preset.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                          {preset.description}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-border/50 text-[10px] text-muted-foreground font-mono">
                        {preset.lerpText}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Custom Speed Slider */}
            <div className="pt-4 border-t border-border space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-semibold text-foreground">
                    Scroll Response Speed & Multiplier
                  </label>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Fine-tune scroll distance sensitivity according to your mouse wheel preference.
                  </p>
                </div>
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-primary/10 text-primary border border-primary/20">
                  {(settings.smoothScrollConfig?.speed ?? 1.0).toFixed(1)}x
                </span>
              </div>

              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                disabled={!(settings.smoothScrollConfig?.enabled ?? true)}
                value={settings.smoothScrollConfig?.speed ?? 1.0}
                onChange={(e) => handleUpdateSmoothScroll({ speed: parseFloat(e.target.value) })}
                className="w-full accent-primary cursor-pointer disabled:opacity-40"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                <span>0.5x (Gentle / Micro)</span>
                <span>1.0x (Standard)</span>
                <span>2.0x (Fast / Long)</span>
              </div>
            </div>
          </div>

          {/* Feature Flags & Integrations Card */}
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4 shadow-2xs">
            <div>
              <h3 className="text-sm font-bold text-foreground">Section Visibility & Maintenance</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Toggle visibility of sections on the live portfolio</p>
            </div>

            <div className="space-y-3">
              {[
                { key: "showBlog", label: "Show Blog & Articles Section" },
                { key: "showServices", label: "Show Services Section" },
                { key: "showTestimonials", label: "Show Testimonials Section" },
                { key: "maintenanceMode", label: "Enable Maintenance Mode" },
              ].map(({ key, label }) => (
                <label
                  key={key}
                  className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border cursor-pointer hover:bg-muted/70 transition-colors"
                >
                  <span className="text-xs font-semibold text-foreground">{label}</span>
                  <input
                    type="checkbox"
                    checked={Boolean((settings as any)[key])}
                    onChange={(e) => setSettings({ ...settings, [key]: e.target.checked })}
                    className="w-4 h-4 rounded text-primary focus:ring-primary"
                  />
                </label>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Google Analytics ID</label>
                <input
                  type="text"
                  placeholder="G-XXXXXXXXXX"
                  value={settings.googleAnalyticsId || ""}
                  onChange={(e) => setSettings({ ...settings, googleAnalyticsId: e.target.value })}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Twitter / X Handle</label>
                <input
                  type="text"
                  placeholder="@md_sifat_99"
                  value={settings.twitterHandle || ""}
                  onChange={(e) => setSettings({ ...settings, twitterHandle: e.target.value })}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </form>
  );
}
