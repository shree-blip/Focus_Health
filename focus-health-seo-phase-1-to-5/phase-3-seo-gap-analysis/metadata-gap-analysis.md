# Metadata Gap Analysis — Focus Health

---

## Title Tag Audit

| Page | Current Title | Chars | Status | Recommended Title | Chars |
|------|--------------|-------|--------|-------------------|-------|
| Home | Focus Health \| Build + Fund + Operate Healthcare Infrastructure | 58 | ✅ Good | — (no change needed) | — |
| Platform | Platform | 8 | ❌ Critical | Healthcare Infrastructure Platform \| Build, Fund & Operate \| Focus Health | 72 |
| Market | Market | 6 | ❌ Critical | Texas Freestanding ER Market Opportunity \| Focus Health | 55 |
| Track Record | Track Record | 12 | ❌ Critical | Healthcare Facility Track Record \| 24+ ERs Managed \| Focus Health | 63 |
| Leadership | Leadership | 10 | ❌ Critical | Healthcare Leadership Team \| Experienced ER Operators \| Focus Health | 65 |
| Partners | Partners | 8 | ❌ Critical | Healthcare Investment Opportunities \| Partner With Focus Health | 60 |
| Investors | Investors | 9 | ❌ Critical | Invest in Healthcare Infrastructure \| $3.4M Capital Raise \| Focus Health | 70 |
| Our Process | Our Process | 11 | ❌ Critical | Healthcare Facility Development Process \| Focus Health | 53 |
| Insights | Insights | 8 | ❌ Critical | Healthcare Insights \| ER Operations, Investment & Market Analysis | 63 |
| Contact | Contact | 7 | ❌ Critical | Contact Focus Health \| Healthcare Partnership & Investment Enquiries | 66 |
| ER of Irving | ER of Irving \| 24/7 Emergency Room in Irving, TX | 47 | ✅ Good | — (no change needed) | — |
| ER of Lufkin | ER of Lufkin \| 24/7 Emergency Room in Lufkin, TX | 47 | ✅ Good | — (no change needed) | — |
| ER of White Rock | ER of White Rock \| 24/7 Emergency Room in Dallas, TX | 51 | ✅ Good | — (no change needed) | — |
| Irving Wellness | Irving Health & Wellness Clinic \| Irving, TX | 46 | ⚠️ Adequate | Irving Wellness Clinic \| Weight Loss, HRT & Aesthetics \| Irving, TX | 66 |
| Naperville Wellness | Naperville Health & Wellness Clinic \| Naperville, IL | 52 | ⚠️ Adequate | Naperville Wellness Clinic \| Weight Loss, HRT & Aesthetics \| Naperville, IL | 73 |
| First Choice ER | First Choice Emergency Room \| Houston, TX | 44 | ✅ Good | — (no change needed) | — |

**Summary:** 9 of 16 indexed pages have critically under-optimised titles. 2 are adequate but could be improved. 5 are strong.

---

## Meta Description Audit

| Page | Current Description | Chars | Status | Notes |
|------|-------------------|-------|--------|-------|
| Home | "Institutional-grade healthcare infrastructure made simple..." | 161 | ✅ Good | Strong keyword inclusion |
| Platform | "Discover Focus Health's build, fund, and operate platform..." | ~130 | ✅ Good | Adequate |
| Market | "Explore Texas's freestanding emergency room market opportunity..." | ~135 | ✅ Good | "$5B+ industry" claim not in body text |
| Track Record | "See Focus Health's operational excellence: 24+ successfully managed..." | ~155 | ✅ Good | Data-driven, strong |
| Leadership | "Meet Focus Health's experienced leadership team managing $100M+..." | ~150 | ✅ Good | Strong E-E-A-T signals |
| Partners | "Partner with Focus Health for healthcare infrastructure investment..." | ~145 | ✅ Good | Keyword-rich |
| Investors | "Discover Focus Health investor opportunities in scalable..." | ~130 | ✅ Good | Clear value proposition |
| Our Process | "Learn how Focus Health executes site selection, development..." | ~140 | ✅ Good | Process-oriented |
| Insights | "Expert analysis on healthcare infrastructure, freestanding ER..." | ~120 | ⚠️ Adequate | Could include more specifics |
| Contact | "Connect with Focus Health about partnership opportunities..." | ~120 | ⚠️ Adequate | Could mention location |

**Summary:** Meta descriptions are generally well-written. The contrast between strong descriptions and weak titles is notable — the contributor clearly understood meta description best practice but missed title tag optimisation.

---

## H1 Tag Audit

| Page | Current H1 | Issue | Recommended H1 |
|------|-----------|-------|-----------------|
| Home | "Investing in Healthcare. Delivering Excellence." | Generic, no primary keywords | "Building, Funding, and Operating Healthcare Infrastructure Across Texas" |
| Platform | "Build + Fund + Operate" | Missing context keywords | "The Build, Fund, and Operate Healthcare Infrastructure Platform" |
| Market | "Why Texas FSERs" | Informal abbreviation, too short | "Texas Freestanding Emergency Room Market Opportunity" |
| Track Record | "Proven Track Record" | Missing noun — track record of what? | "Proven Track Record: 24+ Healthcare Facilities Managed" |
| Leadership | "Empowering Healthcare Through Visionary Leadership" | Aspirational, keyword-light | "Meet the Healthcare Leadership Team Behind Focus Health" |
| Partners | "Business Opportunities" | Generic, no healthcare keywords | "Healthcare Infrastructure Investment and Partnership Opportunities" |
| Investors | "Invest in Texas Emergency Care" | ✅ Strong — keyword-aligned | — (no change needed) |
| Our Process | "Our Process" | No keywords | "How We Build and Operate Healthcare Facilities" |
| Insights | Not explicitly set / unclear | Missing | "Healthcare Insights: Operations, Investment, and Market Analysis" |
| Contact | "Contact Us" | Generic | "Contact Focus Health" |

---

## Canonical Tag Audit

| Page | Canonical | Status |
|------|-----------|--------|
| All core pages | Correctly set to own URL | ✅ |
| Blog redirects | `/blog` redirects to `/insights` | ✅ |
| Facility pages | Correctly set | ✅ |

No canonical issues found.

---

## Open Graph / Social Meta Audit

Open Graph tags were not directly visible in the route-level metadata exports. Next.js App Router generates OG tags from the metadata object if `openGraph` is specified.

**Recommendation:** Verify that all pages have:
- `og:title` (matching the optimised title tag)
- `og:description` (matching or extending the meta description)
- `og:image` (a relevant social sharing image per page)
- `og:type` (website for core pages, article for insight posts)
- `twitter:card` (summary_large_image)

---

## Indexation Audit

| Page | In Sitemap | Indexed (noIndex absent) | Status |
|------|-----------|-------------------------|--------|
| Home | ✅ | ✅ | OK |
| Platform | ✅ | ✅ | OK |
| Market | ✅ | ✅ | OK |
| Track Record | ✅ | ✅ | OK |
| Leadership | ✅ | ✅ | OK |
| Partners | ✅ | ✅ | OK |
| Investors | ✅ | ✅ | OK |
| Our Process | ✅ | ✅ | OK |
| Insights | ✅ | ✅ | OK |
| Contact | ✅ | ✅ | OK |
| ER of Irving | ✅ | ✅ | OK |
| ER of Lufkin | ✅ | ✅ | OK |
| ER of White Rock | ✅ | ✅ | OK |
| Irving Wellness | ✅ | ✅ | OK |
| Naperville Wellness | ✅ | ✅ | OK |
| First Choice ER | ❌ **Missing** | ✅ | **Gap — add to sitemap** |
| Privacy | ❌ (correct) | ❌ noIndex | OK |
| Terms | ❌ (correct) | ❌ noIndex | OK |
| Login | ❌ (correct) | ❌ noIndex | OK |
| Admin pages | ❌ (correct) | ❌ noIndex | OK |
| 6 blog posts | ✅ (dynamic) | ✅ | OK |
