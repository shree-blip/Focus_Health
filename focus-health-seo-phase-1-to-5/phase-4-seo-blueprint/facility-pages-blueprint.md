# SEO Blueprint: Facility Pages (Collective)

**Applies to:** `/facilities/er-of-irving`, `/facilities/er-of-lufkin`, `/facilities/er-of-white-rock`, `/facilities/irving-wellness-clinic`, `/facilities/naperville-wellness-clinic`  
**Pre-launch:** `/track-record/first-choice-emergency-room`

---

## Keywords (per facility)

| Facility | Primary Keyword | Secondary Keywords |
|----------|----------------|--------------------|
| ER of Irving | 24 hour emergency room Irving TX | freestanding ER Irving, emergency care Irving Texas |
| ER of Lufkin | emergency room Lufkin TX | 24 hour ER Lufkin, freestanding ER Lufkin Texas |
| ER of White Rock | emergency room White Rock Dallas TX | freestanding ER White Rock, 24 hour ER Dallas |
| Irving Wellness Clinic | wellness clinic Irving TX | primary care Irving Texas, walk-in clinic Irving |
| Naperville Wellness Clinic | wellness clinic Naperville IL | primary care Naperville Illinois, walk-in clinic Naperville |
| First Choice ER Houston | freestanding ER Houston TX | 24 hour emergency room Houston, emergency care Houston |

---

## Search Intent

Local + Transactional — patients searching for nearby emergency or primary care.

---

## Page Purpose

Local landing page. Provide facility-specific details, build trust, and drive visits / calls.

---

## Recommended Title Tag Pattern

"[Facility Name] | [Service Type] in [City, State] | Focus Health"

Examples:
- "ER of Irving | 24-Hour Emergency Room in Irving, TX | Focus Health" (65 chars)
- "ER of Lufkin | 24-Hour Emergency Room in Lufkin, TX | Focus Health" (65 chars)
- "Irving Wellness Clinic | Primary & Urgent Care in Irving, TX | Focus Health" (75 chars)

---

## Recommended Meta Description Pattern

"[Facility Name] provides [services] in [City, State]. Open 24/7. Walk-ins welcome. Operated by Focus Health."

---

## Recommended Content Sections (per facility)

1. **Hero** — H1 (facility name), tagline, "Get Directions" CTA
2. **Services** — List of services offered (ER: emergency care, imaging, labs; Wellness: primary care, urgent care, preventive)
3. **Location and Hours** — Full NAP (Name, Address, Phone), hours of operation, Google Maps embed
4. **Insurance Accepted** (new) — List of accepted insurance plans or statement
5. **What to Expect** (new) — Brief patient journey description (50–100 words)
6. **About the Facility** — Building specs, equipment, staff credentials
7. **Related Facilities** (new) — Links to other Focus Health facilities
8. **Gallery** — Photos (existing on some pages)
9. **Google Maps Direction Link** — Existing, retain

---

## Internal Linking Opportunities (per facility)

| Link To | Context |
|---------|---------|
| Other facility pages | "Related facilities" section |
| `/track-record` | "View our full portfolio" |
| `/platform` | "How we build and operate" |
| `/contact` | "General enquiries" |
| `/insights` | Relevant insight articles |

---

## Schema Requirements

### ER Facilities

```json
{
  "@type": "EmergencyService",
  "name": "[Facility Name]",
  "description": "[Service description]",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "[Full address]",
    "addressLocality": "[City]",
    "addressRegion": "[State]",
    "postalCode": "[ZIP]"
  },
  "telephone": "[Real phone number]",
  "openingHours": "Mo-Su 00:00-23:59",
  "geo": { "@type": "GeoCoordinates", "latitude": "...", "longitude": "..." },
  "url": "https://www.getfocushealth.com/facilities/[slug]",
  "parentOrganization": { "@type": "Organization", "name": "Focus Healthcare LLC" }
}
```

### Wellness Clinics

```json
{
  "@type": "MedicalClinic",
  "name": "[Clinic Name]",
  "medicalSpecialty": ["PrimaryCare", "UrgentCare"],
  "address": { ... },
  "telephone": "[Real phone number]",
  "openingHours": "[Actual hours]",
  "url": "https://www.getfocushealth.com/facilities/[slug]"
}
```

---

## Critical Fixes Required

| Issue | Affected Facilities | Fix |
|-------|-------------------|-----|
| Placeholder phone numbers in schema | ER Irving, ER Lufkin, ER White Rock | Replace with real phone numbers |
| Missing `streetAddress` in schema | Irving Wellness, Naperville Wellness | Add verified street addresses |
| Missing from sitemap | First Choice ER Houston | Add to `sitemap.ts` |
| Thin content | ER White Rock (~200 words) | Expand to 400+ words |

---

## Notes

- Every facility page must have a unique, facility-specific H1 — no generic headings
- NAP data must be 100% consistent with Google Business Profile listings
- "Insurance Accepted" and "What to Expect" sections are new additions that add unique content and target common patient queries
- "Related Facilities" section creates a cross-linking network among all facility pages
- Pre-launch page (First Choice ER Houston) should carry a "Coming Soon" badge and schema with `potentialAction` of type `ReserveAction` or similar to indicate upcoming availability
