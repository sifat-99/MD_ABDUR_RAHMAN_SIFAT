import { getSkills } from "@/lib/db-service";
import { SkillsChart } from "./SkillsChart";

export async function SkillsSection() {
  const skills = await getSkills();

  if (!skills || skills.length === 0) {
    return null;
  }

  return (
    <section id="skills" className="py-6 sm:py-8 md:py-10 bg-muted/30">
      <div className="w-full max-w-[2200px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 2xl:px-16">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 sm:mb-3">
            Skills & Expertise
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A comprehensive overview of my technical proficiencies and tools I
            work with daily
          </p>
        </div>

        <SkillsChart skills={skills} />
      </div>
    </section>
  );
}
