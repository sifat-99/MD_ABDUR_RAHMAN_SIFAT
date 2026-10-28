import Image from "next/image";
import { getExperiences } from "@/lib/db-service";

export async function ExperienceSection() {
  const experiences = await getExperiences();

  if (!experiences || experiences.length === 0) {
    return null;
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    });
  };

  return (
    <section id="experience" className="py-6 sm:py-8 md:py-10">
      <div className="w-full max-w-[2200px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 2xl:px-16">
        <div className="text-center mb-6 sm:mb-8 md:mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 sm:mb-3">
            Work Experience
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground">
            My professional journey
          </p>
        </div>

        <div className="space-y-6 sm:space-y-8 max-w-4xl lg:max-w-5xl mx-auto">
          {experiences.map((exp) => (
            <div
              key={exp.id || `${exp.company}-${exp.position}`}
              className="relative pl-0 sm:pl-8 pb-6 sm:pb-8 border-l-0 sm:border-l-2 border-muted sm:last:border-l-0"
            >
              {/* Timeline dot - Hidden on mobile, visible on tablet & desktop */}
              <div className="hidden sm:block absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-primary border-4 border-background" />

              <div className="@container/card bg-card border rounded-2xl p-5 @md/card:p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col @md/card:flex-row @md/card:items-start gap-4 mb-4">
                  {exp.companyLogo && (
                    <div className="relative w-12 h-12 @md/card:w-16 @md/card:h-16 rounded-lg overflow-hidden border shrink-0 bg-zinc-800">
                      <Image
                        src={exp.companyLogo}
                        alt={`${exp.company} company logo`}
                        fill
                        sizes="(max-width: 768px) 48px, 64px"
                        className="object-cover"
                      />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl @md/card:text-2xl font-semibold line-clamp-2">
                      {exp.position}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <p className="text-base @md/card:text-lg text-primary font-medium truncate">
                        {exp.company}
                      </p>
                      {exp.employmentType && (
                        <>
                          <span className="text-muted-foreground">•</span>
                          <span className="text-xs @md/card:text-sm text-muted-foreground capitalize">
                            {exp.employmentType}
                          </span>
                        </>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-2 text-xs @md/card:text-sm text-muted-foreground">
                      <span>
                        {exp.startDate && formatDate(exp.startDate)} -{" "}
                        {exp.current
                          ? "Present"
                          : exp.endDate
                            ? formatDate(exp.endDate)
                            : "N/A"}
                      </span>
                      {exp.location && (
                        <>
                          <span>•</span>
                          <span className="truncate">{exp.location}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {exp.description && (
                  <p className="text-muted-foreground mb-4 text-sm @md/card:text-base whitespace-pre-wrap">
                    {exp.description}
                  </p>
                )}

                {exp.responsibilities && exp.responsibilities.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-semibold mb-2 text-sm @md/card:text-base">
                      Key Responsibilities:
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground text-xs @md/card:text-sm">
                      {exp.responsibilities.map((resp, idx) => (
                        <li key={`${exp.id}-resp-${idx}`}>{resp}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {exp.technologies && exp.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 @md/card:gap-2 mt-4">
                    {exp.technologies.map((tech, techIdx) => (
                      <span
                        key={`${exp.id}-tech-${techIdx}`}
                        className="px-2 py-0.5 @md/card:px-3 @md/card:py-1 text-xs rounded-full bg-primary/10 text-primary"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
