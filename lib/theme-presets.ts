import type { ThemePalette, SiteSettings, FontScheme } from "@/types/portfolio";

export const THEME_PALETTES: ThemePalette[] = [
  {
    id: "emerald-luxe",
    name: "Emerald Tech",
    description: "Modern high-end developer aesthetic with vibrant emerald & deep obsidian",
    primary: "#10B981",
    primaryForeground: "#FFFFFF",
    accent: "#059669",
    backgroundLight: "#F8FAFC",
    backgroundDark: "#09090B",
    cardLight: "#FFFFFF",
    cardDark: "#141417",
    borderLight: "#E2E8F0",
    borderDark: "#27272A",
    previewColors: ["#10B981", "#059669", "#09090B", "#F8FAFC"],
  },
  {
    id: "cyber-cyan",
    name: "Cyber Cyan & Neon",
    description: "Electric cyan and dark futuristic indigo tones",
    primary: "#06B6D4",
    primaryForeground: "#080E1A",
    accent: "#3B82F6",
    backgroundLight: "#F0F9FF",
    backgroundDark: "#070B14",
    cardLight: "#FFFFFF",
    cardDark: "#0F172A",
    borderLight: "#BAE6FD",
    borderDark: "#1E293B",
    previewColors: ["#06B6D4", "#3B82F6", "#070B14", "#F0F9FF"],
  },
  {
    id: "royal-indigo",
    name: "Royal Indigo",
    description: "Deep space aesthetic with elegant indigo and violet glow",
    primary: "#6366F1",
    primaryForeground: "#FFFFFF",
    accent: "#8B5CF6",
    backgroundLight: "#F8FAFC",
    backgroundDark: "#0A0A12",
    cardLight: "#FFFFFF",
    cardDark: "#121222",
    borderLight: "#E0E7FF",
    borderDark: "#232338",
    previewColors: ["#6366F1", "#8B5CF6", "#0A0A12", "#F8FAFC"],
  },
  {
    id: "sunset-amber",
    name: "Sunset Amber",
    description: "Warm luxury golden amber with espresso dark backgrounds",
    primary: "#F59E0B",
    primaryForeground: "#181005",
    accent: "#D97706",
    backgroundLight: "#FFFBEB",
    backgroundDark: "#120E0A",
    cardLight: "#FFFFFF",
    cardDark: "#1C1610",
    borderLight: "#FDE68A",
    borderDark: "#2E241A",
    previewColors: ["#F59E0B", "#D97706", "#120E0A", "#FFFBEB"],
  },
  {
    id: "rose-crimson",
    name: "Rose Velvet",
    description: "Striking neon rose and deep crimson with obsidian contrast",
    primary: "#F43F5E",
    primaryForeground: "#FFFFFF",
    accent: "#E11D48",
    backgroundLight: "#FFF1F2",
    backgroundDark: "#11080A",
    cardLight: "#FFFFFF",
    cardDark: "#1B0E12",
    borderLight: "#FECDD3",
    borderDark: "#301820",
    previewColors: ["#F43F5E", "#E11D48", "#11080A", "#FFF1F2"],
  },
  {
    id: "ocean-cobalt",
    name: "Ocean Cobalt",
    description: "Clean enterprise cobalt blue and midnight marine",
    primary: "#2563EB",
    primaryForeground: "#FFFFFF",
    accent: "#1D4ED8",
    backgroundLight: "#F8FAFC",
    backgroundDark: "#0B0F19",
    cardLight: "#FFFFFF",
    cardDark: "#111827",
    borderLight: "#E2E8F0",
    borderDark: "#1F2937",
    previewColors: ["#2563EB", "#1D4ED8", "#0B0F19", "#F8FAFC"],
  },
  {
    id: "monochrome-minimal",
    name: "Monochrome Minimalist",
    description: "Timeless black, pure white, and neutral slate minimalism",
    primary: "#18181B",
    primaryForeground: "#FAFAFA",
    accent: "#52525B",
    backgroundLight: "#FAFAFA",
    backgroundDark: "#09090B",
    cardLight: "#FFFFFF",
    cardDark: "#121214",
    borderLight: "#E4E4E7",
    borderDark: "#27272A",
    previewColors: ["#18181B", "#71717A", "#09090B", "#FAFAFA"],
  },
  {
    id: "soft-lavender",
    name: "Soft Lavender & Lilac",
    description: "Calm pastel lavender, soft lilac glow, and ethereal obsidian plum",
    primary: "#8B5CF6",
    primaryForeground: "#FFFFFF",
    accent: "#C084FC",
    backgroundLight: "#FAF5FF",
    backgroundDark: "#0B0813",
    cardLight: "#FFFFFF",
    cardDark: "#151022",
    borderLight: "#E9D5FF",
    borderDark: "#2E1D4A",
    previewColors: ["#8B5CF6", "#C084FC", "#0B0813", "#FAF5FF"],
  },
];

export function getPaletteById(id?: string): ThemePalette {
  return THEME_PALETTES.find((p) => p.id === id) || THEME_PALETTES[0];
}

export const FONT_SCHEMES: FontScheme[] = [
  {
    id: "default",
    name: "Geist Modern Tech (Default)",
    category: "sans",
    description: "Next.js signature neo-grotesque sans, hyper-optimized for technical clarity and minimalist UI",
    headingFont: "var(--font-geist-sans), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    bodyFont: "var(--font-geist-sans), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    monoFont: "var(--font-geist-mono), monospace",
    googleFontQuery: "",
    previewHeading: "Engineering Digital Experiences",
    previewBody: "Building resilient distributed systems, scalable applications, and AI integrations with precision.",
  },
  {
    id: "jakarta-inter",
    name: "Plus Jakarta & Inter (SaaS Pro)",
    category: "sans",
    description: "Modern geometric headlines with industry-standard Inter UI body for high-converting SaaS products",
    headingFont: "'Plus Jakarta Sans', sans-serif",
    bodyFont: "'Inter', sans-serif",
    monoFont: "'JetBrains Mono', monospace",
    googleFontQuery: "family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500",
    previewHeading: "Architecting Modern Software",
    previewBody: "Crafting polished web applications with unmatched attention to typography, performance, and user flow.",
  },
  {
    id: "outfit-geometric",
    name: "Outfit Geometric (Digital Clean)",
    category: "sans",
    description: "Sleek, rounded modern tech sans with futuristic elegance and high digital readability",
    headingFont: "'Outfit', sans-serif",
    bodyFont: "'Outfit', sans-serif",
    monoFont: "'Fira Code', monospace",
    googleFontQuery: "family=Outfit:wght@300;400;500;600;700;800&family=Fira+Code:wght@400;500",
    previewHeading: "Designing Next-Gen Interfaces",
    previewBody: "Combining elegant minimalism with advanced frontend engineering to deliver seamless web solutions.",
  },
  {
    id: "space-grotesk-dm",
    name: "Space Grotesk & DM Sans (Cyber & Web3)",
    category: "display",
    description: "Charismatic brutalist headlines paired with warm geometric DM Sans for modern engineering",
    headingFont: "'Space Grotesk', sans-serif",
    bodyFont: "'DM Sans', sans-serif",
    monoFont: "'Space Mono', monospace",
    googleFontQuery: "family=Space+Grotesk:wght@500;600;700&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,700;1,9..40,400&family=Space+Mono:wght@400;700",
    previewHeading: "Decentralized Systems & AI",
    previewBody: "Pushing the boundaries of decentralized protocols, autonomous agents, and real-time computing.",
  },
  {
    id: "syne-inter",
    name: "Syne Avant-Garde (Creative Studio)",
    category: "display",
    description: "Distinctive, high-impact display font paired with clean Inter for creative technologists",
    headingFont: "'Syne', sans-serif",
    bodyFont: "'Inter', sans-serif",
    monoFont: "'JetBrains Mono', monospace",
    googleFontQuery: "family=Syne:wght@600;700;800&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500",
    previewHeading: "Creative Development & Craft",
    previewBody: "Where artistic vision meets robust full-stack architecture to build memorable digital products.",
  },
  {
    id: "playfair-jakarta",
    name: "Playfair & Jakarta (Luxury Editorial)",
    category: "hybrid",
    description: "Timeless editorial serif headings with crisp modern geometric sans body text",
    headingFont: "'Playfair Display', serif",
    bodyFont: "'Plus Jakarta Sans', sans-serif",
    monoFont: "'Fira Code', monospace",
    googleFontQuery: "family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;600;700",
    previewHeading: "Thoughtful Software & Strategy",
    previewBody: "Delivering world-class codebases backed by thoughtful technical writing and meticulous engineering standards.",
  },
  {
    id: "sora-manrope",
    name: "Sora & Manrope (Executive Leader)",
    category: "sans",
    description: "Precision-engineered geometric sans preferred by technology executives, VPs, and startup founders",
    headingFont: "'Sora', sans-serif",
    bodyFont: "'Manrope', sans-serif",
    monoFont: "'JetBrains Mono', monospace",
    googleFontQuery: "family=Sora:wght@500;600;700;800&family=Manrope:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500",
    previewHeading: "Leading High-Impact Engineering",
    previewBody: "Scaling software infrastructure, managing cross-functional teams, and shipping production-grade platforms.",
  },
  {
    id: "unbounded-worksans",
    name: "Unbounded (Ultra Modern Neo-Digital)",
    category: "display",
    description: "Wide horizontal proportions with vibrant character for bold developers and creative designers",
    headingFont: "'Unbounded', sans-serif",
    bodyFont: "'Work Sans', sans-serif",
    monoFont: "'Fira Code', monospace",
    googleFontQuery: "family=Unbounded:wght@600;700;800&family=Work+Sans:wght@300;400;500;600&family=Fira+Code:wght@400;500",
    previewHeading: "Next Evolution of Web Tech",
    previewBody: "Harnessing cutting-edge browser capabilities, WebGL shaders, and responsive design systems.",
  },
  {
    id: "cinzel-montserrat",
    name: "Cinzel & Montserrat (Prestige Classical)",
    category: "serif",
    description: "Classical Roman proportions and monumentality paired with balanced urban Montserrat sans",
    headingFont: "'Cinzel', serif",
    bodyFont: "'Montserrat', sans-serif",
    monoFont: "'JetBrains Mono', monospace",
    googleFontQuery: "family=Cinzel:wght@600;700;800&family=Montserrat:wght@300;400;500;600;700",
    previewHeading: "Distinguished Academic Excellence",
    previewBody: "Honors-level algorithmic computer science, research publications, and verified credentials.",
  },
  {
    id: "bricolage-inter",
    name: "Bricolage Grotesque (Expressive Tech)",
    category: "display",
    description: "Quirky, historical yet hyper-modern grotesque headlines with rock-solid Inter body text",
    headingFont: "'Bricolage Grotesque', sans-serif",
    bodyFont: "'Inter', sans-serif",
    monoFont: "'JetBrains Mono', monospace",
    googleFontQuery: "family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700;12..96,800&family=Inter:wght@300;400;500;600",
    previewHeading: "Human-Centered Engineering",
    previewBody: "Building tools that empower users with delightful micro-interactions, accessibility, and speed.",
  },
  {
    id: "fira-code-sans",
    name: "Fira Code & Fira Sans (Pure Developer)",
    category: "mono",
    description: "Developer-first typography with programmatic monospace titles and readable Fira Sans body",
    headingFont: "'Fira Code', monospace",
    bodyFont: "'Fira Sans', sans-serif",
    monoFont: "'Fira Code', monospace",
    googleFontQuery: "family=Fira+Code:wght@500;600;700&family=Fira+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400",
    previewHeading: "<SystemArchitect level='Senior' />",
    previewBody: "const stack = ['Next.js', 'TypeScript', 'Node.js', 'MongoDB', 'Cloud Infrastructure'];",
  },
  {
    id: "lora-inter",
    name: "Lora & Inter (Editorial Storyteller)",
    category: "serif",
    description: "Contemporary calligraphic serif headings with clean Inter body for technical bloggers and authors",
    headingFont: "'Lora', serif",
    bodyFont: "'Inter', sans-serif",
    monoFont: "'JetBrains Mono', monospace",
    googleFontQuery: "family=Lora:ital,wght@0,500;0,600;0,700;1,400&family=Inter:wght@300;400;500;600;700",
    previewHeading: "Stories in Code & Design",
    previewBody: "Writing detailed technical tutorials, engineering deep dives, and thoughts on the future of web tech.",
  },
];

export function getFontSchemeById(id?: string): FontScheme {
  return FONT_SCHEMES.find((f) => f.id === id) || FONT_SCHEMES[0];
}

export function generateThemeCss(settings?: SiteSettings | null): string {
  const activePaletteId = settings?.themeConfig?.activePaletteId || "emerald-luxe";
  const palette = getPaletteById(activePaletteId);

  const activeFontSchemeId = settings?.themeConfig?.activeFontSchemeId || "default";
  const fontScheme = getFontSchemeById(activeFontSchemeId);

  const customPrimary = settings?.themeConfig?.customPrimary || settings?.primaryColor;
  const customAccent = settings?.themeConfig?.customAccent || settings?.accentColor;

  const primary = customPrimary || palette.primary;
  const accent = customAccent || palette.accent;
  const primaryForeground = palette.primaryForeground || "#ffffff";

  // Pre-configured background gradients for each palette
  const gradients: Record<string, { light: string; dark: string }> = {
    "emerald-luxe": {
      light: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #bbf7d0 100%)",
      dark: "linear-gradient(135deg, #051b11 0%, #020b07 50%, #000000 100%)",
    },
    "cyber-cyan": {
      light: "linear-gradient(135deg, #ecfeff 0%, #cffafe 50%, #a5f3fc 100%)",
      dark: "linear-gradient(135deg, #041a24 0%, #020d14 50%, #000000 100%)",
    },
    "royal-indigo": {
      light: "linear-gradient(135deg, #b9b4e9 0%, #b191f1 50%, #f1a5fd 100%)",
      dark: "linear-gradient(135deg, #191919 0%, #040304 50%, #000000 100%)",
    },
    "sunset-amber": {
      light: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 50%, #fde68a 100%)",
      dark: "linear-gradient(135deg, #1c1306 0%, #0d0903 50%, #000000 100%)",
    },
    "rose-crimson": {
      light: "linear-gradient(135deg, #fff1f2 0%, #ffe4e6 50%, #fecdd3 100%)",
      dark: "linear-gradient(135deg, #20060d 0%, #0e0205 50%, #000000 100%)",
    },
    "ocean-cobalt": {
      light: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 50%, #bfdbfe 100%)",
      dark: "linear-gradient(135deg, #07152d 0%, #030a17 50%, #000000 100%)",
    },
    "monochrome-minimal": {
      light: "linear-gradient(135deg, #fafafa 0%, #f4f4f5 50%, #e4e4e7 100%)",
      dark: "linear-gradient(135deg, #18181b 0%, #0e0e11 50%, #000000 100%)",
    },
    "soft-lavender": {
      light: "linear-gradient(135deg, #faf5ff 0%, #f3e8ff 50%, #e9d5ff 100%)",
      dark: "linear-gradient(135deg, #150826 0%, #0a0414 50%, #000000 100%)",
    },
  };

  const bgGradient = gradients[activePaletteId] || {
    light: `linear-gradient(135deg, ${palette.backgroundLight} 0%, ${primary}15 50%, ${accent}12 100%)`,
    dark: `linear-gradient(135deg, ${palette.backgroundDark} 0%, #0a0a0f 50%, ${primary}22 100%)`,
  };

  const isMono = palette.id === "monochrome-minimal";
  const lightPrimary = isMono ? "#18181B" : primary;
  const darkPrimary = isMono ? "#FAFAFA" : primary;
  const lightPrimaryForeground = isMono ? "#FAFAFA" : primaryForeground;
  const darkPrimaryForeground = isMono ? "#18181B" : primaryForeground;

  const fontImport = fontScheme.googleFontQuery
    ? `@import url('https://fonts.googleapis.com/css2?${fontScheme.googleFontQuery}&display=swap');`
    : "";

  return `
    ${fontImport}

    :root {
      --primary: ${lightPrimary};
      --primary-foreground: ${lightPrimaryForeground};
      --brand-primary: ${lightPrimary};
      --brand-primary-dark: ${accent};
      --accent: ${accent}14;
      --accent-foreground: ${accent};
      --ring: ${lightPrimary};
      --sidebar-primary: ${lightPrimary};
      --sidebar-primary-foreground: ${lightPrimaryForeground};
      --sidebar-ring: ${lightPrimary};
      --portfolio-body-bg: ${bgGradient.light};
      --background: ${palette.backgroundLight || "#f8fafc"};
      --foreground: #09090b;
      --card-foreground: #09090b;
      --muted-foreground: #334155;
      --card: rgba(255, 255, 255, 0.88);
      --border: rgba(15, 23, 42, 0.12);
      --input: rgba(15, 23, 42, 0.12);

      --font-heading: ${fontScheme.headingFont};
      --font-body: ${fontScheme.bodyFont};
      --font-mono: ${fontScheme.monoFont || "var(--font-geist-mono), monospace"};
      --font-sans: ${fontScheme.bodyFont};
    }
    .dark {
      --primary: ${darkPrimary};
      --primary-foreground: ${darkPrimaryForeground};
      --brand-primary: ${darkPrimary};
      --brand-primary-dark: ${accent};
      --accent: ${accent}25;
      --accent-foreground: ${accent};
      --ring: ${darkPrimary};
      --sidebar-primary: ${darkPrimary};
      --sidebar-primary-foreground: ${darkPrimaryForeground};
      --sidebar-ring: ${darkPrimary};
      --portfolio-body-bg: ${bgGradient.dark};
      --background: ${palette.backgroundDark || "#09090b"};
      --foreground: #f8fafc;
      --card-foreground: #f8fafc;
      --muted-foreground: #cbd5e1;
      --card: rgba(18, 22, 30, 0.85);
      --border: rgba(255, 255, 255, 0.14);
      --input: rgba(255, 255, 255, 0.14);

      --font-heading: ${fontScheme.headingFont};
      --font-body: ${fontScheme.bodyFont};
      --font-mono: ${fontScheme.monoFont || "var(--font-geist-mono), monospace"};
      --font-sans: ${fontScheme.bodyFont};
    }

    body.portfolio-root-body {
      background-image: var(--portfolio-body-bg) !important;
    }

    /* Dynamic Typography Application */
    h1, h2, h3, h4, h5, h6, .font-heading {
      font-family: var(--font-heading) !important;
    }

    body, p, span, a, input, textarea, select, button, label, .font-sans, .studio-modal-body * {
      font-family: var(--font-body);
    }

    code, kbd, samp, pre, .font-mono {
      font-family: var(--font-mono) !important;
    }

    /* Apple Glossy Glass styling for cards & dialogs */
    .bg-card {
      backdrop-filter: blur(24px) saturate(180%) !important;
      -webkit-backdrop-filter: blur(24px) saturate(180%) !important;
    }
  `;
}
