# Sitewide SEO Gap Analysis — Focus Health

**Domain:** https://www.getfocushealth.com  
**Analysis Date:** April 2026  

---

## 1. Sitewide Strengths

| Strength | Detail |
|----------|--------|
| Structured data coverage | Organisation, WebSite, WebPage, EmergencyService, MedicalClinic, FAQPage, Article, CollectionPage, ItemList schemas all present |
| Facility page depth | ER pages have comprehensive local SEO content: services, areas served, FAQ, cross-links |
| Robots.txt configuration | Proper allow/disallow rules, AI bot permissions, Bytespider blocked |
| Blog redirect handling | `/blog` → `/insights` redirect is correctly implemented |
| Canonical tags | Present on all indexed pages |
| Dofollow external links | Strategic outbound links to NAFEC, TAFEC, City Ambulance, and facility external domains |
| Content-rich homepage | 13 sections with substantial text, data visualisation, interactive map |
| Investor content depth | `/investors` page is 789 lines with comprehensive pitch content |

---

## 2. Critical Sitewide Weaknesses

### 2.1 Title Tag Crisis

**8 of 12 core pages have critically under-optimised title tags.**

| Page | Current Title | Characters | Issue |
|------|--------------|------------|-------|
| Platform | "Platform" | 8 | No keywords, no brand |
| Market | "Market" | 6 | No keywords, no brand |
| Track Record | "Track Record" | 12 | No keywords, no brand |
| Leadership | "Leadership" | 10 | No keywords, no brand |
| Partners | "Partners" | 8 | No keywords, no brand |
| Investors | "Investors" | 9 | No keywords, no brand |
| Our Process | "Our Process" | 11 | No keywords, no brand |
| Insights | "Insights" | 8 | No keywords, no brand |
| Contact | "Contact" | 7 | No keywords, no brand |

Only the **Homepage** and **facility pages** have properly optimised title tags. This is the single most impactful SEO gap on the site.

### 2.2 Navigation Orphaning

| Issue | Pages Affected |
|-------|---------------|
| Not in main navbar | `/investors`, `/our-process` |
| Not in footer | `/investors`, `/our-process`, all facility pages |
| Result | Reduced internal link equity, weaker crawl priority, lower perceived importance |

### 2.3 Structured Data Errors

| Issue | Pages Affected | Severity |
|-------|---------------|----------|
| Placeholder phone numbers (000-0000) | ER of Irving, ER of Lufkin, ER of White Rock | **Critical** — may trigger Google manual review |
| Missing street address in schema | Irving Wellness, Naperville Wellness | **High** — prevents rich results |
| Duplicate EmergencyService/MedicalClinic schemas | All 5 facility pages | **Medium** — confusing signals |

### 2.4 Thin Content Pages

| Page | Estimated Word Count | Minimum Recommended |
|------|---------------------|---------------------|
| Market | 150–200 | 800–1,200 |
| Contact | 60–80 | 300–500 |
| Platform | 200–300 | 600–1,000 |

### 2.5 Sitemap Omission

`/track-record/first-choice-emergency-room` is a fully built page not included in the XML sitemap.

---

## 3. Structural SEO Gaps

### 3.1 Missing Page Types

| Missing Page | Business Value | SEO Value |
|--------------|---------------|-----------|
| `/facilities` hub page | High — aggregates all facilities | High — creates internal linking hub |
| `/about` page | Medium — brand search capture | Medium — E-E-A-T signal |
| `/faq` central page | Medium — addresses common queries | High — targets long-tail queries, FAQ schema |
| Market detail pages (DFW, Houston, etc.) | Medium — local market targeting | High — local SEO for each metro |
| Track record case studies | High — investor proof | Medium — supporting content |

### 3.2 Content Architecture Gaps

| Gap | Impact |
|-----|--------|
| No content cluster architecture | Insight articles are not linked to pillar pages in a hub-and-spoke model |
| No author pages | Missed E-E-A-T signals; no author authority building |
| No category landing pages | Category filters on `/insights` are client-side only, not crawlable URLs |
| Platform vs Our Process content overlap | Cannibalisation risk — both pages target similar "how we work" queries |

### 3.3 Empty Directories Creating Crawl Waste

Five empty directories under `/track-record/` may generate 404 responses or soft 404s if discovered by crawlers, wasting crawl budget.

---

## 4. Content Depth Gaps

| Page | Content Gap | Recommended Addition |
|------|-------------|---------------------|
| Homepage | No explicit micro-hospital mention | Add micro-hospital reference in pillars or turnkey section |
| Platform | No methodology detail | Add 800+ words explaining Build, Fund, Operate phases |
| Market | No data tables or statistics | Add market data, FSER count, growth projections |
| Track Record | No outcome metrics | Add patient volumes, revenue data, operational outcomes |
| Partners | No testimonials | Add partner/investor quotes near the form |
| Contact | No contextual content | Add intro paragraph, FAQ, physical address |
| Insights Hub | No intro paragraph | Add keyword-rich hub introduction |

---

## 5. Trust Signal Gaps

| Gap | Where | Impact |
|-----|-------|--------|
| No patient/partner testimonials on core pages | Platform, Market, Partners | Reduced conversion and E-E-A-T |
| No certification/compliance badges | Sitewide | Missed trust opportunity |
| No HIPAA notice | Legal pages | Compliance concern for healthcare site |
| No accessibility statement | Sitewide | ADA compliance gap |
| Placeholder phone numbers in schema | ER facility pages | Active trust damage if discovered |

---

## 6. Cannibalisation Risks

| Risk | Pages | Issue |
|------|-------|-------|
| Platform vs Our Process | `/platform` + `/our-process` | Both describe the turnkey model; overlapping keywords |
| Partners vs Investors | `/partners` + `/investors` | Both target healthcare investment queries; unclear differentiation |
| Homepage Investment Section vs Investors | `/` + `/investors` | Homepage investment section duplicates investor page content |
| Track Record Process vs Our Process | `/track-record` + `/our-process` | Track record includes process diagram that duplicates Our Process content |

**Recommendation:** Clearly differentiate each page's keyword target and search intent. Platform = what the model is. Our Process = step-by-step how it works. Partners = conversion for all partner types. Investors = detailed investor pitch and education.

---

## 7. Opportunity Summary

| Opportunity | Estimated Impact | Effort |
|-------------|-----------------|--------|
| Fix all title tags | **Very High** — immediate SERP improvement | Low |
| Fix schema errors (phones, addresses) | **High** — rich results eligibility | Low |
| Add First Choice ER to sitemap | **Medium** — indexation | Very Low |
| Expand thin content (Market, Contact, Platform) | **High** — ranking and conversion | Medium |
| Add Investors/Our Process to navigation | **Medium** — link equity and UX | Low |
| Create facilities hub page | **Medium** — internal linking architecture | Medium |
| Publish 5 new keyword-targeted insight articles | **High** — traffic and topical authority | High |
| Add FAQ sections to core pages | **Medium** — long-tail capture, FAQ schema | Medium |
| Create content cluster architecture | **High** — topical authority | High |
| Add Person schema to leadership page | **Medium** — E-E-A-T signals | Low |
