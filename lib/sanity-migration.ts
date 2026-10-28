"use server";

import { createClient } from "@sanity/client";
import {
  saveProfile,
  saveProject,
  saveSkill,
  saveService,
  saveExperience,
  saveEducation,
  saveCertification,
  saveAchievement,
  saveBlog,
  saveTestimonial,
  saveContact,
  saveNavigationItem,
  saveSiteSettings,
} from "./db-service";
import type {
  Profile,
  Project,
  Skill,
  Service,
  Experience,
  Education,
  Certification,
  Achievement,
  Blog,
  Testimonial,
  NavigationItem,
  SiteSettings,
} from "@/types/portfolio";

function blocksToText(blocks: any): string {
  if (!blocks) return "";
  if (typeof blocks === "string") return blocks;
  if (!Array.isArray(blocks)) return "";
  return blocks
    .map((block) => {
      if (block._type !== "block" || !block.children) {
        return "";
      }
      return block.children.map((child: any) => child.text).join("");
    })
    .join("\n\n");
}

export async function migrateFromSanity(): Promise<{
  success: boolean;
  message: string;
  counts: Record<string, number>;
}> {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
  const token = process.env.SANITY_SERVER_API_TOKEN;

  if (!projectId) {
    return {
      success: false,
      message: "NEXT_PUBLIC_SANITY_PROJECT_ID is not configured in .env.local",
      counts: {},
    };
  }

  const client = createClient({
    projectId,
    dataset,
    apiVersion: "2024-01-01",
    token,
    useCdn: false,
  });

  const counts: Record<string, number> = {
    profile: 0,
    projects: 0,
    skills: 0,
    services: 0,
    experiences: 0,
    educations: 0,
    certifications: 0,
    achievements: 0,
    blogs: 0,
    testimonials: 0,
    contacts: 0,
    navigation: 0,
    siteSettings: 0,
  };

  try {
    // 1. PROFILE
    const sanityProfile = await client.fetch(
      `*[_type == "profile"][0]{
        ...,
        "profileImageUrl": profileImage.asset->url,
        "resumeUrl": resume.asset->url
      }`
    );

    if (sanityProfile) {
      const fullBioText = blocksToText(sanityProfile.fullBio);
      const mappedProfile: Profile = {
        id: "singleton-profile",
        firstName: sanityProfile.firstName || "Md. Abdur Rahman",
        lastName: sanityProfile.lastName || "Sifat",
        headline: sanityProfile.headline || "Full-Stack Developer",
        headlineStaticText: sanityProfile.headlineStaticText || "I build",
        headlineAnimatedWords: sanityProfile.headlineAnimatedWords || [
          "Web Apps",
          "AI Solutions",
          "Mobile Apps",
        ],
        headlineAnimationDuration:
          sanityProfile.headlineAnimationDuration || 3000,
        shortBio: sanityProfile.shortBio || fullBioText.slice(0, 180) || "",
        fullBio: fullBioText,
        email: sanityProfile.email || "mdabdurrahmansifat@gmail.com",
        phone: sanityProfile.phone || "+8801521788920",
        location: sanityProfile.location || "Dhaka, Bangladesh",
        availability: sanityProfile.availability || "available",
        socialLinks: sanityProfile.socialLinks || {
          github: "https://github.com/sifat-99",
          linkedin: "https://linkedin.com/in/sifatmollah",
          website: "https://sifat.online",
        },
        yearsOfExperience: sanityProfile.yearsOfExperience || 3,
        stats: sanityProfile.stats?.map((s: any) => ({
          label: s.label,
          value: s.value,
        })) || [
          { label: "Completed Projects", value: "20+" },
          { label: "Client Satisfaction", value: "100%" },
          { label: "Years Experience", value: "2+" },
        ],
        profileImage: sanityProfile.profileImageUrl || undefined,
      };

      await saveProfile(mappedProfile);
      counts.profile = 1;
    }

    // 2. PROJECTS
    const sanityProjects = await client.fetch(
      `*[_type == "project"]{
        _id,
        title,
        "slug": slug.current,
        tagline,
        "coverImage": coverImage.asset->url,
        category,
        "technologies": technologies[]->name,
        liveUrl,
        githubUrl,
        featured,
        order
      }`
    );

    for (const p of sanityProjects || []) {
      const mappedProject: Project = {
        id: p._id,
        title: p.title || "Untitled Project",
        slug: p.slug || p._id,
        tagline: p.tagline || "",
        coverImage: p.coverImage || "",
        technologies: p.technologies || [],
        category: p.category || "web-app",
        liveUrl: p.liveUrl || "",
        githubUrl: p.githubUrl || "",
        featured: Boolean(p.featured),
        order: Number(p.order ?? 0),
      };
      await saveProject(mappedProject);
      counts.projects++;
    }

    // 3. SKILLS
    const sanitySkills = await client.fetch(
      `*[_type == "skill"]{
        _id,
        name,
        category,
        proficiency,
        percentage,
        yearsOfExperience,
        color,
        order
      }`
    );

    for (const s of sanitySkills || []) {
      const mappedSkill: Skill = {
        id: s._id,
        name: s.name,
        category: s.category || "frontend",
        proficiency: s.proficiency || "advanced",
        percentage: Number(s.percentage ?? 80),
        yearsOfExperience: s.yearsOfExperience ? Number(s.yearsOfExperience) : undefined,
        color: s.color || "#6366f1",
        order: Number(s.order ?? 0),
      };
      await saveSkill(mappedSkill);
      counts.skills++;
    }

    // 4. EXPERIENCES
    const sanityExperiences = await client.fetch(
      `*[_type == "experience"]{
        _id,
        company,
        position,
        employmentType,
        location,
        startDate,
        endDate,
        "isCurrent": current,
        description,
        responsibilities,
        achievements,
        "technologies": technologies[]->name,
        order
      }`
    );

    for (const exp of sanityExperiences || []) {
      const mappedExp: Experience = {
        id: exp._id,
        company: exp.company || "",
        position: exp.position || "",
        employmentType: exp.employmentType || "full-time",
        location: exp.location || "Remote",
        startDate: exp.startDate || new Date().toISOString(),
        endDate: exp.endDate || undefined,
        current: Boolean(exp.isCurrent),
        description: blocksToText(exp.description),
        responsibilities: exp.responsibilities || [],
        achievements: exp.achievements || [],
        technologies: exp.technologies || [],
        order: Number(exp.order ?? 0),
      };
      await saveExperience(mappedExp);
      counts.experiences++;
    }

    // 5. EDUCATIONS
    const sanityEducations = await client.fetch(
      `*[_type == "education"]{
        _id,
        institution,
        degree,
        fieldOfStudy,
        startDate,
        endDate,
        "isCurrent": current,
        "grade": gpa,
        description,
        order
      }`
    );

    for (const edu of sanityEducations || []) {
      const mappedEdu: Education = {
        id: edu._id,
        institution: edu.institution || "",
        degree: edu.degree || "",
        fieldOfStudy: edu.fieldOfStudy || "",
        startDate: edu.startDate || new Date().toISOString(),
        endDate: edu.endDate || undefined,
        current: Boolean(edu.isCurrent),
        gpa: edu.grade || undefined,
        description: typeof edu.description === "string" ? edu.description : blocksToText(edu.description),
        order: Number(edu.order ?? 0),
      };
      await saveEducation(mappedEdu);
      counts.educations++;
    }

    // 6. CERTIFICATIONS
    const sanityCertifications = await client.fetch(
      `*[_type == "certification"]{
        _id,
        name,
        issuer,
        issueDate,
        expiryDate,
        credentialId,
        credentialUrl,
        description,
        "logo": logo.asset->url,
        order
      }`
    );

    for (const cert of sanityCertifications || []) {
      const mappedCert: Certification = {
        id: cert._id,
        name: cert.name || "",
        issuer: cert.issuer || "",
        issueDate: cert.issueDate || new Date().toISOString(),
        expiryDate: cert.expiryDate || undefined,
        credentialId: cert.credentialId || undefined,
        credentialUrl: cert.credentialUrl || undefined,
        description: cert.description || "",
        logo: cert.logo || undefined,
        order: Number(cert.order ?? 0),
      };
      await saveCertification(mappedCert);
      counts.certifications++;
    }

    // 7. ACHIEVEMENTS
    const sanityAchievements = await client.fetch(
      `*[_type == "achievement"]{
        _id,
        title,
        organization,
        date,
        description,
        awardUrl,
        order
      }`
    );

    for (const ach of sanityAchievements || []) {
      const mappedAch: Achievement = {
        id: ach._id,
        title: ach.title || "",
        type: "award",
        issuer: ach.organization || undefined,
        date: ach.date || new Date().toISOString(),
        description: typeof ach.description === "string" ? ach.description : blocksToText(ach.description),
        url: ach.awardUrl || undefined,
        order: Number(ach.order ?? 0),
      };
      await saveAchievement(mappedAch);
      counts.achievements++;
    }

    // 8. SERVICES
    const sanityServices = await client.fetch(
      `*[_type == "service"]{
        _id,
        title,
        "slug": slug.current,
        shortDescription,
        fullDescription,
        "icon": icon.asset->url,
        features,
        order
      }`
    );

    for (const srv of sanityServices || []) {
      const mappedSrv: Service = {
        id: srv._id,
        title: srv.title || "",
        slug: srv.slug || srv._id,
        shortDescription: srv.shortDescription || "",
        fullDescription: blocksToText(srv.fullDescription),
        icon: srv.icon || "IconCode",
        features: srv.features || [],
        order: Number(srv.order ?? 0),
      };
      await saveService(mappedSrv);
      counts.services++;
    }

    // 9. BLOGS
    const sanityBlogs = await client.fetch(
      `*[_type in ["blog", "post"]]{
        _id,
        title,
        "slug": slug.current,
        excerpt,
        content,
        publishedAt,
        "coverImage": mainImage.asset->url,
        readTime,
        canonicalUrl
      }`
    );

    for (const b of sanityBlogs || []) {
      const mappedBlog: Blog = {
        id: b._id,
        title: b.title || "",
        slug: b.slug || b._id,
        excerpt: b.excerpt || "",
        content: blocksToText(b.content),
        publishedAt: b.publishedAt || new Date().toISOString(),
        featuredImage: b.coverImage || undefined,
        readTime: Number(b.readTime ?? 5),
      };
      await saveBlog(mappedBlog);
      counts.blogs++;
    }

    // 10. TESTIMONIALS
    const sanityTestimonials = await client.fetch(
      `*[_type == "testimonial"]{
        _id,
        clientName,
        clientRole,
        company,
        content,
        rating,
        "avatar": avatar.asset->url,
        featured,
        order
      }`
    );

    for (const t of sanityTestimonials || []) {
      const mappedTest: Testimonial = {
        id: t._id,
        name: t.clientName || "Client",
        position: t.clientRole || "Client",
        company: t.company || "",
        testimonial: t.content || "",
        rating: Number(t.rating ?? 5),
        avatar: t.avatar || undefined,
        featured: Boolean(t.featured),
        order: Number(t.order ?? 0),
      };
      await saveTestimonial(mappedTest);
      counts.testimonials++;
    }

    // 11. CONTACTS
    const sanityContacts = await client.fetch(
      `*[_type == "contact"]{
        _id,
        name,
        email,
        subject,
        message,
        submittedAt,
        status
      }`
    );

    for (const c of sanityContacts || []) {
      await saveContact({
        name: c.name || "Anonymous",
        email: c.email || "no-email@provided.com",
        subject: c.subject || "Message from Portfolio",
        message: c.message || "",
      });
      counts.contacts++;
    }

    // 12. NAVIGATION
    const sanityNavigation = await client.fetch(
      `*[_type == "navigation"]{
        _id,
        title,
        href,
        icon,
        isExternal,
        order
      }`
    );

    for (const nav of sanityNavigation || []) {
      const mappedNav: NavigationItem = {
        id: nav._id,
        title: nav.title || "",
        href: nav.href || "#",
        icon: nav.icon || "IconHome",
        isExternal: Boolean(nav.isExternal),
        order: Number(nav.order ?? 0),
      };
      await saveNavigationItem(mappedNav);
      counts.navigation++;
    }

    // 13. SITE SETTINGS
    const sanitySettings = await client.fetch(
      `*[_type == "siteSettings"][0]{
        _id,
        siteTitle,
        siteDescription,
        siteKeywords,
        "siteLogo": siteLogo.asset->url,
        "favicon": favicon.asset->url,
        "ogImage": ogImage.asset->url,
        maintenanceMode,
        showBlog,
        showServices,
        showTestimonials
      }`
    );

    if (sanitySettings) {
      const mappedSettings: SiteSettings = {
        id: "singleton-siteSettings",
        siteTitle: sanitySettings.siteTitle || "MD: ABDUR RAHMAN SIFAT",
        siteDescription: sanitySettings.siteDescription || "",
        siteKeywords: sanitySettings.siteKeywords || [],
        siteLogo: sanitySettings.siteLogo || undefined,
        favicon: sanitySettings.favicon || undefined,
        ogImage: sanitySettings.ogImage || undefined,
        maintenanceMode: Boolean(sanitySettings.maintenanceMode),
        showBlog: sanitySettings.showBlog ?? true,
        showServices: sanitySettings.showServices ?? true,
        showTestimonials: sanitySettings.showTestimonials ?? true,
        allowedAdmins: ["mdabdurrahmansifat@gmail.com"],
      };
      await saveSiteSettings(mappedSettings);
      counts.siteSettings = 1;
    }

    return {
      success: true,
      message: `Successfully migrated all content from Sanity to Firebase and MongoDB!`,
      counts,
    };
  } catch (error: any) {
    console.error("Sanity migration error:", error);
    return {
      success: false,
      message: error.message || "Failed to migrate from Sanity.",
      counts,
    };
  }
}
