"use server";

import { connectToDatabase } from "./mongodb";
import {
  MongoProfile,
  MongoProject,
  MongoSkill,
  MongoExperience,
  MongoEducation,
  MongoCertification,
  MongoAchievement,
  MongoBlog,
  MongoService,
  MongoTestimonial,
  MongoContactSubmission,
  MongoNavigationItem,
  MongoSiteSettings,
  MongoDraftDocument,
  MongoDraftHistory,
} from "@/models";
import type {
  Profile,
  Project,
  Skill,
  Experience,
  Education,
  Certification,
  Achievement,
  Blog,
  Service,
  Testimonial,
  ContactSubmission,
  NavigationItem,
  SiteSettings,
  DraftHistoryItem,
} from "@/types/portfolio";

// Helper: Convert Firebase object (keyed by ID) to Array
function objectToArray<T>(data: Record<string, T> | null): T[] {
  if (!data) return [];
  return Object.values(data);
}

// Helper: Guarantee pure plain JSON object for Next.js Client Component serialization
function toPlainObject<T>(data: T): T {
  if (!data) return data;
  return JSON.parse(JSON.stringify(data));
}

// -------------------------------------------------------------
// Firebase Realtime Database Stateless REST Client
// Avoids long-polling stream leaks, 50MB Undici limits, and socket timeouts on Node.js
// -------------------------------------------------------------
const RTDB_URL = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL?.replace(/\/$/, "");
const RTDB_SECRET = process.env.FIREBASE_DATABASE_SECRET;

function getRtdbEndpoint(path: string): string {
  if (!RTDB_URL) return "";
  const cleanPath = path.replace(/^\//, "");
  const base = `${RTDB_URL}/${cleanPath}.json`;
  return RTDB_SECRET ? `${base}?auth=${RTDB_SECRET}` : base;
}

async function fbGet<T>(path: string): Promise<T | null> {
  const url = getRtdbEndpoint(path);
  if (!url) return null;
  try {
    const res = await fetch(url, {
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) {
      if (res.status === 401) {
        console.warn(`[Firebase RTDB] 401 Permission Denied on GET /${path}. Check Firebase Security Rules.`);
      }
      return null;
    }
    const data = await res.json();
    if (!data || data.error) return null;
    return data as T;
  } catch {
    return null;
  }
}

async function fbSet<T>(path: string, data: T): Promise<boolean> {
  const url = getRtdbEndpoint(path);
  if (!url) return false;
  try {
    const res = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      if (res.status === 401) {
        console.warn(`[Firebase RTDB] 401 Permission Denied on PUT /${path}. Check Firebase Security Rules.`);
      }
      return false;
    }
    return true;
  } catch (err) {
    console.error(`[Firebase RTDB] Network error on PUT /${path}:`, err);
    return false;
  }
}

async function fbUpdate<T>(path: string, updates: T): Promise<boolean> {
  const url = getRtdbEndpoint(path);
  if (!url) return false;
  try {
    const res = await fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function fbRemove(path: string): Promise<boolean> {
  const url = getRtdbEndpoint(path);
  if (!url) return false;
  try {
    const res = await fetch(url, {
      method: "DELETE",
    });
    return res.ok;
  } catch {
    return false;
  }
}

// -------------------------------------------------------------
// 1. PROFILE (Singleton)
// -------------------------------------------------------------
export async function getProfile(): Promise<Profile | null> {
  try {
    // 1. Try Firebase REST
    const fbData = await fbGet<Profile>("profile/singleton-profile");
    if (fbData) return toPlainObject(fbData);

    // 2. Fallback to MongoDB
    await connectToDatabase();
    const doc = await MongoProfile.findOne({ id: "singleton-profile" }).lean();
    if (doc) {
      const { _id, __v, createdAt, updatedAt, ...rest } = toPlainObject(doc) as any;
      return rest as Profile;
    }
  } catch (error) {
    console.error("Error fetching profile:", error);
  }

  // Default initial profile
  return {
    id: "singleton-profile",
    firstName: "Md. Abdur Rahman",
    lastName: "Sifat",
    headline: "Full-Stack Developer & AI Engineer",
    headlineStaticText: "I build",
    headlineAnimatedWords: ["Web Apps", "AI Solutions", "Full-Stack Systems", "Scalable APIs"],
    headlineAnimationDuration: 3000,
    shortBio: "Passionate Full-Stack Developer specializing in modern web applications, scalable backends, and AI integrations.",
    email: "mdabdurrahmansifat@gmail.com",
    phone: "+8801521788920",
    location: "Dhaka, Bangladesh",
    availability: "available",
    socialLinks: {
      github: "https://github.com/sifat-99",
      linkedin: "https://www.linkedin.com/in/sifatmollah/",
      website: "https://mdabdurrahmansifat.vercel.app/",
    },
    yearsOfExperience: 3,
    stats: [
      { label: "Completed Projects", value: "30+" },
      { label: "Satisfied Clients", value: "100%" },
      { label: "Years Experience", value: "3+" },
      { label: "Availability", value: "24/7" },
    ],
  };
}

export async function saveProfile(data: Profile): Promise<boolean> {
  const profileData = { ...data, id: "singleton-profile" };

  const fbPromise = fbSet("profile/singleton-profile", profileData);
  const mongoPromise = (async () => {
    await connectToDatabase();
    await MongoProfile.findOneAndUpdate(
      { id: "singleton-profile" },
      profileData,
      { upsert: true, returnDocument: 'after' }
    );
  })();

  await Promise.allSettled([fbPromise, mongoPromise]);
  return true;
}

// -------------------------------------------------------------
// 2. PROJECTS
// -------------------------------------------------------------
export async function getProjects(): Promise<Project[]> {
  try {
    const fbData = await fbGet<Record<string, Project>>("projects");
    if (fbData) {
      const list = objectToArray<Project>(fbData);
      if (list.length > 0) {
        return list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      }
    }

    await connectToDatabase();
    const docs = await MongoProject.find().sort({ order: 1 }).lean();
    if (docs && docs.length > 0) {
      return docs.map(({ _id, __v, createdAt, updatedAt, ...rest }: any) => rest as Project);
    }
  } catch (error) {
    console.error("Error fetching projects:", error);
  }
  return [];
}

export async function saveProject(data: Project): Promise<boolean> {
  const id = data.id || `proj_${Date.now()}`;
  const payload = { ...data, id };

  const fbPromise = fbSet(`projects/${id}`, payload);
  const mongoPromise = (async () => {
    await connectToDatabase();
    await MongoProject.findOneAndUpdate({ id }, payload, { upsert: true, returnDocument: 'after' });
  })();

  await Promise.allSettled([fbPromise, mongoPromise]);
  return true;
}

export async function deleteProject(id: string): Promise<boolean> {
  const fbPromise = fbRemove(`projects/${id}`);
  const mongoPromise = (async () => {
    await connectToDatabase();
    await MongoProject.deleteOne({ id });
  })();

  await Promise.allSettled([fbPromise, mongoPromise]);
  return true;
}

// -------------------------------------------------------------
// 3. SKILLS
// -------------------------------------------------------------
export async function getSkills(): Promise<Skill[]> {
  try {
    const fbData = await fbGet<Record<string, Skill>>("skills");
    if (fbData) {
      const list = objectToArray<Skill>(fbData);
      if (list.length > 0) {
        return list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      }
    }

    await connectToDatabase();
    const docs = await MongoSkill.find().sort({ category: 1, order: 1 }).lean();
    if (docs && docs.length > 0) {
      return docs.map(({ _id, __v, createdAt, updatedAt, ...rest }: any) => rest as Skill);
    }
  } catch (error) {
    console.error("Error fetching skills:", error);
  }
  return [];
}

export async function saveSkill(data: Skill): Promise<boolean> {
  const id = data.id || `skill_${Date.now()}`;
  const payload = { ...data, id };

  const fbPromise = fbSet(`skills/${id}`, payload);
  const mongoPromise = (async () => {
    await connectToDatabase();
    await MongoSkill.findOneAndUpdate({ id }, payload, { upsert: true, returnDocument: 'after' });
  })();

  await Promise.allSettled([fbPromise, mongoPromise]);
  return true;
}

export async function deleteSkill(id: string): Promise<boolean> {
  const fbPromise = fbRemove(`skills/${id}`);
  const mongoPromise = (async () => {
    await connectToDatabase();
    await MongoSkill.deleteOne({ id });
  })();

  await Promise.allSettled([fbPromise, mongoPromise]);
  return true;
}

// -------------------------------------------------------------
// 4. EXPERIENCES
// -------------------------------------------------------------
export async function getExperiences(): Promise<Experience[]> {
  try {
    const fbData = await fbGet<Record<string, Experience>>("experiences");
    if (fbData) {
      const list = objectToArray<Experience>(fbData);
      if (list.length > 0) {
        return list.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
      }
    }

    await connectToDatabase();
    const docs = await MongoExperience.find().sort({ startDate: -1 }).lean();
    if (docs && docs.length > 0) {
      return docs.map(({ _id, __v, createdAt, updatedAt, ...rest }: any) => rest as Experience);
    }
  } catch (error) {
    console.error("Error fetching experiences:", error);
  }
  return [];
}

export async function saveExperience(data: Experience): Promise<boolean> {
  const id = data.id || `exp_${Date.now()}`;
  const payload = { ...data, id };

  const fbPromise = fbSet(`experiences/${id}`, payload);
  const mongoPromise = (async () => {
    await connectToDatabase();
    await MongoExperience.findOneAndUpdate({ id }, payload, { upsert: true, returnDocument: 'after' });
  })();

  await Promise.allSettled([fbPromise, mongoPromise]);
  return true;
}

export async function deleteExperience(id: string): Promise<boolean> {
  const fbPromise = fbRemove(`experiences/${id}`);
  const mongoPromise = (async () => {
    await connectToDatabase();
    await MongoExperience.deleteOne({ id });
  })();

  await Promise.allSettled([fbPromise, mongoPromise]);
  return true;
}

// -------------------------------------------------------------
// 5. EDUCATION
// -------------------------------------------------------------
export async function getEducations(): Promise<Education[]> {
  try {
    const fbData = await fbGet<Record<string, Education>>("educations");
    if (fbData) {
      const list = objectToArray<Education>(fbData);
      if (list.length > 0) {
        return list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      }
    }

    await connectToDatabase();
    const docs = await MongoEducation.find().sort({ order: 1 }).lean();
    if (docs && docs.length > 0) {
      return docs.map(({ _id, __v, createdAt, updatedAt, ...rest }: any) => rest as Education);
    }
  } catch (error) {
    console.error("Error fetching education:", error);
  }
  return [];
}

export async function saveEducation(data: Education): Promise<boolean> {
  const id = data.id || `edu_${Date.now()}`;
  const payload = { ...data, id };

  const fbPromise = fbSet(`educations/${id}`, payload);
  const mongoPromise = (async () => {
    await connectToDatabase();
    await MongoEducation.findOneAndUpdate({ id }, payload, { upsert: true, returnDocument: 'after' });
  })();

  await Promise.allSettled([fbPromise, mongoPromise]);
  return true;
}

export async function deleteEducation(id: string): Promise<boolean> {
  const fbPromise = fbRemove(`educations/${id}`);
  const mongoPromise = (async () => {
    await connectToDatabase();
    await MongoEducation.deleteOne({ id });
  })();

  await Promise.allSettled([fbPromise, mongoPromise]);
  return true;
}

// -------------------------------------------------------------
// 6. CERTIFICATIONS
// -------------------------------------------------------------
export async function getCertifications(): Promise<Certification[]> {
  try {
    const fbData = await fbGet<Record<string, Certification>>("certifications");
    if (fbData) {
      const list = objectToArray<Certification>(fbData);
      if (list.length > 0) {
        return list.sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime());
      }
    }

    await connectToDatabase();
    const docs = await MongoCertification.find().sort({ issueDate: -1 }).lean();
    if (docs && docs.length > 0) {
      return docs.map(({ _id, __v, createdAt, updatedAt, ...rest }: any) => rest as Certification);
    }
  } catch (error) {
    console.error("Error fetching certifications:", error);
  }
  return [];
}

export async function saveCertification(data: Certification): Promise<boolean> {
  const id = data.id || `cert_${Date.now()}`;
  const payload = { ...data, id };

  const fbPromise = fbSet(`certifications/${id}`, payload);
  const mongoPromise = (async () => {
    await connectToDatabase();
    await MongoCertification.findOneAndUpdate({ id }, payload, { upsert: true, returnDocument: 'after' });
  })();

  await Promise.allSettled([fbPromise, mongoPromise]);
  return true;
}

export async function deleteCertification(id: string): Promise<boolean> {
  const fbPromise = fbRemove(`certifications/${id}`);
  const mongoPromise = (async () => {
    await connectToDatabase();
    await MongoCertification.deleteOne({ id });
  })();

  await Promise.allSettled([fbPromise, mongoPromise]);
  return true;
}

// -------------------------------------------------------------
// 7. ACHIEVEMENTS
// -------------------------------------------------------------
export async function getAchievements(): Promise<Achievement[]> {
  try {
    const fbData = await fbGet<Record<string, Achievement>>("achievements");
    if (fbData) {
      const list = objectToArray<Achievement>(fbData);
      if (list.length > 0) {
        return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      }
    }

    await connectToDatabase();
    const docs = await MongoAchievement.find().sort({ date: -1 }).lean();
    if (docs && docs.length > 0) {
      return docs.map(({ _id, __v, createdAt, updatedAt, ...rest }: any) => rest as Achievement);
    }
  } catch (error) {
    console.error("Error fetching achievements:", error);
  }
  return [];
}

export async function saveAchievement(data: Achievement): Promise<boolean> {
  const id = data.id || `ach_${Date.now()}`;
  const payload = { ...data, id };

  const fbPromise = fbSet(`achievements/${id}`, payload);
  const mongoPromise = (async () => {
    await connectToDatabase();
    await MongoAchievement.findOneAndUpdate({ id }, payload, { upsert: true, returnDocument: 'after' });
  })();

  await Promise.allSettled([fbPromise, mongoPromise]);
  return true;
}

export async function deleteAchievement(id: string): Promise<boolean> {
  const fbPromise = fbRemove(`achievements/${id}`);
  const mongoPromise = (async () => {
    await connectToDatabase();
    await MongoAchievement.deleteOne({ id });
  })();

  await Promise.allSettled([fbPromise, mongoPromise]);
  return true;
}

// -------------------------------------------------------------
// 8. BLOGS
// -------------------------------------------------------------
export async function getBlogs(): Promise<Blog[]> {
  try {
    const fbData = await fbGet<Record<string, Blog>>("blogs");
    if (fbData) {
      const list = objectToArray<Blog>(fbData);
      if (list.length > 0) {
        return list.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
      }
    }

    await connectToDatabase();
    const docs = await MongoBlog.find().sort({ publishedAt: -1 }).lean();
    if (docs && docs.length > 0) {
      return docs.map(({ _id, __v, createdAt, updatedAt, ...rest }: any) => rest as Blog);
    }
  } catch (error) {
    console.error("Error fetching blogs:", error);
  }
  return [];
}

export async function saveBlog(data: Blog): Promise<boolean> {
  const id = data.id || `blog_${Date.now()}`;
  const payload = { ...data, id };

  const fbPromise = fbSet(`blogs/${id}`, payload);
  const mongoPromise = (async () => {
    await connectToDatabase();
    await MongoBlog.findOneAndUpdate({ id }, payload, { upsert: true, returnDocument: 'after' });
  })();

  await Promise.allSettled([fbPromise, mongoPromise]);
  return true;
}

export async function deleteBlog(id: string): Promise<boolean> {
  const fbPromise = fbRemove(`blogs/${id}`);
  const mongoPromise = (async () => {
    await connectToDatabase();
    await MongoBlog.deleteOne({ id });
  })();

  await Promise.allSettled([fbPromise, mongoPromise]);
  return true;
}

// -------------------------------------------------------------
// 9. SERVICES
// -------------------------------------------------------------
export async function getServices(): Promise<Service[]> {
  try {
    const fbData = await fbGet<Record<string, Service>>("services");
    if (fbData) {
      const list = objectToArray<Service>(fbData);
      if (list.length > 0) {
        return list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      }
    }

    await connectToDatabase();
    const docs = await MongoService.find().sort({ order: 1 }).lean();
    if (docs && docs.length > 0) {
      return docs.map(({ _id, __v, createdAt, updatedAt, ...rest }: any) => rest as Service);
    }
  } catch (error) {
    console.error("Error fetching services:", error);
  }
  return [];
}

export async function saveService(data: Service): Promise<boolean> {
  const id = data.id || `srv_${Date.now()}`;
  const payload = { ...data, id };

  const fbPromise = fbSet(`services/${id}`, payload);
  const mongoPromise = (async () => {
    await connectToDatabase();
    await MongoService.findOneAndUpdate({ id }, payload, { upsert: true, returnDocument: 'after' });
  })();

  await Promise.allSettled([fbPromise, mongoPromise]);
  return true;
}

export async function deleteService(id: string): Promise<boolean> {
  const fbPromise = fbRemove(`services/${id}`);
  const mongoPromise = (async () => {
    await connectToDatabase();
    await MongoService.deleteOne({ id });
  })();

  await Promise.allSettled([fbPromise, mongoPromise]);
  return true;
}

// -------------------------------------------------------------
// 10. TESTIMONIALS
// -------------------------------------------------------------
export async function getTestimonials(): Promise<Testimonial[]> {
  try {
    const fbData = await fbGet<Record<string, Testimonial>>("testimonials");
    if (fbData) {
      const list = objectToArray<Testimonial>(fbData);
      if (list.length > 0) {
        return list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      }
    }

    await connectToDatabase();
    const docs = await MongoTestimonial.find().sort({ order: 1 }).lean();
    if (docs && docs.length > 0) {
      return docs.map(({ _id, __v, createdAt, updatedAt, ...rest }: any) => rest as Testimonial);
    }
  } catch (error) {
    console.error("Error fetching testimonials:", error);
  }
  return [];
}

export async function saveTestimonial(data: Testimonial): Promise<boolean> {
  const id = data.id || `test_${Date.now()}`;
  const payload = { ...data, id };

  const fbPromise = fbSet(`testimonials/${id}`, payload);
  const mongoPromise = (async () => {
    await connectToDatabase();
    await MongoTestimonial.findOneAndUpdate({ id }, payload, { upsert: true, returnDocument: 'after' });
  })();

  await Promise.allSettled([fbPromise, mongoPromise]);
  return true;
}

export async function deleteTestimonial(id: string): Promise<boolean> {
  const fbPromise = fbRemove(`testimonials/${id}`);
  const mongoPromise = (async () => {
    await connectToDatabase();
    await MongoTestimonial.deleteOne({ id });
  })();

  await Promise.allSettled([fbPromise, mongoPromise]);
  return true;
}

// -------------------------------------------------------------
// 11. CONTACT SUBMISSIONS
// -------------------------------------------------------------
export async function getContacts(): Promise<ContactSubmission[]> {
  try {
    const fbData = await fbGet<Record<string, ContactSubmission>>("contacts");
    if (fbData) {
      const list = objectToArray<ContactSubmission>(fbData);
      if (list.length > 0) {
        return list.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
      }
    }

    await connectToDatabase();
    const docs = await MongoContactSubmission.find().sort({ submittedAt: -1 }).lean();
    if (docs && docs.length > 0) {
      return docs.map(({ _id, __v, createdAt, updatedAt, ...rest }: any) => rest as ContactSubmission);
    }
  } catch (error) {
    console.error("Error fetching contacts:", error);
  }
  return [];
}

export async function saveContact(data: Omit<ContactSubmission, "id" | "submittedAt" | "status">): Promise<ContactSubmission> {
  const id = `contact_${Date.now()}`;
  const submission: ContactSubmission = {
    ...data,
    id,
    submittedAt: new Date().toISOString(),
    status: "new",
  };

  const fbPromise = fbSet(`contacts/${id}`, submission);
  const mongoPromise = (async () => {
    await connectToDatabase();
    await MongoContactSubmission.create(submission);
  })();

  await Promise.allSettled([fbPromise, mongoPromise]);
  return submission;
}

export async function updateContactStatus(id: string, status: "new" | "archived", notes?: string): Promise<boolean> {
  const updates: Partial<ContactSubmission> = { status };
  if (notes !== undefined) updates.notes = notes;

  const fbPromise = fbUpdate(`contacts/${id}`, updates);
  const mongoPromise = (async () => {
    await connectToDatabase();
    await MongoContactSubmission.findOneAndUpdate({ id }, { $set: updates });
  })();

  await Promise.allSettled([fbPromise, mongoPromise]);
  return true;
}

export async function deleteContact(id: string): Promise<boolean> {
  const fbPromise = fbRemove(`contacts/${id}`);
  const mongoPromise = (async () => {
    await connectToDatabase();
    await MongoContactSubmission.deleteOne({ id });
  })();

  await Promise.allSettled([fbPromise, mongoPromise]);
  return true;
}

// -------------------------------------------------------------
// 12. NAVIGATION
// -------------------------------------------------------------
export async function getNavigation(): Promise<NavigationItem[]> {
  try {
    const fbData = await fbGet<Record<string, NavigationItem>>("navigation");
    if (fbData) {
      const list = objectToArray<NavigationItem>(fbData);
      if (list.length > 0) {
        return list.sort((a, b) => a.order - b.order);
      }
    }

    await connectToDatabase();
    const docs = await MongoNavigationItem.find().sort({ order: 1 }).lean();
    if (docs && docs.length > 0) {
      return docs.map(({ _id, __v, createdAt, updatedAt, ...rest }: any) => rest as NavigationItem);
    }
  } catch (error) {
    console.error("Error fetching navigation:", error);
  }

  // Default Navigation Links matching the sections
  return [
    { id: "nav_1", title: "Home", href: "#home", icon: "IconHome", isExternal: false, order: 1 },
    { id: "nav_2", title: "About", href: "#about", icon: "IconUser", isExternal: false, order: 2 },
    { id: "nav_3", title: "Skills", href: "#skills", icon: "IconCode", isExternal: false, order: 3 },
    { id: "nav_4", title: "Experience", href: "#experience", icon: "IconBriefcase", isExternal: false, order: 4 },
    { id: "nav_5", title: "Projects", href: "#projects", icon: "IconRocket", isExternal: false, order: 5 },
    { id: "nav_6", title: "Contact", href: "#contact", icon: "IconMail", isExternal: false, order: 6 },
  ];
}

export async function saveNavigationItem(data: NavigationItem): Promise<boolean> {
  const id = data.id || `nav_${Date.now()}`;
  const payload = { ...data, id };

  const fbPromise = fbSet(`navigation/${id}`, payload);
  const mongoPromise = (async () => {
    await connectToDatabase();
    await MongoNavigationItem.findOneAndUpdate({ id }, payload, { upsert: true, returnDocument: 'after' });
  })();

  await Promise.allSettled([fbPromise, mongoPromise]);
  return true;
}

export async function deleteNavigationItem(id: string): Promise<boolean> {
  const fbPromise = fbRemove(`navigation/${id}`);
  const mongoPromise = (async () => {
    await connectToDatabase();
    await MongoNavigationItem.deleteOne({ id });
  })();

  await Promise.allSettled([fbPromise, mongoPromise]);
  return true;
}

// -------------------------------------------------------------
// 13. SITE SETTINGS (Singleton)
// -------------------------------------------------------------
export async function getSiteSettings(): Promise<SiteSettings | null> {
  try {
    const fbData = await fbGet<SiteSettings>("siteSettings/singleton-siteSettings");
    if (fbData) return fbData;

    await connectToDatabase();
    const doc = await MongoSiteSettings.findOne({ id: "singleton-siteSettings" }).lean();
    if (doc) {
      const { _id, __v, createdAt, updatedAt, ...rest } = doc as any;
      return rest as SiteSettings;
    }
  } catch (error) {
    console.error("Error fetching site settings:", error);
  }

  return {
    id: "singleton-siteSettings",
    siteTitle: "MD: ABDUR RAHMAN SIFAT",
    siteDescription: "Full-Stack Developer & AI Solutions Engineer Portfolio",
    showBlog: true,
    showServices: true,
    showTestimonials: true,
  };
}

export async function saveSiteSettings(data: SiteSettings): Promise<boolean> {
  const payload = { ...data, id: "singleton-siteSettings" };

  const fbPromise = fbSet("siteSettings/singleton-siteSettings", payload);
  const mongoPromise = (async () => {
    await connectToDatabase();
    await MongoSiteSettings.findOneAndUpdate(
      { id: "singleton-siteSettings" },
      payload,
      { upsert: true, returnDocument: 'after' }
    );
  })();

  await Promise.allSettled([fbPromise, mongoPromise]);
  return true;
}

// -------------------------------------------------------------
// 14. SYNC & BACKUP RECOVERY TOOLS
// -------------------------------------------------------------
export async function syncMongoToFirebase(): Promise<{ success: boolean; message: string }> {
  try {
    if (!RTDB_URL) {
      return { success: false, message: "Firebase Database URL is not configured." };
    }

    // Pre-flight check: Test if Firebase RTDB allows write
    const testSuccess = await fbSet("_test_ping", { ping: true, time: new Date().toISOString() });
    if (!testSuccess) {
      return {
        success: false,
        message: "Firebase Realtime Database rejected the write (401 Permission Denied). Please go to Firebase Console -> Build -> Realtime Database -> Rules, set '.read': true and '.write': true, and click Publish.",
      };
    }
    await fbRemove("_test_ping");

    await connectToDatabase();

    // 1. Profile
    const profile = await MongoProfile.findOne({ id: "singleton-profile" }).lean();
    if (profile) {
      const { _id, __v, ...p } = profile as any;
      await fbSet("profile/singleton-profile", p);
    }

    // 2. Projects
    const projects = await MongoProject.find().lean();
    const projectsObj: Record<string, any> = {};
    for (const pr of projects) {
      const { _id, __v, ...item } = pr as any;
      projectsObj[item.id] = item;
    }
    if (Object.keys(projectsObj).length > 0) {
      await fbSet("projects", projectsObj);
    }

    // 3. Skills
    const skills = await MongoSkill.find().lean();
    const skillsObj: Record<string, any> = {};
    for (const sk of skills) {
      const { _id, __v, ...item } = sk as any;
      skillsObj[item.id] = item;
    }
    if (Object.keys(skillsObj).length > 0) {
      await fbSet("skills", skillsObj);
    }

    // 4. Experiences
    const exps = await MongoExperience.find().lean();
    const expsObj: Record<string, any> = {};
    for (const exp of exps) {
      const { _id, __v, ...item } = exp as any;
      expsObj[item.id] = item;
    }
    if (Object.keys(expsObj).length > 0) {
      await fbSet("experiences", expsObj);
    }

    // 5. Education
    const edus = await MongoEducation.find().lean();
    const edusObj: Record<string, any> = {};
    for (const edu of edus) {
      const { _id, __v, ...item } = edu as any;
      edusObj[item.id] = item;
    }
    if (Object.keys(edusObj).length > 0) {
      await fbSet("educations", edusObj);
    }

    // 6. Certifications
    const certs = await MongoCertification.find().lean();
    const certsObj: Record<string, any> = {};
    for (const cert of certs) {
      const { _id, __v, ...item } = cert as any;
      certsObj[item.id] = item;
    }
    if (Object.keys(certsObj).length > 0) {
      await fbSet("certifications", certsObj);
    }

    // 7. Achievements
    const achs = await MongoAchievement.find().lean();
    const achsObj: Record<string, any> = {};
    for (const ach of achs) {
      const { _id, __v, ...item } = ach as any;
      achsObj[item.id] = item;
    }
    if (Object.keys(achsObj).length > 0) {
      await fbSet("achievements", achsObj);
    }

    // 8. Blogs
    const blogs = await MongoBlog.find().lean();
    const blogsObj: Record<string, any> = {};
    for (const blog of blogs) {
      const { _id, __v, ...item } = blog as any;
      blogsObj[item.id] = item;
    }
    if (Object.keys(blogsObj).length > 0) {
      await fbSet("blogs", blogsObj);
    }

    // 9. Services
    const services = await MongoService.find().lean();
    const srvsObj: Record<string, any> = {};
    for (const srv of services) {
      const { _id, __v, ...item } = srv as any;
      srvsObj[item.id] = item;
    }
    if (Object.keys(srvsObj).length > 0) {
      await fbSet("services", srvsObj);
    }

    // 10. Testimonials
    const tests = await MongoTestimonial.find().lean();
    const testsObj: Record<string, any> = {};
    for (const test of tests) {
      const { _id, __v, ...item } = test as any;
      testsObj[item.id] = item;
    }
    if (Object.keys(testsObj).length > 0) {
      await fbSet("testimonials", testsObj);
    }

    // 11. Navigation
    const navs = await MongoNavigationItem.find().lean();
    const navsObj: Record<string, any> = {};
    for (const nav of navs) {
      const { _id, __v, ...item } = nav as any;
      navsObj[item.id] = item;
    }
    if (Object.keys(navsObj).length > 0) {
      await fbSet("navigation", navsObj);
    }

    // 12. SiteSettings
    const settings = await MongoSiteSettings.findOne({ id: "singleton-siteSettings" }).lean();
    if (settings) {
      const { _id, __v, ...s } = settings as any;
      await fbSet("siteSettings/singleton-siteSettings", s);
    }

    return { success: true, message: "Successfully synced all data from MongoDB backup to Firebase!" };
  } catch (error: any) {
    console.error("Sync error:", error);
    return { success: false, message: error.message || "Failed to sync." };
  }
}

// -------------------------------------------------------------
// 14. DRAFT MANAGEMENT & DRAFT HISTORY
// -------------------------------------------------------------

/**
 * Retrieves the draft document if present, or falls back to the published version.
 */
export async function getDocumentWithDraft<T>(
  collectionName: string,
  documentId: string
): Promise<{ data: T | null; status: "published" | "draft"; hasDraft: boolean }> {
  try {
    // 1. Try Firebase draft path
    const fbDraft = await fbGet<T>(`drafts/${collectionName}/${documentId}`);
    if (fbDraft) {
      return { data: toPlainObject(fbDraft), status: "draft", hasDraft: true };
    }

    // 2. Try MongoDB draft collection
    await connectToDatabase();
    const mongoDraft = await MongoDraftDocument.findOne({ collectionName, documentId }).lean();
    if (mongoDraft && mongoDraft.data) {
      return { data: toPlainObject(mongoDraft.data) as T, status: "draft", hasDraft: true };
    }
  } catch (err) {
    console.error("Error reading draft:", err);
  }

  // 3. Fallback to published version
  let publishedData: any = null;
  if (collectionName === "profile") {
    publishedData = await getProfile();
  } else if (collectionName === "siteSettings") {
    publishedData = await getSiteSettings();
  } else if (collectionName === "projects") {
    const list = await getProjects();
    publishedData = list.find((p) => p.id === documentId) || null;
  }

  return {
    data: toPlainObject(publishedData) as T | null,
    status: "published",
    hasDraft: false,
  };
}

/**
 * Saves a working draft in Firebase & MongoDB and creates a Draft History audit snapshot.
 */
export async function saveDocumentDraft<T extends Record<string, any>>(
  collectionName: string,
  documentId: string,
  data: T,
  author: string,
  changeSummary?: string
): Promise<{ success: boolean; historyItem?: DraftHistoryItem }> {
  const timestamp = new Date().toISOString();
  const draftId = `hist_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const draftData = {
    ...data,
    id: documentId,
    _status: "draft",
    _updatedAt: timestamp,
  };

  const historyItem: DraftHistoryItem = {
    id: draftId,
    documentId,
    collectionName,
    action: "draft_save",
    title: `Draft Saved (${collectionName})`,
    snapshot: draftData,
    author: author || "admin",
    timestamp,
    changeSummary: changeSummary || "Draft modified",
  };

  try {
    // 1. Save draft to Firebase
    const fbDraftPromise = fbSet(`drafts/${collectionName}/${documentId}`, draftData);
    const fbHistPromise = fbSet(`draft_history/${collectionName}/${documentId}/${draftId}`, historyItem);

    // 2. Save draft to MongoDB
    const mongoPromise = (async () => {
      await connectToDatabase();
      await MongoDraftDocument.findOneAndUpdate(
        { collectionName, documentId },
        { data: draftData, updatedBy: author },
        { upsert: true, returnDocument: 'after' }
      );
      await MongoDraftHistory.create(historyItem);
    })();

    await Promise.allSettled([fbDraftPromise, fbHistPromise, mongoPromise]);
    return { success: true, historyItem };
  } catch (err) {
    console.error("Error saving draft:", err);
    return { success: false };
  }
}

/**
 * Publishes draft changes into the live production database and logs a Publish history entry.
 */
export async function publishDocument<T extends Record<string, any>>(
  collectionName: string,
  documentId: string,
  data: T,
  author: string
): Promise<{ success: boolean; historyItem?: DraftHistoryItem }> {
  const timestamp = new Date().toISOString();
  const histId = `hist_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const publishedData = {
    ...data,
    id: documentId,
    _status: "published",
    _updatedAt: timestamp,
  };

  const historyItem: DraftHistoryItem = {
    id: histId,
    documentId,
    collectionName,
    action: "publish",
    title: `Published to Live (${collectionName})`,
    snapshot: publishedData,
    author: author || "admin",
    timestamp,
    changeSummary: "Published live to website",
  };

  try {
    // 1. Commit to live collection based on type
    if (collectionName === "profile") {
      await saveProfile(publishedData as unknown as Profile);
    } else if (collectionName === "siteSettings") {
      await saveSiteSettings(publishedData as unknown as SiteSettings);
    } else if (collectionName === "projects") {
      await saveProject(publishedData as unknown as Project);
    } else {
      // Generic live update in Firebase & MongoDB
      await fbSet(`${collectionName}/${documentId}`, publishedData);
      await connectToDatabase();
    }

    // 2. Clear working draft from Firebase & MongoDraftDocument
    const fbClearDraft = fbRemove(`drafts/${collectionName}/${documentId}`);
    const fbHistPromise = fbSet(`draft_history/${collectionName}/${documentId}/${histId}`, historyItem);

    const mongoPromise = (async () => {
      await connectToDatabase();
      await MongoDraftDocument.deleteOne({ collectionName, documentId });
      await MongoDraftHistory.create(historyItem);
    })();

    await Promise.allSettled([fbClearDraft, fbHistPromise, mongoPromise]);
    return { success: true, historyItem };
  } catch (err) {
    console.error("Error publishing document:", err);
    return { success: false };
  }
}

/**
 * Discards uncommitted draft changes and reverts back to the published document.
 */
export async function discardDocumentDraft(
  collectionName: string,
  documentId: string,
  author: string
): Promise<{ success: boolean; publishedData: any }> {
  const timestamp = new Date().toISOString();
  const histId = `hist_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  try {
    // 1. Remove draft from Firebase & MongoDB
    await fbRemove(`drafts/${collectionName}/${documentId}`);
    await connectToDatabase();
    await MongoDraftDocument.deleteOne({ collectionName, documentId });

    // 2. Fetch current published document
    let publishedData: any = null;
    if (collectionName === "profile") {
      publishedData = await getProfile();
    } else if (collectionName === "siteSettings") {
      publishedData = await getSiteSettings();
    } else if (collectionName === "projects") {
      const list = await getProjects();
      publishedData = list.find((p) => p.id === documentId) || null;
    }

    // 3. Log history entry
    const historyItem: DraftHistoryItem = {
      id: histId,
      documentId,
      collectionName,
      action: "discard",
      title: `Discarded Draft (${collectionName})`,
      snapshot: publishedData,
      author: author || "admin",
      timestamp,
      changeSummary: "Reverted draft changes to published version",
    };

    await MongoDraftHistory.create(historyItem);
    await fbSet(`draft_history/${collectionName}/${documentId}/${histId}`, historyItem);

    return { success: true, publishedData };
  } catch (err) {
    console.error("Error discarding draft:", err);
    return { success: false, publishedData: null };
  }
}

/**
 * Returns audit and revision history for a document, newest first.
 */
export async function getDocumentHistory(
  collectionName: string,
  documentId: string
): Promise<DraftHistoryItem[]> {
  try {
    // 1. Try MongoDB
    await connectToDatabase();
    const docs = await MongoDraftHistory.find({ collectionName, documentId })
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    if (docs && docs.length > 0) {
      return docs.map((d: any) => ({
        id: d.id,
        documentId: d.documentId,
        collectionName: d.collectionName,
        action: d.action,
        title: d.title,
        snapshot: d.snapshot,
        author: d.author,
        timestamp: d.timestamp,
        changeSummary: d.changeSummary,
      }));
    }

    // 2. Fallback to Firebase
    const fbHist = await fbGet<Record<string, DraftHistoryItem>>(`draft_history/${collectionName}/${documentId}`);
    if (fbHist) {
      return Object.values(fbHist).sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    }
  } catch (err) {
    console.error("Error fetching document history:", err);
  }

  return [];
}

/**
 * Restores a specific snapshot from history as the working draft.
 */
export async function restoreDocumentHistory(
  historyId: string,
  author: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    await connectToDatabase();
    const item = await MongoDraftHistory.findOne({ id: historyId }).lean();
    if (!item || !item.snapshot) {
      return { success: false, error: "History record not found." };
    }

    const { collectionName, documentId, snapshot } = item as any;
    const timestamp = new Date().toISOString();
    const newHistId = `hist_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // Save restored snapshot as current draft
    const restoredData = {
      ...snapshot,
      _status: "draft",
      _updatedAt: timestamp,
    };

    await fbSet(`drafts/${collectionName}/${documentId}`, restoredData);
    await MongoDraftDocument.findOneAndUpdate(
      { collectionName, documentId },
      { data: restoredData, updatedBy: author },
      { upsert: true }
    );

    // Log restore event in history
    const logItem: DraftHistoryItem = {
      id: newHistId,
      documentId,
      collectionName,
      action: "restore",
      title: `Restored Version (${new Date(item.timestamp).toLocaleDateString()})`,
      snapshot: restoredData,
      author,
      timestamp,
      changeSummary: `Restored historical snapshot from ${item.timestamp}`,
    };

    await MongoDraftHistory.create(logItem);
    await fbSet(`draft_history/${collectionName}/${documentId}/${newHistId}`, logItem);

    return { success: true, data: restoredData };
  } catch (err: any) {
    console.error("Error restoring history snapshot:", err);
    return { success: false, error: err.message };
  }
}
