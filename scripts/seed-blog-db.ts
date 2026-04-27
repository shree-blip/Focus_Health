#!/usr/bin/env tsx
// Seed blog posts from static data into Cloud SQL
// Run: npx tsx scripts/seed-blog-db.ts

import pkg from 'pg';
const { Pool } = pkg;
import { BLOG_POSTS } from '../src/lib/blog-posts';

const pool = new Pool({
  host: '104.197.216.35',
  port: 5432,
  user: 'focus_app',
  password: 'FocusHealth2026!$ecure',
  database: 'focus_health',
  ssl: { rejectUnauthorized: false },
});

async function seed() {
  const client = await pool.connect();
  try {
    const { rows: existing } = await client.query('SELECT COUNT(*) FROM blog_posts');
    const count = parseInt(existing[0].count);
    console.log(`Existing blog posts in DB: ${count}`);

    if (count > 0) {
      console.log('Already seeded. Use --force to overwrite.');
      if (!process.argv.includes('--force')) return;
      await client.query('TRUNCATE blog_posts RESTART IDENTITY CASCADE');
      console.log('Cleared existing posts.');
    }

    console.log(`Seeding ${BLOG_POSTS.length} posts...`);
    let inserted = 0;

    for (const post of BLOG_POSTS) {
      await client.query(
        `INSERT INTO blog_posts (slug, title, excerpt, content, category, author, cover_image, published, published_at, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
         ON CONFLICT (slug) DO NOTHING`,
        [
          post.slug,
          post.title,
          post.excerpt ?? '',
          post.content ?? '',
          post.category ?? 'Insights',
          post.author ?? 'Focus Health Team',
          post.coverImage ?? null,
          post.status === 'published',
          post.publishedAt ?? new Date().toISOString(),
          post.publishedAt ?? new Date().toISOString(),
          post.publishedAt ?? new Date().toISOString(),
        ]
      );
      inserted++;
    }

    console.log(`✓ Seeded ${inserted} blog posts`);
  } finally {
    client.release();
  }
  await pool.end();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
