import { NextRequest, NextResponse } from "next/server";
import { getDocumentHistory, saveDocumentDraft } from "@/lib/db-service";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const collection = searchParams.get("collection");
    const documentId = searchParams.get("documentId");

    if (!collection || !documentId) {
      return NextResponse.json(
        { error: "Both collection and documentId query parameters are required." },
        { status: 400 }
      );
    }

    const history = await getDocumentHistory(collection, documentId);
    return NextResponse.json({ success: true, history });
  } catch (error: any) {
    console.error("GET /api/studio/history error:", error);
    return NextResponse.json({ error: error?.message || "Failed to load history" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { collectionName, documentId, data, author, changeSummary } = body;

    if (!collectionName || !documentId || !data) {
      return NextResponse.json(
        { error: "collectionName, documentId, and data are required." },
        { status: 400 }
      );
    }

    const result = await saveDocumentDraft(
      collectionName,
      documentId,
      data,
      author || "admin",
      changeSummary
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("POST /api/studio/history error:", error);
    return NextResponse.json({ error: error?.message || "Failed to save draft" }, { status: 500 });
  }
}
