# Site Inventory — Focus Health

**Domain:** https://www.getfocushealth.com  
**Company:** Focus Healthcare LLC  
**Framework:** Next.js (App Router)  
**Last Audited:** April 2026  

---

## Live Core Pages

| # | Page Name | URL | Page Type | Status | In Nav | In Sitemap | In Footer |
|---|-----------|-----|-----------|--------|--------|------------|-----------|
| 1 | Home | `/` | Commercial / Landing | Live | Yes | Yes | — |
| 2 | Platform | `/platform` | Service/Product | Live | Yes | Yes | Yes |
| 3 | Market | `/market` | Informational / Commercial | Live | Yes | Yes | Yes |
| 4 | Track Record | `/track-record` | Portfolio / Proof | Live | Yes | Yes | Yes |
| 5 | Leadership | `/leadership` | Trust / Team | Live | Yes | Yes | Yes |
| 6 | Partners | `/partners` | Conversion / Lead Gen | Live | Yes | Yes (as "For Investors" / "For Communities") | Yes |
| 7 | Insights | `/insights` | Blog Hub | Live | Yes | Yes | Yes |
| 8 | Contact | `/contact` | Conversion / Support | Live | Yes | Yes | Yes (as "Early Access") |
| 9 | Investors | `/investors` | Investor / Lead Gen | Live | **No** | Yes | **No** |
| 10 | Our Process | `/our-process` | Informational | Live | **No** | Yes | **No** |
| 11 | Privacy Policy | `/privacy` | Legal / Utility | Live | No | No (noindex) | Yes |
| 12 | Terms of Service | `/terms` | Legal / Utility | Live | No | No (noindex) | Yes |

---

## Live Facility Sub-Pages

| # | Facility Name | URL | Facility Type | Status | In Sitemap |
|---|---------------|-----|---------------|--------|------------|
| 1 | ER of Irving | `/facilities/er-of-irving` | Freestanding ER | Live | Yes |
| 2 | ER of Lufkin | `/facilities/er-of-lufkin` | Freestanding ER | Live | Yes |
| 3 | ER of White Rock | `/facilities/er-of-white-rock` | Freestanding ER | Live | Yes |
| 4 | Irving Health & Wellness Clinic | `/facilities/irving-wellness-clinic` | Wellness Clinic | Live | Yes |
| 5 | Naperville Health & Wellness Clinic | `/facilities/naperville-wellness-clinic` | Wellness Clinic | Live | Yes |
| 6 | First Choice Emergency Room | `/track-record/first-choice-emergency-room` | Freestanding ER (Pre-launch) | Live | **No** |

---

## Live Insight / Blog Posts

| # | Title | URL | Category | Date |
|---|-------|-----|----------|------|
| 1 | Why Texas Is a Prime Market for Freestanding Emergency Rooms | `/insights/texas-prime-market-for-fsers` | Market Analysis | 2026-03-15 |
| 2 | How Focus Health Builds, Funds, and Operates with One Platform | `/insights/focus-health-build-fund-operate-platform` | Clinical Operations | 2026-03-16 |
| 3 | What Investors Should Look for in Healthcare Infrastructure Operators | `/insights/investor-checklist-healthcare-infrastructure-operators` | Company News | 2026-03-17 |
| 4 | How Focus Health Evaluates New Healthcare Markets Before Expansion | `/insights/focus-health-market-evaluation-expansion-playbook` | Market Analysis | 2026-03-18 |
| 5 | Operational Readiness: What Happens in the 90 Days Before a Facility Opens | `/insights/operational-readiness-90-days-before-facility-opening` | Clinical Operations | 2026-03-19 |
| 6 | Focus Health Growth Update: Building a Stronger Pipeline for 2026 | `/insights/focus-health-growth-update-2026-pipeline` | Company News | 2026-03-20 |

---

## Investor and Partner-Facing Pages

| Page | URL | Description |
|------|-----|-------------|
| Partners (Business Opportunities) | `/partners` | Primary conversion page for investor and community partnership enquiries. Contains investment inquiry form. |
| Investors | `/investors` | Detailed investor pitch page with $3.4M raise details, market opportunity, partnership models, waitlist form. Not in main navigation. |

---

## Utility and Legal Pages

| Page | URL | Indexed |
|------|-----|---------|
| Privacy Policy | `/privacy` | No (noindex) |
| Terms of Service | `/terms` | No (noindex) |
| Login | `/login` | No (noindex) |
| 404 / Not Found | `/not-found` | No (noindex) |

---

## Admin Pages (Not Indexed)

| Page | URL |
|------|-----|
| Admin Dashboard | `/admin` |
| Admin Blog | `/admin/blog` |
| Admin Submissions | `/admin/submissions` |
| Admin Newsletter | `/admin/newsletter` |

---

## Redirect Routes

| Source | Destination | Type |
|--------|-------------|------|
| `/blog` | `/insights` | Redirect (programmatic) |
| `/blog/[slug]` | `/insights/[slug]` | Redirect (programmatic) |

---

## Missing or Empty Directories (No Rendered Pages)

| Directory | Notes |
|-----------|-------|
| `/track-record/er-of-irving/` | Empty — no page.tsx |
| `/track-record/er-of-lufkin/` | Empty — no page.tsx |
| `/track-record/er-of-white-rock/` | Empty — no page.tsx |
| `/track-record/irving-wellness-clinic/` | Empty — no page.tsx |
| `/track-record/naperville-wellness-clinic/` | Empty — no page.tsx |

These directories suggest planned pages that were never built. They do not resolve to any content.

---

## Template-Based Content Types

| Content Type | Template | Location |
|--------------|----------|----------|
| Insight / Blog Post | `BlogPostContent` via `/insights/[slug]` | Dynamic from `blog-posts.ts` + Supabase |
| Facility Page (ER) | Shared layout: PageHero → Overview → Services → Diagnostics → Community → Areas Served → FAQ → Cross-links | `/facilities/*` |
| Facility Page (Wellness) | Shared layout: PageHero → Overview → Media → Services → Additional Services → Community → Areas Served → FAQ → Cross-links | `/facilities/*-wellness-*` |

---

## Navigation Audit

### Main Navbar Links
Home, Platform, Market, Track Record, Leadership, Partners, Insights, Contact + CTA "Partner With Us" → `/partners#opportunity-form`

### Footer Links
**Company:** Platform, Market, Track Record, Leadership, Insights  
**Partners:** For Investors → `/partners#opportunity-form`, For Communities → `/partners#opportunity-form`, Early Access → `/contact`  
**Legal:** Privacy Policy, Terms of Service

### Pages Missing from Navigation
- `/investors` — no navbar or footer link
- `/our-process` — no navbar or footer link
- Individual facility pages — only reachable via Track Record, Our Process, homepage map, or cross-links

---

## External Dofollow Links

| Target | Located On |
|--------|-----------|
| `https://nafec.org` | Homepage |
| `https://tafec.org` | Homepage |
| `https://cityambulance.com` | Homepage |
| `https://erofirving.com` | `/facilities/er-of-irving` |
| `https://eroflufkin.com` | `/facilities/er-of-lufkin` |
| `https://erofwhiterock.com` | `/facilities/er-of-white-rock` |
| `https://irvingwellnessclinic.com` | `/facilities/irving-wellness-clinic` |
| `https://napervillehealthandwellness.com` | `/facilities/naperville-wellness-clinic` |
| `https://thenextgenhealth.com/` | Footer (all pages) |

---

## Structured Data Summary

| Page | Schema Types |
|------|-------------|
| All pages | Organization, WebSite, WebPage |
| ER facility pages | EmergencyService + FAQPage |
| Wellness facility pages | MedicalClinic + FAQPage |
| `/track-record` | CollectionPage + ItemList |
| `/insights/[slug]` | Article |
| `/our-process` | WebPage + inline MedicalClinic per facility card |

---

## Total Page Count

| Category | Count |
|----------|-------|
| Core pages | 12 |
| Facility sub-pages | 6 |
| Insight posts | 6 |
| Utility/legal pages | 4 |
| Admin pages | 4 |
| Redirect routes | 2 |
| **Total live rendered pages** | **28** |
| **Total indexed pages** | **24** |
