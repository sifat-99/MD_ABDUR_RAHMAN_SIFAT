"use client";

import React, { useState } from "react";
import { syncMongoToFirebase, syncFirebaseToMongo, syncBothDatabases } from "@/lib/db-service";
import { seedInitialDataIfEmpty } from "@/lib/seed-data";
import { migrateFromSanity } from "@/lib/sanity-migration";
import { Database, RefreshCw, Sparkles, CheckCircle2, ShieldAlert, ArrowRight, Layers, ArrowLeftRight, UploadCloud, DownloadCloud } from "lucide-react";
import { isFirebaseConfigured } from "@/lib/firebase";
import { useStudioConfirm, studioAlert } from "./StudioConfirmContext";

export function SyncManager() {
  const { confirm } = useStudioConfirm();
  const [syncingBoth, setSyncingBoth] = useState(false);
  const [syncingToMongo, setSyncingToMongo] = useState(false);
  const [syncingFromMongo, setSyncingFromMongo] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [migrating, setMigrating] = useState(false);
  const [migrationStats, setMigrationStats] = useState<Record<string, number> | null>(null);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const handleMigrateSanity = async () => {
    const ok = await confirm({
      title: "Migrate from Sanity CMS?",
      description: "This will extract all real data from your Sanity CMS dataset and save it into Firebase Realtime Database & MongoDB Atlas. Proceed with migration?",
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
    } catch (err: any) {
      setMessage({ text: err.message || "Failed to migrate from Sanity.", type: "error" });
      studioAlert.error(err.message || "Failed to migrate from Sanity.");
    } finally {
      setMigrating(false);
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
    } catch (err: any) {
      setMessage({ text: err.message || "Failed to seed.", type: "error" });
      studioAlert.error(err.message || "Failed to seed.");
    } finally {
      setSeeding(false);
    }
  };

  // 1. Smart Two-Way Sync (Merge & Unify)
  const handleSyncBoth = async () => {
    const ok = await confirm({
      title: "Run Smart Two-Way Database Sync?",
      description: "This will reconcile Firebase and MongoDB Atlas without data loss. Newer updates and missing items will be synchronized across both databases so they become 100% identical.",
      confirmText: "Start Smart Sync",
      variant: "default",
    });
    if (!ok) return;

    setSyncingBoth(true);
    setMessage(null);
    try {
      const res = await syncBothDatabases();
      setMessage({ text: res.message, type: res.success ? "success" : "error" });
      if (res.success) {
        studioAlert.success("Both databases are now 100% in sync!");
      } else {
        studioAlert.error("Two-way sync failed.");
      }
    } catch (err: any) {
      setMessage({ text: err.message || "Failed to sync databases.", type: "error" });
      studioAlert.error(err.message || "Failed to sync databases.");
    } finally {
      setSyncingBoth(false);
    }
  };

  // 2. Sync Firebase -> MongoDB
  const handleSyncToMongo = async () => {
    const ok = await confirm({
      title: "Push Firebase Data to MongoDB Atlas?",
      description: "This will read all live data from Firebase Realtime Database and upsert it into MongoDB Atlas backup. Proceed?",
      confirmText: "Sync to MongoDB",
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
    } catch (err: any) {
      setMessage({ text: err.message || "Failed to sync to MongoDB.", type: "error" });
      studioAlert.error(err.message || "Failed to sync to MongoDB.");
    } finally {
      setSyncingToMongo(false);
    }
  };

  // 3. Restore Firebase from MongoDB
  const handleSyncFromMongo = async () => {
    const ok = await confirm({
      title: "Restore Firebase from MongoDB Backup?",
      description: "WARNING: This will overwrite Firebase Realtime Database with whatever is currently in MongoDB Atlas. Only use this if Firebase was cleared or corrupted. Proceed?",
      confirmText: "Overwrite Firebase",
      variant: "destructive",
    });
    if (!ok) return;

    setSyncingFromMongo(true);
    setMessage(null);
    try {
      const res = await syncMongoToFirebase();
      setMessage({ text: res.message, type: res.success ? "success" : "error" });
      if (res.success) {
        studioAlert.success("Firebase restored from MongoDB backup!");
      } else {
        studioAlert.error("Sync failed.");
      }
    } catch (err: any) {
      setMessage({ text: err.message || "Failed to sync.", type: "error" });
      studioAlert.error(err.message || "Failed to sync.");
    } finally {
      setSyncingFromMongo(false);
    }
  };

  return (
    <div className="w-full pb-20">
      <div className="sticky top-0 z-30 bg-card/90 dark:bg-zinc-900/90 backdrop-blur-2xl border-b border-border py-4 px-4 sm:px-8 mb-6 shadow-xs">
        <h2 className="text-2xl font-extrabold text-foreground tracking-tight">Database, Migration & Backup</h2>
        <p className="text-xs text-muted-foreground font-medium mt-0.5">Manage live Firebase Realtime DB and MongoDB Atlas dual-sync</p>
      </div>

      <div className="px-4 sm:px-8 space-y-6">

      {message && (
        <div
          className={`p-4 rounded-xl border flex items-start gap-3 text-sm ${
            message.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
              : "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* 🌟 1. SANITY CMS MIGRATION SECTION */}
      <div className="bg-gradient-to-br from-primary/5 via-primary/3 to-transparent border-2 border-primary/20 rounded-2xl p-6 shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-md shadow-primary/25">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-foreground">Migrate Sanity CMS Data</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-primary/10 text-primary">
                  Initial Setup
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed max-w-xl">
                Extract all your real projects, skills, contact submissions, educations, certifications, and profile info directly from Sanity and write them simultaneously into Firebase Realtime Database & MongoDB Atlas.
              </p>
            </div>
          </div>

          <button
            onClick={handleMigrateSanity}
            disabled={migrating}
            className="px-5 py-3 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold transition-all shadow-lg shadow-primary/30 hover:scale-[1.02] disabled:opacity-50 shrink-0 flex items-center gap-2"
          >
            {migrating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Extracting Sanity Data...</span>
              </>
            ) : (
              <>
                <span>Start Sanity Migration</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* Migration Breakdown Stats */}
        {migrationStats && (
          <div className="mt-4 pt-4 border-t border-border">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground mb-3">
              Migration Results:
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {Object.entries(migrationStats).map(([key, count]) => (
                <div
                  key={key}
                  className="bg-card border border-border rounded-xl p-2.5 text-center shadow-xs"
                >
                  <p className="text-[10px] uppercase font-bold text-muted-foreground truncate">
                    {key}
                  </p>
                  <p className="text-base font-bold text-primary mt-0.5">
                    {count}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Database Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-card border border-border rounded-2xl p-5 space-y-3 shadow-xs text-card-foreground">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Database className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground">Firebase Realtime DB</h4>
                <p className="text-xs text-muted-foreground">Primary Live Database</p>
              </div>
            </div>
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${
                isFirebaseConfigured
                  ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
                  : "bg-muted text-muted-foreground border-border"
              }`}
            >
              {isFirebaseConfigured ? "Connected" : "Awaiting Env"}
            </span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            All client requests, live viewing, and instant updates are served with ultra-low latency from Firebase RTDB.
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 space-y-3 shadow-xs text-card-foreground">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <Database className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground">MongoDB Atlas</h4>
                <p className="text-xs text-muted-foreground">Dual-Write Persistent Database</p>
              </div>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
              Synchronized
            </span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Every studio update is concurrently committed to MongoDB Atlas with automatic schema validation and collection fallback.
          </p>
        </div>
      </div>

      {/* Action Tools */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-6 shadow-xs text-card-foreground">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-foreground">Database Synchronization & Backup Utilities</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Keep both databases 100% synchronized with guaranteed zero data loss</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 1. Smart Two-Way Sync (Recommended) */}
          <div className="border-2 border-primary/30 bg-primary/5 p-5 rounded-xl space-y-3 flex flex-col justify-between relative overflow-hidden">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ArrowLeftRight className="w-4 h-4 text-primary" />
                  <h4 className="text-sm font-bold text-foreground">Smart Two-Way Sync</h4>
                </div>
                <span className="text-[9px] uppercase tracking-wider font-extrabold bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                  Recommended
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Bi-directional reconciliation: Compares Firebase and MongoDB, keeps the newest updates from both, and ensures both databases become 100% identical with zero data loss.
              </p>
            </div>
            <button
              onClick={handleSyncBoth}
              disabled={syncingBoth}
              className="w-full py-2.5 px-4 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold transition-all shadow-md shadow-primary/20 hover:scale-[1.01] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {syncingBoth ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Synchronizing Both...</span>
                </>
              ) : (
                <>
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                  <span>Run Smart Two-Way Sync</span>
                </>
              )}
            </button>
          </div>

          {/* 2. Push Firebase -> MongoDB */}
          <div className="border border-border bg-muted/30 p-5 rounded-xl space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <UploadCloud className="w-4 h-4 text-emerald-500" />
                <h4 className="text-sm font-bold text-foreground">Push Firebase → MongoDB</h4>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Reads all current live data from Firebase RTDB (including blog images, profile updates, and settings) and writes it into MongoDB Atlas backup.
              </p>
            </div>
            <button
              onClick={handleSyncToMongo}
              disabled={syncingToMongo}
              className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-xs"
            >
              {syncingToMongo ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Pushing to MongoDB...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Sync Firebase → MongoDB</span>
                </>
              )}
            </button>
          </div>

          {/* 3. Restore Firebase from MongoDB */}
          <div className="border border-border bg-muted/30 p-5 rounded-xl space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <DownloadCloud className="w-4 h-4 text-amber-500" />
                <h4 className="text-sm font-bold text-foreground">Restore Firebase from MongoDB</h4>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Emergency restoration: Overwrites Firebase Realtime Database using the data stored in MongoDB Atlas backup. Use if Firebase was accidentally cleared.
              </p>
            </div>
            <button
              onClick={handleSyncFromMongo}
              disabled={syncingFromMongo}
              className="w-full py-2.5 px-4 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-xs"
            >
              {syncingFromMongo ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Restoring...</span>
                </>
              ) : (
                <>
                  <DownloadCloud className="w-3.5 h-3.5" />
                  <span>Restore MongoDB → Firebase</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Starter Seed Row */}
        <div className="pt-4 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <h5 className="text-xs font-bold text-foreground">Need Default Projects & Skills?</h5>
            </div>
            <p className="text-xs text-muted-foreground">
              Populates empty databases with starter projects from Projects.json and initial developer skills.
            </p>
          </div>
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 text-foreground text-xs font-medium border border-border transition-colors disabled:opacity-50 shrink-0"
          >
            {seeding ? "Seeding..." : "Seed Starter Data"}
          </button>
        </div>
      </div>
      </div>
    </div>
  );
}
