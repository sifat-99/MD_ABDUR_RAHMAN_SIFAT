"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setActiveTab, clearStatusMessage, type StudioTab } from "@/store/slices/studioSlice";
import { getSiteSettings } from "@/lib/db-service";
import { generateThemeCss } from "@/lib/theme-presets";
import { StudioLogin } from "./StudioLogin";
import { StudioThemeToggle } from "./StudioThemeToggle";
import { ProfileManager } from "./ProfileManager";
import { ProjectsManager } from "./ProjectsManager";
import { SkillsManager } from "./SkillsManager";
import { ExperienceManager } from "./ExperienceManager";
import { EducationManager } from "./EducationManager";
import { CertificationsManager } from "./CertificationsManager";
import { AchievementsManager } from "./AchievementsManager";
import { BlogsManager } from "./BlogsManager";
import { ServicesManager } from "./ServicesManager";
import { TestimonialsManager } from "./TestimonialsManager";
import { ContactsManager } from "./ContactsManager";
import { NavigationManager } from "./NavigationManager";
import { SiteSettingsManager } from "./SiteSettingsManager";
import { MediaManager } from "./MediaManager";
import { SyncManager } from "./SyncManager";
import { StudioConfirmProvider } from "./StudioConfirmContext";

import {
  User,
  Rocket,
  Asterisk,
  Briefcase,
  GraduationCap,
  Award,
  Trophy,
  BookOpen,
  Tag,
  MessageSquareQuote,
  Mail,
  Compass,
  Settings,
  Database,
  ExternalLink,
  LogOut,
  Layers,
  ShieldAlert,
  ArrowLeft,
  Image as ImageIcon,
  Menu,
  X,
} from "lucide-react";
import Link from "next/link";

const SUPER_ADMIN = "mdabdurrahmansifat@gmail.com";

interface StudioLayoutProps {
  initialTool?: string[];
}

export function StudioLayout({ initialTool }: StudioLayoutProps = {}) {
  const { user, loading, signOut } = useAuth();
  const dispatch = useAppDispatch();
  const activeTab = useAppSelector((state) => state.studio.activeTab);
  const itemCounts = useAppSelector((state) => state.studio.itemCounts);
  const statusMessage = useAppSelector((state) => state.studio.statusMessage);

  const [allowedAdmins, setAllowedAdmins] = useState<string[]>([SUPER_ADMIN]);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Sync initial tab from URL params if available (e.g. /studio/structure/profile)
  useEffect(() => {
    if (initialTool && initialTool.length > 0) {
      const lastSegment = initialTool[initialTool.length - 1].toLowerCase();
      const tabMap: Record<string, StudioTab> = {
        profile: "profile",
        project: "projects",
        projects: "projects",
        skill: "skills",
        skills: "skills",
        service: "services",
        services: "services",
        experience: "experience",
        education: "education",
        certification: "certifications",
        certifications: "certifications",
        achievement: "achievements",
        achievements: "achievements",
        blog: "blogs",
        blogs: "blogs",
        testimonial: "testimonials",
        testimonials: "testimonials",
        contact: "contacts",
        contacts: "contacts",
        navigation: "navigation",
        sitesettings: "settings",
        settings: "settings",
        media: "media",
        sync: "sync",
      };

      if (tabMap[lastSegment]) {
        dispatch(setActiveTab(tabMap[lastSegment]));
      }
    }
  }, [initialTool, dispatch]);

  useEffect(() => {
    getSiteSettings()
      .then((settings) => {
        if (settings?.allowedAdmins && settings.allowedAdmins.length > 0) {
          setAllowedAdmins(settings.allowedAdmins);
        }
        if (settings && typeof document !== "undefined") {
          const css = generateThemeCss(settings);
          let el = document.getElementById("dynamic-theme-palette");
          if (!el) {
            el = document.createElement("style");
            el.id = "dynamic-theme-palette";
            document.head.appendChild(el);
          }
          el.innerHTML = css;
        }
      })
      .catch((err) => console.error("Error loading settings:", err))
      .finally(() => setCheckingAuth(false));
  }, []);

  if (loading || checkingAuth) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 text-zinc-500 dark:text-zinc-400 text-sm">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <span>Loading Studio...</span>
        </div>
      </div>
    );
  }

  // 1. If not logged in, show StudioLogin
  if (!user) {
    return <StudioLogin />;
  }

  // 2. Strict Admin Email Authorization Check
  const currentEmail = user.email?.trim().toLowerCase() || "";
  const isSuper = currentEmail === SUPER_ADMIN.toLowerCase();
  const isAuthorized =
    isSuper || allowedAdmins.some((a) => a.trim().toLowerCase() === currentEmail);

  if (!isAuthorized) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-6 relative">
        <div className="absolute top-6 right-6">
          <StudioThemeToggle />
        </div>
        <div className="max-w-md w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl p-8 text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
              Access Denied
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Your account is not an authorized administrator for this CMS Studio.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 text-xs text-zinc-700 dark:text-zinc-300">
            <span className="text-zinc-400 block mb-0.5">Signed in as:</span>
            <span className="font-semibold text-zinc-900 dark:text-white break-all">{user.email}</span>
          </div>

          <p className="text-[11px] text-zinc-500 leading-relaxed">
            Only <span className="font-medium text-primary">{SUPER_ADMIN}</span> or admins designated from Site Settings can access this panel.
          </p>

          <div className="flex flex-col gap-2 pt-2">
            <button
              onClick={() => signOut()}
              className="w-full py-2.5 px-4 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100 text-xs font-semibold transition-colors"
            >
              Sign In with a Different Account
            </button>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-1.5 py-2 px-4 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white text-xs font-medium transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Portfolio</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 3. Authorized Admin Navigation
  const navGroups = [
    {
      group: "Singleton",
      items: [{ id: "profile", label: "Profile", icon: User }],
    },
    {
      group: "Portfolio Content",
      items: [
        { id: "projects", label: "Projects", icon: Rocket },
        { id: "skills", label: "Skills", icon: Asterisk },
        { id: "services", label: "Services", icon: Tag },
        { id: "media", label: "Media Library", icon: ImageIcon },
      ],
    },
    {
      group: "Professional Background",
      items: [
        { id: "experience", label: "Work Experience", icon: Briefcase },
        { id: "education", label: "Education", icon: GraduationCap },
        { id: "certifications", label: "Certifications", icon: Award },
        { id: "achievements", label: "Achievements", icon: Trophy },
      ],
    },
    {
      group: "Content & Community",
      items: [
        { id: "blogs", label: "Blog Posts", icon: BookOpen },
        { id: "testimonials", label: "Testimonials", icon: MessageSquareQuote },
      ],
    },
    {
      group: "Communications",
      items: [{ id: "contacts", label: "Contact Inbox", icon: Mail }],
    },
    {
      group: "Settings & System",
      items: [
        { id: "navigation", label: "Dock Navigation", icon: Compass },
        { id: "settings", label: "Site Settings", icon: Settings },
        { id: "sync", label: "Database & Migration", icon: Database },
      ],
    },
  ];

  const handleTabClick = (tabId: StudioTab) => {
    dispatch(setActiveTab(tabId));
    setMobileOpen(false);
    if (typeof window !== "undefined") {
      window.history.pushState(null, "", `/studio/structure/${tabId}`);
    }
  };

  const currentTabLabel =
    navGroups
      .flatMap((g) => g.items)
      .find((item) => item.id === activeTab)?.label || "Studio";

  return (
    <StudioConfirmProvider>
      <div className="min-h-screen flex flex-col lg:flex-row bg-transparent text-foreground font-sans transition-colors duration-200">
      {/* Mobile Top Navigation Bar (< lg) */}
      <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3 bg-card/90 backdrop-blur-2xl border-b border-border shadow-xs">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="p-2 -ml-1 text-foreground/80 hover:text-foreground hover:bg-muted/80 rounded-xl cursor-pointer transition-colors active:scale-95"
            aria-label="Open Studio Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shadow-xs">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-xs text-foreground block leading-tight">Studio</span>
              <span className="text-[10px] text-primary font-semibold truncate block leading-tight">{currentTabLabel}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <StudioThemeToggle />
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/80 transition-colors cursor-pointer"
            title="Open Live Portfolio"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </header>

      {/* Mobile Slide-over Drawer & Backdrop Overlay (< lg) */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen(false)}
          />

          {/* Drawer Content */}
          <div className="relative w-72 max-w-[85vw] bg-card border-r border-border h-full flex flex-col justify-between shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            <div>
              <div className="p-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shadow-sm shadow-primary/20 shrink-0">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h1 className="text-sm font-bold text-foreground tracking-wide">Studio</h1>
                    <p className="text-[10px] text-muted-foreground font-medium">Content Management</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 cursor-pointer transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Items (Mobile) */}
              <nav className="p-3 space-y-4 max-h-[calc(100vh-140px)] overflow-y-auto">
                {navGroups.map((grp) => (
                  <div key={grp.group} className="space-y-1">
                    <p className="px-3 text-[10px] uppercase font-bold tracking-wider text-muted-foreground/90 mb-1">
                      {grp.group}
                    </p>
                    {grp.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id;
                      const count = itemCounts[item.id as keyof typeof itemCounts];
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleTabClick(item.id as StudioTab)}
                          className={`w-full flex items-center justify-between gap-2.5 px-3 py-2 rounded-xl text-xs font-medium cursor-pointer transition-all duration-200 active:scale-[0.98] ${
                            isActive
                              ? "bg-primary text-primary-foreground shadow-md shadow-primary/25 font-bold"
                              : "text-foreground/80 hover:text-foreground hover:bg-muted/70"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <Icon className="w-4 h-4 shrink-0" />
                            <span className="truncate">{item.label}</span>
                          </div>
                          {typeof count === "number" && count > 0 && (
                            <span
                              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono shrink-0 ${
                                isActive
                                  ? "bg-primary-foreground/20 text-primary-foreground"
                                  : "bg-muted text-muted-foreground border border-border"
                              }`}
                            >
                              {count}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </nav>
            </div>

            {/* Mobile User Footer */}
            <div className="p-4 border-t border-border bg-card/40 flex items-center justify-between">
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs text-primary font-bold shrink-0">
                  {user.email?.charAt(0).toUpperCase() || "A"}
                </div>
                <span className="text-xs text-muted-foreground font-medium truncate max-w-[120px]">
                  {user.email}
                </span>
              </div>
              <button
                onClick={() => signOut()}
                className="p-1.5 cursor-pointer text-muted-foreground hover:text-destructive rounded-lg hover:bg-muted/80 transition-all active:scale-95"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar (Desk Navigation >= lg) */}
      <aside className="hidden lg:flex w-64 border-r border-border/80 bg-card/75 backdrop-blur-2xl flex-col justify-between shrink-0 select-none shadow-[inset_-1px_0_0_rgba(255,255,255,0.08)]">
        <div>
          {/* Logo / Studio Header */}
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shadow-sm shadow-primary/20 shrink-0">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-foreground tracking-wide">Studio</h1>
                <p className="text-[10px] text-muted-foreground font-medium">Content Management</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <StudioThemeToggle />
              <a
                href="/"
                target="_blank"
                rel="noreferrer"
                className="p-1.5 cursor-pointer text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/80 transition-all active:scale-95"
                title="Open Live Portfolio"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Navigation Items (Desktop) */}
          <nav className="p-3 space-y-4 max-h-[calc(100vh-140px)] overflow-y-auto">
            {navGroups.map((grp) => (
              <div key={grp.group} className="space-y-1">
                <p className="px-3 text-[10px] uppercase font-bold tracking-wider text-muted-foreground/90 mb-1">
                  {grp.group}
                </p>
                {grp.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  const count = itemCounts[item.id as keyof typeof itemCounts];
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleTabClick(item.id as StudioTab)}
                      className={`w-full flex items-center justify-between gap-2.5 px-3 py-2 rounded-xl text-xs font-medium cursor-pointer transition-all duration-200 active:scale-[0.98] ${
                        isActive
                          ? "bg-primary text-primary-foreground shadow-md shadow-primary/25 font-bold translate-x-0.5"
                          : "text-foreground/80 hover:text-foreground hover:bg-muted/70 hover:translate-x-0.5"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {typeof count === "number" && count > 0 && (
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono shrink-0 ${
                            isActive
                              ? "bg-primary-foreground/20 text-primary-foreground"
                              : "bg-muted text-muted-foreground border border-border"
                          }`}
                        >
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* Desktop User Footer */}
        <div className="p-4 border-t border-border bg-card/40 flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs text-primary font-bold shrink-0">
              {user.email?.charAt(0).toUpperCase() || "A"}
            </div>
            <span className="text-xs text-muted-foreground font-medium truncate max-w-[120px]">
              {user.email}
            </span>
          </div>

          <button
            onClick={() => signOut()}
            className="p-1.5 cursor-pointer text-muted-foreground hover:text-destructive rounded-lg hover:bg-muted/80 transition-all active:scale-95"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Studio Work Area - Full Width & Zero Clipping for Top Sticky Headers */}
      <main className="flex-1 overflow-y-auto max-h-[calc(100vh-56px)] lg:max-h-screen bg-transparent text-foreground w-full">
        {statusMessage && (
          <div className="pt-4 px-4 sm:px-8">
            <div
              className={`p-3.5 rounded-xl border text-xs flex items-center justify-between transition-all shadow-xs ${
                statusMessage.type === "success"
                  ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300"
                  : statusMessage.type === "error"
                  ? "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-500/30 text-rose-800 dark:text-rose-300"
                  : "bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-500/30 text-blue-800 dark:text-blue-300"
              }`}
            >
              <span>{statusMessage.text}</span>
              <button
                onClick={() => dispatch(clearStatusMessage())}
                className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white px-2 py-0.5 rounded text-sm hover:bg-zinc-200 dark:hover:bg-zinc-800/50 cursor-pointer"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {activeTab === "profile" && <ProfileManager />}
        {activeTab === "projects" && <ProjectsManager />}
        {activeTab === "skills" && <SkillsManager />}
        {activeTab === "services" && <ServicesManager />}
        {activeTab === "experience" && <ExperienceManager />}
        {activeTab === "education" && <EducationManager />}
        {activeTab === "certifications" && <CertificationsManager />}
        {activeTab === "achievements" && <AchievementsManager />}
        {activeTab === "blogs" && <BlogsManager />}
        {activeTab === "testimonials" && <TestimonialsManager />}
        {activeTab === "contacts" && <ContactsManager />}
        {activeTab === "navigation" && <NavigationManager />}
        {activeTab === "media" && <MediaManager />}
        {activeTab === "settings" && <SiteSettingsManager />}
        {activeTab === "sync" && <SyncManager />}
      </main>
    </div>
    </StudioConfirmProvider>
  );
}
