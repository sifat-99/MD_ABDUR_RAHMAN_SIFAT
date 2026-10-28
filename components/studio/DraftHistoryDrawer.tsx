"use client";

import React, { useState, useEffect } from "react";
import type { DraftHistoryItem } from "@/types/portfolio";
import { getDocumentHistory, restoreDocumentHistory } from "@/lib/db-service";
import {
  History,
  RotateCcw,
  CheckCircle2,
  Clock,
  User,
  X,
  FileCode,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { useStudioConfirm, studioAlert } from "./StudioConfirmContext";

interface DraftHistoryDrawerProps {
  collectionName: string;
  documentId: string;
  isOpen: boolean;
  onClose: () => void;
  onRestored?: () => void;
  onRestore?: (snapshot: any) => void;
  currentUserEmail?: string;
}

export function DraftHistoryDrawer({
  collectionName,
  documentId,
  isOpen,
  onClose,
  onRestored,
  onRestore,
  currentUserEmail,
}: DraftHistoryDrawerProps) {
  const { confirm } = useStudioConfirm();
  const [history, setHistory] = useState<DraftHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const items = await getDocumentHistory(collectionName, documentId);
      setHistory(items);
    } catch (err) {
      console.error("Failed to load draft history:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchHistory();
      setStatusMessage(null);
    }
  }, [isOpen, collectionName, documentId]);

  if (!isOpen) return null;

  const handleRestore = async (item: DraftHistoryItem) => {
    const ok = await confirm({
      title: "Restore Historical Snapshot?",
      description: `Are you sure you want to restore the snapshot from ${new Date(
        item.timestamp
      ).toLocaleString()}? This will overwrite your active working draft.`,
      confirmText: "Restore Snapshot",
      variant: "warning",
    });
    if (!ok) return;

    setRestoringId(item.id);
    try {
      const res = await restoreDocumentHistory(item.id, currentUserEmail || "admin");
      if (res.success) {
        setStatusMessage("Snapshot restored successfully!");
        studioAlert.success("Snapshot restored successfully!");
        if (onRestore && res.data) {
          onRestore(res.data);
        }
        if (onRestored) {
          onRestored();
        }
        await fetchHistory();
      } else {
        studioAlert.error(res.error || "Failed to restore snapshot.");
      }
    } catch (err: any) {
      console.error("Restore error:", err);
      studioAlert.error(err.message || "Failed to restore snapshot.");
    } finally {
      setRestoringId(null);
    }
  };

  const getActionBadge = (action: DraftHistoryItem["action"]) => {
    switch (action) {
      case "publish":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" /> Published
          </span>
        );
      case "draft_save":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <Clock className="w-3 h-3" /> Draft Saved
          </span>
        );
      case "restore":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <RotateCcw className="w-3 h-3" /> Restored
          </span>
        );
      case "discard":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            <X className="w-3 h-3" /> Discarded
          </span>
        );
    }
  };

  const formatRelativeTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const diffMs = Date.now() - date.getTime();
      const diffSecs = Math.floor(diffMs / 1000);
      const diffMins = Math.floor(diffSecs / 60);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffSecs < 60) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return "Yesterday";
      return date.toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-card h-full shadow-2xl border-l border-border flex flex-col justify-between text-card-foreground">
        {/* Header */}
        <div className="p-5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Draft & Revision History</h3>
              <p className="text-[11px] text-muted-foreground">
                {collectionName} • {documentId}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Message */}
        {statusMessage && (
          <div className="m-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Body / Timeline */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-muted-foreground text-xs gap-3">
              <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              <span>Loading revision history...</span>
            </div>
          ) : history.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-xl bg-muted text-muted-foreground flex items-center justify-center">
                <History className="w-6 h-6" />
              </div>
              <p className="text-xs font-medium text-foreground">No revisions recorded yet</p>
              <p className="text-[11px] text-muted-foreground max-w-xs mx-auto">
                Snapshots are automatically created every time you save a draft, publish changes, or discard edits.
              </p>
            </div>
          ) : (
            <div className="relative border-l-2 border-border ml-3.5 space-y-6 py-2">
              {history.map((item) => {
                const isExpanded = expandedId === item.id;
                const isRestoring = restoringId === item.id;
                const dateObj = new Date(item.timestamp);

                return (
                  <div key={item.id} className="relative pl-6">
                    {/* Timeline Node Dot */}
                    <div
                      className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 bg-card flex items-center justify-center ${
                        item.action === "publish"
                          ? "border-emerald-500"
                          : item.action === "restore"
                          ? "border-blue-500"
                          : "border-amber-500"
                      }`}
                    >
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${
                          item.action === "publish"
                            ? "bg-emerald-500"
                            : item.action === "restore"
                            ? "bg-blue-500"
                            : "bg-amber-500"
                        }`}
                      />
                    </div>

                    {/* Card */}
                    <div className="bg-card border border-border rounded-xl p-3.5 space-y-2.5 transition-all text-card-foreground">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            {getActionBadge(item.action)}
                            <span className="text-xs font-semibold text-foreground">
                              {formatRelativeTime(item.timestamp)}
                            </span>
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-1">
                            {dateObj.toLocaleString()}
                          </p>
                        </div>

                        {/* Restore Button */}
                        <button
                          type="button"
                          onClick={() => handleRestore(item)}
                          disabled={isRestoring}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs transition-colors disabled:opacity-50"
                        >
                          <RotateCcw className={`w-3 h-3 ${isRestoring ? "animate-spin" : ""}`} />
                          {isRestoring ? "Restoring..." : "Restore"}
                        </button>
                      </div>

                      {/* Author & Summary */}
                      <div className="flex items-center gap-3 text-[11px] text-muted-foreground pt-1 border-t border-border">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3 text-muted-foreground" />
                          <span className="truncate max-w-[140px]">{item.author}</span>
                        </span>
                        {item.changeSummary && (
                          <span className="truncate text-muted-foreground italic">
                            • {item.changeSummary}
                          </span>
                        )}
                      </div>

                      {/* Expandable JSON Snapshot */}
                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={() => setExpandedId(isExpanded ? null : item.id)}
                          className="flex items-center gap-1 text-[11px] text-primary hover:underline"
                        >
                          {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                          <FileCode className="w-3 h-3" />
                          <span>{isExpanded ? "Hide snapshot details" : "Inspect snapshot payload"}</span>
                        </button>

                        {isExpanded && item.snapshot && (
                          <div className="mt-2 p-2.5 rounded-lg bg-muted text-foreground font-mono text-[10px] overflow-x-auto max-h-48 border border-border">
                            <pre>{JSON.stringify(item.snapshot, null, 2)}</pre>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-muted/30 flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            Audit trail enabled in MongoDB & Firebase
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-border text-xs font-medium text-foreground hover:bg-muted transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
