"use client";

import React, { useState, useEffect } from "react";
import type { Education } from "@/types/portfolio";
import { getEducations, saveEducation, deleteEducation } from "@/lib/db-service";
import { Plus, Edit2, Trash2, GraduationCap } from "lucide-react";
import { StudioLoader } from "./StudioLoader";
import { StudioModal } from "./StudioModal";
import { StudioViewToggle, type StudioViewMode } from "./StudioViewToggle";
import { useStudioConfirm, studioAlert } from "./StudioConfirmContext";

export function EducationManager() {
  const { confirm } = useStudioConfirm();
  const [educations, setEducations] = useState<Education[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingEdu, setEditingEdu] = useState<Partial<Education> | null>(null);
  const [saving, setSaving] = useState(false);
  const [viewMode, setViewMode] = useState<StudioViewMode>("grid");

  const sortedEducations = [...educations].sort((a, b) => {
    const orderA = typeof a.order === "number" ? a.order : null;
    const orderB = typeof b.order === "number" ? b.order : null;
    if (orderA !== null && orderB !== null) return orderA - orderB;
    if (orderA !== null) return -1;
    if (orderB !== null) return 1;
    return 0;
  });

  const loadData = async () => {
    setLoading(true);
    const data = await getEducations();
    setEducations(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = () => {
    setEditingEdu({
      id: `edu_${Date.now()}`,
      institution: "",
      degree: "",
      fieldOfStudy: "",
      current: false,
      gpa: "",
      description: "",
      achievements: [],
      order: educations.length + 1,
    });
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: "Delete Education Entry?",
      description: "Are you sure you want to remove this academic degree/qualification? This cannot be undone.",
      confirmText: "Delete Entry",
      variant: "destructive",
    });
    if (!ok) return;
    await deleteEducation(id);
    setEducations(educations.filter((e) => e.id !== id));
    studioAlert.success("Education entry deleted.");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEdu?.institution || !editingEdu?.degree) return;
    setSaving(true);
    try {
      const payload: Education = {
        id: editingEdu.id || `edu_${Date.now()}`,
        institution: editingEdu.institution,
        degree: editingEdu.degree,
        fieldOfStudy: editingEdu.fieldOfStudy || "",
        startDate: editingEdu.startDate || "",
        endDate: editingEdu.current ? undefined : editingEdu.endDate,
        current: Boolean(editingEdu.current),
        gpa: editingEdu.gpa || "",
        description: editingEdu.description || "",
        achievements: editingEdu.achievements || [],
        logo: editingEdu.logo || "",
        website: editingEdu.website || "",
        order: Number(editingEdu.order ?? 0),
      };

      await saveEducation(payload);
      setEditingEdu(null);
      await loadData();
      studioAlert.success("Education entry saved successfully.");
    } catch (err) {
      console.error(err);
      studioAlert.error("Failed to save education. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <StudioLoader label="Loading Education..." sublabel="Fetching academic degrees and achievements" />;

  return (
    <div className="w-full pb-20">
      <div className="sticky top-0 z-30 bg-card/90 dark:bg-zinc-900/90 backdrop-blur-2xl border-b border-border py-4 px-4 sm:px-8 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <h2 className="text-2xl font-extrabold text-foreground tracking-tight">Education</h2>
          <p className="text-xs text-muted-foreground font-medium mt-0.5">Academic background, degrees, institutions, and achievements</p>
        </div>
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <StudioViewToggle mode={viewMode} onChange={setViewMode} />
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/25"
          >
            <Plus className="w-4 h-4" /> Add Education
          </button>
        </div>
      </div>

      <div className="px-4 sm:px-8 space-y-6">

      <StudioModal
        isOpen={Boolean(editingEdu)}
        onClose={() => setEditingEdu(null)}
        title={editingEdu?.institution ? `Edit: ${editingEdu.degree}` : "New Academic Education"}
        subtitle="Institution, degree, graduation timeframe and grades"
        maxWidth="2xl"
        onSubmit={handleSave}
        footer={
          <>
            <button
              type="button"
              onClick={() => setEditingEdu(null)}
              className="px-4 py-2 rounded-xl border border-border bg-muted/50 hover:bg-muted text-foreground text-xs font-semibold transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold transition-all shadow-md shadow-primary/25 cursor-pointer hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Education"}
            </button>
          </>
        }
      >
        {editingEdu && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground/90">Institution Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Bangladesh University of Business and Technology"
                value={editingEdu.institution || ""}
                onChange={(e) => setEditingEdu({ ...editingEdu, institution: e.target.value })}
                className="w-full bg-background dark:bg-zinc-950/70 border border-border rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary shadow-xs transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground/90">Degree *</label>
                <input
                  type="text"
                  required
                  value={editingEdu.degree || ""}
                  onChange={(e) => setEditingEdu({ ...editingEdu, degree: e.target.value })}
                  placeholder="e.g. Bachelor of Science"
                  className="w-full bg-background dark:bg-zinc-950/70 border border-border rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary shadow-xs transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground/90">Field of Study</label>
                <input
                  type="text"
                  value={editingEdu.fieldOfStudy || ""}
                  onChange={(e) => setEditingEdu({ ...editingEdu, fieldOfStudy: e.target.value })}
                  placeholder="e.g. Computer Science & Engineering"
                  className="w-full bg-background dark:bg-zinc-950/70 border border-border rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary shadow-xs transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground/90">Start Date</label>
                <input
                  type="date"
                  value={editingEdu.startDate || ""}
                  onChange={(e) => setEditingEdu({ ...editingEdu, startDate: e.target.value })}
                  className="w-full bg-background dark:bg-zinc-950/70 border border-border rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary shadow-xs transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-foreground/90">End Date</label>
                  <label className="text-xs flex items-center gap-1.5 text-primary cursor-pointer font-semibold">
                    <input
                      type="checkbox"
                      checked={Boolean(editingEdu.current)}
                      onChange={(e) => setEditingEdu({ ...editingEdu, current: e.target.checked })}
                      className="rounded bg-background border-border text-primary focus:ring-primary cursor-pointer"
                    />
                    Currently Enrolled
                  </label>
                </div>
                <input
                  type="date"
                  disabled={Boolean(editingEdu.current)}
                  value={editingEdu.endDate || ""}
                  onChange={(e) => setEditingEdu({ ...editingEdu, endDate: e.target.value })}
                  className="w-full bg-background dark:bg-zinc-950/70 border border-border rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary shadow-xs transition-all disabled:opacity-40"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground/90">GPA / Grade Score</label>
                <input
                  type="text"
                  value={editingEdu.gpa || ""}
                  onChange={(e) => setEditingEdu({ ...editingEdu, gpa: e.target.value })}
                  placeholder="e.g. 3.8 / 4.0 or First Class"
                  className="w-full bg-background dark:bg-zinc-950/70 border border-border rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary shadow-xs transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground/90">Institution Website</label>
                <input
                  type="url"
                  value={editingEdu.website || ""}
                  onChange={(e) => setEditingEdu({ ...editingEdu, website: e.target.value })}
                  placeholder="https://university.edu"
                  className="w-full bg-background dark:bg-zinc-950/70 border border-border rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary shadow-xs transition-all"
                />
              </div>
            </div>
          </div>
        )}
      </StudioModal>

      {/* Education Display: Grid or Table/List */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sortedEducations.map((edu, idx) => (
            <div
              key={edu.id}
              className="bg-card/90 dark:bg-zinc-900/80 border border-border/80 dark:border-white/10 backdrop-blur-xl rounded-2xl p-5 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all flex items-start justify-between text-card-foreground shadow-xs group relative"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-muted border border-border flex items-center justify-center shrink-0 shadow-2xs">
                  <GraduationCap className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-muted text-muted-foreground border border-border">
                      #{edu.order ?? idx + 1}
                    </span>
                    <h4 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">{edu.degree}</h4>
                  </div>
                  <p className="text-sm text-primary font-semibold">{edu.institution}</p>
                  <p className="text-xs text-muted-foreground">{edu.fieldOfStudy} {edu.gpa ? `• GPA: ${edu.gpa}` : ""}</p>
                  <p className="text-xs text-muted-foreground font-mono mt-1">
                    {edu.startDate} - {edu.current ? "Present" : edu.endDate || "N/A"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setEditingEdu({ ...edu })}
                  className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors cursor-pointer"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(edu.id)}
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
                  <th className="py-3.5 px-4 min-w-[200px]">Degree & Major</th>
                  <th className="py-3.5 px-4">Institution</th>
                  <th className="py-3.5 px-4">Timeline</th>
                  <th className="py-3.5 px-4">GPA / Grade</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {sortedEducations.map((edu, idx) => (
                  <tr key={edu.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="py-3.5 px-4 text-center font-mono text-muted-foreground text-[11px] font-bold">
                      #{edu.order ?? idx + 1}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                          <GraduationCap className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <div className="font-bold text-foreground group-hover:text-primary transition-colors">
                            {edu.degree}
                          </div>
                          <div className="text-[11px] text-muted-foreground">{edu.fieldOfStudy}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-foreground">
                      {edu.institution}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-muted-foreground">
                      {edu.startDate} - {edu.current ? "Present" : edu.endDate || "N/A"}
                    </td>
                    <td className="py-3.5 px-4">
                      {edu.gpa ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          {edu.gpa}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-[11px]">-</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setEditingEdu({ ...edu })}
                          className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(edu.id)}
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
