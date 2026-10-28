"use client";

import React, { useState, useEffect } from "react";
import type { ContactSubmission } from "@/types/portfolio";
import { getContacts, updateContactStatus, deleteContact } from "@/lib/db-service";
import { Mail, Trash2, Archive, CheckCircle, Clock, Search, Send, Inbox, ArrowLeft } from "lucide-react";
import { StudioLoader } from "./StudioLoader";
import { useStudioConfirm, studioAlert } from "./StudioConfirmContext";

export function ContactsManager() {
  const { confirm } = useStudioConfirm();
  const [contacts, setContacts] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "new" | "archived">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    const data = await getContacts();
    setContacts(data);
    if (data.length > 0 && !selectedId) {
      setSelectedId(data[0].id);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleStatus = async (id: string, currentStatus: "new" | "archived") => {
    const nextStatus = currentStatus === "new" ? "archived" : "new";
    await updateContactStatus(id, nextStatus);
    setContacts((prev) => prev.map((c) => (c.id === id ? { ...c, status: nextStatus } : c)));
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: "Delete Message?",
      description: "Are you sure you want to permanently delete this contact inquiry message?",
      confirmText: "Delete Message",
      variant: "destructive",
    });
    if (!ok) return;
    await deleteContact(id);
    const remaining = contacts.filter((c) => c.id !== id);
    setContacts(remaining);
    if (selectedId === id) {
      setSelectedId(remaining.length > 0 ? remaining[0].id : null);
    }
    studioAlert.success("Message deleted.");
  };

  const filtered = contacts.filter((c) => {
    const matchesFilter = filter === "all" ? true : c.status === filter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      (c.subject && c.subject.toLowerCase().includes(q)) ||
      c.message.toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  const selectedMessage = contacts.find((c) => c.id === selectedId) || filtered[0] || null;

  if (loading) return <StudioLoader label="Loading Messages..." sublabel="Fetching contact inquiries" />;

  const newCount = contacts.filter((c) => c.status === "new").length;
  const archivedCount = contacts.filter((c) => c.status === "archived").length;

  return (
    <div className="w-full pb-20">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-card/90 dark:bg-zinc-900/90 backdrop-blur-2xl border-b border-border py-4 px-4 sm:px-8 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <h2 className="text-2xl font-extrabold text-foreground tracking-tight">Contact Inbox</h2>
          <p className="text-xs text-muted-foreground font-medium mt-0.5">Manage messages and inquiries sent through your portfolio</p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center bg-muted/70 border border-border p-1 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] ${
              filter === "all"
                ? "bg-card text-foreground shadow-xs font-bold"
                : "text-foreground/70 hover:text-foreground"
            }`}
          >
            All ({contacts.length})
          </button>
          <button
            onClick={() => setFilter("new")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 hover:scale-[1.02] active:scale-[0.98] ${
              filter === "new"
                ? "bg-card text-foreground shadow-xs font-bold"
                : "text-foreground/70 hover:text-foreground"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            New ({newCount})
          </button>
          <button
            onClick={() => setFilter("archived")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] ${
              filter === "archived"
                ? "bg-card text-foreground shadow-xs font-bold"
                : "text-foreground/70 hover:text-foreground"
            }`}
          >
            Archived ({archivedCount})
          </button>
        </div>
      </div>

      <div className="px-4 sm:px-8 space-y-6">
        {/* Master-Detail Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[600px] items-start">
          {/* Left Pane: Message List */}
          <div className="lg:col-span-5 bg-card/80 border border-border/80 backdrop-blur-2xl rounded-2xl flex flex-col overflow-hidden shadow-2xs">
          {/* Search Bar */}
          <div className="p-3 border-b border-border bg-muted/30">
            <div className="relative">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search messages, names, emails..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>

          {/* List items */}
          <div className="divide-y divide-border overflow-y-auto max-h-[640px]">
            {filtered.length === 0 ? (
              <div className="text-center py-16 px-4 text-muted-foreground text-sm flex flex-col items-center">
                <Inbox className="w-10 h-10 stroke-[1.5] text-muted-foreground/50 mb-2" />
                <p>No messages match your criteria.</p>
              </div>
            ) : (
              filtered.map((msg) => {
                const isSelected = selectedMessage?.id === msg.id;
                const isNew = msg.status === "new";

                return (
                  <div
                    key={msg.id}
                    onClick={() => setSelectedId(msg.id)}
                    className={`p-4 cursor-pointer transition-all border-l-4 ${
                      isSelected
                        ? "bg-primary/10 border-l-primary"
                        : "hover:bg-muted/40 border-l-transparent"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2 min-w-0">
                        {isNew && <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />}
                        <span className={`text-sm truncate ${isNew ? "font-bold text-foreground" : "font-medium text-foreground"}`}>
                          {msg.name}
                        </span>
                      </div>
                      <span className="text-[11px] text-muted-foreground shrink-0">
                        {new Date(msg.submittedAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>

                    <p className={`text-xs truncate ${isNew ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                      {msg.subject || "(No subject)"}
                    </p>

                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
                      {msg.message}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Pane: Message Preview & Actions */}
        <div className="lg:col-span-7 bg-card/80 border border-border/80 backdrop-blur-2xl rounded-2xl flex flex-col overflow-hidden shadow-2xs min-h-[600px]">
          {selectedMessage ? (
            <div className="p-6 flex flex-col h-full space-y-6">
              {/* Message Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-border pb-5">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-xl bg-primary/15 border border-primary/25 text-primary flex items-center justify-center font-bold text-lg shrink-0">
                    {selectedMessage.name ? selectedMessage.name[0].toUpperCase() : "M"}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-foreground">{selectedMessage.name}</h3>
                      {selectedMessage.status === "new" ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-semibold">
                          New
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-muted text-muted-foreground border border-border">
                          Archived
                        </span>
                      )}
                    </div>
                    <a
                      href={`mailto:${selectedMessage.email}`}
                      className="text-xs text-primary hover:underline font-medium block mt-0.5"
                    >
                      {selectedMessage.email}
                    </a>
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{new Date(selectedMessage.submittedAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <button
                    onClick={() => handleToggleStatus(selectedMessage.id, selectedMessage.status)}
                    className="px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 text-foreground text-xs font-medium border border-border transition-colors flex items-center gap-1.5"
                    title={selectedMessage.status === "new" ? "Archive" : "Mark as New"}
                  >
                    {selectedMessage.status === "new" ? (
                      <>
                        <Archive className="w-3.5 h-3.5" /> Archive
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-3.5 h-3.5" /> Mark New
                      </>
                    )}
                  </button>

                  <a
                    href={`mailto:${selectedMessage.email}?subject=${encodeURIComponent(
                      `Re: ${selectedMessage.subject || "Your Inquiry"}`
                    )}`}
                    className="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-medium transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" /> Reply
                  </a>

                  <button
                    onClick={() => handleDelete(selectedMessage.id)}
                    className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors border border-border"
                    title="Delete message"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Subject */}
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
                  Subject
                </span>
                <p className="text-base font-bold text-foreground">
                  {selectedMessage.subject || "(No Subject)"}
                </p>
              </div>

              {/* Message Body Card */}
              <div className="flex-1 bg-muted/30 border border-border rounded-xl p-5 text-foreground text-sm whitespace-pre-wrap leading-relaxed overflow-y-auto max-h-[380px]">
                {selectedMessage.message}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-12 text-center text-muted-foreground my-auto">
              <Mail className="w-12 h-12 stroke-[1.5] text-muted-foreground/40 mb-3" />
              <h4 className="text-base font-semibold text-foreground">No Message Selected</h4>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                Select any message from the list on the left to read its full inquiry and reply.
              </p>
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
