import { AuthProvider } from "@/context/AuthContext";
import { StoreProvider } from "@/store/StoreProvider";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { AppSidebar } from "@/components/app-sidebar";
import { ModeToggleWrapper } from "@/components/ModeToggleWrapper";
import { FloatingDock } from "@/components/FloatingDock";
import SidebarToggle from "@/components/SidebarToggle";
import { SmoothScrollProvider } from "@/components/SmoothScrollProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getSiteSettings, getProfile } from "@/lib/db-service";
import { generateThemeCss, getFontSchemeById } from "@/lib/theme-presets";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const profile = await getProfile();

  const fullName = profile
    ? `${profile.firstName || ""} ${profile.lastName || ""}`.trim()
    : "Md Abdur Rahman Sifat";

  const title =
    settings?.siteTitle ||
    `${fullName} | Full-Stack Web Developer & Engineer`;
  const description =
    settings?.siteDescription ||
    `Official portfolio of ${fullName}, Full-Stack Web & Shopify Developer in Dhaka, Bangladesh. Building high-performance Next.js & React web solutions.`;
  const ogImage = settings?.ogImage || "/opengraph-image.png";

  return {
    metadataBase: new URL("https://sifat.online"),
    title,
    description,
    keywords: [
      fullName,
      "Md Abdur Rahman Sifat",
      "Md. Abdur Rahman Sifat",
      "Abdur Rahman Sifat",
      "Sifat",
      "sifat-99",
      "sifatmollah",
      "Full-Stack Web Developer",
      "Software Engineer",
      "Next.js Developer Bangladesh",
      "React Developer Dhaka",
      "Shopify Developer",
      "E-Commerce Specialist",
      "Flutter Developer",
      "BUBT CSE",
      "ICPC Regionalist",
      "Web Applications Portfolio",
    ],
    authors: [{ name: fullName, url: "https://sifat.online" }],
    creator: fullName,
    publisher: fullName,
    alternates: {
      canonical: "https://sifat.online",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "any" },
        { url: "/icon-48.png", sizes: "48x48", type: "image/png" },
        { url: "/icon-96.png", sizes: "96x96", type: "image/png" },
        { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      ],
      shortcut: "/favicon.ico",
      apple: [
        { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      ],
    },
    openGraph: {
      title,
      description,
      url: "https://sifat.online",
      siteName: title,
      locale: "en_US",
      type: "website",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      creator: "@md_sifat_99",
      images: [ogImage],
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [settings, profile] = await Promise.all([
    getSiteSettings(),
    getProfile(),
  ]);
  const fullName = profile
    ? `${profile.firstName || ""} ${profile.lastName || ""}`.trim()
    : "Md. Abdur Rahman Sifat";
  const siteUrl = "https://sifat.online";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": `${siteUrl}/#person`,
        name: fullName,
        alternateName: [
          "Md Abdur Rahman Sifat",
          "Md. Abdur Rahman Sifat",
          "Abdur Rahman Sifat",
          "Sifat",
          "sifat-99",
          "sifatmollah",
        ],
        url: siteUrl,
        image: profile?.profileImage || `${siteUrl}/opengraph-image.png`,
        jobTitle: "Full-Stack Web Developer & Shopify Specialist",
        description:
          settings?.siteDescription ||
          `Official portfolio of ${fullName}, Full-Stack Web & Shopify Developer in Dhaka, Bangladesh.`,
        email: profile?.email || "mdabdurrahmansifat@gmail.com",
        telephone: profile?.phone || "+8801521-788920",
        address: {
          "@type": "PostalAddress",
          addressLocality: "Dhanmondi, Dhaka",
          addressCountry: "Bangladesh",
        },
        alumniOf: {
          "@type": "EducationalOrganization",
          name: "Bangladesh University of Business and Technology (BUBT)",
        },
        sameAs: [
          profile?.socialLinks?.github || "https://github.com/sifat-99",
          profile?.socialLinks?.linkedin || "https://linkedin.com/in/sifatmollah",
          profile?.socialLinks?.twitter || "https://x.com/md_sifat_99",
          profile?.socialLinks?.medium || "https://medium.com/@mdabdurrahmansifat",
        ].filter(Boolean),
        knowsAbout: [
          "Full-Stack Web Development",
          "Next.js",
          "React.js",
          "TypeScript",
          "Node.js",
          "Express.js",
          "Shopify Liquid & Headless Storefronts",
          "Flutter & Mobile App Development",
          "MongoDB",
          "Competitive Programming",
        ],
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: settings?.siteTitle || `${fullName} Portfolio`,
        publisher: {
          "@id": `${siteUrl}/#person`,
        },
      },
    ],
  };

  const themeCss = generateThemeCss(settings);
  const fontScheme = getFontSchemeById(settings?.themeConfig?.activeFontSchemeId);
  const isMaintenance = settings?.maintenanceMode === true;

  return (
    <AuthProvider>
      <StoreProvider>
        <html lang="en" suppressHydrationWarning>
          <head>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link
              rel="preconnect"
              href="https://fonts.gstatic.com"
              crossOrigin="anonymous"
            />
            {fontScheme.googleFontQuery && (
              <link
                id="dynamic-google-font"
                rel="stylesheet"
                href={`https://fonts.googleapis.com/css2?${fontScheme.googleFontQuery}&display=swap`}
              />
            )}
            <style
              id="dynamic-theme-palette"
              dangerouslySetInnerHTML={{ __html: themeCss }}
            />
            {/* Schema.org Person & WebSite JSON-LD for Google Knowledge Panel & SEO */}
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            {/* Search Engine & Browser Favicons (Google Search Compliant) */}
            <link rel="icon" href="/favicon.ico" sizes="any" />
            <link rel="icon" href="/icon-48.png" sizes="48x48" type="image/png" />
            <link rel="icon" href="/icon-96.png" sizes="96x96" type="image/png" />
            <link rel="icon" href="/icon-192.png" sizes="192x192" type="image/png" />
            <link rel="shortcut icon" href="/favicon.ico" />
            <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />
          </head>
          <body
            suppressHydrationWarning
            className={`${geistSans.variable} ${geistMono.variable} antialiased portfolio-root-body w-full min-h-screen animate-gradient bg-[length:400%_400%]`}
            style={{ backgroundImage: "var(--portfolio-body-bg)" }}
          >
            <div suppressHydrationWarning />
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <SmoothScrollProvider initialConfig={settings?.smoothScrollConfig}>
                <SidebarProvider defaultOpen={false}>
                  <SidebarInset className="bg-transparent">{children}</SidebarInset>

                  {!isMaintenance && (
                    <>
                      <AppSidebar side="right" />
                      <FloatingDock />
                      <SidebarToggle />
                    </>
                  )}

                  {/* Mode Toggle - Desktop: bottom right next to AI chat, Mobile: top right next to burger menu */}
                  <div
                    className={`fixed ${
                      isMaintenance
                        ? "top-4 right-4"
                        : "md:bottom-6 md:right-24 top-4 right-16 md:top-auto md:left-auto"
                    } z-30`}
                  >
                    <div className="w-10 h-10 md:w-12 md:h-12">
                      <ModeToggleWrapper />
                    </div>
                  </div>
                </SidebarProvider>
              </SmoothScrollProvider>
            </ThemeProvider>
          </body>
        </html>
      </StoreProvider>
    </AuthProvider>
  );
}
