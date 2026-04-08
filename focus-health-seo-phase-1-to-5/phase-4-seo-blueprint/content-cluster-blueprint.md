# SEO Blueprint: Content Cluster Architecture

---

## Overview

Content clusters organise the site's pages and articles into topical groups. Each cluster has a **pillar page** (core page) that links to and from multiple **spoke pages** (insight articles, facility pages, or sub-pages). This architecture signals topical authority to search engines and distributes link equity efficiently.

---

## Cluster 1: Healthcare Infrastructure Platform

| Role | Page | URL |
|------|------|-----|
| Pillar | Platform | `/platform` |
| Spoke | Build-Fund-Operate Platform article | `/insights/focus-health-build-fund-operate-platform` |
| Spoke | Operational Readiness 90 Days article | `/insights/operational-readiness-90-days-before-facility-opening` |
| Spoke | Our Process | `/our-process` |

**Linking rules:**
- `/platform` links to all three spokes in body content
- Each spoke links back to `/platform` in its first or second paragraph
- Spokes link to each other where contextually relevant

---

## Cluster 2: Market Intelligence

| Role | Page | URL |
|------|------|-----|
| Pillar | Market | `/market` |
| Spoke | Texas Prime Market article | `/insights/texas-prime-market-for-fsers` |
| Spoke | Market Evaluation Playbook article | `/insights/focus-health-market-evaluation-expansion-playbook` |
| Spoke | Growth Update 2026 article | `/insights/focus-health-growth-update-2026-pipeline` |
| Spoke | ER of Irving (as local case study) | `/facilities/er-of-irving` |
| Spoke | ER of Lufkin (as local case study) | `/facilities/er-of-lufkin` |

**Linking rules:**
- `/market` links to all spokes
- Each spoke links back to `/market`
- Facility pages link to the market article for their region

---

## Cluster 3: Investment & Partnership

| Role | Page | URL |
|------|------|-----|
| Pillar | Partners | `/partners` |
| Spoke | Investors | `/investors` |
| Spoke | Investor Checklist article | `/insights/investor-checklist-healthcare-infrastructure-operators` |
| Spoke | Track Record | `/track-record` |

**Linking rules:**
- `/partners` links to `/investors`, `/track-record`, and the investor checklist article
- `/investors` links back to `/partners` (CTA) and to `/track-record`
- The investor checklist article links to both `/investors` and `/partners`
- `/track-record` links to `/partners` and `/investors`

---

## Cluster 4: Facility Operations

| Role | Page | URL |
|------|------|-----|
| Pillar | Track Record | `/track-record` |
| Spoke | ER of Irving | `/facilities/er-of-irving` |
| Spoke | ER of Lufkin | `/facilities/er-of-lufkin` |
| Spoke | ER of White Rock | `/facilities/er-of-white-rock` |
| Spoke | Irving Wellness Clinic | `/facilities/irving-wellness-clinic` |
| Spoke | Naperville Wellness Clinic | `/facilities/naperville-wellness-clinic` |
| Spoke | First Choice ER Houston | `/track-record/first-choice-emergency-room` |

**Linking rules:**
- `/track-record` links to every facility page
- Every facility page links back to `/track-record`
- Facility pages cross-link to "Related Facilities" (see facility blueprint)

---

## Cluster 5: Company & Leadership

| Role | Page | URL |
|------|------|-----|
| Pillar | Leadership | `/leadership` |
| Spoke | About / Homepage company section | `/` (hero or about section) |
| Spoke | Contact | `/contact` |

**Linking rules:**
- `/leadership` links to `/contact` and the homepage
- Homepage links to `/leadership` in the team section
- `/contact` links to `/leadership`

---

## New Content Opportunities (Proposed Spokes)

### For Cluster 2 — Market Intelligence
- "DFW Healthcare Market Analysis" (new article)
- "Houston Freestanding ER Landscape" (new article)
- "Austin–San Antonio Healthcare Corridor" (new article)

### For Cluster 3 — Investment & Partnership
- "Healthcare Infrastructure vs Traditional Real Estate Returns" (new article)
- "Due Diligence Checklist for ER Investors" (new article)
- "Understanding ER Revenue Models" (new article)

### For Cluster 1 — Platform
- "From Site Selection to Grand Opening: A Focus Health Case Study" (new article)
- "Technology Stack Behind Modern Emergency Rooms" (new article)

---

## Cross-Cluster Links

These links connect clusters to each other, ensuring no cluster is isolated:

| From | To | Context |
|------|----|---------|
| `/platform` → `/partners` | "Partner with us to build" |
| `/market` → `/partners` | "Invest in these markets" |
| `/track-record` → `/platform` | "Built on our platform" |
| `/leadership` → `/platform` | "The team behind the platform" |
| `/partners` → `/track-record` | "See what we've built" |
| `/investors` → `/market` | "View our market analysis" |
| Homepage → `/insights` | "Read our latest insights" |

---

## Implementation Checklist

- [ ] Audit every pillar page to confirm it links to all its spokes
- [ ] Audit every spoke to confirm it links back to its pillar
- [ ] Add cross-cluster links where missing
- [ ] Create "Related Articles" component for insight posts
- [ ] Create "Related Facilities" component for facility pages
- [ ] Add breadcrumbs to all sub-pages indicating cluster hierarchy
- [ ] Verify internal link anchor text contains relevant keywords (not "click here" or "learn more")
