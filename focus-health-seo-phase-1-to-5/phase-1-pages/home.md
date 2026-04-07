# Page Audit: Home

**URL:** https://www.getfocushealth.com/  
**Page Type:** Commercial Landing Page  
**Status:** Live  
**Priority Level:** Critical  

---

## Current H1

"Investing in Healthcare. Delivering Excellence."

---

## Summary of Current Content

The homepage is a long-scroll landing page comprising 13 distinct sections:

1. **Hero Section** — Video background (Lufkin grand opening footage), animated Build/Fund/Operate orbital graphic, badge "Now Accepting Strategic Partners", live stats ticker (24+ Facilities Managed, 24/7 Operations Model, Texas Growth Markets), trust strip cards (Turnkey Solution, 24/7 Operations, Texas Markets).
2. **Grand Opening Videos** — Three full-screen video cards for Irving Wellness Clinic, ER of Irving, and ER of Lufkin with responsive desktop/mobile variants.
3. **Three Pillars Section** — Modern Facilities, Community Focus, High Performance. Brief descriptive text, no CTAs.
4. **Turnkey Model Section** — Five-step operational model (Market & Site Selection → Facility Build & Compliance → Clinical + Ops Staffing → Launch & 24/7 Operations → Performance Optimisation). Includes quote block.
5. **Operator DNA Section** — Dark section with stats (24+, 24/7, 3+, 10+) and legal disclaimer.
6. **Facilities Map Section** — Interactive Leaflet map with six facility markers, sidebar with addresses, location highlight badges (Strategic Coverage, Mixed Facility Model, Expansion Ready). Links to each facility detail page and Google Maps.
7. **Market Section** — Line chart showing 2022–2026 demand growth. Points: Population Growth, Convenient Access, Operational Efficiency. CTAs: "View Texas Markets" (modal), "Download Overview (Coming Soon)".
8. **Investment Section** — $3.4M Growth Capital Raise with investment highlights (10 investor spots, 15–20% target ROI). Core strengths. CTA: "Request Investor Deck" → Partners page.
9. **Split CTA Section** — For Investors / For Communities, both linking to Partners page.
10. **Membership Logos** — NAFEC (dofollow), TAFEC (dofollow).
11. **City Ambulance Partner** — Logo with dofollow link.
12. **Early Access Section** — Form (name, email, role) with waitlist CTA.
13. **Business Opportunity Modal** — Auto-opens on first visit after idle delay. Shows four Texas metro growth stats. CTA: "Partner With Us".

---

## Current Primary Topic

Healthcare infrastructure investment and operations — positioned as a turnkey platform for building, funding, and operating freestanding ERs and healthcare facilities in Texas.

---

## Current CTA

Multiple CTAs across sections:
- "Get Early Access" (hero)
- "Partner With Us" (modal, split CTA)
- "Request Investor Deck" (investment section)
- "View Texas Markets" (market section)
- "Join Waiting List" (early access form)

Primary conversion paths lead to `/partners#opportunity-form` and `/contact`.

---

## Internal Linking Observations

**Strong points:**
- Links to all five facility detail pages via interactive map
- Links to First Choice ER Houston via map
- Multiple links to `/partners#opportunity-form`
- Links to `/contact`

**Weaknesses:**
- No link to `/insights` from homepage body content
- No link to `/our-process` from homepage body content
- No link to `/leadership` from homepage body content
- No link to `/investors` directly (investment section links to partners instead)
- Map section is the only pathway to individual facility pages from the homepage

---

## UX Observations

- Auto-opening modal on first visit may increase bounce rate; consider a less intrusive trigger
- The page is extremely long (13+ sections); mobile users may not scroll to bottom sections
- "Download Overview (Coming Soon)" CTA is non-functional — sets negative conversion expectation
- Grand opening videos auto-play; may consume bandwidth on mobile
- Facility map requires JavaScript (Leaflet); non-JS users see nothing

---

## Content Observations

- Content is substantial and conversion-focused
- Strong proof elements (stats, facilities, map, membership logos)
- Investment section is prominent — matches investor-intent positioning
- Turnkey model explanation is clear and well-structured
- Missing: customer/partner testimonials on the homepage itself
- Missing: explicit mention of micro-hospitals (a stated positioning topic)
- Disclaimer text is present but may alarm casual visitors

---

## SEO Observations

- **Title tag:** "Focus Health | Build + Fund + Operate Healthcare Infrastructure" — good, includes primary keywords
- **Meta description:** Mentions "institutional-grade healthcare infrastructure", "freestanding ERs", "proven healthcare platform" — strong keyword targeting
- **H1 mismatch:** H1 "Investing in Healthcare. Delivering Excellence." is generic and brand-focused; does not contain primary keywords like "healthcare infrastructure" or "freestanding emergency rooms"
- **Structured data:** Organization + WebSite + WebPage schemas present
- **Canonical:** Set to `/`
- **Priority in sitemap:** 1 (correct)
- Heavy reliance on video and interactive elements — limited crawlable text in hero section
- Stats are rendered as animated counters — search engines may not reliably parse them

---

## Metadata Observations

- Title tag is well-optimised (58 characters)
- Meta description is well-written (161 characters)
- Open Graph and Twitter card metadata would need verification
- Canonical URL is correctly set
- No hreflang (appropriate — single-language site)

---

## What Is Missing

1. Keyword-aligned H1 (current H1 is too generic)
2. Explicit mention of micro-hospitals in body content
3. Link to `/insights` from homepage body
4. Link to `/leadership` from homepage body
5. Link to `/investors` directly
6. Customer/partner testimonial section
7. Working "Download Overview" CTA (or removal of non-functional element)
8. Text-based content in hero section for crawlability
9. Breadcrumbs (homepage typically does not need them, but child pages should reference home)

---

## What Should Be Improved

1. **H1 alignment:** Change to something keyword-rich, e.g., "Building, Funding, and Operating Healthcare Infrastructure Across Texas"
2. **Hero crawlable text:** Add a visible subtitle or paragraph below the H1 that contains primary keywords
3. **Internal link depth:** Add contextual links to Insights, Leadership, and Our Process within body sections
4. **Modal trigger:** Consider delaying the auto-open further or converting to a non-modal banner
5. **Disabled CTA:** Either link the "Download Overview" to a real PDF or remove it
6. **Testimonials:** Add a brief partner/investor testimonial section before the Early Access form
7. **Content hierarchy:** Consider whether 13 sections is optimal or whether consolidation could improve user focus
8. **Video optimisation:** Ensure video files have proper lazy loading and fallback images for performance
