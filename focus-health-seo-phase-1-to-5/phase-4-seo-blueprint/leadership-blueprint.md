# SEO Blueprint: Leadership

**URL:** `/leadership`  

---

## Keywords

| Role | Keyword |
|------|---------|
| Primary | healthcare leadership team |
| Secondary | freestanding ER management team, healthcare operations leadership |
| Long-tail | experienced healthcare facility operators Texas, healthcare infrastructure leadership team |

---

## Search Intent

Trust-building (E-E-A-T) — investors and partners evaluating team credentials. Brand-aware users searching for specific leaders.

---

## Page Purpose

Establish credibility through detailed team credentials. Support E-E-A-T signals for all site content. Convert trust into partnership/investment action.

---

## Recommended H1

"Meet the Healthcare Leadership Team Behind Focus Health"

---

## Recommended Title Tag

"Healthcare Leadership Team | Experienced ER Operators | Focus Health"  
(65 characters)

---

## Recommended Meta Description

"Meet Focus Health's leadership team: experienced operators managing 24+ healthcare facilities and $100M+ in revenue. Deep expertise in freestanding ERs across Texas."  
(163 characters — trim to 160)

---

## Recommended URL Slug

`/leadership` (no change)

---

## Recommended Content Sections

1. **Hero** — H1 with team overview subtitle
2. **Featured Leaders** — Full bios with photos and LinkedIn links (existing, retain)
3. **Achievement Highlights** (new) — Key milestones per leader (e.g., "Led launch of 5 freestanding ERs")
4. **Operations & Leadership Team** — Team grid (existing, retain)
5. **Accounting Team** — Named list (existing, retain)
6. **CTA Section** — Contact team, view portfolio

---

## Internal Linking Opportunities

| Link To | Context |
|---------|---------|
| `/track-record` | "View our managed portfolio" |
| `/partners` | "Partner with our team" |
| `/investors` | "Explore investment opportunities" (add) |
| `/insights` | "Read insights from our team" (add) |
| `/contact` | "Contact our team" |

---

## Schema

- WebPage (existing)
- **Person schema** (add) — for each featured leader:
  ```json
  {
    "@type": "Person",
    "name": "Jay Dahal",
    "jobTitle": "Founder & CEO",
    "worksFor": { "@type": "Organization", "name": "Focus Health" },
    "sameAs": ["https://linkedin.com/in/[profile]"]
  }
  ```

---

## Notes

- Adding Person schema for each featured leader is the highest-impact change for E-E-A-T
- Ensure all headshot images have descriptive alt text: "[Name], [Title] at Focus Health"
- Consider adding advisor or board member section if applicable
- Link individual leaders to the facilities they have overseen where relevant
