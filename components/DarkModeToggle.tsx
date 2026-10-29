"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ModeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const nextTheme = resolvedTheme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      className="relative w-full h-full rounded-full bg-white/75 dark:bg-black/65 hover:bg-white/90 dark:hover:bg-black/80 backdrop-blur-xl border border-white/80 dark:border-white/20 shadow-[0_4px_16px_rgba(0,0,0,0.1),inset_0_1px_1px_rgba(255,255,255,0.8)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.2)] flex items-center justify-center text-zinc-900 dark:text-zinc-50 hover:text-primary transition-all duration-300 cursor-pointer active:scale-95 group/mode"
      aria-label="Toggle theme"
      title={
        mounted
          ? `Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`
          : "Toggle theme"
      }
    >
      <Sun className="h-5 w-5 scale-100 rotate-0 transition-transform duration-500 ease-out dark:scale-0 dark:-rotate-90 stroke-[2.2] group-hover/mode:rotate-45" />
      <Moon className="absolute h-5 w-5 scale-0 rotate-90 transition-transform duration-500 ease-out dark:scale-100 dark:rotate-0 stroke-[2.2] group-hover/mode:-rotate-12" />
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}
