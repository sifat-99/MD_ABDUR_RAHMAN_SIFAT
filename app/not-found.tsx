
"use client";

import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Home } from "lucide-react";
import { BackgroundRippleEffect } from "@/components/ui/background-ripple-effect";
import { motion } from "motion/react";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export default function NotFound({ }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased font-serif portfolio-root-body w-full min-h-screen animate-gradient bg-[length:400%_400%] flex items-center justify-center relative overflow-hidden`}
                style={{ backgroundImage: "var(--portfolio-body-bg)" }}
            >
                {/* Background Ripple Effect */}
                <div className="absolute inset-0 z-0">
                    <BackgroundRippleEffect rows={15} cols={35} cellSize={56} />
                </div>

                <div className="relative z-10 flex flex-col items-center justify-center text-center space-y-8 p-4">
                    <motion.h1
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="text-[150px] font-bold leading-none tracking-tighter text-foreground/20 select-none font-mono"
                    >
                        404
                    </motion.h1>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                        className="space-y-4 relative -top-10"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground font-sans">
                            Page not found
                        </h2>
                        <p className="text-muted-foreground max-w-[600px] text-lg font-sans">
                            Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have been moved, deleted, or never existed.
                        </p>
                    </motion.div>

                    <Link href="/">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-8 py-2 gap-2 shadow-lg hover:bg-primary/70"
                        >
                            <Home className="w-4 h-4 cursor-pointer " />
                            Go Home
                        </motion.div>
                    </Link>
                </div>
            </body>
        </html>
    );
}
