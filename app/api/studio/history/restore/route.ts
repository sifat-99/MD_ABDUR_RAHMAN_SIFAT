import { NextRequest, NextResponse } from "next/server";
import { restoreDocumentHistory } from "@/lib/db-service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { historyId, author } = body;

    if (!historyId) {
      return NextResponse.json({ error: "historyId is required." }, { status: 400 });
    }

    const result = await restoreDocumentHistory(historyId, author || "admin");
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("POST /api/studio/history/restore error:", error);
    return NextResponse.json({ error: error?.message || "Failed to restore history" }, { status: 500 });
  }
}
