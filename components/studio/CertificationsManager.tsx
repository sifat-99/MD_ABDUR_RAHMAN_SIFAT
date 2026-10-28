"use client";

import React, { useState, useEffect } from "react";
import type { Certification, Skill } from "@/types/portfolio";
import { getCertifications, saveCertification, deleteCertification, getSkills } from "@/lib/db-service";
import { StudioImageUploader } from "./StudioImageUploader";
import { StudioLoader } from "./StudioLoader";
import { StudioModal } from "./StudioModal";
import { StudioViewToggle, type StudioViewMode } from "./StudioViewToggle";
import { useStudioConfirm, studioAlert } from "./StudioConfirmContext";
import { Plus, Edit2, Trash2, Award, ExternalLink, Check } from "lucide-react";

export function CertificationsManager() {
  const { confirm } = useStudioConfirm();
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCert, setEditingCert] = useState<Partial<Certification> | null>(null);
  const [saving, setSaving] = useState(false);
  const [viewMode, setViewMode] = useState<StudioViewMode>("grid");

  const sortedCertifications = [...certifications].sort((a, b) => {
    const orderA = typeof a.order === "number" ? a.order : null;
    const orderB = typeof b.order === "number" ? b.order : null;
    if (orderA !== null && orderB !== null) return orderA - orderB;
    if (orderA !== null) return -1;
    if (orderB !== null) return 1;
    return 0;
  });

  const loadData = async () => {
    setLoading(true);
    const [cList, sList] = await Promise.all([getCertifications(), getSkills()]);
    setCertifications(cList);
    setSkills(sList);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = () => {
    setEditingCert({
      id: `cert_${Date.now()}`,
      name: "",
      issuer: "",
      issueDate: new Date().toISOString().split("T")[0],
      credentialId: "",
      credentialUrl: "",
      skills: [],
      order: certifications.length + 1,
    });
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: "Delete Certification?",
      description: "Are you sure you want to remove this professional certification from your profile?",
      confirmText: "Delete Certification",
      variant: "destructive",
    });
    if (!ok) return;
    await deleteCertification(id);
    setCertifications((prev) => prev.filter((c) => c.id !== id));
    studioAlert.success("Certification removed successfully.");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCert?.name || !editingCert?.issuer) return;
    setSaving(true);
    try {
      const payload: Certification = {
        id: editingCert.id || `cert_${Date.now()}`,
        name: editingCert.name,
        issuer: editingCert.issuer,
        issueDate: editingCert.issueDate || new Date().toISOString().split("T")[0],
        expiryDate: editingCert.expiryDate || "",
        credentialId: editingCert.credentialId || "",
        credentialUrl: editingCert.credentialUrl || "",
        logo: editingCert.logo || "",
        description: editingCert.description || "",
        skills: editingCert.skills || [],
        order: Number(editingCert.order ?? 0),
      };

      await saveCertification(payload);
      setEditingCert(null);
      await loadData();
      studioAlert.success("Certification saved successfully.");
    } catch (err) {
      console.error(err);
      studioAlert.error("Failed to save certification. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const toggleSkill = (skillName: string) => {
    if (!editingCert) return;
    const current = editingCert.skills || [];
    const exists = current.includes(skillName);
    const updated = exists ? current.filter((s) => s !== skillName) : [...current, skillName];
    setEditingCert({ ...editingCert, skills: updated });
  };

  if (loading) return <StudioLoader label="Loading Certifications..." sublabel="Fetching credentials and licenses" />;

  return (
    <div className="w-full pb-20">
      <div className="sticky top-0 z-30 bg-card/90 dark:bg-zinc-900/90 backdrop-blur-2xl border-b border-border py-4 px-4 sm:px-8 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <h2 className="text-2xl font-extrabold text-foreground tracking-tight">Certifications</h2>
          <p className="text-xs text-muted-foreground font-medium mt-0.5">Professional certifications, licenses, and verified credentials</p>
        </div>
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <StudioViewToggle mode={viewMode} onChange={setViewMode} />
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/25"
          >
            <Plus className="w-4 h-4" /> Add Certification
          </button>
        </div>
      </div>

      <div className="px-4 sm:px-8 space-y-6">

      <StudioModal
        isOpen={Boolean(editingCert)}
        onClose={() => setEditingCert(null)}
        title={editingCert?.name ? `Edit: ${editingCert.name}` : "New Professional Certification"}
        subtitle="Manage credential name, issuer, issue date, credential ID and verification URLs"
        maxWidth="2xl"
        onSubmit={handleSave}
        footer={
          <>
            <button
              type="button"
              onClick={() => setEditingCert(null)}
              className="px-4 py-2 rounded-xl border border-border bg-muted/50 hover:bg-muted text-foreground text-xs font-semibold transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold transition-all shadow-md shadow-primary/25 cursor-pointer hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Certification"}
            </button>
          </>
        }
      >
        {editingCert && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground/90">Certification Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. AWS Certified Solutions Architect"
                value={editingCert.name || ""}
                onChange={(e) => setEditingCert({ ...editingCert, name: e.target.value })}
                className="w-full bg-background dark:bg-zinc-950/70 border border-border rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary shadow-xs transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground/90">Issuing Organization *</label>
              <input
                type="text"
                required
                value={editingCert.issuer || ""}
                onChange={(e) => setEditingCert({ ...editingCert, issuer: e.target.value })}
                placeholder="e.g. Amazon Web Services, Google Cloud, Meta"
                className="w-full bg-background dark:bg-zinc-950/70 border border-border rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary shadow-xs transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground/90">Issue Date *</label>
                <input
                  type="date"
                  required
                  value={editingCert.issueDate || ""}
                  onChange={(e) => setEditingCert({ ...editingCert, issueDate: e.target.value })}
                  className="w-full bg-background dark:bg-zinc-950/70 border border-border rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary shadow-xs transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground/90">Expiry Date (Optional)</label>
                <input
                  type="date"
                  value={editingCert.expiryDate || ""}
                  onChange={(e) => setEditingCert({ ...editingCert, expiryDate: e.target.value })}
                  className="w-full bg-background dark:bg-zinc-950/70 border border-border rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary shadow-xs transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground/90">Credential ID</label>
                <input
                  type="text"
                  placeholder="e.g. AWS-PSA-12345"
                  value={editingCert.credentialId || ""}
                  onChange={(e) => setEditingCert({ ...editingCert, credentialId: e.target.value })}
                  className="w-full bg-background dark:bg-zinc-950/70 border border-border rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary shadow-xs transition-all font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground/90">Verification URL</label>
                <input
                  type="url"
                  value={editingCert.credentialUrl || ""}
                  onChange={(e) => setEditingCert({ ...editingCert, credentialUrl: e.target.value })}
                  placeholder="https://credly.com/..."
                  className="w-full bg-background dark:bg-zinc-950/70 border border-border rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary shadow-xs transition-all"
                />
              </div>
            </div>

            {/* Certificate Badge / Logo */}
            <StudioImageUploader
              value={editingCert.logo}
              folder="certifications"
              label="Certificate Badge / Issuer Logo"
              description="Upload verification badge or certificate document image (WebP, PNG, JPG, SVG, GIF, AVIF, ICO)."
              onChange={(url) => setEditingCert({ ...editingCert, logo: url })}
            />

            {/* Skills */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground/90">Related Skills</label>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2.5 bg-muted/40 dark:bg-zinc-950/50 rounded-xl border border-border">
                {skills.map((s) => {
                  const isSelected = editingCert.skills?.includes(s.name);
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => toggleSkill(s.name)}
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
                })}
              </div>
            </div>
          </div>
        )}
      </StudioModal>

      {/* Certifications Display: Grid or Table/List */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sortedCertifications.map((cert, idx) => (
            <div
              key={cert.id}
              className="bg-card/90 dark:bg-zinc-900/80 border border-border/80 dark:border-white/10 backdrop-blur-xl rounded-2xl p-5 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all flex items-start justify-between text-card-foreground shadow-xs group relative"
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 shadow-2xs overflow-hidden">
                  {cert.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={cert.logo} alt={cert.name} className="w-full h-full object-contain p-1" />
                  ) : (
                    <Award className="w-7 h-7 text-amber-500 group-hover:scale-110 transition-transform" />
                  )}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-muted text-muted-foreground border border-border">
                      #{cert.order ?? idx + 1}
                    </span>
                    <h4 className="text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">{cert.name}</h4>
                  </div>
                  <p className="text-sm text-primary font-semibold">{cert.issuer}</p>
                  <p className="text-xs text-muted-foreground font-mono">Issued: {cert.issueDate || "N/A"}</p>
                  {cert.credentialUrl && (
                    <a
                      href={cert.credentialUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1 font-medium cursor-pointer"
                    >
                      Verify Credential <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setEditingCert({ ...cert })}
                  className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors cursor-pointer"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(cert.id)}
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
                  <th className="py-3.5 px-4 min-w-[220px]">Certificate Title</th>
                  <th className="py-3.5 px-4">Issuer</th>
                  <th className="py-3.5 px-4">Issue Date</th>
                  <th className="py-3.5 px-4">Credential Link</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {sortedCertifications.map((cert, idx) => (
                  <tr key={cert.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="py-3.5 px-4 text-center font-mono text-muted-foreground text-[11px] font-bold">
                      #{cert.order ?? idx + 1}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-7 rounded bg-amber-500/10 border border-amber-500/20 overflow-hidden shrink-0 flex items-center justify-center">
                          {cert.logo ? (
                            <img src={cert.logo} alt={cert.name} className="w-full h-full object-contain" />
                          ) : (
                            <Award className="w-3.5 h-3.5 text-amber-500" />
                          )}
                        </div>
                        <div className="font-bold text-foreground group-hover:text-primary transition-colors max-w-sm truncate">
                          {cert.name}
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-primary">
                      {cert.issuer}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-muted-foreground">
                      {cert.issueDate || "N/A"}
                    </td>
                    <td className="py-3.5 px-4">
                      {cert.credentialUrl ? (
                        <a
                          href={cert.credentialUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary hover:underline inline-flex items-center gap-1 text-xs font-medium"
                        >
                          <ExternalLink className="w-3.5 h-3.5" /> Verify
                        </a>
                      ) : (
                        <span className="text-muted-foreground text-[11px]">-</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setEditingCert({ ...cert })}
                          className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(cert.id)}
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
