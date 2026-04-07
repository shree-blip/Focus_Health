# Sitewide SEO Blueprint — Focus Health

---

## SEO Architecture Overview

### Domain Positioning
Focus Health should position for the intersection of **healthcare infrastructure**, **freestanding emergency rooms**, **micro-hospitals**, and **healthcare investment** in Texas. The site serves three primary audiences:

1. **Investors** — seeking healthcare real estate and infrastructure investment opportunities
2. **Community Partners** — cities, landowners, and organisations seeking healthcare development
3. **Operators** — physicians and healthcare professionals seeking partnership or franchise models

### Site Hierarchy (Target State)

```
Home (Brand + Authority Hub)
├── Platform (What — the model)
├── Market (Where — the opportunity)
│   ├── DFW Healthcare Market (proposed)
│   ├── Houston Healthcare Market (proposed)
│   └── Austin–San Antonio Healthcare Market (proposed)
├── Track Record (Proof — the portfolio)
│   └── First Choice ER Houston
├── Facilities (proposed hub)
│   ├── ER of Irving
│   ├── ER of Lufkin
│   ├── ER of White Rock
│   ├── Irving Wellness Clinic
│   └── Naperville Wellness Clinic
├── Our Process (How — step-by-step methodology)
├── Leadership (Who — E-E-A-T)
├── Partners (Conversion — all partner types)
├── Investors (Conversion — investor-specific)
├── Insights (Content hub)
│   ├── Pillar articles
│   ├── Supporting articles
│   └── Category pages (proposed)
├── Contact (Enquiry)
├── Privacy Policy
└── Terms of Service
```

### Keyword Architecture Rules

1. **One primary keyword per page** — no two pages should target the same primary keyword
2. **Supporting keywords should reinforce, not duplicate** — secondary keywords on child pages should not overlap with parent page primaries
3. **Local keywords belong on facility pages** — core pages should not compete with facility pages for local terms
4. **Investment keywords split by intent** — education goes to insight articles, conversion goes to Partners/Investors

### Technical SEO Standards

- All title tags: 50–70 characters, format: "[Primary Keyword] | [Brand or Supporting Info]"
- All meta descriptions: 140–160 characters, including a CTA or value proposition
- All H1 tags: one per page, keyword-aligned, unique across the site
- Canonical tags: self-referencing on all indexed pages
- Structured data: appropriate schema type per page template
- Internal links: minimum 3 contextual body-content links per page
- Image alt text: descriptive, keyword-relevant where natural
- Page speed: ensure all video/image assets are lazy-loaded

---

## Schema Strategy

| Page Type | Schema Types |
|-----------|-------------|
| Home | Organization, WebSite, WebPage |
| Core pages (Platform, Market, Track Record, etc.) | WebPage + page-specific (Service, CollectionPage, etc.) |
| Facility pages (ER) | EmergencyService, FAQPage |
| Facility pages (Wellness) | MedicalClinic, FAQPage |
| Leadership | WebPage + Person (per leader) |
| Insight posts | Article, BreadcrumbList |
| Insights hub | Blog or CollectionPage |
| Contact | ContactPage or LocalBusiness |
| Partners | WebPage + FAQ (proposed) |
| Investors | WebPage + FAQ (proposed) |

---

## Content Standards

### Minimum Content Requirements

| Page Type | Minimum Word Count | Minimum Internal Links | Required Elements |
|-----------|-------------------|----------------------|-------------------|
| Core page | 600 words | 5 | H1, H2 sections, CTA, schema |
| Facility page | 800 words | 8 | H1, services, areas served, FAQ, schema |
| Insight article | 1,200 words | 5 | H1, H2 sections, author, CTA, related posts |
| Pillar article | 2,500 words | 10 | H1, H2/H3 structure, table of contents, FAQ section, CTA |
| Landing page | 400 words | 3 | H1, value proposition, form, trust signals |

### Trust Signal Requirements

Every conversion page (Partners, Investors, Contact) must include:
- At least one testimonial or partner quote
- Membership credentials (NAFEC, TAFEC)
- Stats (facilities managed, years of experience)
- Privacy/data handling statement near forms

---

## Internal Linking Policy

### Every page must link to:
- At least 2 other core pages (contextual body links)
- The most relevant insight article
- A conversion page (Partners or Investors)

### Content hub (`/insights`) must link to:
- Each pillar page that corresponds to the hub's categories
- Featured/recent articles
- Newsletter signup or contact CTA

### Facility pages must link to:
- Track Record (portfolio hub)
- At least 2 other facility pages (cross-linking)
- At least 1 relevant insight article
- A conversion page (Partners or Investors)

---

## Navigation Policy (Recommended)

### Main Navbar
Home | Platform | Market | Track Record | Leadership | Partners | Insights | Contact

### Footer Columns

**Company:** Platform, Market, Track Record, Our Process, Leadership  
**Opportunities:** For Investors → `/investors`, For Partners → `/partners`, Facilities → `/track-record`  
**Resources:** Insights, Contact, FAQ (proposed)  
**Legal:** Privacy Policy, Terms of Service
