import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { query, queryOne } from "@/lib/db";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/admin-auth";

async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  return verifyAdminSessionToken(token);
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await queryOne(
    `SELECT * FROM blog_posts WHERE id = $1 OR slug = $1`,
    [id]
  );
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(post);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { title, slug, excerpt, content, category, tags, author, author_role, cover_image, published } = body;

  const post = await queryOne(
    `UPDATE blog_posts SET
       title=$1, slug=$2, excerpt=$3, content=$4, category=$5, tags=$6,
       author=$7, author_role=$8, cover_image=$9, published=$10, updated_at=NOW()
     WHERE id=$11
     RETURNING *`,
    [title, slug, excerpt, content, category, tags, author, author_role, cover_image, published, id]
  );

  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(post);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await query(`DELETE FROM blog_posts WHERE id = $1`, [id]);
  return NextResponse.json({ success: true });
}
