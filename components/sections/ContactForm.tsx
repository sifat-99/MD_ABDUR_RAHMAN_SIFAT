"use client";

import { useActionState, useEffect, useRef } from "react";
import { submitContactForm } from "@/app/actions/submit-contact-form";
import { toast } from "react-hot-toast";

type ContactFormState = {
    success: boolean;
    error?: string;
    message?: string;
    data?: any;
};

const initialState: ContactFormState = {
    success: false,
    message: "",
    error: ""
};

export function ContactForm() {
    const [state, formAction, isPending] = useActionState<ContactFormState, FormData>(submitContactForm, initialState);
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
        <div className="@container/form bg-card border rounded-lg p-4 @md/form:p-6">
            <h3 className="text-xl @md/form:text-2xl font-semibold mb-6">
                Send a Message
            </h3>

            {state.success && (
                <div className="mb-4 p-3 rounded-lg text-sm bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                    {state.message}
                </div>
            )}

            {state.error && (
                <div className="mb-4 p-3 rounded-lg text-sm bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                    {state.error}
                </div>
            )}

            <form ref={formRef} className="space-y-3 @md/form:space-y-4" action={formAction}>
                <div>
                    <label
                        htmlFor="name"
                        className="block text-xs @md/form:text-sm font-medium mb-2"
                    >
                        Name
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        className="w-full px-3 py-1.5 @md/form:px-4 @md/form:py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm @md/form:text-base"
                        placeholder="Your name"
                        required
                        disabled={isPending}
                    />
                </div>

                <div>
                    <label
                        htmlFor="email"
                        className="block text-xs @md/form:text-sm font-medium mb-2"
                    >
                        Email
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        className="w-full px-3 py-1.5 @md/form:px-4 @md/form:py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm @md/form:text-base"
                        placeholder="your.email@example.com"
                        required
                        disabled={isPending}
                    />
                </div>

                <div>
                    <label
                        htmlFor="subject"
                        className="block text-xs @md/form:text-sm font-medium mb-2"
                    >
                        Subject
                    </label>
                    <input
                        type="text"
                        id="subject"
                        name="subject"
                        className="w-full px-3 py-1.5 @md/form:px-4 @md/form:py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm @md/form:text-base"
                        placeholder="What's this about?"
                        required
                        disabled={isPending}
                    />
                </div>

                <div>
                    <label
                        htmlFor="message"
                        className="block text-xs @md/form:text-sm font-medium mb-2"
                    >
                        Message
                    </label>
                    <textarea
                        id="message"
                        name="message"
                        rows={5}
                        className="w-full px-3 py-1.5 @md/form:px-4 @md/form:py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none text-sm @md/form:text-base"
                        placeholder="Tell me about your project..."
                        required
                        disabled={isPending}
                    />
                </div>

                <button
                    type="submit"
                    disabled={isPending}
                    className="w-full px-4 py-2 @md/form:px-6 @md/form:py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium text-sm @md/form:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isPending ? "Sending..." : "Send Message"}
                </button>
            </form>
        </div>
    );
}
