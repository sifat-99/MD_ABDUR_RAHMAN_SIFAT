"use client";

import React, { useState, useEffect } from "react";
import type { Achievement } from "@/types/portfolio";
import { getAchievements, saveAchievement, deleteAchievement } from "@/lib/db-service";
import { StudioImageUploader } from "./StudioImageUploader";
import { StudioLoader } from "./StudioLoader";
import { StudioModal } from "./StudioModal";
import { StudioViewToggle, type StudioViewMode } from "./StudioViewToggle";
import { useStudioConfirm, studioAlert } from "./StudioConfirmContext";
import { Plus, Edit2, Trash2, Trophy, Star, ExternalLink } from "lucide-react";

export function AchievementsManager() {
  const { confirm } = useStudioConfirm();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<StudioViewMode>("grid");
  const [editingAch, setEditingAch] = useState<Partial<Achievement> | null>(null);
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const data = await getAchievements();
    setAchievements(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = () => {
    setEditingAch({
      id: `ach_${Date.now()}`,
      title: "",
      type: "award",
      issuer: "",
      date: new Date().toISOString().split("T")[0],
      description: "",
      featured: false,
      order: achievements.length + 1,
    });
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: "Delete Achievement?",
      description: "Are you sure you want to remove this honor/achievement from your showcase?",
      confirmText: "Delete Achievement",
      variant: "destructive",
    });
    if (!ok) return;
    await deleteAchievement(id);
    setAchievements((prev) => prev.filter((a) => a.id !== id));
    studioAlert.success("Achievement deleted successfully.");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAch?.title) return;
    setSaving(true);
    try {
      const payload: Achievement = {
        id: editingAch.id || `ach_${Date.now()}`,
        title: editingAch.title,
        type: editingAch.type || "award",
        issuer: editingAch.issuer || "",
        date: editingAch.date || new Date().toISOString().split("T")[0],
        description: editingAch.description || "",
        image: editingAch.image || "",
        url: editingAch.url || "",
        featured: Boolean(editingAch.featured),
        order: Number(editingAch.order ?? 0),
      };

      await saveAchievement(payload);
      setEditingAch(null);
      await loadData();
      studioAlert.success("Achievement saved successfully.");
    } catch (err) {
      console.error(err);
      studioAlert.error("Failed to save achievement. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <StudioLoader label="Loading Achievements..." sublabel="Fetching awards, honors and milestones" />;

  const sortedAchievements = [...achievements].sort((a, b) => {
    const orderA = typeof a.order === "number" ? a.order : null;
    const orderB = typeof b.order === "number" ? b.order : null;
    if (orderA !== null && orderB !== null) return orderA - orderB;
    if (orderA !== null) return -1;
    if (orderB !== null) return 1;
    return 0;
  });

  return (
    <div className="w-full pb-20">
      <div className="sticky top-0 z-30 bg-card/90 dark:bg-zinc-900/90 backdrop-blur-2xl border-b border-border py-4 px-4 sm:px-8 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <h2 className="text-2xl font-bold text-foreground tracking-tight">Achievements & Awards</h2>
          <p className="text-sm text-muted-foreground">Honors, hackathon wins, publications, and professional milestones</p>
        </div>
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <StudioViewToggle mode={viewMode} onChange={setViewMode} />
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/25"
          >
            <Plus className="w-4 h-4" /> Add Achievement
          </button>
        </div>
      </div>

      <div className="px-4 sm:px-8 space-y-6">

      <StudioModal
        isOpen={Boolean(editingAch)}
        onClose={() => setEditingAch(null)}
        title={editingAch?.title ? `Edit: ${editingAch.title}` : "New Achievement or Award"}
        subtitle="Manage honors, hackathon wins, publications, speaking and awards"
        maxWidth="2xl"
        onSubmit={handleSave}
        footer={
          <>
            <button
              type="button"
              onClick={() => setEditingAch(null)}
              className="px-4 py-2 rounded-xl border border-border bg-muted/50 hover:bg-muted text-foreground text-xs font-semibold transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold transition-all shadow-md shadow-primary/25 cursor-pointer hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Achievement"}
            </button>
          </>
        }
      >
        {editingAch && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground/90">Achievement Title *</label>
              <input
                type="text"
                required
                value={editingAch.title || ""}
                onChange={(e) => setEditingAch({ ...editingAch, title: e.target.value })}
                className="w-full bg-background dark:bg-zinc-950/70 border border-border rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary shadow-xs transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground/90">Type</label>
                <select
                  value={editingAch.type || "award"}
                  onChange={(e) => setEditingAch({ ...editingAch, type: e.target.value })}
                  className="w-full bg-background dark:bg-zinc-950/70 border border-border rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary shadow-xs transition-all capitalize"
                >
                  <option value="award">Award</option>
                  <option value="hackathon">Hackathon Win</option>
                  <option value="publication">Publication</option>
                  <option value="speaking">Speaking</option>
                  <option value="open-source">Open Source</option>
                  <option value="milestone">Milestone</option>
                  <option value="recognition">Recognition</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground/90">Issuer / Organization</label>
                <input
                  type="text"
                  value={editingAch.issuer || ""}
                  onChange={(e) => setEditingAch({ ...editingAch, issuer: e.target.value })}
                  className="w-full bg-background dark:bg-zinc-950/70 border border-border rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary shadow-xs transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground/90">Date *</label>
                <input
                  type="date"
                  required
                  value={editingAch.date || ""}
                  onChange={(e) => setEditingAch({ ...editingAch, date: e.target.value })}
                  className="w-full bg-background dark:bg-zinc-950/70 border border-border rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary shadow-xs transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground/90">URL / Announcement</label>
                <input
                  type="url"
                  value={editingAch.url || ""}
                  onChange={(e) => setEditingAch({ ...editingAch, url: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-background dark:bg-zinc-950/70 border border-border rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary shadow-xs transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground/90">Description</label>
              <textarea
                rows={3}
                value={editingAch.description || ""}
                onChange={(e) => setEditingAch({ ...editingAch, description: e.target.value })}
                className="w-full bg-background dark:bg-zinc-950/70 border border-border rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary shadow-xs transition-all leading-relaxed"
              />
            </div>

            {/* Award / Badge Image */}
            <StudioImageUploader
              value={editingAch.image}
              folder="achievements"
              label="Award Badge / Trophy Photo"
              description="Upload badge or award photo (WebP, PNG, JPG, SVG, GIF, AVIF, ICO)."
              onChange={(url) => setEditingAch({ ...editingAch, image: url })}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border">
              <label className="flex items-center gap-2 cursor-pointer font-semibold text-xs text-foreground">
                <input
                  type="checkbox"
                  checked={Boolean(editingAch.featured)}
                  onChange={(e) => setEditingAch({ ...editingAch, featured: e.target.checked })}
                  className="rounded bg-background border-border text-primary focus:ring-primary cursor-pointer"
                />
                <span className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" /> Featured Achievement
                </span>
              </label>

              <div className="flex items-center gap-2 sm:justify-end">
                <label className="text-xs font-semibold text-foreground/90">Display Order:</label>
                <input
                  type="number"
                  value={editingAch.order ?? 0}
                  onChange={(e) => setEditingAch({ ...editingAch, order: Number(e.target.value) })}
                  className="w-20 bg-background dark:bg-zinc-950/70 border border-border rounded-lg px-2.5 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono text-center"
                />
              </div>
            </div>
          </div>
        )}
      </StudioModal>

      {/* Views: Grid & List */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedAchievements.map((ach) => (
            <div
              key={ach.id}
              className="bg-card/90 dark:bg-zinc-900/80 border border-border/80 dark:border-white/10 backdrop-blur-xl rounded-2xl p-5 hover:shadow-xl hover:shadow-primary/5 transition-all flex flex-col justify-between text-card-foreground shadow-xs group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">
                      {ach.type}
                    </span>
                    {typeof ach.order === "number" && (
                      <span className="text-[10px] font-mono font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded border border-border">
                        #{ach.order}
                      </span>
                    )}
                  </div>
                  {ach.featured && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                </div>
                <h4 className="text-base font-bold text-foreground group-hover:text-primary transition-colors mt-1 font-heading">{ach.title}</h4>
                {ach.issuer && <p className="text-xs text-muted-foreground mt-0.5">{ach.issuer}</p>}
                <p className="text-[11px] text-muted-foreground font-mono mt-1">{ach.date}</p>
                {ach.description && <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">{ach.description}</p>}
              </div>

              <div className="flex items-center justify-between pt-3 mt-3 border-t border-border">
                {ach.url ? (
                  <a href={ach.url} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline inline-flex items-center gap-1 font-medium cursor-pointer">
                    Link <ExternalLink className="w-3 h-3" />
                  </a>
                ) : <span />}

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setEditingAch({ ...ach })}
                    className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(ach.id)}
                    className="p-2 text-muted-foreground hover:text-red-500 rounded-lg hover:bg-red-500/10 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-card/90 dark:bg-zinc-900/80 border border-border/80 dark:border-white/10 rounded-2xl overflow-hidden shadow-xs backdrop-blur-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/60 dark:bg-zinc-950/60 border-b border-border text-muted-foreground font-heading uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">#</th>
                  <th className="py-3 px-4">Title & Issuer</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Link</th>
                  <th className="py-3 px-4 text-center">Featured</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {sortedAchievements.map((ach, idx) => (
                  <tr key={ach.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 text-center font-mono text-muted-foreground">
                      {typeof ach.order === "number" ? ach.order : idx + 1}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {ach.image && (
                          <div className="w-9 h-9 rounded-lg border border-border overflow-hidden bg-muted shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={ach.image} alt={ach.title} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-foreground font-heading">{ach.title}</div>
                          {ach.issuer && <div className="text-muted-foreground text-[11px]">{ach.issuer}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                        {ach.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-muted-foreground whitespace-nowrap">
                      {ach.date}
                    </td>
                    <td className="py-3 px-4">
                      {ach.url ? (
                        <a href={ach.url} target="_blank" rel="noreferrer" className="text-primary hover:underline inline-flex items-center gap-1 font-mono text-[11px]">
                          URL <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-muted-foreground/40">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {ach.featured ? (
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 inline" />
                      ) : (
                        <span className="text-muted-foreground/40">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => setEditingAch({ ...ach })}
                          className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(ach.id)}
                          className="p-1.5 text-muted-foreground hover:text-red-500 rounded-lg hover:bg-red-500/10 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
