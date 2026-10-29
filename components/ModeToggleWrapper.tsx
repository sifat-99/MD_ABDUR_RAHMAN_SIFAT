"use client";

import dynamic from "next/dynamic";
import { useSidebar } from "./ui/sidebar";

const ModeToggle = dynamic(
  () => import("./DarkModeToggle").then((mod) => mod.ModeToggle),
  { ssr: false }
);

interface ModeToggleWrapperProps {
  isMaintenance?: boolean;
}

export function ModeToggleWrapper({
  isMaintenance = false,
}: ModeToggleWrapperProps) {
  const { open, isMobile, openMobile } = useSidebar();
  const isSidebarOpen = isMobile ? openMobile : open;

  if (isMaintenance) {
    return (
      <div className="fixed top-4 right-4 z-50 w-10 h-10 md:w-12 md:h-12 pointer-events-auto">
        <ModeToggle />
      </div>
    );
  }

  return (
    <div
      className={`fixed z-50 transition-all duration-300 ease-in-out pointer-events-auto ${
        isSidebarOpen
          ? "md:bottom-6 md:right-[calc(var(--sidebar-width)+1.25rem)] top-4 right-16"
          : "md:bottom-6 md:right-24 top-4 right-16"
      }`}
    >
      <div className="w-10 h-10 md:w-12 md:h-12">
        <ModeToggle />
      </div>
    </div>
  );
}
