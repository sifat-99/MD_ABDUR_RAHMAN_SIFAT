import mongoose, { Schema, Model } from "mongoose";

// Generic helper to get or compile a model safely in Next.js HMR
function getModel<T>(name: string, schema: Schema<T>): Model<T> {
  return (mongoose.models[name] as Model<T>) || mongoose.model<T>(name, schema);
}

// 1. Profile Schema (Singleton)
const ProfileSchema = new Schema({
  id: { type: String, default: "singleton-profile", unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  headline: { type: String, required: true },
  headlineStaticText: String,
  headlineAnimatedWords: [String],
  headlineAnimationDuration: { type: Number, default: 3000 },
  shortBio: { type: String, required: true },
  fullBio: String,
  profileImage: String,
  email: { type: String, required: true },
  phone: String,
  location: String,
  availability: { type: String, enum: ["available", "open", "unavailable"], default: "available" },
  socialLinks: {
    github: String,
    linkedin: String,
    twitter: String,
    website: String,
    medium: String,
    devto: String,
    youtube: String,
    stackoverflow: String,
  },
  yearsOfExperience: Number,
  stats: [{ label: String, value: String }],
}, { timestamps: true });

// 2. Project Schema
const ProjectSchema = new Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  slug: { type: String, required: true },
  tagline: String,
  coverImage: String,
  technologies: [String],
  category: { type: String, required: true },
  liveUrl: String,
  githubUrl: String,
  featured: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
}, { timestamps: true });

// 3. Skill Schema
const SkillSchema = new Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  proficiency: { type: String, default: "intermediate" },
  percentage: { type: Number, required: true, min: 0, max: 100 },
  yearsOfExperience: Number,
  color: String,
  order: { type: Number, default: 0 },
}, { timestamps: true });

// 4. Experience Schema
const ExperienceSchema = new Schema({
  id: { type: String, required: true, unique: true },
  company: { type: String, required: true },
  position: { type: String, required: true },
  employmentType: String,
  location: String,
  startDate: { type: String, required: true },
  endDate: String,
  current: { type: Boolean, default: false },
  description: String,
  responsibilities: [String],
  achievements: [String],
  technologies: [String],
  companyLogo: String,
  companyWebsite: String,
  order: { type: Number, default: 0 },
}, { timestamps: true });

// 5. Education Schema
const EducationSchema = new Schema({
  id: { type: String, required: true, unique: true },
  institution: { type: String, required: true },
  degree: { type: String, required: true },
  fieldOfStudy: String,
  startDate: String,
  endDate: String,
  current: { type: Boolean, default: false },
  gpa: String,
  description: String,
  achievements: [String],
  logo: String,
  website: String,
  order: { type: Number, default: 0 },
}, { timestamps: true });

// 6. Certification Schema
const CertificationSchema = new Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  issuer: { type: String, required: true },
  issueDate: { type: String, required: true },
  expiryDate: String,
  credentialId: String,
  credentialUrl: String,
  logo: String,
  description: String,
  skills: [String],
  order: { type: Number, default: 0 },
}, { timestamps: true });

// 7. Achievement Schema
const AchievementSchema = new Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  type: { type: String, default: "award" },
  issuer: String,
  date: { type: String, required: true },
  description: String,
  image: String,
  url: String,
  featured: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
}, { timestamps: true });

// 8. Blog Schema
const BlogSchema = new Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  slug: { type: String, required: true },
  excerpt: String,
  content: String,
  featuredImage: String,
  category: String,
  tags: [String],
  publishedAt: { type: String, required: true },
  readTime: Number,
}, { timestamps: true });

// 9. Service Schema
const ServiceSchema = new Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  slug: { type: String, required: true },
  icon: String,
  shortDescription: String,
  fullDescription: String,
  features: [String],
  technologies: [String],
  deliverables: [String],
  pricing: {
    startingPrice: Number,
    priceType: { type: String, enum: ["hourly", "project", "monthly", "custom"] },
    description: String,
  },
  timeline: String,
  featured: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
}, { timestamps: true });

// 10. Testimonial Schema
const TestimonialSchema = new Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  position: { type: String, required: true },
  company: { type: String, required: true },
  avatar: String,
  testimonial: { type: String, required: true },
  rating: { type: Number, min: 1, max: 5 },
  date: String,
  linkedinUrl: String,
  companyLogo: String,
  featured: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
}, { timestamps: true });

// 11. Contact Submission Schema
const ContactSubmissionSchema = new Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject: String,
  message: { type: String, required: true },
  submittedAt: { type: String, required: true },
  status: { type: String, enum: ["new", "archived"], default: "new" },
  notes: String,
}, { timestamps: true });

// 12. Navigation Schema
const NavigationItemSchema = new Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  href: { type: String, required: true },
  icon: { type: String, required: true },
  isExternal: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
}, { timestamps: true });

// 13. Site Settings Schema (Singleton)
const SiteSettingsSchema = new Schema({
  id: { type: String, default: "singleton-siteSettings", unique: true },
  siteTitle: { type: String, required: true },
  siteDescription: String,
  siteKeywords: [String],
  siteLogo: String,
  favicon: String,
  ogImage: String,
  primaryColor: String,
  secondaryColor: String,
  accentColor: String,
  ctaText: String,
  ctaUrl: String,
  heroHeadline: String,
  heroSubheadline: String,
  heroBackground: String,
  showBlog: { type: Boolean, default: true },
  showServices: { type: Boolean, default: true },
  showTestimonials: { type: Boolean, default: true },
  googleAnalyticsId: String,
  facebookPixelId: String,
  twitterHandle: String,
  footer: {
    text: String,
    copyrightText: String,
    links: [{ title: String, url: String }],
  },
  maintenanceMode: { type: Boolean, default: false },
  maintenanceMessage: String,
  allowedAdmins: [String],
}, { timestamps: true });

// 14. Draft Document Schema
const DraftDocumentSchema = new Schema({
  documentId: { type: String, required: true },
  collectionName: { type: String, required: true },
  data: { type: Schema.Types.Mixed, required: true },
  updatedBy: { type: String, required: true },
}, { timestamps: true });
DraftDocumentSchema.index({ collectionName: 1, documentId: 1 }, { unique: true });

// 15. Draft History Schema
const DraftHistorySchema = new Schema({
  id: { type: String, required: true, unique: true },
  documentId: { type: String, required: true },
  collectionName: { type: String, required: true },
  action: { type: String, enum: ["draft_save", "publish", "discard", "restore"], required: true },
  title: String,
  snapshot: { type: Schema.Types.Mixed, required: true },
  author: { type: String, required: true },
  changeSummary: String,
  timestamp: { type: String, required: true },
}, { timestamps: true });
DraftHistorySchema.index({ collectionName: 1, documentId: 1, createdAt: -1 });

// 16. Media Asset Schema (Media Library)
const MediaAssetSchema = new Schema({
  id: { type: String, required: true, unique: true },
  url: { type: String, required: true },
  name: { type: String, required: true },
  size: Number,
  type: String,
  folder: { type: String, default: "general" },
  source: { type: String, default: "uploadthing" },
  alt: String,
}, { timestamps: true });
MediaAssetSchema.index({ createdAt: -1 });

export const MongoProfile = getModel("Profile", ProfileSchema);
export const MongoProject = getModel("Project", ProjectSchema);
export const MongoSkill = getModel("Skill", SkillSchema);
export const MongoExperience = getModel("Experience", ExperienceSchema);
export const MongoEducation = getModel("Education", EducationSchema);
export const MongoCertification = getModel("Certification", CertificationSchema);
export const MongoAchievement = getModel("Achievement", AchievementSchema);
export const MongoBlog = getModel("Blog", BlogSchema);
export const MongoService = getModel("Service", ServiceSchema);
export const MongoTestimonial = getModel("Testimonial", TestimonialSchema);
export const MongoContactSubmission = getModel("ContactSubmission", ContactSubmissionSchema);
export const MongoNavigationItem = getModel("NavigationItem", NavigationItemSchema);
export const MongoSiteSettings = getModel("SiteSettings", SiteSettingsSchema);
export const MongoDraftDocument = getModel("DraftDocument", DraftDocumentSchema);
export const MongoDraftHistory = getModel("DraftHistory", DraftHistorySchema);
export const MongoMediaAsset = getModel("MediaAsset", MediaAssetSchema);
