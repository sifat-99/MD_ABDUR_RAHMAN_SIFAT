import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import {
  MongoMediaAsset,
  MongoProject,
  MongoProfile,
  MongoCertification,
  MongoBlog,
  MongoService,
} from "@/models";
import type { MediaAsset } from "@/types/portfolio";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.toLowerCase();
    const folder = searchParams.get("folder");

    await connectToDatabase();

    // 1. Fetch registered assets from media collection
    const query: any = {};
    if (folder && folder !== "all") {
      query.folder = folder;
    }
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    const registeredAssets = await MongoMediaAsset.find(query)
      .sort({ createdAt: -1 })
      .lean();

    const mediaList: MediaAsset[] = registeredAssets.map((doc: any) => ({
      id: doc.id || doc._id.toString(),
      url: doc.url,
      name: doc.name || "Media File",
      size: doc.size,
      type: doc.type || "image/png",
      folder: doc.folder || "general",
      source: doc.source || "uploadthing",
      alt: doc.alt,
      createdAt: doc.createdAt?.toISOString?.() || new Date().toISOString(),
    }));

    // 2. Also harvest existing images across projects, profile, services if not yet registered
    const existingUrls = new Set(mediaList.map((m) => m.url));

    const [profile, projects, certs, blogs, services] = await Promise.all([
      MongoProfile.findOne({ id: "singleton-profile" }).lean(),
      MongoProject.find().lean(),
      MongoCertification.find().lean(),
      MongoBlog.find().lean(),
      MongoService.find().lean(),
    ]);

    const harvested: MediaAsset[] = [];

    if (profile && (profile as any).profileImage && !existingUrls.has((profile as any).profileImage)) {
      harvested.push({
        id: "media_profile",
        url: (profile as any).profileImage,
        name: "Profile Photo",
        folder: "profile",
        source: "sanity",
        createdAt: new Date().toISOString(),
      });
      existingUrls.add((profile as any).profileImage);
    }

    for (const pr of projects || []) {
      const p = pr as any;
      if (p.coverImage && !existingUrls.has(p.coverImage)) {
        harvested.push({
          id: `media_${p.id}`,
          url: p.coverImage,
          name: `${p.title} Cover`,
          folder: "projects",
          source: "sanity",
          createdAt: new Date().toISOString(),
        });
        existingUrls.add(p.coverImage);
      }
    }

    for (const cr of certs || []) {
      const c = cr as any;
      if (c.certificateImage && !existingUrls.has(c.certificateImage)) {
        harvested.push({
          id: `media_${c.id}`,
          url: c.certificateImage,
          name: `${c.title} Certificate`,
          folder: "certifications",
          source: "sanity",
          createdAt: new Date().toISOString(),
        });
        existingUrls.add(c.certificateImage);
      }
    }

    for (const sr of services || []) {
      const s = sr as any;
      if (s.icon && (s.icon.startsWith("http") || s.icon.startsWith("/")) && !existingUrls.has(s.icon)) {
        harvested.push({
          id: `media_${s.id}`,
          url: s.icon,
          name: `${s.title} Icon`,
          folder: "services",
          source: "sanity",
          createdAt: new Date().toISOString(),
        });
        existingUrls.add(s.icon);
      }
    }

    const allMedia = [...mediaList, ...harvested];

    return NextResponse.json({ success: true, media: allMedia });
  } catch (error: any) {
    console.error("GET /api/studio/media error:", error);
    return NextResponse.json({ error: error?.message || "Failed to load media" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url, name, size, type, folder, source, alt } = body;

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    await connectToDatabase();

    const id = `media_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const asset = await MongoMediaAsset.create({
      id,
      url,
      name: name || "Asset",
      size: size || 0,
      type: type || "image/png",
      folder: folder || "general",
      source: source || "uploadthing",
      alt: alt || "",
    });

    return NextResponse.json({ success: true, asset });
  } catch (error: any) {
    console.error("POST /api/studio/media error:", error);
    return NextResponse.json({ error: error?.message || "Failed to save asset" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    await connectToDatabase();
    await MongoMediaAsset.deleteOne({ id });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE /api/studio/media error:", error);
    return NextResponse.json({ error: error?.message || "Failed to delete asset" }, { status: 500 });
  }
}
