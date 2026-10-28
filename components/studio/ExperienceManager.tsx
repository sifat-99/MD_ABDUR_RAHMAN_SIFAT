"use client";

import React, { useState, useEffect } from "react";
import type { Experience } from "@/types/portfolio";
import { getExperiences, saveExperience, deleteExperience } from "@/lib/db-service";
import { uploadImage } from "@/lib/upload";
import { StudioLoader } from "./StudioLoader";
import { StudioModal } from "./StudioModal";
import { StudioViewToggle, type StudioViewMode } from "./StudioViewToggle";
import { useStudioConfirm, studioAlert } from "./StudioConfirmContext";
import { Plus, Edit2, Trash2, Briefcase } from "lucide-react";

export function ExperienceManager() {
  const { confirm } = useStudioConfirm();
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingExp, setEditingExp] = useState<Partial<Experience> | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [viewMode, setViewMode] = useState<StudioViewMode>("grid");

  const sortedExperiences = [...experiences].sort((a, b) => {
    const orderA = typeof a.order === "number" ? a.order : null;
    const orderB = typeof b.order === "number" ? b.order : null;
    if (orderA !== null && orderB !== null) return orderA - orderB;
    if (orderA !== null) return -1;
    if (orderB !== null) return 1;
    return 0;
  });

  const loadData = async () => {
    setLoading(true);
    const data = await getExperiences();
    setExperiences(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = () => {
    setEditingExp({
      id: `exp_${Date.now()}`,
      company: "",
      position: "",
      employmentType: "full-time",
      location: "Remote",
      startDate: new Date().toISOString().split("T")[0],
      current: true,
      description: "",
      responsibilities: [],
      achievements: [],
      technologies: [],
      order: experiences.length + 1,
    });
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: "Delete Experience Entry?",
      description: "Are you sure you want to remove this position from your career timeline? This action cannot be undone.",
      confirmText: "Delete Entry",
      variant: "destructive",
    });
    if (!ok) return;
    await deleteExperience(id);
    setExperiences(experiences.filter((e) => e.id !== id));
    studioAlert.success("Experience entry deleted successfully.");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExp?.company || !editingExp?.position) return;
    setSaving(true);
    try {
      const payload: Experience = {
        id: editingExp.id || `exp_${Date.now()}`,
        company: editingExp.company,
        position: editingExp.position,
        employmentType: editingExp.employmentType || "full-time",
        location: editingExp.location || "",
        startDate: editingExp.startDate || new Date().toISOString().split("T")[0],
        endDate: editingExp.current ? undefined : editingExp.endDate,
        current: Boolean(editingExp.current),
        description: editingExp.description || "",
        responsibilities: editingExp.responsibilities || [],
        achievements: editingExp.achievements || [],
        technologies: editingExp.technologies || [],
        companyLogo: editingExp.companyLogo || "",
        companyWebsite: editingExp.companyWebsite || "",
        order: Number(editingExp.order ?? 0),
      };

      await saveExperience(payload);
      setEditingExp(null);
      await loadData();
      studioAlert.success("Experience details saved successfully.");
    } catch (err) {
      console.error(err);
      studioAlert.error("Failed to save experience. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file, "companies");
      setEditingExp((prev) => prev ? { ...prev, companyLogo: url } : null);
    } catch (err: any) {
      const url = prompt("Storage upload failed. Enter logo URL directly:", "");
      if (url) setEditingExp((prev) => prev ? { ...prev, companyLogo: url } : null);
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <StudioLoader label="Loading Experiences..." sublabel="Fetching career timeline and roles" />;

  return (
    <div className="w-full pb-20">
      <div className="sticky top-0 z-30 bg-card/90 dark:bg-zinc-900/90 backdrop-blur-2xl border-b border-border py-4 px-4 sm:px-8 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <h2 className="text-2xl font-extrabold text-foreground tracking-tight">Work Experience</h2>
          <p className="text-xs text-muted-foreground font-medium mt-0.5">Manage professional positions, companies, roles and key responsibilities</p>
        </div>
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <StudioViewToggle mode={viewMode} onChange={setViewMode} />
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/25"
          >
            <Plus className="w-4 h-4" /> Add Experience
          </button>
        </div>
      </div>

      <div className="px-4 sm:px-8 space-y-6">

      <StudioModal
        isOpen={Boolean(editingExp)}
        onClose={() => setEditingExp(null)}
        title={editingExp?.company ? `Edit: ${editingExp.position} at ${editingExp.company}` : "New Work Experience"}
        subtitle="Manage company position, duration, and key accomplishments"
        maxWidth="3xl"
        onSubmit={handleSave}
        footer={
          <>
            <button
              type="button"
              onClick={() => setEditingExp(null)}
              className="px-4 py-2 rounded-xl border border-border bg-muted/50 hover:bg-muted text-foreground text-xs font-semibold transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold transition-all shadow-md shadow-primary/25 cursor-pointer hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Experience"}
            </button>
          </>
        }
      >
        {editingExp && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground/90">Position / Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Frontend Engineer"
                  value={editingExp.position || ""}
                  onChange={(e) => setEditingExp({ ...editingExp, position: e.target.value })}
                  className="w-full bg-background dark:bg-zinc-950/70 border border-border rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary shadow-xs transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground/90">Company Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Tech Inc."
                  value={editingExp.company || ""}
                  onChange={(e) => setEditingExp({ ...editingExp, company: e.target.value })}
                  className="w-full bg-background dark:bg-zinc-950/70 border border-border rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary shadow-xs transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground/90">Employment Type</label>
                <select
                  value={editingExp.employmentType || "full-time"}
                  onChange={(e) => setEditingExp({ ...editingExp, employmentType: e.target.value })}
                  className="w-full bg-background dark:bg-zinc-950/70 border border-border rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary shadow-xs transition-all"
                >
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                  <option value="freelance">Freelance</option>
                  <option value="internship">Internship</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground/90">Location</label>
                <input
                  type="text"
                  value={editingExp.location || ""}
                  onChange={(e) => setEditingExp({ ...editingExp, location: e.target.value })}
                  placeholder="e.g. Remote or Dhaka, Bangladesh"
                  className="w-full bg-background dark:bg-zinc-950/70 border border-border rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary shadow-xs transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground/90">Start Date *</label>
                <input
                  type="date"
                  required
                  value={editingExp.startDate || ""}
                  onChange={(e) => setEditingExp({ ...editingExp, startDate: e.target.value })}
                  className="w-full bg-background dark:bg-zinc-950/70 border border-border rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary shadow-xs transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-foreground/90">End Date</label>
                  <label className="text-xs flex items-center gap-1.5 text-primary cursor-pointer font-semibold">
                    <input
                      type="checkbox"
                      checked={Boolean(editingExp.current)}
                      onChange={(e) => setEditingExp({ ...editingExp, current: e.target.checked })}
                      className="rounded bg-background border-border text-primary focus:ring-primary cursor-pointer"
                    />
                    Current Role
                  </label>
                </div>
                <input
                  type="date"
                  disabled={Boolean(editingExp.current)}
                  value={editingExp.endDate || ""}
                  onChange={(e) => setEditingExp({ ...editingExp, endDate: e.target.value })}
                  className="w-full bg-background dark:bg-zinc-950/70 border border-border rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary shadow-xs transition-all disabled:opacity-40"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground/90">Job Description / Overview</label>
              <textarea
                rows={2}
                placeholder="Brief summary of your position and impact..."
                value={editingExp.description || ""}
                onChange={(e) => setEditingExp({ ...editingExp, description: e.target.value })}
                className="w-full bg-background dark:bg-zinc-950/70 border border-border rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary shadow-xs transition-all leading-relaxed"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground/90">Key Responsibilities (One per line)</label>
              <textarea
                rows={3}
                placeholder="Architected scalable microservices...&#10;Mentored 4 junior engineers...&#10;Optimized database queries by 40%..."
                value={editingExp.responsibilities?.join("\n") || ""}
                onChange={(e) => setEditingExp({
                  ...editingExp,
                  responsibilities: e.target.value.split("\n").filter(Boolean)
                })}
                className="w-full bg-background dark:bg-zinc-950/70 border border-border rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary shadow-xs transition-all leading-relaxed font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground/90">Company Logo URL</label>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="https://... or upload image"
                  value={editingExp.companyLogo || ""}
                  onChange={(e) => setEditingExp({ ...editingExp, companyLogo: e.target.value })}
                  className="flex-1 bg-background dark:bg-zinc-950/70 border border-border rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary shadow-xs transition-all"
                />
                <label className="cursor-pointer px-3.5 py-2 rounded-xl border border-primary/30 bg-primary/10 text-xs font-semibold text-primary hover:bg-primary/20 transition-all shrink-0">
                  <span>{uploading ? "Uploading..." : "Upload Logo"}</span>
                  <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                </label>
              </div>
            </div>
          </div>
        )}
      </StudioModal>

      {/* Experience Display: Grid/Cards or Table/List */}
      {viewMode === "grid" ? (
        <div className="space-y-4">
          {sortedExperiences.map((exp, idx) => (
            <div
              key={exp.id}
              className="bg-card/90 dark:bg-zinc-900/80 border border-border/80 dark:border-white/10 backdrop-blur-xl rounded-2xl p-5 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all flex items-start justify-between gap-4 text-card-foreground shadow-xs group relative"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-muted border border-border flex items-center justify-center shrink-0 overflow-hidden text-muted-foreground shadow-2xs relative">
                  {exp.companyLogo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={exp.companyLogo} alt={exp.company} className="w-full h-full object-cover" />
                  ) : (
                    <Briefcase className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-muted text-muted-foreground border border-border">
                      #{exp.order ?? idx + 1}
                    </span>
                    <h4 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">{exp.position}</h4>
                  </div>
                  <p className="text-sm font-semibold text-primary">{exp.company} • <span className="text-xs text-muted-foreground capitalize font-normal">{exp.employmentType}</span></p>
                  <p className="text-xs text-muted-foreground font-mono">
                    {exp.startDate} - {exp.current ? "Present" : exp.endDate || "N/A"} • {exp.location}
                  </p>
                  {exp.description && <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">{exp.description}</p>}
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => setEditingExp({ ...exp })}
                  className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors cursor-pointer"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(exp.id)}
                  className="p-2 text-muted-foreground hover:text-red-500 rounded-lg hover:bg-red-500/10 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table / List View */
        <div className="bg-card/90 dark:bg-zinc-900/80 border border-border/80 dark:border-white/10 backdrop-blur-xl rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/50 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  <th className="py-3.5 px-4 w-14 text-center">#</th>
                  <th className="py-3.5 px-4 min-w-[200px]">Position & Company</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Period</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {sortedExperiences.map((exp, idx) => (
                  <tr key={exp.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="py-3.5 px-4 text-center font-mono text-muted-foreground text-[11px] font-bold">
                      #{exp.order ?? idx + 1}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg overflow-hidden bg-muted border border-border shrink-0 flex items-center justify-center">
                          {exp.companyLogo ? (
                            <img src={exp.companyLogo} alt={exp.company} className="w-full h-full object-cover" />
                          ) : (
                            <Briefcase className="w-4 h-4 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-foreground group-hover:text-primary transition-colors">
                            {exp.position}
                          </div>
                          <div className="text-[11px] text-muted-foreground">{exp.company}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary capitalize">
                        {exp.employmentType}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-muted-foreground">
                      {exp.startDate} - {exp.current ? "Present" : exp.endDate || "N/A"}
                    </td>
                    <td className="py-3.5 px-4 text-muted-foreground">{exp.location}</td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setEditingExp({ ...exp })}
                          className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(exp.id)}
                          className="p-1.5 text-muted-foreground hover:text-red-500 rounded-lg hover:bg-red-500/10 transition-colors cursor-pointer"
                          title="Delete"
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
