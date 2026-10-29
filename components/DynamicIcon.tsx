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
  IconMessageDots,
  IconMail,
  IconMenu2,
  IconX,
  IconRocket,
  IconBook,
  IconBrandGithub,
  IconBrandLinkedin,
  IconBrandTwitter,
  IconWorld,
  IconLayersLinked as IconLayers,
  IconCpu,
  IconDeviceDesktop,
  IconPalette,
  IconServer,
  IconDatabase,
  IconQuestionMark,
  IconPhone,
  IconMapPin,
  IconCalendar,
  IconExternalLink,
  IconFolder,
  IconTerminal2 as IconTerminal,
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
  IconMessageDots,
  IconMail,
  IconMenu2,
  IconX,
  IconRocket,
  IconBook,
  IconBrandGithub,
  IconBrandLinkedin,
  IconBrandTwitter,
  IconWorld,
  IconLayers,
  IconCpu,
  IconDeviceDesktop,
  IconPalette,
  IconServer,
  IconDatabase,
  IconPhone,
  IconMapPin,
  IconCalendar,
  IconExternalLink,
  IconFolder,
  IconTerminal,
};

interface DynamicIconProps {
  iconName: string;
  className?: string;
}

export function DynamicIcon({
  iconName,
  className = "h-full w-full text-current",
}: DynamicIconProps) {
  const Icon = ICON_MAP[iconName];

  return Icon ? (
    <Icon className={className} />
  ) : (
    <IconQuestionMark className={className} />
  );
}
