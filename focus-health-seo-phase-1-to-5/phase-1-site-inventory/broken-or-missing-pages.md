# Broken, Missing, or Thin Pages Report — Focus Health

**Domain:** https://www.getfocushealth.com  
**Last Audited:** April 2026  

---

## 1. Empty Directories (Dead Routes)

These directories exist in the codebase but contain no `page.tsx` file. They return 404 errors or fall through to the not-found page.

| Route | Expected Purpose | Status | Impact | Recommendation |
|-------|-----------------|--------|--------|----------------|
| `/track-record/er-of-irving/` | Track record detail for ER of Irving | **Empty — no page** | Low (facility page exists at `/facilities/er-of-irving`) | Either build a track-record case study page or add a redirect to `/facilities/er-of-irving` |
| `/track-record/er-of-lufkin/` | Track record detail for ER of Lufkin | **Empty — no page** | Low | Redirect to `/facilities/er-of-lufkin` or build case study |
| `/track-record/er-of-white-rock/` | Track record detail for ER of White Rock | **Empty — no page** | Low | Redirect to `/facilities/er-of-white-rock` or build case study |
| `/track-record/irving-wellness-clinic/` | Track record detail for Irving Wellness | **Empty — no page** | Low | Redirect to `/facilities/irving-wellness-clinic` or build case study |
| `/track-record/naperville-wellness-clinic/` | Track record detail for Naperville Wellness | **Empty — no page** | Low | Redirect to `/facilities/naperville-wellness-clinic` or build case study |

**Risk:** If any internal or external links point to these routes, users will encounter 404 errors. Search engine crawlers discovering these directories may log crawl errors.

---

## 2. Sitemap Omissions

| Page | URL | Status | Issue |
|------|-----|--------|-------|
| First Choice Emergency Room | `/track-record/first-choice-emergency-room` | Live | **Not included in sitemap.ts** — a fully built page with substantial content and structured data is excluded from the XML sitemap |

**Recommendation:** Add `/track-record/first-choice-emergency-room` to the static routes array in `sitemap.ts` immediately.

---

## 3. Navigation-Orphaned Pages

These pages are live and indexed but have no link in the main navbar or footer. They rely entirely on in-page cross-links for discoverability.

| Page | URL | Reachable Via |
|------|-----|---------------|
| Investors | `/investors` | Internal links from homepage, track record, our-process, facility pages |
| Our Process | `/our-process` | Internal links from track record and facility pages |

**Risk:** Pages not linked from persistent navigation receive weaker internal link equity. Search engines may interpret them as lower-priority pages. Users cannot browse directly from the nav.

**Recommendation:** Add `/investors` and `/our-process` to the footer under a secondary column, or add them to a mega-menu / dropdown under an existing nav item.

---

## 4. Thin Content Pages

| Page | URL | Issue | Word Count (Est.) | Recommendation |
|------|-----|-------|-------------------|----------------|
| Market | `/market` | Visual-heavy (SVG map, icons) with minimal text content. Very short paragraphs. | ~200 words visible text | Expand with detailed market data, FSER industry statistics, competitive landscape, growth projections |
| Contact | `/contact` | Form + scheduling widget only. No supporting text, no FAQ, no contextual information | ~80 words visible text | Add a brief intro paragraph, FAQ section, office address, and trust signals |
| Platform | `/platform` | Animated diagram and video dominate; text is minimal | ~300 words visible text | Add detailed platform methodology text, comparison with alternatives, process detail |

---

## 5. Structured Data Issues

| Page | Issue | Impact | Fix |
|------|-------|--------|-----|
| Irving Wellness Clinic | No `streetAddress` in `FacilityStructuredData` or in-component `MedicalClinic` schema | Google may not show correct address in rich results or local pack | Add `8200 N MacArthur Blvd Suite 100, Irving, TX 75063` to schema |
| Naperville Wellness Clinic | No `streetAddress` in `FacilityStructuredData` or in-component `MedicalClinic` schema | Same as above | Add `2272 95th St STE 100, Naperville, IL 60564` to schema |
| ER of Irving | Placeholder phone `+1-972-000-0000` in EmergencyService schema | Invalid phone in structured data; potential manual action from Google | Replace with real phone number |
| ER of Lufkin | Placeholder phone `+1-936-000-0000` in EmergencyService schema | Same as above | Replace with real phone number |
| ER of White Rock | Placeholder phone `+1-214-000-0000` in EmergencyService schema | Same as above | Replace with real phone number |
| All facility pages | Potential duplicate JSON-LD: `FacilityStructuredData` component (from route-level metadata) AND in-component schema both emit `EmergencyService` / `MedicalClinic` | Duplicate schemas may confuse Google's parser | Consolidate to a single schema source per page |

---

## 6. Missing Legal / Compliance Pages

| Page | Status | Recommendation |
|------|--------|----------------|
| HIPAA Notice / Patient Rights | **Does not exist** | If any facility pages collect patient information or the site discusses healthcare services, a HIPAA notice or patient rights page is advisable for trust and compliance |
| Accessibility Statement | **Does not exist** | Recommended for healthcare websites; demonstrates compliance with ADA digital accessibility standards |
| Cookie Policy | **Does not exist** | If the site uses analytics cookies or tracking pixels, a separate cookie policy or cookie banner may be required under various privacy regulations |

---

## 7. Missing Supporting Pages (Strongly Implied)

These pages do not currently exist but are strongly implied by existing site content or navigation patterns.

| Suggested Page | Justification | Priority |
|----------------|---------------|----------|
| `/facilities` (Facilities Hub) | No single page lists all facilities. Users must go to `/track-record` or `/our-process` to discover them. A dedicated `/facilities` index would improve navigation and SEO. | Medium |
| Market detail pages (e.g., `/market/dallas-fort-worth`, `/market/houston`) | The homepage modal and market page reference DFW, Houston, Austin–San Antonio as key markets, but no dedicated pages exist for local SEO targeting | Medium |
| Individual track record case studies (`/track-record/er-of-irving`, etc.) | Empty directories already exist. Case studies with operational data, timelines, and outcomes would strengthen proof and support investor conversion | Medium |
| FAQ page (`/faq`) | Facility pages each have FAQ sections, but there is no central FAQ. A site-wide FAQ targeting common investor, community, and patient queries would capture long-tail search traffic | Low |
| About page (`/about`) | No dedicated about page exists. Company information is spread across Homepage, Platform, and Leadership. A canonical about page would help brand search queries | Low |

---

## 8. LLMs.txt Gaps

The `llms.txt` file for AI crawler consumption is missing references to:
- `/insights` and all individual blog post URLs
- `/our-process`
- All facility sub-page URLs
- `/track-record/first-choice-emergency-room`

**Recommendation:** Update `llms.txt` to include all indexed URLs and key content descriptions.

---

## 9. Blog / Insights Issues

| Issue | Detail | Impact |
|-------|--------|--------|
| All posts dated March 2026 | Six posts published within five days of each other | May appear inauthentic to users; minimal temporal diversity for search engines |
| Empty category: Regulatory Compliance | Listed as a filter option in the insights hub but contains zero posts | Poor UX; wasted filter option; missed content opportunity |
| No pagination | Only 6 posts, but no pagination system is evident for scaling | No current impact, but will become an issue as content grows |
| No author archive pages | Authors are referenced but have no individual pages | Missed opportunity for E-E-A-T signals and internal linking |

---

## Summary: Priority Actions

| Priority | Action | Pages Affected |
|----------|--------|---------------|
| **Urgent** | Add First Choice ER to sitemap | `/track-record/first-choice-emergency-room` |
| **Urgent** | Fix placeholder phone numbers in ER schemas | 3 ER facility pages |
| **Urgent** | Add street addresses to wellness clinic schemas | 2 wellness facility pages |
| **High** | Add redirects for empty `/track-record/*` directories | 5 empty routes |
| **High** | Add Investors and Our Process to footer navigation | `/investors`, `/our-process` |
| **High** | Expand thin content on Market and Contact pages | `/market`, `/contact` |
| **Medium** | Consolidate duplicate facility schemas | All 5 facility pages |
| **Medium** | Update llms.txt with complete URL inventory | `public/llms.txt` |
| **Low** | Create missing supporting pages (Facilities hub, FAQ, About) | New pages |
| **Low** | Publish Regulatory Compliance insight post | `/insights` |
