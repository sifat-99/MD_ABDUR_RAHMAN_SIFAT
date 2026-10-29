"use client";

import React, { useState, useEffect } from "react";
import {
  syncMongoToFirebase,
  syncFirebaseToMongo,
  syncBothDatabases,
  getDatabaseSyncStatus,
  type DatabaseSyncStatus,
} from "@/lib/db-service";
import { seedInitialDataIfEmpty } from "@/lib/seed-data";
import { migrateFromSanity } from "@/lib/sanity-migration";
import {
  Database,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  ShieldAlert,
  ArrowRight,
  Layers,
  UploadCloud,
  DownloadCloud,
  ArrowLeftRight,
  Clock,
  Check,
  AlertTriangle,
} from "lucide-react";
import { isFirebaseConfigured } from "@/lib/firebase";
import { useStudioConfirm, studioAlert } from "./StudioConfirmContext";

function formatTimestamp(isoString: string | null): { relative: string; exact: string } {
  if (!isoString) {
    return { relative: "Never / No record", exact: "N/A" };
  }
  const date = new Date(isoString);
  if (isNaN(date.getTime())) {
    return { relative: "Unknown", exact: "N/A" };
  }

  const now = Date.now();
  const diffSec = Math.floor((now - date.getTime()) / 1000);

  let relative = "Just now";
  if (diffSec < 60) {
    relative = "Just now";
  } else if (diffSec < 3600) {
    const mins = Math.floor(diffSec / 60);
    relative = `${mins} min${mins > 1 ? "s" : ""} ago`;
  } else if (diffSec < 86400) {
    const hrs = Math.floor(diffSec / 3600);
    relative = `${hrs} hour${hrs > 1 ? "s" : ""} ago`;
  } else {
    const days = Math.floor(diffSec / 86400);
    relative = `${days} day${days > 1 ? "s" : ""} ago`;
  }

  const exact = date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  return { relative, exact };
}

export function SyncManager() {
  const { confirm } = useStudioConfirm();
  const [status, setStatus] = useState<DatabaseSyncStatus | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);

  const [syncingToMongo, setSyncingToMongo] = useState(false);
  const [syncingFromMongo, setSyncingFromMongo] = useState(false);
  const [syncingBoth, setSyncingBoth] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [migrating, setMigrating] = useState(false);
  const [migrationStats, setMigrationStats] = useState<Record<string, number> | null>(null);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);

  const loadStatus = async () => {
    setLoadingStatus(true);
    try {
      const data = await getDatabaseSyncStatus();
      setStatus(data);
    } catch (err) {
      console.error("Failed to load DB sync status:", err);
    } finally {
      setLoadingStatus(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  // 1. Sync Firebase -> MongoDB
  const handleSyncToMongo = async () => {
    const ok = await confirm({
      title: "Sync Firebase → MongoDB Atlas?",
      description:
        "This will read all live data currently in Firebase Realtime Database and write it directly into your MongoDB Atlas database. Proceed with sync?",
      confirmText: "Sync Firebase → MongoDB",
      variant: "default",
    });
    if (!ok) return;

    setSyncingToMongo(true);
    setMessage(null);
    try {
      const res = await syncFirebaseToMongo();
      setMessage({ text: res.message, type: res.success ? "success" : "error" });
      if (res.success) {
        studioAlert.success("MongoDB Atlas updated from Firebase!");
      } else {
        studioAlert.error("Sync to MongoDB failed.");
      }
      await loadStatus();
    } catch (err: any) {
      setMessage({ text: err.message || "Failed to sync to MongoDB.", type: "error" });
      studioAlert.error(err.message || "Failed to sync to MongoDB.");
    } finally {
      setSyncingToMongo(false);
    }
  };

  // 2. Sync MongoDB -> Firebase
  const handleSyncFromMongo = async () => {
    const ok = await confirm({
      title: "Sync MongoDB → Firebase?",
      description:
        "WARNING: This will overwrite Firebase Realtime Database with the data stored in MongoDB Atlas. Proceed with sync?",
      confirmText: "Sync MongoDB → Firebase",
      variant: "destructive",
    });
    if (!ok) return;

    setSyncingFromMongo(true);
    setMessage(null);
    try {
      const res = await syncMongoToFirebase();
      setMessage({ text: res.message, type: res.success ? "success" : "error" });
      if (res.success) {
        studioAlert.success("Firebase updated from MongoDB Atlas!");
      } else {
        studioAlert.error("Sync to Firebase failed.");
      }
      await loadStatus();
    } catch (err: any) {
      setMessage({ text: err.message || "Failed to sync to Firebase.", type: "error" });
      studioAlert.error(err.message || "Failed to sync to Firebase.");
    } finally {
      setSyncingFromMongo(false);
    }
  };

  // 3. Smart Two-Way Sync
  const handleSyncBoth = async () => {
    const ok = await confirm({
      title: "Run Smart Two-Way Sync?",
      description:
        "This will merge Firebase and MongoDB by keeping newer updates and missing records from both, achieving 100% synchronization without losing data.",
      confirmText: "Run Smart Sync",
      variant: "default",
    });
    if (!ok) return;

    setSyncingBoth(true);
    setMessage(null);
    try {
      const res = await syncBothDatabases();
      setMessage({ text: res.message, type: res.success ? "success" : "error" });
      if (res.success) {
        studioAlert.success("Both databases are now synchronized!");
      } else {
        studioAlert.error("Two-way sync failed.");
      }
      await loadStatus();
    } catch (err: any) {
      setMessage({ text: err.message || "Failed to run two-way sync.", type: "error" });
      studioAlert.error(err.message || "Failed to run two-way sync.");
    } finally {
      setSyncingBoth(false);
    }
  };

  const handleSeed = async () => {
    setSeeding(true);
    setMessage(null);
    try {
      const res = await seedInitialDataIfEmpty();
      setMessage({ text: res.message, type: res.success ? "success" : "error" });
      if (res.success) {
        studioAlert.success(res.message);
      }
      await loadStatus();
    } catch (err: any) {
      setMessage({ text: err.message || "Failed to seed.", type: "error" });
      studioAlert.error(err.message || "Failed to seed.");
    } finally {
      setSeeding(false);
    }
  };

  const handleMigrateSanity = async () => {
    const ok = await confirm({
      title: "Migrate from Sanity CMS?",
      description:
        "This will extract all real data from your Sanity CMS dataset and save it into Firebase Realtime Database & MongoDB Atlas. Proceed with migration?",
      confirmText: "Start Migration",
      variant: "warning",
    });
    if (!ok) return;

    setMigrating(true);
    setMessage(null);
    setMigrationStats(null);
    try {
      const res = await migrateFromSanity();
      setMessage({ text: res.message, type: res.success ? "success" : "error" });
      if (res.success) {
        studioAlert.success("Sanity migration completed successfully!");
      } else {
        studioAlert.error("Sanity migration encountered errors.");
      }
      if (res.counts) {
        setMigrationStats(res.counts);
      }
      await loadStatus();
    } catch (err: any) {
      setMessage({ text: err.message || "Failed to migrate from Sanity.", type: "error" });
      studioAlert.error(err.message || "Failed to migrate from Sanity.");
    } finally {
      setMigrating(false);
    }
  };

  const fbFormatted = formatTimestamp(status?.firebase?.lastUpdated || null);
  const mongoFormatted = formatTimestamp(status?.mongodb?.lastUpdated || null);

  const isFbNewer = status?.latestSource === "firebase";
  const isMongoNewer = status?.latestSource === "mongodb";
  const isEqual = status?.latestSource === "equal";

  return (
    <div className="w-full pb-20">
      {/* Top Header with Live Refresh */}
      <div className="sticky top-0 z-30 bg-card/90 dark:bg-zinc-900/90 backdrop-blur-2xl border-b border-border py-4 px-4 sm:px-8 mb-6 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-foreground tracking-tight">Database & Synchronization</h2>
          <p className="text-xs text-muted-foreground font-medium mt-0.5">
            Monitor real-time update timestamps and synchronize Firebase Realtime DB & MongoDB Atlas
          </p>
        </div>
        <button
          onClick={loadStatus}
          disabled={loadingStatus}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-muted/50 hover:bg-muted text-xs font-semibold text-foreground transition-colors disabled:opacity-50"
          title="Refresh database timestamps and status"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loadingStatus ? "animate-spin text-primary" : ""}`} />
          <span className="hidden sm:inline">Refresh Status</span>
        </button>
      </div>

      <div className="px-4 sm:px-8 space-y-6">
        {message && (
          <div
            className={`p-4 rounded-xl border flex items-start gap-3 text-sm ${
              message.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                : message.type === "info"
                ? "bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400"
                : "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
            ) : message.type === "info" ? (
              <Check className="w-5 h-5 shrink-0 mt-0.5 text-blue-600 dark:text-blue-400" />
            ) : (
              <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* 🌟 REAL-TIME DATABASE STATUS CARDS WITH LAST UPDATED TIMESTAMPS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* 1. Firebase Realtime Database Card */}
          <div
            className={`bg-card border rounded-2xl p-5 space-y-4 shadow-xs text-card-foreground transition-all ${
              isFbNewer ? "border-amber-500/40 ring-2 ring-amber-500/20" : "border-border"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <Database className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground">Firebase Realtime DB</h4>
                  <p className="text-xs text-muted-foreground">Primary Live Store</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isFbNewer && (
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 animate-pulse">
                    🟢 Newest Data
                  </span>
                )}
                {isEqual && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                    ✓ In Sync
                  </span>
                )}
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${
                    status?.firebase?.connected || isFirebaseConfigured
                      ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
                      : "bg-muted text-muted-foreground border-border"
                  }`}
                >
                  {status?.firebase?.connected || isFirebaseConfigured ? "Connected" : "Disconnected"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
              <div className="bg-muted/40 rounded-xl p-3">
                <div className="flex items-center gap-1.5 text-muted-foreground text-[11px] font-medium">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Last Updated</span>
                </div>
                <p className="text-sm font-bold text-foreground mt-1">{fbFormatted.relative}</p>
                <p className="text-[10px] text-muted-foreground truncate mt-0.5" title={fbFormatted.exact}>
                  {fbFormatted.exact}
                </p>
              </div>

              <div className="bg-muted/40 rounded-xl p-3">
                <div className="flex items-center gap-1.5 text-muted-foreground text-[11px] font-medium">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Total Items</span>
                </div>
                <p className="text-sm font-bold text-foreground mt-1">
                  {status ? `${status.firebase.totalDocuments} records` : "..."}
                </p>
                <p className="text-[10px] text-muted-foreground truncate mt-0.5">Live database store</p>
              </div>
            </div>
          </div>

          {/* 2. MongoDB Atlas Card */}
          <div
            className={`bg-card border rounded-2xl p-5 space-y-4 shadow-xs text-card-foreground transition-all ${
              isMongoNewer ? "border-emerald-500/40 ring-2 ring-emerald-500/20" : "border-border"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <Database className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground">MongoDB Atlas</h4>
                  <p className="text-xs text-muted-foreground">Persistent Document Store</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isMongoNewer && (
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 animate-pulse">
                    🟢 Newest Data
                  </span>
                )}
                {isEqual && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                    ✓ In Sync
                  </span>
                )}
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${
                    status?.mongodb?.connected
                      ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
                      : "bg-muted text-muted-foreground border-border"
                  }`}
                >
                  {status?.mongodb?.connected ? "Connected" : "Checking..."}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
              <div className="bg-muted/40 rounded-xl p-3">
                <div className="flex items-center gap-1.5 text-muted-foreground text-[11px] font-medium">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Last Updated</span>
                </div>
                <p className="text-sm font-bold text-foreground mt-1">{mongoFormatted.relative}</p>
                <p className="text-[10px] text-muted-foreground truncate mt-0.5" title={mongoFormatted.exact}>
                  {mongoFormatted.exact}
                </p>
              </div>

              <div className="bg-muted/40 rounded-xl p-3">
                <div className="flex items-center gap-1.5 text-muted-foreground text-[11px] font-medium">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Total Items</span>
                </div>
                <p className="text-sm font-bold text-foreground mt-1">
                  {status ? `${status.mongodb.totalDocuments} documents` : "..."}
                </p>
                <p className="text-[10px] text-muted-foreground truncate mt-0.5">Dual-write backup store</p>
              </div>
            </div>
          </div>
        </div>

        {/* 🌟 SMART SYNC COMPARISON NOTIFIER */}
        {status && (
          <div
            className={`p-4 rounded-xl border flex items-center justify-between gap-4 text-xs font-medium ${
              isEqual
                ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                : isFbNewer
                ? "bg-amber-500/5 border-amber-500/20 text-amber-800 dark:text-amber-200"
                : "bg-emerald-500/5 border-emerald-500/20 text-emerald-800 dark:text-emerald-200"
            }`}
          >
            <div className="flex items-center gap-2.5">
              {isEqual ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
              )}
              <span>
                {isEqual
                  ? "Both Firebase and MongoDB Atlas are 100% in sync with the same latest updates."
                  : isFbNewer
                  ? `Firebase was modified more recently than MongoDB Atlas. We recommend clicking "Sync Firebase → MongoDB".`
                  : `MongoDB Atlas has newer modifications than Firebase. We recommend clicking "Sync MongoDB → Firebase".`}
              </span>
            </div>
            {isFbNewer && (
              <button
                onClick={handleSyncToMongo}
                disabled={syncingToMongo}
                className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] transition-colors shrink-0 shadow-xs"
              >
                Sync Now →
              </button>
            )}
            {isMongoNewer && (
              <button
                onClick={handleSyncFromMongo}
                disabled={syncingFromMongo}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition-colors shrink-0 shadow-xs"
              >
                Sync Now →
              </button>
            )}
          </div>
        )}

        {/* 🌟 2 DIRECT SYNCHRONIZATION BUTTONS (USER REQUESTED) */}
        <div className="bg-card border border-border rounded-2xl p-6 space-y-5 shadow-xs text-card-foreground">
          <div>
            <h3 className="text-base font-bold text-foreground">Database Synchronization Controls</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Choose the sync direction based on which database has your latest changes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Button 1: Firebase -> MongoDB */}
            <div
              className={`p-5 rounded-xl border flex flex-col justify-between space-y-4 transition-all ${
                isFbNewer
                  ? "border-amber-500/40 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent shadow-sm"
                  : "border-border bg-muted/20"
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center text-amber-500 font-bold">
                      <UploadCloud className="w-4 h-4" />
                    </div>
                    <h4 className="text-sm font-bold text-foreground">Sync Firebase → MongoDB</h4>
                  </div>
                  {isFbNewer && (
                    <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500 text-white uppercase tracking-wider">
                      Recommended
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Reads all live data currently in Firebase Realtime Database (blog edits, settings, images) and updates MongoDB Atlas backup.
                </p>
                <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-amber-500" />
                  <span>Firebase Last Modified: <strong>{fbFormatted.relative}</strong></span>
                </div>
              </div>

              <button
                onClick={handleSyncToMongo}
                disabled={syncingToMongo}
                className="w-full py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-[0.99] text-white text-xs font-bold transition-all shadow-md shadow-amber-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {syncingToMongo ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Syncing Firebase → MongoDB...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-4 h-4" />
                    <span>Sync Firebase → MongoDB</span>
                  </>
                )}
              </button>
            </div>

            {/* Button 2: MongoDB -> Firebase */}
            <div
              className={`p-5 rounded-xl border flex flex-col justify-between space-y-4 transition-all ${
                isMongoNewer
                  ? "border-emerald-500/40 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent shadow-sm"
                  : "border-border bg-muted/20"
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-500 font-bold">
                      <DownloadCloud className="w-4 h-4" />
                    </div>
                    <h4 className="text-sm font-bold text-foreground">Sync MongoDB → Firebase</h4>
                  </div>
                  {isMongoNewer && (
                    <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500 text-white uppercase tracking-wider">
                      Recommended
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Reads MongoDB Atlas backup and restores/writes all collections into Firebase Realtime Database.
                </p>
                <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-emerald-500" />
                  <span>MongoDB Last Modified: <strong>{mongoFormatted.relative}</strong></span>
                </div>
              </div>

              <button
                onClick={handleSyncFromMongo}
                disabled={syncingFromMongo}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {syncingFromMongo ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Syncing MongoDB → Firebase...</span>
                  </>
                ) : (
                  <>
                    <DownloadCloud className="w-4 h-4" />
                    <span>Sync MongoDB → Firebase</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Optional: Smart Two-Way Merge */}
          <div className="pt-3 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <ArrowLeftRight className="w-4 h-4 text-primary" />
                <h5 className="text-xs font-bold text-foreground">Need to Merge Both Without Overwriting?</h5>
              </div>
              <p className="text-xs text-muted-foreground">
                Compares every document individually and keeps the newest version of each record across both databases.
              </p>
            </div>
            <button
              onClick={handleSyncBoth}
              disabled={syncingBoth}
              className="px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold transition-colors disabled:opacity-50 shrink-0 flex items-center gap-1.5 shadow-xs"
            >
              {syncingBoth ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Merging Both...</span>
                </>
              ) : (
                <>
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                  <span>Run Smart Two-Way Sync</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 🌟 3. SANITY CMS & STARTER SEED (SETUP UTILITIES) */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-xs space-y-4 text-card-foreground">
          <h3 className="text-base font-bold text-foreground">Starter & Migration Tools</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-border bg-muted/20 p-4 rounded-xl space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-primary" />
                  <h4 className="text-xs font-bold text-foreground">Sanity CMS Migration</h4>
                </div>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Extract projects, skills, contacts, and profile data from Sanity dataset into both Firebase & MongoDB.
                </p>
              </div>
              <button
                onClick={handleMigrateSanity}
                disabled={migrating}
                className="w-full py-2 rounded-lg bg-muted hover:bg-muted/80 text-foreground text-xs font-semibold border border-border transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {migrating ? "Migrating..." : "Run Sanity Migration"}
              </button>
            </div>

            <div className="border border-border bg-muted/20 p-4 rounded-xl space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <h4 className="text-xs font-bold text-foreground">Seed Default Projects & Skills</h4>
                </div>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Populate empty databases with starter data from Projects.json and initial tech skills.
                </p>
              </div>
              <button
                onClick={handleSeed}
                disabled={seeding}
                className="w-full py-2 rounded-lg bg-muted hover:bg-muted/80 text-foreground text-xs font-semibold border border-border transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {seeding ? "Seeding..." : "Seed Starter Data"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
