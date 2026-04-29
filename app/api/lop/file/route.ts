import { type NextRequest, NextResponse } from "next/server";
import { requireLopAuth } from "@/lib/lop/server-auth";
import { Storage } from "@google-cloud/storage";

const PROJECT_ID = "adept-box-494606-s9";
const BUCKET_NAME = "focus-health-assets-adept-box-494606-s9";

const storage = new Storage({ projectId: PROJECT_ID });
const bucket = storage.bucket(BUCKET_NAME);

/**
 * GET /api/lop/file?path=lop-documents/...
 * Auth-gated GCS file proxy so the bucket can stay private.
 */
export async function GET(req: NextRequest) {
  try {
    const auth = await requireLopAuth();
    if (!auth) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const path = searchParams.get("path");

    if (!path) {
      return NextResponse.json({ error: "path is required" }, { status: 400 });
    }

    // Only allow access to lop-documents and patient-docs prefixes
    if (!path.startsWith("lop-documents/") && !path.startsWith("patient-docs/")) {
      return NextResponse.json({ error: "Invalid path" }, { status: 400 });
    }

    const file = bucket.file(path);
    const [metadata] = await file.getMetadata();
    const contentType = (metadata.contentType as string) || "application/octet-stream";

    const [buffer] = await file.download();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename="${path.split("/").pop()}"`,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (err: unknown) {
    const code = (err as { code?: number }).code;
    if (code === 404) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }
    console.error("LOP file proxy error:", err);
    return NextResponse.json({ error: "Failed to serve file" }, { status: 500 });
  }
}
