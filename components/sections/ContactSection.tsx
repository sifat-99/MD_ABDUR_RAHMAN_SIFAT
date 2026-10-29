import dynamic from "next/dynamic";
import Link from "next/link";
import { getProfile } from "@/lib/db-service";
import { ContactForm } from "./ContactForm";
import {
  IconMail,
  IconPhone,
  IconMapPin,
  IconBrandGithub,
  IconBrandLinkedin,
  IconBrandX,
  IconWorld,
  IconInfoCircle,
} from "@tabler/icons-react";

const WorldMapDemo = dynamic(() => import("@/components/world-map-demo"), {
  loading: () => <div className="w-full h-48 animate-pulse bg-muted/10 rounded-xl" />,
});

export async function ContactSection() {
  const profile = await getProfile();

  if (!profile) {
    return null;
  }

  return (
    <section id="contact" className="pt-6 sm:pt-8 md:pt-10 pb-36 sm:pb-40 md:pb-48 lg:pb-52 bg-muted/30 relative">
      <WorldMapDemo />

      <div className="w-full max-w-[2200px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 2xl:px-16 relative z-10">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-2 sm:mb-3 font-heading">
            Get In Touch
          </h2>
          <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Wherever you are in the world, let&apos;s collaborate on your next project.
          </p>
        </div>

        <div className="@container">
          <div className="grid grid-cols-1 @3xl:grid-cols-2 gap-8 lg:gap-12 items-start">
            {/* Contact Info (Left Column) */}
            <div className="@container/info space-y-6">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-3 tracking-wide">
                  <IconInfoCircle className="w-3.5 h-3.5" />
                  <span>Reach Out Directly</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight font-heading mb-6">
                  Contact Information
                </h3>
              </div>

              <div className="space-y-4">
                {profile.email && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-white/55 dark:bg-zinc-950/50 border border-white/70 dark:border-white/10 backdrop-blur-xl shadow-xs hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 shadow-xs">
                      <IconMail className="w-5 h-5 stroke-[2.2]" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider mb-1">
                        Email
                      </h4>
                      <Link
                        href={`mailto:${profile.email}`}
                        className="text-foreground font-semibold hover:text-primary transition-colors text-sm sm:text-base truncate block"
                      >
                        {profile.email}
                      </Link>
                    </div>
                  </div>
                )}

                {profile.phone && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-white/55 dark:bg-zinc-950/50 border border-white/70 dark:border-white/10 backdrop-blur-xl shadow-xs hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 shadow-xs">
                      <IconPhone className="w-5 h-5 stroke-[2.2]" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider mb-1">
                        Phone
                      </h4>
                      <Link
                        href={`tel:${profile.phone}`}
                        className="text-foreground font-semibold hover:text-primary transition-colors text-sm sm:text-base truncate block"
                      >
                        {profile.phone}
                      </Link>
                    </div>
                  </div>
                )}

                {profile.location && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-white/55 dark:bg-zinc-950/50 border border-white/70 dark:border-white/10 backdrop-blur-xl shadow-xs hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 shadow-xs">
                      <IconMapPin className="w-5 h-5 stroke-[2.2]" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider mb-1">
                        Location
                      </h4>
                      <p className="text-foreground font-semibold text-sm sm:text-base">
                        {profile.location}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {profile.socialLinks && (
                <div className="pt-4 sm:pt-6">
                  <h4 className="font-semibold text-sm sm:text-base text-foreground mb-3 font-heading">
                    Follow Me
                  </h4>
                  <div className="flex flex-wrap gap-2.5">
                    {profile.socialLinks.github && (
                      <Link
                        href={profile.socialLinks.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="GitHub Profile"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/70 dark:border-white/10 bg-white/50 dark:bg-zinc-900/40 backdrop-blur-md hover:bg-primary hover:border-primary hover:text-primary-foreground text-foreground transition-all duration-200 text-xs sm:text-sm font-medium shadow-2xs hover:scale-105 active:scale-95"
                      >
                        <IconBrandGithub className="w-4 h-4" />
                        <span>GitHub</span>
                      </Link>
                    )}
                    {profile.socialLinks.linkedin && (
                      <Link
                        href={profile.socialLinks.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="LinkedIn Profile"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/70 dark:border-white/10 bg-white/50 dark:bg-zinc-900/40 backdrop-blur-md hover:bg-[#0a66c2] hover:border-[#0a66c2] hover:text-white text-foreground transition-all duration-200 text-xs sm:text-sm font-medium shadow-2xs hover:scale-105 active:scale-95"
                      >
                        <IconBrandLinkedin className="w-4 h-4" />
                        <span>LinkedIn</span>
                      </Link>
                    )}
                    {profile.socialLinks.twitter && (
                      <Link
                        href={profile.socialLinks.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Twitter Profile"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/70 dark:border-white/10 bg-white/50 dark:bg-zinc-900/40 backdrop-blur-md hover:bg-zinc-900 dark:hover:bg-zinc-100 hover:border-zinc-900 dark:hover:border-zinc-100 hover:text-white dark:hover:text-zinc-900 text-foreground transition-all duration-200 text-xs sm:text-sm font-medium shadow-2xs hover:scale-105 active:scale-95"
                      >
                        <IconBrandX className="w-4 h-4" />
                        <span>Twitter</span>
                      </Link>
                    )}
                    {profile.socialLinks.website && (
                      <Link
                        href={profile.socialLinks.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Personal Website"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/70 dark:border-white/10 bg-white/50 dark:bg-zinc-900/40 backdrop-blur-md hover:bg-primary hover:border-primary hover:text-primary-foreground text-foreground transition-all duration-200 text-xs sm:text-sm font-medium shadow-2xs hover:scale-105 active:scale-95"
                      >
                        <IconWorld className="w-4 h-4" />
                        <span>Website</span>
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Contact Form (Right Column) */}
            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  );
}
