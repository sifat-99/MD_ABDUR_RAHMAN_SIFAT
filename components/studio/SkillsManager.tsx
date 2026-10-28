"use client";

import React, { useState, useEffect } from "react";
import type { Skill } from "@/types/portfolio";
import { getSkills, saveSkill, deleteSkill } from "@/lib/db-service";
import { Plus, Edit2, Trash2, Search, Sparkles } from "lucide-react";
import { StudioLoader } from "./StudioLoader";
import { StudioModal } from "./StudioModal";
import { StudioViewToggle, type StudioViewMode } from "./StudioViewToggle";
import { useStudioConfirm, studioAlert } from "./StudioConfirmContext";

const CATEGORIES = [
  "all",
  "frontend",
  "backend",
  "ai-ml",
  "database",
  "devops",
  "mobile",
  "cloud",
  "tools",
  "other",
] as const;

export function SkillsManager() {
  const { confirm } = useStudioConfirm();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSkill, setEditingSkill] = useState<Partial<Skill> | null>(null);
  const [saving, setSaving] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<StudioViewMode>("grid");

  const loadData = async () => {
    setLoading(true);
    const data = await getSkills();
    setSkills(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = () => {
    setEditingSkill({
      id: `skill_${Date.now()}`,
      name: "",
      category: "frontend",
      proficiency: "advanced",
      percentage: 85,
      yearsOfExperience: 2,
      color: "#10B981",
      order: skills.length + 1,
    });
  };

  const handleEdit = (skill: Skill) => {
    setEditingSkill({ ...skill });
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: "Delete Skill?",
      description: "Are you sure you want to remove this skill from your tech stack showcase?",
      confirmText: "Delete Skill",
      variant: "destructive",
    });
    if (!ok) return;
    await deleteSkill(id);
    setSkills((prev) => prev.filter((s) => s.id !== id));
    studioAlert.success("Skill removed successfully.");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSkill?.name) return;
    setSaving(true);
    try {
      const payload: Skill = {
        id: editingSkill.id || `skill_${Date.now()}`,
        name: editingSkill.name,
        category: editingSkill.category || "frontend",
        proficiency: (editingSkill.proficiency as any) || "intermediate",
        percentage: Number(editingSkill.percentage ?? 80),
        yearsOfExperience: Number(editingSkill.yearsOfExperience ?? 1),
        color: editingSkill.color || "#10B981",
        order: Number(editingSkill.order ?? 0),
      };

      await saveSkill(payload);
      setEditingSkill(null);
      await loadData();
      studioAlert.success("Skill saved successfully.");
    } catch (err) {
      console.error("Save error:", err);
      studioAlert.error("Failed to save skill. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const filteredSkills = skills.filter((s) => {
    const matchesCategory = selectedCategory === "all" || s.category.toLowerCase() === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const sortedSkills = [...filteredSkills].sort((a, b) => {
    const orderA = typeof a.order === "number" ? a.order : null;
    const orderB = typeof b.order === "number" ? b.order : null;
    if (orderA !== null && orderB !== null) return orderA - orderB;
    if (orderA !== null) return -1;
    if (orderB !== null) return 1;
    return 0;
  });

  if (loading) return <StudioLoader label="Loading Skills..." sublabel="Fetching technical skills and proficiencies" />;

  return (
    <div className="w-full pb-20">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-card/90 dark:bg-zinc-900/90 backdrop-blur-2xl border-b border-border py-4 px-4 sm:px-8 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <h2 className="text-2xl font-extrabold text-foreground tracking-tight">Skills & Competencies</h2>
          <p className="text-xs text-muted-foreground font-medium mt-0.5">
            Manage technical proficiencies, progress indicators, and categories
          </p>
        </div>
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <StudioViewToggle mode={viewMode} onChange={setViewMode} />
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/25"
          >
            <Plus className="w-4 h-4" /> Add New Skill
          </button>
        </div>
      </div>

      <div className="px-4 sm:px-8 space-y-6">

      {/* Filter and Search Bar */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            {CATEGORIES.map((cat) => {
              const count = cat === "all" ? skills.length : skills.filter((s) => s.category.toLowerCase() === cat).length;
              if (cat !== "all" && count === 0) return null;
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize shrink-0 cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm shadow-primary/25 font-bold"
                      : "bg-card text-foreground/80 hover:text-foreground hover:bg-muted/80 border border-border"
                  }`}
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-background border border-border rounded-xl text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>
      </div>

      <StudioModal
        isOpen={Boolean(editingSkill)}
        onClose={() => setEditingSkill(null)}
        title={editingSkill?.name ? `Edit: ${editingSkill.name}` : "New Technical Skill"}
        subtitle="Configure skill proficiency, category, and visual progress indicators"
        maxWidth="2xl"
        onSubmit={handleSave}
        footer={
          <>
            <button
              type="button"
              onClick={() => setEditingSkill(null)}
              className="px-4 py-2 rounded-xl border border-border bg-muted/50 hover:bg-muted text-foreground text-xs font-semibold transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold transition-all shadow-md shadow-primary/25 cursor-pointer hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Skill"}
            </button>
          </>
        }
      >
        {editingSkill && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground/90">Skill Name *</label>
              <input
                type="text"
                required
                value={editingSkill.name || ""}
                onChange={(e) => setEditingSkill({ ...editingSkill, name: e.target.value })}
                placeholder="e.g. Next.js, Docker, Python"
                className="w-full bg-background dark:bg-zinc-950/70 border border-border rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary shadow-xs transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground/90">Category *</label>
                <select
                  value={editingSkill.category || "frontend"}
                  onChange={(e) => setEditingSkill({ ...editingSkill, category: e.target.value })}
                  className="w-full bg-background dark:bg-zinc-950/70 border border-border rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary shadow-xs transition-all capitalize"
                >
                  <option value="frontend">Frontend</option>
                  <option value="backend">Backend</option>
                  <option value="ai-ml">AI/ML</option>
                  <option value="database">Database</option>
                  <option value="devops">DevOps</option>
                  <option value="mobile">Mobile</option>
                  <option value="cloud">Cloud</option>
                  <option value="testing">Testing</option>
                  <option value="tools">Tools</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground/90">Proficiency Level</label>
                <select
                  value={editingSkill.proficiency || "advanced"}
                  onChange={(e) => setEditingSkill({ ...editingSkill, proficiency: e.target.value as any })}
                  className="w-full bg-background dark:bg-zinc-950/70 border border-border rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary shadow-xs transition-all capitalize"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-foreground/90">
                  <span>Proficiency Percentage</span>
                  <span className="text-primary font-bold">{editingSkill.percentage || 80}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={editingSkill.percentage || 80}
                  onChange={(e) => setEditingSkill({ ...editingSkill, percentage: Number(e.target.value) })}
                  className="w-full accent-primary cursor-pointer mt-2"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground/90">Brand Accent Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={editingSkill.color || "#10B981"}
                    onChange={(e) => setEditingSkill({ ...editingSkill, color: e.target.value })}
                    className="w-9 h-9 rounded-xl border border-border bg-background cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={editingSkill.color || "#10B981"}
                    onChange={(e) => setEditingSkill({ ...editingSkill, color: e.target.value })}
                    className="flex-1 bg-background dark:bg-zinc-950/70 border border-border rounded-xl px-3.5 py-2 text-xs text-foreground uppercase focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary shadow-xs transition-all font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground/90">Years of Experience</label>
                <input
                  type="number"
                  min={0}
                  value={editingSkill.yearsOfExperience ?? 1}
                  onChange={(e) => setEditingSkill({ ...editingSkill, yearsOfExperience: Number(e.target.value) })}
                  className="w-full bg-background dark:bg-zinc-950/70 border border-border rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary shadow-xs transition-all font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground/90">Display Order</label>
                <input
                  type="number"
                  value={editingSkill.order ?? 0}
                  onChange={(e) => setEditingSkill({ ...editingSkill, order: Number(e.target.value) })}
                  className="w-full bg-background dark:bg-zinc-950/70 border border-border rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary shadow-xs transition-all font-mono"
                />
              </div>
            </div>
          </div>
        )}
      </StudioModal>

      {/* Skills Display: Grid or Table/List */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sortedSkills.length === 0 ? (
            <div className="col-span-full py-12 text-center text-muted-foreground text-sm bg-card/60 rounded-2xl border border-border">
              No skills found for current filter.
            </div>
          ) : (
            sortedSkills.map((s, idx) => (
              <div
                key={s.id}
                className="bg-card/90 dark:bg-zinc-900/80 border border-border/80 dark:border-white/10 backdrop-blur-xl rounded-2xl p-4.5 hover:border-primary/50 hover:shadow-lg transition-all flex flex-col justify-between group shadow-xs relative"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs border border-black/10 dark:border-white/10"
                      style={{ backgroundColor: s.color || "var(--primary)" }}
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono font-bold text-muted-foreground">
                          #{s.order ?? idx + 1}
                        </span>
                        <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                          {s.name}
                        </h4>
                      </div>
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                        {s.category}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-0.5">
                    <button
                      onClick={() => handleEdit(s)}
                      className="p-1 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors cursor-pointer"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(s.id)}
                      className="p-1 text-muted-foreground hover:text-red-500 rounded-md hover:bg-red-500/10 transition-colors cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-border/60">
                  <div className="flex items-center justify-between text-xs">
                    <span className="capitalize text-muted-foreground font-medium text-[11px]">{s.proficiency}</span>
                    <span className="font-mono font-bold text-foreground text-xs">{s.percentage}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${s.percentage}%`,
                        backgroundColor: s.color || "var(--primary)",
                      }}
                    />
                  </div>
                  {s.yearsOfExperience && (
                    <div className="text-[10px] text-muted-foreground text-right pt-0.5 font-mono">
                      {s.yearsOfExperience} yr{s.yearsOfExperience > 1 ? "s" : ""} exp
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* Table / List View */
        <div className="bg-card/90 dark:bg-zinc-900/80 border border-border/80 dark:border-white/10 backdrop-blur-xl rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-foreground">
              <thead className="bg-muted/50 border-b border-border text-[11px] uppercase tracking-wider text-muted-foreground font-bold">
                <tr>
                  <th className="py-3.5 px-4 w-14 text-center">#</th>
                  <th className="py-3.5 px-4 min-w-[160px]">Skill Name</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Proficiency</th>
                  <th className="py-3.5 px-4 min-w-[180px]">Percentage</th>
                  <th className="py-3.5 px-4 text-center">Experience</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {sortedSkills.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-muted-foreground text-sm">
                      No skills found for current filter.
                    </td>
                  </tr>
                ) : (
                  sortedSkills.map((s, idx) => (
                    <tr key={s.id} className="hover:bg-muted/30 transition-colors group">
                      <td className="py-3.5 px-4 text-center font-mono text-muted-foreground text-[11px] font-bold">
                        #{s.order ?? idx + 1}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-foreground">
                        <div className="flex items-center gap-2.5">
                          <span
                            className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs border border-black/10 dark:border-white/10"
                            style={{ backgroundColor: s.color || "var(--primary)" }}
                          />
                          <span className="group-hover:text-primary transition-colors">{s.name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2.5 py-0.5 rounded-md bg-muted text-muted-foreground text-xs capitalize border border-border font-medium">
                          {s.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 capitalize font-semibold text-primary">
                        {s.proficiency}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-28 bg-muted rounded-full h-2 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-300"
                              style={{
                                width: `${s.percentage}%`,
                                backgroundColor: s.color || "var(--primary)",
                              }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground font-mono font-medium">{s.percentage}%</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono text-muted-foreground">
                        {s.yearsOfExperience ? `${s.yearsOfExperience} yrs` : "-"}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleEdit(s)}
                            className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors cursor-pointer"
                            title="Edit Skill"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(s.id)}
                            className="p-1.5 text-muted-foreground hover:text-red-500 rounded-lg hover:bg-red-500/10 transition-colors cursor-pointer"
                            title="Delete Skill"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
