"use client";

import React, { useState, useEffect } from "react";
import type { NavigationItem } from "@/types/portfolio";
import { getNavigation, saveNavigationItem, deleteNavigationItem } from "@/lib/db-service";
import { Plus, Edit2, Trash2, ExternalLink } from "lucide-react";
import { DynamicIcon } from "@/components/DynamicIcon";
import { StudioLoader } from "./StudioLoader";
import { StudioModal } from "./StudioModal";
import { StudioViewToggle, type StudioViewMode } from "./StudioViewToggle";
import { useStudioConfirm, studioAlert } from "./StudioConfirmContext";

export function NavigationManager() {
  const { confirm } = useStudioConfirm();
  const [navItems, setNavItems] = useState<NavigationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<StudioViewMode>("list");
  const [editingItem, setEditingItem] = useState<Partial<NavigationItem> | null>(null);
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const data = await getNavigation();
    setNavItems(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = () => {
    setEditingItem({
      id: `nav_${Date.now()}`,
      title: "",
      href: "#",
      icon: "IconHome",
      isExternal: false,
      order: navItems.length + 1,
    });
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: "Delete Navigation Link?",
      description: "Are you sure you want to remove this link from the dock navigation bar?",
      confirmText: "Delete Link",
      variant: "destructive",
    });
    if (!ok) return;
    await deleteNavigationItem(id);
    setNavItems((prev) => prev.filter((n) => n.id !== id));
    studioAlert.success("Navigation item deleted.");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem?.title || !editingItem?.href) return;
    setSaving(true);
    try {
      const payload: NavigationItem = {
        id: editingItem.id || `nav_${Date.now()}`,
        title: editingItem.title,
        href: editingItem.href,
        icon: editingItem.icon || "IconHome",
        isExternal: Boolean(editingItem.isExternal),
        order: Number(editingItem.order ?? 0),
      };

      await saveNavigationItem(payload);
      setEditingItem(null);
      await loadData();
      studioAlert.success("Navigation item saved.");
    } catch (err) {
      console.error(err);
      studioAlert.error("Failed to save navigation item.");
    } finally {
      setSaving(false);
    }
  };

  const commonIcons = [
    "IconHome",
    "IconUser",
    "IconBriefcase",
    "IconCode",
    "IconBulb",
    "IconTools",
    "IconSchool",
    "IconCertificate",
    "IconTrophy",
    "IconNews",
    "IconMessageCircle",
    "IconMail",
    "IconBrandGithub",
    "IconBrandLinkedin",
    "IconBrandX",
    "IconRocket",
    "IconBook",
    "IconSparkles",
  ];

  if (loading) return <StudioLoader label="Loading Navigation..." sublabel="Fetching dock links and actions" />;

  const sortedNavItems = [...navItems].sort((a, b) => {
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
          <h2 className="text-2xl font-bold text-foreground tracking-tight font-heading">Floating Dock Navigation</h2>
          <p className="text-sm text-muted-foreground">Manage the quick floating dock links displayed on your portfolio</p>
        </div>
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <StudioViewToggle mode={viewMode} onChange={setViewMode} />
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/25"
          >
            <Plus className="w-4 h-4" /> Add Link
          </button>
        </div>
      </div>

      <div className="px-4 sm:px-8 space-y-6">

      <StudioModal
        isOpen={Boolean(editingItem)}
        onClose={() => setEditingItem(null)}
        title={editingItem?.title ? `Edit: ${editingItem.title}` : "New Navigation Link"}
        subtitle="Manage floating dock link, anchor destination, and Tabler icon"
        maxWidth="lg"
        onSubmit={handleSave}
        footer={
          <>
            <button
              type="button"
              onClick={() => setEditingItem(null)}
              className="px-4 py-2 rounded-xl border border-border bg-muted/50 hover:bg-muted text-foreground text-xs font-semibold transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold transition-all shadow-md shadow-primary/25 cursor-pointer hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Link"}
            </button>
          </>
        }
      >
        {editingItem && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground/90">Label / Title *</label>
              <input
                type="text"
                required
                value={editingItem.title || ""}
                onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                placeholder="e.g. Projects"
                className="w-full bg-background dark:bg-zinc-950/70 border border-border rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary shadow-xs transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground/90">Link URL / Anchor *</label>
              <input
                type="text"
                required
                value={editingItem.href || ""}
                onChange={(e) => setEditingItem({ ...editingItem, href: e.target.value })}
                placeholder="#projects or https://..."
                className="w-full bg-background dark:bg-zinc-950/70 border border-border rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary shadow-xs transition-all font-mono"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground/90">Tabler Icon Name</label>
              <input
                type="text"
                value={editingItem.icon || "IconHome"}
                onChange={(e) => setEditingItem({ ...editingItem, icon: e.target.value })}
                placeholder="IconHome"
                className="w-full bg-background dark:bg-zinc-950/70 border border-border rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary shadow-xs transition-all font-mono"
              />
              <div className="flex flex-wrap gap-1.5 pt-1">
                {commonIcons.map((ic) => (
                  <button
                    key={ic}
                    type="button"
                    onClick={() => setEditingItem({ ...editingItem, icon: ic })}
                    className={`px-2.5 py-1 rounded-lg text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                      editingItem.icon === ic
                        ? "bg-primary text-primary-foreground font-bold shadow-xs"
                        : "bg-muted/70 text-muted-foreground hover:text-foreground hover:bg-muted border border-border"
                    }`}
                  >
                    <DynamicIcon iconName={ic} className="w-3.5 h-3.5" />
                    <span>{ic.replace("Icon", "")}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <label className="flex items-center gap-2 cursor-pointer font-semibold text-xs text-foreground">
                <input
                  type="checkbox"
                  checked={Boolean(editingItem.isExternal)}
                  onChange={(e) => setEditingItem({ ...editingItem, isExternal: e.target.checked })}
                  className="rounded bg-background border-border text-primary focus:ring-primary"
                />
                <span>Open in New Tab</span>
              </label>

              <div className="flex items-center gap-2 justify-end">
                <label className="text-xs font-semibold text-foreground/90">Order:</label>
                <input
                  type="number"
                  value={editingItem.order ?? 0}
                  onChange={(e) => setEditingItem({ ...editingItem, order: Number(e.target.value) })}
                  className="w-20 bg-background dark:bg-zinc-950/70 border border-border rounded-lg px-2.5 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono text-center"
                />
              </div>
            </div>
          </div>
        )}
      </StudioModal>

      {/* Views: Grid & List */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedNavItems.map((item) => (
            <div
              key={item.id}
              className="bg-card/90 dark:bg-zinc-900/80 border border-border/80 dark:border-white/10 backdrop-blur-xl rounded-2xl p-5 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all text-card-foreground shadow-xs group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <DynamicIcon iconName={item.icon || "IconHome"} className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    {typeof item.order === "number" && (
                      <span className="text-[10px] font-mono font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded border border-border">
                        #{item.order}
                      </span>
                    )}
                    {item.isExternal && (
                      <span className="text-[10px] bg-muted/80 text-muted-foreground px-2 py-0.5 rounded border border-border flex items-center gap-1">
                        <ExternalLink className="w-2.5 h-2.5" /> External
                      </span>
                    )}
                  </div>
                </div>
                <h4 className="text-base font-bold text-foreground font-heading group-hover:text-primary transition-colors">
                  {item.title}
                </h4>
                <p className="text-xs text-muted-foreground font-mono mt-1 truncate">{item.href}</p>
              </div>

              <div className="flex items-center justify-end gap-1 pt-3 mt-4 border-t border-border">
                <button
                  onClick={() => setEditingItem({ ...item })}
                  className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors cursor-pointer"
                  title="Edit link"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-2 text-muted-foreground hover:text-red-500 rounded-lg hover:bg-red-500/10 transition-colors cursor-pointer"
                  title="Delete link"
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
                  <th className="py-3 px-4">Dock Item</th>
                  <th className="py-3 px-4">Destination URL / Anchor</th>
                  <th className="py-3 px-4 text-center">Target</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {sortedNavItems.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 text-center font-mono text-muted-foreground">
                      {typeof item.order === "number" ? item.order : idx + 1}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                          <DynamicIcon iconName={item.icon || "IconHome"} className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-foreground font-heading">{item.title}</div>
                          <div className="text-muted-foreground text-[10px] font-mono">{item.icon || "IconHome"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-muted-foreground">
                      {item.href}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {item.isExternal ? (
                        <span className="text-[10px] bg-muted px-2 py-0.5 rounded border border-border text-muted-foreground inline-flex items-center gap-1">
                          <ExternalLink className="w-2.5 h-2.5" /> New Tab
                        </span>
                      ) : (
                        <span className="text-[10px] text-muted-foreground/60">Same Tab</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => setEditingItem({ ...item })}
                          className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
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
