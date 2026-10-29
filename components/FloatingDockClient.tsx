"use client";

import { IconMenu2, IconX } from "@tabler/icons-react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useEffect, useState } from "react";
import { DynamicIcon } from "./DynamicIcon";
import { useSidebar } from "./ui/sidebar";

interface NavItem {
  title?: string | null;
  href?: string | null;
  icon?: string | null;
  isExternal?: boolean | null;
}

interface FloatingDockClientProps {
  navItems: NavItem[];
}

interface DockLink {
  title: string;
  href?: string;
  icon: React.ReactNode;
  isExternal?: boolean | null;
  onClick?: () => void;
}

const MAX_VISIBLE_ITEMS_DESKTOP = 6;
const MAX_VISIBLE_ITEMS_MOBILE = 8;

const getVisibleLinks = (links: DockLink[], maxItems: number) => {
  const shouldShowMore = links.length > maxItems;
  return {
    shouldShowMore,
    visible: shouldShowMore ? links.slice(0, maxItems) : links,
    hidden: shouldShowMore ? links.slice(maxItems) : [],
  };
};

export function FloatingDockClient({ navItems }: FloatingDockClientProps) {
  const { open, isMobile, openMobile } = useSidebar();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [desktopMoreMenuOpen, setDesktopMoreMenuOpen] = useState(false);
  const [mobileMoreMenuOpen, setMobileMoreMenuOpen] = useState(false);
  const [activeHash, setActiveHash] = useState<string>("#home");

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (window.location.hash) {
      setActiveHash(window.location.hash);
    }

    const updateFromHash = () => {
      if (window.location.hash) {
        setActiveHash(window.location.hash);
      }
    };
    window.addEventListener("hashchange", updateFromHash);

    const sectionIds = [
      "home",
      "about",
      "experience",
      "projects",
      "skills",
      "services",
      "education",
      "certifications",
      "achievements",
      "blog",
      "testimonials",
      "contact",
    ];

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);
        if (visible && visible.target.id) {
          setActiveHash(`#${visible.target.id}`);
        }
      },
      {
        rootMargin: "-25% 0px -65% 0px",
      }
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => {
      window.removeEventListener("hashchange", updateFromHash);
      observer.disconnect();
    };
  }, []);

  const isSidebarOpen = isMobile ? openMobile : open;

  const isItemActive = (href?: string) => {
    if (!href) return false;
    if (href === activeHash) return true;
    if (
      (href === "#home" || href === "#" || href === "/") &&
      (activeHash === "#home" || activeHash === "#" || activeHash === "")
    ) {
      return true;
    }
    return false;
  };

  const links: DockLink[] = [
    ...navItems.map((item) => ({
      title: item.title || "",
      href: item.href || "#",
      icon: (
        <DynamicIcon
          iconName={item.icon || "IconHome"}
          fallbackTitle={item.title || ""}
          className="w-full h-full text-current"
        />
      ),
      isExternal: item.isExternal,
    })),
  ];

  const desktop = getVisibleLinks(links, MAX_VISIBLE_ITEMS_DESKTOP);
  const mobile = getVisibleLinks(links, MAX_VISIBLE_ITEMS_MOBILE);

  return (
    <>
      {/* Desktop: Horizontal dock - bottom left on md, bottom center on lg+ */}
      <div
        className={`hidden md:block fixed z-30 transition-all duration-300 pointer-events-none group/dock ${
          isSidebarOpen
            ? "bottom-0 left-[calc(50%-var(--sidebar-width)/2)] -translate-x-1/2 pb-3"
            : "bottom-4 md:left-4 md:translate-x-0 lg:left-1/2 lg:-translate-x-1/2"
        }`}
      >
        <div
          className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl md:rounded-3xl bg-white/45 dark:bg-black/50 hover:bg-white/55 dark:hover:bg-black/60 border border-white/60 dark:border-white/20 hover:border-white/80 dark:hover:border-white/30 shadow-[0_16px_40px_rgba(0,0,0,0.16),0_4px_16px_rgba(0,0,0,0.06),inset_0_1.5px_1px_0_rgba(255,255,255,0.9),inset_0_-1px_1px_0_rgba(0,0,0,0.05)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.65),0_4px_16px_rgba(0,0,0,0.4),inset_0_1.5px_1px_0_rgba(255,255,255,0.25)] pointer-events-auto transition-all duration-300"
          style={{
            backdropFilter: "blur(32px) saturate(210%) brightness(103%)",
            WebkitBackdropFilter: "blur(32px) saturate(210%) brightness(103%)",
          }}
        >
          {desktop.visible.map((item) => (
            <DockIcon
              key={`${item.title}-${item.href}`}
              item={item}
              isVertical={false}
              isActive={isItemActive(item.href)}
            />
          ))}

          {/* Desktop More Menu Button */}
          {desktop.shouldShowMore && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setDesktopMoreMenuOpen(!desktopMoreMenuOpen)}
                className="group relative flex items-center justify-center w-12 h-12 md:w-12 md:h-12 cursor-pointer"
                aria-label="Toggle more navigation links"
              >
                <div className="relative flex items-center justify-center w-full h-full rounded-full bg-white/70 dark:bg-white/12 border border-white/85 dark:border-white/20 backdrop-blur-md shadow-[0_2px_8px_rgba(0,0,0,0.06),inset_0_1px_1.5px_rgba(255,255,255,0.95)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.4),inset_0_1px_1.5px_rgba(255,255,255,0.2)] transition-all duration-300 ease-out hover:scale-125 hover:-translate-y-2 md:hover:-translate-y-2.5 hover:!bg-primary hover:!border-primary hover:!shadow-[0_12px_24px_-4px_color-mix(in_srgb,var(--primary)_50%,transparent),inset_0_1px_1px_rgba(255,255,255,0.8)]">
                  <div className="w-5 h-5 md:w-5.5 md:h-5.5 text-zinc-900 dark:text-zinc-50 group-hover:!text-primary-foreground transition-colors duration-200 flex items-center justify-center [filter:drop-shadow(0_1px_0_rgba(255,255,255,0.85))] dark:[filter:drop-shadow(0_1px_2px_rgba(0,0,0,0.8))] group-hover:![filter:none]">
                    {desktopMoreMenuOpen ? (
                      <IconX className="w-5 h-5 md:w-5.5 md:h-5.5 stroke-[2.2]" />
                    ) : (
                      <IconMenu2 className="w-5 h-5 md:w-5.5 md:h-5.5 stroke-[2.2]" />
                    )}
                  </div>
                </div>
                {/* Tooltip */}
                <div className="absolute -top-10 md:-top-12 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-xl bg-zinc-900/95 dark:bg-zinc-100/95 backdrop-blur-xl border border-zinc-800 dark:border-zinc-200 text-xs font-bold text-zinc-100 dark:text-zinc-900 whitespace-nowrap opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 group-hover:-translate-y-2 transition-all duration-300 pointer-events-none shadow-xl shadow-black/25 z-50">
                  More
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-zinc-900/95 dark:bg-zinc-100/95 border-r border-b border-zinc-800 dark:border-zinc-200" />
                </div>
              </button>

              {/* Desktop More Menu - Expands Upward */}
              {desktopMoreMenuOpen && (
                <div
                  className="absolute bottom-16 left-1/2 -translate-x-1/2 z-[100] flex flex-col-reverse gap-2 p-3 rounded-2xl bg-white/75 dark:bg-black/75 border border-white/60 dark:border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.25),inset_0_1px_1px_rgba(255,255,255,0.8)] dark:shadow-[0_24px_60px_rgba(0,0,0,0.7),inset_0_1px_1px_rgba(255,255,255,0.2)] animate-in slide-in-from-bottom-2 duration-200"
                  style={{
                    backdropFilter: "blur(32px) saturate(210%)",
                    WebkitBackdropFilter: "blur(32px) saturate(210%)",
                  }}
                >
                  {desktop.hidden.map((item) => (
                    <DockIcon
                      key={`${item.title}-${item.href}-more`}
                      item={item}
                      isVertical={true}
                      isActive={isItemActive(item.href)}
                      onItemClick={() => setDesktopMoreMenuOpen(false)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Theme Toggle Button inside Dock */}
          <div className="w-px h-6 bg-zinc-300 dark:bg-zinc-700/60 my-auto shrink-0" />
          <DockThemeToggle isVertical={false} />
        </div>
      </div>

      {/* Mobile: Hamburger menu button at top right */}
      <div className="md:hidden fixed top-4 right-4 z-30">
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="w-10 h-10 rounded-full bg-white/70 dark:bg-black/60 border border-white/80 dark:border-white/20 shadow-[0_4px_16px_rgba(0,0,0,0.1),inset_0_1px_1px_rgba(255,255,255,0.8)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.2)] flex items-center justify-center text-zinc-900 dark:text-zinc-50 hover:text-primary transition-all duration-200 cursor-pointer active:scale-95"
          style={{
            backdropFilter: "blur(24px) saturate(200%)",
            WebkitBackdropFilter: "blur(24px) saturate(200%)",
          }}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? (
            <IconX className="w-5 h-5 stroke-[2.2]" />
          ) : (
            <IconMenu2 className="w-5 h-5 stroke-[2.2]" />
          )}
        </button>

        {/* Mobile Vertical menu */}
        {mobileMenuOpen && (
          <div
            className="absolute top-12 right-0 z-[100] flex flex-col gap-2 p-3 rounded-2xl bg-white/75 dark:bg-black/75 border border-white/60 dark:border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.25),inset_0_1px_1px_rgba(255,255,255,0.8)] dark:shadow-[0_24px_60px_rgba(0,0,0,0.7),inset_0_1px_1px_rgba(255,255,255,0.2)] animate-in slide-in-from-top-2 duration-200"
            style={{
              backdropFilter: "blur(32px) saturate(210%)",
              WebkitBackdropFilter: "blur(32px) saturate(210%)",
            }}
          >
            {mobile.visible.map((item) => (
              <DockIcon
                key={`${item.title}-${item.href}-mobile`}
                item={item}
                isVertical={true}
                isActive={isItemActive(item.href)}
                onItemClick={() => setMobileMenuOpen(false)}
              />
            ))}

            {/* Mobile More Menu Button */}
            {mobile.shouldShowMore && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setMobileMoreMenuOpen(!mobileMoreMenuOpen)}
                  className="group relative flex items-center justify-center w-12 h-12 cursor-pointer"
                  aria-label="Toggle more navigation options"
                >
                  <div className="relative flex items-center justify-center w-full h-full rounded-full bg-white/70 dark:bg-white/12 border border-white/85 dark:border-white/20 backdrop-blur-md shadow-[0_2px_8px_rgba(0,0,0,0.06),inset_0_1px_1.5px_rgba(255,255,255,0.95)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.4),inset_0_1px_1.5px_rgba(255,255,255,0.2)] transition-all duration-300 hover:scale-110 hover:!bg-primary hover:!border-primary">
                    <div className="w-6 h-6 text-zinc-900 dark:text-zinc-50 group-hover:!text-primary-foreground transition-colors duration-200 flex items-center justify-center [filter:drop-shadow(0_1px_0_rgba(255,255,255,0.85))] dark:[filter:drop-shadow(0_1px_2px_rgba(0,0,0,0.8))] group-hover:![filter:none]">
                      {mobileMoreMenuOpen ? (
                        <IconX className="w-6 h-6 stroke-[2.2]" />
                      ) : (
                        <IconMenu2 className="w-6 h-6 stroke-[2.2]" />
                      )}
                    </div>
                  </div>
                  {/* Tooltip */}
                  <div className="absolute right-14 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-zinc-900/95 dark:bg-zinc-100/95 backdrop-blur-xl border border-zinc-800 dark:border-zinc-200 text-xs font-bold text-zinc-100 dark:text-zinc-900 whitespace-nowrap opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 group-hover:-translate-x-1 transition-all duration-300 pointer-events-none shadow-xl z-50">
                    More
                    <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-2 rotate-45 bg-zinc-900/95 dark:bg-zinc-100/95 border-r border-t border-zinc-800 dark:border-zinc-200" />
                  </div>
                </button>

                {/* Mobile More Menu - Expands Sideways (to the left) */}
                {mobileMoreMenuOpen && (
                  <div
                    className="absolute top-0 right-16 z-[110] flex flex-row-reverse gap-2 p-3 rounded-2xl bg-white/75 dark:bg-black/75 border border-white/60 dark:border-white/20 shadow-2xl animate-in slide-in-from-right-2 duration-200"
                    style={{
                      backdropFilter: "blur(32px) saturate(210%)",
                      WebkitBackdropFilter: "blur(32px) saturate(210%)",
                    }}
                  >
                    {mobile.hidden.map((item) => (
                      <DockIcon
                        key={`${item.title}-${item.href}-mobile-more`}
                        item={item}
                        isVertical={false}
                        isActive={isItemActive(item.href)}
                        onItemClick={() => {
                          setMobileMoreMenuOpen(false);
                          setMobileMenuOpen(false);
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Mobile Theme Toggle */}
            <div className="w-full h-px bg-zinc-300 dark:bg-zinc-700/60 my-0.5 shrink-0" />
            <DockThemeToggle isVertical={true} onToggle={() => setMobileMenuOpen(false)} />
          </div>
        )}
      </div>
    </>
  );
}

function smoothScrollToSection(targetHref: string) {
  if (typeof window === "undefined") return;

  const hashIndex = targetHref.indexOf("#");
  if (hashIndex === -1) {
    window.location.href = targetHref;
    return;
  }

  const targetHash = targetHref.slice(hashIndex);
  const targetId = targetHash.replace("#", "").trim();

  const isCurrentPage =
    window.location.pathname === "/" ||
    window.location.pathname === "";

  if (!isCurrentPage) {
    window.location.href = `/${targetHash}`;
    return;
  }

  const lenis = (window as any).__lenis;

  if (!targetId || targetId === "home") {
    if (lenis) {
      lenis.scrollTo(0, {
        duration: 1.15,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      });
    } else {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
    try {
      window.history.pushState(null, "", "#home");
    } catch {}
    return;
  }

  const targetElement =
    document.getElementById(targetId) ||
    document.querySelector(targetHash);

  if (targetElement) {
    if (lenis) {
      lenis.scrollTo(targetElement, {
        offset: -20,
        duration: 1.15,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      });
    } else {
      const rect = targetElement.getBoundingClientRect();
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      window.scrollTo({
        top: Math.max(0, rect.top + scrollTop - 20),
        behavior: "smooth",
      });
    }

    try {
      window.history.pushState(null, "", targetHash);
    } catch {}
  }
}

function DockIcon({
  item,
  isVertical,
  isActive,
  onItemClick,
}: {
  item: DockLink;
  isVertical: boolean;
  isActive?: boolean;
  onItemClick?: () => void;
}) {
  const baseIconClasses =
    "relative flex items-center justify-center w-full h-full rounded-full transition-all";
  const verticalIconClasses = `${baseIconClasses} ${
    isActive
      ? "bg-primary/20 dark:bg-primary/30 border-primary text-primary shadow-[0_0_16px_color-mix(in_srgb,var(--primary)_40%,transparent)]"
      : "bg-white/70 dark:bg-white/12 border border-white/85 dark:border-white/20 backdrop-blur-md shadow-[0_2px_8px_rgba(0,0,0,0.06),inset_0_1px_1.5px_rgba(255,255,255,0.95)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.4),inset_0_1px_1.5px_rgba(255,255,255,0.2)]"
  } duration-300 hover:scale-110 hover:!bg-primary hover:!border-primary hover:!shadow-[0_10px_20px_-4px_color-mix(in_srgb,var(--primary)_50%,transparent),inset_0_1px_1px_rgba(255,255,255,0.8)]`;

  const horizontalIconClasses = `${baseIconClasses} ${
    isActive
      ? "bg-primary/20 dark:bg-primary/30 border-primary text-primary shadow-[0_0_16px_color-mix(in_srgb,var(--primary)_40%,transparent)]"
      : "bg-white/70 dark:bg-white/12 border border-white/85 dark:border-white/20 backdrop-blur-md shadow-[0_2px_8px_rgba(0,0,0,0.06),inset_0_1px_1.5px_rgba(255,255,255,0.95)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.4),inset_0_1px_1.5px_rgba(255,255,255,0.2)]"
  } duration-300 ease-out hover:scale-125 hover:-translate-y-2 md:hover:-translate-y-2.5 hover:!bg-primary hover:!border-primary hover:!shadow-[0_12px_24px_-4px_color-mix(in_srgb,var(--primary)_50%,transparent),inset_0_1px_1px_rgba(255,255,255,0.8)]`;

  const Tooltip = ({ direction }: { direction: "vertical" | "horizontal" }) => {
    const isHorizontal = direction === "horizontal";
    return (
      <div
        className={`absolute px-3 py-1.5 rounded-xl bg-zinc-900/95 dark:bg-zinc-100/95 backdrop-blur-xl border border-zinc-800 dark:border-zinc-200 text-xs font-bold text-zinc-100 dark:text-zinc-900 whitespace-nowrap opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 pointer-events-none shadow-xl shadow-black/25 z-50 ${
          isHorizontal
            ? "-top-10 md:-top-12 left-1/2 -translate-x-1/2 group-hover:-translate-y-2"
            : "right-14 top-1/2 -translate-y-1/2 group-hover:-translate-x-1"
        }`}
      >
        {item.title}
        <div
          className={`absolute w-2 h-2 rotate-45 bg-zinc-900/95 dark:bg-zinc-100/95 ${
            isHorizontal
              ? "-bottom-1 left-1/2 -translate-x-1/2 border-r border-b"
              : "-right-1 top-1/2 -translate-y-1/2 border-r border-t"
          } border-zinc-800 dark:border-zinc-200`}
        />
      </div>
    );
  };

  const handleClick = (e?: React.MouseEvent) => {
    if (item.onClick) {
      e?.preventDefault();
      item.onClick();
    }
    onItemClick?.();
  };

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (item.isExternal || item.href?.startsWith("http://") || item.href?.startsWith("https://")) {
      onItemClick?.();
      return;
    }

    if (item.href?.includes("#")) {
      e.preventDefault();
      smoothScrollToSection(item.href);
      onItemClick?.();
      return;
    }

    onItemClick?.();
  };

  const content = (
    <>
      <div className={isVertical ? verticalIconClasses : horizontalIconClasses}>
        <div
          className={`w-5 h-5 md:w-5.5 md:h-5.5 ${
            isActive ? "text-primary dark:text-primary font-bold" : "text-zinc-900 dark:text-zinc-50"
          } group-hover:!text-primary-foreground transition-colors duration-200 flex items-center justify-center [&>svg]:stroke-[2.2] [filter:drop-shadow(0_1px_0_rgba(255,255,255,0.85))] dark:[filter:drop-shadow(0_1px_2px_rgba(0,0,0,0.8))] group-hover:![filter:none]`}
        >
          {item.icon}
        </div>
        {/* Subtle active glowing indicator dot */}
        {isActive && !isVertical && (
          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_6px_var(--primary)] pointer-events-none" />
        )}
      </div>
      <Tooltip direction={isVertical ? "vertical" : "horizontal"} />
    </>
  );

  const wrapperClasses =
    "group relative flex items-center justify-center w-12 h-12 md:w-12 md:h-12 cursor-pointer";

  return item.onClick ? (
    <button
      type="button"
      onClick={handleClick}
      className={wrapperClasses}
      aria-label={item.title}
    >
      {content}
    </button>
  ) : (
    <Link
      href={item.href || "#"}
      target={item.isExternal ? "_blank" : undefined}
      rel={item.isExternal ? "noopener noreferrer" : undefined}
      className={wrapperClasses}
      scroll={false}
      onClick={handleLinkClick}
      aria-label={item.title}
    >
      {content}
    </Link>
  );
}

function DockThemeToggle({
  isVertical,
  onToggle,
}: {
  isVertical: boolean;
  onToggle?: () => void;
}) {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const nextTheme = resolvedTheme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    onToggle?.();
  };

  const isDark = mounted ? resolvedTheme === "dark" : false;
  const label = isDark ? "Switch to Light Mode" : "Switch to Dark Mode";

  const baseIconClasses =
    "relative flex items-center justify-center w-full h-full rounded-full transition-all";
  const verticalIconClasses = `${baseIconClasses} bg-white/70 dark:bg-white/12 border border-white/85 dark:border-white/20 backdrop-blur-md shadow-[0_2px_8px_rgba(0,0,0,0.06),inset_0_1px_1.5px_rgba(255,255,255,0.95)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.4),inset_0_1px_1.5px_rgba(255,255,255,0.2)] duration-300 hover:scale-110 hover:!bg-primary hover:!border-primary hover:!shadow-[0_10px_20px_-4px_color-mix(in_srgb,var(--primary)_50%,transparent),inset_0_1px_1px_rgba(255,255,255,0.8)]`;

  const horizontalIconClasses = `${baseIconClasses} bg-white/70 dark:bg-white/12 border border-white/85 dark:border-white/20 backdrop-blur-md shadow-[0_2px_8px_rgba(0,0,0,0.06),inset_0_1px_1.5px_rgba(255,255,255,0.95)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.4),inset_0_1px_1.5px_rgba(255,255,255,0.2)] duration-300 ease-out hover:scale-125 hover:-translate-y-2 md:hover:-translate-y-2.5 hover:!bg-primary hover:!border-primary hover:!shadow-[0_12px_24px_-4px_color-mix(in_srgb,var(--primary)_50%,transparent),inset_0_1px_1px_rgba(255,255,255,0.8)]`;

  return (
    <button
      type="button"
      onClick={handleToggle}
      className="group/theme relative flex items-center justify-center w-12 h-12 md:w-12 md:h-12 cursor-pointer"
      aria-label={label}
      title={label}
    >
      <div className={isVertical ? verticalIconClasses : horizontalIconClasses}>
        <div className="w-5 h-5 md:w-5.5 md:h-5.5 text-zinc-900 dark:text-zinc-50 group-hover/theme:!text-primary-foreground transition-colors duration-200 flex items-center justify-center relative [filter:drop-shadow(0_1px_0_rgba(255,255,255,0.85))] dark:[filter:drop-shadow(0_1px_2px_rgba(0,0,0,0.8))] group-hover/theme:![filter:none]">
          <Sun className="h-5 w-5 scale-100 rotate-0 transition-transform duration-500 ease-out dark:scale-0 dark:-rotate-90 stroke-[2.2] group-hover/theme:rotate-45" />
          <Moon className="absolute h-5 w-5 scale-0 rotate-90 transition-transform duration-500 ease-out dark:scale-100 dark:rotate-0 stroke-[2.2] group-hover/theme:-rotate-12" />
        </div>
      </div>
      {/* Tooltip */}
      <div
        className={`absolute px-3 py-1.5 rounded-xl bg-zinc-900/95 dark:bg-zinc-100/95 backdrop-blur-xl border border-zinc-800 dark:border-zinc-200 text-xs font-bold text-zinc-100 dark:text-zinc-900 whitespace-nowrap opacity-0 scale-90 group-hover/theme:opacity-100 group-hover/theme:scale-100 transition-all duration-300 pointer-events-none shadow-xl shadow-black/25 z-50 ${
          !isVertical
            ? "-top-10 md:-top-12 left-1/2 -translate-x-1/2 group-hover/theme:-translate-y-2"
            : "right-14 top-1/2 -translate-y-1/2 group-hover/theme:-translate-x-1"
        }`}
      >
        {label}
        <div
          className={`absolute w-2 h-2 rotate-45 bg-zinc-900/95 dark:bg-zinc-100/95 ${
            !isVertical
              ? "-bottom-1 left-1/2 -translate-x-1/2 border-r border-b"
              : "-right-1 top-1/2 -translate-y-1/2 border-r border-t"
          } border-zinc-800 dark:border-zinc-200`}
        />
      </div>
    </button>
  );
}
