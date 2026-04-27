#!/usr/bin/env node
// Seed blog posts from static data into Cloud SQL
// Run: node scripts/seed-blog.mjs

import pg from 'pg';
import { readFileSync } from 'fs';
import { createRequire } from 'module';

const { Pool } = pg;

const pool = new Pool({
  host: '104.197.216.35',
  port: 5432,
  user: 'focus_app',
  password: 'FocusHealth2026!$ecure',
  database: 'focus_health',
  ssl: { rejectUnauthorized: false },
});

// Load blog posts via require trick
const require = createRequire(import.meta.url);

// We'll dynamically build the data from the compiled output
// Since we can't directly import TypeScript, read and parse manually
// Alternatively: run tsx to load TS directly
console.log('Connecting to Cloud SQL...');

async function seed() {
  const client = await pool.connect();
  try {
    // Check existing count
    const { rows: existing } = await client.query('SELECT COUNT(*) FROM blog_posts');
    console.log(`Existing blog posts: ${existing[0].count}`);

    if (parseInt(existing[0].count) > 0) {
      console.log('Blog posts already seeded. Skipping.');
      return;
    }

    console.log('No posts found, seeding from static data...');
    console.log('Run: npx tsx scripts/seed-blog-tsx.ts to seed');
  } finally {
    client.release();
  }
  await pool.end();
}

seed().catch(console.error);
