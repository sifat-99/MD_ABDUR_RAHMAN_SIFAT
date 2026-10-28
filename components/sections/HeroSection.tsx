import Link from "next/link";
import { LayoutTextFlip } from "@/components/ui/layout-text-flip";
import { ThreeDName } from "@/components/ui/ThreeDName";
import { getProfile } from "@/lib/db-service";
import { ProfileImage } from "./ProfileImage";

export async function HeroSection() {
  const profile = await getProfile();

  if (!profile) {
    return null;
  }

  return (
    <section
      id="home"
      className="relative min-h-[85vh] lg:min-h-screen flex items-center justify-center pt-20 pb-8 sm:pt-24 sm:pb-10 lg:pt-6 lg:pb-10 overflow-hidden"
    >
      <div className="relative z-10 w-full max-w-[2000px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 2xl:px-16">
        <div className="@container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16 items-center">
            {/* Text Content */}
            <div className="@container/hero space-y-4 @md/hero:space-y-6">
              <ThreeDName
                firstName={profile.firstName || ""}
                lastName={profile.lastName || ""}
              />
              {profile.headlineStaticText &&
              profile.headlineAnimatedWords &&
              profile.headlineAnimatedWords.length > 0 ? (
                <LayoutTextFlip
                  text={profile.headlineStaticText}
                  words={profile.headlineAnimatedWords}
                  duration={profile.headlineAnimationDuration || 3000}
                  className="text-xl @md/hero:text-2xl @lg/hero:text-3xl text-muted-foreground font-medium"
                />
              ) : (
                <p className="text-xl @md/hero:text-2xl @lg/hero:text-3xl text-muted-foreground font-medium">
                  {profile.headline}
                </p>
              )}
              <p className="text-base @md/hero:text-lg text-muted-foreground leading-relaxed max-w-2xl">
                {profile.shortBio}
              </p>

              {profile.socialLinks && (
                <div className="flex flex-wrap gap-3 @md/hero:gap-4 pt-2">
                  {profile.socialLinks.github && (
                    <Link
                      href={profile.socialLinks.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="GitHub Profile"
                      className="px-4 py-2 @md/hero:px-5 @md/hero:py-2.5 rounded-xl border border-border bg-card/70 backdrop-blur-md hover:bg-card hover:border-primary/50 hover:text-primary transition-all duration-200 cursor-pointer shadow-xs active:scale-95 text-sm @md/hero:text-base font-medium"
                    >
                      GitHub
                    </Link>
                  )}
                  {profile.socialLinks.linkedin && (
                    <Link
                      href={profile.socialLinks.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="LinkedIn Profile"
                      className="px-4 py-2 @md/hero:px-5 @md/hero:py-2.5 rounded-xl border border-border bg-card/70 backdrop-blur-md hover:bg-card hover:border-primary/50 hover:text-primary transition-all duration-200 cursor-pointer shadow-xs active:scale-95 text-sm @md/hero:text-base font-medium"
                    >
                      LinkedIn
                    </Link>
                  )}
                  {profile.socialLinks.twitter && (
                    <Link
                      href={profile.socialLinks.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Twitter Profile"
                      className="px-4 py-2 @md/hero:px-5 @md/hero:py-2.5 rounded-xl border border-border bg-card/70 backdrop-blur-md hover:bg-card hover:border-primary/50 hover:text-primary transition-all duration-200 cursor-pointer shadow-xs active:scale-95 text-sm @md/hero:text-base font-medium"
                    >
                      Twitter
                    </Link>
                  )}
                  {profile.socialLinks.website && (
                    <Link
                      href={profile.socialLinks.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Personal Website"
                      className="px-4 py-2 @md/hero:px-5 @md/hero:py-2.5 rounded-xl border border-border bg-card/70 backdrop-blur-md hover:bg-card hover:border-primary/50 hover:text-primary transition-all duration-200 cursor-pointer shadow-xs active:scale-95 text-sm @md/hero:text-base font-medium"
                    >
                      Website
                    </Link>
                  )}
                </div>
              )}

              <div className="flex flex-wrap gap-4 @md/hero:gap-6 pt-2 text-xs @md/hero:text-sm text-muted-foreground">
                {profile.email && (
                  <div className="flex items-center gap-2">
                    <span>📧</span>
                    <span className="truncate">{profile.email}</span>
                  </div>
                )}
                {profile.location && (
                  <div className="flex items-center gap-2">
                    <span>📍</span>
                    <span>{profile.location}</span>
                  </div>
                )}
                {profile.availability && (
                  <div className="flex items-center gap-2">
                    <span>✅</span>
                    <span className="capitalize">{profile.availability.replace("-", " ")}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Profile Image Column */}
            <div className="flex justify-center lg:justify-end items-center w-full">
              <ProfileImage
                imageUrl={profile.profileImage || "/Sifat.png"}
                firstName={profile.firstName || ""}
                lastName={profile.lastName || ""}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
