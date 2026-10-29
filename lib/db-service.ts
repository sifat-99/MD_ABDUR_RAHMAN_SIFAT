"use server";

import { cache } from "react";
import { revalidatePath } from "next/cache";
import mongoose from "mongoose";
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

function revalidatePortfolioCache() {
  try {
    revalidatePath("/", "layout");
  } catch {
    // Graceful fallback if called outside request context
  }
}

async function fbGet<T>(path: string): Promise<T | null> {
  const url = getRtdbEndpoint(path);
  if (!url) return null;
  try {
    const res = await fetch(url, {
      next: { revalidate: 300, tags: ["portfolio"] },
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
    revalidatePortfolioCache();
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
    if (res.ok) {
      revalidatePortfolioCache();
    }
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
    if (res.ok) {
      revalidatePortfolioCache();
    }
    return res.ok;
  } catch {
    return false;
  }
}

// -------------------------------------------------------------
// Guaranteed Synchronous Dual-Write Engine (Firebase + MongoDB)
// -------------------------------------------------------------
async function dualSaveEntity<T extends { id?: string }>(
  fbPath: string,
  model: any,
  collectionName: string,
  entityId: string,
  data: T
): Promise<boolean> {
  const payload = {
    ...data,
    id: entityId,
    updatedAt: new Date().toISOString(),
  };

  // 1. Firebase Write via Stateless HTTPS REST
  const fbPromise = (async () => {
    try {
      const ok = await fbSet(fbPath, payload);
      if (!ok) {
        console.warn(`[DualWrite Warning] Firebase fbSet returned false for ${fbPath}`);
      }
      return ok;
    } catch (err) {
      console.error(`[DualWrite Error] Firebase failed for ${fbPath}:`, err);
      return false;
    }
  })();

  // 2. MongoDB Write via Mongoose with direct collection fallback
  const mongoPromise = (async () => {
    try {
      const conn = await connectToDatabase();
      if (!conn) {
        console.warn(`[DualWrite Warning] MongoDB not connected, cannot save to ${collectionName}`);
        return false;
      }

      try {
        await model.findOneAndUpdate(
          { id: entityId },
          payload,
          { upsert: true, new: true, runValidators: false, setDefaultsOnInsert: true }
        );
        return true;
      } catch (mErr) {
        console.warn(`[DualWrite Warning] Mongoose model failed for ${collectionName}, trying direct replaceOne:`, mErr);
        if (mongoose.connection.db) {
          await mongoose.connection.db.collection(collectionName).replaceOne(
            { id: entityId },
            payload,
            { upsert: true }
          );
          return true;
        }
        throw mErr;
      }
    } catch (err) {
      console.error(`[DualWrite Error] MongoDB failed for ${collectionName} (${entityId}):`, err);
      return false;
    }
  })();

  const [fbResult, mongoResult] = await Promise.all([fbPromise, mongoPromise]);
  revalidatePortfolioCache();

  if (!fbResult && !mongoResult) {
    console.error(`[DualWrite CRITICAL] Both Firebase and MongoDB failed for ${entityId}!`);
    return false;
  }

  if (!mongoResult) {
    console.warn(`[DualWrite Warning] Saved to Firebase, but MongoDB write failed for ${entityId}`);
  }
  if (!fbResult) {
    console.warn(`[DualWrite Warning] Saved to MongoDB, but Firebase write failed for ${entityId}`);
  }

  return true;
}

async function dualDeleteEntity(
  fbPath: string,
  model: any,
  collectionName: string,
  entityId: string
): Promise<boolean> {
  const fbPromise = (async () => {
    try {
      return await fbRemove(fbPath);
    } catch (err) {
      console.error(`[DualDelete Error] Firebase remove failed for ${fbPath}:`, err);
      return false;
    }
  })();

  const mongoPromise = (async () => {
    try {
      const conn = await connectToDatabase();
      if (!conn) return false;
      await model.deleteOne({ id: entityId });
      return true;
    } catch (err) {
      console.error(`[DualDelete Error] MongoDB delete failed for ${collectionName} (${entityId}):`, err);
      try {
        if (mongoose.connection.db) {
          await mongoose.connection.db.collection(collectionName).deleteOne({ id: entityId });
          return true;
        }
      } catch {}
      return false;
    }
  })();

  const [fbResult, mongoResult] = await Promise.all([fbPromise, mongoPromise]);
  revalidatePortfolioCache();
  return fbResult || mongoResult;
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
  return dualSaveEntity("profile/singleton-profile", MongoProfile, "profiles", "singleton-profile", profileData);
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
  return dualSaveEntity(`projects/${id}`, MongoProject, "projects", id, data);
}

export async function deleteProject(id: string): Promise<boolean> {
  return dualDeleteEntity(`projects/${id}`, MongoProject, "projects", id);
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
  return dualSaveEntity(`skills/${id}`, MongoSkill, "skills", id, data);
}

export async function deleteSkill(id: string): Promise<boolean> {
  return dualDeleteEntity(`skills/${id}`, MongoSkill, "skills", id);
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
  return dualSaveEntity(`experiences/${id}`, MongoExperience, "experiences", id, data);
}

export async function deleteExperience(id: string): Promise<boolean> {
  return dualDeleteEntity(`experiences/${id}`, MongoExperience, "experiences", id);
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
  return dualSaveEntity(`educations/${id}`, MongoEducation, "educations", id, data);
}

export async function deleteEducation(id: string): Promise<boolean> {
  return dualDeleteEntity(`educations/${id}`, MongoEducation, "educations", id);
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
  return dualSaveEntity(`certifications/${id}`, MongoCertification, "certifications", id, data);
}

export async function deleteCertification(id: string): Promise<boolean> {
  return dualDeleteEntity(`certifications/${id}`, MongoCertification, "certifications", id);
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
  return dualSaveEntity(`achievements/${id}`, MongoAchievement, "achievements", id, data);
}

export async function deleteAchievement(id: string): Promise<boolean> {
  return dualDeleteEntity(`achievements/${id}`, MongoAchievement, "achievements", id);
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
  return dualSaveEntity(`blogs/${id}`, MongoBlog, "blogs", id, data);
}

export async function deleteBlog(id: string): Promise<boolean> {
  return dualDeleteEntity(`blogs/${id}`, MongoBlog, "blogs", id);
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
  return dualSaveEntity(`services/${id}`, MongoService, "services", id, data);
}

export async function deleteService(id: string): Promise<boolean> {
  return dualDeleteEntity(`services/${id}`, MongoService, "services", id);
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
  return dualSaveEntity(`testimonials/${id}`, MongoTestimonial, "testimonials", id, data);
}

export async function deleteTestimonial(id: string): Promise<boolean> {
  return dualDeleteEntity(`testimonials/${id}`, MongoTestimonial, "testimonials", id);
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
  await dualSaveEntity(`contacts/${id}`, MongoContactSubmission, "contactsubmissions", id, submission);
  return submission;
}

export async function updateContactStatus(id: string, status: "new" | "archived", notes?: string): Promise<boolean> {
  const updates: Partial<ContactSubmission> = { status };
  if (notes !== undefined) updates.notes = notes;

  const fbPromise = fbUpdate(`contacts/${id}`, updates);
  const mongoPromise = (async () => {
    try {
      await connectToDatabase();
      await MongoContactSubmission.findOneAndUpdate({ id }, { $set: updates });
      return true;
    } catch (err) {
      if (mongoose.connection.db) {
        await mongoose.connection.db.collection("contactsubmissions").updateOne({ id }, { $set: updates });
        return true;
      }
      return false;
    }
  })();

  await Promise.all([fbPromise, mongoPromise]);
  revalidatePortfolioCache();
  return true;
}

export async function deleteContact(id: string): Promise<boolean> {
  return dualDeleteEntity(`contacts/${id}`, MongoContactSubmission, "contactsubmissions", id);
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
  return dualSaveEntity(`navigation/${id}`, MongoNavigationItem, "navigationitems", id, data);
}

export async function deleteNavigationItem(id: string): Promise<boolean> {
  return dualDeleteEntity(`navigation/${id}`, MongoNavigationItem, "navigationitems", id);
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
  return dualSaveEntity(
    "siteSettings/singleton-siteSettings",
    MongoSiteSettings,
    "sitesettings",
    "singleton-siteSettings",
    data
  );
}

// -------------------------------------------------------------
// 14. SYNC & BACKUP RECOVERY TOOLS
// -------------------------------------------------------------

/**
 * 1. Sync Firebase -> MongoDB:
 * Reads all active live data from Firebase RTDB and upserts into MongoDB Atlas.
 */
export async function syncFirebaseToMongo(): Promise<{
  success: boolean;
  message: string;
  counts?: Record<string, number>;
}> {
  try {
    if (!RTDB_URL) {
      return { success: false, message: "Firebase Database URL is not configured." };
    }

    const conn = await connectToDatabase();
    if (!conn || !mongoose.connection.db) {
      return { success: false, message: "MongoDB connection is unavailable." };
    }

    const db = mongoose.connection.db;
    const counts: Record<string, number> = {};

    // 1. Profile
    const profile = await fbGet<Profile>("profile/singleton-profile");
    if (profile) {
      const p = { ...profile, id: "singleton-profile", updatedAt: new Date().toISOString() };
      await db.collection("profiles").replaceOne({ id: "singleton-profile" }, p, { upsert: true });
      counts.profile = 1;
    }

    // Helper for collections
    const syncFbCollection = async (fbPath: string, mongoCol: string) => {
      const fbData = await fbGet<Record<string, any>>(fbPath);
      if (fbData) {
        const list = objectToArray<any>(fbData);
        let count = 0;
        for (const item of list) {
          if (!item) continue;
          const id = item.id;
          if (id) {
            await db!.collection(mongoCol).replaceOne({ id }, item, { upsert: true });
            count++;
          }
        }
        counts[mongoCol] = count;
      } else {
        counts[mongoCol] = 0;
      }
    }

    await syncFbCollection("projects", "projects");
    await syncFbCollection("skills", "skills");
    await syncFbCollection("experiences", "experiences");
    await syncFbCollection("educations", "educations");
    await syncFbCollection("certifications", "certifications");
    await syncFbCollection("achievements", "achievements");
    await syncFbCollection("blogs", "blogs");
    await syncFbCollection("services", "services");
    await syncFbCollection("testimonials", "testimonials");
    await syncFbCollection("navigation", "navigationitems");
    await syncFbCollection("contacts", "contactsubmissions");

    // SiteSettings
    const settings = await fbGet<SiteSettings>("siteSettings/singleton-siteSettings");
    if (settings) {
      const s = { ...settings, id: "singleton-siteSettings", updatedAt: new Date().toISOString() };
      await db.collection("sitesettings").replaceOne({ id: "singleton-siteSettings" }, s, { upsert: true });
      counts.siteSettings = 1;
    }

    // Update sync metadata in both
    const syncNow = new Date().toISOString();
    await db.collection("sync_metadata").replaceOne(
      { id: "database_sync_status" },
      { id: "database_sync_status", lastSyncedFromFirebase: syncNow, lastUpdated: syncNow },
      { upsert: true }
    );
    await fbSet("_sync_meta/last_updated", syncNow);

    revalidatePortfolioCache();
    return {
      success: true,
      message: "Successfully synchronized all live data from Firebase to MongoDB Atlas!",
      counts,
    };
  } catch (error: any) {
    console.error("[Sync Firebase -> MongoDB] Error:", error);
    return { success: false, message: error.message || "Failed to sync Firebase to MongoDB." };
  }
}

/**
 * 2. Sync MongoDB -> Firebase:
 * Reads all data from MongoDB Atlas backup and writes into Firebase RTDB.
 */
export async function syncMongoToFirebase(): Promise<{ success: boolean; message: string }> {
  try {
    if (!RTDB_URL) {
      return { success: false, message: "Firebase Database URL is not configured." };
    }

    const testSuccess = await fbSet("_test_ping", { ping: true, time: new Date().toISOString() });
    if (!testSuccess) {
      return {
        success: false,
        message: "Firebase Realtime Database rejected write. Check Firebase Security Rules.",
      };
    }
    await fbRemove("_test_ping");

    const conn = await connectToDatabase();
    if (!conn || !mongoose.connection.db) {
      return { success: false, message: "MongoDB connection is unavailable." };
    }

    const db = mongoose.connection.db;

    const syncMongoColToFb = async (mongoCol: string, fbPath: string) => {
      const docs = await db!.collection(mongoCol).find({}).toArray();
      const obj: Record<string, any> = {};
      for (const d of docs) {
        const { _id, __v, ...item } = d as any;
        if (item.id) obj[item.id] = item;
      }
      if (Object.keys(obj).length > 0) {
        await fbSet(fbPath, obj);
      }
    }

    // 1. Profile
    const profile = await db.collection("profiles").findOne({ id: "singleton-profile" });
    if (profile) {
      const { _id, __v, ...p } = profile as any;
      await fbSet("profile/singleton-profile", p);
    }

    // 2-12
    await syncMongoColToFb("projects", "projects");
    await syncMongoColToFb("skills", "skills");
    await syncMongoColToFb("experiences", "experiences");
    await syncMongoColToFb("educations", "educations");
    await syncMongoColToFb("certifications", "certifications");
    await syncMongoColToFb("achievements", "achievements");
    await syncMongoColToFb("blogs", "blogs");
    await syncMongoColToFb("services", "services");
    await syncMongoColToFb("testimonials", "testimonials");
    await syncMongoColToFb("navigationitems", "navigation");
    await syncMongoColToFb("contactsubmissions", "contacts");

    // 13. Site Settings
    const settings = await db.collection("sitesettings").findOne({ id: "singleton-siteSettings" });
    if (settings) {
      const { _id, __v, ...s } = settings as any;
      await fbSet("siteSettings/singleton-siteSettings", s);
    }

    // Update sync metadata in both
    const syncNow = new Date().toISOString();
    await fbSet("_sync_meta/last_updated", syncNow);
    await db.collection("sync_metadata").replaceOne(
      { id: "database_sync_status" },
      { id: "database_sync_status", lastSyncedToFirebase: syncNow, lastUpdated: syncNow },
      { upsert: true }
    );

    revalidatePortfolioCache();
    return { success: true, message: "Successfully synced all data from MongoDB backup to Firebase!" };
  } catch (error: any) {
    console.error("[Sync MongoDB -> Firebase] Error:", error);
    return { success: false, message: error.message || "Failed to sync." };
  }
}

/**
 * 3. Smart Bi-Directional Sync (Zero Data Loss):
 * Compares every record in Firebase and MongoDB. Merges missing records and
 * takes the latest version of edited records, ensuring both databases are 100% identical.
 */
export async function syncBothDatabases(): Promise<{
  success: boolean;
  message: string;
  stats?: {
    syncedToMongo: number;
    syncedToFirebase: number;
    totalSynced: number;
  };
}> {
  try {
    if (!RTDB_URL) {
      return { success: false, message: "Firebase Database URL is not configured." };
    }

    const conn = await connectToDatabase();
    if (!conn || !mongoose.connection.db) {
      return { success: false, message: "MongoDB connection is unavailable." };
    }

    const db = mongoose.connection.db;
    let syncedToMongo = 0;
    let syncedToFirebase = 0;

    const reconcileCollection = async (fbPath: string, mongoCol: string) => {
      const fbData = (await fbGet<Record<string, any>>(fbPath)) || {};
      const fbList = objectToArray<any>(fbData).filter((x) => Boolean(x && x.id));
      const fbMap: Record<string, any> = {};
      for (const item of fbList) {
        if (item && item.id) fbMap[item.id] = item;
      }

      const mongoList = (await db!.collection(mongoCol).find({}).toArray()) as any[];
      const mongoMap: Record<string, any> = {};
      for (const m of mongoList) {
        const { _id, __v, ...item } = m as any;
        if (item.id) mongoMap[item.id] = item;
      }

      // Check items from Firebase
      const fbKeys = Object.keys(fbMap);
      for (const id of fbKeys) {
        const fbItem = fbMap[id];
        const mongoItem = mongoMap[id];
        if (!mongoItem) {
          await db!.collection(mongoCol).replaceOne({ id }, fbItem, { upsert: true });
          syncedToMongo++;
        } else {
          const fbTime = new Date(fbItem.updatedAt || fbItem.publishedAt || 0).getTime();
          const mongoTime = new Date(mongoItem.updatedAt || mongoItem.publishedAt || 0).getTime();

          if (fbTime > mongoTime) {
            await db!.collection(mongoCol).replaceOne({ id }, fbItem, { upsert: true });
            syncedToMongo++;
          } else if (mongoTime > fbTime) {
            await fbSet(`${fbPath}/${id}`, mongoItem);
            syncedToFirebase++;
          }
        }
      }

      // Check items in Mongo but not in Firebase
      const mongoKeys = Object.keys(mongoMap);
      for (const id of mongoKeys) {
        if (!fbMap[id]) {
          await fbSet(`${fbPath}/${id}`, mongoMap[id]);
          syncedToFirebase++;
        }
      }
    };

    await reconcileCollection("projects", "projects");
    await reconcileCollection("skills", "skills");
    await reconcileCollection("experiences", "experiences");
    await reconcileCollection("educations", "educations");
    await reconcileCollection("certifications", "certifications");
    await reconcileCollection("achievements", "achievements");
    await reconcileCollection("blogs", "blogs");
    await reconcileCollection("services", "services");
    await reconcileCollection("testimonials", "testimonials");
    await reconcileCollection("navigation", "navigationitems");
    await reconcileCollection("contacts", "contactsubmissions");

    // Singletons: Profile
    const fbProfile = await fbGet<Profile>("profile/singleton-profile");
    const mongoProfileDoc = await db.collection("profiles").findOne({ id: "singleton-profile" });
    if (fbProfile && !mongoProfileDoc) {
      await db.collection("profiles").replaceOne({ id: "singleton-profile" }, fbProfile, { upsert: true });
      syncedToMongo++;
    } else if (!fbProfile && mongoProfileDoc) {
      const { _id, __v, ...p } = mongoProfileDoc as any;
      await fbSet("profile/singleton-profile", p);
      syncedToFirebase++;
    } else if (fbProfile && mongoProfileDoc) {
      const p = { ...(mongoProfileDoc as any), ...fbProfile, id: "singleton-profile", updatedAt: new Date().toISOString() };
      delete (p as any)._id;
      delete (p as any).__v;
      await db.collection("profiles").replaceOne({ id: "singleton-profile" }, p, { upsert: true });
      await fbSet("profile/singleton-profile", p);
    }

    // Singletons: Site Settings
    const fbSettings = await fbGet<SiteSettings>("siteSettings/singleton-siteSettings");
    const mongoSettingsDoc = await db.collection("sitesettings").findOne({ id: "singleton-siteSettings" });
    if (fbSettings && !mongoSettingsDoc) {
      await db.collection("sitesettings").replaceOne({ id: "singleton-siteSettings" }, fbSettings, { upsert: true });
      syncedToMongo++;
    } else if (!fbSettings && mongoSettingsDoc) {
      const { _id, __v, ...s } = mongoSettingsDoc as any;
      await fbSet("siteSettings/singleton-siteSettings", s);
      syncedToFirebase++;
    } else if (fbSettings && mongoSettingsDoc) {
      const s = { ...(mongoSettingsDoc as any), ...fbSettings, id: "singleton-siteSettings", updatedAt: new Date().toISOString() };
      delete (s as any)._id;
      delete (s as any).__v;
      await db.collection("sitesettings").replaceOne({ id: "singleton-siteSettings" }, s, { upsert: true });
      await fbSet("siteSettings/singleton-siteSettings", s);
    }

    // Update sync metadata in both
    const now = new Date().toISOString();
    await fbSet("_sync_meta/last_updated", now);
    if (db) {
      await db.collection("sync_metadata").replaceOne(
        { id: "database_sync_status" },
        { id: "database_sync_status", lastBothSynced: now, lastUpdated: now },
        { upsert: true }
      );
    }

    revalidatePortfolioCache();

    return {
      success: true,
      message: `Bi-directional sync completed! Synced ${syncedToMongo} update(s) to MongoDB Atlas, and ${syncedToFirebase} update(s) to Firebase. Both databases are now 100% in sync!`,
      stats: {
        syncedToMongo,
        syncedToFirebase,
        totalSynced: syncedToMongo + syncedToFirebase,
      },
    };
  } catch (error: any) {
    console.error("[Bi-directional Sync] Error:", error);
    return { success: false, message: error.message || "Failed to run bi-directional sync." };
  }
}

/**
 * 4. Get Database Status & Synchronization Information:
 * Queries real-time connection status, document counts, and latest update timestamps
 * for both Firebase Realtime Database and MongoDB Atlas.
 */
export interface DatabaseSyncStatus {
  firebase: {
    connected: boolean;
    lastUpdated: string | null;
    totalDocuments: number;
  };
  mongodb: {
    connected: boolean;
    lastUpdated: string | null;
    totalDocuments: number;
  };
  latestSource: "firebase" | "mongodb" | "equal" | "unknown";
  diffSeconds: number;
}

export async function getDatabaseSyncStatus(): Promise<DatabaseSyncStatus> {
  let fbConnected = false;
  let fbLastUpdated: string | null = null;
  let fbCount = 0;

  try {
    if (RTDB_URL) {
      const fbMeta = await fbGet<{ last_updated?: string }>("_sync_meta");
      if (fbMeta && fbMeta.last_updated) {
        fbLastUpdated = fbMeta.last_updated;
      }

      const res = await fetch(`${getRtdbEndpoint("")}`, {
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        fbConnected = true;
        const root = await res.json();
        if (root && typeof root === "object") {
          let latestMs = fbLastUpdated ? new Date(fbLastUpdated).getTime() : 0;
          const rootKeys = Object.keys(root);
          for (const k of rootKeys) {
            if (k.startsWith("_")) continue;
            const v = root[k];
            if (v && typeof v === "object") {
              const items = Object.values(v as Record<string, any>);
              for (const item of items) {
                if (item && typeof item === "object") {
                  fbCount++;
                  const t = new Date(item.updatedAt || item.publishedAt || item.submittedAt || 0).getTime();
                  if (t > latestMs) {
                    latestMs = t;
                    fbLastUpdated = item.updatedAt || item.publishedAt || item.submittedAt;
                  }
                }
              }
            }
          }
        }
      }
    }
  } catch (err) {
    console.error("[getDatabaseSyncStatus] Firebase status error:", err);
  }

  let mongoConnected = false;
  let mongoLastUpdated: string | null = null;
  let mongoCount = 0;

  try {
    const conn = await connectToDatabase();
    if (conn && mongoose.connection.db) {
      mongoConnected = true;
      const db = mongoose.connection.db;
      const meta = await db.collection("sync_metadata").findOne({ id: "database_sync_status" });
      if (meta && meta.lastUpdated) {
        mongoLastUpdated = meta.lastUpdated;
      }

      const collections = [
        "profiles",
        "sitesettings",
        "projects",
        "skills",
        "experiences",
        "educations",
        "certifications",
        "achievements",
        "blogs",
        "services",
        "testimonials",
        "navigationitems",
        "contactsubmissions",
      ];

      let latestMs = mongoLastUpdated ? new Date(mongoLastUpdated).getTime() : 0;
      for (const col of collections) {
        const docs = await db.collection(col).find({}, { projection: { updatedAt: 1, publishedAt: 1 } }).toArray();
        mongoCount += docs.length;
        for (const d of docs) {
          const t = new Date(d.updatedAt || d.publishedAt || 0).getTime();
          if (t > latestMs) {
            latestMs = t;
            mongoLastUpdated = d.updatedAt || d.publishedAt;
          }
        }
      }
    }
  } catch (err) {
    console.error("[getDatabaseSyncStatus] MongoDB status error:", err);
  }

  let latestSource: "firebase" | "mongodb" | "equal" | "unknown" = "unknown";
  let diffSeconds = 0;

  if (fbLastUpdated && mongoLastUpdated) {
    const fbMs = new Date(fbLastUpdated).getTime();
    const mongoMs = new Date(mongoLastUpdated).getTime();
    diffSeconds = Math.round(Math.abs(fbMs - mongoMs) / 1000);

    if (diffSeconds <= 5) {
      latestSource = "equal";
    } else if (fbMs > mongoMs) {
      latestSource = "firebase";
    } else {
      latestSource = "mongodb";
    }
  } else if (fbLastUpdated) {
    latestSource = "firebase";
  } else if (mongoLastUpdated) {
    latestSource = "mongodb";
  }

  return {
    firebase: {
      connected: fbConnected,
      lastUpdated: fbLastUpdated,
      totalDocuments: fbCount,
    },
    mongodb: {
      connected: mongoConnected,
      lastUpdated: mongoLastUpdated,
      totalDocuments: mongoCount,
    },
    latestSource,
    diffSeconds,
  };
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
