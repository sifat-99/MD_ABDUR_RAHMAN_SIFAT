"use client";

import React, { useState, useEffect } from "react";
import type { Project, Skill } from "@/types/portfolio";
import { getProjects, saveProject, deleteProject, getSkills } from "@/lib/db-service";
import { useAppDispatch } from "@/store/hooks";
import { setItemCounts, setStatusMessage } from "@/store/slices/studioSlice";
import { StudioImageUploader } from "./StudioImageUploader";
import { StudioLoader } from "./StudioLoader";
import { StudioModal } from "./StudioModal";
import { StudioViewToggle, type StudioViewMode } from "./StudioViewToggle";
import { useStudioConfirm, studioAlert } from "./StudioConfirmContext";
import { Plus, Edit2, Trash2, ExternalLink, Star, Check } from "lucide-react";

export function ProjectsManager() {
  const { confirm } = useStudioConfirm();
  const dispatch = useAppDispatch();
  const [projects, setProjects] = useState<Project[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProject, setEditingProject] = useState<Partial<Project> | null>(null);
  const [saving, setSaving] = useState(false);
  const [viewMode, setViewMode] = useState<StudioViewMode>("grid");

  const loadData = async () => {
    setLoading(true);
    const [pList, sList] = await Promise.all([getProjects(), getSkills()]);
    setProjects(pList);
    setSkills(sList);
    dispatch(setItemCounts({ projects: pList.length, skills: sList.length }));
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEdit = (proj: Project) => {
    setEditingProject({ ...proj });
  };

  const handleCreate = () => {
    setEditingProject({
      id: `proj_${Date.now()}`,
      title: "",
      slug: "",
      tagline: "",
      category: "web-app",
      technologies: [],
      featured: false,
      order: (projects.length + 1),
    });
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: "Delete Project?",
      description: "Are you sure you want to permanently delete this project from your portfolio showcase?",
      confirmText: "Delete Project",
      variant: "destructive",
    });
    if (!ok) return;
    await deleteProject(id);
    const updated = projects.filter((p) => p.id !== id);
    setProjects(updated);
    dispatch(setItemCounts({ projects: updated.length }));
    studioAlert.success("Project deleted successfully");
    dispatch(setStatusMessage({ text: "Project deleted successfully", type: "info" }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject?.title) return;
    setSaving(true);
    try {
      const payload: Project = {
        id: editingProject.id || `proj_${Date.now()}`,
        title: editingProject.title,
        slug: editingProject.slug || editingProject.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        tagline: editingProject.tagline || "",
        coverImage: editingProject.coverImage || "",
        technologies: editingProject.technologies || [],
        category: editingProject.category || "web-app",
        liveUrl: editingProject.liveUrl || "",
        githubUrl: editingProject.githubUrl || "",
        featured: Boolean(editingProject.featured),
        order: Number(editingProject.order ?? 0),
      };

      await saveProject(payload);
      setEditingProject(null);
      studioAlert.success("Project saved successfully!");
      dispatch(setStatusMessage({ text: "Project saved successfully!", type: "success" }));
      await loadData();
    } catch (err) {
      console.error("Save error:", err);
      studioAlert.error("Failed to save project.");
      dispatch(setStatusMessage({ text: "Failed to save project.", type: "error" }));
    } finally {
      setSaving(false);
    }
  };

  const toggleTechnology = (techName: string) => {
    if (!editingProject) return;
    const current = editingProject.technologies || [];
    const exists = current.includes(techName);
    const updated = exists ? current.filter((t) => t !== techName) : [...current, techName];
    setEditingProject({ ...editingProject, technologies: updated });
  };

  const sortedProjects = [...projects].sort((a, b) => {
    const orderA = typeof a.order === "number" ? a.order : null;
    const orderB = typeof b.order === "number" ? b.order : null;
    if (orderA !== null && orderB !== null) return orderA - orderB;
    if (orderA !== null) return -1;
    if (orderB !== null) return 1;
    return 0;
  });

  if (loading) return <StudioLoader label="Loading Projects..." sublabel="Fetching portfolio projects and case studies" />;

  return (
    <div className="w-full pb-20">
      <div className="sticky top-0 z-30 bg-card/90 dark:bg-zinc-900/90 backdrop-blur-2xl border-b border-border py-4 px-4 sm:px-8 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <h2 className="text-2xl font-extrabold text-foreground tracking-tight">Projects</h2>
          <p className="text-xs text-muted-foreground font-medium mt-0.5">Manage showcase portfolio projects and case studies</p>
        </div>
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <StudioViewToggle mode={viewMode} onChange={setViewMode} />
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/25"
          >
            <Plus className="w-4 h-4" /> Add New Project
          </button>
        </div>
      </div>

      <div className="px-4 sm:px-8 space-y-6">

      <StudioModal
        isOpen={Boolean(editingProject)}
        onClose={() => setEditingProject(null)}
        title={editingProject?.title ? `Edit: ${editingProject.title}` : "New Showcase Project"}
        subtitle="Manage project details, screenshots, live demos and tech stack"
        maxWidth="3xl"
        onSubmit={handleSave}
        footer={
          <>
            <button
              type="button"
              onClick={() => setEditingProject(null)}
              className="px-4 py-2 rounded-xl border border-border bg-muted/50 hover:bg-muted text-foreground text-xs font-semibold transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold transition-all shadow-md shadow-primary/25 cursor-pointer hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Project"}
            </button>
          </>
        }
      >
        {editingProject && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground/90">Project Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. NextGen SaaS Analytics Platform"
                value={editingProject.title || ""}
                onChange={(e) => {
                  const title = e.target.value;
                  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
                  setEditingProject({ ...editingProject, title, slug: editingProject.slug || slug });
                }}
                className="w-full bg-background dark:bg-zinc-950/70 border border-border rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary shadow-xs transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground/90">URL Slug *</label>
                <input
                  type="text"
                  required
                  value={editingProject.slug || ""}
                  onChange={(e) => setEditingProject({ ...editingProject, slug: e.target.value })}
                  className="w-full bg-background dark:bg-zinc-950/70 border border-border rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary shadow-xs transition-all font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground/90">Category *</label>
                <select
                  value={editingProject.category || "web-app"}
                  onChange={(e) => setEditingProject({ ...editingProject, category: e.target.value })}
                  className="w-full bg-background dark:bg-zinc-950/70 border border-border rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary shadow-xs transition-all capitalize"
                >
                  <option value="web-app">Web Application</option>
                  <option value="mobile-app">Mobile App</option>
                  <option value="ai-ml">AI/ML Project</option>
                  <option value="api-backend">API/Backend</option>
                  <option value="devops">DevOps/Infrastructure</option>
                  <option value="open-source">Open Source</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground/90">Tagline / Short Summary</label>
              <textarea
                rows={2}
                placeholder="A high-performance web dashboard featuring real-time telemetry..."
                value={editingProject.tagline || ""}
                onChange={(e) => setEditingProject({ ...editingProject, tagline: e.target.value })}
                className="w-full bg-background dark:bg-zinc-950/70 border border-border rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary shadow-xs transition-all leading-relaxed"
              />
            </div>

            {/* Cover Image with Drag & Drop */}
            <StudioImageUploader
              value={editingProject.coverImage}
              folder="projects"
              label="Cover Image"
              description="Drag & drop project banner (WebP, PNG, JPG, SVG, GIF, AVIF, ICO)."
              onChange={(url) => setEditingProject({ ...editingProject, coverImage: url })}
            />

            {/* Technologies */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground/90">Technologies Used</label>
              <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-2.5 bg-muted/40 dark:bg-zinc-950/50 rounded-xl border border-border">
                {skills.length > 0 ? (
                  skills.map((s) => {
                    const isSelected = editingProject.technologies?.includes(s.name);
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => toggleTechnology(s.name)}
                        className={`text-xs px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer active:scale-95 ${
                          isSelected
                            ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                            : "bg-background dark:bg-zinc-900 text-foreground/80 hover:text-foreground hover:bg-muted border border-border"
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                        {s.name}
                      </button>
                    );
                  })
                ) : (
                  <span className="text-xs text-muted-foreground">Add skills in the Skills tab to select them here.</span>
                )}
              </div>
            </div>

            {/* Links & Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground/90">Live URL</label>
                <input
                  type="url"
                  value={editingProject.liveUrl || ""}
                  onChange={(e) => setEditingProject({ ...editingProject, liveUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-background dark:bg-zinc-950/70 border border-border rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary shadow-xs transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground/90">GitHub Repo URL</label>
                <input
                  type="url"
                  value={editingProject.githubUrl || ""}
                  onChange={(e) => setEditingProject({ ...editingProject, githubUrl: e.target.value })}
                  placeholder="https://github.com/..."
                  className="w-full bg-background dark:bg-zinc-950/70 border border-border rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary shadow-xs transition-all"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(editingProject.featured)}
                  onChange={(e) => setEditingProject({ ...editingProject, featured: e.target.checked })}
                  className="rounded bg-background border-border text-primary focus:ring-primary cursor-pointer"
                />
                <span className="text-xs text-foreground font-semibold flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" /> Featured on Homepage
                </span>
              </label>

              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-muted-foreground">Order:</label>
                <input
                  type="number"
                  value={editingProject.order ?? 0}
                  onChange={(e) => setEditingProject({ ...editingProject, order: Number(e.target.value) })}
                  className="w-20 bg-background dark:bg-zinc-950/70 border border-border rounded-lg px-2.5 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono text-center"
                />
              </div>
            </div>
          </div>
        )}
      </StudioModal>

      {/* Projects Display: Grid or Table/List */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedProjects.map((proj, idx) => (
            <div
              key={proj.id}
              className="bg-card/90 dark:bg-zinc-900/80 border border-border/80 dark:border-white/10 backdrop-blur-xl rounded-2xl overflow-hidden hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all flex flex-col group text-card-foreground shadow-xs relative"
            >
              {/* Order Badge */}
              <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-background/85 text-foreground border border-border/80 backdrop-blur-md shadow-2xs">
                #{proj.order ?? idx + 1}
              </div>

              <div className="aspect-video relative bg-muted overflow-hidden">
                {proj.coverImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={proj.coverImage}
                    alt={proj.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                    No Cover Image
                  </div>
                )}
                {proj.featured && (
                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] bg-yellow-500/20 text-yellow-500 font-semibold border border-yellow-500/30 flex items-center gap-1 backdrop-blur-xs">
                    <Star className="w-3 h-3 fill-yellow-500" /> Featured
                  </span>
                )}
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-primary">
                    {proj.category}
                  </span>
                  <h4 className="text-base font-bold text-foreground mt-1 line-clamp-1">{proj.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">{proj.tagline}</p>
                </div>

                {proj.technologies && proj.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {proj.technologies.slice(0, 3).map((t, i) => (
                      <span key={i} className="text-[10px] bg-muted text-muted-foreground border border-border px-2 py-0.5 rounded-md font-medium">
                        {t}
                      </span>
                    ))}
                    {proj.technologies.length > 3 && (
                      <span className="text-[10px] bg-muted text-muted-foreground border border-border px-1.5 py-0.5 rounded-md font-medium">
                        +{proj.technologies.length - 3}
                      </span>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <div className="flex items-center gap-2">
                    {proj.liveUrl && (
                      <a
                        href={proj.liveUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors cursor-pointer"
                        title="Live Demo"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEdit(proj)}
                      className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors cursor-pointer"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(proj.id)}
                      className="p-2 text-muted-foreground hover:text-red-500 rounded-lg hover:bg-red-500/10 transition-colors cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
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
                  <th className="py-3.5 px-4 min-w-[240px]">Project</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4 min-w-[200px]">Technologies</th>
                  <th className="py-3.5 px-4 text-center">Featured</th>
                  <th className="py-3.5 px-4 text-center">Live Demo</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {sortedProjects.map((proj, idx) => (
                  <tr key={proj.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="py-3.5 px-4 text-center font-mono text-muted-foreground text-[11px] font-bold">
                      #{proj.order ?? idx + 1}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-9 rounded-lg overflow-hidden bg-muted border border-border shrink-0">
                          {proj.coverImage ? (
                            <img src={proj.coverImage} alt={proj.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[9px] text-muted-foreground">
                              None
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-foreground group-hover:text-primary transition-colors truncate">
                            {proj.title}
                          </div>
                          <div className="text-[11px] text-muted-foreground truncate max-w-sm">
                            {proj.tagline || "No summary provided"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary uppercase">
                        {proj.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {proj.technologies?.slice(0, 3).map((t, i) => (
                          <span key={i} className="text-[10px] bg-muted text-muted-foreground border border-border px-2 py-0.5 rounded-md font-medium">
                            {t}
                          </span>
                        ))}
                        {(proj.technologies?.length ?? 0) > 3 && (
                          <span className="text-[10px] bg-muted text-muted-foreground border border-border px-1.5 py-0.5 rounded-md font-mono">
                            +{(proj.technologies?.length ?? 0) - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {proj.featured ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-yellow-500">
                          <Star className="w-3.5 h-3.5 fill-yellow-500" /> Yes
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-[11px]">-</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {proj.liveUrl ? (
                        <a
                          href={proj.liveUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary hover:underline inline-flex items-center gap-1 text-xs font-medium"
                        >
                          <ExternalLink className="w-3.5 h-3.5" /> Visit
                        </a>
                      ) : (
                        <span className="text-muted-foreground text-[11px]">-</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleEdit(proj)}
                          className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(proj.id)}
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
