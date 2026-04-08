# SEO Blueprint: Insight Content (Article Template)

**Applies to:** All individual insight posts at `/insights/[slug]`

---

## Content Standards

| Attribute | Requirement |
|-----------|-------------|
| Minimum word count | 1,200 words |
| Target word count | 1,500–2,000 words |
| H2 heading count | 4–6 |
| H3 heading count | 2–4 (nested under H2s) |
| Internal links | 3–5 per article |
| External links | 1–2 authoritative sources |
| Images | 1 featured image + 1–2 in-body images |
| Meta description | 120–155 characters, includes primary keyword |
| Title tag | 50–65 characters, includes primary keyword |

---

## Article Structure Template

1. **Title Tag** — Primary keyword + benefit or angle
2. **Meta Description** — Action-oriented summary with keyword
3. **H1** — Matches or closely mirrors the title tag
4. **Opening Paragraph** — Hook + thesis (50–75 words), includes primary keyword naturally
5. **H2: Context / Background** — Market or industry context (150–250 words)
6. **H2: Core Analysis** — Main content body with data, examples, or frameworks (300–500 words)
7. **H2: Practical Application** — Actionable takeaways or how-to guidance (200–300 words)
8. **H2: Focus Health Perspective** — Company-specific viewpoint or case study tie-in (150–200 words)
9. **H2: Key Takeaways** — Bulleted summary of 4–6 main points
10. **CTA Block** — "Ready to learn more?" with link to `/partners` or `/contact`

---

## Keyword Integration Rules

- Primary keyword appears in: title tag, H1, first 100 words, one H2, meta description
- Secondary keywords appear naturally in body content (2–3 times each)
- Long-tail keywords appear in H2 or H3 headings where appropriate
- No keyword stuffing — maintain natural, readable prose

---

## Internal Linking Strategy

Every article must link to:

| Link To | Placement |
|---------|-----------|
| `/insights` | Breadcrumb or "Back to Insights" |
| 1–2 related insight articles | In-body contextual links |
| 1 core page (`/platform`, `/market`, `/track-record`, or `/partners`) | In-body or CTA block |
| `/partners` or `/contact` | CTA block at article end |

---

## Schema Requirements

```json
{
  "@type": "Article",
  "headline": "[Article Title]",
  "description": "[Meta description]",
  "author": {
    "@type": "Organization",
    "name": "Focus Healthcare LLC"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Focus Healthcare LLC",
    "logo": { "@type": "ImageObject", "url": "https://www.getfocushealth.com/logo.png" }
  },
  "datePublished": "[ISO 8601 date]",
  "dateModified": "[ISO 8601 date]",
  "mainEntityOfPage": "https://www.getfocushealth.com/insights/[slug]",
  "image": "[Featured image URL]"
}
```

---

## Existing Article Improvements

| Article | Current Word Count | Issue | Fix |
|---------|-------------------|-------|-----|
| Texas: Prime Market for FSERs | ~950 | Below 1,200 minimum | Expand market data section |
| Build-Fund-Operate Platform | ~1,100 | Slightly below minimum | Add practical application section |
| Investor Checklist | ~1,000 | Below 1,200 minimum | Expand due diligence detail |
| Market Evaluation Playbook | ~1,200 | Meets minimum | Add Focus Health case study |
| Operational Readiness 90 Days | ~1,100 | Slightly below minimum | Add checklist or timeline graphic description |
| Growth Update 2026 Pipeline | ~900 | Below 1,200 minimum | Expand pipeline detail and market context |

---

## Date Fix

All six existing articles display a publication date of **March 2026**. These dates must be corrected to the actual publication or last-modified dates to avoid confusing users and search engines.

---

## Notes

- Every article should end with a clear CTA — currently none of the six articles have a closing CTA
- Author attribution should link to `/leadership` for individual authors or cite "Focus Health Editorial Team"
- Articles should be cross-linked to form topic clusters (see `content-cluster-blueprint.md`)
- Featured images should have descriptive alt text including the primary keyword
- URLs are clean and keyword-rich — no changes needed to existing slugs
