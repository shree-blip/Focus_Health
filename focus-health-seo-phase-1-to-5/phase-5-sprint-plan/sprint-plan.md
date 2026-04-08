# Phase 5: SEO Sprint Plan

---

## Sprint Overview

| Sprint | Name | Duration | Focus |
|--------|------|----------|-------|
| 1 | Critical Fixes | Week 1–2 | Technical errors, schema fixes, sitemap, navigation |
| 2 | Metadata & Headings | Week 3–4 | Title tags, meta descriptions, H1 tags, Open Graph |
| 3 | Core Content & Linking | Week 5–8 | Content expansion, internal linking, cluster architecture |
| 4 | Insights & Supporting Content | Week 9–12 | New articles, existing article improvements, content calendar |
| 5 | Refinement & Performance | Week 13–16 | Schema enhancements, performance, monitoring, iteration |

---

## Sprint 1: Critical Fixes (Week 1–2)

### Task 1.1 — Fix Placeholder Phone Numbers in ER Schemas

| Attribute | Detail |
|-----------|--------|
| Affected Pages | `/facilities/er-of-irving`, `/facilities/er-of-lufkin`, `/facilities/er-of-white-rock` |
| Issue | Schema `telephone` field contains placeholder values |
| Why It Matters | Invalid phone numbers in structured data can trigger Google penalties and erode trust in rich results |
| Recommended Fix | Replace placeholder values with verified, facility-specific phone numbers in each page's structured data |
| File(s) | `src/legacy-pages/facilities/ERofIrving.tsx`, `ERofLufkin.tsx`, `ERofWhiteRock.tsx` and/or `src/lib/structuredData.ts` |
| Owner | Developer |
| Priority | P0 — Critical |
| Expected Impact | Schema validation pass; eligibility for local rich results |
| Dependencies | Obtain real phone numbers from operations team |

### Task 1.2 — Add Missing Street Addresses to Wellness Clinic Schemas

| Attribute | Detail |
|-----------|--------|
| Affected Pages | `/facilities/irving-wellness-clinic`, `/facilities/naperville-wellness-clinic` |
| Issue | Schema `address.streetAddress` is missing or empty |
| Why It Matters | Incomplete NAP data weakens local SEO signals and Google Business Profile alignment |
| Recommended Fix | Add verified street addresses to the `PostalAddress` block in each clinic's structured data |
| File(s) | Facility page components and/or `src/lib/structuredData.ts` |
| Owner | Developer |
| Priority | P0 — Critical |
| Expected Impact | Complete NAP consistency; improved local pack eligibility |
| Dependencies | Verify addresses against Google Business Profile listings |

### Task 1.3 — Add First Choice ER Houston to Sitemap

| Attribute | Detail |
|-----------|--------|
| Affected Pages | `/track-record/first-choice-emergency-room` |
| Issue | Page exists but is not included in `sitemap.ts` |
| Why It Matters | Pages missing from the sitemap are less likely to be crawled and indexed |
| Recommended Fix | Add the URL to the `sitemap.ts` routes array |
| File(s) | `app/sitemap.ts` |
| Owner | Developer |
| Priority | P0 — Critical |
| Expected Impact | Page indexed within 1–2 crawl cycles |
| Dependencies | None |

### Task 1.4 — Add Orphaned Pages to Navigation

| Attribute | Detail |
|-----------|--------|
| Affected Pages | `/investors`, `/our-process` |
| Issue | Both pages are live and indexed but not reachable from the main navigation |
| Why It Matters | Orphaned pages receive minimal link equity and are harder for users and crawlers to discover |
| Recommended Fix | Add `/investors` and `/our-process` to the navigation menu (under a "Company" or "About" dropdown) |
| File(s) | `src/components/layout/` (Navbar/Header component) |
| Owner | Developer |
| Priority | P0 — Critical |
| Expected Impact | Improved crawl coverage; user discoverability; link equity flow |
| Dependencies | Confirm navigation structure with stakeholders |

### Task 1.5 — Fix Investors Page Title Tag

| Attribute | Detail |
|-----------|--------|
| Affected Pages | `/investors` |
| Issue | Title tag reads "Partners" instead of an investor-specific title |
| Why It Matters | Incorrect title misleads search engines and users; causes title-tag duplication with `/partners` |
| Recommended Fix | Change to "Healthcare Infrastructure Investment | Invest in Texas ER Facilities" |
| File(s) | `src/legacy-pages/Investors.tsx` or `app/investors/page.tsx` metadata |
| Owner | Developer |
| Priority | P0 — Critical |
| Expected Impact | Correct indexing; resolves title duplication |
| Dependencies | None |

### Task 1.6 — Fix Insight Article Publication Dates

| Attribute | Detail |
|-----------|--------|
| Affected Pages | All 6 insight articles at `/insights/[slug]` |
| Issue | All articles display publication date of March 2026 (future date) |
| Why It Matters | Future dates confuse search engines and erode reader trust |
| Recommended Fix | Update `datePublished` and `dateModified` to actual publication dates |
| File(s) | `src/lib/blog-posts.ts` or `src/lib/insights.ts` |
| Owner | Developer |
| Priority | P1 — High |
| Expected Impact | Correct Article schema; improved freshness signals |
| Dependencies | Determine actual publication dates |

---

## Sprint 2: Metadata & Headings (Week 3–4)

### Task 2.1 — Rewrite All Core Page Title Tags

| Attribute | Detail |
|-----------|--------|
| Affected Pages | Home, Platform, Market, Track Record, Leadership, Partners, Insights, Contact, Investors, Our Process (10 pages) |
| Issue | 9 of 10 core pages have single-word or critically under-optimised title tags |
| Why It Matters | Title tags are the single strongest on-page ranking factor. Current titles waste this signal entirely |
| Recommended Fix | Implement all recommended titles from `metadata-blueprint.md` |
| File(s) | Each page's metadata export in `app/[page]/page.tsx` or legacy page components |
| Owner | Developer |
| Priority | P0 — Critical |
| Expected Impact | Estimated 15–30% improvement in CTR for affected pages |
| Dependencies | Sprint 1.5 (Investors title) can be merged into this task |

### Task 2.2 — Rewrite All Facility Page Title Tags

| Attribute | Detail |
|-----------|--------|
| Affected Pages | All 5 facility pages + First Choice ER |
| Issue | Facility title tags lack location and service-type keywords |
| Why It Matters | Local search relies heavily on title-tag signals for geo-relevance |
| Recommended Fix | Implement facility title tag pattern: `[Name] | [Service] in [City, State] | Focus Health` |
| File(s) | Each facility page's metadata |
| Owner | Developer |
| Priority | P1 — High |
| Expected Impact | Improved local search visibility |
| Dependencies | None |

### Task 2.3 — Update All Meta Descriptions

| Attribute | Detail |
|-----------|--------|
| Affected Pages | All 16 indexed pages + 6 insight articles |
| Issue | Many meta descriptions are generic or missing keyword integration |
| Why It Matters | Well-crafted meta descriptions improve CTR from search results |
| Recommended Fix | Implement all recommended descriptions from `metadata-blueprint.md` |
| File(s) | All page metadata exports |
| Owner | Developer |
| Priority | P1 — High |
| Expected Impact | Improved CTR; clearer SERP presentation |
| Dependencies | Task 2.1 (titles first, then descriptions) |

### Task 2.4 — Audit and Fix H1 Tags

| Attribute | Detail |
|-----------|--------|
| Affected Pages | All pages |
| Issue | Some H1 tags are generic or do not contain the primary keyword |
| Why It Matters | H1 is the second-strongest on-page signal after the title tag |
| Recommended Fix | Implement recommended H1s from each page's blueprint file |
| File(s) | Page components |
| Owner | Developer |
| Priority | P1 — High |
| Expected Impact | Stronger on-page keyword relevance |
| Dependencies | None |

### Task 2.5 — Add Open Graph Tags to All Pages

| Attribute | Detail |
|-----------|--------|
| Affected Pages | All pages |
| Issue | OG tags may be incomplete or missing `og:image` |
| Why It Matters | Social sharing generates backlinks and referral traffic |
| Recommended Fix | Add `og:title`, `og:description`, `og:image` (1200×630px), `og:url`, `twitter:card` to every page |
| File(s) | `app/layout.tsx` (default) and per-page overrides |
| Owner | Developer |
| Priority | P2 — Medium |
| Expected Impact | Better social sharing appearance; indirect link acquisition |
| Dependencies | Tasks 2.1 and 2.3 (use same titles/descriptions) |

---

## Sprint 3: Core Content & Internal Linking (Week 5–8)

### Task 3.1 — Expand Thin Pages

| Attribute | Detail |
|-----------|--------|
| Affected Pages | `/contact` (~70 words), `/market` (~175 words), `/platform` (~275 words), `/facilities/er-of-white-rock` (~200 words) |
| Issue | Content is below the 300-word minimum for meaningful indexation |
| Why It Matters | Thin content pages struggle to rank and may be flagged as low-quality |
| Recommended Fix | Add sections per each page's blueprint (contact details, map, FAQ, insurance info, etc.) |
| File(s) | Respective page components |
| Owner | Content + Developer |
| Priority | P1 — High |
| Expected Impact | Pages become eligible for broader keyword targeting |
| Dependencies | Content must be written and approved before implementation |

### Task 3.2 — Implement Content Cluster Internal Links

| Attribute | Detail |
|-----------|--------|
| Affected Pages | All core pages and insight articles |
| Issue | Critical internal linking gaps (see `internal-linking-gap-analysis.md` and `content-cluster-blueprint.md`) |
| Why It Matters | Internal links distribute link equity and signal topical relationships to search engines |
| Recommended Fix | Add all pillar-to-spoke and spoke-to-pillar links defined in `content-cluster-blueprint.md` |
| File(s) | All page and article components |
| Owner | Developer |
| Priority | P1 — High |
| Expected Impact | Improved crawl efficiency; stronger topical authority; better page-level rankings |
| Dependencies | Task 1.4 (navigation fixes) should be completed first |

### Task 3.3 — Add Body-Content Links to /insights from All Pages

| Attribute | Detail |
|-----------|--------|
| Affected Pages | Homepage, Platform, Market, Track Record, Partners |
| Issue | Zero pages link to `/insights` from body content |
| Why It Matters | The insights hub receives no internal link equity from body content |
| Recommended Fix | Add a contextual link to `/insights` or a specific article from each core page |
| File(s) | Core page components |
| Owner | Developer |
| Priority | P1 — High |
| Expected Impact | Insights hub begins accumulating link equity and ranking potential |
| Dependencies | None |

### Task 3.4 — Add "Related Facilities" Cross-Links

| Attribute | Detail |
|-----------|--------|
| Affected Pages | All 5 active facility pages |
| Issue | Facility pages do not link to each other |
| Why It Matters | Cross-linking facility pages distributes local SEO equity and reduces bounce rate |
| Recommended Fix | Add a "Related Facilities" section to each facility page listing 2–3 other facilities |
| File(s) | Facility page components |
| Owner | Developer |
| Priority | P2 — Medium |
| Expected Impact | Improved facility page authority; better user navigation |
| Dependencies | None |

### Task 3.5 — Add FAQ Sections to Key Pages

| Attribute | Detail |
|-----------|--------|
| Affected Pages | `/partners`, `/investors`, facility pages |
| Issue | No FAQ content on conversion or local pages |
| Why It Matters | FAQs target long-tail queries and are eligible for FAQ rich results |
| Recommended Fix | Add 6–8 FAQ items per page with FAQPage schema |
| File(s) | Page components + structured data |
| Owner | Content + Developer |
| Priority | P2 — Medium |
| Expected Impact | Long-tail keyword capture; rich result eligibility |
| Dependencies | FAQ content must be written and approved |

---

## Sprint 4: Insights & Supporting Content (Week 9–12)

### Task 4.1 — Improve Existing Insight Articles

| Attribute | Detail |
|-----------|--------|
| Affected Pages | All 6 existing insight articles |
| Issue | Most are below the 1,200-word minimum; none have closing CTAs; no cross-article links |
| Why It Matters | Thin, unlinked articles do not build topical authority |
| Recommended Fix | Expand each article per `insight-content-blueprint.md`; add CTAs and internal links |
| File(s) | `src/lib/blog-posts.ts` or `src/lib/insights.ts` |
| Owner | Content + Developer |
| Priority | P1 — High |
| Expected Impact | Stronger article rankings; improved conversion from content |
| Dependencies | Task 1.6 (date fixes) should be completed first |

### Task 4.2 — Publish 3 New Market Intelligence Articles

| Attribute | Detail |
|-----------|--------|
| New Articles | "DFW Healthcare Market Analysis", "Houston Freestanding ER Landscape", "Austin–San Antonio Healthcare Corridor" |
| Issue | No local market content exists — a major content gap |
| Why It Matters | Local market articles target geo-specific long-tail keywords and strengthen the Market Intelligence cluster |
| Recommended Fix | Write and publish per `insight-content-blueprint.md` standards |
| Owner | Content |
| Priority | P1 — High |
| Expected Impact | 3 new indexable pages targeting local market queries |
| Dependencies | Keyword map from `page-level-keyword-map.md` |

### Task 4.3 — Publish 3 New Investor Education Articles

| Attribute | Detail |
|-----------|--------|
| New Articles | "Healthcare Infrastructure vs Traditional Real Estate Returns", "Due Diligence Checklist for ER Investors", "Understanding ER Revenue Models" |
| Issue | Only 1 investor-focused article exists |
| Why It Matters | Investor education content supports the Investment & Partnership cluster and feeds the partner conversion funnel |
| Recommended Fix | Write and publish per `insight-content-blueprint.md` standards |
| Owner | Content |
| Priority | P2 — Medium |
| Expected Impact | Expanded topical authority in investment vertical; lead nurturing |
| Dependencies | None |

### Task 4.4 — Add Newsletter Subscribe CTA to Insights Hub

| Attribute | Detail |
|-----------|--------|
| Affected Pages | `/insights` |
| Issue | No email capture mechanism on the content hub |
| Why It Matters | Newsletter subscribers become a re-engageable audience for content distribution |
| Recommended Fix | Add email capture form below the article grid with privacy notice |
| File(s) | Insights hub page component |
| Owner | Developer |
| Priority | P2 — Medium |
| Expected Impact | New lead capture channel |
| Dependencies | Email provider integration |

---

## Sprint 5: Refinement & Performance (Week 13–16)

### Task 5.1 — Add HowTo Schema to Our Process Page

| Attribute | Detail |
|-----------|--------|
| Affected Pages | `/our-process` |
| Issue | No HowTo schema despite step-by-step content |
| Why It Matters | HowTo schema enables rich results in Google search |
| Recommended Fix | Add HowTo structured data with named steps and estimated durations |
| File(s) | `src/lib/structuredData.ts` |
| Owner | Developer |
| Priority | P2 — Medium |
| Expected Impact | Rich result eligibility |
| Dependencies | None |

### Task 5.2 — Add Breadcrumb Schema to All Sub-Pages

| Attribute | Detail |
|-----------|--------|
| Affected Pages | All facility pages, insight articles, track record sub-pages |
| Issue | No BreadcrumbList schema |
| Why It Matters | Breadcrumbs improve SERP presentation and site hierarchy signals |
| Recommended Fix | Add BreadcrumbList structured data to all sub-pages |
| File(s) | Layout components or `src/lib/structuredData.ts` |
| Owner | Developer |
| Priority | P2 — Medium |
| Expected Impact | Enhanced SERP display |
| Dependencies | None |

### Task 5.3 — Implement ContactPage Schema

| Attribute | Detail |
|-----------|--------|
| Affected Pages | `/contact` |
| Issue | Uses generic WebPage schema instead of ContactPage |
| Why It Matters | ContactPage type provides clearer signals to search engines |
| Recommended Fix | Change `@type` from `WebPage` to `ContactPage` and add `contactPoint` |
| File(s) | Contact page component or `src/lib/structuredData.ts` |
| Owner | Developer |
| Priority | P3 — Low |
| Expected Impact | Minor schema accuracy improvement |
| Dependencies | Task 3.1 (contact page content expansion) |

### Task 5.4 — Performance Audit and Optimisation

| Attribute | Detail |
|-----------|--------|
| Affected Pages | All pages |
| Issue | No formal performance baseline established |
| Why It Matters | Core Web Vitals are a confirmed ranking factor |
| Recommended Fix | Run Lighthouse audit; optimise images, fonts, JS bundles; target LCP < 2.5s, CLS < 0.1, INP < 200ms |
| Owner | Developer |
| Priority | P2 — Medium |
| Expected Impact | Improved Core Web Vitals scores; indirect ranking benefit |
| Dependencies | All content changes should be complete before benchmarking |

### Task 5.5 — Set Up Monitoring and Reporting

| Attribute | Detail |
|-----------|--------|
| Affected Pages | All pages |
| Issue | No ongoing SEO monitoring framework |
| Why It Matters | SEO gains require continuous measurement and iteration |
| Recommended Fix | Configure Google Search Console alerts; set up monthly ranking tracking for top 33 keywords; schedule quarterly content audits |
| Owner | SEO / Marketing |
| Priority | P2 — Medium |
| Expected Impact | Data-driven iteration; early detection of ranking drops |
| Dependencies | Google Search Console access |

---

## Sprint Summary

| Sprint | Tasks | P0 | P1 | P2 | P3 |
|--------|-------|----|----|----|-----|
| 1 | 6 | 5 | 1 | 0 | 0 |
| 2 | 5 | 1 | 3 | 1 | 0 |
| 3 | 5 | 0 | 3 | 2 | 0 |
| 4 | 4 | 0 | 2 | 2 | 0 |
| 5 | 5 | 0 | 0 | 4 | 1 |
| **Total** | **25** | **6** | **9** | **9** | **1** |
