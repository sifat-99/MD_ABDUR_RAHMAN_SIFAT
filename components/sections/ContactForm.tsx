"use client";

import { useActionState, useEffect, useRef } from "react";
import { submitContactForm } from "@/app/actions/submit-contact-form";
import { toast } from "react-hot-toast";
import { IconSend, IconCheck, IconAlertCircle, IconSparkles } from "@tabler/icons-react";

type ContactFormState = {
  success: boolean;
  error?: string;
  message?: string;
  data?: any;
};

const initialState: ContactFormState = {
  success: false,
  message: "",
  error: "",
};

export function ContactForm() {
  const [state, formAction, isPending] = useActionState<ContactFormState, FormData>(
    submitContactForm,
    initialState
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      toast.success(state.message || "Message sent successfully!");
      formRef.current?.reset();
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <div className="relative group/form">
      {/* Decorative ambient theme glow orbs behind the glass card */}
      <div className="absolute -top-10 -right-10 w-56 h-56 bg-primary/20 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute -bottom-10 -left-10 w-56 h-56 bg-purple-500/15 dark:bg-primary/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Main Frosted Glass Card */}
      <div
        className="relative rounded-3xl p-6 sm:p-8 md:p-10 border border-white/70 dark:border-white/10 bg-white/55 dark:bg-zinc-950/50 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.08),0_0_35px_-5px_color-mix(in_srgb,var(--primary)_15%,transparent),inset_0_1.5px_1px_0_rgba(255,255,255,0.9),inset_0_-1px_1px_0_rgba(0,0,0,0.05)] dark:shadow-[0_24px_60px_rgba(0,0,0,0.7),0_0_40px_-5px_color-mix(in_srgb,var(--primary)_25%,transparent),inset_0_1.5px_1px_0_rgba(255,255,255,0.15)] transition-all duration-300"
        style={{
          WebkitBackdropFilter: "blur(24px) saturate(190%)",
          backdropFilter: "blur(24px) saturate(190%)",
        }}
      >
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-3 tracking-wide">
            <IconSparkles className="w-3.5 h-3.5" />
            <span>Direct Message</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight font-heading">
            Send a Message
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Have an exciting idea or project in mind? Let&apos;s build something great together.
          </p>
        </div>

        {/* Success Alert */}
        {state.success && (
          <div className="mb-6 p-4 rounded-2xl text-xs sm:text-sm bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 backdrop-blur-md flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <IconCheck className="w-5 h-5 shrink-0 stroke-[2.5]" />
            <span>{state.message || "Message sent successfully!"}</span>
          </div>
        )}

        {/* Error Alert */}
        {state.error && (
          <div className="mb-6 p-4 rounded-2xl text-xs sm:text-sm bg-destructive/10 border border-destructive/30 text-destructive dark:text-red-300 backdrop-blur-md flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <IconAlertCircle className="w-5 h-5 shrink-0 stroke-[2.5]" />
            <span>{state.error}</span>
          </div>
        )}

        {/* Form Fields */}
        <form ref={formRef} className="space-y-4 sm:space-y-5" action={formAction}>
          <div>
            <label
              htmlFor="name"
              className="block text-xs sm:text-sm font-semibold text-foreground/90 mb-1.5"
            >
              Name <span className="text-primary">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              className="w-full px-4 py-3 rounded-2xl border border-white/70 dark:border-white/10 bg-white/50 dark:bg-zinc-900/40 backdrop-blur-md text-foreground placeholder:text-muted-foreground/50 text-sm focus:outline-none focus:border-primary/80 focus:ring-4 focus:ring-primary/20 hover:border-white/90 dark:hover:border-white/20 transition-all duration-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.03)] dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] disabled:opacity-50"
              placeholder="e.g. John Doe"
              required
              disabled={isPending}
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-xs sm:text-sm font-semibold text-foreground/90 mb-1.5"
            >
              Email Address <span className="text-primary">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="w-full px-4 py-3 rounded-2xl border border-white/70 dark:border-white/10 bg-white/50 dark:bg-zinc-900/40 backdrop-blur-md text-foreground placeholder:text-muted-foreground/50 text-sm focus:outline-none focus:border-primary/80 focus:ring-4 focus:ring-primary/20 hover:border-white/90 dark:hover:border-white/20 transition-all duration-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.03)] dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] disabled:opacity-50"
              placeholder="e.g. john@example.com"
              required
              disabled={isPending}
            />
          </div>

          <div>
            <label
              htmlFor="subject"
              className="block text-xs sm:text-sm font-semibold text-foreground/90 mb-1.5"
            >
              Subject <span className="text-primary">*</span>
            </label>
            <input
              type="text"
              id="subject"
              name="subject"
              className="w-full px-4 py-3 rounded-2xl border border-white/70 dark:border-white/10 bg-white/50 dark:bg-zinc-900/40 backdrop-blur-md text-foreground placeholder:text-muted-foreground/50 text-sm focus:outline-none focus:border-primary/80 focus:ring-4 focus:ring-primary/20 hover:border-white/90 dark:hover:border-white/20 transition-all duration-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.03)] dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] disabled:opacity-50"
              placeholder="e.g. Web Development Inquiry / Project Collaboration"
              required
              disabled={isPending}
            />
          </div>

          <div>
            <label
              htmlFor="message"
              className="block text-xs sm:text-sm font-semibold text-foreground/90 mb-1.5"
            >
              Message <span className="text-primary">*</span>
            </label>
            <textarea
              id="message"
              name="message"
              rows={4}
              className="w-full px-4 py-3 rounded-2xl border border-white/70 dark:border-white/10 bg-white/50 dark:bg-zinc-900/40 backdrop-blur-md text-foreground placeholder:text-muted-foreground/50 text-sm focus:outline-none focus:border-primary/80 focus:ring-4 focus:ring-primary/20 hover:border-white/90 dark:hover:border-white/20 transition-all duration-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.03)] dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] resize-none disabled:opacity-50"
              placeholder="Tell me about your project, goals, timeline, or whatever you need..."
              required
              disabled={isPending}
            />
          </div>

          {/* Glossy Theme Submit Button */}
          <button
            type="submit"
            disabled={isPending}
            className="group/btn relative w-full py-3.5 px-6 rounded-2xl font-bold text-sm sm:text-base text-primary-foreground bg-primary hover:bg-primary/95 transition-all duration-300 shadow-[0_12px_28px_-6px_color-mix(in_srgb,var(--primary)_50%,transparent),inset_0_1.5px_1px_0_rgba(255,255,255,0.4)] hover:shadow-[0_16px_36px_-6px_color-mix(in_srgb,var(--primary)_70%,transparent),inset_0_1.5px_1px_0_rgba(255,255,255,0.6)] hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2.5 overflow-hidden cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {/* Glossy light sheen shimmer across button on hover */}
            <span className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full duration-1000 bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform pointer-events-none" />

            {isPending ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
                <span>Sending Message...</span>
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <span>Send Message</span>
                <IconSend className="w-4 h-4 transition-transform group-hover/btn:translate-x-1 group-hover/btn:-translate-y-0.5" />
              </span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
