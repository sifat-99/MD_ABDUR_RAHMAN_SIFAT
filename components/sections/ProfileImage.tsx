"use client";

import { useAuth } from "@/context/AuthContext";
import { MessageCircle, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useSidebar } from "../ui/sidebar";

interface ProfileImageProps {
  imageUrl: string;
  firstName: string;
  lastName: string;
}

export function ProfileImage({
  imageUrl,
  firstName,
  lastName,
}: ProfileImageProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imgSrc, setImgSrc] = useState(imageUrl || "/Sifat.png");
  const { toggleSidebar, open } = useSidebar();
  const { user } = useAuth();

  return (
    <button
      type="button"
      onClick={() => toggleSidebar()}
      className="relative aspect-square w-full max-w-[280px] sm:max-w-[340px] md:max-w-[420px] lg:max-w-[480px] xl:max-w-[540px] 2xl:max-w-[600px] max-h-[min(600px,68vh)] mx-auto lg:ml-auto lg:mr-0 rounded-3xl overflow-hidden border-4 border-primary/20 shadow-2xl block group cursor-pointer transition-all duration-300 hover:border-primary/50 hover:shadow-primary/20"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label="Toggle AI Chat Sidebar"
    >
      <Image
        src={imgSrc}
        alt={`${firstName} ${lastName}`}
        fill
        sizes="(max-width: 640px) 280px, (max-width: 768px) 340px, (max-width: 1024px) 480px, 600px"
        className="object-cover transition-transform duration-300 group-hover:scale-105"
        priority
        fetchPriority="high"
        onError={() => setImgSrc("/Sifat.png")}
      />

      {/* Online Badge */}
      <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full">
        <div className="relative">
          <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
          <div className="absolute inset-0 w-2.5 h-2.5 bg-green-500 rounded-full animate-ping" />
        </div>
        <span className="text-xs font-medium text-white">Online</span>
      </div>

      {/* Hover Overlay */}
      <div
        className={`absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center transition-opacity duration-300 ${
          isHovered ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="text-center space-y-3">
          {open ? (
            <X className="w-12 h-12 text-white mx-auto" />
          ) : (
            <MessageCircle className="w-12 h-12 text-white mx-auto" />
          )}

          <div className="text-white text-xl font-semibold">
            {open ? "Close Chat" : "Chat with AI Twin"}
          </div>
          <div className="text-white/80 text-sm">
            {open ? "Click to close chat" : "Click to open chat"}
          </div>
        </div>
      </div>
    </button>
  );
}
