"use server";

import {
  saveProfile,
  saveProject,
  saveSkill,
  saveExperience,
  saveEducation,
  saveCertification,
  saveAchievement,
  saveService,
  saveNavigationItem,
  saveSiteSettings,
  getProjects,
} from "./db-service";

export async function seedInitialDataIfEmpty() {
  const existingProjects = await getProjects();
  if (existingProjects && existingProjects.length > 0) {
    return { success: false, message: "Database already contains projects. Seeding skipped." };
  }

  // 1. Initial Skills
  const initialSkills = [
    { id: "skill_react", name: "React", category: "frontend", proficiency: "expert" as const, percentage: 95, color: "#61DAFB", order: 1 },
    { id: "skill_nextjs", name: "Next.js", category: "frontend", proficiency: "expert" as const, percentage: 92, color: "#000000", order: 2 },
    { id: "skill_typescript", name: "TypeScript", category: "frontend", proficiency: "advanced" as const, percentage: 90, color: "#3178C6", order: 3 },
    { id: "skill_tailwind", name: "Tailwind CSS", category: "frontend", proficiency: "expert" as const, percentage: 95, color: "#38B2AC", order: 4 },
    { id: "skill_nodejs", name: "Node.js", category: "backend", proficiency: "advanced" as const, percentage: 88, color: "#339933", order: 5 },
    { id: "skill_express", name: "Express.js", category: "backend", proficiency: "advanced" as const, percentage: 88, color: "#000000", order: 6 },
    { id: "skill_mongodb", name: "MongoDB", category: "database", proficiency: "advanced" as const, percentage: 85, color: "#47A248", order: 7 },
    { id: "skill_firebase", name: "Firebase", category: "backend", proficiency: "advanced" as const, percentage: 85, color: "#FFCA28", order: 8 },
    { id: "skill_ai", name: "Generative AI & LLMs", category: "ai-ml", proficiency: "advanced" as const, percentage: 82, color: "#8E44AD", order: 9 },
    { id: "skill_docker", name: "Docker", category: "devops", proficiency: "intermediate" as const, percentage: 75, color: "#2496ED", order: 10 },
  ];

  for (const skill of initialSkills) {
    await saveSkill(skill);
  }

  // 2. Initial Projects from public/Projects.json
  const initialProjects = [
    {
      id: "proj_kishorgonj",
      title: "Kishorgonj Keshba Fazil Madrasah",
      slug: "kishorgonj-keshba-fazil-madrasah",
      tagline: "Academic management and institutional portal with rich portal features.",
      coverImage: "https://i.ibb.co/rQWttcT/Clean-Shot-2024-08-20-at-02-47-25-2x.png",
      technologies: ["React", "Next.js", "TypeScript", "Tailwind CSS", "MongoDB", "Node.js"],
      category: "web-app",
      liveUrl: "https://www.kiskfmnil.edu.bd/",
      githubUrl: "https://github.com/sifat-99/Kishorgonj_Keshba_Fazil_Madrasha.git",
      featured: true,
      order: 1,
    },
    {
      id: "proj_singergari",
      title: "Singergari Jahuria Sharif High School",
      slug: "singergari-jahuria-sharif-high-school",
      tagline: "Full-scale educational portal combining academic management and student growth tracking.",
      coverImage: "https://i.ibb.co.com/S885V1w/Shot-2025-08-16-at-10-55-53-2x.png",
      technologies: ["React", "Next.js", "TypeScript", "Tailwind CSS", "MongoDB", "Express.js"],
      category: "web-app",
      liveUrl: "https://www.johuriashsnil.edu.bd/",
      githubUrl: "https://github.com/sifat-99/johuriashsnil.edu.git",
      featured: true,
      order: 2,
    },
    {
      id: "proj_meet_ready",
      title: "Meet Ready",
      slug: "meet-ready",
      tagline: "All-in-One Meeting Management Platform with Google Calendar & Zoom integration.",
      coverImage: "https://i.ibb.co/Tkx3348/Clean-Shot-2024-03-23-at-22-09-05-2x.png",
      technologies: ["React", "Next.js", "Tailwind CSS", "Firebase", "Google Calendar API"],
      category: "web-app",
      liveUrl: "https://meet-ready.vercel.app/",
      githubUrl: "https://github.com/SakifAzwad/Meet-Ready",
      featured: true,
      order: 3,
    },
    {
      id: "proj_bookwarp",
      title: "Bookwarp",
      slug: "bookwarp",
      tagline: "Community book exchange platform with chat, reviews, and interactive dashboard.",
      coverImage: "https://i.ibb.co/T0Bg9nV/Clean-Shot-2024-03-23-at-22-20-41-2x.png",
      technologies: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Firebase", "MongoDB"],
      category: "web-app",
      liveUrl: "https://bookwarp.vercel.app/",
      githubUrl: "https://github.com/dronatoo21/bookwarp-client/tree/main",
      featured: true,
      order: 4,
    },
    {
      id: "proj_relux",
      title: "Relux Pacific Hotel",
      slug: "relux-pacific",
      tagline: "Hotel reservation and luxury room booking suite with instant availability status.",
      coverImage: "https://i.ibb.co/2PY6vz9/Clean-Shot-2024-04-12-at-10-09-38.png",
      technologies: ["React", "Tailwind CSS", "Firebase", "MongoDB", "Express.js"],
      category: "web-app",
      liveUrl: "https://assignment-11-0004.web.app/",
      githubUrl: "https://github.com/sifat-99/Hotel-management-Client-Side",
      featured: true,
      order: 5,
    },
  ];

  for (const proj of initialProjects) {
    await saveProject(proj);
  }

  // 3. Navigation Links
  const navItems = [
    { id: "nav_1", title: "Home", href: "#home", icon: "IconHome", isExternal: false, order: 1 },
    { id: "nav_2", title: "About", href: "#about", icon: "IconUser", isExternal: false, order: 2 },
    { id: "nav_3", title: "Skills", href: "#skills", icon: "IconCode", isExternal: false, order: 3 },
    { id: "nav_4", title: "Experience", href: "#experience", icon: "IconBriefcase", isExternal: false, order: 4 },
    { id: "nav_5", title: "Projects", href: "#projects", icon: "IconRocket", isExternal: false, order: 5 },
    { id: "nav_6", title: "Contact", href: "#contact", icon: "IconMail", isExternal: false, order: 6 },
  ];

  for (const nav of navItems) {
    await saveNavigationItem(nav);
  }

  // 4. Site Settings
  await saveSiteSettings({
    id: "singleton-siteSettings",
    siteTitle: "MD: ABDUR RAHMAN SIFAT",
    siteDescription: "Full-Stack Developer & AI Solutions Engineer",
    showBlog: true,
    showServices: true,
    showTestimonials: true,
  });

  return { success: true, message: "Successfully seeded initial data!" };
}
