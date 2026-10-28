"use client";

import React, { useState, useEffect } from "react";
import type { Service, Skill } from "@/types/portfolio";
import { getServices, saveService, deleteService, getSkills } from "@/lib/db-service";
import { StudioImageUploader } from "./StudioImageUploader";
import { StudioLoader } from "./StudioLoader";
import { StudioModal } from "./StudioModal";
import { StudioViewToggle, type StudioViewMode } from "./StudioViewToggle";
import { useStudioConfirm, studioAlert } from "./StudioConfirmContext";
import { Plus, Edit2, Trash2, Tag, Star, Clock, DollarSign, Layers } from "lucide-react";

export function ServicesManager() {
  const { confirm } = useStudioConfirm();
  const [services, setServices] = useState<Service[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<StudioViewMode>("grid");
  const [editingService, setEditingService] = useState<Partial<Service> | null>(null);
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const [srvList, skList] = await Promise.all([getServices(), getSkills()]);
    setServices(srvList);
    setSkills(skList);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = () => {
    setEditingService({
      id: `srv_${Date.now()}`,
      title: "",
      slug: "",
      shortDescription: "",
      features: [],
      pricing: {
        startingPrice: 50,
        priceType: "hourly",
        description: "",
      },
      timeline: "1-2 weeks",
      featured: false,
      order: services.length + 1,
    });
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: "Delete Service?",
      description: "Are you sure you want to remove this service package from your portfolio?",
      confirmText: "Delete Service",
      variant: "destructive",
    });
    if (!ok) return;
    await deleteService(id);
    setServices((prev) => prev.filter((s) => s.id !== id));
    studioAlert.success("Service deleted successfully.");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService?.title) return;
    setSaving(true);
    try {
      const payload: Service = {
        id: editingService.id || `srv_${Date.now()}`,
        title: editingService.title,
        slug: editingService.slug || editingService.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        icon: editingService.icon || "",
        shortDescription: editingService.shortDescription || "",
        fullDescription: editingService.fullDescription || "",
        features: editingService.features || [],
        technologies: editingService.technologies || [],
        deliverables: editingService.deliverables || [],
        pricing: editingService.pricing,
        timeline: editingService.timeline || "",
        featured: Boolean(editingService.featured),
        order: Number(editingService.order ?? 0),
      };

      await saveService(payload);
      setEditingService(null);
      await loadData();
      studioAlert.success("Service saved successfully.");
    } catch (err) {
      console.error(err);
      studioAlert.error("Failed to save service. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <StudioLoader label="Loading Services..." sublabel="Fetching service offerings and packages" />;

  const sortedServices = [...services].sort((a, b) => {
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
          <h2 className="text-2xl font-extrabold text-foreground tracking-tight">Services</h2>
          <p className="text-xs text-muted-foreground font-medium mt-0.5">Services offered, pricing models, key deliverables and timelines</p>
        </div>
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <StudioViewToggle mode={viewMode} onChange={setViewMode} />
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/25"
          >
            <Plus className="w-4 h-4" /> Add Service
          </button>
        </div>
      </div>

      <div className="px-4 sm:px-8 space-y-6">

      <StudioModal
        isOpen={Boolean(editingService)}
        onClose={() => setEditingService(null)}
        title={editingService?.title ? `Edit: ${editingService.title}` : "New Service Offering"}
        subtitle="Manage service capabilities, pricing models, timelines and deliverables"
        maxWidth="2xl"
        onSubmit={handleSave}
        footer={
          <>
            <button
              type="button"
              onClick={() => setEditingService(null)}
              className="px-4 py-2 rounded-xl border border-border bg-muted/50 hover:bg-muted text-foreground text-xs font-semibold transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold transition-all shadow-md shadow-primary/25 cursor-pointer hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Service"}
            </button>
          </>
        }
      >
        {editingService && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground/90">Service Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Full-Stack Web App Engineering"
                value={editingService.title || ""}
                onChange={(e) => setEditingService({ ...editingService, title: e.target.value })}
                className="w-full bg-background dark:bg-zinc-950/70 border border-border rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary shadow-xs transition-all"
              />
            </div>

            {/* Service Icon with Drag and Drop */}
            <StudioImageUploader
              value={editingService.icon}
              folder="services"
              label="Service Icon / Image"
              description="Upload an image/illustration or enter an icon name like 'IconCode' (WebP, PNG, SVG, JPG, etc.)."
              onChange={(url) => setEditingService({ ...editingService, icon: url })}
            />

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground/90">Short Description</label>
              <textarea
                rows={2}
                placeholder="Brief summary of service value proposition..."
                value={editingService.shortDescription || ""}
                onChange={(e) => setEditingService({ ...editingService, shortDescription: e.target.value })}
                className="w-full bg-background dark:bg-zinc-950/70 border border-border rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary shadow-xs transition-all leading-relaxed"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground/90">Deliverables / Features (One per line)</label>
              <textarea
                rows={3}
                placeholder="Responsive design tailored for all devices&#10;Headless CMS integration&#10;SEO optimization & fast Core Web Vitals"
                value={editingService.features?.join("\n") || ""}
                onChange={(e) => setEditingService({
                  ...editingService,
                  features: e.target.value.split("\n").filter(Boolean)
                })}
                className="w-full bg-background dark:bg-zinc-950/70 border border-border rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary shadow-xs transition-all leading-relaxed font-mono"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground/90">Starting Price ($)</label>
                <input
                  type="number"
                  min={0}
                  value={editingService.pricing?.startingPrice || 0}
                  onChange={(e) => setEditingService({
                    ...editingService,
                    pricing: { ...editingService.pricing, startingPrice: Number(e.target.value) }
                  })}
                  className="w-full bg-background dark:bg-zinc-950/70 border border-border rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary shadow-xs transition-all font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground/90">Pricing Model</label>
                <select
                  value={editingService.pricing?.priceType || "hourly"}
                  onChange={(e) => setEditingService({
                    ...editingService,
                    pricing: { ...editingService.pricing, priceType: e.target.value as any }
                  })}
                  className="w-full bg-background dark:bg-zinc-950/70 border border-border rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary shadow-xs transition-all capitalize"
                >
                  <option value="hourly">Hourly</option>
                  <option value="project">Per Project</option>
                  <option value="monthly">Monthly Retainer</option>
                  <option value="custom">Custom Quote</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground/90">Estimated Timeline</label>
                <input
                  type="text"
                  value={editingService.timeline || ""}
                  onChange={(e) => setEditingService({ ...editingService, timeline: e.target.value })}
                  placeholder="e.g. 2-4 weeks"
                  className="w-full bg-background dark:bg-zinc-950/70 border border-border rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary shadow-xs transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground/90">Display Order</label>
                <input
                  type="number"
                  value={editingService.order ?? 0}
                  onChange={(e) => setEditingService({ ...editingService, order: Number(e.target.value) })}
                  className="w-full bg-background dark:bg-zinc-950/70 border border-border rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary shadow-xs transition-all font-mono"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-border">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(editingService.featured)}
                  onChange={(e) => setEditingService({ ...editingService, featured: e.target.checked })}
                  className="rounded bg-background border-border text-primary focus:ring-primary cursor-pointer"
                />
                <span className="text-xs text-foreground font-semibold flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" /> Featured Service
                </span>
              </label>
            </div>
          </div>
        )}
      </StudioModal>

      {/* Views: Grid & List */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sortedServices.map((srv) => (
            <div
              key={srv.id}
              className="bg-card/90 dark:bg-zinc-900/80 border border-border/80 dark:border-white/10 backdrop-blur-xl rounded-2xl p-5 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all flex flex-col justify-between text-card-foreground shadow-xs group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Tag className="w-5 h-5 text-primary" />
                    </div>
                    {typeof srv.order === "number" && (
                      <span className="text-[10px] font-mono font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded border border-border">
                        #{srv.order}
                      </span>
                    )}
                  </div>
                  {srv.featured && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                </div>
                <h4 className="text-base font-bold text-foreground group-hover:text-primary transition-colors font-heading">{srv.title}</h4>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">{srv.shortDescription}</p>

                {srv.pricing?.startingPrice && (
                  <p className="text-sm font-bold text-primary mt-3">
                    ${srv.pricing.startingPrice} <span className="text-xs text-muted-foreground font-normal">/{srv.pricing.priceType}</span>
                  </p>
                )}
                {srv.timeline && (
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-muted-foreground/70" /> {srv.timeline}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-1 pt-3 mt-3 border-t border-border">
                <button
                  onClick={() => setEditingService({ ...srv })}
                  className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors cursor-pointer"
                  title="Edit service"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(srv.id)}
                  className="p-2 text-muted-foreground hover:text-red-500 rounded-lg hover:bg-red-500/10 transition-colors cursor-pointer"
                  title="Delete service"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
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
                  <th className="py-3 px-4">Service</th>
                  <th className="py-3 px-4">Pricing</th>
                  <th className="py-3 px-4">Timeline</th>
                  <th className="py-3 px-4">Features</th>
                  <th className="py-3 px-4 text-center">Featured</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {sortedServices.map((srv, idx) => (
                  <tr key={srv.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 text-center font-mono text-muted-foreground">
                      {typeof srv.order === "number" ? srv.order : idx + 1}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-foreground font-heading">{srv.title}</div>
                      {srv.shortDescription && (
                        <div className="text-muted-foreground text-[11px] truncate max-w-xs">{srv.shortDescription}</div>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-primary whitespace-nowrap">
                      {srv.pricing?.startingPrice ? `$${srv.pricing.startingPrice} /${srv.pricing.priceType}` : "—"}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground whitespace-nowrap">
                      {srv.timeline || "—"}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {srv.features?.length ? `${srv.features.length} items` : "—"}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {srv.featured ? (
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 inline" />
                      ) : (
                        <span className="text-muted-foreground/40">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => setEditingService({ ...srv })}
                          className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(srv.id)}
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
