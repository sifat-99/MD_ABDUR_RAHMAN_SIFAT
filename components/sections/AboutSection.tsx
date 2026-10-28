import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { getProfile } from "@/lib/db-service";

export async function AboutSection() {
  const profile = await getProfile();

  if (!profile) {
    return null;
  }

  return (
    <section id="about" className="py-6 sm:py-8 md:py-10">
      <div className="w-full max-w-[2200px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 2xl:px-16">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 sm:mb-3">About Me</h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground">Get to know me better</p>
        </div>

        <div>
          {profile.fullBio ? (
            <MarkdownRenderer content={profile.fullBio} />
          ) : (
            <p className="text-muted-foreground leading-relaxed">{profile.shortBio}</p>
          )}
        </div>

        {/* Stats */}
        {profile.stats && profile.stats.length > 0 && (
          <div className="@container mt-12 pt-12 border-t">
            <div className="grid grid-cols-2 @lg:grid-cols-4 gap-6">
              {profile.stats.map((stat, idx) => (
                <div
                  key={`${stat.label}-${idx}`}
                  className="@container/stat text-center"
                >
                  <div className="text-3xl @md/stat:text-4xl font-bold text-primary mb-2">
                    {stat.value}
                  </div>
                  <div className="text-xs @md/stat:text-sm text-muted-foreground">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
