import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import { StoreProvider } from "@/store/StoreProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import "@/app/globals.css";
import { getSiteSettings } from "@/lib/db-service";
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
  return {
    metadataBase: new URL("https://sifat.online"),
    title: "Portfolio Studio || Content Management",
    description: "Next.js & Firebase Realtime Database CMS Studio",
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
  };
}

export default async function Layout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();
  const themeCss = generateThemeCss(settings);
  const fontScheme = getFontSchemeById(settings?.themeConfig?.activeFontSchemeId);

  return (
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
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon-48.png" sizes="48x48" type="image/png" />
        <link rel="icon" href="/icon-96.png" sizes="96x96" type="image/png" />
        <link rel="icon" href="/icon-192.png" sizes="192x192" type="image/png" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />
      </head>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen portfolio-root-body animate-gradient bg-[length:400%_400%] text-foreground transition-colors duration-200`}
        style={{ backgroundImage: "var(--portfolio-body-bg)" }}
      >
        <AuthProvider>
          <StoreProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              {children}
            </ThemeProvider>
          </StoreProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
