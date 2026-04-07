# Page Audit: Insights Hub

**URL:** https://www.getfocushealth.com/insights  
**Page Type:** Blog / Content Hub  
**Status:** Live  
**Priority Level:** High  

---

## Current H1

Not explicitly set in the hub page — relies on the component's heading within `BlogListClient`.

---

## Summary of Current Content

A filterable blog listing page displaying six published insight articles. Categorised into four filter tabs:
- Market Analysis (2 posts)
- Clinical Operations (2 posts)
- Company News (2 posts)
- Regulatory Compliance (0 posts — empty category)

Each post card displays title, excerpt, category, date, and author attribution.

**Published Posts:**

| Title | Slug | Category | Date |
|-------|------|----------|------|
| Why Texas Is a Prime Market for Freestanding Emergency Rooms | `texas-prime-market-for-fsers` | Market Analysis | 2026-03-15 |
| How Focus Health Builds, Funds, and Operates with One Platform | `focus-health-build-fund-operate-platform` | Clinical Operations | 2026-03-16 |
| What Investors Should Look for in Healthcare Infrastructure Operators | `investor-checklist-healthcare-infrastructure-operators` | Company News | 2026-03-17 |
| How Focus Health Evaluates New Healthcare Markets Before Expansion | `focus-health-market-evaluation-expansion-playbook` | Market Analysis | 2026-03-18 |
| Operational Readiness: What Happens in the 90 Days Before a Facility Opens | `operational-readiness-90-days-before-facility-opening` | Clinical Operations | 2026-03-19 |
| Focus Health Growth Update: Building a Stronger Pipeline for 2026 | `focus-health-growth-update-2026-pipeline` | Company News | 2026-03-20 |

---

## Current Primary Topic

Expert analysis and company updates on healthcare infrastructure, freestanding ER operations, market analysis, and investment strategy.

---

## Current CTA

Individual post cards link to their full article pages. No additional hub-level CTAs.

---

## Internal Linking Observations

- Each post links to its detail page at `/insights/[slug]`
- No hub-level links to other site sections (partners, investors, track record)
- No sidebar or footer cross-links on the hub page
- Old `/blog` and `/blog/[slug]` routes redirect to `/insights` equivalents (good)

---

## UX Observations

- Category filters are functional and well-designed
- Regulatory Compliance category is visible but empty — creates a poor impression
- All six posts were published within five consecutive days — appears unnatural
- No pagination system — not an issue with six posts but will need addressing at scale
- No search functionality within the insights hub

---

## Content Observations

- Six posts is a reasonable starting library but insufficient for sustained SEO performance
- Posts cover three of four listed categories — Regulatory Compliance has zero content
- No author archive or bio pages
- No related posts section on the hub page
- Each post has Article schema on its detail page — a positive signal

---

## SEO Observations

- **Title tag:** "Insights" — extremely weak; 8 characters, no keywords or brand
- **Meta description:** Adequate — "Expert analysis on healthcare infrastructure, freestanding ER operations, and investment strategy"
- **Structured data:** WebPageStructuredData on the hub; Article schema on individual posts
- **Canonical:** `/insights`
- **Redirect handling:** `/blog` → `/insights` is correctly implemented
- The hub page itself has minimal crawlable text beyond post titles and excerpts
- No introductory paragraph or SEO-focused hub content

---

## Metadata Observations

- Title tag needs expansion
- Meta description is competent but could include more specific terms
- Missing `CollectionPage` or `Blog` schema on the hub page

---

## What Is Missing

1. Keyword-rich title tag (e.g., "Healthcare Insights | ER Operations, Market Analysis & Investment | Focus Health")
2. Hub page introductory paragraph with target keywords
3. Content in the Regulatory Compliance category
4. Author archive pages or bio sections
5. Related content recommendations
6. Pagination or infinite scroll for scaling
7. Hub-level CTAs (newsletter signup, partner CTA)
8. `CollectionPage` or `Blog` schema on the hub page
9. Links to core site pages from the hub

---

## What Should Be Improved

1. **Title tag:** Expand to include primary keywords
2. **Hub intro:** Add a 100–200 word introductory paragraph above the post grid
3. **Category management:** Either populate Regulatory Compliance with content or remove the empty filter
4. **Publishing cadence:** Future posts should be spread across weeks/months for natural appearance
5. **Schema:** Add `Blog` or `CollectionPage` schema on the hub page
6. **Cross-linking:** Add sidebar or footer links to `/partners`, `/investors`, `/track-record`
7. **Newsletter CTA:** Add an email subscription form on the hub page
