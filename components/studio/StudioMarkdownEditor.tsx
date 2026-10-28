"use client";

import React, { useState, useRef } from "react";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import {
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  ListChecks,
  Quote,
  Code,
  FileCode,
  Link as LinkIcon,
  Image as ImageIcon,
  Table as TableIcon,
  Minus,
  Eye,
  Edit3,
  Columns,
  Maximize2,
  Minimize2,
  Sparkles,
} from "lucide-react";

interface StudioMarkdownEditorProps {
  value: string;
  onChange: (val: string) => void;
  label?: string;
  description?: string;
  placeholder?: string;
  minHeight?: string;
  className?: string;
}

type EditorMode = "write" | "preview" | "split";

export function StudioMarkdownEditor({
  value,
  onChange,
  label = "Markdown & HTML Content",
  description = "Supports standard Markdown and full raw HTML/CSS tags with live rendering.",
  placeholder = "Write your markdown or raw HTML content here...",
  minHeight = "360px",
  className = "",
}: StudioMarkdownEditorProps) {
  const [mode, setMode] = useState<EditorMode>("write");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertText = (before: string, after: string = "", placeholderText: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) {
      onChange(value + before + placeholderText + after);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.substring(start, end) || placeholderText;
    const replacement = before + selected + after;
    const nextValue = value.substring(0, start) + replacement + value.substring(end);

    onChange(nextValue);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + selected.length
      );
    }, 10);
  };

  const templates = [
    {
      name: "3-Column Highlight Cards",
      code: `
<div class="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
  <div class="p-5 rounded-2xl bg-card border border-border">
    <h4 class="text-base font-bold text-primary mb-1">🚀 Fast Performance</h4>
    <p class="text-xs text-muted-foreground">Architected with Server Components, optimized streaming, and sub-second TTFB.</p>
  </div>
  <div class="p-5 rounded-2xl bg-card border border-border">
    <h4 class="text-base font-bold text-primary mb-1">🛡️ Production Ready</h4>
    <p class="text-xs text-muted-foreground">Enterprise-grade security, authenticated endpoints, and automated tests.</p>
  </div>
  <div class="p-5 rounded-2xl bg-card border border-border">
    <h4 class="text-base font-bold text-primary mb-1">🤖 AI-Native</h4>
    <p class="text-xs text-muted-foreground">Integrated LLM agent workflows, vector embeddings, and real-time streaming.</p>
  </div>
</div>
`,
    },
    {
      name: "Gradient Callout Banner",
      code: `
<div class="p-6 rounded-2xl bg-gradient-to-r from-primary/15 via-primary/5 to-transparent border border-primary/30 my-6 shadow-xs">
  <h3 class="text-lg font-bold text-foreground mb-1">💡 Engineering Philosophy</h3>
  <p class="text-xs text-muted-foreground leading-relaxed">
    I believe in writing clean, self-documenting code with accessible UI patterns, predictable state architectures, and robust type safety.
  </p>
</div>
`,
    },
    {
      name: "Badge Tech Stack Pills",
      code: `
<div class="flex flex-wrap gap-2 my-4">
  <span class="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">Next.js 16</span>
  <span class="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">TypeScript 5</span>
  <span class="px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">Tailwind CSS v4</span>
  <span class="px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">Node.js & Express</span>
  <span class="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">MongoDB Atlas</span>
</div>
`,
    },
    {
      name: "Key Milestones Table",
      code: `
| Year | Role / Milestone | Core Achievement |
| :--- | :--- | :--- |
| **2024** | Senior Full-Stack Engineer | Shipped cloud-scale microservices serving 500k+ monthly active requests |
| **2023** | Lead Web Architect | Re-engineered design system reducing bundle size by 42% |
| **2022** | Open Source Contributor | Authored popular React state management and UI utilities |
`,
    },
  ];

  const wordCount = (value || "").trim() ? value.trim().split(/\s+/).length : 0;
  const charCount = (value || "").length;

  return (
    <div
      className={`space-y-2 ${
        isFullscreen
          ? "fixed inset-0 z-50 bg-background p-6 overflow-y-auto flex flex-col"
          : className
      }`}
    >
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <label className="text-xs font-bold text-foreground flex items-center gap-2">
            <span>{label}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20 font-medium">
              HTML & MD Enabled
            </span>
          </label>
          {description && (
            <p className="text-[11px] text-muted-foreground mt-0.5">{description}</p>
          )}
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          <div className="flex items-center bg-muted/80 p-0.5 rounded-xl border border-border">
            <button
              type="button"
              onClick={() => setMode("write")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                mode === "write"
                  ? "bg-card text-foreground shadow-xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Write</span>
            </button>
            <button
              type="button"
              onClick={() => setMode("preview")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                mode === "preview"
                  ? "bg-card text-foreground shadow-xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview</span>
            </button>
            <button
              type="button"
              onClick={() => setMode("split")}
              className={`hidden md:flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                mode === "split"
                  ? "bg-card text-foreground shadow-xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Split View</span>
            </button>
          </div>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 text-muted-foreground hover:text-foreground bg-muted/60 border border-border rounded-xl hover:bg-muted transition-colors cursor-pointer"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Editor"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Editor Box */}
      <div
        className={`rounded-2xl border border-border bg-card/75 backdrop-blur-2xl overflow-hidden shadow-xs flex flex-col ${
          isFullscreen ? "flex-1" : ""
        }`}
      >
        {/* Formatting Toolbar */}
        <div className="p-2 border-b border-border bg-muted/30 flex flex-wrap items-center justify-between gap-2">
          {/* Markdown Buttons */}
          <div className="flex flex-wrap items-center gap-1">
            <button
              type="button"
              onClick={() => insertText("# ", "", "Heading 1")}
              className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer"
              title="Heading 1"
            >
              <Heading1 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertText("## ", "", "Heading 2")}
              className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer"
              title="Heading 2"
            >
              <Heading2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertText("### ", "", "Heading 3")}
              className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer"
              title="Heading 3"
            >
              <Heading3 className="w-4 h-4" />
            </button>

            <span className="w-px h-4 bg-border mx-1" />

            <button
              type="button"
              onClick={() => insertText("**", "**", "bold text")}
              className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer"
              title="Bold (**text**)"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertText("*", "*", "italic text")}
              className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer"
              title="Italic (*text*)"
            >
              <Italic className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertText("~~", "~~", "strikethrough text")}
              className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer"
              title="Strikethrough"
            >
              <Strikethrough className="w-4 h-4" />
            </button>

            <span className="w-px h-4 bg-border mx-1" />

            <button
              type="button"
              onClick={() => insertText("\n- ", "", "List item")}
              className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer"
              title="Bullet List"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertText("\n1. ", "", "Ordered item")}
              className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer"
              title="Numbered List"
            >
              <ListOrdered className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertText("\n- [ ] ", "", "Task checklist")}
              className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer"
              title="Task List"
            >
              <ListChecks className="w-4 h-4" />
            </button>

            <span className="w-px h-4 bg-border mx-1" />

            <button
              type="button"
              onClick={() => insertText("\n> ", "", "Blockquote text")}
              className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer"
              title="Quote"
            >
              <Quote className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertText("`", "`", "code")}
              className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer"
              title="Inline Code"
            >
              <Code className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertText("\n```tsx\n", "\n```\n", "// Code block here")}
              className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer"
              title="Code Block"
            >
              <FileCode className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertText("[", "](https://example.com)", "link title")}
              className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer"
              title="Link"
            >
              <LinkIcon className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertText("![", "](https://images.unsplash.com/...)", "alt text")}
              className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer"
              title="Image"
            >
              <ImageIcon className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() =>
                insertText(
                  "\n| Column 1 | Column 2 |\n| :--- | :--- |\n| Item A | Item B |\n"
                )
              }
              className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer"
              title="Table"
            >
              <TableIcon className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertText("\n\n---\n\n")}
              className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer"
              title="Horizontal Divider"
            >
              <Minus className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Insert Template Snippets */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              Templates:
            </span>
            <select
              onChange={(e) => {
                const selected = templates.find((t) => t.name === e.target.value);
                if (selected) {
                  insertText(selected.code);
                  e.target.value = "";
                }
              }}
              defaultValue=""
              className="text-xs bg-background border border-border rounded-lg px-2.5 py-1 text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary cursor-pointer"
            >
              <option value="" disabled>
                Insert HTML / MD Snippet...
              </option>
              {templates.map((t) => (
                <option key={t.name} value={t.name}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Content Area: Write, Preview, or Split */}
        <div
          className={`grid ${
            mode === "split" ? "grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border" : "grid-cols-1"
          } flex-1 overflow-hidden`}
          style={{ minHeight }}
        >
          {/* Write Pane */}
          {(mode === "write" || mode === "split") && (
            <div className="flex flex-col h-full bg-background/50">
              <textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full h-full p-4 sm:p-5 text-xs sm:text-sm font-mono text-foreground placeholder:text-muted-foreground bg-transparent border-0 focus:outline-hidden resize-y leading-relaxed select-text"
                style={{ minHeight }}
              />
            </div>
          )}

          {/* Live Preview Pane */}
          {(mode === "preview" || mode === "split") && (
            <div
              className="p-5 sm:p-6 overflow-y-auto bg-background/80"
              style={{ minHeight }}
            >
              {value && value.trim() ? (
                <MarkdownRenderer content={value} />
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-xs py-16">
                  <Edit3 className="w-8 h-8 stroke-1 text-muted-foreground/40 mb-2" />
                  <p>Live preview will appear here as you type...</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Statistics */}
        <div className="px-4 py-2 border-t border-border bg-muted/20 flex items-center justify-between text-[11px] text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>
              Words: <strong className="text-foreground font-semibold">{wordCount}</strong>
            </span>
            <span>
              Characters: <strong className="text-foreground font-semibold">{charCount}</strong>
            </span>
          </div>
          <span className="text-[10px] text-primary font-medium">
            Live Preview Synchronized
          </span>
        </div>
      </div>
    </div>
  );
}
