# Phase 5: Quick Wins

Low-effort, high-impact items that can be completed in under 1 hour each. Ordered by expected impact.

---

## Quick Win 1 — Rewrite 10 Core Page Title Tags

| Attribute | Detail |
|-----------|--------|
| Effort | 30 minutes |
| Impact | Very High |
| Pages | Home, Platform, Market, Track Record, Leadership, Partners, Insights, Contact, Investors, Our Process |
| Current State | 9 of 10 have single-word titles (e.g., "Platform", "Market") |
| Action | Replace each title with the recommended version from `metadata-blueprint.md` |
| Why First | Title tags are the highest-impact on-page ranking signal. This single change addresses the biggest SEO deficiency on the site |

---

## Quick Win 2 — Fix Investors Page Title to "Healthcare Infrastructure Investment"

| Attribute | Detail |
|-----------|--------|
| Effort | 5 minutes |
| Impact | High |
| Pages | `/investors` |
| Current State | Title reads "Partners" (wrong page) |
| Action | Change title to "Healthcare Infrastructure Investment | Invest in Texas ER Facilities" |
| Why | Resolves title duplication with `/partners` and corrects search engine indexing |

---

## Quick Win 3 — Add First Choice ER Houston to Sitemap

| Attribute | Detail |
|-----------|--------|
| Effort | 5 minutes |
| Impact | High |
| Pages | `/track-record/first-choice-emergency-room` |
| Current State | Page exists but is missing from `app/sitemap.ts` |
| Action | Add `{ url: 'https://www.getfocushealth.com/track-record/first-choice-emergency-room', lastModified: new Date() }` to the sitemap array |
| Why | Ensures Google discovers and indexes the page |

---

## Quick Win 4 — Add /investors and /our-process to Navigation

| Attribute | Detail |
|-----------|--------|
| Effort | 15 minutes |
| Impact | High |
| Pages | `/investors`, `/our-process` |
| Current State | Both pages are orphaned from the main navigation |
| Action | Add both links to the navigation component (e.g., under a "Company" dropdown) |
| Why | Orphaned pages receive minimal crawl priority and user traffic |

---

## Quick Win 5 — Replace Placeholder Phone Numbers in ER Schemas

| Attribute | Detail |
|-----------|--------|
| Effort | 15 minutes |
| Impact | High |
| Pages | `/facilities/er-of-irving`, `/facilities/er-of-lufkin`, `/facilities/er-of-white-rock` |
| Current State | Schema `telephone` field contains placeholder values |
| Action | Replace with verified, facility-specific phone numbers |
| Why | Invalid structured data can trigger Google penalties |

---

## Quick Win 6 — Add Missing Street Addresses to Wellness Clinic Schemas

| Attribute | Detail |
|-----------|--------|
| Effort | 10 minutes |
| Impact | High |
| Pages | `/facilities/irving-wellness-clinic`, `/facilities/naperville-wellness-clinic` |
| Current State | Schema `address.streetAddress` is missing |
| Action | Add verified street addresses from Google Business Profile |
| Why | Incomplete NAP data weakens local SEO |

---

## Quick Win 7 — Correct Insight Article Publication Dates

| Attribute | Detail |
|-----------|--------|
| Effort | 15 minutes |
| Impact | Medium |
| Pages | All 6 insight articles |
| Current State | All show March 2026 publication date (future) |
| Action | Update to actual publication or last-modified dates |
| Why | Future dates confuse search engines and reduce trust |

---

## Quick Win 8 — Add Body-Content Link to /insights from Homepage

| Attribute | Detail |
|-----------|--------|
| Effort | 10 minutes |
| Impact | Medium |
| Pages | Homepage (and subsequently other core pages) |
| Current State | Zero body-content links point to `/insights` from any page |
| Action | Add "Read our latest insights" link in a relevant section |
| Why | The insights hub receives no internal link equity from body content |

---

## Quick Win 9 — Rewrite 5 Facility Page Title Tags

| Attribute | Detail |
|-----------|--------|
| Effort | 15 minutes |
| Impact | Medium |
| Pages | All 5 active facility pages |
| Current State | Facility titles lack location and service-type keywords |
| Action | Implement pattern: `[Name] | [Service] in [City, State] | Focus Health` |
| Why | Local search depends on title-tag geo-signals |

---

## Quick Win 10 — Add Self-Referencing Canonical to All Pages (Verify)

| Attribute | Detail |
|-----------|--------|
| Effort | 10 minutes |
| Impact | Medium |
| Pages | All pages |
| Current State | Believed clean, but not formally verified |
| Action | Audit every page's `<link rel="canonical">` tag; fix any missing or incorrect values |
| Why | Canonical tags prevent duplicate content issues |

---

## Total Estimated Time: ~2.5 hours

These 10 quick wins address 80% of the critical SEO issues identified in the gap analysis. They should be completed before any content-focused work begins.
