"use client";

import React, { useState, useEffect } from "react";
import type { Blog } from "@/types/portfolio";
import { getBlogs, saveBlog, deleteBlog } from "@/lib/db-service";
import { StudioImageUploader } from "./StudioImageUploader";
import { StudioLoader } from "./StudioLoader";
import { StudioMarkdownEditor } from "./StudioMarkdownEditor";
import { StudioModal } from "./StudioModal";
import { StudioViewToggle, type StudioViewMode } from "./StudioViewToggle";
import { useStudioConfirm, studioAlert } from "./StudioConfirmContext";
import { Plus, Edit2, Trash2, Calendar, Clock, BookOpen } from "lucide-react";

export function BlogsManager() {
  const { confirm } = useStudioConfirm();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<StudioViewMode>("grid");
  const [editingBlog, setEditingBlog] = useState<Partial<Blog> | null>(null);
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const data = await getBlogs();
    setBlogs(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = () => {
    setEditingBlog({
      id: `blog_${Date.now()}`,
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      category: "web-dev",
      tags: [],
      publishedAt: new Date().toISOString(),
      readTime: 5,
    });
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: "Delete Blog Post?",
      description: "Are you sure you want to delete this blog post? It will be removed from your published articles.",
      confirmText: "Delete Post",
      variant: "destructive",
    });
    if (!ok) return;
    await deleteBlog(id);
    setBlogs((prev) => prev.filter((b) => b.id !== id));
    studioAlert.success("Blog post deleted successfully.");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBlog?.title) return;
    setSaving(true);
    try {
      const payload: Blog = {
        id: editingBlog.id || `blog_${Date.now()}`,
        title: editingBlog.title,
        slug: editingBlog.slug || editingBlog.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        excerpt: editingBlog.excerpt || "",
        content: editingBlog.content || "",
        featuredImage: editingBlog.featuredImage || "",
        category: editingBlog.category || "web-dev",
        tags: editingBlog.tags || [],
        publishedAt: editingBlog.publishedAt || new Date().toISOString(),
        readTime: Number(editingBlog.readTime ?? 5),
      };

      await saveBlog(payload);
      setEditingBlog(null);
      await loadData();
      studioAlert.success("Blog post saved successfully.");
    } catch (err) {
      console.error(err);
      studioAlert.error("Failed to save blog post. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <StudioLoader label="Loading Blogs..." sublabel="Fetching published and draft articles" />;

  const sortedBlogs = [...blogs].sort((a, b) => {
    const orderA = typeof a.order === "number" ? a.order : null;
    const orderB = typeof b.order === "number" ? b.order : null;
    if (orderA !== null && orderB !== null) return orderA - orderB;
    if (orderA !== null) return -1;
    if (orderB !== null) return 1;
    return new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime();
  });

  return (
    <div className="w-full pb-20">
      <div className="sticky top-0 z-30 bg-card/90 dark:bg-zinc-900/90 backdrop-blur-2xl border-b border-border py-4 px-4 sm:px-8 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <h2 className="text-2xl font-extrabold text-foreground tracking-tight">Blog Posts</h2>
          <p className="text-xs text-muted-foreground font-medium mt-0.5">Articles, tutorials, tech insights, and project showcases</p>
        </div>
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <StudioViewToggle mode={viewMode} onChange={setViewMode} />
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/25"
          >
            <Plus className="w-4 h-4" /> Add Blog Post
          </button>
        </div>
      </div>

      <StudioModal
        isOpen={Boolean(editingBlog)}
        onClose={() => setEditingBlog(null)}
        title={editingBlog?.title ? `Edit: ${editingBlog.title}` : "New Blog Article"}
        subtitle="Write rich tutorials, deep dives, tech updates and project showcases"
        maxWidth="5xl"
        onSubmit={handleSave}
        footer={
          <>
            <button
              type="button"
              onClick={() => setEditingBlog(null)}
              className="px-4 py-2 rounded-xl border border-border bg-muted/50 hover:bg-muted text-foreground text-xs font-semibold transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold transition-all shadow-md shadow-primary/25 cursor-pointer hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Blog Post"}
            </button>
          </>
        }
      >
        {editingBlog && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground/90">Article Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Master Micro-frontends with Next.js 16 and Module Federation"
                value={editingBlog.title || ""}
                onChange={(e) => {
                  const title = e.target.value;
                  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
                  setEditingBlog({ ...editingBlog, title, slug: editingBlog.slug || slug });
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
                  value={editingBlog.slug || ""}
                  onChange={(e) => setEditingBlog({ ...editingBlog, slug: e.target.value })}
                  className="w-full bg-background dark:bg-zinc-950/70 border border-border rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary shadow-xs transition-all font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground/90">Category</label>
                <select
                  value={editingBlog.category || "web-dev"}
                  onChange={(e) => setEditingBlog({ ...editingBlog, category: e.target.value })}
                  className="w-full bg-background dark:bg-zinc-950/70 border border-border rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary shadow-xs transition-all capitalize"
                >
                  <option value="tutorial">Tutorial</option>
                  <option value="technical">Technical</option>
                  <option value="ai-ml">AI/ML</option>
                  <option value="web-dev">Web Development</option>
                  <option value="career">Career</option>
                  <option value="showcase">Project Showcase</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground/90">Excerpt / Short Summary</label>
              <textarea
                rows={2}
                placeholder="A compelling brief description shown on blog cards..."
                value={editingBlog.excerpt || ""}
                onChange={(e) => setEditingBlog({ ...editingBlog, excerpt: e.target.value })}
                className="w-full bg-background dark:bg-zinc-950/70 border border-border rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary shadow-xs transition-all leading-relaxed"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground/90">
                Article Content (Rich Markdown, Split View & Raw HTML Execution)
              </label>
              <StudioMarkdownEditor
                value={editingBlog.content || ""}
                onChange={(content) => setEditingBlog({ ...editingBlog, content })}
                minHeight="380px"
              />
            </div>

            {/* Featured Image with Drag & Drop */}
            <StudioImageUploader
              value={editingBlog.featuredImage}
              folder="blogs"
              label="Featured Cover Image"
              description="Drag & drop banner (WebP, PNG, JPG, SVG, GIF, AVIF, ICO)."
              onChange={(url) => setEditingBlog({ ...editingBlog, featuredImage: url })}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground/90">Tags (comma-separated)</label>
                <input
                  type="text"
                  placeholder="react, nextjs, typescript, ai"
                  value={editingBlog.tags?.join(", ") || ""}
                  onChange={(e) => setEditingBlog({
                    ...editingBlog,
                    tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean)
                  })}
                  className="w-full bg-background dark:bg-zinc-950/70 border border-border rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary shadow-xs transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground/90">Read Time (minutes)</label>
                <input
                  type="number"
                  min={1}
                  value={editingBlog.readTime ?? 5}
                  onChange={(e) => setEditingBlog({ ...editingBlog, readTime: Number(e.target.value) })}
                  className="w-full bg-background dark:bg-zinc-950/70 border border-border rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary shadow-xs transition-all font-mono"
                />
              </div>
            </div>
          </div>
        )}
      </StudioModal>

      {/* Views: Grid & List */}
      <div className="px-4 sm:px-8">
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {sortedBlogs.map((b) => (
              <div
                key={b.id}
                className="bg-card/90 dark:bg-zinc-900/80 border border-border/80 dark:border-white/10 backdrop-blur-xl rounded-2xl overflow-hidden hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all flex flex-col justify-between text-card-foreground shadow-xs group"
              >
                {b.featuredImage && (
                  <div className="aspect-video bg-muted overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={b.featuredImage} alt={b.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                )}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-primary">{b.category}</span>
                    <h4 className="text-base font-bold text-foreground mt-1 line-clamp-2 font-heading group-hover:text-primary transition-colors">{b.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">{b.excerpt}</p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-border text-xs text-muted-foreground">
                    <span className="font-medium">{b.readTime || 5} min read</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditingBlog({ ...b })}
                        className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors cursor-pointer"
                        title="Edit article"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(b.id)}
                        className="p-2 text-muted-foreground hover:text-red-500 rounded-lg hover:bg-red-500/10 transition-colors cursor-pointer"
                        title="Delete article"
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
          <div className="bg-card/90 dark:bg-zinc-900/80 border border-border/80 dark:border-white/10 rounded-2xl overflow-hidden shadow-xs backdrop-blur-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/60 dark:bg-zinc-950/60 border-b border-border text-muted-foreground font-heading uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4 w-12 text-center">#</th>
                    <th className="py-3 px-4">Article</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Read Time</th>
                    <th className="py-3 px-4">Tags</th>
                    <th className="py-3 px-4">Published</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {sortedBlogs.map((b, idx) => (
                    <tr key={b.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 text-center font-mono text-muted-foreground">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {b.featuredImage && (
                            <div className="w-12 h-9 rounded-lg border border-border overflow-hidden bg-muted shrink-0">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={b.featuredImage} alt={b.title} className="w-full h-full object-cover" />
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-foreground font-heading">{b.title}</div>
                            {b.excerpt && <div className="text-muted-foreground text-[11px] truncate max-w-sm">{b.excerpt}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                          {b.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-muted-foreground whitespace-nowrap">
                        {b.readTime || 5} min
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {b.tags?.slice(0, 3).map((tag, tIdx) => (
                            <span key={tIdx} className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground border border-border/60">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-muted-foreground whitespace-nowrap text-[11px]">
                        {b.publishedAt ? new Date(b.publishedAt).toLocaleDateString() : "—"}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => setEditingBlog({ ...b })}
                            className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(b.id)}
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
