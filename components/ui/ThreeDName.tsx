"use client";

import React, { useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";
import { cn } from "@/lib/utils";

interface ThreeDNameProps {
  firstName: string;
  lastName: string;
  className?: string;
}

export function ThreeDName({
  firstName,
  lastName,
  className,
}: ThreeDNameProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Motion values normalized between -0.5 and 0.5
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs for fluid, physics-based 3D rotation
  const springConfig = { stiffness: 280, damping: 22, mass: 0.8 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // 3D Perspective Rotation angles
  const rotateX = useTransform(smoothY, [-0.5, 0.5], [8, -8]);
  const rotateY = useTransform(smoothX, [-0.5, 0.5], [-10, 10]);

  // Subtle 3D translations
  const translateX = useTransform(smoothX, [-0.5, 0.5], [-8, 8]);
  const translateY = useTransform(smoothY, [-0.5, 0.5], [-6, 6]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) return;
    const rect = containerRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    // Normalize coordinates: center is (0, 0), range is [-0.5, 0.5]
    mouseX.set(clientX / width - 0.5);
    mouseY.set(clientY / height - 0.5);
  };

  const handleMouseEnter = () => {
    if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) return;
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "relative inline-block py-2 cursor-pointer select-none perspective-[1000px] group",
        className
      )}
      style={{ perspective: 1000 }}
      aria-label={`${firstName} ${lastName}`}
    >
      {/* Ambient 3D Spotlight / Focus Glow behind the name */}
      <div
        className={cn(
          "absolute -inset-x-6 -inset-y-4 rounded-3xl blur-2xl pointer-events-none -z-10 transition-all duration-700",
          "bg-gradient-to-r from-primary/10 via-primary/20 to-accent/15 dark:from-primary/20 dark:via-primary/30 dark:to-accent/25",
          isHovered ? "opacity-100 scale-105" : "opacity-60 scale-100"
        )}
      />

      <motion.h1
        style={{
          rotateX,
          rotateY,
          translateX,
          translateY,
          transformStyle: "preserve-3d",
        }}
        animate={{
          scale: isHovered ? 1.025 : 1,
          translateZ: isHovered ? 24 : 0,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="text-3xl sm:text-4xl @md/hero:text-5xl @lg/hero:text-6xl font-black tracking-tight flex flex-wrap items-baseline gap-x-3 gap-y-1"
      >
        {/* First Name (Md. Abdur Rahman) with 3D Chiseled Depth */}
        <span
          className="text-3d-neutral inline-block transform-gpu font-black"
          style={{ transform: "translateZ(15px)" }}
        >
          {firstName}
        </span>

        {/* Last Name / Brand Name (Sifat) with Vibrant 3D Gemstone Depth */}
        <span
          className="text-3d-primary inline-block transform-gpu font-black relative"
          style={{ transform: "translateZ(30px)" }}
        >
          {lastName}

          {/* Tiny specular sheen dot on top edge */}
          <span
            className="absolute -top-1 right-1 w-2 h-2 rounded-full bg-white/60 blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
            aria-hidden="true"
          />
        </span>
      </motion.h1>
    </div>
  );
}
