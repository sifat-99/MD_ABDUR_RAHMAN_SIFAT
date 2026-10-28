"use client";

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import { AlertTriangle, Trash2, HelpCircle, CheckCircle2, X } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export interface ConfirmOptions {
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "destructive" | "warning" | "default" | "success";
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | null>(null);

export function StudioConfirmProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions>({ title: "" });
  const resolveRef = useRef<((value: boolean) => void) | null>(null);
  const confirmBtnRef = useRef<HTMLButtonElement | null>(null);

  const confirm = useCallback((opts: ConfirmOptions) => {
    setOptions(opts);
    setIsOpen(true);
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
    });
  }, []);

  const handleConfirm = useCallback(() => {
    setIsOpen(false);
    if (resolveRef.current) {
      resolveRef.current(true);
      resolveRef.current = null;
    }
  }, []);

  const handleCancel = useCallback(() => {
    setIsOpen(false);
    if (resolveRef.current) {
      resolveRef.current(false);
      resolveRef.current = null;
    }
  }, []);

  // Keyboard navigation (Escape to cancel, Enter to confirm)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        handleCancel();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleCancel]);

  const variant = options.variant || "default";

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}

      {/* Sleek Apple-inspired Toaster */}
      <Toaster
        position="top-right"
        toastOptions={{
          className: "!bg-card/90 !text-foreground !backdrop-blur-2xl !border !border-border/80 !shadow-2xl !rounded-2xl !px-4 !py-3 !text-xs !font-medium",
          duration: 3500,
          style: {
            background: "rgba(18, 22, 30, 0.85)",
            backdropFilter: "blur(20px) saturate(180%)",
            WebkitBackdropFilter: "blur(20px) saturate(180%)",
            color: "#ffffff",
            border: "1px solid rgba(255, 255, 255, 0.14)",
            borderRadius: "16px",
            boxShadow: "0 20px 40px -15px rgba(0, 0, 0, 0.4)",
            fontSize: "13px",
            fontWeight: "500",
          },
          success: {
            iconTheme: {
              primary: "#10B981",
              secondary: "#ffffff",
            },
          },
          error: {
            iconTheme: {
              primary: "#EF4444",
              secondary: "#ffffff",
            },
          },
        }}
      />

      {/* Apple Liquid Glass Confirmation Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/65 backdrop-blur-md transition-opacity duration-200 animate-in fade-in"
          onClick={handleCancel}
        >
          <div
            className="relative w-full max-w-md bg-card/95 dark:bg-zinc-900/95 border border-border/90 dark:border-white/15 rounded-3xl p-6 shadow-2xl backdrop-blur-3xl text-foreground scale-100 transition-all duration-200 animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            {/* Top Close Icon */}
            <button
              onClick={handleCancel}
              className="absolute top-4 right-4 p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-start gap-4">
              {/* Variant Icon Badge */}
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border shadow-xs ${
                  variant === "destructive"
                    ? "bg-rose-500/15 border-rose-500/30 text-rose-500 dark:text-rose-400"
                    : variant === "warning"
                    ? "bg-amber-500/15 border-amber-500/30 text-amber-500 dark:text-amber-400"
                    : variant === "success"
                    ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-500 dark:text-emerald-400"
                    : "bg-primary/15 border-primary/30 text-primary"
                }`}
              >
                {variant === "destructive" ? (
                  <Trash2 className="w-6 h-6 stroke-[2.2]" />
                ) : variant === "warning" ? (
                  <AlertTriangle className="w-6 h-6 stroke-[2.2]" />
                ) : variant === "success" ? (
                  <CheckCircle2 className="w-6 h-6 stroke-[2.2]" />
                ) : (
                  <HelpCircle className="w-6 h-6 stroke-[2.2]" />
                )}
              </div>

              {/* Title & Description */}
              <div className="space-y-1.5 pt-0.5 pr-4">
                <h3 className="text-base sm:text-lg font-bold text-foreground tracking-tight leading-snug">
                  {options.title}
                </h3>
                {options.description && (
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {options.description}
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-border/60">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2.5 rounded-xl border border-border/80 bg-muted/40 hover:bg-muted text-foreground text-xs font-semibold cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                {options.cancelText || "Cancel"}
              </button>

              <button
                ref={confirmBtnRef}
                type="button"
                onClick={handleConfirm}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${
                  variant === "destructive"
                    ? "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/30"
                    : variant === "warning"
                    ? "bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/30"
                    : variant === "success"
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30"
                    : "bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/30"
                }`}
              >
                {options.confirmText || (variant === "destructive" ? "Delete" : "Confirm")}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function useStudioConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) {
    return {
      confirm: async (opts: ConfirmOptions) => {
        if (typeof window !== "undefined") {
          return window.confirm(opts.description || opts.title);
        }
        return false;
      },
    };
  }
  return context;
}

export const studioAlert = {
  success: (msg: string) => toast.success(msg),
  error: (msg: string) => toast.error(msg),
  info: (msg: string) => toast(msg),
};
