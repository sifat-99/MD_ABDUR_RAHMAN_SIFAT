"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setSelectedProjectCategory, setProjectSearchTerm } from "@/store/slices/uiSlice";
import type { Project } from "@/types/portfolio";
import { Search, Layers } from "lucide-react";

interface ProjectsFilterableProps {
  initialProjects: Project[];
}

export function ProjectsFilterable({ initialProjects }: ProjectsFilterableProps) {
  const dispatch = useAppDispatch();
  const selectedCategory = useAppSelector((state) => state.ui.selectedProjectCategory);
  const searchTerm = useAppSelector((state) => state.ui.projectSearchTerm);

  // Extract unique categories dynamically
  const categories = useMemo(() => {
    const set = new Set<string>();
    initialProjects.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return ["all", ...Array.from(set)];
  }, [initialProjects]);

  // Filter projects by category and search keyword
  const filteredProjects = useMemo(() => {
    return initialProjects.filter((project) => {
      const matchesCategory =
        selectedCategory === "all" || project.category === selectedCategory;

      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        project.title.toLowerCase().includes(q) ||
        (project.tagline && project.tagline.toLowerCase().includes(q)) ||
        (project.technologies &&
          project.technologies.some((tech) => tech.toLowerCase().includes(q)));

      return matchesCategory && matchesSearch;
    });
  }, [initialProjects, selectedCategory, searchTerm]);

  return (
    <div className="space-y-8">
      {/* Search and Category Filter Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => dispatch(setSelectedProjectCategory(cat))}
                className={`px-4 py-1.5 rounded-full text-xs md:text-sm font-medium transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-105"
                    : "bg-background/60 backdrop-blur-md border border-border/50 text-muted-foreground hover:text-foreground hover:bg-muted/80"
                }`}
              >
                {cat === "all" ? "All Projects" : cat.replace("-", " ").toUpperCase()}
              </button>
            );
          })}
        </div>

        {/* Live Keyword Search Input */}
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search projects or tech..."
            value={searchTerm}
            onChange={(e) => dispatch(setProjectSearchTerm(e.target.value))}
            className="w-full pl-9 pr-3 py-1.5 rounded-full text-xs md:text-sm bg-background/60 backdrop-blur-md border border-border/50 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-16 bg-card/40 border border-dashed rounded-xl">
          <Layers className="w-10 h-10 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground text-sm">No projects matched your criteria.</p>
          <button
            onClick={() => {
              dispatch(setSelectedProjectCategory("all"));
              dispatch(setProjectSearchTerm(""));
            }}
            className="mt-3 text-xs text-primary hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="@container">
          <div className="grid grid-cols-1 @xl:grid-cols-2 @4xl:grid-cols-3 @7xl:grid-cols-4 2xl:grid-cols-4 3xl:grid-cols-5 gap-8">
            {filteredProjects.map((project) => (
              <div
                key={project.slug || project.id}
                className="@container/card group bg-card border rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Project Image */}
                  {project.coverImage && (
                    <div className="relative aspect-video overflow-hidden bg-muted">
                      <Image
                        src={project.coverImage}
                        alt={project.title || "Project image"}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-background/40 backdrop-blur-[2px] group-hover:opacity-0 transition-opacity duration-300" />
                    </div>
                  )}

                  {/* Project Content */}
                  <div className="p-4 @md/card:p-6 space-y-3 @md/card:space-y-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        {project.category && (
                          <span className="text-xs px-2 py-0.5 @md/card:py-1 rounded-full bg-primary/10 text-primary capitalize font-medium">
                            {project.category.replace("-", " ")}
                          </span>
                        )}
                        {project.featured && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 font-medium">
                            Featured
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg @md/card:text-xl font-semibold mb-2 line-clamp-2">
                        {project.title || "Untitled Project"}
                      </h3>
                      <p className="text-muted-foreground text-xs @md/card:text-sm line-clamp-2">
                        {project.tagline}
                      </p>
                    </div>

                    {/* Tech Stack */}
                    {project.technologies && project.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 @md/card:gap-2">
                        {project.technologies.slice(0, 5).map((tech, idx) => (
                          <span
                            key={`${project.id}-tech-${idx}`}
                            className="text-xs px-2 py-0.5 @md/card:py-1 rounded-md bg-muted"
                          >
                            {tech}
                          </span>
                        ))}
                        {project.technologies.length > 5 && (
                          <span className="text-xs px-2 py-0.5 @md/card:py-1 rounded-md bg-muted">
                            +{project.technologies.length - 5}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="p-4 @md/card:p-6 pt-0">
                  <div className="flex flex-col @xs/card:flex-row gap-2 @xs/card:gap-3 pt-2 border-t border-border/40">
                    {project.liveUrl && (
                      <Link
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 text-center px-3 py-2 @md/card:px-4 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-xs @md/card:text-sm font-medium"
                      >
                        Live Demo
                      </Link>
                    )}
                    {project.githubUrl && (
                      <Link
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 @md/card:px-4 rounded-lg border hover:bg-accent transition-colors text-xs @md/card:text-sm text-center"
                      >
                        GitHub
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
