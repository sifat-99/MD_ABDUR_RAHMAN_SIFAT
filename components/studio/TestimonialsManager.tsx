"use client";

import React, { useState, useEffect } from "react";
import type { Testimonial } from "@/types/portfolio";
import { getTestimonials, saveTestimonial, deleteTestimonial } from "@/lib/db-service";
import { StudioImageUploader } from "./StudioImageUploader";
import { StudioLoader } from "./StudioLoader";
import { StudioModal } from "./StudioModal";
import { StudioViewToggle, type StudioViewMode } from "./StudioViewToggle";
import { useStudioConfirm, studioAlert } from "./StudioConfirmContext";
import { Plus, Edit2, Trash2, Star, MessageSquareQuote } from "lucide-react";

export function TestimonialsManager() {
  const { confirm } = useStudioConfirm();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<StudioViewMode>("grid");
  const [editingTest, setEditingTest] = useState<Partial<Testimonial> | null>(null);
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const data = await getTestimonials();
    setTestimonials(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = () => {
    setEditingTest({
      id: `test_${Date.now()}`,
      name: "",
      position: "",
      company: "",
      testimonial: "",
      rating: 5,
      featured: true,
      order: testimonials.length + 1,
    });
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: "Delete Testimonial?",
      description: "Are you sure you want to remove this testimonial from your client reviews?",
      confirmText: "Delete Review",
      variant: "destructive",
    });
    if (!ok) return;
    await deleteTestimonial(id);
    setTestimonials((prev) => prev.filter((t) => t.id !== id));
    studioAlert.success("Testimonial deleted successfully.");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTest?.name || !editingTest?.testimonial) return;
    setSaving(true);
    try {
      const payload: Testimonial = {
        id: editingTest.id || `test_${Date.now()}`,
        name: editingTest.name,
        position: editingTest.position || "",
        company: editingTest.company || "",
        avatar: editingTest.avatar || "",
        testimonial: editingTest.testimonial,
        rating: Number(editingTest.rating ?? 5),
        date: editingTest.date || new Date().toISOString().split("T")[0],
        linkedinUrl: editingTest.linkedinUrl || "",
        companyLogo: editingTest.companyLogo || "",
        featured: Boolean(editingTest.featured),
        order: Number(editingTest.order ?? 0),
      };

      await saveTestimonial(payload);
      setEditingTest(null);
      await loadData();
      studioAlert.success("Testimonial saved successfully.");
    } catch (err) {
      console.error(err);
      studioAlert.error("Failed to save testimonial. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <StudioLoader label="Loading Testimonials..." sublabel="Fetching client reviews and recommendations" />;

  const sortedTestimonials = [...testimonials].sort((a, b) => {
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
          <h2 className="text-2xl font-extrabold text-foreground tracking-tight">Client Testimonials</h2>
          <p className="text-xs text-muted-foreground font-medium mt-0.5">Client reviews, recommendations, ratings and feedback</p>
        </div>
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <StudioViewToggle mode={viewMode} onChange={setViewMode} />
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/25"
          >
            <Plus className="w-4 h-4" /> Add Testimonial
          </button>
        </div>
      </div>

      <div className="px-4 sm:px-8 space-y-6">

      <StudioModal
        isOpen={Boolean(editingTest)}
        onClose={() => setEditingTest(null)}
        title={editingTest?.name ? `Edit: ${editingTest.name}` : "New Client Testimonial"}
        subtitle="Manage client review quote, rating, company and avatar photo"
        maxWidth="2xl"
        onSubmit={handleSave}
        footer={
          <>
            <button
              type="button"
              onClick={() => setEditingTest(null)}
              className="px-4 py-2 rounded-xl border border-border bg-muted/50 hover:bg-muted text-foreground text-xs font-semibold transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold transition-all shadow-md shadow-primary/25 cursor-pointer hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Testimonial"}
            </button>
          </>
        }
      >
        {editingTest && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground/90">Client / Person Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Alex Henderson"
                value={editingTest.name || ""}
                onChange={(e) => setEditingTest({ ...editingTest, name: e.target.value })}
                className="w-full bg-background dark:bg-zinc-950/70 border border-border rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary shadow-xs transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground/90">Position / Title</label>
                <input
                  type="text"
                  value={editingTest.position || ""}
                  onChange={(e) => setEditingTest({ ...editingTest, position: e.target.value })}
                  placeholder="e.g. Head of Engineering, Founder"
                  className="w-full bg-background dark:bg-zinc-950/70 border border-border rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary shadow-xs transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground/90">Company</label>
                <input
                  type="text"
                  value={editingTest.company || ""}
                  onChange={(e) => setEditingTest({ ...editingTest, company: e.target.value })}
                  placeholder="e.g. InnovateX Labs"
                  className="w-full bg-background dark:bg-zinc-950/70 border border-border rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary shadow-xs transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground/90">Testimonial Quote *</label>
              <textarea
                rows={3}
                required
                placeholder="“Working with Sifat was transformative for our product. His attention to detail and full-stack expertise...”"
                value={editingTest.testimonial || ""}
                onChange={(e) => setEditingTest({ ...editingTest, testimonial: e.target.value })}
                className="w-full bg-background dark:bg-zinc-950/70 border border-border rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary shadow-xs transition-all leading-relaxed"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground/90">Rating (1 to 5 Stars)</label>
              <input
                type="number"
                min="1"
                max="5"
                value={editingTest.rating ?? 5}
                onChange={(e) => setEditingTest({ ...editingTest, rating: Number(e.target.value) })}
                className="w-full bg-background dark:bg-zinc-950/70 border border-border rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary shadow-xs transition-all font-mono"
              />
            </div>

            {/* Client Avatar with Drag and Drop */}
            <StudioImageUploader
              value={editingTest.avatar}
              folder="testimonials"
              label="Client Avatar Photo"
              description="Upload client headshot or photo (WebP, PNG, JPG, SVG, GIF, AVIF, ICO)."
              onChange={(url) => setEditingTest({ ...editingTest, avatar: url })}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border">
              <label className="flex items-center gap-2 cursor-pointer font-semibold text-xs text-foreground">
                <input
                  type="checkbox"
                  checked={Boolean(editingTest.featured)}
                  onChange={(e) => setEditingTest({ ...editingTest, featured: e.target.checked })}
                  className="rounded bg-background border-border text-primary focus:ring-primary cursor-pointer"
                />
                <span className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" /> Featured on Homepage
                </span>
              </label>

              <div className="flex items-center gap-2 sm:justify-end">
                <label className="text-xs font-semibold text-foreground/90">Display Order:</label>
                <input
                  type="number"
                  value={editingTest.order ?? 0}
                  onChange={(e) => setEditingTest({ ...editingTest, order: Number(e.target.value) })}
                  className="w-20 bg-background dark:bg-zinc-950/70 border border-border rounded-lg px-2.5 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono text-center"
                />
              </div>
            </div>
          </div>
        )}
      </StudioModal>

      {/* Views: Grid & List */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sortedTestimonials.map((t) => (
            <div
              key={t.id}
              className="bg-card/90 dark:bg-zinc-900/80 border border-border/80 dark:border-white/10 backdrop-blur-xl rounded-2xl p-5 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all flex flex-col justify-between text-card-foreground shadow-xs group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: t.rating || 5 }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    {typeof t.order === "number" && (
                      <span className="text-[10px] font-mono font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded border border-border">
                        #{t.order}
                      </span>
                    )}
                    {t.featured && <span className="text-[10px] uppercase font-bold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">Featured</span>}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground italic leading-relaxed">“{t.testimonial}”</p>
              </div>

              <div className="flex items-center justify-between pt-4 mt-3 border-t border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted border border-border overflow-hidden shrink-0 flex items-center justify-center">
                    {t.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={t.avatar} alt={t.name} className="w-full h-full object-cover" />
                    ) : (
                      <MessageSquareQuote className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-foreground group-hover:text-primary transition-colors font-heading">{t.name}</h5>
                    <p className="text-[11px] text-muted-foreground">{t.position} {t.company ? `at ${t.company}` : ""}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setEditingTest({ ...t })}
                    className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors cursor-pointer"
                    title="Edit review"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(t.id)}
                    className="p-2 text-muted-foreground hover:text-red-500 rounded-lg hover:bg-red-500/10 transition-colors cursor-pointer"
                    title="Delete review"
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
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Position & Company</th>
                  <th className="py-3 px-4">Rating</th>
                  <th className="py-3 px-4">Testimonial Quote</th>
                  <th className="py-3 px-4 text-center">Featured</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {sortedTestimonials.map((t, idx) => (
                  <tr key={t.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 text-center font-mono text-muted-foreground">
                      {typeof t.order === "number" ? t.order : idx + 1}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-muted border border-border overflow-hidden shrink-0 flex items-center justify-center">
                          {t.avatar ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={t.avatar} alt={t.name} className="w-full h-full object-cover" />
                          ) : (
                            <MessageSquareQuote className="w-4 h-4 text-muted-foreground" />
                          )}
                        </div>
                        <span className="font-bold text-foreground font-heading">{t.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {t.position} {t.company ? `(${t.company})` : ""}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: t.rating || 5 }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground italic max-w-sm truncate">
                      “{t.testimonial}”
                    </td>
                    <td className="py-3 px-4 text-center">
                      {t.featured ? (
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 inline" />
                      ) : (
                        <span className="text-muted-foreground/40">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => setEditingTest({ ...t })}
                          className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(t.id)}
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
