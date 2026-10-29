"use client";

import React from "react";
import {
  IconHome,
  IconUser,
  IconBriefcase,
  IconCode,
  IconSparkles,
  IconTools,
  IconSchool,
  IconCertificate,
  IconTrophy,
  IconArticle,
  IconNews,
  IconMessageDots,
  IconMessageCircle,
  IconMessage2,
  IconMail,
  IconMenu2,
  IconX,
  IconRocket,
  IconBook,
  IconFileText,
  IconBrandGithub,
  IconBrandLinkedin,
  IconBrandTwitter,
  IconBrandX,
  IconBrandInstagram,
  IconBrandFacebook,
  IconBrandYoutube,
  IconBrandDiscord,
  IconBrandMedium,
  IconBrandTelegram,
  IconBrandWhatsapp,
  IconWorld,
  IconGlobe,
  IconLayersLinked as IconLayers,
  IconCpu,
  IconDeviceDesktop,
  IconPalette,
  IconServer,
  IconDatabase,
  IconCloud,
  IconQuestionMark,
  IconPhone,
  IconMapPin,
  IconCalendar,
  IconClock,
  IconExternalLink,
  IconFolder,
  IconTerminal2 as IconTerminal,
  IconBulb,
  IconFlame,
  IconStar,
  IconHeart,
  IconAward,
  IconQuote,
  IconSend,
  IconSettings,
  IconSearch,
  IconBrain,
  IconArrowLeft,
  IconShare,
  type TablerIcon,
} from "@tabler/icons-react";

// Explicit curated icon registry: avoids bundling all 5,000+ Tabler icons (saves ~2.8MB JS)
const ICON_MAP: Record<string, TablerIcon> = {
  IconHome,
  IconUser,
  IconBriefcase,
  IconCode,
  IconSparkles,
  IconTools,
  IconSchool,
  IconCertificate,
  IconTrophy,
  IconArticle,
  IconNews,
  IconMessageDots,
  IconMessageCircle,
  IconMessage2,
  IconMail,
  IconMenu2,
  IconX,
  IconRocket,
  IconBook,
  IconFileText,
  IconBrandGithub,
  IconBrandLinkedin,
  IconBrandTwitter,
  IconBrandX,
  IconBrandInstagram,
  IconBrandFacebook,
  IconBrandYoutube,
  IconBrandDiscord,
  IconBrandMedium,
  IconBrandTelegram,
  IconBrandWhatsapp,
  IconWorld,
  IconGlobe,
  IconLayers,
  IconCpu,
  IconDeviceDesktop,
  IconPalette,
  IconServer,
  IconDatabase,
  IconCloud,
  IconQuestionMark,
  IconPhone,
  IconMapPin,
  IconCalendar,
  IconClock,
  IconExternalLink,
  IconFolder,
  IconTerminal,
  IconBulb,
  IconFlame,
  IconStar,
  IconHeart,
  IconAward,
  IconQuote,
  IconSend,
  IconSettings,
  IconSearch,
  IconBrain,
  IconArrowLeft,
  IconShare,
};

// Aliases for common user inputs or slugs
const ALIASES: Record<string, TablerIcon> = {
  bulb: IconBulb,
  lightbulb: IconBulb,
  idea: IconBulb,
  skills: IconBulb,
  skill: IconBulb,
  news: IconNews,
  newspaper: IconNews,
  blog: IconNews,
  blogs: IconNews,
  post: IconNews,
  posts: IconNews,
  article: IconNews,
  articles: IconNews,
  messagecircle: IconMessageCircle,
  "message-circle": IconMessageCircle,
  testimonials: IconMessageCircle,
  testimonial: IconMessageCircle,
  reviews: IconMessageCircle,
  review: IconMessageCircle,
  feedback: IconMessageCircle,
  x: IconBrandX,
  brandx: IconBrandX,
  "brand-x": IconBrandX,
  twitter: IconBrandTwitter,
  brandtwitter: IconBrandTwitter,
  github: IconBrandGithub,
  git: IconBrandGithub,
  linkedin: IconBrandLinkedin,
  instagram: IconBrandInstagram,
  facebook: IconBrandFacebook,
  youtube: IconBrandYoutube,
  discord: IconBrandDiscord,
  education: IconSchool,
  school: IconSchool,
  degree: IconSchool,
  cert: IconCertificate,
  certs: IconCertificate,
  certificate: IconCertificate,
  certifications: IconCertificate,
  award: IconTrophy,
  awards: IconTrophy,
  trophy: IconTrophy,
  achievements: IconTrophy,
  achievement: IconTrophy,
  services: IconTools,
  service: IconTools,
  tools: IconTools,
  experience: IconBriefcase,
  work: IconBriefcase,
  briefcase: IconBriefcase,
  projects: IconCode,
  project: IconCode,
  code: IconCode,
  about: IconUser,
  user: IconUser,
  profile: IconUser,
  contact: IconMail,
  mail: IconMail,
  email: IconMail,
  home: IconHome,
  start: IconHome,
};

// Build lowercase map for case-insensitive matching
const LOWERCASE_MAP: Record<string, TablerIcon> = {};
for (const [key, icon] of Object.entries(ICON_MAP)) {
  LOWERCASE_MAP[key.toLowerCase()] = icon;
}

interface DynamicIconProps {
  iconName?: string | null;
  fallbackTitle?: string | null;
  className?: string;
  showQuestionFallback?: boolean;
}

export function DynamicIcon({
  iconName,
  fallbackTitle,
  className = "h-full w-full text-current",
  showQuestionFallback = false,
}: DynamicIconProps) {
  let resolvedIcon: TablerIcon | undefined;

  const rawName = (iconName || "").trim();

  if (rawName) {
    // 1. Direct key match
    if (ICON_MAP[rawName]) {
      resolvedIcon = ICON_MAP[rawName];
    }

    // 2. Prepend "Icon" if missing (e.g. "Bulb" -> "IconBulb")
    if (!resolvedIcon && !rawName.startsWith("Icon")) {
      const withIcon = `Icon${rawName.charAt(0).toUpperCase()}${rawName.slice(1)}`;
      if (ICON_MAP[withIcon]) {
        resolvedIcon = ICON_MAP[withIcon];
      }
    }

    // 3. Check alias map
    if (!resolvedIcon) {
      const cleanKey = rawName.toLowerCase().replace(/^icon[-_]?/, "");
      if (ALIASES[cleanKey]) {
        resolvedIcon = ALIASES[cleanKey];
      }
    }

    // 4. Case-insensitive lookup against ICON_MAP
    if (!resolvedIcon) {
      const lower = rawName.toLowerCase();
      if (LOWERCASE_MAP[lower]) {
        resolvedIcon = LOWERCASE_MAP[lower];
      } else if (LOWERCASE_MAP[`icon${lower}`]) {
        resolvedIcon = LOWERCASE_MAP[`icon${lower}`];
      }
    }
  }

  // 5. Fallback based on title/label if icon was not found or is QuestionMark
  if (!resolvedIcon && fallbackTitle) {
    const t = fallbackTitle.toLowerCase();
    if (t.includes("skill")) resolvedIcon = IconBulb;
    else if (t.includes("blog") || t.includes("post") || t.includes("article")) resolvedIcon = IconNews;
    else if (t.includes("testim") || t.includes("review") || t.includes("feedback")) resolvedIcon = IconMessageCircle;
    else if (t.includes("twitter") || t.includes("x.com") || t === "x") resolvedIcon = IconBrandX;
    else if (t.includes("git")) resolvedIcon = IconBrandGithub;
    else if (t.includes("link")) resolvedIcon = IconBrandLinkedin;
    else if (t.includes("contact") || t.includes("mail") || t.includes("message")) resolvedIcon = IconMail;
    else if (t.includes("cert")) resolvedIcon = IconCertificate;
    else if (t.includes("educat") || t.includes("school") || t.includes("degree")) resolvedIcon = IconSchool;
    else if (t.includes("achieve") || t.includes("award") || t.includes("trophy")) resolvedIcon = IconTrophy;
    else if (t.includes("project") || t.includes("code") || t.includes("portfolio")) resolvedIcon = IconCode;
    else if (t.includes("exp") || t.includes("work") || t.includes("job")) resolvedIcon = IconBriefcase;
    else if (t.includes("serv") || t.includes("tool")) resolvedIcon = IconTools;
    else if (t.includes("about") || t.includes("me") || t.includes("profile")) resolvedIcon = IconUser;
    else if (t.includes("home")) resolvedIcon = IconHome;
  }

  // 6. Final fallback
  const FinalIcon = resolvedIcon || (showQuestionFallback ? IconQuestionMark : IconSparkles);

  return <FinalIcon className={className} />;
}
