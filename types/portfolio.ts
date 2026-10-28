export interface Profile {
  id: string; // "singleton-profile"
  firstName: string;
  lastName: string;
  headline: string;
  headlineStaticText?: string;
  headlineAnimatedWords?: string[];
  headlineAnimationDuration?: number;
  shortBio: string;
  fullBio?: string;
  profileImage?: string;
  profileImageAlt?: string;
  email: string;
  phone?: string;
  location?: string;
  availability?: "available" | "open" | "unavailable";
  socialLinks?: {
    github?: string;
    linkedin?: string;
    twitter?: string;
    website?: string;
    medium?: string;
    devto?: string;
    youtube?: string;
    stackoverflow?: string;
  };
  yearsOfExperience?: number;
  stats?: Array<{ label: string; value: string }>;
  _status?: "published" | "draft";
  _updatedAt?: string;
}

export type DocumentStatus = "published" | "draft" | "saving" | "publishing";

export interface DraftHistoryItem {
  id: string;
  documentId: string;
  collectionName: string;
  action: "draft_save" | "publish" | "discard" | "restore";
  title?: string;
  snapshot: any;
  author: string;
  timestamp: string;
  changeSummary?: string;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  tagline?: string;
  coverImage?: string;
  technologies?: string[]; // IDs or names of skills
  category: string;
  liveUrl?: string;
  githubUrl?: string;
  featured?: boolean;
  order?: number;
}

export interface Skill {
  id: string;
  name: string;
  category: string; // frontend, backend, ai-ml, devops, database, etc.
  proficiency: "beginner" | "intermediate" | "advanced" | "expert";
  percentage: number;
  yearsOfExperience?: number;
  color?: string;
  order?: number;
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  employmentType?: string;
  location?: string;
  startDate: string;
  endDate?: string;
  current?: boolean;
  description?: string;
  responsibilities?: string[];
  achievements?: string[];
  technologies?: string[];
  companyLogo?: string;
  companyWebsite?: string;
  order?: number;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy?: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
  gpa?: string;
  description?: string;
  achievements?: string[];
  logo?: string;
  website?: string;
  order?: number;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
  logo?: string;
  description?: string;
  skills?: string[];
  order?: number;
}

export interface Achievement {
  id: string;
  title: string;
  type: string; // award, hackathon, publication, speaking, open-source, milestone, recognition, other
  issuer?: string;
  date: string;
  description?: string;
  image?: string;
  url?: string;
  featured?: boolean;
  order?: number;
}

export interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  featuredImage?: string;
  category?: string;
  tags?: string[];
  publishedAt: string;
  readTime?: number;
  order?: number;
}

export interface Service {
  id: string;
  title: string;
  slug: string;
  icon?: string;
  shortDescription?: string;
  fullDescription?: string;
  features?: string[];
  technologies?: string[];
  deliverables?: string[];
  pricing?: {
    startingPrice?: number;
    priceType?: "hourly" | "project" | "monthly" | "custom";
    description?: string;
  };
  timeline?: string;
  featured?: boolean;
  order?: number;
}

export interface Testimonial {
  id: string;
  name: string;
  position: string;
  company: string;
  avatar?: string;
  testimonial: string;
  rating?: number;
  date?: string;
  linkedinUrl?: string;
  companyLogo?: string;
  featured?: boolean;
  order?: number;
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  submittedAt: string;
  status: "new" | "archived";
  notes?: string;
}

export interface NavigationItem {
  id: string;
  title: string;
  href: string;
  icon: string;
  isExternal?: boolean;
  order: number;
}

export interface SiteSettings {
  id: string; // "singleton-siteSettings"
  siteTitle: string;
  siteDescription?: string;
  siteKeywords?: string[];
  siteLogo?: string;
  favicon?: string;
  ogImage?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  ctaText?: string;
  ctaUrl?: string;
  heroHeadline?: string;
  heroSubheadline?: string;
  heroBackground?: string;
  showBlog?: boolean;
  showServices?: boolean;
  showTestimonials?: boolean;
  googleAnalyticsId?: string;
  facebookPixelId?: string;
  twitterHandle?: string;
  footer?: {
    text?: string;
    copyrightText?: string;
    links?: Array<{ title: string; url: string }>;
  };
  maintenanceMode?: boolean;
  maintenanceMessage?: string;
  allowedAdmins?: string[];
  themeConfig?: ThemeConfig;
  smoothScrollConfig?: SmoothScrollConfig;
}

export interface SmoothScrollConfig {
  enabled?: boolean;
  intensity?: "subtle" | "balanced" | "floaty";
  speed?: number; // 0.5 to 2.0
}

export interface MediaAsset {
  id: string;
  url: string;
  name: string;
  size?: number;
  type?: string;
  folder?: string;
  source?: "uploadthing" | "firebase" | "local" | "sanity";
  alt?: string;
  createdAt?: string;
}

export interface ThemePalette {
  id: string;
  name: string;
  description: string;
  primary: string; // Hex code, e.g. #10B981
  primaryForeground: string; // #FFFFFF
  accent: string; // #059669
  backgroundLight: string; // #F8FAFC
  backgroundDark: string; // #09090B
  cardLight: string; // #FFFFFF
  cardDark: string; // #18181B
  borderLight: string; // #E2E8F0
  borderDark: string; // #27272A
  previewColors: string[];
}

export interface FontScheme {
  id: string;
  name: string;
  category: "sans" | "serif" | "display" | "mono" | "hybrid";
  description: string;
  headingFont: string;
  bodyFont: string;
  monoFont?: string;
  googleFontQuery?: string;
  previewHeading: string;
  previewBody: string;
}

export interface ThemeConfig {
  activePaletteId?: string;
  activeFontSchemeId?: string;
  customPrimary?: string;
  customAccent?: string;
  customBackgroundLight?: string;
  customBackgroundDark?: string;
}
