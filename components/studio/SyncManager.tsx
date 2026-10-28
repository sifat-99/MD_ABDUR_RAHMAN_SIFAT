"use client";

import React, { useState } from "react";
import { syncMongoToFirebase } from "@/lib/db-service";
import { seedInitialDataIfEmpty } from "@/lib/seed-data";
import { migrateFromSanity } from "@/lib/sanity-migration";
import { Database, RefreshCw, Sparkles, CheckCircle2, ShieldAlert, ArrowRight, Layers } from "lucide-react";
import { isFirebaseConfigured } from "@/lib/firebase";
import { useStudioConfirm, studioAlert } from "./StudioConfirmContext";

export function SyncManager() {
  const { confirm } = useStudioConfirm();
  const [syncing, setSyncing] = useState(false);
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

  const handleSyncFromMongo = async () => {
    const ok = await confirm({
      title: "Restore Firebase from MongoDB Backup?",
      description: "This will overwrite your Firebase Realtime Database with the latest data from MongoDB Atlas backup. Proceed?",
      confirmText: "Overwrite & Sync",
      variant: "destructive",
    });
    if (!ok) return;

    setSyncing(true);
    setMessage(null);
    try {
      const res = await syncMongoToFirebase();
      setMessage({ text: res.message, type: res.success ? "success" : "error" });
      if (res.success) {
        studioAlert.success("Firebase synced with MongoDB backup!");
      } else {
        studioAlert.error("Sync failed.");
      }
    } catch (err: any) {
      setMessage({ text: err.message || "Failed to sync.", type: "error" });
      studioAlert.error(err.message || "Failed to sync.");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="w-full pb-20">
      <div className="sticky top-0 z-30 bg-card/90 dark:bg-zinc-900/90 backdrop-blur-2xl border-b border-border py-4 px-4 sm:px-8 mb-6 shadow-xs">
        <h2 className="text-2xl font-extrabold text-foreground tracking-tight">Database, Migration & Backup</h2>
        <p className="text-xs text-muted-foreground font-medium mt-0.5">Migrate from Sanity, monitor database status, and manage backups</p>
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
                  Recommended
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed max-w-xl">
                Extract all your real projects, skills, 71 contact submissions, educations, certifications, and profile info directly from Sanity and write them into Firebase Realtime Database & MongoDB Atlas.
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
            All user requests, portfolio viewings, and real-time edits are served from Firebase Realtime Database.
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
                <p className="text-xs text-muted-foreground">Secondary Backup Database</p>
              </div>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
              Active Backup
            </span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Every update in the studio is automatically duplicated and stored in MongoDB Atlas via dual-write server actions.
          </p>
        </div>
      </div>

      {/* Action Tools */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-6 shadow-xs text-card-foreground">
        <h3 className="text-base font-semibold text-foreground">Backup & Recovery Utilities</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Seed Initial Data */}
          <div className="border border-border bg-muted/30 p-5 rounded-xl space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <h4 className="text-sm font-bold text-foreground">Seed Starter Data</h4>
              </div>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                Populates your database with starter projects from Projects.json and initial tech skills.
              </p>
            </div>
            <button
              onClick={handleSeed}
              disabled={seeding}
              className="w-full py-2.5 px-4 rounded-lg bg-muted hover:bg-muted/80 text-foreground text-xs font-semibold border border-border transition-colors disabled:opacity-50"
            >
              {seeding ? "Seeding..." : "Seed Starter Data"}
            </button>
          </div>

          {/* Sync MongoDB to Firebase */}
          <div className="border border-border bg-muted/30 p-5 rounded-xl space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-primary" />
                <h4 className="text-sm font-bold text-foreground">Restore Firebase from MongoDB</h4>
              </div>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                If you ever reset Firebase, this 1-click tool restores all your documents directly from the MongoDB backup.
              </p>
            </div>
            <button
              onClick={handleSyncFromMongo}
              disabled={syncing}
              className="w-full py-2.5 px-4 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold transition-colors disabled:opacity-50 shadow-xs"
            >
              {syncing ? "Syncing..." : "Sync MongoDB → Firebase"}
            </button>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
