"use client";

import React, { useState, useEffect } from "react";
import type { Profile, DocumentStatus } from "@/types/portfolio";
import {
  getDocumentWithDraft,
  saveDocumentDraft,
  publishDocument,
  discardDocumentDraft,
} from "@/lib/db-service";
import { useAuth } from "@/context/AuthContext";
import { DocumentHeader } from "./DocumentHeader";
import { StudioImageUploader } from "./StudioImageUploader";
import { StudioLoader } from "./StudioLoader";
import { StudioMarkdownEditor } from "./StudioMarkdownEditor";
import { DraftHistoryDrawer } from "./DraftHistoryDrawer";
import { useStudioConfirm, studioAlert } from "./StudioConfirmContext";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import {
  User,
  FileText,
  Image as ImageIcon,
  Mail,
  Share2,
  BarChart3,
  Plus,
  Trash2,
  CheckCircle2,
  Sparkles,
  Bold,
  Italic,
  List,
  Heading,
  Code,
  Quote,
} from "lucide-react";

type ProfileTab = "basic" | "bio" | "image" | "contact" | "social" | "stats";

export function ProfileManager() {
  const { confirm } = useStudioConfirm();
  const { user } = useAuth();
  const authorEmail = user?.email || "mdabdurrahmansifat@gmail.com";

  const [profile, setProfile] = useState<Profile | null>(null);
  const [publishedSnapshot, setPublishedSnapshot] = useState<Profile | null>(null);
  const [activeTab, setActiveTab] = useState<ProfileTab>("basic");
  const [status, setStatus] = useState<DocumentStatus>("published");
  const [hasDraft, setHasDraft] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // New animated word input state
  const [newWord, setNewWord] = useState("");

  const statsChartData = (profile?.stats || []).map((s) => {
    const rawVal = s.value || "0";
    const numeric = parseInt(rawVal.replace(/[^0-9]/g, ""), 10) || 0;
    return {
      name: s.label || "Stat",
      value: numeric,
      raw: rawVal,
    };
  });

  // Load document with draft
  useEffect(() => {
    setMounted(true);
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await getDocumentWithDraft<Profile>("profile", "singleton-profile");
      if (res.data) {
        setProfile(res.data);
        setStatus(res.status);
        setHasDraft(res.hasDraft);
        if (!res.hasDraft) {
          setPublishedSnapshot(res.data);
        }
      }
    } catch (err) {
      console.error("Failed to load profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // 1. Save Working Draft
  const handleSaveDraft = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      const res = await saveDocumentDraft<Profile>(
        "profile",
        "singleton-profile",
        profile,
        authorEmail,
        "Saved working draft"
      );
      if (res.success) {
        setStatus("draft");
        setHasDraft(true);
        studioAlert.success("Working draft saved successfully!");
        showToast("Working draft saved successfully!");
      } else {
        studioAlert.error("Failed to save draft.");
      }
    } catch (err) {
      console.error("Save draft error:", err);
      studioAlert.error("Failed to save draft.");
    } finally {
      setSaving(false);
    }
  };

  // 2. Publish Live
  const handlePublish = async () => {
    if (!profile) return;
    setPublishing(true);
    try {
      const res = await publishDocument<Profile>(
        "profile",
        "singleton-profile",
        profile,
        authorEmail
      );
      if (res.success) {
        setStatus("published");
        setHasDraft(false);
        setPublishedSnapshot(profile);
        studioAlert.success("Published live to website successfully!");
        showToast("Published live to website successfully!");
      } else {
        studioAlert.error("Failed to publish document.");
      }
    } catch (err) {
      console.error("Publish error:", err);
      studioAlert.error("Failed to publish document.");
    } finally {
      setPublishing(false);
    }
  };

  // 3. Discard Draft Changes
  const handleDiscard = async () => {
    const ok = await confirm({
      title: "Discard Draft Changes?",
      description: "Are you sure you want to discard your draft changes? All unpublished modifications will be replaced with the current live version.",
      confirmText: "Discard Draft",
      variant: "destructive",
    });
    if (!ok) return;

    setSaving(true);
    try {
      const res = await discardDocumentDraft("profile", "singleton-profile", authorEmail);
      if (res.success && res.publishedData) {
        setProfile(res.publishedData);
        setPublishedSnapshot(res.publishedData);
        setStatus("published");
        setHasDraft(false);
        studioAlert.success("Draft changes discarded. Reverted to live version.");
        showToast("Draft changes discarded. Reverted to live version.");
      }
    } catch (err) {
      console.error("Discard error:", err);
      studioAlert.error("Failed to discard draft.");
    } finally {
      setSaving(false);
    }
  };

  // 4. Restore snapshot from Draft History
  const handleRestoreSnapshot = (snapshot: any) => {
    setProfile(snapshot);
    setStatus("draft");
    setHasDraft(true);
    showToast("Restored snapshot as active working draft!");
  };

  // Tag Manager for Headline Animated Words
  const handleAddWord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWord.trim() || !profile) return;
    const currentWords = profile.headlineAnimatedWords || [];
    if (!currentWords.includes(newWord.trim())) {
      setProfile({
        ...profile,
        headlineAnimatedWords: [...currentWords, newWord.trim()],
      });
      setHasDraft(true);
      setStatus("draft");
    }
    setNewWord("");
  };

  const handleRemoveWord = (wordToRemove: string) => {
    if (!profile) return;
    setProfile({
      ...profile,
      headlineAnimatedWords: (profile.headlineAnimatedWords || []).filter(
        (w) => w !== wordToRemove
      ),
    });
    setHasDraft(true);
    setStatus("draft");
  };

  // Dynamic Stats Manager
  const handleAddStat = () => {
    if (!profile) return;
    setProfile({
      ...profile,
      stats: [...(profile.stats || []), { label: "Projects Completed", value: "30+" }],
    });
    setHasDraft(true);
    setStatus("draft");
  };

  const handleUpdateStat = (index: number, field: "label" | "value", val: string) => {
    if (!profile) return;
    const newStats = [...(profile.stats || [])];
    newStats[index] = { ...newStats[index], [field]: val };
    setProfile({ ...profile, stats: newStats });
    setHasDraft(true);
    setStatus("draft");
  };

  const handleRemoveStat = (index: number) => {
    if (!profile) return;
    setProfile({
      ...profile,
      stats: (profile.stats || []).filter((_, i) => i !== index),
    });
    setHasDraft(true);
    setStatus("draft");
  };

  // Rich Text Markdown Toolbar helpers for Full Bio
  const handleInsertBioMarkdown = (syntax: string) => {
    if (!profile) return;
    const current = profile.fullBio || "";
    setProfile({ ...profile, fullBio: current + syntax });
    setHasDraft(true);
    setStatus("draft");
  };

  if (loading) {
    return (
      <StudioLoader
        label="Loading Profile Structure..."
        sublabel="Fetching biography, skills, and personal information"
      />
    );
  }

  if (!profile) {
    return (
      <div className="p-8 text-center text-zinc-500 text-sm">
        Failed to load profile. Please refresh.
      </div>
    );
  }

  const tabs: Array<{ id: ProfileTab; label: string; icon: React.ElementType }> = [
    { id: "basic", label: "Basic Info", icon: User },
    { id: "bio", label: "Bio & About", icon: FileText },
    { id: "image", label: "Profile Picture", icon: ImageIcon },
    { id: "contact", label: "Contact & Status", icon: Mail },
    { id: "social", label: "Social Links", icon: Share2 },
    { id: "stats", label: "Stats & Metrics", icon: BarChart3 },
  ];

  return (
    <div className="w-full space-y-6 pb-20 px-4 sm:px-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-3.5 rounded-xl border bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-2">
          <span className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4" />
            {toastMessage}
          </span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-emerald-600 hover:text-emerald-800 dark:hover:text-emerald-300 px-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Unified Document Header with Breadcrumb & Publish Toolbar */}
      <DocumentHeader
        title={`${profile.firstName} ${profile.lastName}`}
        category="Profile (Singleton)"
        status={status}
        saving={saving}
        publishing={publishing}
        hasDraft={hasDraft}
        onSaveDraft={handleSaveDraft}
        onPublish={handlePublish}
        onDiscard={handleDiscard}
        onOpenHistory={() => setHistoryOpen(true)}
        previewUrl="/"
      />

      {/* Tabs Navigation */}
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

      {/* TAB CONTENT */}

      {/* 1. Basic Information */}
      {activeTab === "basic" && (
        <div className="bg-card border border-border rounded-2xl p-6 space-y-6 shadow-xs">
          <div>
            <h3 className="text-sm font-bold text-foreground">Basic Information</h3>
            <p className="text-xs text-muted-foreground">
              Your name, professional headline, and animated hero keywords.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                First Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={profile.firstName}
                onChange={(e) => {
                  setProfile({ ...profile, firstName: e.target.value });
                  setHasDraft(true);
                  setStatus("draft");
                }}
                className="w-full bg-background border border-border rounded-lg px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Last Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={profile.lastName}
                onChange={(e) => {
                  setProfile({ ...profile, lastName: e.target.value });
                  setHasDraft(true);
                  setStatus("draft");
                }}
                className="w-full bg-background border border-border rounded-lg px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Professional Headline <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={profile.headline}
              placeholder="e.g. Full-Stack Developer & AI Engineer"
              onChange={(e) => {
                setProfile({ ...profile, headline: e.target.value });
                setHasDraft(true);
                setStatus("draft");
              }}
              className="w-full bg-background border border-border rounded-lg px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <p className="text-[11px] text-zinc-400">
              This headline appears in the Hero section and meta search tags.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-border">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Headline Static Text
              </label>
              <input
                type="text"
                placeholder="e.g. I build"
                value={profile.headlineStaticText || ""}
                onChange={(e) => {
                  setProfile({ ...profile, headlineStaticText: e.target.value });
                  setHasDraft(true);
                  setStatus("draft");
                }}
                className="w-full bg-background border border-border rounded-lg px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Headline Animation Duration (ms)
              </label>
              <input
                type="number"
                min={1000}
                max={10000}
                step={500}
                value={profile.headlineAnimationDuration || 3000}
                onChange={(e) => {
                  setProfile({
                    ...profile,
                    headlineAnimationDuration: parseInt(e.target.value) || 3000,
                  });
                  setHasDraft(true);
                  setStatus("draft");
                }}
                className="w-full bg-background border border-border rounded-lg px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {/* Animated Words Chip Manager */}
          <div className="space-y-3 pt-2">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              Headline Animated Words (Flip Animation)
            </label>
            <p className="text-[11px] text-muted-foreground">
              Words that rotate automatically next to the static headline text.
            </p>

            {/* Existing Words Chips */}
            <div className="flex flex-wrap gap-2">
              {(profile.headlineAnimatedWords || []).map((word) => (
                <span
                  key={word}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary/10 text-primary border border-primary/20"
                >
                  <span>{word}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveWord(word)}
                    className="hover:text-rose-500 transition-colors"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>

            {/* Add New Word Form */}
            <form onSubmit={handleAddWord} className="flex gap-2 max-w-md pt-1">
              <input
                type="text"
                placeholder="Add rotating keyword (e.g. Next.js Apps)"
                value={newWord}
                onChange={(e) => setNewWord(e.target.value)}
                className="flex-1 bg-background border border-border rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                type="submit"
                className="px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold transition-colors"
              >
                + Add Word
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 2. Bio & About */}
      {activeTab === "bio" && (
        <div className="bg-card border border-border rounded-2xl p-6 space-y-6 shadow-xs">
          <div>
            <h3 className="text-sm font-bold text-foreground">Biography & Description</h3>
            <p className="text-xs text-muted-foreground">
              Provide a brief summary for Hero cards and a rich narrative for your About page.
            </p>
          </div>

          {/* Short Bio */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Short Bio (2-3 sentences) <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-zinc-400">
                {(profile.shortBio || "").length} / 300 characters
              </span>
            </div>
            <textarea
              rows={3}
              maxLength={300}
              required
              value={profile.shortBio}
              onChange={(e) => {
                setProfile({ ...profile, shortBio: e.target.value });
                setHasDraft(true);
                setStatus("draft");
              }}
              className="w-full bg-background border border-border rounded-lg p-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed"
            />
          </div>

          {/* Full Bio with Rich Markdown & HTML Execution Support */}
          <div className="space-y-2 pt-2 border-t border-border">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
              <div>
                <label className="text-xs font-semibold text-foreground">
                  Full Bio (Rich Narrative with Markdown & HTML Execution)
                </label>
                <p className="text-[11px] text-muted-foreground">
                  Supports GitHub Markdown, raw HTML tags, inline CSS styles, badges, responsive cards, and templates.
                </p>
              </div>
            </div>

            <StudioMarkdownEditor
              value={profile.fullBio || ""}
              onChange={(val) => {
                setProfile({ ...profile, fullBio: val });
                setHasDraft(true);
                setStatus("draft");
              }}
              minHeight="450px"
            />
          </div>
        </div>
      )}

      {/* 3. Profile Picture & Media (Drag & Drop Uploader) */}
      {activeTab === "image" && (
        <div className="bg-card border border-border rounded-2xl p-6 space-y-6 shadow-xs">
          <div>
            <h3 className="text-sm font-bold text-foreground">Profile Photo & Media</h3>
            <p className="text-xs text-muted-foreground">
              Drag & drop your portrait photo. Supports all image formats (WebP, PNG, JPG, SVG, GIF, AVIF, ICO).
            </p>
          </div>

          <StudioImageUploader
            value={profile.profileImage}
            altText={profile.profileImageAlt || `${profile.firstName} ${profile.lastName}`}
            folder="profile"
            label="Profile Picture"
            description="Drag and drop your image, select from computer, or paste directly from clipboard."
            onChange={(url) => {
              setProfile({ ...profile, profileImage: url });
              setHasDraft(true);
              setStatus("draft");
            }}
            onAltChange={(alt) => {
              setProfile({ ...profile, profileImageAlt: alt });
              setHasDraft(true);
              setStatus("draft");
            }}
          />
        </div>
      )}

      {/* 4. Contact & Availability */}
      {activeTab === "contact" && (
        <div className="bg-card border border-border rounded-2xl p-6 space-y-6 shadow-xs">
          <div>
            <h3 className="text-sm font-bold text-foreground">Contact & Availability</h3>
            <p className="text-xs text-muted-foreground">
              Where clients can reach you and your current hiring availability status.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                required
                value={profile.email}
                onChange={(e) => {
                  setProfile({ ...profile, email: e.target.value });
                  setHasDraft(true);
                  setStatus("draft");
                }}
                className="w-full bg-background border border-border rounded-lg px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Phone Number
              </label>
              <input
                type="text"
                placeholder="+8801521788920"
                value={profile.phone || ""}
                onChange={(e) => {
                  setProfile({ ...profile, phone: e.target.value });
                  setHasDraft(true);
                  setStatus("draft");
                }}
                className="w-full bg-background border border-border rounded-lg px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Location
              </label>
              <input
                type="text"
                placeholder="Dhaka, Bangladesh"
                value={profile.location || ""}
                onChange={(e) => {
                  setProfile({ ...profile, location: e.target.value });
                  setHasDraft(true);
                  setStatus("draft");
                }}
                className="w-full bg-background border border-border rounded-lg px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Availability Status
              </label>
              <select
                value={profile.availability || "available"}
                onChange={(e) => {
                  setProfile({
                    ...profile,
                    availability: e.target.value as "available" | "open" | "unavailable",
                  });
                  setHasDraft(true);
                  setStatus("draft");
                }}
                className="w-full bg-background border border-border rounded-lg px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="available">🟢 Available for hire</option>
                <option value="open">🟡 Open to opportunities</option>
                <option value="unavailable">🔴 Not looking</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* 5. Social Links */}
      {activeTab === "social" && (
        <div className="bg-card border border-border rounded-2xl p-6 space-y-6 shadow-xs">
          <div>
            <h3 className="text-sm font-bold text-foreground">Social & Developer Profiles</h3>
            <p className="text-xs text-muted-foreground">
              Links to your public developer profiles and social media channels.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { key: "github", label: "GitHub URL", placeholder: "https://github.com/..." },
              { key: "linkedin", label: "LinkedIn URL", placeholder: "https://linkedin.com/in/..." },
              { key: "twitter", label: "Twitter / X URL", placeholder: "https://x.com/..." },
              { key: "website", label: "Personal Website", placeholder: "https://..." },
              { key: "medium", label: "Medium Blog", placeholder: "https://medium.com/@..." },
              { key: "devto", label: "Dev.to Profile", placeholder: "https://dev.to/..." },
              { key: "youtube", label: "YouTube Channel", placeholder: "https://youtube.com/@..." },
              { key: "stackoverflow", label: "Stack Overflow", placeholder: "https://stackoverflow.com/users/..." },
            ].map(({ key, label, placeholder }) => (
              <div key={key} className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  {label}
                </label>
                <input
                  type="url"
                  placeholder={placeholder}
                  value={(profile.socialLinks as any)?.[key] || ""}
                  onChange={(e) => {
                    setProfile({
                      ...profile,
                      socialLinks: {
                        ...(profile.socialLinks || {}),
                        [key]: e.target.value,
                      },
                    });
                    setHasDraft(true);
                    setStatus("draft");
                  }}
                  className="w-full bg-background border border-border rounded-lg px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. Stats & Metrics */}
      {activeTab === "stats" && (
        <div className="bg-card border border-border rounded-2xl p-6 space-y-6 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-foreground">Profile Statistics & Visual Metrics</h3>
              <p className="text-xs text-muted-foreground">
                Numerical achievements and interactive graphs displayed on your hero and about cards.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddStat}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Stat
            </button>
          </div>

          {/* Interactive Recharts Visual Graphs */}
          {mounted && statsChartData.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pb-4 border-b border-border">
              {/* Bar Chart: Key Metrics */}
              <div className="p-4 rounded-xl border border-border bg-card/60 backdrop-blur-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">Metrics Comparison</span>
                  <span className="text-[11px] text-muted-foreground font-mono">Live Bar Chart</span>
                </div>
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={statsChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: "currentColor" }} interval={0} angle={-15} textAnchor="end" />
                      <YAxis tick={{ fontSize: 11, fill: "currentColor" }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--card)",
                          borderColor: "var(--border)",
                          borderRadius: "12px",
                          fontSize: "12px",
                          color: "var(--foreground)",
                        }}
                      />
                      <Bar dataKey="value" fill="var(--primary)" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Area Chart: Progression & Velocity */}
              <div className="p-4 rounded-xl border border-border bg-card/60 backdrop-blur-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">Impact & Milestone Curve</span>
                  <span className="text-[11px] text-primary font-mono font-semibold">
                    {profile.yearsOfExperience || 0} Yrs Experience
                  </span>
                </div>
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={statsChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                      <defs>
                        <linearGradient id="statColor" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.6}/>
                          <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.05}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: "currentColor" }} interval={0} angle={-15} textAnchor="end" />
                      <YAxis tick={{ fontSize: 11, fill: "currentColor" }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--card)",
                          borderColor: "var(--border)",
                          borderRadius: "12px",
                          fontSize: "12px",
                          color: "var(--foreground)",
                        }}
                      />
                      <Area type="monotone" dataKey="value" stroke="var(--primary)" fillOpacity={1} fill="url(#statColor)" strokeWidth={2.5} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          <div className="max-w-xs space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Years of Experience
            </label>
            <input
              type="number"
              min={0}
              value={profile.yearsOfExperience || 0}
              onChange={(e) => {
                setProfile({
                  ...profile,
                  yearsOfExperience: parseInt(e.target.value) || 0,
                });
                setHasDraft(true);
                setStatus("draft");
              }}
              className="w-full bg-background border border-border rounded-lg px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Dynamic Stats Items */}
          <div className="space-y-3 pt-2">
            {(profile.stats || []).map((st, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-3 rounded-xl bg-background/40 border border-border/80"
              >
                <div className="flex-1 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Label</span>
                  <input
                    type="text"
                    value={st.label}
                    placeholder="e.g. Completed Projects"
                    onChange={(e) => handleUpdateStat(idx, "label", e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="w-36 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Value</span>
                  <input
                    type="text"
                    value={st.value}
                    placeholder="e.g. 30+"
                    onChange={(e) => handleUpdateStat(idx, "value", e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-bold"
                  />
                </div>
                <div className="pt-4">
                  <button
                    type="button"
                    onClick={() => handleRemoveStat(idx)}
                    className="p-2 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                    title="Delete Stat"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Slide-over Draft History Drawer */}
      <DraftHistoryDrawer
        isOpen={historyOpen}
        collectionName="profile"
        documentId="singleton-profile"
        currentUserEmail={authorEmail}
        onClose={() => setHistoryOpen(false)}
        onRestore={handleRestoreSnapshot}
      />
    </div>
  );
}
