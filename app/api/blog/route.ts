import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { query, queryOne } from "@/lib/db";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/admin-auth";

async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  return verifyAdminSessionToken(token);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const publishedOnly = searchParams.get("published") !== "false";

  const rows = await query(
    `SELECT * FROM blog_posts ${publishedOnly ? "WHERE published = TRUE" : ""}
     ORDER BY published_at DESC`
  );
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { title, slug, excerpt, content, category, tags, author, author_role, cover_image, published } = body;

  if (!title || !slug) {
    return NextResponse.json({ error: "title and slug are required" }, { status: 400 });
  }

  const post = await queryOne(
    `INSERT INTO blog_posts (title, slug, excerpt, content, category, tags, author, author_role, cover_image, published, published_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,NOW())
     RETURNING *`,
    [title, slug, excerpt || "", content || "", category || "Insights", tags || [], author || "Focus Health Team", author_role || null, cover_image || null, published !== false]
  );

  return NextResponse.json(post, { status: 201 });
}
