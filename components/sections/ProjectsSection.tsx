import { getProjects } from "@/lib/db-service";
import { ProjectsFilterable } from "./ProjectsFilterable";

export async function ProjectsSection() {
  const allProjects = await getProjects();

  if (!allProjects || allProjects.length === 0) {
    return null;
  }

  return (
    <section id="projects" className="py-6 sm:py-8 md:py-10 bg-muted/30">
      <div className="w-full max-w-[2200px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 2xl:px-16">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 sm:mb-3">
            Featured Projects
          </h2>
          <p className="text-xl text-muted-foreground">Some of my best work</p>
        </div>

        <ProjectsFilterable initialProjects={allProjects} />
      </div>
    </section>
  );
}
